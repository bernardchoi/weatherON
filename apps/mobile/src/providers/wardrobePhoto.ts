import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as Crypto from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import type { Purpose, Season, WardrobeCategory, WeatherTag } from "@weatheron/shared";
import WeatheronWidgetDataModule from "../../modules/weatheron-widget-data/src/WeatheronWidgetDataModule";
import { AccountAuthError, requestAuthenticatedAccountJson } from "./accountAuth";

export const WARDROBE_PHOTO_POLICY_VERSION = "wardrobe-photo-ios-1";

export type WardrobePhotoSource = "camera" | "library";

export type PreparedWardrobePhoto = {
  readonly previewUri: string;
  readonly imageBase64: string;
  readonly mimeType: "image/jpeg";
  readonly width: number;
  readonly height: number;
};

export type WardrobePhotoAnalysis = {
  decision: "accept";
  policyVersion: typeof WARDROBE_PHOTO_POLICY_VERSION;
  photoDigest: string;
  eligibilityConfidence: number;
  name: string;
  category: WardrobeCategory;
  seasons: Season[];
  purposes: Purpose[];
  weatherTags: WeatherTag[];
  confidence: number;
  quality: "good" | "review" | "retake";
  issues: string[];
  reason: string;
};

const MAX_ANALYSIS_BASE64_LENGTH = 1_450_000;
const approvedPreparedPhotos = new WeakMap<PreparedWardrobePhoto, RegisteredPhotoApproval>();
const persistedPhotoApprovals = new Map<string, RegisteredPhotoApproval>();

type RegisteredPhotoApproval = {
  previewUri: string;
  photoDigest: string;
  policyVersion: typeof WARDROBE_PHOTO_POLICY_VERSION;
};

export async function pickAndPrepareWardrobePhoto(source: WardrobePhotoSource): Promise<PreparedWardrobePhoto | null> {
  if (Platform.OS === "web") {
    throw new WardrobePhotoError("native_only", "사진 아이템 등록은 iOS·Android 앱에서 사용할 수 있습니다.");
  }
  if (source === "camera") {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new WardrobePhotoError("camera_permission_denied", "카메라 권한이 필요합니다. 앱 권한 설정에서 허용해 주세요.");
    }
  }
  const result = source === "camera"
    ? await ImagePicker.launchCameraAsync(photoPickerOptions)
    : await ImagePicker.launchImageLibraryAsync(photoPickerOptions);
  const asset = result.canceled ? null : result.assets?.[0];
  if (!asset) return null;
  let prepared: PreparedWardrobePhoto | null = null;
  try {
    prepared = await prepareWardrobePhoto(asset.uri, asset.width, asset.height);
    return prepared;
  } finally {
    if (prepared?.previewUri !== asset.uri) removePreparedWardrobePhoto(asset.uri);
  }
}

export async function analyzeWardrobePhoto(photo: PreparedWardrobePhoto): Promise<WardrobePhotoAnalysis> {
  try {
    const localDigestPromise = digestPhotoBase64(photo.imageBase64);
    const result = await requestAuthenticatedAccountJson<{ analysis: unknown }>(
      "/wardrobe/analyze",
      { imageBase64: photo.imageBase64, mimeType: photo.mimeType },
      25_000,
    );
    const analysis = normalizeWardrobePhotoAnalysis(result.analysis);
    const localDigest = await localDigestPromise;
    if (analysis.photoDigest !== localDigest) {
      throw new WardrobePhotoError("photo_digest_mismatch", "사진 승인 결과가 현재 사진과 일치하지 않습니다. 다시 선택해 주세요.");
    }
    approvedPreparedPhotos.set(photo, {
      previewUri: photo.previewUri,
      photoDigest: localDigest,
      policyVersion: analysis.policyVersion,
    });
    return analysis;
  } catch (error) {
    if (error instanceof WardrobePhotoError) throw error;
    if (error instanceof AccountAuthError) throw new WardrobePhotoError(error.code, error.message);
    throw new WardrobePhotoError("wardrobe_analysis_failed", "옷 사진을 분석하지 못했습니다. 다시 시도해 주세요.");
  }
}

