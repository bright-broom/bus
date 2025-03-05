'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCurrentDayOfWeek } from '@/lib/utils';
import { Clock as ClockIcon, Calendar, Bus } from 'lucide-react';

export function Clock() {
  // =============================
  // ステート: 現在時刻
  // =============================
  const [currentTime, setCurrentTime] = useState(new Date());

  // =============================
  // エフェクト: 1秒ごとに現在時刻を更新
  // =============================
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => clearInterval(interval);
  }, []);

  // =============================
  // 定数: 曜日の日本語表記（useMemo でキャッシュ）
  // =============================
  const dayNames = useMemo(
    () => ({
      monday: '月曜日',
      tuesday: '火曜日',
      wednesday: '水曜日',
      thursday: '木曜日',
      friday: '金曜日',
      saturday: '土曜日',
      sunday: '日曜日',
    }),
    []
  );

  // =============================
  // 現在の曜日を取得し、安全に処理
  // =============================
  const currentDay = getCurrentDayOfWeek() as keyof typeof dayNames;
  const dayLabel = dayNames[currentDay] || '不明な曜日';

  // =============================
  // 現在時刻のフォーマット（useMemo で最適化）
  // =============================
  const formattedTime = useMemo(
    () =>
      currentTime.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    [currentTime]
  );

  // =============================
  // 曜日に応じた色の設定
  // =============================
  const isDayOff = currentDay === 'saturday' || currentDay === 'sunday';
  const dayColor = isDayOff ? 'text-blue-400 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300';

  // =============================
  // 日付のフォーマット
  // =============================
  const formattedDate = useMemo(
    () =>
      currentTime.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [currentTime]
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* グラデーションの背景 */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
        <div className="container mx-auto py-1 px-4">
          <div className="flex justify-end items-center text-white text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
      
      {/* メインヘッダー */}
      <div className="bg-white dark:bg-gray-900 shadow-lg backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
        <div className="container mx-auto py-3 px-4">
          <div className="flex justify-between items-center">
            {/* タイトルとロゴ */}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-2 rounded-lg shadow-md">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
                バススケジュール
              </h1>
            </div>

            {/* 時計 & 曜日表示 */}
            <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-full px-4 py-2 shadow-inner">
              <ClockIcon className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2" />
              <div className="flex flex-col">
                {/* 現在時刻（動的更新） */}
                <div className="text-lg font-bold text-gray-800 dark:text-white tracking-wide" aria-live="polite" role="timer">
                  {formattedTime}
                </div>

                {/* 曜日表示（色は土日で変化） */}
                <div className={`text-xs font-medium ${dayColor} -mt-1`} aria-label="現在の曜日">
                  {dayLabel}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
