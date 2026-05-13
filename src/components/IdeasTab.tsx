import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ArrowUp, Plus, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "@/hooks/use-toast";

interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  upvotes: number;
  created_at: string;
}

const IdeasTab = () => {
  const { user } = useAuth();
  const { t: tRaw } = useLanguage();
  const t = tRaw as any;
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    setLoading(true);
    const [{ data: ideasData }, { data: votesData }] = await Promise.all([
      supabase.from("ideas").select("*").order("upvotes", { ascending: false }).order("created_at", { ascending: false }),
      user ? supabase.from("idea_votes").select("idea_id").eq("user_id", user.id) : Promise.resolve({ data: [] }),
    ]);
    setIdeas((ideasData as Idea[]) || []);
    setVotedIds(new Set((votesData as { idea_id: string }[] | null)?.map((v) => v.idea_id) || []));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    if (!trimmedTitle || trimmedTitle.length > 120) {
      toast({ title: t.ideasTitleInvalid, variant: "destructive" });
      return;
    }
    if (trimmedDesc.length > 1000) {
      toast({ title: t.ideasDescTooLong, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("ideas").insert({
      user_id: user.id,
      title: trimmedTitle,
      description: trimmedDesc || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: t.ideasSubmitError, description: error.message, variant: "destructive" });
      return;
    }
    setTitle("");
    setDescription("");
    setShowForm(false);
    toast({ title: t.ideasSubmitted });
    load();
  };

  const toggleVote = async (idea: Idea) => {
    if (!user) return;
    const hasVoted = votedIds.has(idea.id);
    // Optimistic update
    setVotedIds((prev) => {
      const next = new Set(prev);
      hasVoted ? next.delete(idea.id) : next.add(idea.id);
      return next;
    });
    setIdeas((prev) =>
      prev.map((i) => (i.id === idea.id ? { ...i, upvotes: i.upvotes + (hasVoted ? -1 : 1) } : i))
    );

    const { error } = hasVoted
      ? await supabase.from("idea_votes").delete().eq("idea_id", idea.id).eq("user_id", user.id)
      : await supabase.from("idea_votes").insert({ idea_id: idea.id, user_id: user.id });

    if (error) {
      // revert
      load();
      toast({ title: t.ideasVoteError, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("ideas").delete().eq("id", id);
    if (error) {
      toast({ title: t.ideasDeleteError, variant: "destructive" });
      return;
    }
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 pb-12">
        <div className="pt-10 pb-4 text-center">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">{t.ideasTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.ideasSubtitle}</p>
        </div>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity mb-5"
          >
            <Plus className="h-4 w-4" />
            {t.ideasAddNew}
          </button>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="card-elevated p-4 mb-5 space-y-3"
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.ideasTitlePlaceholder}
              maxLength={120}
              required
              className="w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.ideasDescPlaceholder}
              maxLength={1000}
              rows={3}
              className="w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setTitle(""); setDescription(""); }}
                className="flex-1 rounded-xl bg-secondary py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {t.ideasSubmit}
              </button>
            </div>
          </motion.form>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : ideas.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <Lightbulb className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">{t.ideasEmpty}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {ideas.map((idea, i) => {
                const voted = votedIds.has(idea.id);
                const isOwn = idea.user_id === user?.id;
                return (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: i * 0.03 }}
                    className="card-elevated p-4 flex gap-3"
                  >
                    <button
                      onClick={() => toggleVote(idea)}
                      className={`flex flex-col items-center justify-center min-w-[48px] rounded-xl px-2 py-2 transition-colors ${
                        voted
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                      aria-label={voted ? t.ideasUnvote : t.ideasVote}
                    >
                      <ArrowUp className="h-4 w-4" />
                      <span className="font-mono-tabular text-xs font-semibold mt-0.5">{idea.upvotes}</span>
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-medium text-foreground break-words">{idea.title}</h3>
                        {isOwn && (
                          <button
                            onClick={() => handleDelete(idea.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                            aria-label={t.delete || "Delete"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      {idea.description && (
                        <p className="text-xs text-muted-foreground mt-1 break-words whitespace-pre-wrap">
                          {idea.description}
                        </p>
                      )}
                      {idea.status !== "new" && (
                        <span className="inline-block mt-2 text-[10px] font-medium uppercase tracking-wider text-primary">
                          {idea.status}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeasTab;
