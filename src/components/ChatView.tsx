import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Friend } from "@/hooks/useFriends";

const ENCOURAGEMENTS = ["💪", "🔥", "⭐", "❤️", "🎉", "👏"];

interface ChatViewProps {
  friend: Friend;
  onBack: () => void;
}

const ChatView = ({ friend, onBack }: ChatViewProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { messages, sendMessage } = useChat(friend.friendshipId);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const msg = text.trim();
    if (!msg) return;
    setText("");
    await sendMessage(msg);
  };

  const handleReaction = async (emoji: string) => {
    await sendMessage(emoji, "encouragement");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm font-medium text-foreground">{friend.displayName}</p>
          {friend.addictions.length > 0 && (
            <p className="text-[10px] text-muted-foreground">
              {friend.addictions.map((a) => {
                const days = Math.floor(Math.max(0, Date.now() - new Date(a.quitDate).getTime()) / 86400000);
                return `${a.type}: ${days}d`;
              }).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              {t.startConversation || "Start a conversation!"}
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          const isEncouragement = msg.messageType === "encouragement";

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                  isEncouragement
                    ? "text-2xl bg-transparent"
                    : isMine
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                {!isEncouragement && (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                )}
                {isEncouragement && <span>{msg.content}</span>}
                <p
                  className={`text-[10px] mt-0.5 ${
                    isEncouragement
                      ? "text-muted-foreground"
                      : isMine
                      ? "text-primary-foreground/60"
                      : "text-muted-foreground"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Encouragement reactions */}
      <div className="flex justify-center gap-2 px-4 py-2 border-t border-border bg-card/50">
        {ENCOURAGEMENTS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className="text-xl hover:scale-125 transition-transform active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={t.typeMessage || "Type a message..."}
          className="flex-1 rounded-full bg-secondary px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatView;
