import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "../localization/react-native";
import { uiIconAssets } from "../assets";
import { AppScreen } from "../components/AppScreen";
import { getRouteLabel } from "../navigation/routeLabels";
import type { AccountAuthStatus, AccountGateState } from "../state/useWeatherOnAppState";
import type { PolicyDocumentType } from "../state/appStateTypes";
import { useAppTheme } from "../theme/AppThemeContext";
import { pageStyles } from "../theme/pageStyles";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { radius, spacing, type AppTheme } from "../theme/tokens";

type TermsConsentScreenProps = {
  gate: AccountGateState | null;
  authStatus: AccountAuthStatus;
  authMessage: string | null;
  accepted: TermsConsentDraft;
  onDraftChange: (draft: TermsConsentDraft) => void;
  onOpenPolicyDocument: (type: PolicyDocumentType) => void;
  onComplete: (input: { marketingAccepted: boolean }) => Promise<void>;
  onCancel: () => void;
};

export type ConsentKey = "age" | "terms" | "privacy" | "location" | "marketing";
export type TermsConsentDraft = Record<ConsentKey, boolean>;

export const emptyTermsConsentDraft: TermsConsentDraft = {
  age: false,
  terms: false,
  privacy: false,
  location: false,
  marketing: false,
};

const consentItems: { key: ConsentKey; label: string; meta: string; required?: boolean }[] = [
  { key: "age", label: "만 14세 이상입니다", meta: "서비스 이용 가능 연령 확인", required: true },
  { key: "terms", label: "이용약관 동의", meta: "게스트·계정 연결·저장 기능 기준", required: true },
  { key: "privacy", label: "개인정보 수집·이용 동의", meta: "위치·목적지·앱 사용 데이터", required: true },
  { key: "location", label: "위치기반서비스 이용약관", meta: "현재 위치와 목적지 기반 안내", required: true },
  { key: "marketing", label: "마케팅 정보 수신 동의", meta: "선택 항목 · 언제든 철회 가능" },
];

