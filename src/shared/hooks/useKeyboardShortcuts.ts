import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
  category?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey === undefined || shortcut.ctrlKey === event.ctrlKey;
        const metaMatch = shortcut.metaKey === undefined || shortcut.metaKey === event.metaKey;
        const shiftMatch = shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey;
        const altMatch = shortcut.altKey === undefined || shortcut.altKey === event.altKey;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function useGlobalKeyboardShortcuts() {
  const navigate = useNavigate();

  return [
    {
      key: 'k',
      metaKey: true,
      description: 'Open command palette',
      action: () => {
        const event = new CustomEvent('open-command-palette');
        window.dispatchEvent(event);
      },
      category: 'Navigation',
    },
    {
      key: 'j',
      metaKey: true,
      description: 'Post a new job',
      action: () => console.log('Post Job'),
      category: 'Actions',
    },
    {
      key: 'n',
      metaKey: true,
      description: 'Add new candidate',
      action: () => console.log('Add Candidate'),
      category: 'Actions',
    },
    {
      key: '/',
      description: 'Focus search',
      action: () => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      },
      category: 'Navigation',
    },
    {
      key: '?',
      shiftKey: true,
      description: 'Show keyboard shortcuts',
      action: () => {
        const event = new CustomEvent('show-shortcuts-dialog');
        window.dispatchEvent(event);
      },
      category: 'Help',
    },
  ] as KeyboardShortcut[];
}

// Navigation shortcuts using "g then x" pattern
export function useNavigationShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    let gPressed = false;
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.key === 'g' && !gPressed) {
        gPressed = true;
        timeout = setTimeout(() => {
          gPressed = false;
        }, 1000);
        return;
      }

      if (gPressed) {
        event.preventDefault();
        clearTimeout(timeout);
        gPressed = false;

        const shortcuts: Record<string, string> = {
          d: '/dashboard',
          c: '/candidates',
          j: '/jobs',
          a: '/applications',
          n: '/analytics',
          s: '/settings',
          h: '/help',
        };

        const route = shortcuts[event.key];
        if (route) {
          navigate(route);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [navigate]);
}