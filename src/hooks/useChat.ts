import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  messageType: "text" | "encouragement" | "milestone_share";
  createdAt: string;
}

export function useChat(friendshipId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!friendshipId) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("friendship_id", friendshipId)
      .order("created_at", { ascending: true })
      .limit(200);

    setMessages(
      (data || []).map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        content: m.content,
        messageType: m.message_type as ChatMessage["messageType"],
        createdAt: m.created_at,
      }))
    );
    setLoading(false);
  }, [friendshipId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!friendshipId) return;
    const channel = supabase
      .channel(`messages-${friendshipId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `friendship_id=eq.${friendshipId}`,
        },
        (payload) => {
          const m = payload.new as any;
          setMessages((prev) => [
            ...prev,
            {
              id: m.id,
              senderId: m.sender_id,
              content: m.content,
              messageType: m.message_type,
              createdAt: m.created_at,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [friendshipId]);

  const sendMessage = async (
    content: string,
    type: ChatMessage["messageType"] = "text"
  ) => {
    if (!friendshipId || !user) return;
    await supabase.from("messages").insert({
      friendship_id: friendshipId,
      sender_id: user.id,
      content,
      message_type: type,
    });
  };

  return { messages, loading, sendMessage };
}
