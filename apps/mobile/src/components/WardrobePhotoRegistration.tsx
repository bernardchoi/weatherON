import React from "react";
import * as Crypto from "expo-crypto";
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Purpose, Season, WardrobeCategory, WardrobeItem, WeatherTag } from "@weatheron/shared";
import { AppButton } from "./AppButton";
import { AppScreen } from "./AppScreen";
import { Section } from "./Section";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { radius, spacing } from "../theme/tokens";
import { getOutfitTagLabel, getWardrobeCategoryLabel } from "../utils/outfitLabels";
import {
  analyzeWardrobePhoto,
  isPermanentWardrobePhotoRejection,
  persistWardrobePhoto,
  pickAndPrepareWardrobePhoto,
  removePreparedWardrobePhoto,
  removePersistedWardrobePhotos,
  WARDROBE_PHOTO_POLICY_VERSION,
  type PreparedWardrobePhoto,
  type WardrobePhotoAnalysis,
  type WardrobePhotoSource,
} from "../providers/wardrobePhoto";

type Draft = Pick<WardrobeItem, "name" | "category" | "seasons" | "purposes" | "weatherTags">;
type Status = "idle" | "picking" | "analyzing" | "ready" | "saving" | "error";

const categories: WardrobeCategory[] = ["outer", "top", "bottom", "shoes", "accessory"];
const seasons: Season[] = ["spring", "summer", "fall", "winter"];
const purposes: Purpose[] = ["commute", "school", "travel", "outdoor", "formal", "daily"];
const weatherTags: WeatherTag[] = ["rain", "wind", "cold", "heat", "dry"];

const fallbackDraft: Draft = {
  name: "내 옷",
  category: "top",
  seasons: ["spring", "summer", "fall", "winter"],
  purposes: ["daily"],
  weatherTags: ["dry"],
};

