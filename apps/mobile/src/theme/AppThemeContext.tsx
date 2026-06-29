import React, { createContext, useContext } from "react";
import { appThemes, type AppTheme } from "./tokens";

const AppThemeContext = createContext<AppTheme>(appThemes.dark);

export function AppThemeProvider({ theme, children }: { theme: AppTheme; children: React.ReactNode }) {
  return <AppThemeContext.Provider value={theme}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}
