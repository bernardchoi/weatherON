import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

const weatherOptions = [
  { id: "clear", label: "맑음", icon: "☼" },
  { id: "cloud", label: "흐림", icon: "▬" },
  { id: "rain", label: "비", icon: "☔" },
  { id: "snow", label: "눈", icon: "＊" },
  { id: "wind", label: "강풍", icon: "≋" },
  { id: "storm", label: "천둥", icon: "↯" },
];

const reportRows = [
  { weather: "비", place: "합정동", time: "오후 2:41", status: "확정" },
  { weather: "맑음", place: "홍대입구", time: "오전 11:05", status: "확정" },
  { weather: "흐림", place: "신촌", time: "오전 9:30", status: "만료" },
];

export function WeatherReportHomeScreen({ state, onNavigate }: P0ScreenProps) {
  const weather = state.weather;
  return (
    <AppScreen title="날씨 제보 홈" subtitle={`${weather.locationName} · 주변 제보 실시간 표시`} badge="제보">
      <Section title="주변 날씨 제보" caption="반경 1km · 최근 30분" accent="warm">
        <View style={styles.reportCard}>
          <Text style={styles.kicker}>현장 주변 날씨 제보</Text>
          <View style={styles.reportChipRow}>
            <StatusPill label="비 2명" tone="warm" />
            <StatusPill label="흐림 1명" tone="gold" />
          </View>
          <Text style={styles.body}>미확정 3건 미충족 · 같은 제보가 쌓이면 홈 오버레이로 승급</Text>
        </View>
      </Section>

      <Section title="오늘 이 날씨엔" caption="제보와 추천이 같이 업데이트됨" accent="sky">
        <View style={styles.simpleCard}>
          <Text style={styles.title}>근처 인도어 카페 추천</Text>
          <Text style={styles.body}>주변 제보가 강수로 확정되면 우산·신발 추천도 함께 조정됨</Text>
        </View>
      </Section>

      <Section title="주변 제보" caption="v2.0 보조 참여 · 제보 버튼은 W2로 연결" accent="warm">
        <Text style={styles.body}>미확정 주변 제보 확인 · 제보는 3초 안에 완료</Text>
        <AppButton label="지금 날씨 제보하기" onPress={() => onNavigate("W2")} tone="warning" />
      </Section>
    </AppScreen>
  );
}

