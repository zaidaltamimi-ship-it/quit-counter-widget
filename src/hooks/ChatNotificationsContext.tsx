import { createContext, useContext, useState, type ReactNode } from "react";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

interface ChatNotificationsCtx {
  unreadByFriendship: Record<string, number>;
  totalUnread: number;
  markRead: (friendshipId: string) => void;
  setActiveFriendship: (id: string | null) => void;
}

const Ctx = createContext<ChatNotificationsCtx | null>(null);

export function ChatNotificationsProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const { unreadByFriendship, totalUnread, markRead } = useUnreadMessages(active);
  return (
    <Ctx.Provider
      value={{ unreadByFriendship, totalUnread, markRead, setActiveFriendship: setActive }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useChatNotifications() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useChatNotifications must be used inside ChatNotificationsProvider");
  return v;
}
