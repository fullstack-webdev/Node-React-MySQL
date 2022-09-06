const Web3 = require('web3');

const options = {
    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 2000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
};

const endpoint = {
    mumbai: {
        HTTP_CHAINSTACK_MUMBAI: 'https://nd-442-678-460.p2pify.com/67498e39907c8275e286db9f113e0f64',
        WSS_CHAINSTACK_MUMBAI: [
            'wss://ws-nd-442-678-460.p2pify.com/67498e39907c8275e286db9f113e0f64'
        ]
    },

    polygon: {
        HTTP_GETBLOCK_MAINNET: 'https://matic.getblock.io/mainnet/?api_key=d96f8372-4428-4442-a1aa-f3a2c4c5c3bd',
        HTTP_CHAINSTACK_MAINNET: 'https://nd-110-171-313.p2pify.com/e84dd341a72bccce7db8670e708b37ea',
        WSS_CHAINSTACK_MAINNET: [
            'wss://ws-nd-536-268-337.p2pify.com/e84dd341a72bccce7db8670e708b37ea',
            'wss://ws-nd-536-268-337.p2pify.com/cbfe08b0182651d79853456b2514024b'
        ]
    },

    ethereum: {
        HTTP_INFURA_ETH: 'https://mainnet.infura.io/v3/45eb0e4b59274a35afc5493241b5faf9',
        WSS_INFURA_ETH: [
            'wss://mainnet.infura.io/ws/v3/45eb0e4b59274a35afc5493241b5faf9'
        ]
    }

}

