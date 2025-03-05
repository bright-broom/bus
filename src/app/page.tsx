import { BusRouteList } from '@/components/BusRouteList';
import { prisma } from '@/lib/prisma';
import { Clock } from '@/components/Clock';
import type { BusRoute, DayOfWeek } from '@/lib/types';
import { ALL_DAYS } from '@/lib/types';

// 文字列が有効な曜日かどうかをチェック
function isDayOfWeek(day: string): day is DayOfWeek {
  return ALL_DAYS.includes(day as DayOfWeek);
}

// 曜日の配列を安全に変換
function validateDaysOfWeek(days: string[]): DayOfWeek[] {
  return days.filter(isDayOfWeek);
}

export default async function Home() {
  // データベースからルート情報を取得
  const routes = await prisma.route.findMany({
    include: {
      routeStops: {
        include: {
          stop: {
            include: {
              departures: true,
            },
          },
        },
        orderBy: {
          stopOrder: 'asc',
        },
      },
    },
  });

  // データを整形
  const formattedRoutes: BusRoute[] = routes.map(route => ({
    id: route.id,
    name: route.name,
    color: route.color as `#${string}`,
    stops: route.routeStops.map(rs => ({
      id: rs.stop.id,
      name: rs.stop.name,
      departures: rs.stop.departures
        .filter(d => d.routeId === route.id)
        .map(d => ({
          time: d.departureTime as `${number}:${number}`,
          dayOfWeek: validateDaysOfWeek(d.daysOfWeek),
        })),
    })),
  }));

  return (
    <main className="container mx-auto p-4 min-h-screen">
      <div className="flex flex-col gap-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            バス時刻表アプリ
          </h1>
          <Clock />
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <BusRouteList initialRoutes={formattedRoutes} />
        </div>
      </div>
    </main>
  );
}
