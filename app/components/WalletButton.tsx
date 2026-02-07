import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useCallback, useState, useEffect } from 'react';

export default function WalletButton() {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);

  const handleConnect = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const copyAddress = useCallback(() => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [publicKey]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!connected) {
    return (
      <button className="btn btn-primary" onClick={handleConnect}>
        Connect Wallet
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button
        className="btn btn-secondary"
        onClick={copyAddress}
        title="Click to copy address"
        style={{ minWidth: '100px' }}
      >
        {copied ? 'Copied!' : publicKey ? formatAddress(publicKey.toBase58()) : '...'}
      </button>
      <button className="btn btn-secondary" onClick={handleDisconnect}>
        Disconnect
      </button>
    </div>
  );
}
