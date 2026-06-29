import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { brandAssets } from "../assets";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

const companions = [
  { name: "태양", label: "대표", tone: "gold" as const },
  { name: "비", label: "동행", tone: "sky" as const },
  { name: "안개", label: "레벨 7", tone: "clear" as const },
];

export function SocialOnboardingScreen({ onNavigate }: P0ScreenProps) {
  const theme = useAppTheme();
  return (
    <AppScreen title="온스퀘어 입장" subtitle="대표 마스코트와 원소 컴패니언을 만나보세요" badge="입장">
      <Section title="원소 컴패니언을 만나보세요" caption="날씨 체크인으로 작은 친구를 수집할 수 있음" accent="gold">
        <View style={styles.elementGrid}>
          {["태양", "비", "폭풍", "바람", "서리", "안개"].map((item) => (
            <View key={item} style={[styles.elementCard, { backgroundColor: item === "안개" ? theme.card : theme.cardMuted, borderColor: item === "안개" ? theme.muted : theme.border }]}>
              <Text style={[styles.elementIcon, { color: item === "안개" ? theme.text : theme.gold }]}>{item.slice(0, 1)}</Text>
              <Text style={[styles.elementText, { color: theme.text }]}>{item}</Text>
            </View>
          ))}
        </View>
      </Section>

      <View style={[styles.startPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
        <View style={styles.mascotBlock}>
          <Image source={brandAssets.iconPrimary} style={styles.bigMascot} resizeMode="contain" />
          <Text style={[styles.kicker, { color: theme.gold }]}>대표로 시작</Text>
        </View>
        <Text style={[styles.plus, { color: theme.subtle }]}>+</Text>
        <View style={styles.mascotBlock}>
          <View style={[styles.companionOrb, { backgroundColor: theme.cardMuted, borderColor: theme.sky }]}>
            <Text style={[styles.orbText, { color: theme.sky }]}>안개</Text>
          </View>
          <Text style={[styles.body, { color: theme.muted }]}>안개 수집 가능</Text>
        </View>
      </View>

      <Section title="온스퀘어" caption="최초 진입 · 대표 마스코트 즉시 부여 · 안개 컴패니언 미리보기 선택 중" accent="sky">
        <AppButton label="대표 마스코트로 온스퀘어 시작" onPress={() => onNavigate("S1")} tone="warning" />
      </Section>
    </AppScreen>
  );
}

export function SocialScreen({ accountLinked, onNavigate, onRequireAccount }: P0ScreenProps) {
  const theme = useAppTheme();
  return (
    <AppScreen title="내 온스퀘어" subtitle="체크인·노트·리액션으로 오늘 날씨를 기록" badge="포인트 340">
      <View style={[styles.heroCard, { backgroundColor: theme.cardStrong, borderColor: theme.gold }]}>
        <Image source={brandAssets.iconPrimary} style={styles.heroMascot} resizeMode="contain" />
        <View style={styles.copy}>
          <Text style={[styles.kicker, { color: theme.gold }]}>내 대표</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>WeatherON 대표 마스코트</Text>
          <Text style={[styles.body, { color: theme.muted }]}>모든 날씨를 함께 경험하는 나의 기본 캐릭터</Text>
        </View>
      </View>

      <View style={[styles.companionPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
        <View style={[styles.companionAvatar, { backgroundColor: theme.cardMuted, borderColor: theme.sky }]}>
          <Text style={[styles.orbText, { color: theme.sky }]}>안개</Text>
        </View>
        <View style={styles.copy}>
          <View style={styles.rowBetween}>
            <Text style={[styles.title, { color: theme.text }]}>오늘의 동행 · 안개 레벨 7</Text>
            <StatusPill label="안개" tone="sky" />
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.cardMuted }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.sky }]} />
          </View>
          <Text style={[styles.body, { color: theme.muted }]}>경험치 340 / 500</Text>
        </View>
      </View>

      <Section title="오늘 날씨 체크인 완료" caption="안개 경험치 +20 적립" accent="clear">
        <Text style={[styles.body, { color: theme.muted }]}>체크인 완료 · 안개 동행 활성 · 날씨 노트와 리액션 진입 가능</Text>
      </Section>

      <View style={styles.actions}>
        <AppButton label="날씨 노트" onPress={() => onNavigate("S2")} tone="secondary" />
        <AppButton label="날씨 리액션" onPress={() => onNavigate("S3")} tone="secondary" />
        <AppButton label="시작 화면" onPress={() => onNavigate("S0")} tone="secondary" />
      </View>

      <Section title="선물" caption="희귀 기상 이벤트 배지 드랍 영역" accent="gold">
        <View style={styles.companionGrid}>
          {companions.map((item) => (
            <View key={item.name} style={[styles.smallCompanion, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
              <Text style={[styles.elementText, { color: theme.text }]}>{item.name}</Text>
              <StatusPill label={item.label} tone={item.tone} />
            </View>
          ))}
        </View>
        {!accountLinked ? (
          <AppButton label="체크인 저장" onPress={() => onRequireAccount("social-note", "S1")} tone="warning" />
        ) : null}
      </Section>
    </AppScreen>
  );
}

export function WeatherNoteScreen({ accountLinked, permissionGateResult, onNavigate, onRequireAccount, onRequestPermissionGate }: P0ScreenProps) {
  const theme = useAppTheme();
  const locationReadyForNote = permissionGateResult?.returnTo === "S2" && permissionGateResult.reason === "location";
  return (
    <AppScreen title="날씨 노트" subtitle="ON Square 도시 맵 · 실황 핀 6건" badge="노트">
      <View style={[styles.mapPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
        {[16, 28, 46, 62, 78].map((left, index) => (
          <View key={left} style={[styles.mapPin, { left: `${left}%`, top: `${26 + (index % 3) * 18}%`, backgroundColor: theme.gold, borderColor: theme.card }]} />
        ))}
        <Text style={[styles.mapMeta, { color: theme.subtle }]}>실행 핀 6건</Text>
      </View>

      <Section title="핀 미리보기 - 서울 종로" caption="3분 전 · 도움됨 12" accent="sky">
        <View style={[styles.noteCard, { backgroundColor: theme.cardStrong }]}>
          <Text style={[styles.title, { color: theme.text }]}>우산 필수, 빗줄기 강함</Text>
          <Text style={[styles.body, { color: theme.muted }]}>게스트 읽기 가능 · 위치 제보는 권한 필요</Text>
        </View>
      </Section>

      <View style={styles.actions}>
        <AppButton label="핀 작성" onPress={() => (accountLinked ? onNavigate("S2") : onRequireAccount("social-note", "S2"))} tone="secondary" />
        <AppButton label={locationReadyForNote ? "위치 제보 준비됨" : "내 위치 제보"} onPress={() => (locationReadyForNote ? onNavigate("W2") : onRequestPermissionGate("location", "S2"))} tone="warning" />
      </View>

      <Section title="노트" caption={locationReadyForNote ? "위치 제보 준비 · W2와 연계" : "읽는 중 · 게스트 읽기 가능 · 위치 제보는 권한 필요"} accent="clear">
        <Text style={[styles.body, { color: theme.muted }]}>핀은 GPS로 자동 태그되고 24시간 후 만료됨</Text>
      </Section>
    </AppScreen>
  );
}

export function WeatherReactionScreen({ accountLinked, onNavigate, onRequireAccount }: P0ScreenProps) {
  const theme = useAppTheme();
  return (
    <AppScreen title="날씨 리액션" subtitle="익명 집계로 같은 날씨를 보는 사람 확인" badge="리액션">
      <View style={[styles.reactionHero, { backgroundColor: theme.cardStrong, borderColor: theme.sky }]}>
        <Text style={[styles.reactionIcon, { color: theme.sky }]}>우산</Text>
        <Text style={[styles.kicker, { color: theme.muted }]}>현재 날씨 · 서울 · 폭우</Text>
        <Text style={[styles.heroTitle, { color: theme.text }]}>다들 고생중</Text>
        <Text style={[styles.body, { color: theme.sky }]}>리액션 활성화 중</Text>
      </View>

      <View style={[styles.countStrip, { backgroundColor: theme.cardStrong }]}>
        <Text style={[styles.countText, { color: theme.text }]}>이 도시 1,247명이 같은 날씨 중</Text>
      </View>

      <View style={styles.actions}>
        <AppButton label="공감하기" onPress={() => (accountLinked ? onNavigate("S3") : onRequireAccount("social-note", "S3"))} />
        <AppButton label="다른 도시 보기" onPress={() => onNavigate("G1")} tone="secondary" />
      </View>

      <Section title="도시별 현황" caption="익명 집계 · 개인 식별 없이 표시" accent="sky">
        {[
          ["서울", "1,247명"],
          ["부산", "532명"],
          ["대구", "188명"],
        ].map(([city, count]) => (
          <View key={city} style={[styles.cityRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.cityName, { color: city === "서울" ? theme.text : theme.muted }]}>{city}</Text>
            <Text style={[styles.cityCount, { color: city === "서울" ? theme.sky : theme.subtle }]}>{count}</Text>
          </View>
        ))}
      </Section>

      <Section title="리액션" caption="서울 선택 · 공감 전 · 익명 집계만 표시" accent="clear">
        <Text style={[styles.body, { color: theme.muted }]}>리액션은 날씨 맥락 안에서만 노출됨</Text>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  elementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  elementCard: {
    width: "31.5%",
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  elementIcon: {
    fontSize: 18,
    fontWeight: "900",
  },
  elementText: {
    fontSize: 13,
    fontWeight: "900",
  },
  startPanel: {
    minHeight: 160,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  mascotBlock: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
  },
  bigMascot: {
    width: 96,
    height: 96,
  },
  plus: {
    fontSize: 24,
    fontWeight: "900",
  },
  companionOrb: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  orbText: {
    fontSize: 13,
    fontWeight: "900",
  },
  heroCard: {
    minHeight: 186,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
  },
  heroMascot: {
    width: 116,
    height: 116,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "900",
  },
  heroTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
  },
  companionPanel: {
    minHeight: 94,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  companionAvatar: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  progressFill: {
    width: "68%",
    height: "100%",
    borderRadius: radius.pill,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  companionGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  smallCompanion: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  mapPanel: {
    height: 176,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  mapPin: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  mapMeta: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.sm,
    fontSize: 11,
    fontWeight: "800",
  },
  noteCard: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  reactionHero: {
    minHeight: 148,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
  },
  reactionIcon: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "900",
  },
  countStrip: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
  },
  countText: {
    fontSize: 17,
    fontWeight: "900",
  },
  cityRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderBottomWidth: 1,
  },
  cityName: {
    fontSize: 14,
    fontWeight: "900",
  },
  cityCount: {
    fontSize: 12,
    fontWeight: "900",
  },
});
