import { useEffect, useState } from 'react';

/**
 * Thin animated bar fixed to the top of the viewport, shown while a route
 * transition is pending (see App.tsx's `useDeferredValue`/`isPending`
 * wiring). Covers both same-app route changes and switching to a remote
 * that hasn't finished downloading its JS chunk yet - `isPending` stays
 * true for the whole time React is preparing the new tree in the
 * background, whether that's instant or waiting on a lazy import.
 *
 * Deliberately outside <Content> so it isn't affected by the dimmed
 * overlay applied to stale content - it should read as "system is working",
 * not as part of the page underneath it.
 */
export function NavigationProgressBar({ active }: { active: boolean }) {
  // Keep the bar mounted briefly after `active` goes false so the
  // "complete" transition (width -> 100%, then fade out) can play instead
  // of the bar just vanishing mid-animation.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      return;
    }
    const timeout = setTimeout(() => setVisible(false), 200);
    return () => clearTimeout(timeout);
  }, [active]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 2000,
        pointerEvents: 'none',
        background: 'rgba(22, 119, 255, 0.15)',
      }}
    >
      <div
        style={{
          height: '100%',
          width: active ? '80%' : '100%',
          background: '#1677ff',
          transition: active ? 'width 4s cubic-bezier(0.1, 0.6, 0.2, 1)' : 'width 0.2s ease-out, opacity 0.2s ease-out 0.1s',
          opacity: active ? 1 : 0,
        }}
      />
    </div>
  );
}
