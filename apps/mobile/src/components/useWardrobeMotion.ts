import { useContext } from "react";
import { LayoutAnimation, Platform } from "../localization/react-native";
import { AmbientMotionContext } from "./AmbientReveal";
import { ambientMotion } from "../theme/ambientMotion";

export function useWardrobeMotion() {
  const { active, motionAllowed } = useContext(AmbientMotionContext);
  return (action: () => void) => {
    if (Platform.OS === "ios" && active && motionAllowed) LayoutAnimation.configureNext({
      duration: ambientMotion.wardrobe,
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    });
    action();
  };
}
