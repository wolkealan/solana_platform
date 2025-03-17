// src/components/WalletConnection.jsx
import React, { useEffect, useState } from 'react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletConnection = ({ onWalletConnected }) => {
  const { publicKey, connected } = useWallet();
  
  useEffect(() => {
    if (connected && publicKey) {
      onWalletConnected(publicKey.toString());
    }
  }, [connected, publicKey, onWalletConnected]);
  
  return (
    <div className="wallet-connection">
      <WalletMultiButton />
    </div>
  );
};

export const WalletConnectionProvider = ({ children }) => {
    const wallets = [new PhantomWalletAdapter()];
    
    return (
      <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  };
  
  export { WalletMultiButton };
