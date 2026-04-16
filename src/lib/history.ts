import type { HistoryEntry, VerifyResult } from './types';

const HISTORY_KEY = 'scdv_history';
const MAX_ENTRIES = 50;

export function addToHistory(result: VerifyResult, rawPayload: string): void {
  const entries = getHistory();
  const newEntry: HistoryEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    result,
    rawPayload,
  };
  const updated = [newEntry, ...entries].slice(0, MAX_ENTRIES);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
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
