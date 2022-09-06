const logger = require("../logging/logger");

const {Utils} = require("../utils/utils")

const Web3 = require('web3');
const ABI = require('../ABI/building-abi.json');
const fmcABI = require('../ABI/fmc-abi.json');

//PROVIDERS
const web3Polygon = new Web3(new Web3.providers.HttpProvider(process.env.HTTP_CHAINSTACK_MAINNET_ENDPOINT));
const web3Ethereum = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_ETH_ENDPOINT_HTTP));

//MORALIS
const Moralis = require("moralis/node");

const serverUrl = "https://sphgtoxtthaq.usemoralis.com:2053/server";
const appId = "5UlfBFwxj8UwaTju3uR5OlIaux7D8QbbP2LwjB93";
const masterKey = "632QSSyou0Sm4XjNzeOh804I1lXY7jq00eB5z1C0";


class Blockchain{
    constructor(){}

    static async balanceIsEnough(network, address, contract, balanceMin) {
        let balanceOf;
        let myContract;

        logger.info(`balanceIsEnough [START]`);

        try{
            if(contract == process.env.FMC_ADDRESS.trim()){
                myContract = new web3Ethereum.eth.Contract(fmcABI, contract);
                balanceOf = await myContract.methods.addressMintedBalance(address).call();
                console.log("FMC: ", balanceOf)
            }else{
                // console.log('[NETWORK]: ', network)
                if(network == 1) myContract = new web3Ethereum.eth.Contract(ABI, contract);
                if(network == 137) myContract = new web3Polygon.eth.Contract(ABI, contract);
                // console.log('[myContract]: ', myContract)
                
                balanceOf = await myContract.methods.balanceOf(address).call();
            }
            
            
            
        }catch(error){
            logger.error(`Error in balanceIsEnough: ${Utils.printErrorLog(error)}`);
            return false;
        }
       
        logger.info(`balanceIsEnough [END]`);

        if (balanceOf >= balanceMin){ return true }
        else{ return false } 
    }

    static async getNFTs(address, chain){
        let NFTs;

        await Moralis.start({ serverUrl, appId, masterKey });

        const options = {
            chain,
            address,
        };

        try{
            NFTs = await Moralis.Web3API.account.getNFTs(options);
        }catch(err){
            console.log('Error in Blockchain.getNFTs: ', err)
        }

        // console.log('NFTs: ', NFTs)

        return NFTs.result
    }

    static async getOwnerStruct(idBuilding, type){
        let result;
        let addr;
        let struct={};
        if(type==1) addr = process.env.STAKER_TOWNHALL_ADDRESS;
        if(type==2) addr = process.env.STAKER_LUMBERJACK_ADDRESS;
        if(type==3) addr = process.env.STAKER_STONEMINE_ADDRESS;
        if(type==4) addr = process.env.STAKER_FISHERMAN_ADDRESS;
        
    
        let hash = web3Polygon.utils.soliditySha3({
            type: "uint256",
            value: idBuilding  //tokenId -> deve diventare i = idBuilding
        },
        {
            type: "uint",
            value: 7  //slot -> fisso, sarebbe offset posizione di memoria nello storage del contract
        })
    
        try{
            result = await web3Polygon.eth.getStorageAt(addr, hash)
        }catch(error){
            console.log(error)
        }
        // console.log("result:",result);
    
        let noX = result.substring(12);
        let owner = noX.substring(0,40);
        let blockTime = noX.substring(40, 52);
        let isStake = noX.substring(52, 54);
    
        owner = '0x' + owner;
        blockTime = '0x' + blockTime;
        isStake = '0x' + isStake;
    
        blockTime = web3Polygon.utils.hexToNumber(blockTime)
        isStake = web3Polygon.utils.hexToNumber(isStake)
    
    
        // console.log("owner : ", owner);
        // console.log("blockTime : ", blockTime);
        // console.log("isStake : ", isStake);
    
        struct = {
            owner,
            blockTime,
            isStake
        };
        
        return struct;
    }
}
module.exports = {Blockchain}