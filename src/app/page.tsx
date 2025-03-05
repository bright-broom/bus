import { Clock } from '@/components/Clock';
import { BusRouteList } from '@/components/BusRouteList';
import { useMemo } from 'react';
import { Card } from '@/components/ui/card'; // shadcn/ui の Card コンポーネントを利用

// =============================
// 定数: フッターの文言（変更しやすくするため）
// =============================
const FOOTER_TEXT = 'バススケジュールアプリ - すべての路線情報は例示目的のみです';

export default function Home() {
  // =============================
  // フッター用: 年の取得を最適化（useMemo 使用）
  // =============================
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-950">
      {/* 現在時刻を表示するコンポーネント */}
      <Clock />

      {/* メインコンテンツ: バス路線リスト */}
      <main className="container mx-auto flex-grow py-8 px-4 animate-fade-in">
        <BusRouteList />
      </main>

      {/* 固定フッター (shadcn/ui の Card を利用) */}
      <Card className="w-full text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <p className="p-3">© {currentYear} {FOOTER_TEXT}</p>
      </Card>
    </div>
  );
}
