import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StopCheckboxProps } from './types';

// =====================================
// 定数定義
// =====================================

const STYLES = {
  label: 'flex items-center text-sm cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
  checkboxWrapper: 'relative flex items-center mr-2',
  checkbox: {
    base: 'w-4 h-4 rounded border transition-colors',
    selected: 'bg-primary-500 border-primary-500 dark:bg-primary-600 dark:border-primary-600',
    unselected: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
  },
  checkIcon: 'w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
} as const;

// =====================================
// カスタムフック: useKeyboardHandler
// =====================================

function useKeyboardHandler(onChange: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange();
    }
  };
}

// =====================================
// StopCheckboxコンポーネント
// =====================================

/**
 * バス停選択用のカスタムチェックボックスコンポーネント
 * 
 * @description
 * アクセシビリティに準拠したカスタムチェックボックスを提供します。
 * - キーボード操作に対応（Space, Enterキーでトグル可能）
 * - スクリーンリーダー対応（適切なaria属性とラベリング）
 * - ダークモード対応
 * - アニメーション付きの視覚的フィードバック
 * 
 * @example
 * ```tsx
 * <StopCheckbox
 *   id="stop-1"
 *   name="東京駅"
 *   isSelected={true}
 *   onChange={() => handleChange('stop-1')}
 * />
 * ```
 * 
 * @param props StopCheckboxProps
 * @param props.id - チェックボックスの一意のID
 * @param props.name - バス停の表示名
 * @param props.isSelected - 選択状態
 * @param props.onChange - 状態変更時のコールバック関数
 */
export function StopCheckbox({ 
  id, 
  name, 
  isSelected, 
  onChange 
}: StopCheckboxProps) {
  const handleKeyDown = useKeyboardHandler(onChange);

  return (
    <label 
      htmlFor={id}
      className={STYLES.label}
    >
      <div className={STYLES.checkboxWrapper}>
        {/* カスタムチェックボックスの視覚的表現 */}
        <div 
          className={cn(
            STYLES.checkbox.base,
            isSelected ? STYLES.checkbox.selected : STYLES.checkbox.unselected
          )}
          aria-hidden="true"
          role="presentation"
        >
          {isSelected && (
            <Check 
              className={STYLES.checkIcon}
              strokeWidth={3}
              aria-hidden="true"
            />
          )}
        </div>
        
        {/* アクセシビリティ対応の実際のチェックボックス */}
        <input
          type="checkbox"
          id={id}
          checked={isSelected}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className="sr-only" // スクリーンリーダー用に視覚的には非表示
          aria-label={`${name}を${isSelected ? '解除' : '選択'}`}
        />
      </div>
      <span 
        className="select-none"
        aria-hidden="true"
      >
        {name}
      </span>
    </label>
  );
}