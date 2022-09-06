const MarketModel = require("../models/marketModel");
const UserModel = require('../models/userModel');
const mysql = require('../config/databaseConfig');

const {MarketValidation} = require('../validations/marketValidation');
const {MarketService} = require('../services/marketService');
const {MarketHelper} = require('../helpers/marketHelper');
const {MarketQueries} = require('../queries/marketQueries');
const {UserQueries} = require('../queries/userQueries');
const {UserHelper} = require('../helpers/userHelper');
const Validator = require('../utils/validator');
const Sanitizer = require('../utils/sanitizer');
const logger = require("../logging/logger");
const { createLogger } = require("winston");
const {Utils} = require("../utils/utils");

let sanitizer = new Sanitizer();

const MAX_VIEW = 15;
const MAX_AD_NUMBER = 10;
const MAX_LISTING_TIME = (3600 * 24 * 28 + 3600 * 23); // 28 days and 23 h

async function getAccountListing(req, res){
    logger.info(`getAccountListing START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let address = req.locals.address;
    let id = req.body.id;
    
    let listing;
    let listingPostStatus;
    let listingResponse;
    let inventory;
    let adAllowed;
    let adOnSale;

    let marketService = new MarketModel.MarketService();
    let marketModel = new MarketModel.MarketModel();
    let userInventory = new UserModel.InventoryService();


    if(address == undefined || address == null){
        logger.warn(`getAccountListing address undefined`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: address null or undefined"
            }
        });
    }

    if(!sanitizer.sanitizeAddress(address)){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Not an address"
            }
        })
    }

    if(id == null || id == undefined){
        id = 0;
    }

    if(!sanitizer.isNaturalInteger(id)){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Not a correct type"
            }
        })
    }
    logger.info(`getAccountListing address: ${address}`);
    logger.info(`getAccountListing request, address: ${address}, id: ${id}`);

    id = parseInt(id);

    try{
        listing = await marketService.getAccountListing(address, id);

        logger.debug(`listing: ${JSON.stringify(listing)}`);
    }catch(error){
        return res
        .status(401)
        .json({
            success: false,
            error:{
                errorMessage: "Error in retrieving data"
            }
        });  
    }

    try{
        listingPostStatus = await marketService.checkListingStatus(listing);
    }catch(error){
        logger.error(`Error in marketService checkListingStatus: ${Utils.printErrorLog(error)}`);
        return res
        .status(401)
        .json(error);    
    }

    

    try{
        

        listingResponse = marketModel.buildFinalResponse(listingPostStatus);

        logger.debug(`listingResponse: ${JSON.stringify(listingResponse)}`);

        inventory = await userInventory.getResources(address);
        inventory = userInventory.buildResourcesResponse(inventory);

        logger.debug(`inventory: ${JSON.stringify(inventory)}`);

        adOnSale = await marketService.getAccountListingGivenStatus(address, 1);
        adAllowed = (adOnSale.length < 10) ? true : false;

        logger.debug(`adAllowed: ${JSON.stringify(adOnSale)}`);

        logger.info("getAccountListing END");

        return res
        .status(200)
        .json({
            success: true,
            data: {
                listings: listingResponse,
                inventory,
                adAllowed
            }
        });
        
    }catch(error){
        logger.error(`Error in marketService getAccountListing: ${Utils.printErrorLog(error)}`);

        return res
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
}

async function createAd(req, res){
    logger.info(`createAd START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    
    let address = req.locals.address;
    
    let type = req.body.type;  // int 2,3
    let price = req.body.price;  // float > 0
    let duration = req.body.duration;  // min 3600 sec int
    let quantity = req.body.quantity;  // min 1 int

    let totalPrice;
    let resources;
    let balance;

    let now;
    let endingTime;
    let creationTime;

    let durationMilliSec;

    let responseBalance;
    let responseCreateAd;

    let newListing;
    let inventory;

    let adAllowed;
    let adOnSale;


    let userInventory = new UserModel.InventoryService();
    let marketModel = new MarketModel.MarketModel();
    let marketService = new MarketModel.MarketService();

    

    if(!sanitizer.validateInput(address, type, price, duration, quantity)){
        logger.warn(`Bad request, address: ${address}, type: ${type}, price: ${price}, duration: ${duration}, quantity: ${quantity}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: something in input null or undefined"
            }
        });
    }

    if(!sanitizer.sanitizeAddress(address)){
        logger.warn(`Bad request: Not an address: ${address}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Not an address"
            }
        })
    }

    if(!sanitizer.isPositiveInteger(type) || (type != 2 && type != 3) ){
        logger.warn(`Bad request: wrong type: ${type}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: wrong type"
            }
        });

    }

    if(!sanitizer.isPositiveFloatWithLessThanTwoDecimals(price)){
        logger.warn(`Bad request: wrong price: ${price}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: wrong price"
            }
        });
    }


    if(!sanitizer.isPositiveInteger(quantity) || quantity < 1){
        logger.warn(`Bad request: quantity less than 1 or not number: ${quantity}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: quantity less than 1 or not number"
            }
        });

    }

    if(!sanitizer.isPositiveInteger(duration) || duration < 3600  || duration > MAX_LISTING_TIME){
        logger.warn(`Bad request: wrong duration: ${duration}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: wrong duration"
            }
        });

    }

    logger.info(`createAd address: ${address}`);
    logger.info(`createAd request, address: ${address}, price: ${price}, quantity: ${quantity}, duration: ${duration}, type: ${type}`);

    price = parseFloat(price);
    quantity = parseInt(quantity);
    duration = parseInt(duration);
    type = parseInt(type);


    //VARI sanitizers, aggiungere ai sanitizer isPositiveFloat -> composta da isNumber + Number(input)/parseFloat + > 0

    //Controlli su limite massimo per quantity
    try{

        adOnSale = await marketService.getAccountListingGivenStatus(address, 1);
        if(adOnSale.length >= MAX_AD_NUMBER){
            logger.warn(`Max number of ads reached, addOnSale: ${JSON.stringify(adOnSale)}`);

            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "Max number of ads reached"
                }
            });
        }
        logger.debug(`adOnSale: ${JSON.stringify(adOnSale)}`);

        resources = await userInventory.getResources(address);
        logger.debug(`resources: ${JSON.stringify(resources)}`);


        balance = userInventory.getResourceGivenType(resources, type);

    }catch(error){
        logger.error(`Error in userInventory.getResources: ${Utils.printErrorLog(error)}`);
        
        return res
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }

    if(balance < quantity){
        logger.warn("Not Enough Balance");
        return res
        .json({
            success: false,
            error: {
                errorMessage: "Not enough balance"
            }
        });
    }


    balance -= quantity;

    logger.debug(`balance post sub: ${balance}`);

    totalPrice = price * quantity;

    logger.debug(`totalPrice: ${totalPrice}`);

    try{

        responseBalance = await userInventory.subResourcesGivenType(address, type, quantity);
        if(responseBalance.changedRows != 1){
            logger.error(`createAd is failed, responseBalance: ${responseBalance}`);

            return res
            .json({
                success: false,
                error: {
                    errorCode: 0, 
                    errorMessage: "Ad creation is failed"
                }
            }); 
        }
        //check affectedRows == 1
        logger.debug(`responseBalance: ${JSON.stringify(responseBalance)}`);

        durationMilliSec = duration * 1000;
        
        now = new Date().getTime();

        let ending = now + durationMilliSec;

        creationTime = new Date().toISOString();
        endingTime = new Date(ending).toISOString();

        logger.debug(`durationMillisec: ${durationMilliSec}, now: ${now}, ending: ${ending}, creationTime: ${creationTime}, endingTime: ${endingTime}`);
        //debug
        responseCreateAd = await marketService.createAd(address, type, quantity, price, totalPrice, creationTime, endingTime);
        //check affectedRows == 1
        logger.debug(`responseCreateAd: ${JSON.stringify(responseCreateAd)}`);


        newListing = await marketService.getAccountListing(address, 0);
        logger.debug(`newListing: ${JSON.stringify(newListing)}`);

        newListing = marketModel.buildFinalResponse(newListing);

        inventory = await userInventory.getResources(address);
        inventory = userInventory.buildResourcesResponse(inventory);
        logger.debug(`inventory: ${JSON.stringify(inventory)}`);

        adOnSale = await marketService.getAccountListingGivenStatus(address, 1);
        adAllowed = (adOnSale.length < 10) ? true : false;

        logger.debug(`adAllowed: ${adAllowed}`);

        logger.info(`createAd response: ${
            JSON.stringify({
                listings: newListing,
                inventory,
                adAllowed
            })
        }`);

        logger.info("createAd END");

        return res
        .status(200)
        .json({
            success: true,
            data:{
                listings: newListing,
                inventory,
                adAllowed
            }
        });
        
    }catch(error){
        logger.error(`Error in marketService createAd: ${Utils.printErrorLog(error)}`);

        return res
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
}

