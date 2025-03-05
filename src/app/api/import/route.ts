import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseCSVData } from '@/lib/importUtils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが提供されていません' },
        { status: 400 }
      );
    }

    // CSVデータをパース
    const routes = await parseCSVData(file);

    // トランザクションでデータを一括保存
    await prisma.$transaction(async (tx) => {
      // 既存のデータをクリア
      await tx.departure.deleteMany();
      await tx.routeStop.deleteMany();
      await tx.route.deleteMany();
      // バス停は他のルートで共有される可能性があるため、削除しない

      // 新しいデータを挿入
      for (const route of routes) {
        // ルートの作成
        await tx.route.create({
          data: {
            id: route.id,
            name: route.name,
            color: route.color,
          },
        });

        // 各バス停とその時刻表を作成
        for (const stop of route.stops) {
          // バス停の作成（既存の場合はスキップ）
          await tx.stop.upsert({
            where: { id: stop.id },
            create: { id: stop.id, name: stop.name },
            update: { name: stop.name },
          });

          // ルートとバス停の関連付け
          await tx.routeStop.create({
            data: {
              routeId: route.id,
              stopId: stop.id,
              stopOrder: route.stops.indexOf(stop),
            },
          });

          // 時刻表の作成
          for (const departure of stop.departures) {
            await tx.departure.create({
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
    });

    // クライアントをリフレッシュするためにレスポンスを返す
    return NextResponse.json({
      message: 'データのインポートが完了しました',
      refresh: true
    }, { status: 200 });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'インポート中にエラーが発生しました' },
      { status: 500 }
    );
  }
}