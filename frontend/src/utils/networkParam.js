export const networkParams = {
    "0x89": { // POLYGON_MAINNET - 137
      chainId: "0x89",
      chainName: "Matic(Polygon) Mainnet", 
      nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
      rpcUrls: ["https://polygon-rpc.com"],
      blockExplorerUrls: ["https://www.polygonscan.com/"],
    },
    "0x13881": { // MUMBAI_TESTNET - 80001
      chainId: "0x13881",
      rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
      chainName: "Mumbai Testnet",
      nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
      blockExplorerUrls: ["https://polygonscan.com/"],
    }
  };