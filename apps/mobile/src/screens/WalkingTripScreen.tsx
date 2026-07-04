import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

const courses = [
  {
    prefix: "올레",
    name: "제주 올레 1코스",
    distance: "15km",
    time: "5시간",
    departure: "06:30",
    score: "도보지수 78 · 양호",
    summary: "전 구간 쾌청 예상",
    timeline: [
      { time: "08:00", weather: "맑음", temp: "22°", place: "시흥" },
      { time: "10:00", weather: "흐림", temp: "21°", place: "광치기" },
      { time: "12:00", weather: "비", temp: "20°", place: "성산" },
    ],
  },
  {
    prefix: "숲길",
    name: "북한산 둘레길 7코스",
    distance: "8km",
    time: "3시간",
    departure: "09:10",
    score: "도보지수 64 · 보통",
    summary: "정오 전 바람 약함",
    timeline: [
      { time: "09:00", weather: "흐림", temp: "19°", place: "정릉" },
      { time: "10:30", weather: "맑음", temp: "21°", place: "평창" },
      { time: "12:00", weather: "맑음", temp: "23°", place: "구기" },
    ],
  },
  {
    prefix: "해안",
    name: "해파랑길 1코스",
    distance: "19km",
    time: "6시간",
    departure: "07:20",
    score: "도보지수 58 · 바람 주의",
    summary: "해안 바람 강해 겉옷 필요",
    timeline: [
      { time: "08:00", weather: "바람", temp: "18°", place: "오륙도" },
      { time: "11:00", weather: "흐림", temp: "20°", place: "광안" },
      { time: "13:00", weather: "맑음", temp: "22°", place: "해운대" },
    ],
  },
];