export async function persistWardrobePhoto(
  photo: PreparedWardrobePhoto,
  itemId: string,
): Promise<{ imageUrl: string; photoDigest?: string; photoPolicyVersion?: string }> {
  if (Platform.OS === "web") return { imageUrl: photo.previewUri };
  const approval = approvedPreparedPhotos.get(photo);
  if (Platform.OS === "ios") {
    if (!approval || approval.previewUri !== photo.previewUri) {
      throw new WardrobePhotoError("photo_approval_missing", "현재 사진의 서버 승인을 확인할 수 없습니다.");
    }
    const currentDigest = await digestPhotoBase64(await new File(photo.previewUri).base64());
    if (currentDigest !== approval.photoDigest) {
      throw new WardrobePhotoError("photo_digest_mismatch", "승인 후 사진 내용이 변경되어 저장할 수 없습니다.");
    }
  }
  const directory = new Directory(Paths.document, "wardrobe-photos");
  directory.create({ idempotent: true, intermediates: true });
  const destination = new File(directory, `${itemId}-${Date.now()}.jpg`);
  try {
    await new File(photo.previewUri).copy(destination, { overwrite: true });
    if (Platform.OS === "ios") {
      if (!approval) throw new WardrobePhotoError("photo_approval_missing", "현재 사진의 서버 승인을 확인할 수 없습니다.");
      const persistedDigest = await digestPhotoBase64(await destination.base64());
      if (persistedDigest !== approval.photoDigest) {
        throw new WardrobePhotoError("photo_digest_mismatch", "저장된 사진의 무결성을 확인할 수 없습니다.");
      }
      if (!WeatheronWidgetDataModule?.protectWardrobePhoto(destination.uri)) {
        throw new WardrobePhotoError("photo_protection_failed", "iOS 사진 보호 설정을 적용하지 못했습니다.");
      }
      persistedPhotoApprovals.set(destination.uri, approval);
    }
    return {
      imageUrl: destination.uri,
      photoDigest: approval?.photoDigest,
      photoPolicyVersion: approval?.policyVersion,
    };
  } catch (error) {
    try {
      if (destination.exists) destination.delete();
    } catch {
      // 실패한 저장 결과 정리가 원래 오류를 덮지 않게 한다.
    }
    throw error;
  }
}

export function consumePersistedWardrobePhotoApproval(
  imageUrl: string,
  photoPolicyVersion: string | undefined,
  photoDigest: string | undefined,
): boolean {
  const approval = persistedPhotoApprovals.get(imageUrl);
  if (!approval) return false;
  persistedPhotoApprovals.delete(imageUrl);
  return approval.policyVersion === photoPolicyVersion && approval.photoDigest === photoDigest;
}

export function removePersistedWardrobePhotos(imageUrls: string[]): void {
  if (Platform.OS === "web") return;
  for (const imageUrl of imageUrls) {
    try {
      if (!imageUrl.startsWith(new Directory(Paths.document, "wardrobe-photos").uri)) continue;
      const file = new File(imageUrl);
      if (file.exists) file.delete();
    } catch {
      // 사진 정리 실패가 로그아웃이나 화면 상태 초기화를 막지 않게 한다.
    }
  }
}

export function removePreparedWardrobePhoto(previewUri: string): void {
  if (Platform.OS === "web") return;
  try {
    if (!previewUri.startsWith(Paths.cache.uri)) return;
    const file = new File(previewUri);
    if (file.exists) file.delete();
  } catch {
    // 임시 사진 정리 실패가 화면 이동이나 재시도를 막지 않게 한다.
  }
}

export function isPermanentWardrobePhotoRejection(error: unknown): boolean {
  if (!(error instanceof WardrobePhotoError)) return false;
  return new Set([
    "photo_sensitive_content",
    "photo_person_detected",
    "photo_not_wardrobe",
    "photo_review_required",
    "invalid_image",
    "invalid_image_dimensions",
    "unsupported_image_type",
    "photo_digest_mismatch",
  ]).has(error.code);
}

async function prepareWardrobePhoto(uri: string, width: number, height: number): Promise<PreparedWardrobePhoto> {
  const first = await resizeAndEncode(uri, width, height, 1024, 0.68);
  if (first.imageBase64.length <= MAX_ANALYSIS_BASE64_LENGTH) return first;
  const second = await resizeAndEncode(uri, width, height, 720, 0.55);
  if (second.imageBase64.length > MAX_ANALYSIS_BASE64_LENGTH) {
    throw new WardrobePhotoError("photo_too_large", "사진 용량을 줄이지 못했습니다. 다른 사진을 선택해 주세요.");
  }
  return second;
}

