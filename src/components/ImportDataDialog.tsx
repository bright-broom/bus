'use client';

import { useState, useEffect } from 'react';
import type { BusRoute } from '@/lib/types';
import { Upload, FileUp, X, AlertCircle, Database } from 'lucide-react';

interface ImportDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (routes: BusRoute[]) => void;
}

export function ImportDataDialog({ isOpen, onClose, onImport }: ImportDataDialogProps) {
  // =============================
  // ステート管理
  // =============================
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  // =============================
  // ファイル選択時の処理
  // =============================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setProgress('');
  };

  // =============================
  // インポート処理
  // =============================
  const handleImport = async () => {
    if (!file) {
      setError('ファイルを選択してください');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress('データを解析中...');

    try {
      // ファイル拡張子のチェック
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

      if (fileExtension !== 'csv') {
        throw new Error(
          fileExtension === 'pdf'
            ? 'PDFファイルのインポートは現在サポートされていません'
            : 'サポートされていないファイル形式です。CSVファイルを選択してください'
        );
      }

      setProgress('データベースに保存中...');

      // FormDataの作成
      const formData = new FormData();
      formData.append('file', file);

      // APIエンドポイントにデータを送信
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'インポート中にエラーが発生しました');
      }

      setProgress('インポート完了！');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      setProgress('');
    } finally {
      setIsLoading(false);
    }
  };

  // =============================
  // ダイアログが閉じられた時にステートをリセット
  // =============================
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setError(null);
      setIsLoading(false);
      setProgress('');
    }
  }, [isOpen]);

  // ダイアログが開いていない場合はレンダリングしない
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 relative animate-slide-up">
        {/* 閉じるボタン */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="閉じる"
          type="button"
        >
          <X size={20} />
        </button>
        
        {/* タイトル */}
        <h2 id="import-dialog-title" className="text-xl font-bold mb-5 text-gray-800 dark:text-white flex items-center">
          <Database className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" />
          データベースにインポート
        </h2>

        {/* ファイルアップロード */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-900 hover:border-primary-500 dark:hover:border-primary-400 transition-colors group">
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            className="hidden" 
            id="file-upload" 
            aria-label="CSVファイルを選択" 
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <Upload 
              className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors" 
              strokeWidth={1.5}
            />
            <span className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              ファイルを選択またはドラッグ＆ドロップ
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              CSVファイルのみ
            </span>
          </label>
          {file && (
            <div className="mt-3 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-md flex items-center justify-center">
              <p className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-full">
                {file.name}
              </p>
            </div>
          )}
        </div>

        {/* 進捗表示 */}
        {progress && (
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 text-sm text-primary-600 dark:text-primary-400 rounded-md flex items-start">
            <Database className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{progress}</p>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="mt-4 p-3 bg-danger-50 dark:bg-danger-900/20 text-sm text-danger-600 dark:text-danger-400 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* ボタン */}
        <div className="flex justify-end space-x-3 mt-5">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
            type="button"
          >
            キャンセル
          </button>
          <button 
            onClick={handleImport} 
            disabled={!file || isLoading} 
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none transition-colors flex items-center ${
              !file || isLoading 
                ? 'bg-primary-400 dark:bg-primary-600 cursor-not-allowed opacity-70' 
                : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
            }`} 
            type="button"
          >
            {isLoading ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                インポート中...
              </>
            ) : (
              'データベースに保存'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
