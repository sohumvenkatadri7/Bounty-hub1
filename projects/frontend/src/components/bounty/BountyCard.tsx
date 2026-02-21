import { motion } from "framer-motion";
import { Bounty } from "@/data/bounties";
import { ArrowRight, Clock } from "lucide-react";

interface BountyCardProps {
  bounty: Bounty;
  onClick: (bounty: Bounty) => void;
  index?: number;
}

const palettes = [
  { bg: "from-blue-50 to-cyan-50", accent: "text-blue-500", dot: "bg-blue-400" },
  { bg: "from-emerald-50 to-green-50", accent: "text-emerald-500", dot: "bg-emerald-400" },
  { bg: "from-violet-50 to-purple-50", accent: "text-violet-500", dot: "bg-violet-400" },
  { bg: "from-amber-50 to-orange-50", accent: "text-amber-500", dot: "bg-amber-400" },
  { bg: "from-sky-50 to-cyan-50", accent: "text-sky-500", dot: "bg-sky-400" },
  { bg: "from-teal-50 to-green-50", accent: "text-teal-500", dot: "bg-teal-400" },
];

const BountyCard = ({ bounty, onClick, index = 0 }: BountyCardProps) => {
  const p = palettes[index % palettes.length];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onClick={() => onClick(bounty)}
      className={`group min-w-[320px] cursor-pointer rounded-2xl bg-gradient-to-br ${p.bg} card-pastel p-6`}
    >
      {/* Category + difficulty */}
      <div className="flex items-center justify-between mb-4">
        <span className={`text-[11px] font-semibold uppercase tracking-[0.15em] ${p.accent}`}>
          {bounty.category}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-white/60 px-2.5 py-1 text-[11px] font-medium text-slate-500">
          <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
          {bounty.difficulty}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display text-lg font-bold leading-snug text-slate-800 line-clamp-2 mb-2">
        {bounty.title}
      </h3>

      {/* Description */}
      <p className="text-[13px] leading-relaxed text-slate-500 line-clamp-2 mb-5">
        {bounty.description}
      </p>

      {/* Bottom: reward + deadline + arrow */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
        <span className={`text-sm font-bold ${p.accent}`}>{bounty.reward}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            {bounty.deadline}
          </span>
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/70 ${p.accent} opacity-0 group-hover:opacity-100 transition-opacity`}>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default BountyCard;
