import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma, type Route } from '@prisma/client';

// =============================================================================
// 型定義
// =============================================================================

/**
 * APIレスポンスの基本型
 */
type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  details?: unknown;
};

/**
 * ルート操作の結果型
 */
type RouteOperationResult = ApiResponse<Route> & {
  stats?: {
    stopsProcessed: number;
    departuresProcessed: number;
  };
};

// =============================================================================
// バリデーションスキーマ
// =============================================================================

/**
 * 時刻表エントリのスキーマ
 */
const DepartureSchema = z.object({
  time: z.string().regex(/^\d{1,2}:\d{2}$/, '時刻は "HH:MM" 形式で入力してください'),
  daysOfWeek: z.array(z.string()).min(1, '運行曜日を1つ以上選択してください')
});

/**
 * バス停のスキーマ
 */
const StopSchema = z.object({
  id: z.string().min(1, 'バス停IDは必須です'),
  name: z.string().min(1, 'バス停名は必須です'),
  order: z.number().int().min(0, '順序は0以上の整数である必要があります'),
  departures: z.array(DepartureSchema).min(1, '時刻表は1つ以上必要です')
});

/**
 * ルートのスキーマ
 */
const RouteSchema = z.object({
  id: z.string().min(1, 'ルートIDは必須です'),
  name: z.string().min(1, 'ルート名は必須です'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '色は16進数カラーコード（例：#FF0000）で指定してください'),
  stops: z.array(StopSchema).min(2, 'ルートには最低2つのバス停が必要です')
});

type RouteInput = z.infer<typeof RouteSchema>;

// =============================================================================
// データベース操作クラス
// =============================================================================

class RouteOperations {
  constructor(private tx: Prisma.TransactionClient) {}

  /**
   * バス停の一括更新
   */
  async upsertStops(stops: { id: string; name: string }[]) {
    return Promise.all(
      stops.map(stop =>
        this.tx.stop.upsert({
          where: { id: stop.id },
          create: { id: stop.id, name: stop.name },
          update: { name: stop.name }
        })
      )
    );
  }

  /**
   * ルートとバス停の関連付けを作成
   */
  async createRouteStops(routeId: string, stops: { id: string; order: number }[]) {
    return Promise.all(
      stops.map(stop =>
        this.tx.routeStop.create({
          data: {
            routeId,
            stopId: stop.id,
            stopOrder: stop.order
          }
        })
      )
    );
  }

  /**
   * 時刻表データの一括作成
   */
  async createDepartures(
    routeId: string,
    departures: { stopId: string; time: string; daysOfWeek: string[] }[]
  ) {
    return Promise.all(
      departures.map(dep =>
        this.tx.departure.create({
          data: {
            routeId,
            stopId: dep.stopId,
            departureTime: dep.time,
            daysOfWeek: dep.daysOfWeek
          }
        })
      )
    );
  }

  /**
   * 既存のルート関連データを削除
   */
  async deleteRouteData(routeId: string) {
    await this.tx.departure.deleteMany({ where: { routeId } });
    await this.tx.routeStop.deleteMany({ where: { routeId } });
  }
}

// =============================================================================
// エラーハンドリング
// =============================================================================

/**
 * APIエラーレスポンスを生成
 */
function handleApiError(error: unknown): NextResponse<ApiResponse> {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Invalid input', details: error.errors },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '既に存在するIDです' },
        { status: 409 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: '指定されたリソースが見つかりません' },
        { status: 404 }
      );
    }
  }

  console.error('API error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// =============================================================================
// APIハンドラー
// =============================================================================

/**
 * GET: 全てのルートを取得
 */
export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      include: {
        routeStops: {
          include: {
            stop: true
          },
          orderBy: {
            stopOrder: 'asc'
          }
        }
      }
    });

    return NextResponse.json({ data: routes });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST: 新しいルートを作成
 */
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const validatedData = RouteSchema.parse(json);

    const result = await prisma.$transaction(async (tx) => {
      const db = new RouteOperations(tx);
      const stats = {
        stopsProcessed: 0,
        departuresProcessed: 0
      };

      // 1. ルートの作成
      const route = await tx.route.create({
        data: {
          id: validatedData.id,
          name: validatedData.name,
          color: validatedData.color
        }
      });

      // 2. バス停の一括作成/更新
      await db.upsertStops(validatedData.stops);
      stats.stopsProcessed = validatedData.stops.length;

      // 3. ルートとバス停の関連付け
      await db.createRouteStops(
        route.id,
        validatedData.stops.map(stop => ({ id: stop.id, order: stop.order }))
      );

      // 4. 時刻表の一括作成
      const departures = validatedData.stops.flatMap(stop =>
        stop.departures.map(dep => ({
          stopId: stop.id,
          time: dep.time,
          daysOfWeek: dep.daysOfWeek
        }))
      );
      await db.createDepartures(route.id, departures);
      stats.departuresProcessed = departures.length;

      return { route, stats };
    });

    return NextResponse.json({
      data: result.route,
      stats: result.stats
    }, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT: ルートを更新
 */
export async function PUT(request: NextRequest) {
  try {
    const json = await request.json();
    const validatedData = RouteSchema.parse(json);

    const result = await prisma.$transaction(async (tx) => {
      const db = new RouteOperations(tx);
      const stats = {
        stopsProcessed: 0,
        departuresProcessed: 0
      };

      // 1. ルート情報の更新
      const route = await tx.route.update({
        where: { id: validatedData.id },
        data: {
          name: validatedData.name,
          color: validatedData.color
        }
      });

      // 2. 既存の関連データを削除
      await db.deleteRouteData(route.id);

      // 3. バス停の一括更新
      await db.upsertStops(validatedData.stops);
      stats.stopsProcessed = validatedData.stops.length;

      // 4. ルートとバス停の関連付け
      await db.createRouteStops(
        route.id,
        validatedData.stops.map(stop => ({ id: stop.id, order: stop.order }))
      );

      // 5. 時刻表の一括作成
      const departures = validatedData.stops.flatMap(stop =>
        stop.departures.map(dep => ({
          stopId: stop.id,
          time: dep.time,
          daysOfWeek: dep.daysOfWeek
        }))
      );
      await db.createDepartures(route.id, departures);
      stats.departuresProcessed = departures.length;

      return { route, stats };
    });

    return NextResponse.json({
      data: result.route,
      stats: result.stats
    });

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE: ルートを削除
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Route ID is required' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const db = new RouteOperations(tx);
      await db.deleteRouteData(id);
      await tx.route.delete({ where: { id } });
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    return handleApiError(error);
  }
}