export function WardrobePhotoRegistration({
  existingItem,
  onSave,
  onCancel,
}: {
  existingItem?: WardrobeItem;
  onSave: (item: WardrobeItem) => void;
  onCancel: () => void;
}) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const [preparedPhoto, setPreparedPhoto] = React.useState<PreparedWardrobePhoto | null>(null);
  const preparedPhotoRef = React.useRef<PreparedWardrobePhoto | null>(null);
  const [previewUri, setPreviewUri] = React.useState(existingItem?.imageUrl ?? "");
  const [draft, setDraft] = React.useState<Draft>(() => existingItem ? toDraft(existingItem) : fallbackDraft);
  const [analysis, setAnalysis] = React.useState<WardrobePhotoAnalysis | null>(null);
  const [status, setStatus] = React.useState<Status>(existingItem ? "ready" : "idle");
  const [message, setMessage] = React.useState(existingItem ? "저장된 사진의 분류를 수정할 수 있음" : "옷 한 개가 화면에 크게 보이는 사진이 좋음");
  const [detailsOpen, setDetailsOpen] = React.useState(Boolean(existingItem));

  const replacePreparedPhoto = React.useCallback((photo: PreparedWardrobePhoto | null) => {
    const previous = preparedPhotoRef.current;
    if (previous && previous.previewUri !== photo?.previewUri) removePreparedWardrobePhoto(previous.previewUri);
    preparedPhotoRef.current = photo;
    setPreparedPhoto(photo);
  }, []);

  React.useEffect(() => () => {
    const current = preparedPhotoRef.current;
    if (current) removePreparedWardrobePhoto(current.previewUri);
  }, []);

  const runAnalysis = React.useCallback(async (photo: PreparedWardrobePhoto) => {
    setAnalysis(null);
    setStatus("analyzing");
    setMessage("옷장 등록 가능 여부와 날씨 태그를 확인 중");
    try {
      const result = await analyzeWardrobePhoto(photo);
      setAnalysis(result);
      setDraft(toDraft(result));
      setStatus("ready");
      setDetailsOpen(result.quality !== "good" || result.confidence < 0.72);
      setMessage(getAnalysisMessage(result));
    } catch (error) {
      setAnalysis(null);
      setDetailsOpen(true);
      setStatus("error");
      if (Platform.OS === "ios" && isPermanentWardrobePhotoRejection(error)) {
        replacePreparedPhoto(null);
        setPreviewUri(existingItem?.imageUrl ?? "");
        setDraft(existingItem ? toDraft(existingItem) : fallbackDraft);
        setMessage(error instanceof Error ? error.message : "등록할 수 없는 사진임");
        return;
      }
      setDraft(existingItem ? toDraft(existingItem) : fallbackDraft);
      const detail = error instanceof Error ? error.message : "AI 분석에 실패함";
      setMessage(Platform.OS === "ios" ? `${detail} · 분석에 성공해야 저장 가능` : `${detail} · 직접 입력해서 저장 가능`);
    }
  }, [existingItem, replacePreparedPhoto]);

  const selectPhoto = async (source: WardrobePhotoSource) => {
    setStatus("picking");
    setMessage(source === "camera" ? "카메라 여는 중" : "사진 보관함 여는 중");
    try {
      const photo = await pickAndPrepareWardrobePhoto(source);
      if (!photo) {
        setStatus(previewUri ? "ready" : "idle");
        setMessage(previewUri ? "기존 사진을 유지함" : "사진 선택을 취소함");
        return;
      }
      replacePreparedPhoto(photo);
      setPreviewUri(photo.previewUri);
      await runAnalysis(photo);
    } catch (error) {
      setStatus(previewUri ? "ready" : "error");
      setMessage(error instanceof Error ? error.message : "사진을 불러오지 못함");
    }
  };

  const save = async () => {
    if (!previewUri || !isDraftReady(draft)) {
      setDetailsOpen(true);
      setStatus("error");
      setMessage("이름과 모든 분류 항목을 하나 이상 선택해야 함");
      return;
    }
    if (
      Platform.OS === "ios" &&
      preparedPhoto &&
      (analysis?.decision !== "accept" || analysis.policyVersion !== WARDROBE_PHOTO_POLICY_VERSION)
    ) {
      setStatus("error");
      setMessage("서버의 옷 사진 승인이 완료돼야 저장할 수 있음");
      return;
    }
    setStatus("saving");
      setMessage("내 옷장에 저장 중");
    try {
      const itemId = existingItem?.id ?? `photo-${Crypto.randomUUID()}`;
      const persistedPhoto = preparedPhoto ? await persistWardrobePhoto(preparedPhoto, itemId) : null;
      const imageUrl = persistedPhoto?.imageUrl ?? previewUri;
      const approval = preparedPhoto
        ? {
            photoPolicyVersion: persistedPhoto?.photoPolicyVersion,
            photoDigest: persistedPhoto?.photoDigest,
            photoApprovedAt: persistedPhoto?.photoDigest ? new Date().toISOString() : undefined,
          }
        : {
            photoPolicyVersion: existingItem?.photoPolicyVersion,
            photoDigest: existingItem?.photoDigest,
            photoApprovedAt: existingItem?.photoApprovedAt,
          };
      onSave({ id: itemId, source: "photo", ...draft, imageUrl, owned: true, ...approval });
      if (preparedPhoto && existingItem?.imageUrl && existingItem.imageUrl !== imageUrl) {
        removePersistedWardrobePhotos([existingItem.imageUrl]);
      }
      if (preparedPhoto) replacePreparedPhoto(null);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "사진 아이템을 저장하지 못함");
    }
  };

  const busy = status === "picking" || status === "analyzing" || status === "saving";
  const canUseNativePhoto = Platform.OS !== "web";
  const requiresApproval = Platform.OS === "ios" && Boolean(preparedPhoto);
  const hasApproval = analysis?.decision === "accept" && analysis.policyVersion === WARDROBE_PHOTO_POLICY_VERSION;
  const canSave = !busy && Boolean(previewUri) && (!requiresApproval || hasApproval);
  const cancel = () => {
    replacePreparedPhoto(null);
    onCancel();
  };

  return (
    <AppScreen
      title={existingItem ? "사진 아이템 수정" : "내 옷 사진 추가"}
      subtitle={Platform.OS === "ios" ? "서버 승인 후 분류를 확인해서 저장" : "AI 제안 후 직접 확인해서 저장"}
      badge={analysis ? `등록 판정 ${Math.round(analysis.eligibilityConfidence * 100)}%` : "선택 기능"}
      onBack={cancel}
      showWordmark={false}
      compactHeader
      contentPaddingTop={layout.weatherTopPadding + spacing.sm}
      contentGap={layout.destinationContentGap}
    >
      <Section title="옷 사진" caption="분석용 축소 JPEG를 암호화 전송하며 WeatherON 서버 저장소에는 사진을 남기지 않음" accent="clear">
        {previewUri ? (
          <View style={[styles.photoFrame, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
            <Image source={{ uri: previewUri }} style={styles.photo} resizeMode="contain" />
          </View>
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
            <Text style={[styles.placeholderTitle, { color: theme.text }]}>옷 한 개를 정면에서 촬영</Text>
            <Text style={[styles.placeholderBody, { color: theme.muted }]}>밝은 곳·단순한 배경·옷 전체가 보이게 촬영 권장 · 사람이 보이면 등록 차단 · 신원은 추론하지 않음</Text>
          </View>
        )}
        <View style={styles.photoActions}>
          <AppButton label="사진 촬영" onPress={() => void selectPhoto("camera")} tone="warning" size="sm" disabled={busy || !canUseNativePhoto} />
          <AppButton label="앨범에서 선택" onPress={() => void selectPhoto("library")} tone="secondary" size="sm" disabled={busy || !canUseNativePhoto} />
        </View>
        {!canUseNativePhoto ? <Text style={[styles.message, { color: theme.muted }]}>사진 등록은 iOS·Android 앱에서 확인 가능</Text> : null}
        <View style={[styles.statusCard, { backgroundColor: theme.cardStrong, borderColor: analysis?.quality === "retake" ? theme.warm : theme.border }]}>
          <Text style={[styles.statusTitle, { color: status === "error" || analysis?.quality === "retake" ? theme.warm : theme.clear }]}>
            {getStatusTitle(status, analysis)}
          </Text>
          <Text style={[styles.message, { color: theme.muted }]}>{message}</Text>
          {analysis?.issues.length ? <Text style={[styles.issueText, { color: theme.muted }]}>{analysis.issues.join(" · ")}</Text> : null}
          {Platform.OS === "ios" && preparedPhoto && status === "error" ? (
            <AppButton label="분석 다시 시도" onPress={() => void runAnalysis(preparedPhoto)} tone="secondary" size="sm" />
          ) : null}
        </View>
      </Section>

      {previewUri ? (
        <Section title="분석 결과" caption="추천에 사용될 정보 · 저장 전 수정 가능" accent="gold">
          <View style={[styles.summaryCard, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
            <View style={styles.summaryCopy}>
              <Text style={[styles.summaryName, { color: theme.text }]} numberOfLines={1}>{draft.name}</Text>
              <Text style={[styles.summaryMeta, { color: theme.muted }]} numberOfLines={2}>
                {getWardrobeCategoryLabel(draft.category)} · {draft.seasons.map(getOutfitTagLabel).join(" · ")} · {draft.weatherTags.map(getOutfitTagLabel).join(" · ")}
              </Text>
            </View>
            <AppButton label={detailsOpen ? "수정 닫기" : "분석 결과 수정"} onPress={() => setDetailsOpen((value) => !value)} tone="secondary" size="sm" />
          </View>

          {detailsOpen ? (
            <View style={styles.form}>
              <FieldLabel label="아이템 이름" />
              <TextInput
                value={draft.name}
                onChangeText={(name) => setDraft((current) => ({ ...current, name: name.slice(0, 30) }))}
                placeholder="예: 검정 경량 패딩"
                placeholderTextColor={theme.subtle}
                style={[styles.input, { color: theme.text, backgroundColor: theme.cardMuted, borderColor: theme.border }]}
                maxLength={30}
              />
              <FieldLabel label="종류" />
              <ChoiceRow values={categories} selected={[draft.category]} labelFor={getWardrobeCategoryLabel} onToggle={(category) => setDraft((current) => ({ ...current, category }))} />
              <FieldLabel label="계절" />
              <ChoiceRow values={seasons} selected={draft.seasons} labelFor={getOutfitTagLabel} onToggle={(season) => setDraft((current) => ({ ...current, seasons: toggleValue(current.seasons, season) }))} />
              <FieldLabel label="목적" />
              <ChoiceRow values={purposes} selected={draft.purposes} labelFor={getOutfitTagLabel} onToggle={(purpose) => setDraft((current) => ({ ...current, purposes: toggleValue(current.purposes, purpose) }))} />
              <FieldLabel label="날씨 특성" />
              <ChoiceRow values={weatherTags} selected={draft.weatherTags} labelFor={getOutfitTagLabel} onToggle={(weatherTag) => setDraft((current) => ({ ...current, weatherTags: toggleValue(current.weatherTags, weatherTag) }))} />
            </View>
          ) : null}

          <View style={styles.saveActions}>
            <AppButton label={existingItem ? "수정 저장" : "내 옷장에 추가"} onPress={() => void save()} tone="warning" disabled={!canSave} />
            <AppButton label="취소" onPress={cancel} tone="secondary" disabled={busy} />
          </View>
        </Section>
      ) : null}
    </AppScreen>
  );
}

function ChoiceRow<T extends string>({
  values,
  selected,
  labelFor,
  onToggle,
}: {
  values: readonly T[];
  selected: readonly T[];
  labelFor: (value: T) => string;
  onToggle: (value: T) => void;
}) {
  const theme = useAppTheme();
  return (
    <View style={styles.choiceRow}>
      {values.map((value) => {
        const active = selected.includes(value);
        return (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onToggle(value)}
            style={[styles.choice, { backgroundColor: active ? theme.cardStrong : theme.cardMuted, borderColor: active ? theme.clear : theme.border }]}
          >
            <Text style={[styles.choiceText, { color: active ? theme.clear : theme.text }]}>{labelFor(value)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FieldLabel({ label }: { label: string }) {
  const theme = useAppTheme();
  return <Text style={[styles.fieldLabel, { color: theme.text }]}>{label}</Text>;
}

function toDraft(item: Pick<WardrobeItem, "name" | "category" | "seasons" | "purposes" | "weatherTags">): Draft {
  return { name: item.name, category: item.category, seasons: [...item.seasons], purposes: [...item.purposes], weatherTags: [...item.weatherTags] };
}

function toggleValue<T>(values: T[], value: T): T[] {
  if (values.includes(value)) return values.length === 1 ? values : values.filter((item) => item !== value);
  return [...values, value];
}

function isDraftReady(draft: Draft) {
  return Boolean(draft.name.trim() && draft.seasons.length && draft.purposes.length && draft.weatherTags.length);
}

function getAnalysisMessage(analysis: WardrobePhotoAnalysis) {
  if (analysis.quality === "retake") return "사진 상태가 불명확함 · 다시 촬영하거나 아래 결과를 직접 수정해줘";
  if (analysis.quality === "review" || analysis.confidence < 0.72) return "확인이 필요한 분석 결과임 · 열린 항목을 확인해줘";
  return `${analysis.reason} · 바로 저장하거나 필요한 항목만 수정 가능`;
}

function getStatusTitle(status: Status, analysis: WardrobePhotoAnalysis | null) {
  if (status === "picking") return "사진 선택 중";
  if (status === "analyzing") return "AI 분석 중";
  if (status === "saving") return "저장 중";
  if (status === "error") return "직접 확인 필요";
  if (analysis?.quality === "retake") return "재촬영 권장";
  if (analysis) return "AI 제안 완료";
  return "촬영 준비";
}

const styles = StyleSheet.create({
  photoFrame: { height: 230, alignItems: "center", justifyContent: "center", borderRadius: radius.lg, borderWidth: 1, overflow: "hidden" },
  photo: { width: "100%", height: "100%" },
  photoPlaceholder: { minHeight: 150, alignItems: "center", justifyContent: "center", gap: spacing.xs, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderStyle: "dashed" },
  placeholderTitle: { fontSize: 15, lineHeight: 20, fontWeight: "900", textAlign: "center" },
  placeholderBody: { fontSize: 12, lineHeight: 18, fontWeight: "700", textAlign: "center" },
  photoActions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statusCard: { gap: 4, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
  statusTitle: { fontSize: 13, lineHeight: 18, fontWeight: "900" },
  message: { fontSize: 12, lineHeight: 18, fontWeight: "700" },
  issueText: { fontSize: 11, lineHeight: 16, fontWeight: "700" },
  summaryCard: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
  summaryCopy: { minWidth: 0, flex: 1, gap: 3 },
  summaryName: { fontSize: 14, lineHeight: 19, fontWeight: "900" },
  summaryMeta: { fontSize: 11, lineHeight: 16, fontWeight: "700" },
  form: { gap: spacing.xs },
  fieldLabel: { paddingTop: spacing.xs, fontSize: 12, lineHeight: 17, fontWeight: "900" },
  input: { minHeight: 48, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, fontSize: 14, fontWeight: "800" },
  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  choice: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1 },
  choiceText: { fontSize: 12, lineHeight: 17, fontWeight: "900" },
  saveActions: { gap: spacing.sm },
});
