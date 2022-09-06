import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';

// metamask
const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 137, 80001],
})

// wallet-connect
const walletconnect = new WalletConnectConnector({
  rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
});

// coinbase
const walletlink = new WalletLinkConnector({
  url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
  appName: "web3-react-demo",
});

export const walletConnector = {
  injected: injected,
  walletConnect: walletconnect,
  coinbaseWallet: walletlink,
};