const chanin_info = {
    polygon: {

        contracts: {
            TOWNHALL_ADDRESS: '0xF4d6cC8ecb64a9B0E7f241FcF6f93984333C7d71',
            LUMBERJACK_ADDRESS:'0xa709Dc0fdD151D1aDa29a6Ff51265f110faf5490',
            STONEMINE_ADDRESS: '0xAbb5E30F26f00321F14A0c2C1d86765bD47C4Fe2',
            FISHERMAN_ADDRESS: '0x464Fbd612a5918018837D2B994Eb49094187a9b1',

            BUNDLE_ADDRESS: '0xc8e7488753946a09883B7cC3b22B6da113C0Fe3E',

            STAKER_TOWNHALL_ADDRESS: '0x0400144CB3A81F8A7Db7A54694Bbf198617dFc06',
            STAKER_LUMBERJACK_ADDRESS: '0xDa0372fF3980461d9471f473Bd322a0d51F65876',
            STAKER_STONEMINE_ADDRESS: '0xDE7De7f4252423Aa66632Fd92E0c4c4C3c7Dd0e3',
            STAKER_FISHERMAN_ADDRESS: '0xFCeC0e93bc1761D32309f146253E2Ad9a2b20781',

            ANCIEN_ADDRESS: '0xDD1DB78a0Acf24e82e511454F8e00356AA2fDF0a',
            WOOD_ADDRESS: '0x415817AA4c301799A696FB79df2947865532bA89',
            STONE_ADDRESS: '0x8d7d040d87C392938318b1Abdc4CbEFA836FD1aa',

            VOUCHER_ANCIEN_ADDRESS: '0x788faDeEf2D3b18D52365cc2643441edBB9A8957',
            VOUCHER_WOOD_ADDRESS: '0x2037A4Dd713623A7534Eac9DD470CfdbcC7d5C55',
            VOUCHER_STONE_ADDRESS: '0x6e137049cF46D7780e3fC8EB9b470dF6982f5BEF',

            AIRDROP_ADDRESS: '0x242Ca2Df2EbbbfD5c637f6f69AD3846dDA53866E',

            LAND_ADDRESS: '0x1c8d2618455B3f2A4E5C2573C5c98Dc3Ee2602bb',
            STAKER_LAND_ADDRESS: '0x4235AAC514f27897A9f0Aa71D10396C03549011a',
            VOUCHER_LAND_aDDRESS: '0x57F2994222926B688c7eBc352fDF15D538a6D6a4',

            ANCIENT_ALPHA_MARKETPLACE: '0x77a97111E77a77b78EeF1d9C312471b8e9ce4C05',

            ANCIENT_BUILDING_OMEGA: '0x9d29Fe95e4Df53CC69D28Be209b9bA97E140A006',
            ANCIENT_OMEGA_STAKER: '0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b',
            ANCIENT_OMEGA_MARKETPLACE: '0xD336af2de2832d0320C47C91C5F8bC46344941F5',
            ANCIENT_OMEGA_MARKETPLACE_ETH: '0x77C6DA1916F16488Ce1a22ef5FF3812a559BF3BA'
            
        },

        chainId: 137, // Polygon Mainnet: 137, Mumbai Testnet: 80001
        
        httpWeb3: new Web3(new Web3.providers.HttpProvider(endpoint.polygon.HTTP_CHAINSTACK_MAINNET)),
        wssWeb3: new Web3(new Web3.providers.WebsocketProvider(endpoint.polygon.WSS_CHAINSTACK_MAINNET[0], options))
    },

    mumbai: {

        contracts: {
            ANCIENT_ALPHA_MARKETPLACE: '0xa52e2E18396A1F0C01D2AF9672b22eC8D375e653',
            LAND_ADDRESS: '0x95F8bF0fB163eFC0626647E236d4f250e1b229e1',
            STAKER_LAND_ADDRESS: '0x3ba1B4c6ECc2a49C94Ddd79d75E1d58C439634C1',
            VOUCHER_LAND_aDDRESS: '0xb28Df1A90bf1cEC828B43d3efA2F72De1D804F73',
            ANCIENT_BUILDING_OMEGA: '0xDcAa3A2eE0e6E5e78a585C4d3Ae39DcDab6d9C0A',
            ANCIENT_OMEGA_MARKETPLACE: '0x2a67143503373b82BCD3fEb8E91DD0154b7975E9',
            ANCIENT_ALPHA_MARKETPLACE: '0xa52e2E18396A1F0C01D2AF9672b22eC8D375e653' 
        },

        chainId: 80001, // Polygon Mainnet: 137, Mumbai Testnet: 80001
        
        httpWeb3: new Web3(new Web3.providers.HttpProvider(endpoint.mumbai.HTTP_CHAINSTACK_MUMBAI)),
        wssWeb3: new Web3(new Web3.providers.WebsocketProvider(endpoint.mumbai.WSS_CHAINSTACK_MUMBAI[0], options))
    },

    ethereum: {

        contracts: {
            WFISHERMAN_ADDRESS: '0xb54a00Dc04fAd034ef2ca9561cA858ed9243329C'
        },

        chainId: 1, // Polygon Mainnet: 137, Mumbai Testnet: 80001
        
        httpWeb3: new Web3(new Web3.providers.HttpProvider(endpoint.ethereum.HTTP_INFURA_ETH)),
        wssWeb3: new Web3(new Web3.providers.WebsocketProvider(endpoint.ethereum.WSS_INFURA_ETH[0], options))
    }
}

const database = {
    alpha_dev_db: {
        USER_DB: 'developer',
        PASSWORD_DB: 'AVNS_iKHqdnCIu2mkKetOuIz',
        HOST_DB: 'ancient-society-db-do-user-10964164-0.b.db.ondigitalocean.com',
        PORT_DB: '25060',
        DATABASE: 'alpha_dev_db',
        CONNECTION_LIMIT: '1'
    },

    omega_dev_db: {
        USER_DB: 'developer',
        PASSWORD_DB: 'AVNS_iKHqdnCIu2mkKetOuIz',
        HOST_DB: 'ancient-society-db-do-user-10964164-0.b.db.ondigitalocean.com',
        PORT_DB: '25060',
        DATABASE: 'omega_dev_db',
        CONNECTION_LIMIT: '1'
    },

    omega_db: {
        USER_DB: 'developer',
        PASSWORD_DB: 'AVNS_iKHqdnCIu2mkKetOuIz',
        HOST_DB: 'ancient-society-db-do-user-10964164-0.b.db.ondigitalocean.com',
        PORT_DB: '25060',
        DATABASE: 'omega_db',
        CONNECTION_LIMIT: '1'
    },
    
}

