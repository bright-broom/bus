import { prisma } from '../src/lib/prisma';
import { SAMPLE_ROUTES } from '../src/lib/data';

async function main() {
  try {
    console.log('データベースのシード処理を開始します...');

    // 既存のデータをクリア
    await prisma.$transaction([
      prisma.departure.deleteMany(),
      prisma.routeStop.deleteMany(),
      prisma.route.deleteMany(),
      prisma.stop.deleteMany(),
    ]);

    console.log('既存のデータを削除しました');

    // サンプルデータの挿入
    for (const route of SAMPLE_ROUTES) {
      // ルートの作成
      await prisma.route.create({
        data: {
          id: route.id,
          name: route.name,
          color: route.color,
        },
      });

      // 各バス停とその時刻表を作成
      for (const stop of route.stops) {
        // バス停の作成（既存の場合はスキップ）
        await prisma.stop.upsert({
          where: { id: stop.id },
          create: { id: stop.id, name: stop.name },
          update: { name: stop.name },
        });

        // ルートとバス停の関連付け
        await prisma.routeStop.create({
          data: {
            routeId: route.id,
            stopId: stop.id,
            stopOrder: route.stops.indexOf(stop),
          },
        });

        // 時刻表の作成
        for (const departure of stop.departures) {
          await prisma.departure.create({
            data: {
              routeId: route.id,
              stopId: stop.id,
              departureTime: departure.time,
              daysOfWeek: departure.dayOfWeek,
            },
          });
        }
      }
    }

    console.log('サンプルデータの挿入が完了しました');
  } catch (error) {
    console.error('シード処理でエラーが発生しました:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('シード処理が正常に完了しました');
    process.exit(0);
  })
  .catch((error) => {
    console.error('シード処理でエラーが発生しました:', error);
    process.exit(1);
  });