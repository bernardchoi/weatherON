import { useEffect, useState } from "react";
import { AppState } from "../localization/react-native";
export function useForecastNow() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = setInterval(update, 60_000);
    const subscription = AppState.addEventListener("change", state => { if (state === "active") update(); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  return now;
}
