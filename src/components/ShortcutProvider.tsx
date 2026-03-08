'use client';

import { useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts';

export function ShortcutProvider({ children }: { children: React.ReactNode }) {
  useGlobalShortcuts();
  return <>{children}</>;
}