export function TermsConsentScreen({ gate, authStatus, authMessage, accepted, onDraftChange, onOpenPolicyDocument, onComplete, onCancel }: TermsConsentScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const gateLabel = gate?.resumeLabel ?? "저장";
  const returnLabel = getRouteLabel(gate?.returnTo);
  const requiredItems = consentItems.filter((item) => item.required);
  const requiredCount = requiredItems.filter((item) => accepted[item.key]).length;
  const requiredAccepted = requiredCount === requiredItems.length;
  const totalAccepted = consentItems.filter((item) => accepted[item.key]).length;
  const allAccepted = totalAccepted === consentItems.length;
  const isSaving = authStatus === "saving-terms";

  const statusLabel = useMemo(() => {
    if (requiredAccepted) return "필수 항목이 준비됐어요";
    return `필수 ${requiredCount}/${requiredItems.length}`;
  }, [requiredAccepted, requiredCount, requiredItems.length]);

  const toggleItem = (key: ConsentKey) => {
    onDraftChange({ ...accepted, [key]: !accepted[key] });
  };

  const toggleAll = () => {
    const next = !allAccepted;
    onDraftChange({
      age: next,
      terms: next,
      privacy: next,
      location: next,
      marketing: next,
    });
  };

  return (
    <AppScreen
      title="약관 동의"
      subtitle="필수 항목만 동의하면 계속할 수 있어요"
      badge="필수"
      onBack={onCancel}
      compactHeader
      contentGap={layout.accountContentGap}
      contentPaddingTop={layout.weatherTopPadding}
    >
      <View style={[styles.progressCard, pageStyles.card, { padding: layout.accountPanelPadding, backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
        <View style={styles.copy}>
          <Text style={[styles.kicker, { color: theme.clear }]}>약관 상태</Text>
          <Text style={[styles.headline, { color: theme.text }]}>{statusLabel}</Text>
          <Text style={[styles.body, { color: theme.muted }]}>동의 후 저장·알림 설정으로 돌아가요</Text>
        </View>
        <View style={[styles.countBubble, { backgroundColor: theme.cardMuted }]}>
          <Text style={[styles.countText, { color: theme.clear }]}>{requiredCount}/{requiredItems.length}</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.cardMuted }]}>
          <View style={[styles.progressFill, { width: `${(requiredCount / requiredItems.length) * 100}%`, backgroundColor: theme.clear }]} />
        </View>
      </View>

      <Pressable
        accessibilityLabel={allAccepted ? "전체 동의 해제" : "전체 동의"}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: allAccepted }}
        onPress={toggleAll}
        style={({ pressed }) => [styles.allRow, pageStyles.card, { minHeight: layout.accountConsentRowMinHeight, padding: layout.accountPanelPadding, backgroundColor: theme.cardStrong, borderColor: theme.border, opacity: pressed ? 0.72 : 1 }]}
      >
        <CheckBox checked={allAccepted} theme={theme} />
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.text }]}>전체 동의</Text>
          <Text style={[styles.body, { color: theme.muted }]}>필수 4개와 선택 마케팅 1개를 함께 변경</Text>
        </View>
      </Pressable>

      <View style={[styles.listPanel, pageStyles.card, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
        {consentItems.map((item, index) => (
          <ConsentRow
            key={item.key}
            item={item}
            checked={accepted[item.key]}
            onPress={() => toggleItem(item.key)}
            onOpen={getConsentDocument(item.key) ? () => onOpenPolicyDocument(getConsentDocument(item.key)!) : undefined}
            minHeight={layout.accountConsentRowMinHeight}
            horizontalPadding={layout.accountPanelPadding}
            theme={theme}
            withDivider={index < consentItems.length - 1}
          />
        ))}
      </View>

      <View style={[styles.actionPanel, pageStyles.card, { padding: layout.accountPanelPadding, backgroundColor: theme.cardStrong, borderColor: requiredAccepted ? theme.clear : theme.border }]}>
        <View style={styles.actionCopy}>
          <Text style={[styles.gateTitle, pageStyles.sectionTitle, { color: requiredAccepted ? theme.clear : theme.gold }]}>{gateLabel}</Text>
          <Text style={[styles.body, pageStyles.caption, { color: theme.muted }]}>
            {gate?.selectedDestinationName ? `${gate.selectedDestinationName} 저장 후 ${returnLabel} 화면으로 돌아가요` : `${returnLabel} 화면으로 돌아가요`}
          </Text>
        </View>
        <Pressable
          accessibilityLabel={requiredAccepted ? "동의하고 계정 연결 계속" : "필수 동의 필요"}
          accessibilityRole="button"
          accessibilityState={{ busy: isSaving, disabled: !requiredAccepted || isSaving }}
          onPress={() => {
            if (requiredAccepted && !isSaving) void onComplete({ marketingAccepted: accepted.marketing });
          }}
          style={({ pressed }) => [styles.primaryButton, pageStyles.card, { borderWidth: 1, backgroundColor: requiredAccepted ? theme.gold : theme.cardMuted, borderColor: requiredAccepted ? theme.gold : theme.border, opacity: pressed ? 0.78 : 1 }]}
        >
          <Text style={[styles.primaryText, { color: requiredAccepted ? theme.onAccent : theme.subtle }]}>
            {isSaving ? "동의 저장 중" : requiredAccepted ? "동의하고 계속" : "필수 동의 필요"}
          </Text>
        </Pressable>
        {authMessage ? <Text accessibilityLiveRegion="polite" selectable style={[styles.body, { color: authStatus === "error" ? theme.alert : theme.muted }]}>{authMessage}</Text> : null}
        <Pressable accessibilityLabel="계정 연결 취소" accessibilityRole="button" onPress={onCancel} style={({ pressed }) => [styles.cancelButton, pageStyles.card, { borderColor: theme.border, borderWidth: 1, opacity: pressed ? 0.72 : 1 }]}>
          <Text style={[styles.cancelText, { color: theme.subtle }]}>취소</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

function ConsentRow({
  item,
  checked,
  onPress,
  onOpen,
  minHeight,
  horizontalPadding,
  theme,
  withDivider,
}: {
  item: (typeof consentItems)[number];
  checked: boolean;
  onPress: () => void;
  onOpen?: () => void;
  minHeight: number;
  horizontalPadding: number;
  theme: AppTheme;
  withDivider: boolean;
}) {
  return (
    <View
      style={[
        styles.consentRow,
        { minHeight, paddingHorizontal: horizontalPadding },
        withDivider ? { borderBottomColor: theme.border, borderBottomWidth: 1 } : null,
      ]}
    >
      <Pressable
        accessibilityLabel={`${item.label} ${checked ? "동의 해제" : "동의"}`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={onPress}
        style={({ pressed }) => [styles.consentToggle, { opacity: pressed ? 0.72 : 1 }]}
      >
        <CheckBox checked={checked} theme={theme} />
        <View style={styles.consentCopy}>
          <View style={styles.titleLine}>
            <Text style={[styles.requireLabel, { color: item.required ? theme.gold : theme.subtle }]}>{item.required ? "필수" : "선택"}</Text>
            <Text style={[styles.consentTitle, { color: theme.text }]}>{item.label}</Text>
          </View>
          <Text style={[styles.body, { color: theme.muted }]}>{item.meta}</Text>
        </View>
      </Pressable>
      {onOpen ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`${item.label} 내용 보기`} onPress={onOpen} style={styles.openButton}>
          <Text style={[styles.openText, { color: theme.sky }]}>내용 보기</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function getConsentDocument(key: ConsentKey): PolicyDocumentType | null {
  if (key === "terms") return "terms";
  if (key === "location") return "location";
  if (key === "privacy" || key === "marketing") return "privacy";
  return null;
}

function CheckBox({ checked, theme }: { checked: boolean; theme: AppTheme }) {
  return (
    <View style={[styles.checkbox, { borderColor: checked ? theme.gold : theme.border, backgroundColor: checked ? theme.gold : theme.cardMuted }]}>
      <Image
        source={uiIconAssets.check}
        style={[styles.check, { tintColor: checked ? theme.onAccent : "transparent" }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  kicker: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  headline: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },
  body: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  countBubble: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    minWidth: 48,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  countText: {
    fontSize: 13,
    fontWeight: "900",
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
  },
  allRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  listPanel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  consentToggle: { flex: 1, minHeight: 48, flexDirection: "row", alignItems: "center", gap: spacing.md },
  checkbox: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  check: {
    width: 16,
    height: 16,
  },
  consentCopy: {
    flex: 1,
    gap: 4,
  },
  openButton: { minWidth: 64, minHeight: 44, alignItems: "center", justifyContent: "center", paddingLeft: spacing.sm },
  openText: { fontSize: 12, lineHeight: 17, fontWeight: "900" },
  titleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  requireLabel: {
    width: 28,
    fontSize: 11,
    fontWeight: "900",
  },
  consentTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  chevron: {
    fontSize: 20,
    fontWeight: "800",
  },
  actionPanel: {
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderLeftWidth: 2,
  },
  actionCopy: {
    gap: 4,
  },
  primaryButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  primaryText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  cancelButton: {
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  gateBox: {
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  gateTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
