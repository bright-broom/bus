import { memo } from 'react';
import { MapPin, Check, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RouteStopList } from './RouteStopList';
import { useStopSelection } from '@/hooks/useStopSelection';
import type { StopSelectorProps } from './types';

// =====================================
// スタイル定義
// =====================================

const STYLES = {
  wrapper: 'w-full',
  header: {
    trigger: 'text-lg font-medium text-gray-800 dark:text-white',
    icon: 'h-5 w-5 mr-2 text-gray-600 dark:text-gray-300'
  },
  toggleButton: 'w-full mb-4 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  buttonIcon: 'h-4 w-4 mr-2',
  routeList: 'space-y-3'
} as const;

// =====================================
// メモ化されたサブコンポーネント
// =====================================

// =============================
// セレクターヘッダーコンポーネント
// =============================
const SelectorHeader = memo(function SelectorHeader() {
  return (
    <div className="flex items-center">
      <MapPin className={STYLES.header.icon} />
      バス停を選択
    </div>
  );
});

// =============================
// 全選択/全解除ボタンコンポーネント
// =============================
interface ToggleAllButtonProps {
  areAllStopsSelected: boolean;
  onToggle: () => void;
}

const ToggleAllButton = memo(function ToggleAllButton({
  areAllStopsSelected,
  onToggle
}: ToggleAllButtonProps) {
  const label = areAllStopsSelected ? 'すべてのバス停を解除' : 'すべてのバス停を選択';
  const Icon = areAllStopsSelected ? X : Check;

  return (
    <Button 
      variant="outline" 
      onClick={onToggle}
      className={STYLES.toggleButton}
      type="button"
      aria-label={label}
    >
      <span className="flex items-center">
        <Icon className={STYLES.buttonIcon} aria-hidden="true" />
        {areAllStopsSelected ? 'すべて解除' : 'すべて選択'}
      </span>
    </Button>
  );
});

// =====================================
// メインコンポーネント
// =====================================

// =============================
// バス停選択コンポーネント
// =============================
/**
 * バス停選択コンポーネント
 * 
 * @description
 * アコーディオン形式でバス路線ごとのバス停選択インターフェースを提供します。
 * 主な機能：
 * - ルートごとのバス停表示と選択
 * - 全選択/全解除機能
 * - ルート単位の展開/折りたたみ
 * - アクセシビリティ対応
 * - ダークモード対応
// 
// @example
 * ```tsx
 * <StopSelector
 *   routes={busRoutes}
 *   selectedStops={selectedStops}
 *   onStopSelect={setSelectedStops}
 * />
 * ```
 */
export function StopSelector({ 
  routes, 
  selectedStops, 
  onStopSelect 
}: StopSelectorProps) {
  const {
    expandedRoutes,
    stopsByRoute,
    toggleStop,
    toggleAllStopsInRoute,
    toggleAllStops,
    toggleRouteExpansion,
    isRouteFullySelected,
    isRoutePartiallySelected,
    areAllStopsSelected
  } = useStopSelection(routes, selectedStops, onStopSelect);

  return (
    <section 
      className={STYLES.wrapper}
      aria-labelledby="stop-selector-title"
    >
      <Accordion 
        type="single" 
        collapsible 
        className={STYLES.wrapper}
      >
        <AccordionItem value="stops">
          {/* アコーディオンヘッダー */}
          <AccordionTrigger 
            className={STYLES.header.trigger}
            id="stop-selector-title"
          >
            <SelectorHeader />
          </AccordionTrigger>
          
          {/* アコーディオンコンテンツ */}
          <AccordionContent>
            <div className="mb-4">
              {/* 全選択/全解除ボタン */}
              <ToggleAllButton
                areAllStopsSelected={areAllStopsSelected}
                onToggle={toggleAllStops}
              />
              
              {/* ルート別バス停リスト */}
              <div className={STYLES.routeList}>
                {stopsByRoute.map(({ route }) => (
                  <RouteStopList
                    key={route.id}
                    route={route}
                    selectedStops={selectedStops}
                    onStopSelect={toggleStop}
                    onSelectAllStops={toggleAllStopsInRoute}
                    isExpanded={expandedRoutes.includes(route.id)}
                    onToggleExpand={() => toggleRouteExpansion(route.id)}
                    isFullySelected={isRouteFullySelected(route)}
                    isPartiallySelected={isRoutePartiallySelected(route)}
                  />
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}