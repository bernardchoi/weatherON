import React, { forwardRef } from "react";
import {
  Pressable as NativePressable,
  Text as NativeText,
  TextInput as NativeTextInput,
  View as NativeView,
  type PressableProps,
  type TextInputProps,
  type TextProps,
  type ViewProps,
} from "react-native";
import { translateAccessibility, translateText } from "./localization";
import { LocalizationContext } from "./LocalizationProvider";

export * from "react-native";

export const Text = forwardRef<React.ElementRef<typeof NativeText>, TextProps>(function LocalizedText(props, ref) {
  const { language } = React.use(LocalizationContext);
  return <NativeText {...props} ref={ref}>{translateChildren(props.children, language)}</NativeText>;
}) as unknown as typeof NativeText;

export const RawText = NativeText;

export const Pressable = forwardRef<React.ElementRef<typeof NativePressable>, PressableProps>(function LocalizedPressable(props, ref) {
  const { language } = React.use(LocalizationContext);
  return <NativePressable {...props} ref={ref} accessibilityLabel={translateAccessibility(props.accessibilityLabel, language)} accessibilityHint={translateAccessibility(props.accessibilityHint, language)} />;
}) as unknown as typeof NativePressable;

export const TextInput = forwardRef<React.ElementRef<typeof NativeTextInput>, TextInputProps>(function LocalizedTextInput(props, ref) {
  const { language } = React.use(LocalizationContext);
  return <NativeTextInput {...props} ref={ref} placeholder={props.placeholder ? translateText(props.placeholder, language) : props.placeholder} accessibilityLabel={translateAccessibility(props.accessibilityLabel, language)} accessibilityHint={translateAccessibility(props.accessibilityHint, language)} />;
}) as unknown as typeof NativeTextInput;

export const LocalizedView = forwardRef<React.ElementRef<typeof NativeView>, ViewProps>(function WeatherONLocalizedView(props, ref) {
  const { language } = React.use(LocalizationContext);
  return <NativeView {...props} ref={ref} accessibilityLabel={translateAccessibility(props.accessibilityLabel, language)} accessibilityHint={translateAccessibility(props.accessibilityHint, language)} />;
});

function translateChildren(children: React.ReactNode, language: React.ContextType<typeof LocalizationContext>["language"]): React.ReactNode {
  if (typeof children === "string") return translateText(children, language);
  if (!Array.isArray(children)) return children;
  if (children.every((child) => typeof child === "string" || typeof child === "number")) {
    return translateText(children.join(""), language);
  }
  return children.map((child, index) => typeof child === "string" ? <React.Fragment key={index}>{translateText(child, language)}</React.Fragment> : child);
}
