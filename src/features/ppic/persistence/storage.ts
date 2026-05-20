import type { AppState } from '@/features/ppic/domain/types';

export function loadStoredAppState(
  storageKey: string,
  normalize: (input: Record<string, unknown>) => AppState,
  createDefault: () => AppState
) {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, unknown>;
      return normalize(parsed);
    }
  } catch (error) {
    console.error('Failed to load saved PPIC state', error);
  }

  return createDefault();
}

export function persistStoredAppState(storageKey: string, appState: AppState) {
  window.localStorage.setItem(storageKey, JSON.stringify(appState));
}
