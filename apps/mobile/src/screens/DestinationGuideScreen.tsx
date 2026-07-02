import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { placeImageAssets } from "../assets";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";
import { formatTemperature } from "../utils/units";

export function DestinationGuideScreen({ state, selectedDestinationPlace, destinationCareEnabled, temperatureUnit, onNavigate }: P0ScreenProps) {
  const theme = useAppTheme();
  const care = state.destinationCare;
  const placeImage = getPlaceImage(selectedDestinationPlace.category);
  const placeName = selectedDestinationPlace.name;
  const categoryLabel = getCategoryLabel(selectedDestinationPlace.category);
  const guide = getGuideCopy(selectedDestinationPlace.category);
  const weatherDisplay = getWeatherDisplay(selectedDestinationPlace.category, care, placeName, temperatureUnit);

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            onPress={() => onNavigate("P3")}
            style={[styles.backButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
          >
            <BackGlyph color={theme.subtle} />
          </Pressable>
          <View style={styles.headerCopy}>
            <View style={styles.titleRow}>
              <CategoryBadge color={theme.muted} />
              <Text style={[styles.title, { color: theme.text }]}>목적지 · {placeName}</Text>
            </View>
            <Text style={[styles.subtitle, { color: theme.subtle }]}>등록 목적지 기반 준비 가이드</Text>
          </View>
        </View>

        <View style={[styles.heroImageWrap, { backgroundColor: theme.cardStrong }]}>
          <Image source={placeImage} style={styles.heroImage} resizeMode="cover" />
        </View>

        <View style={[styles.guideState, { backgroundColor: theme.cardStrong, borderColor: "rgba(103,232,208,0.42)" }]}>
          <View style={styles.guideStateTop}>
            <Text style={[styles.eyebrow, { color: theme.clear }]}>GUIDE</Text>
            <View style={[styles.readyPill, { backgroundColor: "#122948" }]}>
              <Text style={[styles.readyText, { color: theme.gold }]}>{destinationCareEnabled ? "준비됨" : "게스트"}</Text>
            </View>
          </View>
          <Text style={[styles.guideStateText, { color: theme.text }]}>
            {placeName} 기준 준비 가이드 · 케어 상세와 필터 목록으로 이동 가능
          </Text>
        </View>

        <View style={styles.weatherCompare}>
          <WeatherTile
            label={weatherDisplay.originLabel}
            temp={weatherDisplay.originTemp}
            meta={weatherDisplay.originMeta}
            color={theme.text}
            muted={theme.muted}
            subtle={theme.subtle}
            background={theme.cardStrong}
          />
          <WeatherTile
            label={weatherDisplay.destinationLabel}
            temp={weatherDisplay.destinationTemp}
            meta={weatherDisplay.destinationMeta}
            color={theme.text}
            muted={theme.muted}
            subtle={theme.subtle}
            background={theme.cardStrong}
          />
        </View>

        <View style={[styles.guideCard, { backgroundColor: theme.cardStrong, borderColor: "rgba(103,232,208,0.34)" }]}>
          <View style={styles.guideHead}>
            <View style={styles.guideHeadCopy}>
              <Text style={[styles.sectionLabel, { color: theme.muted }]}>{categoryLabel} 준비 가이드</Text>
              <Text style={[styles.guideTitle, { color: theme.text }]}>{guide.title}</Text>
            </View>
            <View style={[styles.autoPill, { backgroundColor: "rgba(103,232,208,0.12)" }]}>
              <Text style={[styles.autoText, { color: theme.clear }]}>자동 케어 확장</Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <View style={[styles.metricPill, { backgroundColor: "rgba(103,232,208,0.16)" }]}>
              <Text style={[styles.metricText, { color: theme.clear }]}>{guide.risk}</Text>
            </View>
            <Text style={[styles.metricSide, { color: theme.subtle }]}>{guide.mode}</Text>
          </View>

          <View style={styles.sunRow}>
            <SunGlyph color={theme.gold} />
            <Text style={[styles.sunText, { color: theme.text }]}>{guide.condition}</Text>
          </View>

          <View style={[styles.recommendBox, { backgroundColor: "#10243F" }]}>
            <Text style={[styles.recommendText, { color: theme.text }]}>추천&nbsp; {guide.recommendation}</Text>
          </View>
        </View>

        <View style={[styles.adCard, { backgroundColor: "#10243F", borderColor: theme.border }]}>
          <Text style={[styles.adLabel, { color: theme.subtle }]}>AD</Text>
          <Text style={[styles.adText, { color: theme.muted }]}>스포츠 브랜드 협찬 카드</Text>
        </View>

        <Text style={[styles.note, { color: theme.subtle }]}>등산·해변 등 다른 카테고리도 동일 패턴으로 제공돼요</Text>
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <Pressable accessibilityRole="button" onPress={() => onNavigate("G2")} style={[styles.primaryButton, { backgroundColor: theme.gold }]}>
          <Text style={[styles.primaryText, { color: theme.onAccent }]}>목적지 케어 보기</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => onNavigate("P3")} style={[styles.secondaryButton, { backgroundColor: theme.cardStrong }]}>
          <Text style={[styles.secondaryText, { color: theme.subtle }]}>다른 목적지 보기</Text>
        </Pressable>
      </View>
    </View>
  );
}

