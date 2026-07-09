import { StyleSheet, Text, type TextStyle } from "react-native";

// Pretendard 정적 웨이트 파일을 expo-font에 등록할 맵. 앱에서 실제로 쓰는 웨이트만 담는다
// (fontWeight 분포: 900 다수, 800, 700, 소수 600·300). 각 파일은 자기 웨이트 그대로의 페이스라
// 별도의 fontWeight 없이 패밀리 이름만으로 원하는 두께가 나온다.
export const pretendardFontMap = {
  Pretendard: require("../../assets/fonts/Pretendard-Regular.otf"),
  "Pretendard-Light": require("../../assets/fonts/Pretendard-Light.otf"),
  "Pretendard-SemiBold": require("../../assets/fonts/Pretendard-SemiBold.otf"),
  "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.otf"),
  "Pretendard-ExtraBold": require("../../assets/fonts/Pretendard-ExtraBold.otf"),
  "Pretendard-Black": require("../../assets/fonts/Pretendard-Black.otf"),
};

// fontWeight 값을 그에 맞는 Pretendard 패밀리 이름으로 변환한다.
function pretendardFamilyForWeight(weight: TextStyle["fontWeight"]): string {
  switch (String(weight ?? "400")) {
    case "100":
    case "200":
    case "300":
      return "Pretendard-Light";
    case "500":
    case "600":
      return "Pretendard-SemiBold";
    case "700":
      return "Pretendard-Bold";
    case "800":
      return "Pretendard-ExtraBold";
    case "900":
      return "Pretendard-Black";
    default:
      return "Pretendard";
  }
}

let patched = false;

// RN의 기본 Text 렌더링을 한 번만 가로채서, 인라인 스타일의 fontWeight에 맞는 Pretendard 패밀리를
// 자동으로 주입한다. 앱 전역이 <Text>를 직접 쓰고 fontFamily는 어디에도 지정하지 않으므로,
// 이 패치 한 번으로 모든 텍스트가 시스템 폰트 대신 Pretendard로 바뀐다.
// (React 19에서 Text.defaultProps가 제거되어 이 방식이 유일하게 안전한 전역 적용 경로다.)
// 파일별로 이미 해당 두께의 페이스라, 중복 볼드(faux bold)를 막기 위해 fontWeight는 제거하고
// 패밀리 이름으로만 두께를 표현한다.
export function applyPretendardToText(): void {
  if (patched) return;
  patched = true;
  const TextComponent = Text as unknown as { render?: (...args: unknown[]) => unknown };
  const originalRender = TextComponent.render;
  if (typeof originalRender !== "function") return;
  TextComponent.render = function render(...args: unknown[]) {
    const props = args[0] as { style?: unknown };
    const flattened = (StyleSheet.flatten(props?.style as TextStyle) ?? {}) as TextStyle;
    const { fontWeight, ...rest } = flattened;
    const family = pretendardFamilyForWeight(fontWeight);
    const nextProps = { ...(props as object), style: [rest, { fontFamily: family }] };
    return originalRender.apply(this, [nextProps, ...args.slice(1)]);
  };
}
