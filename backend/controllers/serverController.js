const logger = require('../logging/logger');
const Sanitizer = require('../utils/sanitizer');

const {ServerQueries} = require('../queries/serverQueries');
const {ServerInterface} = require('../interfaces/JS/serverInterface');

const Validator = require('../utils/validator');
const {Utils} = require("../utils/utils");

let sanitizer = new Sanitizer();

async function getInfo(req, res){
    let playersOnline;
    let playersTotal;

    try{
        playersOnline = await ServerQueries.getOnlineUser();
        console.log(playersOnline)
    }catch(error){
        logger.error(`Error in ServerQueries.getOnlineUser, ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: {
                errorMessage: "Error in ServerQueries.getOnlineUser"
            }
        });
    }
    logger.debug(`playersOnline response: ${JSON.stringify(playersOnline)}`);

    try{
        playersTotal = await ServerQueries.getTotalUser();
    }catch(error){
        logger.error(`Error in ServerQueries.getTotalUser, ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: {
                errorMessage: "Error in ServerQueries.getTotalUser"
            }
        });
    }
    logger.debug(`playersTotal response: ${JSON.stringify(playersTotal)}`);

    return res
    .json({
        success: true,
        data: {
            serverInfo: {
                serverStatus: true, 
                playersOnline: playersOnline[0].counter, 
                playersTotal: playersTotal[0].counter
            }
        }
    })
}

async function getBrokenMarketplace(req, res){
    
    let offerList;
    let specialCurrencies;
    let anyCurrencies;
    let responseOffer;

    try{
        offerList = await ServerQueries.getBrokenMarketplace();
        
    }catch(error){
        logger.error(`Error in ServerQueries.getBrokenMarketplace, ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: {
                errorMessage: "ServerQueries.getBrokenMarketplace"
            }
        });
    }
    logger.debug(`offerList response: ${JSON.stringify(offerList)}`);

    try{
        specialCurrencies = await ServerQueries.getSpecialCurrencies();
        
    }catch(error){
        logger.error(`Error in ServerQueries.getSpecialCurrencies, ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: {
                errorMessage: "Error in ServerQueries.getSpecialCurrencies"
            }
        });
    }

    try{
        anyCurrencies = await ServerQueries.getAnyCurrencies();
        
    }catch(error){
        logger.error(`Error in ServerQueries.getAnyCurrencies, ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: {
                errorMessage: "Error in ServerQueries.getAnyCurrencies"
            }
        });
    }

    try{
        responseOffer = await ServerInterface.buildMarketOfferModel(offerList, specialCurrencies, anyCurrencies);
    }catch(error){
        logger.error(`Error in ServerInterface.buildMarketOfferModel, ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: {
                errorMessage: "Error in ServerInterface.buildMarketOfferModel"
            }
        });
    }
    logger.debug(`responseOffer: ${JSON.stringify(responseOffer)}`);

    return res
    .json({
        success: true,
        data: {
            brokenMarketplace: responseOffer
        }
    })
}

module.exports = {
    getInfo,
    getBrokenMarketplace
}