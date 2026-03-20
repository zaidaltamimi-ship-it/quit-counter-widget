import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { AddictionRecord, HealthEntry, MoodEntry } from "@/types/addiction";
import type { AddictionTypeId } from "@/types/addiction";

const LOCAL_KEY = "myaddiction-records";

export function useAddictions() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AddictionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch from Supabase
  const fetchRecords = useCallback(async () => {
    if (!user) { setRecords([]); setLoading(false); return; }
    setLoading(true);

    const { data: addictions } = await supabase
      .from("addictions")
      .select("*")
      .eq("user_id", user.id);

    if (!addictions) { setLoading(false); return; }

    const mapped: AddictionRecord[] = await Promise.all(
      addictions.map(async (a) => {
        const [{ data: health }, { data: mood }, { data: weekly }] = await Promise.all([
          supabase.from("health_entries").select("*").eq("addiction_id", a.id),
          supabase.from("mood_entries").select("*").eq("addiction_id", a.id),
          supabase.from("weekly_logs").select("*").eq("addiction_id", a.id),
        ]);

        return {
          id: a.id,
          type: a.type as AddictionTypeId,
          quitDate: a.quit_date,
          perDay: a.per_day,
          pricePerUnit: a.price_per_unit,
          unitsPerPack: a.units_per_pack,
          createdAt: a.created_at,
          healthEntries: (health || []).map((h) => ({
            id: h.id,
            date: h.date,
            heartRate: h.heart_rate ?? undefined,
            systolic: h.systolic ?? undefined,
            diastolic: h.diastolic ?? undefined,
            weight: h.weight ? Number(h.weight) : undefined,
            peakFlow: h.peak_flow ? Number(h.peak_flow) : undefined,
            note: h.note ?? undefined,
          })),
          moodEntries: (mood || []).map((m) => ({
            id: m.id,
            date: m.date,
            mood: m.mood,
            craving: m.craving,
            note: m.note ?? undefined,
          })),
          reductionMode: a.reduction_mode,
          weeklyTarget: a.weekly_target ?? undefined,
          weeklyLog: (weekly || []).map((w) => ({ week: w.week, actual: w.actual })),
        };
      })
    );

    setRecords(mapped);
    setLoading(false);
  }, [user]);

  // Migrate localStorage data to Supabase on first login
  useEffect(() => {
    if (!user) return;

    const migrateLocal = async () => {
      const stored = localStorage.getItem(LOCAL_KEY);
      if (!stored) return;

      try {
        const local: AddictionRecord[] = JSON.parse(stored);
        if (local.length === 0) return;

        for (const rec of local) {
          const { data: existing } = await supabase
            .from("addictions")
            .select("id")
            .eq("user_id", user.id)
            .eq("type", rec.type)
            .maybeSingle();

          if (existing) continue;

          const { data: inserted } = await supabase
            .from("addictions")
            .insert({
              user_id: user.id,
              type: rec.type,
              quit_date: rec.quitDate,
              per_day: rec.perDay,
              price_per_unit: rec.pricePerUnit,
              units_per_pack: rec.unitsPerPack,
              reduction_mode: rec.reductionMode || false,
              weekly_target: rec.weeklyTarget ?? null,
            })
            .select("id")
            .single();

          if (!inserted) continue;

          if (rec.healthEntries.length > 0) {
            await supabase.from("health_entries").insert(
              rec.healthEntries.map((h) => ({
                addiction_id: inserted.id,
                user_id: user.id,
                date: h.date,
                heart_rate: h.heartRate ?? null,
                systolic: h.systolic ?? null,
                diastolic: h.diastolic ?? null,
                weight: h.weight ?? null,
                peak_flow: h.peakFlow ?? null,
                note: h.note ?? null,
              }))
            );
          }

          if (rec.moodEntries.length > 0) {
            await supabase.from("mood_entries").insert(
              rec.moodEntries.map((m) => ({
                addiction_id: inserted.id,
                user_id: user.id,
                date: m.date,
                mood: m.mood,
                craving: m.craving,
                note: m.note ?? null,
              }))
            );
          }
        }

        localStorage.removeItem(LOCAL_KEY);
      } catch {}
    };

    migrateLocal().then(fetchRecords);
  }, [user, fetchRecords]);

  // Initial fetch
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const addRecord = useCallback(async (record: AddictionRecord) => {
    if (!user) return;

    const { data } = await supabase
      .from("addictions")
      .insert({
        user_id: user.id,
        type: record.type,
        quit_date: record.quitDate,
        per_day: record.perDay,
        price_per_unit: record.pricePerUnit,
        units_per_pack: record.unitsPerPack,
        reduction_mode: record.reductionMode || false,
        weekly_target: record.weeklyTarget ?? null,
      })
      .select("id")
      .single();

    if (data) {
      record.id = data.id;
      setRecords((prev) => [...prev, record]);
    }
  }, [user]);

  const updateRecord = useCallback(async (id: string, updates: Partial<AddictionRecord>) => {
    if (!user) return;

    // Update main addiction fields
    const dbUpdates: Record<string, unknown> = {};
    if (updates.quitDate !== undefined) dbUpdates.quit_date = updates.quitDate;
    if (updates.perDay !== undefined) dbUpdates.per_day = updates.perDay;
    if (updates.pricePerUnit !== undefined) dbUpdates.price_per_unit = updates.pricePerUnit;
    if (updates.reductionMode !== undefined) dbUpdates.reduction_mode = updates.reductionMode;
    if (updates.weeklyTarget !== undefined) dbUpdates.weekly_target = updates.weeklyTarget;

    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from("addictions").update(dbUpdates).eq("id", id);
    }

    // Handle health entries replacement
    if (updates.healthEntries) {
      await supabase.from("health_entries").delete().eq("addiction_id", id);
      if (updates.healthEntries.length > 0) {
        await supabase.from("health_entries").insert(
          updates.healthEntries.map((h) => ({
            addiction_id: id,
            user_id: user.id,
            date: h.date,
            heart_rate: h.heartRate ?? null,
            systolic: h.systolic ?? null,
            diastolic: h.diastolic ?? null,
            weight: h.weight ?? null,
            peak_flow: h.peakFlow ?? null,
            note: h.note ?? null,
          }))
        );
      }
    }

    // Handle mood entries replacement
    if (updates.moodEntries) {
      await supabase.from("mood_entries").delete().eq("addiction_id", id);
      if (updates.moodEntries.length > 0) {
        await supabase.from("mood_entries").insert(
          updates.moodEntries.map((m) => ({
            addiction_id: id,
            user_id: user.id,
            date: m.date,
            mood: m.mood,
            craving: m.craving,
            note: m.note ?? null,
          }))
        );
      }
    }

    // Handle weekly log replacement
    if (updates.weeklyLog) {
      await supabase.from("weekly_logs").delete().eq("addiction_id", id);
      if (updates.weeklyLog.length > 0) {
        await supabase.from("weekly_logs").insert(
          updates.weeklyLog.map((w) => ({
            addiction_id: id,
            user_id: user.id,
            week: w.week,
            actual: w.actual,
          }))
        );
      }
    }

    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }, [user]);

  const removeRecord = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from("addictions").delete().eq("id", id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, [user]);

  return { records, loading, addRecord, updateRecord, removeRecord };
}