async function resizeAndEncode(
  uri: string,
  width: number,
  height: number,
  maxDimension: number,
  compress: number,
): Promise<PreparedWardrobePhoto> {
  const context = ImageManipulator.manipulate(uri);
  if (Math.max(width, height) > maxDimension) {
    if (width >= height) context.resize({ width: maxDimension, height: null });
    else context.resize({ width: null, height: maxDimension });
  }
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ base64: true, compress, format: SaveFormat.JPEG });
  if (!saved.base64) throw new WardrobePhotoError("photo_encoding_failed", "사진을 분석용으로 준비하지 못했습니다.");
  return Object.freeze({
    previewUri: saved.uri,
    imageBase64: saved.base64,
    mimeType: "image/jpeg",
    width: saved.width,
    height: saved.height,
  });
}

function normalizeWardrobePhotoAnalysis(value: unknown): WardrobePhotoAnalysis {
  if (!value || typeof value !== "object") {
    throw new WardrobePhotoError("invalid_analysis", "AI 분석 결과를 확인할 수 없습니다.");
  }
  const record = value as Partial<WardrobePhotoAnalysis>;
  if (record.decision !== "accept" || record.policyVersion !== WARDROBE_PHOTO_POLICY_VERSION) {
    throw new WardrobePhotoError("invalid_analysis", "서버의 사진 승인 결과를 확인할 수 없습니다.");
  }
  if (typeof record.photoDigest !== "string" || !/^[a-f0-9]{64}$/u.test(record.photoDigest)) {
    throw new WardrobePhotoError("invalid_analysis", "사진 승인 지문을 확인할 수 없습니다.");
  }
  const categoryValues: WardrobeCategory[] = ["outer", "top", "bottom", "shoes", "accessory"];
  const seasonValues: Season[] = ["spring", "summer", "fall", "winter"];
  const purposeValues: Purpose[] = ["commute", "school", "travel", "outdoor", "formal", "daily"];
  const weatherTagValues: WeatherTag[] = ["rain", "wind", "cold", "heat", "dry"];
  if (!categoryValues.includes(record.category as WardrobeCategory)) {
    throw new WardrobePhotoError("invalid_analysis", "옷 종류 분석 결과를 확인할 수 없습니다.");
  }
  const normalizedSeasons = filterValues(record.seasons, seasonValues);
  const normalizedPurposes = filterValues(record.purposes, purposeValues);
  const normalizedWeatherTags = filterValues(record.weatherTags, weatherTagValues);
  if (!normalizedSeasons.length || !normalizedPurposes.length || !normalizedWeatherTags.length) {
    throw new WardrobePhotoError("invalid_analysis", "옷 분류 분석 결과를 확인할 수 없습니다.");
  }
  return {
    decision: "accept",
    policyVersion: WARDROBE_PHOTO_POLICY_VERSION,
    photoDigest: record.photoDigest,
    eligibilityConfidence: clampNumber(record.eligibilityConfidence, 0),
    name: typeof record.name === "string" && record.name.trim() ? record.name.trim().slice(0, 30) : "내 옷",
    category: record.category as WardrobeCategory,
    seasons: normalizedSeasons,
    purposes: normalizedPurposes,
    weatherTags: normalizedWeatherTags,
    confidence: clampNumber(record.confidence, 0.5),
    quality: record.quality === "good" || record.quality === "retake" ? record.quality : "review",
    issues: Array.isArray(record.issues) ? record.issues.filter((item): item is string => typeof item === "string").slice(0, 3) : [],
    reason: typeof record.reason === "string" ? record.reason.slice(0, 100) : "사진을 기준으로 제안함",
  };
}

function digestPhotoBase64(value: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value, {
    encoding: Crypto.CryptoEncoding.HEX,
  });
}

function filterValues<T extends string>(value: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is T => typeof item === "string" && allowed.includes(item as T)))];
}

function clampNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;
}

const photoPickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: false,
  quality: 0.9,
  exif: false,
};

export class WardrobePhotoError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "WardrobePhotoError";
  }
}
