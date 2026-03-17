import { useState, useRef } from 'react';

export function usePusherQueue<K>() {
  const [pendingKeys, setPendingKeys] = useState<Set<K>>(new Set());
  const resolversRef = useRef<Map<K, () => void>>(new Map());

  function enqueue(key: K): Promise<void> {
    setPendingKeys((current) => new Set(current).add(key));
    return new Promise<void>((resolve) => {
      resolversRef.current.set(key, resolve);
      setTimeout(() => {
        if (resolversRef.current.delete(key)) {
          setPendingKeys((current) => { const next = new Set(current); next.delete(key); return next; });
          resolve();
        }
      }, 5000);
    });
  }

  function dequeue(key: K) {
    const resolve = resolversRef.current.get(key);
    if (resolve) {
      resolversRef.current.delete(key);
      resolve();
    }
    setPendingKeys((current) => { const next = new Set(current); next.delete(key); return next; });
  }

  return { pendingKeys, enqueue, dequeue };
}
