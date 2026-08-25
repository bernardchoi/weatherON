import { useEffect, useState } from "react";

// 위치 컨텍스트를 받지 않는 홈 배경은 로컬 시각 기준(19시~6시)으로 근사한다.
export function isNightHour(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 19 || hour < 6;
}

export function useIsNightHour(): boolean {
  const [isNight, setIsNight] = useState(() => isNightHour(new Date()));
  useEffect(() => {
    const timer = setInterval(() => setIsNight(isNightHour(new Date())), 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  return isNight;
}
