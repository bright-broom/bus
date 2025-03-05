import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';
import { parseCSVData } from './importUtils';
import type { BusRoute } from './types';

export async function migrateDataToDatabase(file: File): Promise<void> {
  try {
    // CSVデータをパース
    const routes = await parseCSVData(file);
    
    // トランザクションでデータを一括登録
    await prisma.$transaction(async (tx: PrismaClient) => {
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
              stopOrder: route.stops.indexOf(stop), // 配列のインデックスを順序として使用
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
  } catch (error) {
    console.error('Migration error:', error);
    throw new Error('Failed to migrate data to database');
  }
}

/**
 * データベースの初期化（開発環境用）
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // 既存のデータをクリア
    await prisma.$transaction([
      prisma.departure.deleteMany(),
      prisma.routeStop.deleteMany(),
      prisma.route.deleteMany(),
      prisma.stop.deleteMany(),
    ]);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw new Error('Failed to initialize database');
  }
}

/**
 * データベースの状態をチェック
 */
export async function checkDatabaseStatus(): Promise<{
  routeCount: number;
  stopCount: number;
  departureCount: number;
}> {
  const [routeCount, stopCount, departureCount] = await Promise.all([
    prisma.route.count(),
    prisma.stop.count(),
    prisma.departure.count(),
  ]);

  return {
    routeCount,
    stopCount,
    departureCount,
  };
}