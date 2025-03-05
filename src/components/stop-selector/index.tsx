import { memo, useCallback } from 'react';
import { Check, MapPin, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { RouteStopList } from './RouteStopList';
import { useStopSelection } from '@/hooks/useStopSelection';
import type { StopSelectorProps } from './types';

// =====================================
// 定数定義
// =====================================
const CONSTANTS = {
  ACCORDION: {
    VALUE: 'stops',
  },
  BUTTON: {
    VARIANTS: {
      OUTLINE: 'outline',
    },
  },
  THEME: {
    COLORS: {
      ICON: 'text-gray-600 dark:text-gray-300',
      TEXT: 'text-gray-800 dark:text-white',
      BUTTON: {
        TEXT: 'text-gray-700 dark:text-gray-300',
        BORDER: 'border-gray-300 dark:border-gray-700',
        HOVER: 'hover:bg-gray-100 dark:hover:bg-gray-800',
      },
    },
  },
  ARIA_LABELS: {
    SECTION: 'バス停選択セクション',
    ROUTE_LIST: 'バス路線一覧',
    SELECT_ALL: (isSelected: boolean) => 
      isSelected ? 'すべてのバス停を解除' : 'すべてのバス停を選択',
  },
} as const;

// =====================================
// ヘッダーコンポーネント
// アコーディオンのヘッダー部分を表示し、バス停選択機能へのアクセスを提供
// =====================================
const StopSelectorHeader = memo(function StopSelectorHeader() {
  return (
    <AccordionTrigger 
      className={`text-lg font-medium ${CONSTANTS.THEME.COLORS.TEXT}`}
    >
      <div className="flex items-center">
        <MapPin 
          className={`h-5 w-5 mr-2 ${CONSTANTS.THEME.COLORS.ICON}`}
          aria-hidden="true"
        />
        <span>バス停を選択</span>
      </div>
    </AccordionTrigger>
  );
});

// =====================================
// 全選択/全解除ボタンコンポーネント
// すべてのバス停の選択状態を一括で切り替えるボタンを提供
// =====================================
interface SelectAllButtonProps {
  /** すべてのバス停が選択されているかどうか */
  isAllSelected: boolean;
  /** クリック時のコールバック関数 */
  onClick: () => void;
}

const SelectAllButton = memo(function SelectAllButton({
  isAllSelected,
  onClick,
}: SelectAllButtonProps) {
  const buttonText = isAllSelected ? 'すべて解除' : 'すべて選択';
  const Icon = isAllSelected ? X : Check;

  return (
    <Button 
      variant={CONSTANTS.BUTTON.VARIANTS.OUTLINE}
      onClick={onClick}
      className={`w-full mb-4 ${CONSTANTS.THEME.COLORS.BUTTON.BORDER} ${CONSTANTS.THEME.COLORS.BUTTON.TEXT} ${CONSTANTS.THEME.COLORS.BUTTON.HOVER}`}
      type="button"
      aria-label={CONSTANTS.ARIA_LABELS.SELECT_ALL(isAllSelected)}
    >
      <span className="flex items-center">
        <Icon 
          className="h-4 w-4 mr-2" 
          aria-hidden="true" 
        />
        {buttonText}
      </span>
    </Button>
  );
});

// =====================================
// メインのバス停選択コンポーネント
// 
// 機能:
// - アコーディオン形式でバス停選択インターフェースを提供
// - 路線ごとのバス停一覧表示
// - 全選択/全解除機能
// - 個別のバス停選択
// - ダークモード対応
// - アクセシビリティ対応
// 
// 使用例:
// <StopSelector
//   routes={busRoutes}
//   selectedStops={selectedStops}
//   onStopSelect={setSelectedStops}
// />
// =====================================
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

  // バス停の選択状態を切り替えるコールバック
  const handleToggleStop = useCallback((stopId: string) => {
    toggleStop(stopId);
  }, [toggleStop]);

  // ルート内のすべてのバス停の選択状態を切り替えるコールバック
  const handleToggleAllStopsInRoute = useCallback((routeId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // イベントの伝播を防止
    toggleAllStopsInRoute(routeId, e);
  }, [toggleAllStopsInRoute]);

  // ルートの展開状態を切り替えるコールバック
  const handleToggleRouteExpansion = useCallback((routeId: string) => {
    toggleRouteExpansion(routeId);
  }, [toggleRouteExpansion]);

  return (
    <section 
      className="w-full"
      aria-label={CONSTANTS.ARIA_LABELS.SECTION}
    >
      <Accordion 
        type="single" 
        collapsible 
        className="w-full"
      >
        <AccordionItem value={CONSTANTS.ACCORDION.VALUE}>
          <StopSelectorHeader />
          
          <AccordionContent>
            <div className="mb-4">
              <SelectAllButton 
                isAllSelected={areAllStopsSelected}
                onClick={toggleAllStops}
              />
               
              <ul 
                className="space-y-3"
                aria-label={CONSTANTS.ARIA_LABELS.ROUTE_LIST}
              >
                {stopsByRoute.map(({ route }) => (
                  <RouteStopList
                    key={route.id}
                    route={route}
                    selectedStops={selectedStops}
                    onStopSelect={handleToggleStop}
                    onSelectAllStops={handleToggleAllStopsInRoute}
                    isExpanded={expandedRoutes.includes(route.id)}
                    onToggleExpand={() => handleToggleRouteExpansion(route.id)}
                    isFullySelected={isRouteFullySelected(route)}
                    isPartiallySelected={isRoutePartiallySelected(route)}
                  />
                ))}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}