async function cancelAd(req, res){
    logger.info(`cancelAd START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let address = req.locals.address;
    let id = req.body.id;
    
    let listing;
    let newListing;
    let inventory;
    let adAllowed;
    let adOnSale;

    let marketService = new MarketModel.MarketService();
    let userInventory = new UserModel.InventoryService();
    let marketModel = new MarketModel.MarketModel();


    if(!sanitizer.validateInput(address, id)){
        logger.warn(`Bad request: address or id are null or undefined, address: ${address}, id: ${id}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: address or id are null or undefined"
            }
        });
    }

    if(!sanitizer.sanitizeAddress(address)){
        logger.warn(`Bad request: not an address: ${address}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Not an address"
            }
        })
    }

    if(!sanitizer.isPositiveInteger(id)){
        logger.warn(`Bad request: not an id: ${id}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: wrong id"
            }
        });

    }

    logger.info(`cancelAd address: ${address}`);
    logger.info(`cancelAd request, address: ${address}, id: ${id}`);


    try{

        listing = await marketService.getSingleListing(id);
        if(listing.length == 0){
            return res
            .json({
                success: false,
                error: {
                    errorMessage: "Ad doesn't exist"
                }
            });
        }

        listing = listing[0];
        logger.debug(`listing: ${JSON.stringify(listing)}`);

        //verify property ad
        if(listing.owner != address){
            logger.warn(`owner is not address, owner: ${listing.owner}, address: ${address}`);

            return res
            .json({
                success: false,
                error: {
                    errorMessage: "You aren't the owner of this ad"
                }
            });
        }

        if(listing.status != 1){
            logger.warn(`status is not on sale`);

            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "Status is not onSale"
                }
            });
        }

        resources = await userInventory.getResources(address);
        //Controlli su resources (length > 0)
        //resources = resources[0] already done in getResources

        balance = userInventory.getResourceGivenType(resources, listing.type);

        logger.debug(`resources: ${JSON.stringify(resources)}`);


    }catch(error){
        logger.error(`Error in userInventory.getResources or marketService.getSingleListing: ${Utils.printErrorLog(error)}`);

        return res
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }

    balance += listing.quantity;
    logger.debug(`balance post add: ${balance}`);

    try{
        responseBalance = await userInventory.addResourcesGivenTypeMarket(address, listing.type, listing.quantity, id);
    }catch(err){

        logger.error(`Error in userInventory.addResourcesGivenTypeMarket: ${err}`);
        return res
        .status(401)
        .json({
            success: false, 
            error: err
        });    
    }

    logger.info(`responseBalance: ${JSON.stringify(responseBalance)}`);
    /*
    responseBalance[0] = Lock Tables
    responseBalance[1] = Update utente
    responseBalance[2] = Update marketplace
    responseBalance[3] = Unlock Tables
    */
    if (responseBalance[1].changedRows != 1){
        logger.error(`responseBalance[1].changedRows`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorCode: 189, 
                errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                But also remember that we are logging everything.
                Unauthorized access is illegal.`
            }
        });    
    }


    try{

        
        //check affectedRows == 1
       
        
        
        // deleteTime = new Date().toISOString();
        //debug
        // responseCreateAd = await marketService.cancelSingleAdStatus(id, deleteTime); //FINIRE QUERY
        //check affectedRows == 1

        newListing = await marketService.getAccountListing(address, 0);
        logger.debug(`newListing: ${JSON.stringify(newListing)}`);
        newListing = marketModel.buildFinalResponse(newListing);

        inventory = await userInventory.getResources(address);
        inventory = userInventory.buildResourcesResponse(inventory);
        logger.debug(`inventory: ${JSON.stringify(inventory)}`);

        adOnSale = await marketService.getAccountListingGivenStatus(address, 1);
        adAllowed = (adOnSale.length < 10) ? true : false;
        logger.debug(`adAllowed: ${adAllowed}, adOnSale: ${JSON.stringify(adOnSale)}`);

        logger.info(`cancelAd response: ${
            JSON.stringify({
                listings: newListing,
                inventory,
                adAllowed
            })
        }`);

        logger.info("cancelAd END");

        return res
        .status(200)
        .json({
            success: true,
            data: {
                listings: newListing,
                inventory,
                adAllowed
            }
        });
        
    }catch(error){
        logger.error(`Error in marketService cancelAd: ${Utils.printErrorLog(error)}`);

        return res
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
}

async function removeAd(req, res){
    logger.info(`removeAd START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let address = req.locals.address;
    let id = req.body.id;
    
    let responseRemove;
    let newListing;
    let inventory;
    let adAllowed;
    let adOnSale;

    let marketService = new MarketModel.MarketService();
    let marketModel = new MarketModel.MarketModel();
    let userInventory = new UserModel.InventoryService();


    if(!sanitizer.validateInput(address, id)){
        logger.warn(`Bad request: address or id are null or undefined: address: ${address}, id: ${id}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: address or id are null or undefined"
            }
        });
    }

    if(!sanitizer.sanitizeAddress(address)){
        logger.warn(`Not an address: ${address}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Not an address"
            }
        })
    }

    if(!sanitizer.isPositiveInteger(id)){
        logger.warn(`Bad request: wrong id: ${id}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: wrong id"
            }
        });

    }

    logger.info(`removeAd address: ${address}`);
    logger.info(`removeAd request, address: ${address}, id: ${id}`);

    //update condizionale solo se address == owner
    


    try{ 
        
        responseRemove = await marketService.removeAd(id, address);
        logger.debug(`marketService.removeAd response: ${responseRemove}`);

        if(responseRemove.changedRows == 0){
        logger.error(`ad has not been removed`);
            return res
            .json({
                success: false,
                error: {
                    errorMessage: "ad has not been removed"
                }
            });
        }
        //check affectedRows == 1 -> in caso negtivo ritorna false

        newListing = await marketService.getAccountListing(address, 0);
        logger.debug(`newListing: ${newListing}`);
        newListing = marketModel.buildFinalResponse(newListing);

        inventory = await userInventory.getResources(address);
        inventory = userInventory.buildResourcesResponse(inventory);
        logger.debug(`newListing: ${newListing}`);

        adOnSale = await marketService.getAccountListingGivenStatus(address, 1);
        adAllowed = (adOnSale.length < 10) ? true : false;

        logger.debug(`adAllowed: ${adAllowed}, adOnSale: ${adOnSale}`);

        logger.info("removeAd END");

        return res
        .status(200)
        .json({
            success: true,
            data: {
                listings: newListing,
                inventory,
                adAllowed
            }
        });
        
    }catch(error){
        logger.error(`Error in marketService removeAd: ${Utils.printErrorLog(error)}`);

        return res
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
}

async function getAllListing(req, res){
    logger.info(`getAllListing START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let address = req.locals.address;
    let page = req.body.page;
    let type = req.body.type;
    let status = req.body.status;

    let listing;
    let listingResponse;
    let inventory;
    let nextPage;

    let marketService = new MarketModel.MarketService();
    let marketModel = new MarketModel.MarketModel();
    let userInventory = new UserModel.InventoryService();


    if(!sanitizer.validateInput(address, page, status)){
        logger.warn(`input null or undefined, address: ${address}, page: ${page}, status: ${status}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: address null or undefined"
            }
        });
    }

    if(!sanitizer.sanitizeAddress(address)){
        logger.warn(`wrong address: ${address}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Not an address"
            }
        })
    }

    if(!sanitizer.isPositiveInteger(page)){
        logger.warn(`wrong page: ${page}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: wrong page"
            }
        });

    }

    if(type == null || type == undefined){
        type = 0
    }

    if(!sanitizer.isNaturalInteger(type) || (type != 0 && type != 2 && type != 3) ){
        logger.warn(`wrong type: ${type}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: wrong type"
            }
        });

    }

    logger.info(`getAllListing address: ${address}`);
    logger.info(`getAllListing request, address: ${address}, page: ${page}, type: ${type}, status: ${status}`);

    
    //sanificare type
    type = parseInt(type);

    //sanificare page
    page--; //page parte da 1 ma offset parte da 0

    try{
        if(type > 0){
            listing = await marketService.getAllListingGivenType(MAX_VIEW, MAX_VIEW * page, type, status);
        }else{
            listing = await marketService.getAllListing(MAX_VIEW, MAX_VIEW * page, status);
        }

        //check if a page that doesn't exist is requested then return the first page
        if(listing[0].length == 0){
            page = 0;
            if(type > 0){
                listing = await marketService.getAllListingGivenType(MAX_VIEW, MAX_VIEW * page, type, status);
            }else{
                listing = await marketService.getAllListing(MAX_VIEW, MAX_VIEW * page, status);
            }
        }

        logger.debug(`listing: ${JSON.stringify(listing)}`);

        listing[0] = marketService.changeStatusForOwner(listing[0], address);
        
        listingResponse = marketModel.buildFinalResponse(listing[0]);
        logger.debug(`listingResponse: ${JSON.stringify(listingResponse)}`);

        inventory = await userInventory.getResources(address);
        inventory = userInventory.buildResourcesResponse(inventory);
        logger.debug(`inventory: ${JSON.stringify(inventory)}`);

        nextPage = (listingResponse.length == MAX_VIEW) && ( listing[1][0].counter > MAX_VIEW * (page + 1) ) ? true : false;
        logger.debug(`nextPage: ${JSON.stringify(nextPage)}`);

        logger.info("getAllListing END");

        return res
        .status(200)
        .json({
            success: true,
            data: {
                listings: listingResponse,
                inventory,
                nextPage
            }
        });
        
    }catch(error){
        console.log("PKD ERROR ", error)
        logger.error(`Error in marketService getAccountListing: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
}

async function getPersonalHistory(req, res){
    logger.info(`getPersonalHistory START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation;
    validation = MarketValidation.getMarketValidation(req);
    if(!validation.success){
        return res
        .status(401)
        .json(validation);
    }

    let address = req.locals.address;
    let page = req.body.page;
    let type = req.body.type;

    if(type == null || type == undefined){
        type = 0
    }

    if(!sanitizer.isNaturalInteger(type) || (type != 0 && type != 2 && type != 3) ){
        logger.warn(`wrong type: ${type}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: wrong type"
            }
        });

    }
    
    let listing;
    let listingResponse;
    let inventory;
    let nextPage;


    logger.info(`getPersonalHistory address: ${address}`);
    logger.info(`getPersonalHistory request, address: ${address}, page: ${page}, type: ${type}`);

    
    //sanificare type
    type = parseInt(type);

    //sanificare page
    page--; //page parte da 1 ma offset parte da 0

    if(type > 0){
        try {
            listing = await MarketQueries.getPersonalHistoryGivenType(address, MAX_VIEW, MAX_VIEW * page, type);
        } catch (error) {
        logger.error(`Error in marketQueries getPersonalHistoryGivenType: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
        }
    }else{
        try {
            listing = await MarketQueries.getPersonalHistory(address, MAX_VIEW, MAX_VIEW * page);
        } catch (error) {
        logger.error(`Error in marketQueries getPersonalHistory: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
        }
    }

    //check if a page that doesn't exist is requested then return the first page
    if(listing[0].length == 0){
        page = 0;
        if(type > 0){
            try {
                listing = await MarketQueries.getPersonalHistoryGivenType(address, MAX_VIEW, MAX_VIEW * page, type);
            } catch (error) {
            logger.error(`Error in marketQueries getPersonalHistoryGivenType: ${Utils.printErrorLog(error)}`);
            return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
            }
        }else{
            try {
                listing = await MarketQueries.getPersonalHistory(address, MAX_VIEW, MAX_VIEW * page);
            } catch (error) {
            logger.error(`Error in marketQueries getPersonalHistory: ${Utils.printErrorLog(error)}`);
            return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
            }
        }
    }

    logger.debug(`listing: ${JSON.stringify(listing)}`);

    // listing[1] = MarketHelper.changeStatusForBuyer(listing[1], address);
    
    listingResponse = MarketService.buildFinalResponse(listing[0]);
    logger.debug(`listingResponse: ${JSON.stringify(listingResponse)}`);

    try {
        inventory = await UserQueries.getResources(address);
    } catch (error) {
        logger.error(`Error in UserQueries getResources: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
    inventory = UserHelper.buildResourcesResponse(inventory);
    logger.debug(`inventory: ${JSON.stringify(inventory)}`);

    nextPage = (listingResponse.length == MAX_VIEW) && ( listing[1][0].counter > MAX_VIEW * (page + 1) ) ? true : false;
    logger.debug(`nextPage: ${JSON.stringify(nextPage)}`);

    logger.info("getPersonalHistory END");

    return res
    .status(200)
    .json({
        success: true,
        data: {
            listings: listingResponse,
            inventory,
            nextPage
        }
    });
    
}

async function buyAd(req, res){
    logger.info(`buyAd START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let address = req.locals.address;
    let id = req.body.id;
    let type = req.body.type;
    let status = req.body.status;

    let listing;
    let buyerInfo;
    let nextPage;
    let inventory;

    let responseBuyAd;
    let responseSetBalance;
    let responseSubBalance

    let marketService = new MarketModel.MarketService();
    let marketModel = new MarketModel.MarketModel();
    let userInventory = new UserModel.InventoryService();

    if(!sanitizer.validateInput(address, id, status)){
        logger.warn(`input null or undefined, address: ${address}, id: ${id}, status: ${status}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: address null or undefined"
            }
        });
    }

    if(!sanitizer.sanitizeAddress(address)){
        logger.warn(`Not an address: ${address}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Not an address"
            }
        })
    }

    if(!sanitizer.isPositiveInteger(id)){
        logger.warn(`wrong id: ${id}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: wrong id"
            }
        });

    }

    if(type == null || type == undefined){
        type = 0
    }

    if(!sanitizer.isNaturalInteger(type) || (type != 0 && type != 2 && type != 3) ){
        logger.warn(`wrong type: ${type}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: wrong type"
            }
        });

    }

    logger.info(`buyAd address: ${address}`);
    logger.info(`buyAd request, address: ${address}, id: ${id}, type: ${type}, status: ${status}`);
    
    type = parseInt(type);


    //checking availability
    try{
        listing = await marketService.getSingleListing(id);

        if(listing.length == 0){
            logger.error(`ad doesn't exist, id: ${id}`);

            return res
            .json({
                success: false,
                error: {
                    errorMessage: "ad doesn't exist"
                }
            })
        }

        logger.debug(`listing: ${JSON.stringify(listing)}`);


        //AD NOT ON SALE
        if(listing[0].status != 1){
            logger.debug(`ad not onSale, id: ${id}`);

            try{
                if(type > 0){
                    listing = await marketService.getAllListingGivenType(MAX_VIEW, 0, type, status);
                }else{
                    listing = await marketService.getAllListing(MAX_VIEW, 0, status);
                }

                logger.debug(`listing: ${JSON.stringify(listing)}`);
        
                listing[0] = marketService.changeStatusForOwner(listing[0], address)
                listingResponse = marketModel.buildFinalResponse(listing[0]);
                logger.debug(`listingResponse: ${JSON.stringify(listingResponse)}`);
        
                inventory = await userInventory.getResources(address);
                inventory = userInventory.buildResourcesResponse(inventory);
                logger.debug(`inventory: ${JSON.stringify(inventory)}`);

        
                nextPage = (listingResponse.length == MAX_VIEW) && ( listing[1][0].counter > MAX_VIEW ) ? true : false;
                logger.debug(`nextPage: ${nextPage}`);

        
            }catch(error){
                logger.error(`error in getAllListing: ${Utils.printErrorLog(error)}`);

                return res
                .json({
                    success: false,
                    error: {
                        errorMessage: "Error in getAllListing"
                    }
                })
            }
        
            logger.info(`buyAd not OnSale END`);

            return res
            .json({
                success: false,
                data: {
                    listings: listingResponse,
                    inventory,
                    nextPage
                },
                error: {
                    errorCode: 0,
                    errorMessage: "ad not onSale"
                }
            })
        }

        //AS ON SALE
        logger.debug(`listing: ${JSON.stringify(listing)}`);

        if(listing[0].owner == address){
            logger.error(`you are the ad's owner, owner: ${listing.owner}, address: ${address}`);

            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorCode: 2,
                    errorMessage: "you are the ad's owner"
                }
            })
        }

        let endingTimeMillisec = new Date(listing[0].endingTime).getTime();
        let nowTime = new Date().getTime();

        if(endingTimeMillisec < nowTime){
            logger.debug(`ad is expired, id: ${id}, endingTimeMillisec: ${endingTimeMillisec}, nowTime: ${nowTime}`);

            return res
            .json({
                success: false,
                error: {
                    errorMessage: "ad is expired"
                }
            })
        }
        
    }catch(error){
        logger.error(`error in getSingleListing: ${Utils.printErrorLog(error)}`);

        return res
        .json({
            success: false,
            error: {
                errorMessage: "Error in getSingleListing"
            }
        })
    }

    listing = listing[0];

    try{
        buyerInfo = await userInventory.getResources(address);
        logger.debug(`buyerInfo: ${JSON.stringify(buyerInfo)}`);

        if(buyerInfo.ancien < listing.totalPrice){
            logger.warn(`Not enough balance: ${buyerInfo.ancien}, totalPrice: ${listing.totalPrice}`);

            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "Not enough balance"
                }
            })
        }

    }catch(error){
        logger.error(`error in getResources: ${Utils.printErrorLog(error)}`);

        return res
        .json({
            success: false,
            error: {
                errorMessage: "Error in getResources"
            }
        })
    }

    //Starting to update marketplace
    try{
        responseBuyAd = await marketService.buyAd(id, address);
       
    }catch(error){
        logger.error(`error in buyAd: ${Utils.printErrorLog(error)}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Error in buyAd"
            }
        })
    }

    if(responseBuyAd.changedRows != 1){
        logger.error(`buyAd is failed, responseBuyAd: ${responseBuyAd}`);

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorCode: 0, 
                errorMessage: "buyAd is failed"
            }
        });
    }

    try{

        responseSubBalance = await userInventory.subAncien(address, listing.totalPrice);
        logger.debug(`responseSubBalance: ${JSON.stringify(responseSubBalance)}`);

        if(responseSubBalance.changedRows != 1){
            logger.error(`responseSubBalance: ${JSON.stringify(responseSubBalance)}`);

            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorCode: 1,
                    errorMessage: "responseSubBalance is failed"
                }
            })
        }

        responseAddBalance = await userInventory.addAncien(listing.owner, listing.totalPrice);
        logger.debug(`responseAddBalance: ${JSON.stringify(responseAddBalance)}`);

        if(responseAddBalance.changedRows != 1){
            logger.error(`responseAddBalance: ${JSON.stringify(responseAddBalance)}`);

            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorCode: 1,
                    errorMessage: "responseAddBalance is failed"
                }
            })
        }
    }catch(error){
        logger.error(`subAncien or addAncien failed, responseSubBalance: ${JSON.stringify(responseSubBalance)}, responseAddBalance: ${JSON.stringify(responseAddBalance)}`);
       
        return res
        .json({
            success: false,
            error: {
                errorMessage: "Error in subAncien or addAncien"
            }
        })
    }

    try{
        responseSetBalance = await userInventory.addResourcesGivenType(address, listing.type, listing.quantity);
        if(responseSetBalance.changedRows != 1){
            logger.error(`addResourcesGivenType is failed: ${JSON.stringify(responseSetBalance)}`);
            
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorCode: 1,
                    errorMessage: "addResourcesGivenType is failed"
                }
            })
        }
    }catch(error){
        logger.error(`error in setResourcesGivenType: ${Utils.printErrorLog(error)}`);

        return res
        .json({
            success: false,
            error: {
                errorMessage: "Error in setResourcesGivenType"
            }
        })
    }

    try{
        if(type > 0){
            listing = await marketService.getAllListingGivenType(MAX_VIEW, 0, type, status);
        }else{
            listing = await marketService.getAllListing(MAX_VIEW, 0, status);
        }

        listing[0] = marketService.changeStatusForOwner(listing[0], address);
        logger.debug(`listing: ${JSON.stringify(listing)}`);
        listingResponse = marketModel.buildFinalResponse(listing[0]);

        inventory = await userInventory.getResources(address);
        inventory = userInventory.buildResourcesResponse(inventory);
        logger.debug(`inventory: ${JSON.stringify(inventory)}`);


        nextPage = (listingResponse.length == MAX_VIEW) && ( listing[1][0].counter > MAX_VIEW ) ? true : false;
        logger.debug(`nextPage: ${nextPage}`);

    }catch(error){
        logger.error(`error in getAllListing: ${Utils.printErrorLog(error)}`);

        return res
        .json({
            success: false,
            error: {
                errorMessage: "Error in getAllListing"
            }
        })
    }
    

    logger.info(`buyAd response: ${
        JSON.stringify({
            listings: listingResponse,
            inventory,
            nextPage
        })
    }`);

    logger.info(`buyAd END`)

    return res
    .json({
        success: true,
        data: {
            listings: listingResponse,
            inventory,
            nextPage
        }
    })
    
}

module.exports = {getAccountListing, createAd, cancelAd, removeAd, getAllListing, buyAd, getPersonalHistory}