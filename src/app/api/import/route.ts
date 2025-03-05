import { NextRequest, NextResponse } from 'next/server';
import { migrateDataToDatabase } from '@/lib/migrationUtils';

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

    await migrateDataToDatabase(file);

    return NextResponse.json(
      { message: 'データのインポートが完了しました' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'インポート中にエラーが発生しました' },
      { status: 500 }
    );
  }
}