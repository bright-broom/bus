import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { BusRoute, Departure, DayOfWeek } from "./types";

// =============================
// Tailwind クラスの結合関数
// =============================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =============================
// 現在の曜日を取得する関数
// =============================
export function getCurrentDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

// =============================
// 時刻文字列を分に変換する関数
// =============================
export function timeStringToMinutes(timeString: `${number}:${number}` | string): number {
  const parts = timeString.split(':');
  if (parts.length !== 2) {
    throw new Error(`不正な時刻フォーマット: ${timeString}`);
  }
  const [hours, minutes] = parts.map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`不正な時刻フォーマット: ${timeString}`);
  }

  return hours * 60 + minutes;
}

// =============================
// 現在時刻を分に変換する関数
// =============================
export function getCurrentTimeInMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// =============================
// 出発までの残り時間（分）を計算する関数
// =============================
export function getMinutesUntilDeparture(departureTime: string): number {
  const departureMinutes = timeStringToMinutes(departureTime);
  const currentMinutes = getCurrentTimeInMinutes();

  return departureMinutes >= currentMinutes
    ? departureMinutes - currentMinutes
    : departureMinutes + 1440 - currentMinutes; // 翌日の出発を考慮
}

// =============================
// 現在の曜日に運行しているバスの出発時刻をフィルタリング
// =============================
export function filterDeparturesByCurrentDay(departures: Departure[]): Departure[] {
  const currentDay = getCurrentDayOfWeek();
  return departures.filter(departure => departure.dayOfWeek.includes(currentDay));
}

// =============================
// 指定されたルートの次の出発時刻を取得する関数
// =============================
export function getUpcomingDepartures(
  route: BusRoute,
  limit = 5
): { stopName: string; departureTime: string; minutesUntil: number }[] {
  const currentDayOfWeek = getCurrentDayOfWeek();

  const allDepartures = route.stops.flatMap(stop =>
    stop.departures
      .filter(departure => departure.dayOfWeek.includes(currentDayOfWeek))
      .map(departure => ({
        stopName: stop.name,
        departureTime: departure.time,
        minutesUntil: getMinutesUntilDeparture(departure.time),
      }))
  );

  return allDepartures
    .sort((a, b) => a.minutesUntil - b.minutesUntil)
    .slice(0, limit);
}
