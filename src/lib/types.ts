// =============================
// 定数: 曜日一覧
// =============================
export const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

// =============================
// 型定義: 曜日
// =============================
export type DayOfWeek = typeof ALL_DAYS[number];

// =============================
// インターフェース: バス路線
// =============================
export interface BusRoute {
  id: string;            // 一意のルートID
  name: string;          // ルート名
  color: `#${string}`;   // HEX形式のカラーコード
  stops: BusStop[];      // バス停のリスト
}

// =============================
// インターフェース: バス停
// =============================
export interface BusStop {
  id: string;            // 一意のバス停ID
  name: string;          // バス停名
  departures: Departure[]; // 出発情報リスト
}

// =============================
// インターフェース: 出発情報
// =============================
export interface Departure {
  time: `${number}:${number}`; // 24時間形式の時刻 "HH:MM"
  dayOfWeek: DayOfWeek[];      // 運行曜日リスト
}
