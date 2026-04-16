import type { HistoryEntry, VerifyResult } from './types';

const HISTORY_KEY = 'scdv_history';
const MAX_ENTRIES = 50;

export function addToHistory(result: VerifyResult, rawPayload: string): void {
  try {
    const entries = getHistory();
    const newEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      result,
      rawPayload,
    };
    const updated = [newEntry, ...entries].slice(0, MAX_ENTRIES);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Swallow storage errors (e.g. QuotaExceededError on iOS Safari).
    // History is a convenience feature; full storage must not block verification.
  }
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
