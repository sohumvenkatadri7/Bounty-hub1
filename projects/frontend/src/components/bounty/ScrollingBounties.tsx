import { Bounty, MOCK_BOUNTIES } from "@/data/bounties";
import BountyCard from "./BountyCard";

interface ScrollingBountiesProps {
  onBountyClick: (bounty: Bounty) => void;
}

const ScrollingBounties = ({ onBountyClick }: ScrollingBountiesProps) => {
  const doubled = [...MOCK_BOUNTIES, ...MOCK_BOUNTIES];

  return (
    <section className="py-16 overflow-hidden relative">
      <div className="container mx-auto px-4 mb-10">
        <h2 className="font-display text-3xl font-bold text-foreground">
          {"\u{1F525}"} Trending Bounties
        </h2>
        <p className="mt-2 text-muted-foreground">
          Scroll through the hottest opportunities right now
        </p>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24" style={{ background: 'linear-gradient(to right, rgba(252,231,243,0.9), transparent)' }} />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24" style={{ background: 'linear-gradient(to left, rgba(219,234,254,0.9), transparent)' }} />

        <div className="flex gap-6 animate-scroll-left hover:[animation-play-state:paused]">
          {doubled.map((bounty, i) => (
            <BountyCard key={`${bounty.id}-${i}`} bounty={bounty} onClick={onBountyClick} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollingBounties;