export function WeatherReportSubmitScreen({
  locationReady,
  accountLinked,
  permissionGateResult,
  onNavigate,
  onRequestPermissionGate,
  onRequireAccount,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const [selected, setSelected] = React.useState("rain");
  const reportLocationReady = locationReady || (permissionGateResult?.returnTo === "W2" && permissionGateResult.reason === "location");

  return (
    <AppScreen title="지금 날씨 어때요?" subtitle={reportLocationReady ? "위치 권한 정상 · 60분 후 자동 만료" : "위치 권한 필요 · O3에서 허용"} badge="제보">
      <View style={styles.segment}>
        <View style={[styles.segmentItem, { borderColor: theme.border, backgroundColor: reportLocationReady ? theme.cardMuted : theme.cardStrong }]}>
          <Text style={[styles.segmentText, { color: theme.text }]}>{reportLocationReady ? "위치 권한 정상" : "위치 권한 전"}</Text>
        </View>
        <View style={[styles.segmentItem, { borderColor: theme.border }]}>
          <Text style={[styles.segmentText, { color: theme.muted }]}>게스트 제보</Text>
        </View>
      </View>

      <View style={styles.optionGrid}>
        {weatherOptions.map((item) => {
          const active = selected === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setSelected(item.id)}
              style={[styles.optionCard, { backgroundColor: active ? theme.cardStrong : theme.cardMuted, borderColor: active ? theme.sky : theme.border }]}
            >
              <Text style={[styles.optionIcon, { color: active ? theme.sky : theme.subtle }]}>{item.icon}</Text>
              <Text style={[styles.optionLabel, { color: active ? theme.sky : theme.text }]}>{item.label}{active ? " · 선택" : ""}</Text>
            </Pressable>
          );
        })}
      </View>

      <AppButton
        label="제보하기"
        onPress={() => (reportLocationReady ? onNavigate("W3") : onRequestPermissionGate("location", "W2"))}
        tone="warning"
      />
      <Text style={[styles.footnote, { color: theme.subtle }]}>60분 후 자동 만료 · 언제든 취소 가능</Text>

      <Section title="제보" caption={`${reportLocationReady ? "GPS 제보 준비" : "선택 대기 · 위치 권한 전"} · 익명 제보 가능`} accent="warm">
        <View style={styles.actions}>
          <AppButton label="배지·이력 저장" onPress={() => (accountLinked ? onNavigate("W4") : onRequireAccount("weather-report", "W2"))} tone="secondary" />
          <AppButton label="닫기" onPress={() => onNavigate("W1")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

export function WeatherReportCompleteScreen({ onNavigate }: P0ScreenProps) {
  const theme = useAppTheme();
  return (
    <AppScreen title="제보 완료" subtitle="비 · 오후 2:41 · 합정동" badge="완료">
      <View style={styles.completeMark}>
        <Text style={[styles.check, { color: theme.clear }]}>✓</Text>
        <Text style={[styles.completeTitle, { color: theme.text }]}>제보 감사합니다!</Text>
        <Text style={[styles.body, { color: theme.muted }]}>확정됨 · 홈 오버레이 표시 중</Text>
      </View>

      <Section title="주변 제보 현황" caption="확정된 제보가 홈 화면에 반영됨" accent="clear">
        <View style={styles.simpleCard}>
          <StatusPill label="확정됨 - 반경 500m · 4건" tone="clear" />
          <Text style={styles.body}>"비" 제보 확정 · 홈 화면에 오버레이 표시 중</Text>
        </View>
      </Section>

      <Section title="배지 업데이트" caption="누적 확정 제보 12건" accent="warm">
        <View style={styles.simpleCard}>
          <StatusPill label="관측자 레벨 2" tone="warm" />
          <Text style={styles.body}>다음 레벨까지 38건 · 기상 리포터</Text>
        </View>
      </Section>

      <Section title="배지" caption="확정 제보 · 관측자 레벨 2 갱신" accent="sky">
        <Text style={styles.body}>제보 이력과 지역 랭킹에 반영됨</Text>
      </Section>

      <AppButton label="확인" onPress={() => onNavigate("W1")} tone="secondary" />
    </AppScreen>
  );
}

export function WeatherReportHistoryScreen({ onNavigate }: P0ScreenProps) {
  return (
    <AppScreen title="내 제보 이력" subtitle="제보 기록 · 확정률 · 지역 랭킹" badge="MY">
      <Section title="관측자 레벨 2" caption="지난달 활동 요약" accent="gold">
        <View style={styles.metricGrid}>
          <Metric label="이번달" value="37" />
          <Metric label="확정률" value="89%" />
          <Metric label="지역 랭킹" value="12위" />
        </View>
      </Section>

      <Section title="최근 제보" caption="확정·만료 상태" accent="clear">
        <View style={styles.historyCard}>
          {reportRows.map((row) => (
            <View key={`${row.weather}-${row.time}`} style={styles.historyRow}>
              <Text style={styles.historyWeather}>{row.weather}</Text>
              <Text style={styles.historyPlace}>{row.place}</Text>
              <Text style={styles.historyTime}>{row.time}</Text>
              <Text style={[styles.historyStatus, row.status === "확정" ? styles.historyGood : null]}>{row.status}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="내 제보가 맞았어요!" caption="어제 2:41 비 제보 → 기상청 데이터 일치" accent="clear">
        <Text style={styles.body}>제보 신뢰 점수와 관측자 레벨에 반영됨</Text>
      </Section>

      <Section title="이력" caption="제보 기록 · 확정률 · 지역 랭킹 · 마이에서 재진입" accent="warm">
        <AppButton label="MY로 돌아가기" onPress={() => onNavigate("M1")} tone="secondary" />
      </Section>
    </AppScreen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  reportCard: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,128,72,0.10)",
    borderLeftWidth: 3,
    borderLeftColor: "#ff8a42",
  },
  simpleCard: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  kicker: {
    color: "#ff8a42",
    fontSize: 12,
    fontWeight: "900",
  },
  title: {
    color: "#F8FBFF",
    fontSize: 16,
    fontWeight: "900",
  },
  body: {
    color: "rgba(215,230,245,0.82)",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "800",
  },
  reportChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  segment: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  segmentItem: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "900",
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  optionCard: {
    width: "31.5%",
    minHeight: 110,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  optionIcon: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  footnote: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  completeMark: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  check: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#67E8D0",
    textAlign: "center",
    lineHeight: 40,
    fontSize: 28,
    fontWeight: "900",
  },
  completeTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  metricGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  metric: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 70,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  metricValue: {
    color: "#F8FBFF",
    fontSize: 18,
    fontWeight: "900",
  },
  metricLabel: {
    color: "rgba(215,230,245,0.64)",
    fontSize: 11,
    fontWeight: "800",
  },
  historyCard: {
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  historyRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  historyWeather: {
    width: 34,
    color: "#F8FBFF",
    fontSize: 13,
    fontWeight: "900",
  },
  historyPlace: {
    flex: 1,
    color: "rgba(215,230,245,0.82)",
    fontSize: 12,
    fontWeight: "800",
  },
  historyTime: {
    width: 72,
    color: "rgba(215,230,245,0.64)",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
  },
  historyStatus: {
    width: 34,
    color: "rgba(215,230,245,0.64)",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
  },
  historyGood: {
    color: "#67E8D0",
  },
});
