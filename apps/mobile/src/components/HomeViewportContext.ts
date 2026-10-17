import { createContext } from "react";

// Owned by the persistent iOS stack frame: excludes safe areas and the dock.
// Home can remount without briefly reverting to unmeasured spacing.
export const HomeViewportContext = createContext(0);
