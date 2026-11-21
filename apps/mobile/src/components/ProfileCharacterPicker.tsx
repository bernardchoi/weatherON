import React from "react";
import { ambientUiIcons } from "../ambientAssets";
import { ActivityIndicator, Image, Modal, ScrollView, Text, View, useWindowDimensions } from "../localization/react-native";
import { FeedbackPressable } from "./FeedbackPressable";
import { useAppTheme } from "../theme/AppThemeContext";
import { LocalizationContext } from "../localization/LocalizationProvider";
import type { AppLanguage } from "../localization/localePolicy";
import { readProfileCharacter, writeProfileCharacter } from "../state/profileCharacterPersistence";
import { profileCharacterIds, type ProfileCharacterId } from "../state/profileCharacter";
import { profileCharacterImageLayout } from "../utils/profileCharacterPresentation";

const assets = {
  main: require("../../assets/characters/main-fullbody.png"),
  solar: require("../../assets/characters/profile/solar.png"),
  rain: require("../../assets/characters/profile/rain.png"),
  storm: require("../../assets/characters/profile/storm.png"),
  wind: require("../../assets/characters/profile/wind.png"),
  frost: require("../../assets/characters/profile/frost.png"),
  mist: require("../../assets/characters/profile/mist.png"),
};
const copy = {
  ko: {
    title: "프로필 캐릭터", note: "이 기기에만 저장돼요", close: "닫기", retry: "다시 시도", error: "저장소에 접근하지 못했어요. 다시 시도해 주세요.", saving: "저장 중", selected: "선택됨", choose: "캐릭터 선택", change: "캐릭터 변경",
    default: "캐릭터 없음", main: "온비", solar: "솔라", rain: "레인", storm: "스톰", wind: "윈드", frost: "프로스트", mist: "미스트",
  },
  en: {
    title: "Profile character", note: "Saved only on this device", close: "Close", retry: "Retry", error: "Storage is unavailable. Please try again.", saving: "Saving", selected: "Selected", choose: "Choose character", change: "Change character",
    default: "No character", main: "ONBY", solar: "Solar", rain: "Rain", storm: "Storm", wind: "Wind", frost: "Frost", mist: "Mist",
  },
  ja: {
    title: "プロフィールキャラクター", note: "この端末にのみ保存されます", close: "閉じる", retry: "再試行", error: "保存できませんでした。もう一度お試しください。", saving: "保存中", selected: "選択中", choose: "キャラクターを選ぶ", change: "キャラクターを変更",
    default: "キャラクターなし", main: "オンビ", solar: "ソーラー", rain: "レイン", storm: "ストーム", wind: "ウィンド", frost: "フロスト", mist: "ミスト",
  },
} satisfies Record<AppLanguage, Record<ProfileCharacterId | "title" | "note" | "close" | "retry" | "error" | "saving" | "selected" | "choose" | "change", string>>;
export function ProfileCharacterImage({ id, size }: { id: ProfileCharacterId; size: number }) {
  return id === "default" ? null : <View style={{ width: size, height: size, overflow: "hidden" }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <Image source={assets[id]} resizeMode="contain" style={{ position: "absolute", ...profileCharacterImageLayout(id, size) }} />
  </View>;
}
export function ProfileCharacterButton({ id, size, onPress }: { id: ProfileCharacterId; size: number; onPress: () => void }) {
  const theme = useAppTheme();
  const t = useProfileCharacterCopy();
  const { fontScale } = useWindowDimensions();
  const expanded = fontScale > 1.2;
  const hasCharacter = id !== "default";
  // Give selected artwork more of the existing circle while reserving two
  // caption lines. The empty state and full-width large-text layout stay put.
  const imageSize = hasCharacter ? (expanded ? 96 : size - 56) : (expanded ? 80 : 64);
  return <FeedbackPressable
    testID="my-character-picker"
    accessible
    accessibilityRole="button"
    accessibilityLabel={hasCharacter ? t.change : t.choose}
    accessibilityValue={hasCharacter ? { text: t[id] } : undefined}
    onPress={onPress}
    style={{
      ...(expanded ? { width: "100%" as const, minHeight: 48 } : { width: size, height: size }),
      borderRadius: expanded ? 24 : size / 2,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      paddingHorizontal: 12,
      paddingVertical: hasCharacter && !expanded ? 5 : 12,
      gap: 4,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ alignItems: "center", gap: expanded ? 8 : 4, width: "100%" }}>
      <View style={{ width: expanded ? 104 : imageSize, height: expanded ? 104 : imageSize, borderRadius: 52, alignItems: "center", justifyContent: "center", ...(expanded ? { borderWidth: 1, borderColor: theme.border } : {}) }}>
        {id === "default" ? <Image source={ambientUiIcons.tabMy} resizeMode="contain" style={{ width: imageSize, height: imageSize, tintColor: theme.muted }} /> : <ProfileCharacterImage id={id} size={imageSize} />}
      </View>
      <Text style={{ color: theme.text, fontSize: expanded ? 16 : 12, lineHeight: expanded ? 23 : 16, fontWeight: "600", textAlign: "center", alignSelf: "stretch" }}>{hasCharacter ? t[id] : t.choose}</Text>
    </View>
  </FeedbackPressable>;
}
export function useProfileCharacter() {
  const [id, setId] = React.useState<ProfileCharacterId>("default");
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const mounted = React.useRef(false);
  const busy = React.useRef(false);
  const load = React.useCallback(async () => {
    setError(false); setReady(false);
    try {
      const value = await readProfileCharacter();
      if (mounted.current) { setId(value); setReady(true); }
    } catch { if (mounted.current) setError(true); }
  }, []);
  React.useEffect(() => { mounted.current = true; void load(); return () => { mounted.current = false; }; }, [load]);
  const select = async (next: ProfileCharacterId) => {
    if (!ready || busy.current) return;
    busy.current = true; setSaving(true); setError(false);
    try {
      await writeProfileCharacter(next);
      if (mounted.current) setId(next); // Never claim success before durable write.
    } catch { if (mounted.current) setError(true); }
    finally { busy.current = false; if (mounted.current) setSaving(false); }
  };
  return { id, ready, error, saving, select, retry: load };
}
export function ProfileCharacterPicker({ visible, onClose, state }: { visible: boolean; onClose: () => void; state: ReturnType<typeof useProfileCharacter> }) {
  const theme = useAppTheme();
  const { language } = React.use(LocalizationContext); const t = copy[language];
  const { width, fontScale } = useWindowDimensions();
  const singleColumn = width < 360 || fontScale > 1.2;
  return <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 20 }}>
      <View accessibilityViewIsModal style={{ maxHeight: "90%", width: "100%", maxWidth: 540, alignSelf: "center", backgroundColor: theme.card, borderRadius: 24, padding: 20 }}>
        <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ gap: 12 }}>
          <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: "700", color: theme.text }}>{t.title}</Text>
          <Text style={{ fontSize: 14, color: theme.muted }}>{t.note}</Text>
          {!state.ready && !state.error ? <ActivityIndicator accessibilityLabel={t.title} /> : null}
          {state.error ? <View><Text accessibilityRole="alert" style={{ color: theme.text, fontSize: 16 }}>{t.error}</Text>{!state.ready ? <FeedbackPressable accessibilityRole="button" onPress={() => void state.retry()} style={{ minHeight: 48, justifyContent: "center" }}><Text style={{ color: theme.text }}>{t.retry}</Text></FeedbackPressable> : null}</View> : null}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {profileCharacterIds.map(id => {
              const label = t[id];
              const selected = state.id === id;
              return <FeedbackPressable key={id} testID={`profile-character-${id}`} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected, disabled: !state.ready || state.saving }} disabled={!state.ready || state.saving} onPress={() => void state.select(id)} style={{ width: singleColumn ? "100%" : "47%", minHeight: 156, padding: 8, alignItems: "center", justifyContent: "center", gap: 4, borderWidth: selected ? 2 : 1, borderColor: selected ? theme.text : theme.border, borderRadius: 18, backgroundColor: theme.card }}>
                {id === "default" ? <Image source={ambientUiIcons.tabMy} resizeMode="contain" style={{ width: 64, height: 64, tintColor: theme.muted }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" /> : <ProfileCharacterImage id={id} size={96} />}
                <Text style={{ color: theme.text, fontSize: 16, textAlign: "center", alignSelf: "stretch" }}>{label}</Text>
                {selected ? <Text style={{ color: theme.muted, fontSize: 12, textAlign: "center", alignSelf: "stretch" }}>{t.selected}</Text> : null}
              </FeedbackPressable>;
            })}
          </View>
        </ScrollView>
        {state.saving ? <Text accessibilityLiveRegion="polite" style={{ color: theme.text }}>{t.saving}</Text> : null}
        <FeedbackPressable accessibilityRole="button" onPress={onClose} style={{ minHeight: 48, alignItems: "center", justifyContent: "center", marginTop: 8 }}><Text style={{ color: theme.text, fontSize: 17, fontWeight: "600" }}>{t.close}</Text></FeedbackPressable>
      </View>
    </View>
  </Modal>;
}
export function useProfileCharacterCopy() { const { language } = React.use(LocalizationContext); return copy[language]; }
