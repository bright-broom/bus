import type { BusRoute, DayOfWeek } from './types';

// =====================================
// 定数: 曜日関連
// =====================================

/**
 * アプリケーションで使用する曜日の定義
 * @description
 * - 月曜日から日曜日までの曜日を配列で定義
 * - 国際標準（ISO 8601）に準拠した曜日の順序
 */
export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const;

/**
 * 曜日の日本語表記マッピング
 * @description 英語の曜日キーと日本語の曜日表記の対応を定義
 */
export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: '月',
  tuesday: '火',
  wednesday: '水',
  thursday: '木',
  friday: '金',
  saturday: '土',
  sunday: '日'
} as const;

// =====================================
// 定数: 運行スケジュール
// =====================================

/**
 * 平日の曜日配列（月〜金）
 */
export const WEEKDAYS: DayOfWeek[] = DAYS_OF_WEEK.slice(0, 5);

/**
 * 週末の曜日配列（土日）
 */
export const WEEKEND: DayOfWeek[] = DAYS_OF_WEEK.slice(5);

/**
 * 全曜日の運行スケジュール
 */
export const ALL_WEEK = [...DAYS_OF_WEEK];

// =====================================
// ヘルパー関数
// =====================================

/**
 * 日本語の曜日表記を取得
 * @param day 英語の曜日キー
 * @returns 日本語の曜日表記
 */
export const getJapaneseDayLabel = (day: DayOfWeek): string => DAY_LABELS[day];

/**
 * 曜日の配列を日本語表記の文字列に変換
 * @param days 曜日の配列
 * @returns カンマ区切りの日本語曜日文字列
 */
export const formatDaysToJapanese = (days: DayOfWeek[]): string => 
  days.map(getJapaneseDayLabel).join('・');

// =====================================
// サンプルデータ: バス路線
// =====================================

/**
 * サンプルのバス路線データ
 * @description
 * アプリケーションのデモ用に用意された架空のバス路線データ。
 * 以下の2路線を含む：
 * 1. 循環バス（平日のみ運行）
 * 2. 急行バス（毎日運行）
 */
export const SAMPLE_ROUTES: BusRoute[] = [
  {
    id: 'route1',
    name: '循環バス',
    color: '#4CAF50', // Material Design Green 500
    stops: [
      {
        id: 'stop1',
        name: '中央駅',
        departures: [
          { time: '7:00', dayOfWeek: WEEKDAYS },
          { time: '8:00', dayOfWeek: WEEKDAYS },
          { time: '9:00', dayOfWeek: WEEKDAYS }
        ]
      },
      {
        id: 'stop2',
        name: '市役所前',
        departures: [
          { time: '7:15', dayOfWeek: WEEKDAYS },
          { time: '8:15', dayOfWeek: WEEKDAYS },
          { time: '9:15', dayOfWeek: WEEKDAYS }
        ]
      }
    ]
  },
  {
    id: 'route2',
    name: '急行バス',
    color: '#2196F3', // Material Design Blue 500
    stops: [
      {
        id: 'stop3',
        name: '空港',
        departures: [
          { time: '6:30', dayOfWeek: ALL_WEEK },
          { time: '7:30', dayOfWeek: ALL_WEEK },
          { time: '8:30', dayOfWeek: ALL_WEEK }
        ]
      },
      {
        id: 'stop4',
        name: '中央駅',
        departures: [
          { time: '7:00', dayOfWeek: ALL_WEEK },
          { time: '8:00', dayOfWeek: ALL_WEEK },
          { time: '9:00', dayOfWeek: ALL_WEEK }
        ]
      }
    ]
  }
] as const;

// =====================================
// エクスポート: 型定義
// =====================================

/**
 * ルートの運行タイプ
 * @description ルートの運行スケジュールタイプを定義
 */
export type RouteScheduleType = 'weekday' | 'weekend' | 'all-week';

/**
 * 運行スケジュールマッピング
 * @description 運行タイプと対応する曜日配列のマッピング
 */
export const SCHEDULE_DAYS: Record<RouteScheduleType, DayOfWeek[]> = {
  'weekday': WEEKDAYS,
  'weekend': WEEKEND,
  'all-week': ALL_WEEK
} as const;
