import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import { getRouteLabel } from "../navigation/routeLabels";
import type { PermissionGateState } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

type PermissionGateScreenProps = {
  gate: PermissionGateState | null;
  locationReady: boolean;
  permissionReady: boolean;
  onComplete: () => void;
  onCancel: () => void;
};

export function PermissionGateScreen({ gate, locationReady, permissionReady, onComplete, onCancel }: PermissionGateScreenProps) {
  const theme = useAppTheme();
  const gateLabel = gate?.resumeLabel ?? "알림 권한";
  const isLocationGate = gate?.reason === "location";
  const isNotificationGate = gate?.reason === "notification";
  const isAccountSetupGate = gate?.reason === "account-setup";
  const returnLabel = getRouteLabel(gate?.returnTo);
  const isDestinationCareGate = gate?.reason === "destination-care";
  const gateReady = isLocationGate ? locationReady : permissionReady;
  const screenTitle = isAccountSetupGate ? "권한은 따로 설정해요" : isDestinationCareGate ? "목적지는 먼저 저장할 수 있어요" : "필요한 권한만 먼저 허용해 주세요";
  const screenSubtitle = isAccountSetupGate ? "계정 연결과 별도 · 나중에 변경 가능" : isDestinationCareGate ? "알림은 나중에 켜도 출발 탭에서 비교 가능" : "설정 후 원래 화면으로 돌아감";
  const statusLabel = isDestinationCareGate ? (permissionReady ? "알림 켜짐" : "저장 가능") : gateReady ? "허용됨" : "대기";
  const primaryLabel = isLocationGate ? "위치 권한 허용" : permissionReady ? "알림 설정으로 돌아가기" : "알림 권한 허용";
  const resultCards = buildResultCards({
    isAccountSetupGate,
    isLocationGate,
    isNotificationGate,
    isDestinationCareGate,
    locationReady,
    permissionReady,
  });

  return (
    <AppScreen title={screenTitle} subtitle={screenSubtitle} badge="권한">
      <View style={[styles.actionPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
        <View style={styles.actionHeader}>
          <View style={styles.copy}>
            <Text style={[styles.actionTitle, { color: theme.text }]}>{gateLabel}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>
              {isAccountSetupGate
                ? "저장·동기화와 무관한 선택 권한"
                : isDestinationCareGate
                  ? "알림 권한은 선택 사항이에요. 목적지는 출발 탭에 먼저 저장돼요"
                  : `${returnLabel} 화면으로 돌아가 설정을 이어가요`}
            </Text>
          </View>
          <StatusPill label={statusLabel} tone={isDestinationCareGate || gateReady ? "clear" : "gold"} />
        </View>
        {gate?.selectedDestinationName ? <Text style={[styles.stateCopy, { color: theme.muted }]}>선택 목적지 유지 · {gate.selectedDestinationName}</Text> : null}
        <View style={styles.actions}>
          <AppButton label={primaryLabel} onPress={onComplete} />
          <AppButton
            label={isDestinationCareGate ? "알림 없이 저장" : "나중에 설정"}
            accessibilityLabel={isDestinationCareGate ? "알림 권한 없이 목적지 저장" : "권한 나중에 설정"}
            onPress={onCancel}
            tone="secondary"
          />
        </View>
      </View>

      <Section
        title={isDestinationCareGate ? "저장 후 사용" : isAccountSetupGate ? "준비 항목" : "필요 권한"}
        caption={isDestinationCareGate ? "출발 탭으로 돌아가기 전 확인" : isAccountSetupGate ? "계정 설정과 분리됨" : `${returnLabel} 화면으로 돌아가기 전 확인`}
        accent="gold"
      >
        {isDestinationCareGate ? (
          <>
            <PermissionCard
              title="목적지 저장"
              body="선택한 목적지를 출발 탭에 추가함"
              mark="저장"
              active
              ready
            />
            <PermissionCard
              title="출발 알림"
              body="비·출발 시간 알림은 권한 허용 후 켜짐"
              mark="알림"
              active
              ready={permissionReady}
            />
          </>
        ) : (
          <>
            {isLocationGate ? (
              <PermissionCard
                title="위치 권한"
                body="현재 위치 날씨 기준"
                mark="위치"
                active
                ready={locationReady}
              />
            ) : null}
            {isNotificationGate || isAccountSetupGate || !isLocationGate ? (
              <PermissionCard
                title="알림 권한"
                body="강수·출발 알림 수신"
                mark="알림"
                active
                ready={permissionReady}
              />
            ) : null}
          </>
        )}
        <View style={[styles.stateBox, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
          <View style={styles.stateHeader}>
            <Text style={[styles.stateTitle, { color: theme.gold }]}>{isDestinationCareGate ? "저장 상태" : "권한 상태"}</Text>
            <StatusPill label={statusLabel} tone={isDestinationCareGate || gateReady ? "clear" : "gold"} />
          </View>
          <Text style={[styles.stateCopy, { color: theme.muted }]}>
            {isDestinationCareGate
              ? "알림 없이 저장해도 목적지 비교와 출발 시간은 바로 사용할 수 있음"
              : isAccountSetupGate
                ? "나중에 해도 홈과 목적지 비교는 사용 가능"
                : "허용하지 않아도 다음 단계 진행 가능"}
          </Text>
          {gate?.selectedDestinationName ? <Text style={[styles.stateCopy, { color: theme.muted }]}>선택 목적지 유지 · {gate.selectedDestinationName}</Text> : null}
        </View>
        {resultCards.length > 0 ? (
          <View style={styles.resultGrid}>
            {resultCards.map((card) => (
              <ResultCard key={card.title} title={card.title} body={card.body} tone={card.tone} />
            ))}
          </View>
        ) : null}
      </Section>
    </AppScreen>
  );
}

function buildResultCards({
  isAccountSetupGate,
  isLocationGate,
  isNotificationGate,
  isDestinationCareGate,
  locationReady,
  permissionReady,
}: {
  isAccountSetupGate: boolean;
  isLocationGate: boolean;
  isNotificationGate: boolean;
  isDestinationCareGate: boolean;
  locationReady: boolean;
  permissionReady: boolean;
}) {
  const cards: { title: string; body: string; tone: "clear" | "sky" }[] = [];
  if ((isAccountSetupGate || isLocationGate) && locationReady) {
    cards.push({
      title: "현재 위치 기준 홈 반영됨",
      body: "홈 날씨와 출발 판단이 현재 위치 기준으로 갱신됨",
      tone: "clear",
    });
  }
  if ((isAccountSetupGate || isNotificationGate || isDestinationCareGate) && permissionReady) {
    cards.push({
      title: "비 알림 받을 수 있음",
      body: "강수·출발 알림을 받을 준비가 끝남",
      tone: "sky",
    });
  }
  return cards;
}

function ResultCard({ title, body, tone }: { title: string; body: string; tone: "clear" | "sky" }) {
  const theme = useAppTheme();
  const color = tone === "clear" ? theme.clear : theme.sky;
  return (
    <View style={[styles.resultCard, { backgroundColor: theme.card, borderColor: `${color}66` }]}>
      <View style={[styles.resultDot, { backgroundColor: color }]} />
      <View style={styles.copy}>
        <Text style={[styles.resultTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.resultBody, { color: theme.muted }]}>{body}</Text>
      </View>
    </View>
  );
}

function PermissionCard({ title, body, mark, active, ready }: { title: string; body: string; mark: string; active: boolean; ready: boolean }) {
  const theme = useAppTheme();
  return (
    <View style={[styles.permissionCard, { backgroundColor: theme.card, borderColor: active ? theme.sky : theme.gold }]}>
      <View style={[styles.iconBox, { backgroundColor: active ? theme.sky : theme.cardMuted }]}>
        <Text style={[styles.iconText, { color: active ? theme.onAccent : theme.gold }]}>{mark}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.meta, { color: theme.muted }]}>{body}</Text>
      </View>
      <StatusPill label={ready ? "허용됨" : active ? "허용" : "대기"} tone={ready ? "clear" : active ? "gold" : "sky"} />
    </View>
  );
}

const styles = StyleSheet.create({
  actionPanel: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  actionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  actionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  stepRail: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  stepRailText: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  stepRailDivider: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "900",
  },
  permissionCard: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  iconBox: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  iconText: {
    fontSize: 12,
    fontWeight: "900",
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
  },
  meta: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  stateBox: {
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  stateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  stateTitle: {
    fontSize: 14,
    fontWeight: "900",
  },
  stateCopy: {
    fontSize: 12,
    lineHeight: 18,
  },
  resultGrid: {
    gap: spacing.sm,
  },
  resultCard: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  resultDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  resultTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  resultBody: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
