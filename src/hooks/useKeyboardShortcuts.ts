'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框中的快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true;
        const shiftMatch = shortcut.shift ? e.shiftKey : true;

        if (keyMatch && ctrlMatch && shiftMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// 全局导航快捷键
export function useGlobalShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useKeyboardShortcuts([
    {
      key: '1',
      meta: true,
      action: () => router.push('/inbox'),
      description: '跳转到 Inbox',
    },
    {
      key: '2',
      meta: true,
      action: () => router.push('/pipeline'),
      description: '跳转到 Pipeline',
    },
    {
      key: '3',
      meta: true,
      action: () => router.push('/insights'),
      description: '跳转到 Insights',
    },
    {
      key: 'k',
      meta: true,
      action: () => {
        // 聚焦到第一个输入框（快速添加）
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        input?.focus();
      },
      description: '聚焦输入框',
    },
    {
      key: '?',
      shift: true,
      action: () => {
        // 显示快捷键帮助
        alert(`快捷键：
⌘/Ctrl + 1 - Inbox
⌘/Ctrl + 2 - Pipeline  
⌘/Ctrl + 3 - Insights
⌘/Ctrl + K - 快速添加
ESC - 关闭弹窗
? - 显示帮助`);
      },
      description: '显示快捷键帮助',
    },
  ]);

  // ESC 关闭弹窗
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // 尝试关闭弹窗（查找关闭按钮并点击）
        const closeBtn = document.querySelector('[data-close-modal]') as HTMLElement;
        if (closeBtn) {
          closeBtn.click();
        }
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);
}

// Inbox 页面快捷键
export function useInboxShortcuts(onAdd: () => void) {
  useKeyboardShortcuts([
    {
      key: 'n',
      action: onAdd,
      description: '新建选题（聚焦输入框）',
    },
  ]);
}

// Pipeline 页面快捷键  
export function usePipelineShortcuts(
  onPrev: () => void,
  onNext: () => void,
  onOpen: () => void,
  onAdvance: () => void
) {
  useKeyboardShortcuts([
    {
      key: 'j',
      action: onNext,
      description: '下一个卡片',
    },
    {
      key: 'k',
      action: onPrev,
      description: '上一个卡片',
    },
    {
      key: 'enter',
      action: onOpen,
      description: '打开选中卡片',
    },
    {
      key: 'l',
      action: onAdvance,
      description: '推进到下一阶段',
    },
  ]);
}
