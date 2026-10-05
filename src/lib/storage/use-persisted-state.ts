"use client";

import * as React from "react";

type Listener = () => void;
type Updater<T> = T | ((previous: T) => T);

interface CacheEntry {
  raw: string | null;
  value: unknown;
}

const listeners = new Map<string, Set<Listener>>();
const cache = new Map<string, CacheEntry>();

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Returns a referentially stable value for `key` so `useSyncExternalStore`
 * does not re-render in a loop. Corrupt or schema-incompatible entries fall
 * back to `fallback`.
 */
function readValue<T>(
  key: string,
  fallback: T,
  parse: (value: unknown) => T
): T {
  const raw = readRaw(key);
  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;

  let value: T = fallback;
  if (raw !== null) {
    try {
      value = parse(JSON.parse(raw));
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function writeValue<T>(key: string, value: T) {
  let raw: string | null = null;
  try {
    raw = JSON.stringify(value);
    window.localStorage.setItem(key, raw);
  } catch {
    // Quota exceeded or storage blocked: keep the value in memory only.
  }
  cache.set(key, { raw: readRaw(key) ?? raw, value });
  listeners.get(key)?.forEach((listener) => listener());
}

function subscribe(key: string, listener: Listener) {
  const keyListeners = listeners.get(key) ?? new Set<Listener>();
  keyListeners.add(listener);
  listeners.set(key, keyListeners);

  // Keep other tabs in sync.
  function onStorage(event: StorageEvent) {
    if (event.key === key) listener();
  }
  window.addEventListener("storage", onStorage);

  return () => {
    keyListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const identity = <T,>(value: unknown) => value as T;

/**
 * `useState` backed by `localStorage`. Renders `fallback` on the server and
 * during hydration, then the stored value on the client.
 */
export function usePersistedState<T>(
  key: string,
  fallback: T,
  parse: (value: unknown) => T = identity
): [T, (updater: Updater<T>) => void] {
  // Freeze the first fallback/parse so callers can pass inline literals.
  const [stableFallback] = React.useState(() => fallback);
  const [stableParse] = React.useState(() => parse);

  const value = React.useSyncExternalStore(
    React.useCallback((listener) => subscribe(key, listener), [key]),
    () => readValue(key, stableFallback, stableParse),
    () => stableFallback
  );

  const setValue = React.useCallback(
    (updater: Updater<T>) => {
      const previous = readValue(key, stableFallback, stableParse);
      const next =
        typeof updater === "function"
          ? (updater as (previous: T) => T)(previous)
          : updater;
      writeValue(key, next);
    },
    [key, stableFallback, stableParse]
  );

  return [value, setValue];
}
