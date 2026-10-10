import React, { createContext, useContext, useLayoutEffect, useState } from "react";
import { Platform, View } from "../localization/react-native";
import type { WeatherSnapshot } from "@weatheron/shared";
import type { WeatherLocationPreset } from "../providers/weatherLocations";
import { defaultSeoulWeatherLocation } from "../providers/weatherLocations";
import type { AppTheme } from "../theme/tokens";
import { ambientHomeTheme } from "../theme/ambientSurface";
import { resolveWeatherTimeZone } from "../utils/weatherDaylight";
import { useAmbientDaylight } from "../utils/useIsNightHour";
import { AmbientSurfaceBackground } from "./AmbientSurfaceBackground";

type Interaction = Pick<React.ComponentProps<typeof AmbientSurfaceBackground>, "contentOrigin" | "touchPulse" | "touchContact" | "touchPoint" | "onLowPowerChange" | "readingAreas" | "scrollOffset" | "meteorScrollY" | "scrolling">;
const HomeAmbientContext = createContext<React.Dispatch<React.SetStateAction<Interaction | null>> | null>(null);
type Environment = { enabled: boolean; theme: AppTheme; weather: WeatherSnapshot; location?: WeatherLocationPreset | null; reliable: boolean };

// The decoration, unlike Home's content and touch session, survives tab changes.
// Latest environment comes from the root, never a retained Home React element.
const PersistentHomeAmbient = React.memo(function PersistentHomeAmbient({ enabled, theme, weather, location, reliable, interaction }: Environment & { interaction: Interaction | null }) {
  const [lowPowerMode, setLowPowerMode] = useState(true);
  const ambientLocation = location?.locationId === weather.locationId ? location
    : weather.locationId === defaultSeoulWeatherLocation.locationId ? defaultSeoulWeatherLocation : null;
  const daylight = useAmbientDaylight({ coordinate: ambientLocation?.coordinate, timeZone: resolveWeatherTimeZone(weather.countryCode, ambientLocation?.timezone ?? weather.timezone) }, enabled);
  useLayoutEffect(() => { if (enabled) interaction?.onLowPowerChange?.(lowPowerMode); }, [enabled, interaction?.onLowPowerChange, lowPowerMode]);
  return <AmbientSurfaceBackground {...(enabled ? interaction : null)} onScreen={enabled} theme={ambientHomeTheme(theme, true)} condition={weather.current.condition} windMs={weather.current.windMs} precipitationMm={weather.current.precipitationMm} reliable={reliable} daylight={daylight} touchPulse={enabled ? interaction?.touchPulse ?? 0 : 0} lowPowerMode={lowPowerMode} onLowPowerChange={setLowPowerMode} />;
}, (previous, next) => !previous.enabled && !next.enabled);

export function HomeAmbientHost({ backgroundColor, children, ...environment }: Environment & { backgroundColor: string; children: React.ReactNode }) {
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  return <HomeAmbientContext.Provider value={setInteraction}>
    <View style={{ flex: 1, backgroundColor }}>
      {Platform.OS === "ios" ? <PersistentHomeAmbient {...environment} interaction={interaction} /> : null}
      {children}
    </View>
  </HomeAmbientContext.Provider>;
}

export function HomeAmbientPortal({ enabled, interaction, children }: { enabled: boolean; interaction: Interaction; children: React.ReactNode }) {
  const register = useContext(HomeAmbientContext);
  useLayoutEffect(() => { if (enabled && register) register(interaction); }, [enabled, register, interaction]);
  useLayoutEffect(() => () => { if (enabled && register) register(null); }, [enabled, register]);
  return enabled && register ? null : <>{children}</>;
}
