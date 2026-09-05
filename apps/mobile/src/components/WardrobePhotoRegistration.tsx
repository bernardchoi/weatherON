import React from "react";
import * as Crypto from "expo-crypto";
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Purpose, Season, WardrobeCategory, WardrobeItem, WeatherTag } from "@weatheron/shared";
import { BottomSheet } from "./BottomSheet";
import { AppButton } from "./AppButton";
import { AppScreen } from "./AppScreen";
import { Section } from "./Section";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { radius, spacing } from "../theme/tokens";
import { getOutfitTagLabel, getWardrobeCategoryLabel } from "../utils/outfitLabels";
import { getOutfitImageSource } from "../assets";
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
  const draftEdited = React.useRef(false);
  const [analysis, setAnalysis] = React.useState<WardrobePhotoAnalysis | null>(null);
  const [status, setStatus] = React.useState<Status>(existingItem ? "ready" : "idle");
  const [message, setMessage] = React.useState(existingItem ? "옷 정보를 바꿀 수 있어요" : "옷 한 벌이 잘 보이는 사진을 골라 주세요");
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
    setMessage("사진 속 옷을 살펴보고 있어요");
    try {
      const result = await analyzeWardrobePhoto(photo);
      setAnalysis(result);
      if (!draftEdited.current) setDraft(toDraft(result));
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
      const detail = error instanceof Error ? error.message : "AI 분석에 실패함";
      setMessage(Platform.OS === "ios" ? `${detail} 사진 확인을 다시 시도해 주세요. 선택한 옷 정보는 유지돼요.` : `${detail} · 직접 입력해서 저장 가능`);
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
      draftEdited.current = false;
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
      setMessage("옷 이름을 적고 각 항목을 하나 이상 골라 주세요");
      return;
    }
    if (
      Platform.OS === "ios" &&
      preparedPhoto &&
      (analysis?.decision !== "accept" || analysis.policyVersion !== WARDROBE_PHOTO_POLICY_VERSION)
    ) {
      setStatus("error");
      setMessage("사진 확인을 마친 뒤 옷장에 추가할 수 있어요");
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
  const needsPhotoCheck = requiresApproval && !hasApproval;
  const canSave = !busy && Boolean(previewUri) && (needsPhotoCheck || isDraftReady(draft));
  const cancel = () => {
    replacePreparedPhoto(null);
    onCancel();
  };

  return (
    <AppScreen
      title={existingItem ? "내 옷 수정" : "내 옷 사진 추가"}
      subtitle="사진을 고르고 옷 정보를 확인해 주세요"
      badge={analysis ? "사진 확인 완료" : "사진으로 추가"}
      onBack={cancel}
      showWordmark={false}
      compactHeader
      contentPaddingTop={layout.weatherTopPadding + spacing.sm}
      contentGap={layout.destinationContentGap}
      footer={previewUri ? (
        <AppButton label={status === "analyzing" ? "사진 확인 중" : status === "saving" ? "저장 중" : needsPhotoCheck ? "사진 확인 다시 시도" : existingItem ? "변경 내용 저장" : "내 옷장에 추가"} onPress={() => needsPhotoCheck && preparedPhoto ? void runAnalysis(preparedPhoto) : void save()} tone="warning" disabled={!canSave} />
      ) : undefined}
    >
      <Section title="옷 사진" caption="옷을 확인할 때만 사진을 보내요. WeatherON 서버에는 보관하지 않아요." accent="clear">
        {previewUri ? (
          <View style={[styles.photoFrame, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
            <Image source={getOutfitImageSource(previewUri)} style={styles.photo} resizeMode="contain" />
          </View>
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
            <Text style={[styles.placeholderTitle, { color: theme.text }]}>옷 한 개를 정면에서 촬영</Text>
            <Text style={[styles.placeholderBody, { color: theme.muted }]}>밝은 곳에서 옷 전체가 보이게 찍어 주세요. 사람이 나오지 않게 옷만 담아 주세요.</Text>
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
        </View>
      </Section>

      {previewUri ? (
        <Section title="옷 정보" caption="다르게 보이는 정보는 직접 바꿔 주세요" accent="gold">
          <View style={[styles.summaryCard, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
            <View style={styles.summaryCopy}>
              <Text style={[styles.summaryName, { color: theme.text }]} numberOfLines={1}>{draft.name}</Text>
              <Text style={[styles.summaryMeta, { color: theme.muted }]} numberOfLines={2}>
                {getWardrobeCategoryLabel(draft.category)} · {draft.seasons.map(getPhotoTagLabel).join(" · ")} · {draft.weatherTags.map(getPhotoTagLabel).join(" · ")}
              </Text>
            </View>
            <AppButton label={detailsOpen ? "접기" : "정보 바꾸기"} onPress={() => setDetailsOpen((value) => !value)} tone="secondary" size="sm" />
          </View>

          {detailsOpen ? (
            <View style={styles.form}>
              <FieldLabel label="옷 이름" />
              <TextInput
                value={draft.name}
                onChangeText={(name) => { draftEdited.current = true; setDraft((current) => ({ ...current, name: name.slice(0, 30) })); }}
                placeholder="예: 검정 경량 패딩"
                placeholderTextColor={theme.subtle}
                style={[styles.input, { color: theme.text, backgroundColor: theme.cardMuted, borderColor: theme.border }]}
                maxLength={30}
              />
              <ChoiceRow label="옷 종류" values={categories} selected={[draft.category]} labelFor={getWardrobeCategoryLabel} onToggle={(category) => { draftEdited.current = true; setDraft((current) => ({ ...current, category })); }} />
              <ChoiceRow label="입는 계절" values={seasons} selected={draft.seasons} labelFor={getPhotoTagLabel} onToggle={(season) => { draftEdited.current = true; setDraft((current) => ({ ...current, seasons: toggleValue(current.seasons, season) })); }} />
              <ChoiceRow label="입는 상황" values={purposes} selected={draft.purposes} labelFor={getPhotoTagLabel} onToggle={(purpose) => { draftEdited.current = true; setDraft((current) => ({ ...current, purposes: toggleValue(current.purposes, purpose) })); }} />
              <ChoiceRow label="어울리는 날씨" values={weatherTags} selected={draft.weatherTags} labelFor={getPhotoTagLabel} onToggle={(weatherTag) => { draftEdited.current = true; setDraft((current) => ({ ...current, weatherTags: toggleValue(current.weatherTags, weatherTag) })); }} />
            </View>
          ) : null}

        </Section>
      ) : null}
    </AppScreen>
  );
}

function ChoiceRow<T extends string>({
  label,
  values,
  selected,
  labelFor,
  onToggle,
}: {
  label: string;
  values: readonly T[];
  selected: readonly T[];
  labelFor: (value: T) => string;
  onToggle: (value: T) => void;
}) {
  const theme = useAppTheme();
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}, ${selected.map(labelFor).join(", ")}`} accessibilityState={{ expanded: open }} onPress={() => setOpen(true)} style={[styles.selectRow, { borderColor: theme.border }]}>
        <Text style={[styles.fieldLabel, { color: theme.muted }]}>{label}</Text>
        <Text style={[styles.selectValue, { color: theme.text }]}>{selected.map(labelFor).join(" · ")}　›</Text>
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)} accessibilityLabel={label}>
        <FieldLabel label={label} />
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
        <AppButton label="선택 완료" onPress={() => setOpen(false)} tone="secondary" />
      </BottomSheet>
    </>
  );
}

function getPhotoTagLabel(value: string): string {
  const labels: Record<string, string> = { dry: "비 안 오는 날", rain: "비 오는 날", wind: "바람 부는 날", cold: "추운 날", heat: "더운 날", formal: "격식 있는 자리" };
  return labels[value] ?? getOutfitTagLabel(value);
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
  if (analysis.quality === "retake") return "사진이 조금 흐려요. 다시 찍거나 옷 정보를 확인해 주세요.";
  if (analysis.quality === "review" || analysis.confidence < 0.72) return "옷 정보가 맞는지 확인해 주세요.";
  return "옷 정보를 확인했어요. 맞으면 옷장에 추가해 주세요.";
}

function getStatusTitle(status: Status, analysis: WardrobePhotoAnalysis | null) {
  if (status === "picking") return "사진 선택 중";
  if (status === "analyzing") return "사진 확인 중";
  if (status === "saving") return "저장 중";
  if (status === "error") return "사진 확인이 필요해요";
  if (analysis?.quality === "retake") return "재촬영 권장";
  if (analysis) return "사진 확인 완료";
  if (status === "ready") return "옷 정보 확인";
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
  selectRow: { minHeight: 52, paddingVertical: spacing.sm, borderBottomWidth: 1, gap: 4 },
  selectValue: { fontSize: 14, lineHeight: 20, fontWeight: "700" },
  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  choice: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1 },
  choiceText: { fontSize: 12, lineHeight: 17, fontWeight: "900" },
});
