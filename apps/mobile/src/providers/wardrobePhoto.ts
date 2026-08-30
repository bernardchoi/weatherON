import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import type { Purpose, Season, WardrobeCategory, WeatherTag } from "@weatheron/shared";
import { requestAuthenticatedAccountJson } from "./accountAuth";

export type WardrobePhotoSource = "camera" | "library";

export type PreparedWardrobePhoto = {
  previewUri: string;
  imageBase64: string;
  mimeType: "image/jpeg";
  width: number;
  height: number;
};

export type WardrobePhotoAnalysis = {
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
  return prepareWardrobePhoto(asset.uri, asset.width, asset.height);
}

export async function analyzeWardrobePhoto(photo: PreparedWardrobePhoto): Promise<WardrobePhotoAnalysis> {
  const result = await requestAuthenticatedAccountJson<{ analysis: WardrobePhotoAnalysis }>(
    "/wardrobe/analyze",
    { imageBase64: photo.imageBase64, mimeType: photo.mimeType },
    25_000,
  );
  return normalizeWardrobePhotoAnalysis(result.analysis);
}

export async function persistWardrobePhoto(previewUri: string, itemId: string): Promise<string> {
  if (Platform.OS === "web") return previewUri;
  const directory = new Directory(Paths.document, "wardrobe-photos");
  directory.create({ idempotent: true, intermediates: true });
  const destination = new File(directory, `${itemId}-${Date.now()}.jpg`);
  await new File(previewUri).copy(destination, { overwrite: true });
  return destination.uri;
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
  return {
    previewUri: saved.uri,
    imageBase64: saved.base64,
    mimeType: "image/jpeg",
    width: saved.width,
    height: saved.height,
  };
}

function normalizeWardrobePhotoAnalysis(value: WardrobePhotoAnalysis): WardrobePhotoAnalysis {
  if (!value || typeof value !== "object") {
    throw new WardrobePhotoError("invalid_analysis", "AI 분석 결과를 확인할 수 없습니다.");
  }
  return {
    name: typeof value.name === "string" && value.name.trim() ? value.name.trim().slice(0, 30) : "내 옷",
    category: value.category,
    seasons: value.seasons,
    purposes: value.purposes,
    weatherTags: value.weatherTags,
    confidence: typeof value.confidence === "number" ? Math.min(1, Math.max(0, value.confidence)) : 0.5,
    quality: value.quality === "good" || value.quality === "retake" ? value.quality : "review",
    issues: Array.isArray(value.issues) ? value.issues.filter((item) => typeof item === "string").slice(0, 3) : [],
    reason: typeof value.reason === "string" ? value.reason.slice(0, 100) : "사진을 기준으로 제안함",
  };
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
