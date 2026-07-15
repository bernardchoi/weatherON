import type { NotificationRuleEvaluation } from "@weatheron/shared";

export type NotificationPolicyInput = Pick<
  NotificationRuleEvaluation,
  "id" | "type" | "active" | "requiresPushPermission" | "scheduledAt"
>;

export type NotificationPolicyOptions = {
  reducedInterruptions: boolean;
  dailyLimit?: number;
  quietHoursStart?: number;
  quietHoursEnd?: number;
};

const defaultDailyLimit = 3;
const defaultQuietHoursStart = 22;
const defaultQuietHoursEnd = 7;

const priorityByType: Record<NotificationRuleEvaluation["type"], number> = {
  "heavy-rain": 100,
  heatwave: 95,
  destination: 90,
  rain: 80,
  umbrella: 70,
  shoes: 60,
  bedtime: 50,
  routine: 40,
};

export function applyLocalNotificationPolicy<T extends NotificationPolicyInput>(
  notifications: T[],
  options: NotificationPolicyOptions,
): T[] {
  const eligible = notifications.filter((item) => item.active && item.requiresPushPermission && isFutureDate(item.scheduledAt));
  if (!options.reducedInterruptions) return eligible.sort(compareBySchedule);

  const quietHoursStart = options.quietHoursStart ?? defaultQuietHoursStart;
  const quietHoursEnd = options.quietHoursEnd ?? defaultQuietHoursEnd;
  const dailyLimit = Math.max(1, options.dailyLimit ?? defaultDailyLimit);
  const allowed = eligible.filter((item) => !isWithinQuietHours(new Date(item.scheduledAt!), quietHoursStart, quietHoursEnd));
  const byDay = new Map<string, T[]>();

  allowed.forEach((item) => {
    const key = getLocalDateKey(new Date(item.scheduledAt!));
    byDay.set(key, [...(byDay.get(key) ?? []), item]);
  });

  return [...byDay.values()]
    .flatMap((items) => items.sort(compareByPriority).slice(0, dailyLimit))
    .sort(compareBySchedule);
}

function isFutureDate(value: string | undefined): value is string {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp > Date.now();
}

function isWithinQuietHours(date: Date, startHour: number, endHour: number): boolean {
  const hour = date.getHours();
  if (startHour === endHour) return false;
  if (startHour > endHour) return hour >= startHour || hour < endHour;
  return hour >= startHour && hour < endHour;
}

function getLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function compareByPriority(left: NotificationPolicyInput, right: NotificationPolicyInput): number {
  const priorityDifference = priorityByType[right.type] - priorityByType[left.type];
  return priorityDifference || compareBySchedule(left, right) || left.id.localeCompare(right.id);
}

function compareBySchedule(left: NotificationPolicyInput, right: NotificationPolicyInput): number {
  return Date.parse(left.scheduledAt!) - Date.parse(right.scheduledAt!);
}
