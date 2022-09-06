//ABIs
import ERC721ABI from '../ABIs/BuildingABI.json';
import ERC20ABI from '../ABIs/ERC20ABI.json';
import ERC721StakingABI from '../ABIs/ERCStakingABI.json';
import ERC721OmegaABI from '../ABIs/OmegaBuildingABI.json';
//IMAGEs
import logoAlpha from '../assets-game/auth/alpha.png';
import logoOmega from '../assets-game/auth/omega.png';

//VARs
export let serverConfig = {}
export let servers = [
    {
        name: 'Alpha',
        desc: `The Genesis Server, the original. <br/>OG Buildings drops ERC20 Tokens`,
        img: logoAlpha,
        url: `https://www.ancientsociety.io/game`,
        btnColor: "primary",
        btnText: "Play"
    },
    {
        name: 'Omega',
        img: logoOmega,
        desc: `Nearly free to play. <br/>Make your way to the Alpha Server by playing`,
        url: `https://www.omega.ancientsociety.io/game`,
        btnColor: "success",
        btnText: "Play"
    },
]

//SERVERs
if (process.env.REACT_APP_SERVER === 'alpha') {
    serverConfig = {
        blockchain: {
            wallet: {
                metamask: true,
                coinbase: true,
                others: false,
            },
            network: {
                chainId: 137 // Polygon Mainnet: 137, Mumbai Testnet: 80001
            },
        },
        erc20: {
            available: true,
            abi: ERC20ABI,
            contractAncien: "0xDD1DB78a0Acf24e82e511454F8e00356AA2fDF0a",
            contractWood: "0x415817AA4c301799A696FB79df2947865532bA89",
            contractStone: "0x8d7d040d87C392938318b1Abdc4CbEFA836FD1aa",
            imageAncien: "",
            imageWood: "",
            imageStone: "",
        },
        erc721: {
            available: true,
            abi: ERC721ABI,
            contractTownhall: "0xF4d6cC8ecb64a9B0E7f241FcF6f93984333C7d71",
            contractLumberjack: "0xa709Dc0fdD151D1aDa29a6Ff51265f110faf5490",
            contractStonemine: "0xAbb5E30F26f00321F14A0c2C1d86765bD47C4Fe2",
            contractFisherman: "0x464Fbd612a5918018837D2B994Eb49094187a9b1",
            contractLand: "0x1c8d2618455B3f2A4E5C2573C5c98Dc3Ee2602bb",
            staking: {
                available: true,
                abi: ERC721StakingABI,
                contractTownhall: "0x0400144CB3A81F8A7Db7A54694Bbf198617dFc06",
                contractLumberjack: "0xDa0372fF3980461d9471f473Bd322a0d51F65876",
                contractStonemine: "0xDE7De7f4252423Aa66632Fd92E0c4c4C3c7Dd0e3",
                contractFisherman: "0xFCeC0e93bc1761D32309f146253E2Ad9a2b20781",
                contractLand: "0x4235AAC514f27897A9f0Aa71D10396C03549011a",
            }
        },
        contracts: {
            gemMarketplace: "0x77a97111E77a77b78EeF1d9C312471b8e9ce4C05",
        },
        map: {
            image: 'map_alpha.jpg',
            temple: true,
            flag: true,
            birds: true,
            dolphin: true,
            announcement: true
        },
        features: {
            delegation: true,
            bonusSystem: {
                available: true,
            },
            lands: {
                available: true,
                land_owner: true,
                lands: true,
                world: true,
            },
            storage: {
                transfer: true,
                withdraw: true,
                deposit: true
            },
            marketplace: true,
            fishing: true,
            miner: true,
            npc: true,
            gem: {
                available: true,
                maxPurchaseCount: 20,
            },
            inventory: true,
            leaderboard: {
                general: true,
                fishing: true
            },
            profile: true,
            prestige: true,
        },
        pages: {
            omegaMint: false
        }
    }
}

if(process.env.REACT_APP_SERVER === 'omega') {
    serverConfig = {
        blockchain: {
            wallet: {
                metamask: true,
                coinbase: true,
                others: false,
            },
            network: {
                chainId: 137 // Polygon Mainnet: 137, Mumbai Testnet: 80001
            },
        },
        erc20: {
            available: false,
            abi: "",
            contractAncien: "",
            contractWood: "",
            contractStone: "",
            imageAncien: "",
            imageWood: "",
            imageStone: "",
        },
        erc721: {
            available: true,
            abi: ERC721OmegaABI,
            contractTownhall: "0x9d29Fe95e4Df53CC69D28Be209b9bA97E140A006",
            contractLumberjack: "0x9d29Fe95e4Df53CC69D28Be209b9bA97E140A006",
            contractStonemine: "0x9d29Fe95e4Df53CC69D28Be209b9bA97E140A006",
            contractFisherman: "0x9d29Fe95e4Df53CC69D28Be209b9bA97E140A006",
            staking: {
                available: true,
                abi: ERC721StakingABI,
                contractTownhall: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractLumberjack: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractStonemine: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractFisherman: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
            }
        },
        contracts:{
            gemMarketplace: "0x77a97111E77a77b78EeF1d9C312471b8e9ce4C05",
            omegaMarketplace: "0xD336af2de2832d0320C47C91C5F8bC46344941F5"
        },
        map: {
            image: 'map_omega.jpg',
            temple: false,
            flag: true,
            birds: true,
            dolphin: true,
            announcement: true
        },
        features: {
            delegation: true,
            bonusSystem: {
                available: false,
            },
            lands:{
                available: true,
                land_owner: true,
                lands: true,
                world: true,
            },
            storage: {
                transfer: true,
                withdraw: true,
                deposit: true
            },
            marketplace: true,
            fishing: true,
            miner: true,
            npc: true,
            gem: { 
                available: false,
                maxPurchaseCount: 20,
            },
            inventory: true,
            leaderboard: {
                general: true,
                fishing: true
            },
            profile: true,
            prestige: false,
        },
        pages: {
            omegaMint: true
        }
    }
}