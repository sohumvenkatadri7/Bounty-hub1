import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback, useMemo } from "react";

/* ── Animated count-up hook ── */
function useCountUp(target: number, duration = 2000, delay = 500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo for a snappy feel
        const eased = 1 - Math.pow(2, -10 * progress);
        setCount(Math.floor(eased * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);

  return count;
}

/* ── Sparkle particles ── */
const Particles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 3,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: `linear-gradient(135deg, rgba(124,58,237,0.6), rgba(59,130,246,0.6))`,
            animation: `sparkle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

interface HeroSectionProps {
  onExplore: () => void;
}

const HeroSection = ({ onExplore }: HeroSectionProps) => {
  const bountyCount = useCountUp(120, 2000, 600);
  const paidOut = useCountUp(85, 2000, 800);
  const hunters = useCountUp(1200, 2000, 1000);

  const formatValue = useCallback((raw: number, label: string) => {
    if (label === "Bounties") return `${raw}+`;
    if (label === "Paid Out") return `$${raw}K`;
    if (label === "Hunters") return raw >= 1000 ? `${(raw / 1000).toFixed(1)}K` : `${raw}`;
    return `${raw}`;
  }, []);

  const stats = [
    { raw: bountyCount, label: "Bounties" },
    { raw: paidOut, label: "Paid Out" },
    { raw: hunters, label: "Hunters" },
  ];

  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      <Particles />
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full glass-card shimmer-card px-5 py-2 text-sm font-medium text-primary"
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="h-3.5 w-3.5" />
            Earn crypto by completing bounties
          </motion.div>

          <h1 className="font-display text-5xl font-bold leading-tight md:text-7xl text-foreground">
            Find, Build &{" "}
            <span className="animated-gradient-text">Earn</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Discover bounties across Web3, contribute your skills, and get rewarded in crypto. From smart contracts to design — there's a bounty for you.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                onClick={onExplore}
                className="gradient-primary text-white font-semibold text-base px-8 border-0 glow-primary"
              >
                Explore Bounties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.15, type: "spring", stiffness: 200 }}
                className="rounded-2xl glass-card shimmer-card p-4 text-center cursor-default"
                whileHover={{ y: -6, scale: 1.05 }}
              >
                <div className="font-display text-2xl font-bold text-gradient-primary">
                  {formatValue(stat.raw, stat.label)}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
