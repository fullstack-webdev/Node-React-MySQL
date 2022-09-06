const logger = require('../logging/logger');
const { MarketInventoryValidation } = require('../validations/marketInventoryValidation');
const Validator = require('../utils/validator')
const { MarketInventoryService } = require('../services/marketInventoryService');
const { MarketInventoryQueries } = require('../queries/marketInventoryQueries');
const { MarketHelper } = require('../helpers/marketHelper')
const { MarketInventoryInterface } = require('../interfaces/JS/marketplaceInventoryInterface');
const { Utils } = require("../utils/utils");

const UserModel = require('../models/userModel');
const { response } = require('express');
const userInventory = new UserModel.InventoryService();

async function getCheapestInventories(req, res) {
    logger.info(`getCheapestInventories START`)
    logger.debug(`ipAddress:${Validator.getIpAddress(req)}`)

    let address = req.locals.address;
    let validation;
    validation = MarketInventoryValidation.getCheapestInventoriesValidation(req);  //modificare validation
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }
    let response
    try {
        response = await MarketInventoryService.getCheapestInventories(address)
    } catch (error) {
        logger.error(`Error in MarketInventoryService.getCheapestInventories: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info(`getCheapestInventories response: ${JSON.stringify(response)}`)

    return res
        .status(200)
        .json({
            success: true,
            data: response
        })
}

async function buyResourceAndInventory(req, res) {
    logger.info("buyResourceAndInventory START");

    let address = req.locals.address;
    let buyIds = req.body.buyIds;
    let market = req.body.market;

    let response;

    let validation;
    validation = MarketInventoryValidation.buyResourceAndInventoryValidation(req);  //modificare validation
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    logger.info(`buyResourceAndInventory address: ${address}, buyIds: ${JSON.stringify(buyIds)}, market: ${market}`);

    try {
        response = await MarketInventoryService.buyResourceAndInventory(address, buyIds, market);
    } catch (error) {
        logger.error(`Error in buyResourceAndInventory MarketInventoryService: ${Utils.printErrorLog(error)}`);
        console.log(error);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.info(`buyResourceAndInventory response: ${JSON.stringify({ success: true, data: response })}`)
    logger.info(`buyResourceAndInventory END`);

    return res
        .status(200)
        .json({
            success: true,
            data: response

        });
}

async function getTotalListing(req, res) {
    logger.info("getTotalListing START");

    let address = req.locals.address;
    let type = req.body.type;
    let id = req.body.id;
    let level = req.body.level;

    let response;

    let validation;
    validation = MarketInventoryValidation.getTotalListingValidation(req);  //modificare validation
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    logger.info(`getTotalListing address: ${address} type: ${type}, id: ${id}`);

    try {
        response = await MarketInventoryService.getTotalListing(address, type, id, level);
    } catch (error) {
        logger.error(`Error in getTotalListing MarketInventoryService: ${Utils.printErrorLog(error)}`);
        console.log(error);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.info(`getTotalListing response: ${JSON.stringify({ success: true, data: response })}`)
    logger.info(`getTotalListing END`);

    return res
        .status(200)
        .json({
            success: true,
            data: response

        });
}

async function getAllListing(req, res) {
    logger.info("getAllListing START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}");
    logger.debug(`ipAddress:${Validator.getIpAddress(req)}`);

    let address = req.locals.address;
    let inventoryType = req.body.inventoryType;
    let name = req.body.name;
    let status = req.body.status;
    let page = req.body.page;

    let response;

    let validation;
    validation = MarketInventoryValidation.getAllListingValidation(req);  //modificare validation
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    logger.info(`getAllListing address: ${address}, inventoryType: ${inventoryType}, name: ${name}, status: ${status}, page: ${page}`);

    page--;
    try {
        response = await MarketInventoryService.getAllListing(address, status, page, inventoryType, name);
    } catch (error) {
        logger.error(`Error in getAllListing MarketInventoryService: ${Utils.printErrorLog(error)}`);
        console.log(error);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.info(`getAllListing response: ${JSON.stringify({ success: true, data: response })}`)
    logger.info(`getAllListing END`);

    return res
        .status(200)
        .json({
            success: true,
            data: response

        });
}

async function getAccountListing(req, res) {
    logger.info(`getAccountListing START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let address = req.locals.address;

    let validation;
    validation = MarketInventoryValidation.getAccountListingValidation(req);  //modificare validation
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    logger.info(`getAccountListing address: ${address}`);

    let data;

    try {

        data = await MarketInventoryService.getAccountListing(address);

        return res
            .status(200)
            .json({
                success: true,
                data
            });

    } catch (error) {
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

async function removeAd(req, res) {
    logger.info(`removeAd START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let address = req.locals.address;
    let id = req.body.id;

    let responseRemove;
    let newListing;
    let inventory;
    let adAllowed;
    let adOnSale;

    let validation;
    validation = MarketInventoryValidation.removeAdValidation(req);  //modificare validation
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    logger.info(`removeAd address: ${address}`);
    logger.info(`removeAd request, address: ${address}, id: ${id}`);

    //update condizionale solo se address == owner

    try {

        responseRemove = await MarketInventoryQueries.removeAd(id, address);
        // logger.debug(`MarketInventoryQueries.removeAd response: ${responseRemove}`);

        if (responseRemove.changedRows == 0) {
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

        newListing = await MarketInventoryQueries.getAccountListing(address, 0);
        logger.debug(`newListing: ${JSON.stringify(newListing)}`);
        newListing = MarketInventoryInterface.buildFinalResponse(newListing);

        inventory = await userInventory.getResources(address);
        inventory = userInventory.buildResourcesResponse(inventory);
        logger.debug(`newListing: ${JSON.stringify(newListing)}`);

        adOnSale = await MarketInventoryQueries.getAccountListingGivenStatus(address, 1);
        adAllowed = (adOnSale.length < 25) ? true : false;

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

    } catch (error) {
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

async function getPersonalHistory(req, res) {
    logger.info(`getPersonalHistory START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let address = req.locals.address;
    let inventoryType = req.body.inventoryType;
    let name = req.body.name;
    let page = req.body.page;

    let response;

    let validation;
    validation = MarketInventoryValidation.getPersonalHistoryValidation(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    logger.info(`getPersonalHistory address: ${address}, inventoryType: ${inventoryType}, name: ${name}, page: ${page}`);

    page--;
    try {
        response = await MarketInventoryService.getPersonalHistory(address, inventoryType, name, page);
    } catch (error) {
        logger.error(`
Error in getPersonalHistory MarketInventoryService: ${Utils.printErrorLog(error)}`
        );
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.info(`getPersonalHistory response: ${JSON.stringify({ success: true, data: response })}`)
    logger.info(`getPersonalHistory END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                response
            }
        });
}

async function createAd(req, res) {
    logger.info(`createAd START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let address = req.locals.address;
    let inventoryType = req.body.inventoryType;
    let id = req.body.id;
    let price = req.body.price;
    let duration = req.body.duration;
    let quantity = req.body.quantity;

    let response;
    let sellValid;

    let validation;
    validation = MarketInventoryValidation.createAdValidation(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    logger.info(`createAd address: ${address}, inventoryType: ${inventoryType}, id: ${id}, price: ${price}, duration: ${duration}, quantity: ${quantity}`);

    //CHEKCK IF SELL IS TRUE IN MENU
    try {
        sellValid = await MarketHelper.isSellable(id, inventoryType);
    } catch (error) {
        logger.error(`Error in MarketHelper.isSellable: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error
            });
    }

    if (!sellValid) {
        logger.error(`Sell is not allowed: ${sellValid}`)

        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'Send is not allowed'
                }
            })
    }

    try {
        response = await MarketInventoryService.createAd(address, inventoryType, id, price, duration, quantity);
    } catch (error) {
        logger.error(`Error in createAd MarketInventoryService: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error
            });
    }

    // logger.info(`createAd response: ${JSON.stringify({success: true, data: response})}`)
    logger.info(`createAd END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                ...response,
                done: true
            }
        });
}

async function buyAd(req, res) {
    logger.info(`buyAd START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let address = req.locals.address;
    let id = req.body.id;
    let filter = req.body.filter;
    let page = req.body.page;

    let response;

    let validation;
    validation = MarketInventoryValidation.buyAdValidation(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    logger.info(`buyAd address: ${address}, id: ${id}`);

    try {
        response = await MarketInventoryService.buyAd(address, id, filter, page);
    } catch (error) {
        logger.error(`Error in buyAd MarketInventoryService: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.info(`buyAd response: ${JSON.stringify({ response })}`)
    logger.info(`buyAd END`);

    if (!response.success) {
        return res
            .status(401)
            .json(response);
    }

    return res
        .status(200)
        .json(response);
}

async function cancelAd(req, res) {
    logger.info(`cancelAd START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let validation;
    validation = MarketInventoryValidation.cancelAdValidation(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }


    let address = req.locals.address;
    let id = req.body.id;
    let listing, response

    try {
        listing = await MarketInventoryQueries.getSingleListing(id);
    } catch (error) {
        logger.error(`Error in MarketInventoryQueries getSingleListing: ${Utils.printErrorLog(error)}`);

        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    if (listing.length == 0) {
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

    if (listing.owner != address) {
        logger.warn(`owner is not address, owner: ${listing.owner}, address: ${address}`);
        return res
            .json({
                success: false,
                error: {
                    errorMessage: "You aren't the owner of this ad"
                }
            });
    }

    if (listing.status != 1) {
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

    try {
        response = await MarketInventoryService.cancelAdHandler(listing, address, id);
    } catch (error) {
        logger.error(`Error in MarketInventoryService cancelAdHandler: ${Utils.printErrorLog(error)}`);

        return res
            .status(401)
            .json({
                success: false,
                error
            });
    }


    logger.info("cancelAd END");
    let data = response

    return res
        .status(200)
        .json({
            success: true,
            data
        });
}

// module.exports = {getAllListing, getPersonalHistory, createAd, cancelAd, buyAd, getAccountListing};
module.exports = { buyResourceAndInventory, getTotalListing, getAllListing, getAccountListing, getPersonalHistory, createAd, buyAd, cancelAd, removeAd, getCheapestInventories };