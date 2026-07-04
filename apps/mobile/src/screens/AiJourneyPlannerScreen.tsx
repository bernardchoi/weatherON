import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

const weatherChecks = [
  { day: "1일차", date: "7/5", weather: "맑음", temp: "28°", result: "출발 최적", tone: "clear" },
  { day: "3일차", date: "7/7", weather: "비", temp: "24°", result: "우비 필수 · 단축 권장", tone: "warm" },
  { day: "7일차", date: "7/11", weather: "폭우", temp: "22°", result: "일정 조정 권고", tone: "alert" },
];

const checklist = ["반팔 5벌", "긴팔 2벌", "우비", "방수 등산화"];

export function AiJourneyPlannerScreen({ permissionReady, permissionGateResult, onNavigate, onRequestPermissionGate }: P0ScreenProps) {
  const theme = useAppTheme();
  const returnedFromPermission = permissionGateResult?.returnTo === "G5" && permissionGateResult.reason === "destination-care";
  const [saved, setSaved] = useState(returnedFromPermission && permissionReady);
  const [shared, setShared] = useState(false);

  const planStatus = useMemo(() => {
    if (saved && shared) return "저장됨 · 공유 준비";
    if (saved) return "저장됨";
    if (shared) return "공유 준비";
    return "저장/공유 대기";
  }, [saved, shared]);

  const handleSave = () => {
    if (!permissionReady) {
      onRequestPermissionGate("destination-care", "G5", "destination");
      return;
    }
    setSaved(true);
  };

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => onNavigate("G3")} style={[styles.backButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <BackGlyph color={theme.subtle} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>AI 종주 플래너</Text>
          <View style={[styles.premiumTag, { backgroundColor: `${theme.sky}18`, borderColor: theme.sky }]}>
            <Text style={[styles.premiumText, { color: theme.sky }]}>프리미엄</Text>
          </View>
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardLabel, { color: theme.text }]}>여정 설정</Text>
          <View style={styles.routeRow}>
            <InputBox label="서울" theme={theme} />
            <ArrowGlyph color={theme.subtle} />
            <InputBox label="부산" theme={theme} />
          </View>
          <View style={styles.routeRow}>
            <InputBox label="7/5" theme={theme} wide />
            <InputBox label="10일" theme={theme} compact />
          </View>
        </View>

        <View style={[styles.conditionCard, { backgroundColor: theme.card, borderLeftColor: theme.warm }]}>
          <View style={styles.conditionCopy}>
            <Text style={[styles.conditionLabel, { color: theme.warm }]}>여정 조건</Text>
            <Text style={[styles.conditionText, { color: theme.text }]}>프리미엄 활성 · {permissionReady ? "알림 권한 허용" : "알림 권한 필요"} · {planStatus}</Text>
          </View>
          <View style={[styles.statePill, { backgroundColor: theme.cardStrong }]}>
            <Text style={[styles.statePillText, { color: permissionReady ? theme.clear : theme.sky }]}>{permissionReady ? "권한 허용" : "권한 필요"}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => (permissionReady ? setSaved((current) => current) : onRequestPermissionGate("destination-care", "G5", "destination"))}
          style={[styles.permissionCard, { backgroundColor: theme.cardStrong, borderColor: permissionReady ? theme.clear : theme.warm }]}
        >
          <View style={styles.conditionCopy}>
            <Text style={[styles.permissionLabel, { color: permissionReady ? theme.clear : theme.warm }]}>{permissionReady ? "재분석 알림 ON" : "알림 권한 필요"}</Text>
            <Text style={[styles.permissionText, { color: theme.subtle }]}>{permissionReady ? "예보 변동 시 AI 플랜을 자동 재점검" : "저장·재분석 알림 전 권한 확인 필요"}</Text>
          </View>
          <View style={[styles.permissionButton, { backgroundColor: permissionReady ? `${theme.clear}18` : theme.gold }]}>
            <Text style={[styles.permissionButtonText, { color: permissionReady ? theme.clear : theme.onAccent }]}>{permissionReady ? "완료" : "권한 확인"}</Text>
          </View>
        </Pressable>

        <View style={[styles.resultCard, { backgroundColor: theme.card, borderLeftColor: theme.sky }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>날씨 기반 일정 점검</Text>
          <View style={styles.resultRows}>
            {weatherChecks.map((item) => (
              <View key={item.day} style={styles.resultRow}>
                <Text style={[styles.resultDay, { color: theme.text }]}>{item.day}</Text>
                <Text style={[styles.resultDate, { color: theme.subtle }]}>{item.date}</Text>
                <Text style={[styles.resultWeather, { color: theme.text }]}>{item.weather}</Text>
                <Text style={[styles.resultTemp, { color: theme.text }]}>{item.temp}</Text>
                <Text style={[styles.resultText, { color: getResultColor(item.tone, theme) }]} numberOfLines={1}>{item.result}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.checklistCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>짐 체크리스트</Text>
          <View style={styles.checkGrid}>
            {checklist.map((item) => (
              <View key={item} style={styles.checkItem}>
                <CheckGlyph color={theme.clear} />
                <Text style={[styles.checkText, { color: theme.text }]}>{item}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.checkSub, { color: theme.subtle }]}>선크림 · 보조배터리 · 압박 스타킹 추가 추천</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={handleSave}
            onPressIn={handleSave}
            {...({ onClick: handleSave } as object)}
            style={[styles.primaryAction, { backgroundColor: saved ? theme.clear : theme.gold }]}
          >
            <Text onPress={handleSave} style={[styles.primaryActionText, { color: saved ? theme.onAccent : theme.onAccent }]}>{saved ? "저장됨" : "AI 플랜 저장"}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShared(true)}
            onPressIn={() => setShared(true)}
            {...({ onClick: () => setShared(true) } as object)}
            style={[styles.secondaryAction, { backgroundColor: shared ? `${theme.clear}18` : theme.cardStrong }]}
          >
            <Text onPress={() => setShared(true)} style={[styles.secondaryActionText, { color: shared ? theme.clear : theme.text }]}>{shared ? "공유 준비됨" : "여정 공유"}</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function InputBox({ label, theme, compact, wide }: { label: string; theme: AppTheme; compact?: boolean; wide?: boolean }) {
  return (
    <View style={[styles.inputBox, compact ? styles.inputCompact : wide ? styles.inputWide : null, { backgroundColor: theme.cardStrong }]}>
      <Text style={[styles.inputText, { color: theme.text }]}>{label}</Text>
    </View>
  );
}

function getResultColor(tone: string, theme: AppTheme) {
  if (tone === "clear") return theme.clear;
  if (tone === "alert") return theme.alert;
  return theme.warm;
}

function BackGlyph({ color }: { color: string }) {
  return (
    <View style={styles.backGlyph} accessibilityElementsHidden>
      <View style={[styles.backLineTop, { backgroundColor: color }]} />
      <View style={[styles.backLineBottom, { backgroundColor: color }]} />
    </View>
  );
}

function ArrowGlyph({ color }: { color: string }) {
  return (
    <View style={styles.arrowGlyph} accessibilityElementsHidden>
      <View style={[styles.arrowLine, { backgroundColor: color }]} />
      <View style={[styles.arrowTop, { backgroundColor: color }]} />
      <View style={[styles.arrowBottom, { backgroundColor: color }]} />
    </View>
  );
}

function CheckGlyph({ color }: { color: string }) {
  return (
    <View style={styles.checkGlyph} accessibilityElementsHidden>
      <View style={[styles.checkLineOne, { backgroundColor: color }]} />
      <View style={[styles.checkLineTwo, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: 8,
    minHeight: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 176,
  },
  atmosphere: {
    position: "absolute",
    left: -36,
    right: -36,
    bottom: -118,
    height: 330,
    opacity: 0.78,
    borderTopLeftRadius: 170,
    borderTopRightRadius: 170,
  },
  header: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  backGlyph: {
    width: 14,
    height: 16,
  },
  backLineTop: {
    position: "absolute",
    left: 2,
    top: 4,
    width: 10,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "-42deg" }],
  },
  backLineBottom: {
    position: "absolute",
    left: 2,
    bottom: 4,
    width: 10,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "42deg" }],
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: 0,
  },
  premiumTag: {
    minHeight: 24,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  premiumText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  formCard: {
    gap: spacing.sm,
    minHeight: 124,
    padding: 14,
    borderRadius: radius.lg,
  },
  cardLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  routeRow: {
    minHeight: 35,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  inputBox: {
    flex: 1,
    minHeight: 35,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  inputWide: {
    flex: 1.9,
  },
  inputCompact: {
    flex: 0.8,
  },
  inputText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  arrowGlyph: {
    width: 14,
    height: 14,
  },
  arrowLine: {
    position: "absolute",
    left: 0,
    top: 6,
    width: 13,
    height: 1.5,
    borderRadius: 2,
  },
  arrowTop: {
    position: "absolute",
    right: 1,
    top: 3,
    width: 6,
    height: 1.5,
    borderRadius: 2,
    transform: [{ rotate: "42deg" }],
  },
  arrowBottom: {
    position: "absolute",
    right: 1,
    bottom: 3,
    width: 6,
    height: 1.5,
    borderRadius: 2,
    transform: [{ rotate: "-42deg" }],
  },
  conditionCard: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 12,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
  },
  conditionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  conditionLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  conditionText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
  },
  statePill: {
    minWidth: 64,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  statePillText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  permissionCard: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  permissionLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  permissionText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
  },
  permissionButton: {
    minWidth: 68,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  permissionButtonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  resultCard: {
    gap: spacing.md,
    minHeight: 124,
    padding: 14,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
  },
  sectionTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  resultRows: {
    gap: 7,
  },
  resultRow: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  resultDay: {
    width: 43,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  resultDate: {
    width: 34,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
  },
  resultWeather: {
    width: 31,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  resultTemp: {
    width: 28,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
  },
  resultText: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  checklistCard: {
    gap: spacing.sm,
    minHeight: 122,
    padding: 14,
    borderRadius: radius.lg,
  },
  checkGrid: {
    gap: 6,
  },
  checkItem: {
    minHeight: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkGlyph: {
    width: 12,
    height: 10,
  },
  checkLineOne: {
    position: "absolute",
    left: 0,
    top: 5,
    width: 5,
    height: 1.7,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  checkLineTwo: {
    position: "absolute",
    right: 0,
    top: 4,
    width: 9,
    height: 1.7,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }],
  },
  checkText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  checkSub: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  primaryAction: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
  },
  primaryActionText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  secondaryActionText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  bottomSpacer: {
    height: 64,
  },
});