function WeatherTile({
  label,
  temp,
  meta,
  color,
  muted,
  subtle,
  background,
}: {
  label: string;
  temp: string;
  meta: string;
  color: string;
  muted: string;
  subtle: string;
  background: string;
}) {
  return (
    <View style={[styles.weatherTile, { backgroundColor: background }]}>
      <Text style={[styles.weatherName, { color: muted }]}>{label}</Text>
      <Text style={[styles.weatherTemp, { color }]}>{temp}</Text>
      <Text style={[styles.weatherMeta, { color: subtle }]}>{meta}</Text>
    </View>
  );
}

function getGuideCopy(category: string) {
  if (category === "sports") {
    return {
      title: "오늘 경기 준비 가이드 · 목적지 기준",
      risk: "경기 취소 확률 12%",
      mode: "쿨링룩 추천",
      condition: "내야 1루석 자외선 지수 9",
      recommendation: "쿨링 티셔츠 + 모자 + SPF50 선크림",
    };
  }
  if (category === "mountain") {
    return {
      title: "오늘 산행 준비 가이드 · 목적지 기준",
      risk: "낙뢰 위험 낮음",
      mode: "하산 시간 추천",
      condition: "능선 바람 강함 · 체감온도 낮음",
      recommendation: "경량 바람막이 + 등산화 + 보온 물병",
    };
  }
  if (category === "beach") {
    return {
      title: "오늘 해변 준비 가이드 · 목적지 기준",
      risk: "파도 보통",
      mode: "자외선 대비",
      condition: "해변 자외선 지수 8",
      recommendation: "래시가드 + 선캡 + 방수 샌들",
    };
  }
  return {
    title: "오늘 장소 준비 가이드 · 목적지 기준",
    risk: "날씨 리스크 낮음",
    mode: "기본 준비",
    condition: "목적지 날씨와 이동 시간을 함께 확인",
    recommendation: "가벼운 겉옷 + 편한 신발 + 보조 배터리",
  };
}

function getWeatherDisplay(
  category: string,
  care: P0ScreenProps["state"]["destinationCare"],
  placeName: string,
  temperatureUnit: P0ScreenProps["temperatureUnit"],
) {
  if (category === "sports") {
    return {
      originLabel: "서울 삼성동",
      originTemp: formatTemperature(23, temperatureUnit),
      originMeta: "맑음 · 강수 0%",
      destinationLabel: placeName,
      destinationTemp: formatTemperature(21, temperatureUnit),
      destinationMeta: "구름조금 · 강수 12%",
    };
  }
  return {
    originLabel: care.originWeather.locationName,
    originTemp: formatTemperature(care.originWeather.current.feelsLikeC, temperatureUnit),
    originMeta: `맑음 · 강수 ${care.originWeather.current.rainProbabilityPct}%`,
    destinationLabel: placeName,
    destinationTemp: formatTemperature(care.destinationWeather.current.feelsLikeC, temperatureUnit),
    destinationMeta: `구름조금 · 강수 ${care.destinationWeather.current.rainProbabilityPct}%`,
  };
}

