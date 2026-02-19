export interface Prize {
  place: string;
  amount: string;
}
export interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  deadline: string;
  creator: string;
  status: "Open" | "In Progress" | "Completed";
  // Rich detail fields
  sponsor?: string;
  sponsorLogo?: string;
  prizes?: Prize[];
  totalPrize?: string;
  token?: string;
  submissions?: number;
  skills?: string[];
  region?: string;
  comments?: number;
  details?: string;
  requirements?: string[];
  appId?: number;
  /** Full wallet address of the bounty creator (for ownership comparison) */
  creatorAddress?: string;
}
export const MOCK_BOUNTIES: Bounty[] = [
  {
    id: "1",
    title: "Build a DEX Aggregator UI",
    description: "Create a responsive frontend for a decentralized exchange aggregator that compares prices across multiple DEXs and shows the best swap routes. Must include token selection, slippage settings, and transaction preview.",
    reward: "500 ALGO",
    category: "Frontend",
    difficulty: "Hard",
    deadline: "Mar 15, 2026",
    creator: "0x1a2b...3c4d",
    status: "Open",
    sponsor: "AlgoEarn",
    totalPrize: "500 ALGO",
    token: "ALGO",
    prizes: [
      { place: "1st", amount: "250 ALGO" },
      { place: "2nd", amount: "150 ALGO" },
      { place: "3rd", amount: "100 ALGO" },
    ],
    submissions: 12,
    skills: ["React", "TypeScript", "DeFi"],
    region: "Global",
    comments: 5,
    details: "Build a production-ready decentralized exchange aggregator frontend that queries multiple Algorand DEXs (Tinyman, Pact, Humble) and displays the best swap route for users.\n\n**What to Build**\n\nA responsive web application that:\n\n- Lets users select input/output tokens from a searchable list\n- Fetches real-time quotes from multiple DEXs\n- Displays the best route with price impact and fees\n- Shows slippage tolerance settings\n- Provides a clear transaction preview before submission\n\nThe UI should follow modern DeFi design patterns with dark/light mode support.",
    requirements: [
      "Must use React + TypeScript with Tailwind CSS",
      "Integrate with at least 2 Algorand DEXs",
      "Mobile-responsive design",
      "Include loading states and error handling",
      "Clean, well-documented code with README",
    ],
  },
  {
    id: "2",
    title: "Smart Contract Audit Report",
    description: "Perform a security audit on an Algorand-based staking contract. Identify vulnerabilities, gas optimizations, and provide a detailed report with severity classifications.",
    reward: "1,200 ALGO",
    category: "Security",
    difficulty: "Hard",
    deadline: "Mar 20, 2026",
    creator: "0x5e6f...7g8h",
    status: "Open",
    sponsor: "AlgoEarn",
    totalPrize: "1,200 ALGO",
    token: "ALGO",
    prizes: [
      { place: "1st", amount: "700 ALGO" },
      { place: "2nd", amount: "350 ALGO" },
      { place: "3rd", amount: "150 ALGO" },
    ],
    submissions: 8,
    skills: ["PyTeal", "Security", "Auditing"],
    region: "Global",
    comments: 3,
    details: "We need a thorough security audit of our Algorand staking smart contract written in PyTeal. The contract handles user deposits, reward distributions, and unstaking logic.\n\n**Scope**\n\nThe audit should cover:\n\n- Reentrancy and logic vulnerabilities\n- Access control and authorization checks\n- Integer overflow/underflow risks\n- State manipulation edge cases\n- Gas optimization opportunities\n\nDeliver a professional audit report with findings categorized by severity (Critical, High, Medium, Low, Informational).",
    requirements: [
      "Prior smart contract auditing experience required",
      "Report must follow industry-standard format",
      "Include proof-of-concept for critical findings",
      "Provide remediation recommendations for each issue",
      "Final report in PDF format",
    ],
  },
  {
    id: "3",
    title: "Design NFT Marketplace Mockup",
    description: "Design a clean, modern NFT marketplace UI in Figma. Include homepage, collection page, individual NFT page, and user profile. Dark theme preferred.",
    reward: "300 ALGO",
    category: "Design",
    difficulty: "Medium",
    deadline: "Mar 10, 2026",
    creator: "0x9i0j...1k2l",
    status: "Open",
    sponsor: "AlgoEarn",
    totalPrize: "300 ALGO",
    token: "ALGO",
    prizes: [
      { place: "1st", amount: "175 ALGO" },
      { place: "2nd", amount: "125 ALGO" },
    ],
    submissions: 24,
    skills: ["Figma", "UI/UX", "Design"],
    region: "Global",
    comments: 9,
    details: "Design a complete NFT marketplace interface for the Algorand ecosystem. The marketplace should feel premium, modern, and intuitive.\n\n**What to Design**\n\nCreate high-fidelity mockups in Figma for:\n\n- Homepage with featured collections, trending NFTs, and search\n- Collection page with grid/list views and filters\n- Individual NFT detail page with bidding UI\n- User profile with owned/created/activity tabs\n- Dark theme as primary with optional light mode\n\nFocus on visual hierarchy, spacing, and micro-interactions.",
    requirements: [
      "Deliver as a Figma file with organized layers",
      "Minimum 4 pages: Home, Collection, NFT Detail, Profile",
      "Include responsive breakpoints (desktop + mobile)",
      "Use consistent design system with reusable components",
      "Dark theme mandatory, light theme optional",
    ],
  },
  {
    id: "4",
    title: "Write Web3 Onboarding Guide",
    description: "Create a beginner-friendly guide covering wallet setup, first transaction, DeFi basics, and security best practices. Must be clear and visually engaging.",
    reward: "150 ALGO",
    category: "Content",
    difficulty: "Easy",
    deadline: "Mar 8, 2026",
    creator: "0x3m4n...5o6p",
    status: "Open",
    sponsor: "AlgoEarn",
    totalPrize: "150 ALGO",
    token: "ALGO",
    prizes: [{ place: "1st", amount: "150 ALGO" }],
    submissions: 31,
    skills: ["Writing", "Content", "Web3"],
    region: "Global",
    comments: 7,
    details: "Create an engaging, beginner-friendly guide that helps newcomers navigate the Algorand ecosystem from zero to their first on-chain transaction.\n\n**What to Cover**\n\nThe guide should walk users through:\n\n- Setting up a Pera or Defly wallet\n- Understanding ALGO and ASAs (Algorand Standard Assets)\n- Making their first transaction\n- Introduction to DeFi on Algorand (Tinyman, Folks Finance)\n- Security best practices (seed phrases, approvals, scam awareness)\n\nThe tone should be friendly, jargon-free, and include visual aids.",
    requirements: [
      "Minimum 2,000 words with clear section headers",
      "Include screenshots or custom illustrations",
      "Must be factually accurate and up-to-date",
      "Beginner-friendly language — no assumed knowledge",
      "Submit as Markdown or Google Doc",
    ],
  },
  {
    id: "5",
    title: "Develop Telegram Trading Bot",
    description: "Build a Telegram bot that allows users to execute token swaps, set limit orders, and track portfolio performance directly from the chat interface.",
    reward: "800 ALGO",
    category: "Backend",
    difficulty: "Hard",
    deadline: "Mar 25, 2026",
    creator: "0x7q8r...9s0t",
    status: "Open",
    sponsor: "AlgoEarn",
    totalPrize: "800 ALGO",
    token: "ALGO",
    prizes: [
      { place: "1st", amount: "450 ALGO" },
      { place: "2nd", amount: "250 ALGO" },
      { place: "3rd", amount: "100 ALGO" },
    ],
    submissions: 6,
    skills: ["Python", "Telegram API", "Algorand SDK"],
    region: "Global",
    comments: 2,
    details: "Build a Telegram bot that enables users to interact with Algorand DeFi protocols directly from Telegram. The bot should support token swaps via Tinyman and basic portfolio tracking.\n\n**What to Build**\n\nA Telegram bot that:\n\n- Allows users to connect/create an Algorand wallet\n- Execute token swaps through Tinyman\n- Set price alerts for specific ASAs\n- Track portfolio value and recent transactions\n- Provide a clean inline keyboard UI\n\nThe bot must be secure and never expose private keys in logs or messages.",
    requirements: [
      "Built with Python (python-telegram-bot or aiogram)",
      "Integrate with Algorand SDK and Tinyman",
      "Secure key management — never log private keys",
      "Include /start, /swap, /portfolio, /alerts commands",
      "Deployed and testable on a live Telegram bot",
    ],
  },
  {
    id: "6",
    title: "Create DAO Voting Dashboard",
    description: "Build a dashboard to display active proposals, voting power, delegation stats, and historical results for a DAO governance system.",
    reward: "450 ALGO",
    category: "Frontend",
    difficulty: "Medium",
    deadline: "Mar 18, 2026",
    creator: "0xu1v2...w3x4",
    status: "Open",
    sponsor: "AlgoEarn",
    totalPrize: "450 ALGO",
    token: "ALGO",
    prizes: [
      { place: "1st", amount: "250 ALGO" },
      { place: "2nd", amount: "200 ALGO" },
    ],
    submissions: 15,
    skills: ["React", "TypeScript", "Governance"],
    region: "Global",
    comments: 11,
    details: "Build a governance dashboard for an Algorand-based DAO. The dashboard should give token holders clear visibility into active proposals, their voting power, and governance history.\n\n**What to Build**\n\nA web dashboard featuring:\n\n- Active proposals list with status, quorum progress, and time remaining\n- Proposal detail view with vote breakdown (For/Against/Abstain)\n- User voting power and delegation management\n- Historical results with charts and participation metrics\n- Connect wallet to cast votes\n\nDesign should be clean and data-focused, inspired by Tally or Snapshot.",
    requirements: [
      "React + TypeScript with responsive design",
      "Mock data is acceptable — no live contract integration required",
      "Include at least 3 views: Proposals list, Proposal detail, User dashboard",
      "Charts for vote distribution and participation trends",
      "Clean code with component documentation",
    ],
  },
];
export const CATEGORIES = ["All", "Frontend", "Backend", "Design", "Security", "Content"];
