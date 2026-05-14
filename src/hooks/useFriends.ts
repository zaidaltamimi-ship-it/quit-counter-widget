import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Friend {
  friendshipId: string;
  userId: string;
  displayName: string;
  addictions: { type: string; quitDate: string; perDay: number }[];
}

export interface PendingInvite {
  id: string;
  senderName: string;
  senderId: string;
  createdAt: string;
}

export interface SentInvite {
  id: string;
  recipientEmail: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user) return;
    const { data: friendships } = await supabase
      .from("friendships")
      .select("*")
      .eq("status", "active");

    if (!friendships?.length) {
      setFriends([]);
      setLoading(false);
      return;
    }

    const friendUserIds = friendships.map((f) =>
      f.user_a === user.id ? f.user_b : f.user_a
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", friendUserIds);

    const { data: addictions } = await supabase
      .from("addictions")
      .select("user_id, type, quit_date, per_day")
      .in("user_id", friendUserIds);

    const result: Friend[] = friendships.map((f) => {
      const friendId = f.user_a === user.id ? f.user_b : f.user_a;
      const profile = profiles?.find((p) => p.user_id === friendId);
      const friendAddictions = addictions
        ?.filter((a) => a.user_id === friendId)
        .map((a) => ({ type: a.type, quitDate: a.quit_date, perDay: a.per_day })) ?? [];

      return {
        friendshipId: f.id,
        userId: friendId,
        displayName: profile?.display_name || "Friend",
        addictions: friendAddictions,
      };
    });

    setFriends(result);
    setLoading(false);
  }, [user]);

  const fetchPendingInvites = useCallback(async () => {
    if (!user?.email) return;
    const { data } = await supabase
      .from("friend_invitations")
      .select("*")
      .eq("recipient_email", user.email)
      .eq("status", "pending");

    if (!data?.length) {
      setPendingInvites([]);
      return;
    }

    const senderIds = data.map((d) => d.sender_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", senderIds);

    setPendingInvites(
      data.map((inv) => ({
        id: inv.id,
        senderId: inv.sender_id,
        senderName:
          profiles?.find((p) => p.user_id === inv.sender_id)?.display_name ||
          "Someone",
        createdAt: inv.created_at,
      }))
    );
  }, [user]);

  useEffect(() => {
    fetchFriends();
    fetchPendingInvites();
  }, [fetchFriends, fetchPendingInvites]);

  const sendInvite = async (email: string) => {
    if (!user) return { error: "Not logged in" };
    if (email === user.email) return { error: "Cannot invite yourself" };

    const normalizedEmail = email.trim().toLowerCase();
    const { data: inserted, error } = await supabase
      .from("friend_invitations")
      .insert({ sender_id: user.id, recipient_email: normalizedEmail })
      .select("id")
      .single();
    if (error) return { error: error.message };

    const { error: fnError } = await supabase.functions.invoke("send-friend-invite", {
      body: { recipientEmail: normalizedEmail, invitationId: inserted?.id },
    });
    if (fnError) {
      console.error("send-friend-invite failed", fnError);
      return { error: "Pozvánka uložena, ale email se nepodařilo odeslat." };
    }
    return { error: null };
  };

  const acceptInvite = async (inviteId: string) => {
    if (!user) return;
    const invite = pendingInvites.find((i) => i.id === inviteId);
    if (!invite) return;

    // Mark invitation as accepted
    await supabase
      .from("friend_invitations")
      .update({ status: "accepted" })
      .eq("id", inviteId);

    // Create friendship (sorted ids to avoid duplicates)
    const [a, b] =
      invite.senderId < user.id
        ? [invite.senderId, user.id]
        : [user.id, invite.senderId];

    await supabase.from("friendships").insert({ user_a: a, user_b: b });

    await fetchFriends();
    await fetchPendingInvites();
  };

  const declineInvite = async (inviteId: string) => {
    await supabase
      .from("friend_invitations")
      .update({ status: "declined" })
      .eq("id", inviteId);
    await fetchPendingInvites();
  };

  const removeFriend = async (friendshipId: string) => {
    await supabase.from("friendships").delete().eq("id", friendshipId);
    await fetchFriends();
  };

  return {
    friends,
    pendingInvites,
    loading,
    sendInvite,
    acceptInvite,
    declineInvite,
    removeFriend,
    refresh: () => { fetchFriends(); fetchPendingInvites(); },
  };
}
