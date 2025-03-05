'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { Upload, X, AlertCircle, Database } from 'lucide-react';
import type { BusRoute } from '@/lib/types';

interface ImportDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (routes: BusRoute[]) => void;
}

export const ImportDataDialog: FC<ImportDataDialogProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  const handleClose = () => {
    setFile(null);
    setError(null);
    setProgress('');
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setProgress('');
  };

  const handleImport = async () => {
    if (!file) {
      setError('ファイルを選択してください');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress('データを解析中...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setProgress('データベースに保存中...');
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'インポート中にエラーが発生しました');
      }

      setProgress('インポート完了！');
      window.location.reload();
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          type="button"
          aria-label="閉じる"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
          <Database className="w-5 h-5 mr-2" aria-hidden="true" />
          データベースにインポート
        </h2>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            aria-label="CSVファイルを選択"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-2" aria-hidden="true" />
            <span className="text-blue-600 font-medium">ファイルを選択</span>
            <span className="text-sm text-gray-500">CSVファイルのみ</span>
          </label>
          {file && (
            <p className="mt-2 text-sm text-gray-600 text-center">{file.name}</p>
          )}
        </div>

        {progress && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg flex items-center">
            <Database className="w-5 h-5 mr-2" aria-hidden="true" />
            {progress}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" aria-hidden="true" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
            type="button"
          >
            キャンセル
          </button>
          <button
            onClick={handleImport}
            disabled={!file || isLoading}
            className={`px-4 py-2 text-sm text-white rounded-lg flex items-center ${
              !file || isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            type="button"
          >
            {isLoading && (
              <span 
                className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />
            )}
            {isLoading ? 'インポート中...' : 'データベースに保存'}
          </button>
        </div>
      </div>
    </div>
  );
};
