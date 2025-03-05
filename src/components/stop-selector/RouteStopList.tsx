import { memo, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RouteIndicator } from '@/components/ui/common';
import { StopCheckbox } from './StopCheckbox';
import type { RouteStopListProps } from './types';
import type { BusStop } from '@/lib/types';
import { cn } from '@/lib/utils';

// =====================================
// 定数定義
// =====================================
const CONSTANTS = {
  BUTTON: {
    VARIANTS: {
      ghost: 'ghost',
    },
    SIZES: {
      sm: 'sm',
    },
  },
  ARIA: {
    SELECT_ALL: (routeName: string, isSelected: boolean) =>
      `${routeName}のすべてのバス停を${isSelected ? '解除' : '選択'}`,
    PARTIALLY_SELECTED: '一部選択中',
    VALUES: {
      TRUE: 'true',
      FALSE: 'false',
    },
  },
  CLASSES: {
    ROUTE_HEADER: {
      BASE: 'flex justify-between items-center w-full p-3 text-left rounded-sm transition-colors',
      COLORS: 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800',
    },
    CHEVRON: {
      BASE: 'w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200',
      EXPANDED: 'rotate-90',
    },
    STOP_LIST: {
      CONTAINER: 'grid grid-cols-1 sm:grid-cols-2 gap-2 list-none',
      ITEM: 'flex items-center py-1',
    },
  },
} as const;

// =====================================
// 型定義
// =====================================
interface RouteHeaderProps {
  routeId: string;
  routeName: string;
  routeColor: string;
  stopCount: number;
  isExpanded: boolean;
  isFullySelected: boolean;
  isPartiallySelected: boolean;
  onToggleExpand: () => void;
  onSelectAllStops: (e: React.MouseEvent) => void;
}

interface StopListProps {
  stops: BusStop[];
  selectedStops: string[];
  onStopSelect: (stopId: string) => void;
  'aria-labelledby': string;
  legendText: string;
}

// =====================================
// RouteHeader コンポーネント
// バス路線の概要情報とコントロールを表示
// =====================================
const RouteHeader = memo(function RouteHeader({
  routeId,
  routeName,
  routeColor,
  stopCount,
  isExpanded,
  isFullySelected,
  isPartiallySelected,
  onToggleExpand,
  onSelectAllStops,
}: RouteHeaderProps) {
  const headerId = `route-${routeId}-heading`;
  const panelId = `route-${routeId}-panel`;

  // ヘッダーの背景色をルートカラーの薄い色に設定
  const headerStyle = { backgroundColor: `${routeColor}20` };

  return (
    <Button
      variant="ghost"
      className={cn(
        CONSTANTS.CLASSES.ROUTE_HEADER.BASE,
        'transition-colors',
        {
          'bg-opacity-20': !isExpanded,
          'bg-opacity-30': isExpanded
        }
      )}
      style={{
        backgroundColor: routeColor
      }}
      onClick={onToggleExpand}
      aria-expanded={isExpanded}
      aria-controls={panelId}
      id={headerId}
      aria-haspopup="true"
    >
      {/* 路線情報セクション */}
      <div className="flex items-center flex-1 mr-2">
        <RouteIndicator
          className="mr-2"
          style={{ backgroundColor: routeColor }}
          aria-hidden="true"
        />
        
        <span className="font-medium text-gray-800 dark:text-white">
          {routeName}
        </span>
        
        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
          ({stopCount}箇所)
        </span>
        
        {isPartiallySelected && (
          <span className="ml-2 text-xs text-primary-500 dark:text-primary-400">
            ({CONSTANTS.ARIA.PARTIALLY_SELECTED})
          </span>
        )}
      </div>
      
      {/* コントロールセクション */}
      <div className="flex items-center">
        <Button
          variant={CONSTANTS.BUTTON.VARIANTS.ghost}
          size={CONSTANTS.BUTTON.SIZES.sm}
          onClick={onSelectAllStops}
          className="text-xs mr-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          type="button"
          aria-label={CONSTANTS.ARIA.SELECT_ALL(routeName, isFullySelected)}
        >
          {isFullySelected ? '解除' : '選択'}
        </Button>
        
        <ChevronRight
          className={cn(
            CONSTANTS.CLASSES.CHEVRON.BASE,
            isExpanded && CONSTANTS.CLASSES.CHEVRON.EXPANDED
          )}
          aria-hidden="true"
        />
      </div>
    </Button>
  );
});

// =====================================
// StopList コンポーネント
// バス停のチェックボックスリストを表示
// =====================================
const StopList = memo(function StopList({
  stops,
  selectedStops,
  onStopSelect,
  'aria-labelledby': labelledBy,
  legendText,
}: StopListProps) {
  return (
    <fieldset
      aria-labelledby={labelledBy}
    >
      <legend className="sr-only">{legendText}</legend>
      <ul className={CONSTANTS.CLASSES.STOP_LIST.CONTAINER}>
        {stops.map(stop => (
          <li key={stop.id} className={CONSTANTS.CLASSES.STOP_LIST.ITEM}>
            <StopCheckbox
              id={`stop-${stop.id}`}
              name={stop.name}
              isSelected={selectedStops.includes(stop.id)}
              onChange={() => onStopSelect(stop.id)}
            />
          </li>
        ))}
      </ul>
    </fieldset>
  );
});

// =====================================
// RouteStopList メインコンポーネント
// 路線ごとのバス停リストを管理し表示
// =====================================
export const RouteStopList = memo<RouteStopListProps>(function RouteStopList({
  route,
  selectedStops,
  onStopSelect,
  onSelectAllStops,
  isExpanded,
  onToggleExpand,
  isFullySelected,
  isPartiallySelected
}: RouteStopListProps) {
  // 全選択/解除ハンドラーのメモ化
  const handleSelectAllStops = useCallback((e: React.MouseEvent) => {
    // イベントの伝播を停止してアコーディオンの開閉を防ぐ
    e.stopPropagation();
    onSelectAllStops(route.id, e);
  }, [onSelectAllStops, route.id]);

  // IDの生成
  const headerId = `route-${route.id}-heading`;
  const panelId = `route-${route.id}-panel`;

  return (
    <li className="border rounded-lg overflow-hidden shadow-sm">
      <RouteHeader
        routeId={route.id}
        routeName={route.name}
        routeColor={route.color}
        stopCount={route.stops.length}
        isExpanded={isExpanded}
        isFullySelected={isFullySelected}
        isPartiallySelected={isPartiallySelected}
        onToggleExpand={onToggleExpand}
        onSelectAllStops={handleSelectAllStops}
      />
      
      {isExpanded && (
        <section 
          id={panelId}
          className="p-3 border-t bg-white dark:bg-gray-900"
          aria-labelledby={headerId}
        >
          <StopList
            stops={route.stops}
            selectedStops={selectedStops}
            onStopSelect={onStopSelect}
            aria-labelledby={headerId}
            legendText={`${route.name}のバス停一覧`}
          />
        </section>
      )}
    </li>
  );
});