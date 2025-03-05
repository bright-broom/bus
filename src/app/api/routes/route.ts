import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

// バリデーションスキーマ
const RouteSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  stops: z.array(z.object({
    id: z.string(),
    name: z.string(),
    order: z.number(),
    departures: z.array(z.object({
      time: z.string().regex(/^\d{1,2}:\d{2}$/),
      daysOfWeek: z.array(z.string())
    }))
  }))
});

type RouteInput = z.infer<typeof RouteSchema>;

// GET: 全ての路線を取得
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

    return NextResponse.json(routes);
  } catch (error) {
    console.error('Routes fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routes' },
      { status: 500 }
    );
  }
}

// POST: 新しい路線を作成
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const validatedData = RouteSchema.parse(json);

    const route = await prisma.$transaction(async (tx) => {
      // 1. ルートの作成
      const route = await tx.route.create({
        data: {
          id: validatedData.id,
          name: validatedData.name,
          color: validatedData.color,
        },
      });

      // 2. 各停留所とその時刻表を作成
      for (const stop of validatedData.stops) {
        // 停留所の作成（既存の場合はスキップ）
        await tx.stop.upsert({
          where: { id: stop.id },
          create: { id: stop.id, name: stop.name },
          update: { name: stop.name },
        });

        // ルートと停留所の関連付け
        await tx.routeStop.create({
          data: {
            routeId: route.id,
            stopId: stop.id,
            stopOrder: stop.order,
          },
        });

        // 時刻表の作成
        for (const departure of stop.departures) {
          await tx.departure.create({
            data: {
              routeId: route.id,
              stopId: stop.id,
              departureTime: departure.time,
              daysOfWeek: departure.daysOfWeek,
            },
          });
        }
      }

      return route;
    });

    return NextResponse.json(route, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Route creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create route' },
      { status: 500 }
    );
  }
}

// PUT: 路線を更新
export async function PUT(request: NextRequest) {
  try {
    const json = await request.json();
    const validatedData = RouteSchema.parse(json);

    const route = await prisma.$transaction(async (tx) => {
      // 1. ルート情報の更新
      const route = await tx.route.update({
        where: { id: validatedData.id },
        data: {
          name: validatedData.name,
          color: validatedData.color,
        },
      });

      // 2. 既存の関連データを削除
      await tx.routeStop.deleteMany({
        where: { routeId: route.id },
      });
      await tx.departure.deleteMany({
        where: { routeId: route.id },
      });

      // 3. 新しい停留所と時刻表データを作成
      for (const stop of validatedData.stops) {
        await tx.stop.upsert({
          where: { id: stop.id },
          create: { id: stop.id, name: stop.name },
          update: { name: stop.name },
        });

        await tx.routeStop.create({
          data: {
            routeId: route.id,
            stopId: stop.id,
            stopOrder: stop.order,
          },
        });

        for (const departure of stop.departures) {
          await tx.departure.create({
            data: {
              routeId: route.id,
              stopId: stop.id,
              departureTime: departure.time,
              daysOfWeek: departure.daysOfWeek,
            },
          });
        }
      }

      return route;
    });

    return NextResponse.json(route);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Route update error:', error);
    return NextResponse.json(
      { error: 'Failed to update route' },
      { status: 500 }
    );
  }
}

// DELETE: 路線を削除
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

    await prisma.$transaction([
      prisma.departure.deleteMany({ where: { routeId: id } }),
      prisma.routeStop.deleteMany({ where: { routeId: id } }),
      prisma.route.delete({ where: { id } })
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Route deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete route' },
      { status: 500 }
    );
  }
}