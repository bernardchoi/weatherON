import { useEffect, useState } from "react";

// 실제 일출·일몰 데이터가 아직 없어 로컬 시각 기준(19시~6시)으로 근사한다.
// TODO: 날씨 상세 화면의 일출·일몰 계산이 공용화되면 그 값으로 교체.
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
