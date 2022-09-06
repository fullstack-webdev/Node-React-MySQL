//Utilities
const logger = require('../logging/logger');
const {Utils} = require("../utils/utils");

//WEB3
const {httpMainnetWeb3} = require('../config/web3Config')
const {httpEthWeb3} = require('../config/web3Config')

//ABI
const marketplaceAbi = require('../ABI/omega-marketplace-abi.json')

//CONTRACTS
const marketplace = new httpMainnetWeb3.eth.Contract(marketplaceAbi, process.env.ANCIENT_OMEGA_MARKETPLACE);
const marketplaceEth = new httpEthWeb3.eth.Contract(marketplaceAbi, process.env.ANCIENT_OMEGA_MARKETPLACE_ETH);
// var myStonemine = new web3.eth.Contract(buildingAbi, process.env.STONEMINE_ADDRESS);

class ServerHelper{
    static async getOraclePrice(oracleAddress, priceUsd, chainId){
        let market;
        if(chainId == 1){
            market = marketplaceEth;
        }else if(chainId == 137){
            market = marketplace;
        }
        let singleUsd;
        try{
            singleUsd = await market.methods.getLatestPrice(oracleAddress).call();
        }catch(error){
            logger.error(`error in getLatestPrice: ${Utils.printErrorLog(error)}`)
            throw error;
        }

        let finalPrice;
        try{
            finalPrice = await market.methods.conversionCurrency(singleUsd, priceUsd).call();
        }catch(error){
            logger.error(`error in conversionCurrency: ${Utils.printErrorLog(error)}`)
        }

        logger.debug(`Oracle price: ${httpMainnetWeb3.utils.fromWei(finalPrice, 'ether')}`);
        return finalPrice;
    }

    static async getNonOraclePrice(){
        // let singleUsd;
        // try{
        //     singleUsd = await marketplace.methods.getLatestPrice(oracleAddress).call();
        // }catch{
        //     logger.error(`error in getLatestPrice: ${Utils.printErrorLog(error)}`)
        // }

        // let finalPrice;
        // try{
        //     finalPrice = await marketplace.methods.conversionCurrency(singleUsd, priceUsd).call();
        // }catch{
        //     logger.error(`error in conversionCurrency: ${Utils.printErrorLog(error)}`)
        // }

        // return finalPrice;
    }
}

module.exports = {
    ServerHelper
}