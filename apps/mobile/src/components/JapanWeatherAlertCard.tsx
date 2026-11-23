import { useEffect, useState } from "react";
import { Linking, RawText, StyleSheet, Text, View } from "../localization/react-native";
import { japanWeatherAgencyUrl, type JapanWeatherAlertResult } from "../providers/japanWeatherAlerts";
import type { AppTheme } from "../theme/tokens";
import { FeedbackPressable } from "./FeedbackPressable";

export function JapanWeatherAlertCard({ result, now, theme }: {
  result: JapanWeatherAlertResult;
  now: number;
  theme: AppTheme;
}) {
  const [timerNow, setTimerNow] = useState(0);
  const [failed, setFailed] = useState(false);
  const visible = result.alerts.filter(alert => alert.expiresAt > Math.max(now, timerNow));
  const nextExpiry = visible.reduce((minimum, alert) => Math.min(minimum, alert.expiresAt), Infinity);
  useEffect(() => {
    if (!Number.isFinite(nextExpiry)) return;
    const timer = setTimeout(() => setTimerNow(Date.now()), Math.min(2_147_483_647, Math.max(nextExpiry - Date.now(), 0) + 1));
    return () => clearTimeout(timer);
  }, [nextExpiry, timerNow]);

  if (result.status === "checking" || result.status === "none") return null;
  const open = (url: string) => {
    setFailed(false);
    void Linking.openURL(url).catch(() => setFailed(true));
  };
  return (
    <View testID="home-japan-weather-alert" style={[styles.card, { borderColor: theme.warm, backgroundColor: `${theme.warm}12` }]}>
      {visible.length ? (
        <>
          <Text accessibilityRole="header" style={[styles.label, { color: theme.text }]}>공식 기상특보</Text>
          {visible.map(alert => (
            <FeedbackPressable key={alert.id} accessibilityRole="link" onPress={() => open(alert.detailsUrl)} style={styles.link}>
              <RawText style={[styles.title, { color: theme.text }]}>{alert.description}</RawText>
              <RawText style={[styles.label, { color: theme.muted }]}>{alert.agency}</RawText>
              <Text style={[styles.label, { color: theme.text }]}>특보 원문 보기</Text>
            </FeedbackPressable>
          ))}
        </>
      ) : (
        <FeedbackPressable accessibilityRole="link" onPress={() => open(japanWeatherAgencyUrl)} style={styles.link}>
          <Text style={[styles.title, { color: theme.text }]}>일본 특보 확인 불가</Text>
          <Text style={[styles.label, { color: theme.text }]}>일본 기상청에서 확인</Text>
        </FeedbackPressable>
      )}
      {failed ? <Text accessibilityLiveRegion="polite" style={[styles.label, { color: theme.text }]}>링크를 열지 못했어요</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
  link: { minHeight: 44, justifyContent: "center", gap: 2, paddingVertical: 3 },
  title: { fontSize: 14, fontWeight: "700" },
  label: { fontSize: 12 },
});
