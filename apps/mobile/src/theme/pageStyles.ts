import { Platform, StyleSheet } from "react-native";

// 공통 정보 계층. Android는 Material 타입 스케일·형태, 색상은 androidMaterial 사용.
const isAndroid = Platform.OS !== "ios";
export const pageStyles = StyleSheet.create({
  header: { minHeight: isAndroid ? 48 : 44, paddingTop: 0, alignItems: "center" },
  title: { fontSize: isAndroid ? 22 : 21, lineHeight: isAndroid ? 28 : 27, fontWeight: isAndroid ? "500" : "700" },
  sectionTitle: { fontSize: isAndroid ? 16 : 17, lineHeight: isAndroid ? 24 : 23, fontWeight: isAndroid ? "500" : "600" },
  body: { fontSize: 16, lineHeight: 23, fontWeight: "500" },
  caption: { fontSize: 14, lineHeight: 20, fontWeight: "400" },
  compactCaption: { fontSize: 13, lineHeight: 18, fontWeight: "500" },
  number: { fontSize: 30, lineHeight: 36, fontWeight: "600", fontVariant: ["tabular-nums"] },
  card: { borderRadius: isAndroid ? 28 : 24, borderWidth: isAndroid ? 0 : StyleSheet.hairlineWidth, shadowOpacity: 0, elevation: 0 },
  unboxed: { backgroundColor: "transparent", borderWidth: 0, shadowOpacity: 0, elevation: 0 },
  quietIcon: { backgroundColor: "transparent", borderWidth: 0 },
});
