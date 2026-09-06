import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { isNightAtWeatherTime, type WeatherDaylightContext } from "./weatherDaylight";

export function isNightHour(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 19 || hour < 6;
}

export function useIsNightHour(context?: WeatherDaylightContext): boolean {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") setNow(Date.now());
    });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  return context ? isNightAtWeatherTime(new Date(now).toISOString(), context) : isNightHour(new Date(now));
}