export function WalkingTripScreen({ accountLinked, permissionReady, onNavigate, onRequireAccount, onRequestPermissionGate }: P0ScreenProps) {
  const theme = useAppTheme();
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0);
  const selectedCourse = courses[selectedCourseIndex] ?? courses[0];
  const saveLabel = accountLinked ? (permissionReady ? "코스 저장 완료" : "알림 권한 받고 코스 저장") : "계정 연결하고 코스 저장";

  const handleSaveCourse = () => {
    if (!accountLinked) {
      onRequireAccount("destination-care", "G4");
      return;
    }
    if (!permissionReady) {
      onRequestPermissionGate("destination-care", "G4", "destination");
      return;
    }
    onNavigate("G1");
  };

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => onNavigate("G1")} style={[styles.backButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <BackGlyph color={theme.subtle} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>도보여행</Text>
        </View>

        <Pressable accessibilityRole="search" onPress={() => onNavigate("P3")} style={[styles.searchBox, { backgroundColor: theme.cardSoft }]}>
          <SearchGlyph color={theme.subtle} />
          <Text style={[styles.searchText, { color: theme.subtle }]} numberOfLines={1}>코스 검색 (제주 올레길, 북한산 둘레길...)</Text>
        </Pressable>

        <View style={[styles.alertCard, { backgroundColor: theme.card, borderLeftColor: theme.warm }]}>
          <View style={styles.alertCopy}>
            <Text style={[styles.alertLabel, { color: theme.warm }]}>코스 알림</Text>
            <Text style={[styles.alertText, { color: theme.text }]}>코스 날씨는 무료 확인 · 저장/알림은 계정 연결 필요</Text>
          </View>
          <View style={[styles.accountPill, { backgroundColor: theme.cardStrong }]}>
            <Text style={[styles.accountPillText, { color: theme.gold }]}>{accountLinked ? "연결됨" : "계정 필요"}</Text>
          </View>
        </View>

        <View style={styles.stateRow}>
          <StateChip label="게스트 조회" active theme={theme} />
          <StateChip label={permissionReady ? "권한 허용" : "권한 필요"} active={!permissionReady} theme={theme} />
          <StateChip label="무료 1/2" theme={theme} />
        </View>

        <View style={[styles.courseList, { backgroundColor: theme.card }]}>
          {courses.map((course, index) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCourseIndex === index }}
              key={course.name}
              onPress={() => setSelectedCourseIndex(index)}
              style={[
                styles.courseRow,
                {
                  backgroundColor: selectedCourseIndex === index ? "rgba(248,251,255,0.10)" : "transparent",
                  borderBottomColor: index === courses.length - 1 ? "transparent" : theme.border,
                },
              ]}
            >
              <Text style={[styles.coursePrefix, { color: theme.text }]}>{course.prefix}</Text>
              <Text style={[styles.courseName, { color: selectedCourseIndex === index ? theme.gold : theme.text }]} numberOfLines={1}>{course.name}</Text>
              <Text style={[styles.courseMeta, { color: theme.subtle }]}>{course.distance}</Text>
              <Text style={[styles.courseDot, { color: theme.subtle }]}>·</Text>
              <Text style={[styles.courseMeta, { color: theme.subtle }]}>{course.time}</Text>
              <ChevronGlyph color={theme.subtle} />
            </Pressable>
          ))}
        </View>

        <View style={[styles.detailCard, { backgroundColor: theme.card, borderLeftColor: theme.clear }]}>
          <View style={styles.detailHeader}>
            <Text style={[styles.detailTitle, { color: theme.text }]}>코스 상세 — {selectedCourse.name}</Text>
            <Text style={[styles.detailSub, { color: theme.subtle }]}>{selectedCourse.departure} 출발 추천 기준</Text>
          </View>

          <View style={styles.timeline}>
            {selectedCourse.timeline.map((item, index) => (
              <View key={item.time} style={styles.timelineItem}>
                <Text style={[styles.timelineTime, { color: theme.subtle }]}>{item.time}</Text>
                <Text style={[styles.timelineWeather, { color: theme.text }]}>{item.weather}</Text>
                <View style={styles.tempRow}>
                  <Text style={[styles.timelineTemp, { color: theme.text }]}>{item.temp}</Text>
                  {index < selectedCourse.timeline.length - 1 ? <MiniArrow color={theme.subtle} /> : null}
                </View>
                <Text style={[styles.timelinePlace, { color: theme.subtle }]}>{item.place}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.scorePill, { backgroundColor: `${theme.clear}18`, borderColor: theme.clear }]}>
            <View style={[styles.scoreDot, { backgroundColor: theme.clear }]} />
            <Text style={[styles.scoreText, { color: theme.clear }]}>{selectedCourse.score}</Text>
          </View>

          <View style={[styles.departureBox, { backgroundColor: `${theme.clear}12`, borderColor: theme.clear }]}>
            <Text style={[styles.departureText, { color: theme.text }]}>{selectedCourse.departure} 출발 추천</Text>
            <Text style={[styles.departureSub, { color: theme.clear }]}>{selectedCourse.summary}</Text>
          </View>
        </View>

        <Pressable accessibilityRole="button" onPress={handleSaveCourse} style={[styles.saveButton, { backgroundColor: theme.gold }]}>
          <Text style={[styles.saveText, { color: theme.onAccent }]}>{saveLabel}</Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function StateChip({ label, active, theme }: { label: string; active?: boolean; theme: AppTheme }) {
  return (
    <View style={[styles.stateChip, { backgroundColor: active ? theme.cardStrong : "rgba(16,36,63,0.28)", borderColor: active ? "rgba(244,182,63,0.36)" : theme.border }]}>
      <Text style={[styles.stateText, { color: active ? theme.text : theme.subtle }]}>{label}</Text>
    </View>
  );
}

function BackGlyph({ color }: { color: string }) {
  return (
    <View style={styles.backGlyph} accessibilityElementsHidden>
      <View style={[styles.backLineTop, { backgroundColor: color }]} />
      <View style={[styles.backLineBottom, { backgroundColor: color }]} />
    </View>
  );
}

function SearchGlyph({ color }: { color: string }) {
  return (
    <View style={styles.searchGlyph} accessibilityElementsHidden>
      <View style={[styles.searchCircle, { borderColor: color }]} />
      <View style={[styles.searchHandle, { backgroundColor: color }]} />
    </View>
  );
}

function ChevronGlyph({ color }: { color: string }) {
  return (
    <View style={styles.chevronGlyph} accessibilityElementsHidden>
      <View style={[styles.chevronLineTop, { backgroundColor: color }]} />
      <View style={[styles.chevronLineBottom, { backgroundColor: color }]} />
    </View>
  );
}

function MiniArrow({ color }: { color: string }) {
  return (
    <View style={styles.miniArrow} accessibilityElementsHidden>
      <View style={[styles.miniArrowLine, { backgroundColor: color }]} />
      <View style={[styles.miniArrowTop, { backgroundColor: color }]} />
      <View style={[styles.miniArrowBottom, { backgroundColor: color }]} />
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
    paddingBottom: 112,
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
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: 0,
  },
  searchBox: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 15,
    borderRadius: radius.lg,
  },
  searchGlyph: {
    width: 17,
    height: 17,
  },
  searchCircle: {
    position: "absolute",
    left: 1,
    top: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1.7,
  },
  searchHandle: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 7,
    height: 1.7,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  searchText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
  alertCard: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 14,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
  },
  alertCopy: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  alertLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  alertText: {
    fontSize: 11,
    lineHeight: 18,
    fontWeight: "800",
  },
  accountPill: {
    minWidth: 64,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  accountPillText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  stateRow: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stateChip: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  stateText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  courseList: {
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  courseRow: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  coursePrefix: {
    width: 29,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  courseName: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  courseMeta: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
  },
  courseDot: {
    marginHorizontal: -2,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "900",
  },
  chevronGlyph: {
    width: 12,
    height: 16,
  },
  chevronLineTop: {
    position: "absolute",
    right: 1,
    top: 4,
    width: 8,
    height: 1.6,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  chevronLineBottom: {
    position: "absolute",
    right: 1,
    bottom: 5,
    width: 8,
    height: 1.6,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }],
  },
  detailCard: {
    gap: 12,
    minHeight: 202,
    padding: 15,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
  },
  detailHeader: {
    gap: 4,
  },
  detailTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  detailSub: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
  },
  timeline: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  timelineItem: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  timelineTime: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  timelineWeather: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
  },
  tempRow: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  timelineTemp: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
  },
  timelinePlace: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },
  miniArrow: {
    width: 14,
    height: 10,
  },
  miniArrowLine: {
    position: "absolute",
    left: 0,
    top: 4,
    width: 12,
    height: 1.2,
    borderRadius: 2,
  },
  miniArrowTop: {
    position: "absolute",
    right: 1,
    top: 2,
    width: 5,
    height: 1.2,
    borderRadius: 2,
    transform: [{ rotate: "38deg" }],
  },
  miniArrowBottom: {
    position: "absolute",
    right: 1,
    bottom: 2,
    width: 5,
    height: 1.2,
    borderRadius: 2,
    transform: [{ rotate: "-38deg" }],
  },
  scorePill: {
    alignSelf: "center",
    minHeight: 27,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  scoreDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scoreText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  departureBox: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  departureText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  departureSub: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  saveButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
  },
  saveText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  bottomSpacer: {
    height: 8,
  },
});
