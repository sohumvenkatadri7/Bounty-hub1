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
  CheckCircle2,
  Send,
  User,
} from "lucide-react";
import { Bounty } from "@/data/bounties";
import { Button } from "@/components/ui/button";
import { useWallet } from "@txnlab/use-wallet-react";
import {
  BountySubmission,
  getSubmissionsForBounty,
  addSubmission,
  approveSubmission,
} from "@/utils/submissionStorage";

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

  const { activeAddress } = useWallet();
  const diff = difficultyConfig[bounty.difficulty];
  const remaining = useCountdown(bounty.deadline);
  const prizes = bounty.prizes || [];
  const skills = bounty.skills || [];
  const submissions = bounty.submissions ?? 0;
  const comments = bounty.comments ?? 0;

  // Determine if the connected wallet is the bounty creator
  const isOwner =
    !!activeAddress &&
    !!bounty.creatorAddress &&
    activeAddress.toLowerCase() === bounty.creatorAddress.toLowerCase();

  // Submission responses state
  const [responses, setResponses] = useState<BountySubmission[]>([]);
  const [submitText, setSubmitText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitInput, setShowSubmitInput] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load submissions whenever bounty changes
  useEffect(() => {
    if (bounty) {
      setResponses(getSubmissionsForBounty(bounty.id));
    }
  }, [bounty]);

  const handleSubmit = () => {
    if (!submitText.trim() || !activeAddress) return;
    setSubmitting(true);
    addSubmission(bounty.id, activeAddress, submitText.trim());
    setResponses(getSubmissionsForBounty(bounty.id));
    setSubmitText("");
    setSubmitting(false);
    setShowSubmitInput(false);
    setSubmitSuccess(true);
  };

  const handleApprove = (subId: string) => {
    approveSubmission(subId);
    setResponses(getSubmissionsForBounty(bounty.id));
  };

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
                    {bounty.appId != null && (
                      <>
                        <span className="text-border">|</span>
                        <span className="flex items-center gap-1 font-mono text-xs">
                          App ID: {bounty.appId}
                        </span>
                      </>
                    )}
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

              {/* Action buttons — conditional on role */}
              {!isOwner && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-emerald-400/40 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-500 font-semibold h-12 text-[15px]"
                  >
                    Claim Work
                    <Trophy className="ml-2 h-4 w-4" />
                  </Button>
                  {/* Only show Submit Now if user hasn't submitted yet */}
                  {activeAddress && !responses.some((s) => s.submitter === activeAddress) && !submitSuccess && (
                    <Button
                      className="w-full gradient-primary text-primary-foreground font-semibold glow-primary h-12 text-[15px]"
                      onClick={() => setShowSubmitInput((v) => !v)}
                    >
                      Submit Now
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  {/* Show input only if not already submitted and not already successful */}
                  {showSubmitInput && !responses.some((s) => s.submitter === activeAddress) && !submitSuccess && (
                    <div className="mt-3">
                      <textarea
                        value={submitText}
                        onChange={(e) => setSubmitText(e.target.value)}
                        placeholder="Paste a link to your work or describe your submission..."
                        rows={3}
                        className="w-full rounded-xl border border-border bg-white/60 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-2"
                      />
                      <Button
                        onClick={() => {
                          if (!submitText.trim() || submitting || !activeAddress) return;
                          setSubmitting(true);
                          addSubmission(bounty.id, activeAddress, submitText.trim());
                          setResponses(getSubmissionsForBounty(bounty.id));
                          setSubmitText("");
                          setSubmitting(false);
                          setShowSubmitInput(false);
                          setSubmitSuccess(true);
                        }}
                        disabled={!submitText.trim() || submitting}
                        className="w-full gradient-primary text-primary-foreground font-semibold glow-primary h-10 text-sm"
                      >
                        {submitting ? "Submitting..." : "Submit Response"}
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {/* Show success message if just submitted */}
                  {submitSuccess && (
                    <div className="mt-3 text-green-600 text-sm font-semibold text-center">
                      Submitted successfully!
                    </div>
                  )}
                  {/* If already submitted, show info */}
                  {activeAddress && responses.some((s) => s.submitter === activeAddress) && !submitSuccess && (
                    <div className="mt-3 text-green-600 text-sm font-semibold text-center">
                      You have already submitted your work.
                    </div>
                  )}
                </div>
              )}

              {isOwner && (
                <div className="border-t border-border pt-5">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    You are the publisher
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Review submissions in the panel on the right.
                  </p>
                </div>
              )}

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

              {/* ── Owner view: list of submissions ── */}
              {isOwner && (
                <div className="mt-10 border-t border-border pt-6">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Submissions ({responses.length})
                  </h3>

                  {responses.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No submissions yet. Share this bounty to attract participants!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {responses.map((sub) => (
                        <div
                          key={sub.id}
                          className={`rounded-xl border p-4 transition-colors ${
                            sub.status === "approved"
                              ? "border-emerald-400/50 bg-emerald-50/40"
                              : "border-border bg-white/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-mono text-muted-foreground mb-1">
                                  {sub.submitter.slice(0, 8)}...{sub.submitter.slice(-6)}
                                </p>
                                <p className="text-sm text-foreground break-words">{sub.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(sub.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="shrink-0">
                              {sub.status === "approved" ? (
                                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                  <CheckCircle2 className="h-4 w-4" /> Approved
                                </span>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(sub.id)}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8 px-3"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                  Approve
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Participant view: submit response form ── */}
              {!isOwner && activeAddress && bounty.creatorAddress && (
                <div className="mt-10 border-t border-border pt-6">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Submit Your Work
                  </h3>
                  <textarea
                    value={submitText}
                    onChange={(e) => setSubmitText(e.target.value)}
                    placeholder="Paste a link to your work or describe your submission..."
                    rows={4}
                    className="w-full rounded-xl border border-border bg-white/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={!submitText.trim() || submitting}
                    className="mt-3 gradient-primary text-primary-foreground font-semibold glow-primary h-10 px-6 text-sm"
                  >
                    {submitting ? "Submitting..." : "Submit Response"}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>

                  {/* Show own past submissions */}
                  {responses.filter((s) => s.submitter === activeAddress).length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Your Submissions
                      </h4>
                      <div className="space-y-3">
                        {responses
                          .filter((s) => s.submitter === activeAddress)
                          .map((sub) => (
                            <div key={sub.id} className="rounded-lg border border-border bg-white/40 p-3">
                              <p className="text-sm text-foreground break-words">{sub.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(sub.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                <span
                                  className={`text-xs font-semibold ${
                                    sub.status === "approved"
                                      ? "text-emerald-600"
                                      : sub.status === "rejected"
                                        ? "text-rose-500"
                                        : "text-amber-500"
                                  }`}
                                >
                                  {sub.status === "approved"
                                    ? "✓ Approved"
                                    : sub.status === "rejected"
                                      ? "✗ Rejected"
                                      : "⏳ Pending"}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
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
