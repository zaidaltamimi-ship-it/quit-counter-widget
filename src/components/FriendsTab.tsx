import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Check, X, Trash2, MessageCircle, Shield, Clock, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useFriends, type Friend } from "@/hooks/useFriends";
import { useChatNotifications } from "@/hooks/ChatNotificationsContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ChatView from "@/components/ChatView";



function calcDays(quitDate: string) {
  return Math.floor(Math.max(0, Date.now() - new Date(quitDate).getTime()) / 86400000);
}

const FriendsTab = () => {
  const { t } = useLanguage();
  const { friends, pendingInvites, sentInvites, sendInvite, acceptInvite, declineInvite, deleteSentInvite, removeFriend } = useFriends();
  const { unreadByFriendship } = useChatNotifications();
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [chatFriend, setChatFriend] = useState<Friend | null>(null);

  const openConfirm = () => {
    if (!inviteEmail.trim()) return;
    setConfirmOpen(true);
  };

  const handleInvite = async () => {
    setConfirmOpen(false);
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

        {/* Trezor banner */}
        <div className="flex items-start gap-3 rounded-2xl bg-primary/5 border border-primary/10 p-3.5 mb-4">
          <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">Tvůj kruh.</span>{" "}
            Vidí jen lidé, které jsi sám pozval — a jen to, co povolíš v každém trackeru.
            Citlivá data jsou ve výchozím stavu skrytá.
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
              onKeyDown={(e) => e.key === "Enter" && openConfirm()}
              className="flex-1"
            />
            <Button onClick={openConfirm} disabled={sending} size="sm">
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

        {/* Sent invites (outbound) */}
        {sentInvites.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              Tvé pozvánky
            </p>
            {sentInvites.slice(0, 8).map((inv) => {
              const config =
                inv.status === "accepted"
                  ? { Icon: CheckCircle2, label: "Přijato", cls: "text-primary bg-primary/10" }
                  : inv.status === "declined"
                  ? { Icon: XCircle, label: "Odmítnuto", cls: "text-muted-foreground bg-secondary" }
                  : { Icon: Clock, label: "Čeká", cls: "text-amber-600 bg-amber-500/10" };
              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-elevated flex items-center justify-between p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{inv.recipientEmail}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(inv.createdAt).toLocaleDateString("cs-CZ", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${config.cls}`}>
                      <config.Icon className="h-3 w-3" />
                      {config.label}
                    </span>
                    <button
                      onClick={() => deleteSentInvite(inv.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground/30 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Pozvat do tvého kruhu
            </DialogTitle>
            <DialogDescription className="pt-2 space-y-2">
              <span className="block">
                Pošleš pozvánku na <span className="font-medium text-foreground">{inviteEmail}</span>.
              </span>
              <span className="block">
                Ve výchozím stavu uvidí jen <span className="text-foreground font-medium">typ závislosti a počet dní</span>.
                Zdravotní data, náladu a další citlivé údaje neuvidí, dokud je sám nepovolíš v nastavení trackeru.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Zrušit</Button>
            <Button onClick={handleInvite} disabled={sending}>Odeslat pozvánku</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FriendsTab;
