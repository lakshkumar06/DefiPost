import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Onboard, { OnboardAPI } from "@web3-onboard/core";
import injectedModule from "@web3-onboard/injected-wallets";
import luksoModule from "@lukso/web3-onboard-config";
import Web3 from 'web3';

interface Web3ContextType {
  web3: Web3 | null;
  account: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
}

const Web3Context = createContext<Web3ContextType | null>(null);

// Initialize the LUKSO provider
const luksoProvider = luksoModule();

// Set up the injected wallet interface
const injectedWallets = injectedModule({
  custom: [luksoProvider],
  sort: (wallets) => {
    const sorted = wallets.reduce<any[]>((sorted, wallet) => {
      if (wallet.label === "Universal Profiles") {
        sorted.unshift(wallet);
      } else {
        sorted.push(wallet);
      }
      return sorted;
    }, []);
    return sorted;
  },
  displayUnavailable: ["Universal Profiles"],
});

// Create the Web3-Onboard instance
const web3Onboard: OnboardAPI = Onboard({
  wallets: [injectedWallets],
  chains: [{
    id: 4021,
    token: "LYXt",
    label: "LUKSO Testnet",
    rpcUrl: "https://4201.rpc.thirdweb.com/",
  }],
  appMetadata: {
    name: "DeFiPost",
    description: "Decentralized Social Media Platform",
  },
});

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Load saved wallet state on mount
  useEffect(() => {
    const savedAccount = localStorage.getItem('walletAccount');
    if (savedAccount) {
      setAccount(savedAccount);
      setIsConnected(true);
      // Reconnect to the wallet
      connect();
    }
  }, []);

  // Listen for wallet state changes
  useEffect(() => {
    const subscription = web3Onboard.state.select('wallets').subscribe((wallets) => {
      if (wallets.length > 0) {
        const provider = new Web3(wallets[0].provider);
        setWeb3(provider);
        setAccount(wallets[0].accounts[0].address);
        setIsConnected(true);
        localStorage.setItem('walletAccount', wallets[0].accounts[0].address);
      } else {
        setWeb3(null);
        setAccount(null);
        setIsConnected(false);
        localStorage.removeItem('walletAccount');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const connect = async () => {
    try {
      await web3Onboard.connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnect = async () => {
    try {
      const onboardState = web3Onboard.state.get();
      const [currentWallet] = onboardState.wallets;

      if (currentWallet) {
        await web3Onboard.disconnectWallet({ label: currentWallet.label });
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <Web3Context.Provider value={{ web3, account, connect, disconnect, isConnected }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}; 