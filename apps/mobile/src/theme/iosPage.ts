import { Platform, StyleSheet } from "react-native";

// 홈과 탭·상세 화면이 공유하는 iOS 정보 계층. 크기별 여백은 responsiveLayout 사용.
export const iosPage = Platform.OS === "ios" ? StyleSheet.create({
  header: { minHeight: 44, paddingTop: 0, alignItems: "center" },
  title: { fontSize: 20, lineHeight: 26, fontWeight: "700" },
  sectionTitle: { fontSize: 16, lineHeight: 22, fontWeight: "600" },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "500" },
  caption: { fontSize: 12, lineHeight: 17, fontWeight: "400" },
  number: { fontSize: 32, lineHeight: 38, fontWeight: "600", fontVariant: ["tabular-nums"] },
  card: { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, shadowOpacity: 0, elevation: 0 },
  unboxed: { backgroundColor: "transparent", borderWidth: 0, shadowOpacity: 0, elevation: 0 },
  quietIcon: { backgroundColor: "transparent", borderWidth: 0 },
}) : null;
