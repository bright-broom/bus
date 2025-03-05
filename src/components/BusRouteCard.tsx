"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { BusRoute } from "@/lib/types";
import { getUpcomingDepartures } from "@/lib/utils";
import { MapPin, Clock, AlertCircle } from "lucide-react";

// =============================
// Props: BusRouteCard
// =============================
interface BusRouteCardProps {
  route: BusRoute;
}

// =============================
// BusRouteCard コンポーネント
// =============================
export function BusRouteCard({ route }: BusRouteCardProps) {
  // ステート: 各バス停の出発時刻情報
  const [upcomingDeparturesByStop, setUpcomingDeparturesByStop] = useState<
    Record<string, { stopName: string; departureTime: string; minutesUntil: number }[]>
  >({});

  // 定数: 出発時間に応じたスタイル
  const TIME_STYLES: Record<string, string> = {
    imminent: "text-red-600 dark:text-red-400 font-bold",
    soon: "text-orange-600 dark:text-orange-400 font-semibold",
    later: "text-gray-700 dark:text-gray-300",
  };

  // 関数: 出発時刻のデータを更新
  const updateDepartures = useCallback(() => {
    const departures: Record<string, { stopName: string; departureTime: string; minutesUntil: number }[]> = {};

    for (const stop of route.stops) {
      departures[stop.id] = getUpcomingDepartures(
        { ...route, stops: [stop] },
        3 // 各バス停ごとに最大3つの出発時刻を表示
      );
    }

    setUpcomingDeparturesByStop(departures);
  }, [route]);

  // エフェクト: 1分ごとに出発時刻を更新
  useEffect(() => {
    updateDepartures();
    const interval = setInterval(updateDepartures, 60000);
    return () => clearInterval(interval);
  }, [updateDepartures]);

  // 判定: すべてのバス停に出発時刻があるか
  const hasNoDepartures = Object.values(upcomingDeparturesByStop).every(
    (departures) => !departures || departures.length === 0
  );

  // 関数: 出発までの時間に応じたスタイルを取得
  const getTimeStyle = (minutesUntil: number) => {
    if (minutesUntil <= 5) return TIME_STYLES.imminent;
    if (minutesUntil <= 15) return TIME_STYLES.soon;
    return TIME_STYLES.later;
  };

  return (
    <Card className="border-l-4 transition-shadow hover:shadow-md" style={{ borderLeftColor: route.color }}>
      {/* ヘッダー: バス路線のタイトル */}
      <CardHeader className="flex items-center" style={{ backgroundColor: `${route.color}20` }}>
        <CardTitle className="flex items-center text-lg gap-2">
          {/* shadcn/ui の Badge を使用 */}
          <Badge style={{ backgroundColor: route.color }} className="text-white">
            {route.name}
          </Badge>
        </CardTitle>
      </CardHeader>

      {/* コンテンツ: バス停と出発情報 */}
      <CardContent className="pt-4 bg-white dark:bg-gray-900">
        {hasNoDepartures ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
            <p>本日の運行は終了しました</p>
          </div>
        ) : (
          <div className="space-y-6">
            {route.stops.map((stop) => {
              const departures = upcomingDeparturesByStop[stop.id] || [];
              if (departures.length === 0) return null;

              return (
                <div key={stop.id}>
                  {/* バス停の名前 */}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
                    <h3 className="font-medium text-sm">{stop.name}</h3>
                  </div>

                  {/* 出発時刻リスト */}
                  <ul className="space-y-3 mt-2">
                    {departures.map((departure, index) => (
                      <li
                        key={`${departure.stopName}-${departure.departureTime}-${index}`}
                        className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded-lg"
                      >
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
                          <span className="font-medium text-gray-800 dark:text-white">{departure.departureTime}</span>
                        </div>
                        <span className={getTimeStyle(departure.minutesUntil)}>
                          {departure.minutesUntil <= 0 ? "出発中" : `${departure.minutesUntil}分後`}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* shadcn/ui の Separator を使用 */}
                  <Separator className="my-4 last:hidden" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
