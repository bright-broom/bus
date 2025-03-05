import { useState, useCallback, useMemo } from 'react';
import type { BusRoute } from '@/lib/types';
import type { StopInfo } from '@/components/stop-selector/types';

// =====================================
// 型定義
// =====================================

/**
 * useStopSelectionフックの戻り値の型
 */
interface UseStopSelectionReturn {
  /** 展開されているルートIDの配列 */
  expandedRoutes: string[];
  /** 全てのバス停情報（ルート情報付き） */
  allStops: StopInfo[];
  /** ルートごとにグループ化されたバス停情報 */
  stopsByRoute: { route: BusRoute; stops: BusRoute['stops'] }[];
  /** 特定のバス停の選択状態を切り替える関数 */
  toggleStop: (stopId: string) => void;
  /** ルート内の全バス停の選択状態を切り替える関数 */
  toggleAllStopsInRoute: (routeId: string, e: React.MouseEvent) => void;
  /** 全てのバス停の選択状態を切り替える関数 */
  toggleAllStops: () => void;
  /** ルートの展開状態を切り替える関数 */
  toggleRouteExpansion: (routeId: string) => void;
  /** ルートの全選択状態を確認する関数 */
  isRouteFullySelected: (route: BusRoute) => boolean;
  /** ルートの部分選択状態を確認する関数 */
  isRoutePartiallySelected: (route: BusRoute) => boolean;
  /** 全バス停の選択状態を確認する真偽値 */
  areAllStopsSelected: boolean;
}

// =====================================
// カスタムフック
// =====================================

/**
 * バス停選択の状態管理を行うカスタムフック
 * 
 * @description
 * バス停の選択状態とルートの展開状態を管理し、それらを操作するための
 * 関数群を提供します。パフォーマンスを考慮し、メモ化を活用しています。
 * 
 * 主な機能：
 * - バス停の選択/解除
 * - ルート単位での一括選択/解除
 * - 全バス停の一括選択/解除
 * - ルートの展開/折りたたみ
 * - 選択状態の監視
 * 
 * @example
 * ```tsx
 * const {
 *   toggleStop,
 *   isRouteFullySelected,
 *   // ... その他の機能
 * } = useStopSelection(routes, selectedStops, handleStopSelect);
 * ```
 * 
 * @param routes - 管理対象のバス路線配列
 * @param selectedStops - 現在選択されているバス停IDの配列
 * @param onStopSelect - バス停選択状態が変更された際のコールバック関数
 * 
 * @returns バス停選択に関する状態と操作関数群
 */
export function useStopSelection(
  routes: BusRoute[], 
  selectedStops: string[], 
  onStopSelect: (stopIds: string[]) => void
): UseStopSelectionReturn {
  // =====================================
  // State
  // =====================================
  
  const [expandedRoutes, setExpandedRoutes] = useState<string[]>([]);

  // =====================================
  // メモ化された値
  // =====================================

  /**
   * 全てのバス停情報をルート情報と共にフラット化
   */
  const allStops = useMemo<StopInfo[]>(() => {
    return routes.flatMap(route => 
      route.stops.map(stop => ({
        routeId: route.id,
        routeName: route.name,
        routeColor: route.color,
        stop
      }))
    );
  }, [routes]);

  /**
   * ルートごとのバス停情報をグループ化
   */
  const stopsByRoute = useMemo(() => {
    return routes.map(route => ({ 
      route, 
      stops: route.stops 
    }));
  }, [routes]);

  /**
   * 全バス停が選択されているかどうかを判定
   */
  const areAllStopsSelected = useMemo(() => {
    return allStops.length > 0 && 
      allStops.every(item => selectedStops.includes(item.stop.id));
  }, [allStops, selectedStops]);

  // =====================================
  // コールバック関数
  // =====================================

  /**
   * 特定のバス停の選択状態を切り替え
   */
  const toggleStop = useCallback((stopId: string) => {
    if (!stopId) return; // 無効なIDの場合は何もしない

    onStopSelect(
      selectedStops.includes(stopId)
        ? selectedStops.filter(id => id !== stopId)
        : [...selectedStops, stopId]
    );
  }, [selectedStops, onStopSelect]);

  /**
   * ルート内の全バス停の選択状態を切り替え
   */
  const toggleAllStopsInRoute = useCallback((routeId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // イベントの伝播を防止
    
    const route = routes.find(r => r.id === routeId);
    if (!route) return; // 無効なルートIDの場合は何もしない

    const stopIdsInRoute = route.stops.map(stop => stop.id);
    const allSelected = stopIdsInRoute.every(id => selectedStops.includes(id));

    onStopSelect(
      allSelected
        ? selectedStops.filter(id => !stopIdsInRoute.includes(id))
        : [...new Set([...selectedStops, ...stopIdsInRoute])] // 重複を排除
    );
  }, [routes, selectedStops, onStopSelect]);

  /**
   * 全バス停の選択状態を切り替え
   */
  const toggleAllStops = useCallback(() => {
    const allStopIds = allStops.map(item => item.stop.id);
    const allSelected = allStopIds.every(id => selectedStops.includes(id));

    onStopSelect(allSelected ? [] : [...new Set(allStopIds)]); // 重複を排除
  }, [allStops, selectedStops, onStopSelect]);

  /**
   * ルートの展開状態を切り替え
   */
  const toggleRouteExpansion = useCallback((routeId: string) => {
    if (!routeId) return; // 無効なIDの場合は何もしない

    setExpandedRoutes(prev => 
      prev.includes(routeId)
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  }, []);

  /**
   * ルートの全選択状態を確認
   */
  const isRouteFullySelected = useCallback((route: BusRoute) => {
    if (!route?.stops?.length) return false; // 無効なルートの場合はfalse
    return route.stops.every(stop => selectedStops.includes(stop.id));
  }, [selectedStops]);

  /**
   * ルートの部分選択状態を確認
   */
  const isRoutePartiallySelected = useCallback((route: BusRoute) => {
    if (!route?.stops?.length) return false; // 無効なルートの場合はfalse
    const hasSelected = route.stops.some(stop => selectedStops.includes(stop.id));
    return hasSelected && !isRouteFullySelected(route);
  }, [selectedStops, isRouteFullySelected]);

  // =====================================
  // 戻り値
  // =====================================

  return {
    expandedRoutes,
    allStops,
    stopsByRoute,
    toggleStop,
    toggleAllStopsInRoute,
    toggleAllStops,
    toggleRouteExpansion,
    isRouteFullySelected,
    isRoutePartiallySelected,
    areAllStopsSelected
  };
}