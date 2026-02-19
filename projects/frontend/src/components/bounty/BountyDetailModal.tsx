import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  MessageSquare,
  Trophy,
  Users,
  MapPin,
  Bookmark,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { Bounty } from "@/data/bounties";
import { Button } from "@/components/ui/button";

interface BountyDetailModalProps {
  bounty: Bounty | null;
  onClose: () => void;
}

const difficultyConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Easy: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  Medium: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  Hard: { bg: "bg-rose-500/10", text: "text-rose-400", dot: "bg-rose-400" },
};

const placeColors: Record<string, string> = {
  "1st": "text-yellow-400",
  "2nd": "text-slate-300",
  "3rd": "text-amber-600",
};

function useCountdown(deadline: string) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    const target = new Date(deadline).getTime();
    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setRemaining("Ended"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [deadline]);
  return remaining;
}

/** Renders markdown-lite text: **bold**, \n\n as paragraphs, - bullets */
function RichText({ text }: { text: string }) {
  const paragraphs = text.split("\n\n");
  return (
    <>
      {paragraphs.map((p, i) => {
        // Heading
        if (p.startsWith("**") && p.endsWith("**")) {
          return (
            <h3 key={i} className="text-lg font-bold text-foreground mt-6 mb-2">
              {p.replace(/\*\*/g, "")}
            </h3>
          );
        }
        // Bullet list
        if (p.includes("\n- ") || p.startsWith("- ")) {
          const lines = p.split("\n").filter(Boolean);
          const heading = !lines[0].startsWith("- ") ? lines.shift() : null;
          return (
            <div key={i}>
              {heading && (
                <h3 className="text-lg font-bold text-foreground mt-6 mb-2">
                  {heading.replace(/\*\*/g, "")}
                </h3>
              )}
              <ul className="space-y-2 my-2">
                {lines.map((l, j) => (
                  <li key={j} className="flex items-start gap-2 text-[15px] text-muted-foreground">
                    <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{l.replace(/^- /, "").replace(/\*\*(.*?)\*\*/g, "$1")}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        // Bold headings inline
        if (p.startsWith("**")) {
          const title = p.match(/^\*\*(.*?)\*\*/)?.[1];
          const rest = p.replace(/^\*\*.*?\*\*\s*/, "");
          return (
            <div key={i}>
              {title && <h3 className="text-lg font-bold text-foreground mt-6 mb-2">{title}</h3>}
              {rest && <p className="text-[15px] text-muted-foreground leading-relaxed">{rest}</p>}
            </div>
          );
        }
        // Normal paragraph
        return (
          <p key={i} className="text-[15px] text-muted-foreground leading-relaxed my-2">
            {p}
          </p>
        );
      })}
    </>
  );
}

const BountyDetailModal = ({ bounty, onClose }: BountyDetailModalProps) => {
  if (!bounty) return null;
  const diff = difficultyConfig[bounty.difficulty];
  const remaining = useCountdown(bounty.deadline);
  const prizes = bounty.prizes || [];
  const skills = bounty.skills || [];
  const submissions = bounty.submissions ?? 0;
  const comments = bounty.comments ?? 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/15 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="relative w-full max-w-4xl my-8 mx-4 rounded-2xl glass-modal overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ─── Header ─── */}
          <div className="border-b border-slate-200/60 px-6 py-5 md:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                {/* Sponsor logo placeholder */}
                <div className="h-12 w-12 shrink-0 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {(bounty.sponsor || "A")[0]}
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-bold text-foreground leading-tight mb-1.5">
                    {bounty.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{bounty.sponsor || bounty.creator}</span>
                    <span className="text-border">|</span>
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5 text-primary" /> Bounty
                    </span>
                    <span className="text-border">|</span>
                    <span className={`flex items-center gap-1.5 ${diff.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${diff.dot}`} />
                      {bounty.status}
                    </span>
                    {bounty.region && (
                      <>
                        <span className="text-border">|</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {bounty.region}
                        </span>
                      </>
                    )}
                    {comments > 0 && (
                      <>
                        <span className="text-border">|</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" /> {comments}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
                  <Bookmark className="h-4 w-4" /> Bookmark
                </button>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ─── Body: sidebar + main ─── */}
          <div className="flex flex-col md:flex-row">
            {/* Left sidebar */}
            <div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-slate-200/60 p-6 md:p-8 space-y-6">
              {/* Prizes */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Prizes
                </h4>
                {/* Total */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <span className="font-display text-xl font-bold text-foreground">
                      {bounty.totalPrize || bounty.reward}
                    </span>
                    <span className="block text-xs text-muted-foreground">Total Prizes</span>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-2.5 border-t border-border pt-3">
                  {prizes.map((p) => (
                    <div key={p.place} className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${placeColors[p.place] ? placeColors[p.place].replace("text-", "bg-") : "bg-muted-foreground"}`} />
                      <span className="font-display font-semibold text-foreground text-sm">
                        {p.amount}
                      </span>
                      <span className="text-xs text-muted-foreground">{p.place}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4 border-t border-border pt-5">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-display font-bold text-foreground text-lg">{submissions}</span>
                    <span className="block text-xs text-muted-foreground uppercase tracking-wide">Submissions</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-display font-bold text-foreground text-lg">{remaining}</span>
                    <span className="block text-xs text-muted-foreground uppercase tracking-wide">Remaining</span>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <Button className="w-full gradient-primary text-primary-foreground font-semibold glow-primary h-12 text-[15px]">
                Submit Now
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Region */}
              {bounty.region && (
                <div className="border-t border-border pt-5">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Regional Listing
                  </h4>
                  <p className="text-sm text-foreground">
                    This listing is open for people in <span className="font-semibold">{bounty.region}</span>
                  </p>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Skills Needed
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-lg border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right content */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[70vh]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Details
              </h3>

              {bounty.details ? (
                <RichText text={bounty.details} />
              ) : (
                <p className="text-[15px] text-muted-foreground leading-relaxed">
                  {bounty.description}
                </p>
              )}

              {/* Requirements */}
              {bounty.requirements && bounty.requirements.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-foreground mb-3">Requirements</h3>
                  <ul className="space-y-2.5">
                    {bounty.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[15px] text-muted-foreground">
                        <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BountyDetailModal;
