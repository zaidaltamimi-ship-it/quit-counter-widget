import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const STORAGE_KEY = "myaddiction_chat_reads_v1";

type ReadMap = Record<string, string>; // friendshipId -> ISO date

function loadReads(): ReadMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveReads(map: ReadMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function useUnreadMessages(activeFriendshipId: string | null = null) {
  const { user } = useAuth();
  const [unreadByFriendship, setUnreadByFriendship] = useState<Record<string, number>>({});
  const readsRef = useRef<ReadMap>(loadReads());
  const activeRef = useRef<string | null>(activeFriendshipId);

  useEffect(() => {
    activeRef.current = activeFriendshipId;
    if (activeFriendshipId) {
      // Mark active chat as read immediately
      readsRef.current[activeFriendshipId] = new Date().toISOString();
      saveReads(readsRef.current);
      setUnreadByFriendship((prev) => ({ ...prev, [activeFriendshipId]: 0 }));
    }
  }, [activeFriendshipId]);

  const recompute = useCallback(async () => {
    if (!user) return;
    const { data: friendships } = await supabase
      .from("friendships")
      .select("id")
      .eq("status", "active");
    if (!friendships?.length) {
      setUnreadByFriendship({});
      return;
    }
    const ids = friendships.map((f) => f.id);
    const reads = readsRef.current;
    const counts: Record<string, number> = {};
    await Promise.all(
      ids.map(async (fid) => {
        const since = reads[fid];
        let q = supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("friendship_id", fid)
          .neq("sender_id", user.id);
        if (since) q = q.gt("created_at", since);
        const { count } = await q;
        counts[fid] = count ?? 0;
      })
    );
    setUnreadByFriendship(counts);
  }, [user]);

  useEffect(() => {
    recompute();
  }, [recompute]);

  // Global realtime subscription for all incoming messages
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`global-messages-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const m = payload.new as {
            id: string;
            friendship_id: string;
            sender_id: string;
            content: string;
            message_type: string;
          };
          if (m.sender_id === user.id) return;

          // If user is currently in this chat, mark read; don't notify
          if (activeRef.current === m.friendship_id) {
            readsRef.current[m.friendship_id] = new Date().toISOString();
            saveReads(readsRef.current);
            return;
          }

          // Increment unread
          setUnreadByFriendship((prev) => ({
            ...prev,
            [m.friendship_id]: (prev[m.friendship_id] || 0) + 1,
          }));

          // Show toast — fetch sender name
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", m.sender_id)
            .maybeSingle();

          const senderName = profile?.display_name || "Přítel";
          const preview =
            m.message_type === "encouragement"
              ? `poslal/a ti ${m.content}`
              : m.content.length > 80
              ? m.content.slice(0, 80) + "…"
              : m.content;

          toast(senderName, { description: preview });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markRead = useCallback((friendshipId: string) => {
    readsRef.current[friendshipId] = new Date().toISOString();
    saveReads(readsRef.current);
    setUnreadByFriendship((prev) => ({ ...prev, [friendshipId]: 0 }));
  }, []);

  const totalUnread = Object.values(unreadByFriendship).reduce((a, b) => a + b, 0);

  return { unreadByFriendship, totalUnread, markRead, refresh: recompute };
}
