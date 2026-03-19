import { useState, useCallback } from "react";
import type { AddictionRecord } from "@/types/addiction";

const STORAGE_KEY = "myaddiction-records";

function loadRecords(): AddictionRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}

  // Migrate from old single-addiction format
  const oldDate = localStorage.getItem("quit-smoking-date");
  if (oldDate) {
    const oldType = localStorage.getItem("quit-tobacco-type") || "cigarette";
    const oldPerDay = Number(localStorage.getItem("quit-per-day")) || 20;
    const oldEntries = (() => {
      try {
        const s = localStorage.getItem("health-metrics-log");
        return s ? JSON.parse(s) : [];
      } catch { return []; }
    })();

    const migrated: AddictionRecord = {
      id: crypto.randomUUID(),
      type: oldType as any,
      quitDate: oldDate,
      perDay: oldPerDay,
      pricePerUnit: 0.5,
      unitsPerPack: 20,
      createdAt: oldDate,
      healthEntries: oldEntries,
      moodEntries: [],
    };

    const records = [migrated];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    // Clean up old keys
    localStorage.removeItem("quit-smoking-date");
    localStorage.removeItem("quit-tobacco-type");
    localStorage.removeItem("quit-per-day");
    localStorage.removeItem("health-metrics-log");
    return records;
  }

  return [];
}

function saveRecords(records: AddictionRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function useAddictions() {
  const [records, setRecords] = useState<AddictionRecord[]>(loadRecords);

  const addRecord = useCallback((record: AddictionRecord) => {
    setRecords(prev => {
      const next = [...prev, record];
      saveRecords(next);
      return next;
    });
  }, []);

  const updateRecord = useCallback((id: string, updates: Partial<AddictionRecord>) => {
    setRecords(prev => {
      const next = prev.map(r => r.id === id ? { ...r, ...updates } : r);
      saveRecords(next);
      return next;
    });
  }, []);

  const removeRecord = useCallback((id: string) => {
    setRecords(prev => {
      const next = prev.filter(r => r.id !== id);
      saveRecords(next);
      return next;
    });
  }, []);

  return { records, addRecord, updateRecord, removeRecord };
}