const serverConfig = {

    PORT: '5000',
    MAX_LEVEL: '10',

    MAX_NUMBER_VALUE: '1000000000',
    MAX_VOUCHER_VALUE: '150000',
    VOUCHER_ENABLED: true,
    FISHERMAN_SUPPLY: '10000',
    LAST_RESET_LEADERBOARD: '2022-08-13 10:30:00.000000',
    CONNECTION_LIMIT: '1',

    ANCIEN_IMAGE: 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/ancien.webp',
    WOOD_IMAGE: 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/wood.webp',
    STONE_IMAGE: 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/stone.webp',

    ENV_FILE: 'developmentFile',

    SECRET_KEY_TO_SIGN: 'ABC',
    SECRET_KEY_OLD_JWT: 'DEF',
    SECRET_KEY_NEW_JWT: 'GHI',

    RECAPTCHA_SECRET_KEY: '',

    PRIVATE_KEY_SIGNER: '4c2d17b13df2389ad39486b1db6285226213380b8e0b2a100149fc68daedbf9a',
    OWNER_KEY: '',

    AWS: {
        BUCKET_ACCESS_KEY: '',
        BUCKET_SECRET_KEY: '',

        AWS_IAM_USER_KEY: 'AKIA4QVRCAOTVLEO75VH',
        AWS_IAM_USER_SECRET: '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',
        AWS_BUCKET_NAME: 'provaletturaimage/testing'
    },

    

    marketplace:{
        MARKETPLACE_INVENTORY_TOOL_ADDRESS: '0xacbb7263607e2058B0843F782775D377f45362ce',
        MARKETPLACE_TICKET_ADDRESS: 'futuremarketplaceAddress'
    },

    
    MIN_REVOKE_SEC: '172800',

    bonus: {
        MAX_IMPLICIT_BONUS: '1',
        MAX_PREFIX_BONUS: '2',
        MAX_SUFFIX_BONUS: '2',

        MAX_IMPLICIT_TIER: '3',
        MAX_PREFIX_TIER: '5',
        MAX_SUFFIX_TIER: '5'  
    },
    

    chain: chanin_info.polygon,
    database: database.alpha_dev_db,

    FMC_ADDRESS: '0x8ae0d617f1a6f6d3fdb2b398f4814bebd3939ddf',
    
}

if(process.env.chainId == 1){
    serverConfig.chain = chanin_info.ethereum; 
}

if(process.env.chainId == 137){
    serverConfig.chain = chanin_info.polygon; 
}

if(process.env.chainId == 80001){
    serverConfig.chain = chanin_info.mumbai; 
}

if(process.env.DB == 'alpha_dev_db'){
    serverConfig.database = database.alpha_dev_db; 
}

if(process.env.DB == 'omega_dev_db'){
    serverConfig.database = database.omega_dev_db; 
    
}

if(process.env.DB == 'omega_db'){
    serverConfig.database = database.omega_db; 
    
}
module.exports.serverConfig = serverConfig


//POLYGON
const wssMainnetWeb3 = new Web3(new Web3.providers.WebsocketProvider(process.env.CHAINSTACK_MAINNET_ENDPOINT_1, options));
const wssMumbaiWeb3 = new Web3(new Web3.providers.WebsocketProvider(process.env.CHAINSTACK_MAINNET_ENDPOINT_MUMBAI, options));
const httpMainnetWeb3 = new Web3(new Web3.providers.HttpProvider(process.env.HTTP_CHAINSTACK_MAINNET_ENDPOINT));
const httpMumbaiWeb3 = new Web3(new Web3.providers.HttpProvider(process.env.HTTP_CHAINSTACK_MUMBAI_ENDPOINT));

//ETHEREUM
const httpEthWeb3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_ETH_ENDPOINT_HTTP));

module.exports = {
    wssMainnetWeb3,
    wssMumbaiWeb3,
    httpMainnetWeb3,
    httpMumbaiWeb3,
    httpEthWeb3
}