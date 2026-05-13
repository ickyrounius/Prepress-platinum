'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

/**
 * Register global keyboard shortcuts.
 * Keys are case-insensitive single characters or combos like "ctrl+k".
 * 
 * Built-in shortcuts from the architecture plan:
 *   [H] = HOLD, [R] = REVISION, [A] = APPROVE, [/] = search, [N] = new
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Skip if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

      // Build key string
      let key = e.key.toLowerCase();
      if (e.ctrlKey || e.metaKey) key = `ctrl+${key}`;
      if (e.altKey) key = `alt+${key}`;

      const action = shortcuts[key];
      if (action) {
        e.preventDefault();
        e.stopPropagation();
        action();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
