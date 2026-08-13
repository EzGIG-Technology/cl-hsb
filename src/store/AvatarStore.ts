import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'nrmc-avatars-v1';

function loadAll(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveAll(map: Record<string, string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota errors in demo environment
  }
}

/** Small localStorage-backed store for demo profile pictures, keyed by person id ('admin', 'cl-01', 'cli-01', ...). */
export function useAvatarStore(key: string) {
  const [dataUrl, setDataUrl] = useState<string | undefined>(() => loadAll()[key]);

  useEffect(() => {
    setDataUrl(loadAll()[key]);
  }, [key]);

  const setAvatar = useCallback(
    (value: string | undefined) => {
      const all = loadAll();
      if (value) all[key] = value;
      else delete all[key];
      saveAll(all);
      setDataUrl(value);
    },
    [key],
  );

  return { dataUrl, setAvatar };
}
