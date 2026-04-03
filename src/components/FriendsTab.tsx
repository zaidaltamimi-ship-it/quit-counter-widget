import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Check, X, Trash2, MessageCircle } from "lucide-react";
import { useFriends, type Friend } from "@/hooks/useFriends";
import { useLanguage } from "@/i18n/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ChatView from "@/components/ChatView";

const ENCOURAGEMENTS = ["💪", "🔥", "⭐", "❤️", "🎉", "👏"];

function calcDays(quitDate: string) {
  return Math.floor(Math.max(0, Date.now() - new Date(quitDate).getTime()) / 86400000);
}

const FriendsTab = () => {
  const { t } = useLanguage();
  const { friends, pendingInvites, sendInvite, acceptInvite, declineInvite, removeFriend } = useFriends();
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [chatFriend, setChatFriend] = useState<Friend | null>(null);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSending(true);
    const { error } = await sendInvite(inviteEmail.trim());
    setSending(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(t.inviteSent || "Invite sent!");
      setInviteEmail("");
    }
  };

  if (chatFriend) {
    return (
      <ChatView
        friend={chatFriend}
        onBack={() => setChatFriend(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 pb-12">
        <div className="pt-10 pb-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {t.friends || "Friends"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.friendsSubtitle || "Support each other on the journey"}
          </p>
        </div>

        {/* Invite section */}
        <div className="card-elevated p-4 mb-4">
          <p className="text-sm font-medium text-foreground mb-2">
            {t.inviteFriend || "Invite a friend by email"}
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="friend@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              className="flex-1"
            />
            <Button onClick={handleInvite} disabled={sending} size="sm">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Pending invites */}
        {pendingInvites.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              {t.pendingInvites || "Pending invites"}
            </p>
            {pendingInvites.map((inv) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-elevated flex items-center justify-between p-4"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{inv.senderName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.wantsToConnect || "wants to connect"}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => acceptInvite(inv.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => declineInvite(inv.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Friends list */}
        <div className="space-y-3">
          <AnimatePresence>
            {friends.map((friend, i) => (
              <motion.div
                key={friend.friendshipId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: i * 0.05 }}
                className="card-elevated overflow-hidden"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {friend.displayName}
                    </p>
                    {friend.addictions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {friend.addictions.map((a, j) => (
                          <span
                            key={j}
                            className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground"
                          >
                            {a.type} · {calcDays(a.quitDate)}d
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setChatFriend(friend)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFriend(friend.friendshipId)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground/30 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {friends.length === 0 && pendingInvites.length === 0 && (
            <div className="text-center py-12">
              <UserPlus className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {t.noFriendsYet || "No friends yet. Send an invite to get started!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsTab;
