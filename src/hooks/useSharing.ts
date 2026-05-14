import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface SharingSettings {
  share_type: boolean;
  share_quit_date: boolean;
  share_per_day: boolean;
  share_savings: boolean;
  share_mood: boolean;
  share_health: boolean;
}

export const DEFAULT_SHARING: SharingSettings = {
  share_type: true,
  share_quit_date: true,
  share_per_day: false,
  share_savings: false,
  share_mood: false,
  share_health: false,
};

export function useSharing(addictionId: string | null) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SharingSettings>(DEFAULT_SHARING);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user || !addictionId) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("addiction_sharing")
      .select("share_type, share_quit_date, share_per_day, share_savings, share_mood, share_health")
      .eq("addiction_id", addictionId)
      .maybeSingle();
    if (data) setSettings(data as SharingSettings);
    setLoading(false);
  }, [user, addictionId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const update = useCallback(
    async (patch: Partial<SharingSettings>) => {
      if (!user || !addictionId) return;
      const next = { ...settings, ...patch };
      setSettings(next);
      await supabase
        .from("addiction_sharing")
        .update(patch)
        .eq("addiction_id", addictionId);
    },
    [user, addictionId, settings]
  );

  return { settings, loading, update };
}