function getCategoryLabel(category: string) {
  if (category === "sports") return "스포츠";
  if (category === "mountain") return "등산";
  if (category === "airport") return "공항";
  if (category === "hotel") return "숙소";
  if (category === "beach") return "해변";
  return "목적지";
}

function getPlaceImage(category: string) {
  if (category === "sports") return placeImageAssets.baseball;
  if (category === "mountain") return placeImageAssets.mountain;
  if (category === "airport") return placeImageAssets.airport;
  if (category === "hotel") return placeImageAssets.hotel;
  return placeImageAssets.beach;
}

function BackGlyph({ color }: { color: string }) {
  return (
    <View style={styles.backGlyph} accessibilityElementsHidden>
      <View style={[styles.backLineTop, { backgroundColor: color }]} />
      <View style={[styles.backLineBottom, { backgroundColor: color }]} />
    </View>
  );
}

function CategoryBadge({ color }: { color: string }) {
  return (
    <View style={[styles.categoryBadge, { borderColor: color }]} accessibilityElementsHidden>
      <View style={[styles.categoryBadgeLine, { backgroundColor: color }]} />
    </View>
  );
}

function SunGlyph({ color }: { color: string }) {
  return (
    <View style={styles.sunGlyph} accessibilityElementsHidden>
      <View style={[styles.sunCore, { borderColor: color }]} />
      <View style={[styles.sunRayV, { backgroundColor: color }]} />
      <View style={[styles.sunRayH, { backgroundColor: color }]} />
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
    gap: spacing.md,
    minHeight: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 160,
  },
  atmosphere: {
    position: "absolute",
    left: -32,
    right: -32,
    top: 118,
    height: 520,
    opacity: 0.36,
    borderRadius: 78,
  },
  header: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
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
    width: 16,
    height: 16,
  },
  backLineTop: {
    position: "absolute",
    left: 3,
    top: 5,
    width: 9,
    height: 1.8,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }],
  },
  backLineBottom: {
    position: "absolute",
    left: 3,
    top: 10,
    width: 9,
    height: 1.8,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  headerCopy: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  categoryBadge: {
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.4,
    borderRadius: 999,
  },
  categoryBadgeLine: {
    width: 1.4,
    height: 8,
    borderRadius: 2,
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  heroImageWrap: {
    height: 130,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  guideState: {
    gap: spacing.xs,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderLeftWidth: 2,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  guideStateTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  eyebrow: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.7,
  },
  readyPill: {
    minHeight: 30,
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
  },
  readyText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  guideStateText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "800",
  },
  weatherCompare: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  weatherTile: {
    flex: 1,
    minHeight: 94,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: radius.lg,
  },
  weatherName: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  weatherTemp: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900",
  },
  weatherMeta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  guideCard: {
    gap: spacing.md,
    padding: 16,
    borderLeftWidth: 2,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  guideHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  guideHeadCopy: {
    flex: 1,
    gap: 4,
  },
  sectionLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  guideTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  autoPill: {
    minHeight: 26,
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
  },
  autoText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  metricPill: {
    minHeight: 29,
    justifyContent: "center",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  metricText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  metricSide: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  sunRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sunGlyph: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sunCore: {
    width: 9,
    height: 9,
    borderWidth: 1.6,
    borderRadius: 999,
  },
  sunRayV: {
    position: "absolute",
    width: 1.6,
    height: 18,
    borderRadius: 2,
  },
  sunRayH: {
    position: "absolute",
    width: 18,
    height: 1.6,
    borderRadius: 2,
  },
  sunText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  recommendBox: {
    minHeight: 42,
    justifyContent: "center",
    borderRadius: radius.sm,
    paddingHorizontal: 14,
  },
  recommendText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  adCard: {
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radius.lg,
  },
  adLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  adText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  note: {
    textAlign: "center",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: 20,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  primaryText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  secondaryText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  bottomSpacer: {
    height: 18,
  },
});
