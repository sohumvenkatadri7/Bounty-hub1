import React, { createContext, useContext } from "react";

interface AuthContextType {
  // Wallet-only auth - no Firebase needed
}

const AuthContext = createContext<AuthContextType>({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Simple context provider - wallet connection handled by use-wallet-react
  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
};
