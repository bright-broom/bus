import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseCSVData } from '@/lib/importUtils';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

/**
 * CSVインポートのレスポンス型
 */
type ImportResponse = {
  message?: string;
  error?: string;
  refresh?: boolean;
  details?: {
    routesProcessed: number;
    stopsProcessed: number;
    departuresProcessed: number;
  };
};

/**
 * バッチ処理の設定
 */
const BATCH_SIZE = 100;

/**
 * バリデーションスキーマ
 */
const FileSchema = z.instanceof(File).refine((file) => {
  return file.type === 'text/csv' || file.name.endsWith('.csv');
}, 'CSVファイルのみ対応しています');

/**
 * データベース操作のヘルパー関数
 */
class DatabaseOperations {
  constructor(private tx: Prisma.TransactionClient) {}

  /**
   * 既存データの削除
   */
  async clearExistingData() {
    await this.tx.departure.deleteMany();
    await this.tx.routeStop.deleteMany();
    await this.tx.route.deleteMany();
    // Note: バス停は他のルートで共有される可能性があるため、削除しない
  }

  /**
   * バス停情報の一括更新
   */
  async upsertStops(stops: { id: string; name: string }[]) {
    const batchedStops = [];
    for (let i = 0; i < stops.length; i += BATCH_SIZE) {
      const batch = stops.slice(i, i + BATCH_SIZE);
      const operations = batch.map(stop => 
        this.tx.stop.upsert({
          where: { id: stop.id },
          create: { id: stop.id, name: stop.name },
          update: { name: stop.name },
        })
      );
      batchedStops.push(...await Promise.all(operations));
    }
    return batchedStops;
  }

  /**
   * ルート情報の一括作成
   */
  async createRoutes(routes: { id: string; name: string; color: string }[]) {
    const batchedRoutes = [];
    for (let i = 0; i < routes.length; i += BATCH_SIZE) {
      const batch = routes.slice(i, i + BATCH_SIZE);
      const operations = batch.map(route =>
        this.tx.route.create({
          data: {
            id: route.id,
            name: route.name,
            color: route.color,
          },
        })
      );
      batchedRoutes.push(...await Promise.all(operations));
    }
    return batchedRoutes;
  }

  /**
   * ルートとバス停の関連付けを一括作成
   */
  async createRouteStops(routeStops: { routeId: string; stopId: string; stopOrder: number }[]) {
    const batchedRouteStops = [];
    for (let i = 0; i < routeStops.length; i += BATCH_SIZE) {
      const batch = routeStops.slice(i, i + BATCH_SIZE);
      const operations = batch.map(rs =>
        this.tx.routeStop.create({
          data: {
            routeId: rs.routeId,
            stopId: rs.stopId,
            stopOrder: rs.stopOrder,
          },
        })
      );
      batchedRouteStops.push(...await Promise.all(operations));
    }
    return batchedRouteStops;
  }

  /**
   * 時刻表データの一括作成
   */
  async createDepartures(departures: {
    routeId: string;
    stopId: string;
    departureTime: string;
    daysOfWeek: string[];
  }[]) {
    const batchedDepartures = [];
    for (let i = 0; i < departures.length; i += BATCH_SIZE) {
      const batch = departures.slice(i, i + BATCH_SIZE);
      const operations = batch.map(dep =>
        this.tx.departure.create({
          data: {
            routeId: dep.routeId,
            stopId: dep.stopId,
            departureTime: dep.departureTime,
            daysOfWeek: dep.daysOfWeek,
          },
        })
      );
      batchedDepartures.push(...await Promise.all(operations));
    }
    return batchedDepartures;
  }
}

/**
 * CSVインポートのメインハンドラー
 */
export async function POST(request: NextRequest) {
  try {
    // フォームデータの取得と検証
    const formData = await request.formData();
    const file = formData.get('file');
    const validationResult = FileSchema.safeParse(file);

    if (!validationResult.success) {
      const response: ImportResponse = {
        error: validationResult.error.message,
        message: 'ファイルの検証に失敗しました'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // CSVデータのパース
    const routes = await parseCSVData(validationResult.data);

    // インポート統計の初期化
    const stats = {
      routesProcessed: 0,
      stopsProcessed: 0,
      departuresProcessed: 0,
    };

    // トランザクションでデータを一括処理
    await prisma.$transaction(async (tx) => {
      const db = new DatabaseOperations(tx);
      
      // 既存データのクリア
      await db.clearExistingData();

      // 全バス停の情報を収集
      const allStops = routes.flatMap(route => 
        route.stops.map(stop => ({
          id: stop.id,
          name: stop.name,
        }))
      );

      // バス停の一括更新
      const uniqueStops = Array.from(
        new Map(allStops.map(stop => [stop.id, stop])).values()
      );
      await db.upsertStops(uniqueStops);
      stats.stopsProcessed = uniqueStops.length;

      // ルートの一括作成
      await db.createRoutes(routes);
      stats.routesProcessed = routes.length;

      // ルートとバス停の関連付けを一括作成
      const routeStops = routes.flatMap(route =>
        route.stops.map((stop, index) => ({
          routeId: route.id,
          stopId: stop.id,
          stopOrder: index,
        }))
      );
      await db.createRouteStops(routeStops);

      // 時刻表データの一括作成
      const departures = routes.flatMap(route =>
        route.stops.flatMap(stop =>
          stop.departures.map(dep => ({
            routeId: route.id,
            stopId: stop.id,
            departureTime: dep.time,
            daysOfWeek: dep.dayOfWeek,
          }))
        )
      );
      await db.createDepartures(departures);
      stats.departuresProcessed = departures.length;
    });

    // 成功レスポンスの返却
    const response: ImportResponse = {
      message: 'データのインポートが完了しました',
      refresh: true,
      details: stats,
    };
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    // エラーログの出力
    console.error('Import error:', error);

    // エラーレスポンスの返却
    const response: ImportResponse = {
      message: 'インポート処理でエラーが発生しました',
      error: error instanceof Error ? error.message : 'インポート中にエラーが発生しました'
    };

    return NextResponse.json(response, { 
      status: error instanceof Prisma.PrismaClientKnownRequestError ? 400 : 500 
    });
  }
}