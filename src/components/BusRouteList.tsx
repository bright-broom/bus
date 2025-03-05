'use client';

import { useState, useMemo, useCallback } from 'react';
import { BusRouteCard } from '@/components/BusRouteCard';
import { SAMPLE_ROUTES as defaultBusRoutes } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ImportDataDialog } from '@/components/ImportDataDialog';
import { StopSelector } from '@/components/stop-selector';
import { RouteIndicator } from '@/components/ui/common';
import type { BusRoute } from '@/lib/types';

export function BusRouteList() {
  // =============================
  // ステート管理
  // =============================
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>(defaultBusRoutes);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // =============================
  // すべてのルートを選択・解除
  // =============================
  const toggleAllRoutes = useCallback(() => {
    setSelectedRoutes((prevSelectedRoutes) =>
      prevSelectedRoutes.length === busRoutes.length ? [] : busRoutes.map(route => route.id)
    );
  }, [busRoutes]);

  // =============================
  // 特定のルートを選択・解除
  // =============================
  const toggleRoute = useCallback((routeId: string) => {
    setSelectedRoutes((prevSelectedRoutes) =>
      prevSelectedRoutes.includes(routeId)
        ? prevSelectedRoutes.filter(id => id !== routeId)
        : [...prevSelectedRoutes, routeId]
    );
  }, []);

  // =============================
  // インポートされたデータを処理
  // =============================
  const handleImportedData = useCallback((importedRoutes: BusRoute[]) => {
    setBusRoutes(importedRoutes);
    setSelectedRoutes([]);
    setSelectedStops([]);
  }, []);

  // =============================
  // 表示するルートのフィルタリング
  // =============================
  const routesToDisplay = useMemo(() => {
    return selectedRoutes.length > 0
      ? busRoutes.filter(route => selectedRoutes.includes(route.id))
      : busRoutes;
  }, [busRoutes, selectedRoutes]);

  const filteredRoutes = useMemo(() => {
    if (selectedStops.length === 0) return routesToDisplay;

    return routesToDisplay
      .map(route => ({
        ...route,
        stops: route.stops.filter(stop => selectedStops.includes(stop.id))
      }))
      .filter(route => route.stops.length > 0);
  }, [routesToDisplay, selectedStops]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* フィルター設定エリア */}
      <div className="mb-8 mt-24 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">フィルター設定</h2>

        {/* ルート選択アコーディオン */}
        <Accordion type="single" collapsible className="w-full mb-4">
          <AccordionItem value="routes">
            <AccordionTrigger className="text-lg font-medium text-gray-800 dark:text-white">
              ルートを選択
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2 mb-4 sm:grid-cols-4">
                {busRoutes.map(route => {
                  const isSelected = selectedRoutes.includes(route.id);
                  return (
                    <Button
                      key={route.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className="w-full justify-start mb-2 last:mb-0"
                      onClick={() => toggleRoute(route.id)}
                      type="button"
                      style={{
                        backgroundColor: isSelected ? route.color : undefined,
                        borderColor: route.color,
                      }}
                      data-selected={isSelected}
                    >
                      <RouteIndicator
                        className="mr-2"
                        style={{ backgroundColor: isSelected ? 'white' : route.color }}
                        aria-hidden="true"
                      />
                      <span className="truncate">{route.name}</span>
                    </Button>
                  );
                })}
              </div>
              <Button 
                variant="outline" 
                onClick={toggleAllRoutes}
                className="w-full"
                type="button"
              >
                {selectedRoutes.length === busRoutes.length ? 'すべて解除' : 'すべて選択'}
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* バス停選択コンポーネント */}
        <StopSelector routes={routesToDisplay} selectedStops={selectedStops} onStopSelect={setSelectedStops} />

        {/* データインポートボタン */}
        <div className="mt-6 border-t pt-4">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)} className="w-full" type="button">
            CSVからデータをインポート
          </Button>
        </div>
      </div>

      {/* フィルター情報表示 */}
      {(selectedRoutes.length > 0 || selectedStops.length > 0) && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm flex items-center">
          <div>
            <span className="font-medium">フィルター適用中:</span> 
            {selectedRoutes.length > 0 && <span className="ml-1">{selectedRoutes.length}ルート</span>}
            {selectedStops.length > 0 && <span className="ml-1">{selectedStops.length}バス停</span>}
          </div>
          <button type="button" onClick={() => { setSelectedRoutes([]); setSelectedStops([]); }} className="ml-auto text-xs hover:underline">
            クリア
          </button>
        </div>
      )}

      {/* バスルートカード一覧 */}
      <div className="grid gap-6">
        {filteredRoutes.length > 0 ? (
          filteredRoutes.map(route => <BusRouteCard key={route.id} route={route} />)
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <p className="text-gray-500">
              {busRoutes.length > 0 
                ? 'ルートまたはバス停を選択してください' 
                : 'データがありません。CSVからデータをインポートしてください'}
            </p>
            {busRoutes.length === 0 && (
              <Button type="button" variant="outline" onClick={() => setIsImportDialogOpen(true)} className="mt-4">
                データをインポート
              </Button>
            )}
          </div>
        )}
      </div>

      {/* インポートダイアログ */}
      <ImportDataDialog isOpen={isImportDialogOpen} onClose={() => setIsImportDialogOpen(false)} onImport={handleImportedData} />
    </div>
  );
}
