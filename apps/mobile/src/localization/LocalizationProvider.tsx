import React, { createContext, useEffect, useSyncExternalStore } from "react";
import { AppState } from "react-native";
import { getLocalePolicy, refreshLocalePolicy, subscribeLocalePolicy } from "./localization";

export const LocalizationContext = createContext(getLocalePolicy());

export function LocalizationProvider({ children }: React.PropsWithChildren) {
  const locale = useSyncExternalStore(subscribeLocalePolicy, getLocalePolicy, getLocalePolicy);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshLocalePolicy();
    });
    return () => subscription.remove();
  }, []);

  return <LocalizationContext value={locale}>{children}</LocalizationContext>;
}
