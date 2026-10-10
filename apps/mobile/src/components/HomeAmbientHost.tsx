import React, { createContext, useContext, useLayoutEffect, useState } from "react";
import { View } from "../localization/react-native";

const HomeAmbientContext = createContext<React.Dispatch<React.SetStateAction<React.ReactNode>> | null>(null);

export function HomeAmbientHost({ enabled, backgroundColor, children }: { enabled: boolean; backgroundColor: string; children: React.ReactNode }) {
  const [background, setBackground] = useState<React.ReactNode>(null);
  return <HomeAmbientContext.Provider value={setBackground}>
    <View style={{ flex: 1, backgroundColor }}>
      {enabled ? background : null}
      {children}
    </View>
  </HomeAmbientContext.Provider>;
}

export function HomeAmbientPortal({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const register = useContext(HomeAmbientContext);
  useLayoutEffect(() => {
    if (enabled && register) register(children);
  }, [enabled, register, children]);
  useLayoutEffect(() => () => { if (enabled && register) register(null); }, [enabled, register]);
  return enabled && register ? null : <>{children}</>;
}
