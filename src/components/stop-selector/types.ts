import type { BusRoute, BusStop } from '@/lib/types';
import type { MouseEvent } from 'react';

// =====================================
// 共通型定義
// =====================================

/**
 * バス停の選択状態を表す型
 * @description 選択状態に関する共通の型定義
 */
export interface SelectionState {
  /** 完全に選択されているかどうか */
  isFullySelected: boolean;
  /** 部分的に選択されているかどうか */
  isPartiallySelected: boolean;
}

/**
 * バス停選択のイベントハンドラー型
 * @description バス停選択に関連するイベントハンドラーの型定義
 */
export type StopSelectionHandler = (stopId: string) => void;

/**
 * バス停一括選択のイベントハンドラー型
 * @description バス停の一括選択に関連するイベントハンドラーの型定義
 */
export type BatchStopSelectionHandler = (routeId: string, event: MouseEvent) => void;

// =====================================
// コンポーネント固有の型定義
// =====================================

/**
 * バス停情報の型定義
 * @description
 * ルート情報とバス停情報を組み合わせた拡張型。
 * バス停の表示や管理に必要な情報をまとめています。
 * 
 * @example
 * ```typescript
 * const stopInfo: StopInfo = {
 *   routeId: "route-1",
 *   routeName: "東京駅〜横浜駅",
 *   routeColor: "#FF0000",
 *   stop: { id: "stop-1", name: "東京駅", departures: [] }
 * };
 * ```
 */
export interface StopInfo {
  /** バス路線の一意のID */
  routeId: string;
  /** バス路線の表示名 */
  routeName: string;
  /** バス路線を識別するための色（HEX形式） */
  routeColor: `#${string}`;
  /** 関連するバス停の詳細情報 */
  stop: BusStop;
}

/**
 * StopSelectorコンポーネントのプロパティ定義
 * @description
 * バス停選択機能全体を制御するためのプロパティ。
 * 路線情報、選択状態、イベントハンドラーを含みます。
 * 
 * @example
 * ```typescript
 * <StopSelector
 *   routes={busRoutes}
 *   selectedStops={["stop-1", "stop-2"]}
 *   onStopSelect={(stops) => handleStopSelection(stops)}
 * />
 * ```
 */
export interface StopSelectorProps {
  /** 表示対象のバス路線一覧 */
  routes: BusRoute[];
  /** 現在選択されているバス停IDのリスト */
  selectedStops: string[];
  /** 
   * バス停選択状態の変更時に呼び出されるコールバック
   * @param stopIds - 更新後の選択済みバス停IDリスト
   */
  onStopSelect: (stopIds: string[]) => void;
}

/**
 * RouteStopListコンポーネントのプロパティ定義
 * @description
 * 個別のバス路線に対するバス停リストを制御するためのプロパティ。
 * 選択状態の管理やUIの状態制御に必要な情報を含みます。
 * 
 * @example
 * ```typescript
 * <RouteStopList
 *   route={route}
 *   selectedStops={selectedStops}
 *   onStopSelect={handleStopSelect}
 *   isExpanded={true}
 *   {...otherProps}
 * />
 * ```
 */
export interface RouteStopListProps extends SelectionState {
  /** 表示対象のバス路線情報 */
  route: BusRoute;
  /** 現在選択されているバス停IDのリスト */
  selectedStops: string[];
  /** 個別のバス停選択時のコールバック */
  onStopSelect: StopSelectionHandler;
  /** ルート内の全バス停の一括選択時のコールバック */
  onSelectAllStops: BatchStopSelectionHandler;
  /** ルートの展開状態 */
  isExpanded: boolean;
  /** ルートの展開状態を切り替えるコールバック */
  onToggleExpand: () => void;
}

/**
 * StopCheckboxコンポーネントのプロパティ定義
 * @description
 * 個別のバス停選択用チェックボックスを制御するためのプロパティ。
 * アクセシビリティに配慮した設計になっています。
 * 
 * @example
 * ```typescript
 * <StopCheckbox
 *   id="stop-1"
 *   name="東京駅"
 *   isSelected={true}
 *   onChange={() => handleChange("stop-1")}
 * />
 * ```
 */
export interface StopCheckboxProps {
  /** チェックボックスの一意のID（HTMLのid属性として使用） */
  id: string;
  /** バス停の表示名 */
  name: string;
  /** チェックボックスの選択状態 */
  isSelected: boolean;
  /** 選択状態変更時のコールバック */
  onChange: () => void;
}