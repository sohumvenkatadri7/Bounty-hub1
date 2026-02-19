import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, LogOut, Menu, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@txnlab/use-wallet-react";
import { ellipseAddress } from "@/utils/ellipseAddress";


interface NavbarProps {
  onCreateBounty: () => void;
  onConnectWallet: () => void;
}

const Navbar = ({
  onCreateBounty,
  onConnectWallet,
}: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signInWithGoogle, logout } = useAuth();
  const { activeAddress } = useWallet();

  const isLoggedIn = !!user;
  const walletConnected = !!activeAddress;

  const handleLogout = async () => {
    // Disconnect wallet too if connected
    await logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-navbar">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg animated-logo shadow-lg shadow-violet-500/25 transition-shadow duration-300 group-hover:shadow-violet-500/40" />
          <span className="font-display text-xl font-bold text-foreground">
            Bounty<span className="animated-gradient-text">Hub</span>
          </span>
        </a>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              {/* User avatar + name */}
              <div className="flex items-center gap-2 rounded-full glass-card px-3 py-1">
                {user.photoURL && (
                  <img src={user.photoURL} alt="avatar" className="h-6 w-6 rounded-full" />
                )}
                <span className="text-xs font-medium text-foreground">
                  {user.displayName?.split(" ")[0]}
                </span>
              </div>

              <Button variant="outline" size="sm" onClick={onCreateBounty}>
                <Plus className="mr-1 h-4 w-4" />
                Create Bounty
              </Button>
              {!walletConnected ? (
                <Button size="sm" onClick={onConnectWallet} className="gradient-primary text-primary-foreground font-semibold glow-primary">
                  <Wallet className="mr-1 h-4 w-4" />
                  Connect Wallet
                </Button>
              ) : (
                <button
                  onClick={onConnectWallet}
                  className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  {ellipseAddress(activeAddress)}
                </button>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={signInWithGoogle} className="gradient-primary text-primary-foreground font-semibold">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/10 glass md:hidden"
          >
            <div className="flex flex-col gap-2 p-4">

              {isLoggedIn ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-2 rounded-lg glass-card px-3 py-2 mb-1">
                    {user.photoURL && (
                      <img src={user.photoURL} alt="avatar" className="h-6 w-6 rounded-full" />
                    )}
                    <span className="text-sm font-medium text-foreground">{user.displayName}</span>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => { onCreateBounty(); setMobileOpen(false); }}>
                    <Plus className="mr-1 h-4 w-4" /> Create Bounty
                  </Button>
                  {!walletConnected ? (
                    <Button size="sm" onClick={() => { onConnectWallet(); setMobileOpen(false); }} className="gradient-primary text-primary-foreground font-semibold">
                      <Wallet className="mr-1 h-4 w-4" /> Connect Wallet
                    </Button>
                  ) : (
                    <button
                      onClick={() => { onConnectWallet(); setMobileOpen(false); }}
                      className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm text-primary text-center"
                    >
                      {ellipseAddress(activeAddress)}
                    </button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                    <LogOut className="mr-1 h-4 w-4" /> Logout
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => { signInWithGoogle(); setMobileOpen(false); }} className="gradient-primary text-primary-foreground font-semibold">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
