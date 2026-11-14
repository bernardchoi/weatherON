import React from "react";
import { ambientUiIcons } from "../ambientAssets";
import { ActivityIndicator, Image, Modal, ScrollView, Text, View } from "../localization/react-native";
import { FeedbackPressable } from "./FeedbackPressable";
import { useAppTheme } from "../theme/AppThemeContext";
import { LocalizationContext } from "../localization/LocalizationProvider";
import { readProfileCharacter, writeProfileCharacter } from "../state/profileCharacterPersistence";
import { profileCharacterIds, type ProfileCharacterId } from "../state/profileCharacter";

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
  ko: { title: "프로필 캐릭터", note: "이 기기에만 저장돼요", close: "닫기", retry: "다시 시도", error: "저장소에 접근하지 못했어요. 다시 시도해 주세요.", saving: "저장 중", selected: "선택됨", default: "기본", main: "메인", choose: "캐릭터 선택" },
  en: { title: "Profile character", note: "Saved only on this device", close: "Close", retry: "Retry", error: "Storage is unavailable. Please try again.", saving: "Saving", selected: "Selected", default: "Default", main: "Main", choose: "Choose character" },
  ja: { title: "プロフィールキャラクター", note: "この端末にのみ保存されます", close: "閉じる", retry: "再試行", error: "保存できませんでした。もう一度お試しください。", saving: "保存中", selected: "選択中", default: "標準", main: "メイン", choose: "キャラクターを選ぶ" },
};
export function ProfileCharacterImage({ id, size }: { id: ProfileCharacterId; size: number }) {
  return id === "default" ? null : <Image source={assets[id]} resizeMode="contain" style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
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
  return <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 20 }}>
      <View accessibilityViewIsModal style={{ maxHeight: "90%", width: "100%", maxWidth: 540, alignSelf: "center", backgroundColor: theme.card, borderRadius: 24, padding: 20 }}>
        <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: "700", color: theme.text }}>{t.title}</Text>
        <Text style={{ fontSize: 14, color: theme.muted, marginVertical: 8 }}>{t.note}</Text>
        <ScrollView contentContainerStyle={{ gap: 12 }}>
          {!state.ready && !state.error ? <ActivityIndicator accessibilityLabel={t.title} /> : null}
          {state.error ? <View><Text accessibilityRole="alert" style={{ color: theme.text, fontSize: 16 }}>{t.error}</Text>{!state.ready ? <FeedbackPressable accessibilityRole="button" onPress={() => void state.retry()} style={{ minHeight: 48, justifyContent: "center" }}><Text style={{ color: theme.text }}>{t.retry}</Text></FeedbackPressable> : null}</View> : null}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {profileCharacterIds.map(id => {
              const label = id === "default" || id === "main" ? t[id] : id[0].toUpperCase() + id.slice(1);
              const selected = state.id === id;
              return <FeedbackPressable key={id} testID={`profile-character-${id}`} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected, disabled: !state.ready || state.saving }} disabled={!state.ready || state.saving} onPress={() => void state.select(id)} style={{ width: "47%", minHeight: 140, padding: 8, alignItems: "center", justifyContent: "center", gap: 4, borderWidth: selected ? 2 : 1, borderColor: selected ? theme.text : theme.border, borderRadius: 18, backgroundColor: theme.card }}>
                {id === "default" ? <Image source={ambientUiIcons.tabMy} resizeMode="contain" style={{ width: 64, height: 64, tintColor: theme.muted }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" /> : <ProfileCharacterImage id={id} size={80} />}
                <Text style={{ color: theme.text, fontSize: 16, textAlign: "center" }}>{label}</Text>
                {selected ? <Text style={{ color: theme.muted, fontSize: 12 }}>{t.selected}</Text> : null}
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
