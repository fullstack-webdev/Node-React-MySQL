const userModel = require('../models/userModel');
const BuildingsModel = require('../models/buildingsModel');
const logger = require('../logging/logger');
const Sanitizer = require('../utils/sanitizer');
const { BuildingsQueries } = require('../queries/buildingsQueries');
const { UserQueries } = require('../queries/userQueries');
const { LogQueries } = require('../queries/logQueries');
const { UserService } = require('../models/userModel');
const userValidation = require('../validations/userValidation');
const { UserHelper } = require("../helpers/userHelper");
const { Utils } = require("../utils/utils");
const Validator = require('../utils/validator');
const { Blockchain } = require('../utils/blockchain');
const { ItemQueries } = require('../queries/inventory/itemQueries');

let sanitizer = new Sanitizer();


async function getInventory(req, res) {
    logger.info(`getInventory START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let address = req.locals.address;
    let request = new userModel.InventoryService();
    let responseResources;
    let responseFinal;

    if (address == null || address == undefined) {
        logger.warn(`Bad request,invalid address: ${address}`);

        return res
            .status(401)
            .json({
                success: false,
                error: { errorMessage: 'req is null' }
            })
    }
    if (!sanitizer.sanitizeAddress(address)) {
        logger.warn(`Bad request,invalid address: ${address}`);
        return res
            .status(401)
            .json({
                success: false,
                error: { errorMessage: 'not a valid address' }
            })
    }
    logger.info(`getInventory address: ${address}`);

    try {
        responseResources = await request.getResources(address);
        responseFinal = request.buildResourcesResponse(responseResources);
    } catch (error) {
        logger.error(`Error in getInventory, address: ${address}, error: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error
            });
    }

    logger.info(`getInventory response: ${JSON.stringify({ success: true, data: responseFinal })}`)
    logger.info(`getInventory END`);
    return res
        .json({
            success: true,
            data: responseFinal
        });

}

async function getAlerts(req, res) {
    let address = req.locals.address;

    //Daily Deposit Reward - START 
    //Get NFTs Staked
    let hasStakedBuildings;
    try {
        hasStakedBuildings = await BuildingsQueries.getStakedNFT(address)
    } catch (error) {
        logger.error(`Error in BuildingsQueries.getStakedNFT, address: ${address}, error: ${Utils.printErrorLog(error)}`);
    }

    //Get Last Deposit Reward
    let eligibleForDepositReward;
    try {
        eligibleForDepositReward = await UserQueries.checkLastBurnIsGreaterThan(address, 1, 5)
    } catch (error) {
        logger.error(`Error in getStakedNFT, address: ${address}, error: ${Utils.printErrorLog(error)}`);
    }

    //Check if all the NFTs are staked for more than 24H
    let stakedForMoreThan24H = true;
    for (let nft of hasStakedBuildings) {
        let struct = await Blockchain.getOwnerStruct(nft.idBuilding, nft.type);
        let stakingTime = new Date(struct.blockTime * 1000);
        let now = new Date();

        if (now - stakingTime < 86400000) {
            console.log(`Exiting nft staked less than 24h, idBuilding: ${nft.idBuilding}, type: ${nft.type}, stakingTime: ${stakingTime}`)
            stakedForMoreThan24H = false;
            return;
        }
    };

    //Check Staked > 24H && NFT Staked && Reward availability
    if (!stakedForMoreThan24H || !hasStakedBuildings.length || eligibleForDepositReward.length) {
        return res
            .json({
                success: false,
                alert: []
            });
    }
    //Daily Deposit Reward - END

    //Get Reward Info
    let rewardInfo;
    try {
        rewardInfo = await ItemQueries.getItemInfoFromDailyReward()
    } catch (error) {
        logger.error(`Error in getItemInfoFromDailyReward, address: ${address}, error: ${Utils.printErrorLog(error)}`);
    }

    return res
        .json({
            success: true,
            data: {
                alert: [{ type: 'deposit-reward', info: rewardInfo[0] }]
            }
        });

}

async function getBuilders(req, res) {
    logger.info(`getBuilders START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let address = req.locals.address;
    let buildingsModel = new BuildingsModel.BuildingsService();


    if (address == null || address == undefined) {
        logger.warn(`Bad request,invalid address: ${address}`);
        return res
            .status(401)
            .json({
                success: false,
                error: { errorMessage: 'req is null' }
            })
    }
    if (!sanitizer.sanitizeAddress(address)) {
        logger.warn(`Bad request,invalid address: ${address}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'not a valid address'
                }
            })
    }
    logger.info(`getBuilders address: ${address}`);

    try {

        let builders = await buildingsModel.getBuilders(address);
        logger.info(`getBuilders response: ${JSON.stringify({ builders: builders })}`)
        logger.info(`getBuilders END`);
        return res
            .status(200)
            .json({
                success: true,
                data: {
                    builders: builders
                }
            });



    } catch (err) {
        return res.json({
            success: false,
            error: {
                errorMessage: err
            }
        });
    }
}


async function getLeaderboard(req, res) {
    logger.info(`getLeaderboard START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let response;

    try {

        response = await UserQueries.retrieveLeaderboard();
        logger.info(`retrieveLeaderboard response: ${JSON.stringify(response)}`);
        logger.info(`getLeaderboard END`);
        return res
            .status(200)
            .json({
                success: true,
                response
            });



    } catch (err) {
        return res.json({
            success: false,
            error: {
                errorMessage: err
            }
        });
    }
}

async function directTransfer(req, res) {
    logger.info(`directTransfer START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let inventoryService = new userModel.InventoryService();

    let validation;

    validation = userValidation.directTransferValidation(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    let request = new userModel.InventoryService();
    let addressSender = req.locals.address;
    let addressReceiver = req.body.receiver;
    let type = req.body.type;
    let quantity = req.body.quantity;
    let response;
    let userResources;
    let receiverResources;
    let rawInventory;
    let inventory;

    let transferObject = {};
    let transferSaveResponse;

    transferObject.sender = addressSender;
    transferObject.receiver = addressReceiver;
    transferObject.type = type;
    transferObject.quantity = quantity;

    quantity = parseInt(quantity);
    type = parseInt(type);

    if (addressSender == addressReceiver) {
        return res
            .status(200)
            .json({
                success: false,
                error: {
                    errorMessage: 'Not allowed to send to your own address'
                }
            })
    }

    try {
        response = await UserService.getUser(addressReceiver);
    } catch (error) {
        logger.error(`Error in UserService getUser: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    if (response.length != 1) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'User does not exist'
                }
            })
    }

    //Getting receiver resources to save them in resource_transfer
    try {
        receiverResources = await request.getResources(addressReceiver);
    } catch (error) {
        logger.error(`Error in InventoryService getResources: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    transferObject.receiverBalanceBefore = inventoryService.getResourceGivenType(receiverResources, type);

    try {
        userResources = await request.getResources(addressSender);
    } catch (error) {
        logger.error(`Error in InventoryService getResources: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    logger.debug(`InventoryService.getResources response:${JSON.stringify(userResources)}`);

    transferObject.senderBalanceBefore = inventoryService.getResourceGivenType(userResources, type);


    if (!UserHelper.transferQuantityChecker(quantity, type, userResources)) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'Not enough resources to send'
                }
            });
    }


    switch (type) {
        case 1:
            try {
                response = await UserQueries.subAncien(addressSender, quantity);
            } catch (error) {
                logger.error(`Error in UserQueries.subAncien: ${Utils.printErrorLog(error)}`);
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    });
            }
            break;

        case 2:
            try {
                response = await UserQueries.subWood(addressSender, quantity);
            } catch (error) {
                logger.error(`Error in UserQueries.subWood: ${Utils.printErrorLog(error)}`);
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    });
            }
            break;

        case 3:
            try {
                response = await UserQueries.subStone(addressSender, quantity);
            } catch (error) {
                logger.error(`Error in UserQueries.subStone: ${Utils.printErrorLog(error)}`);
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    });
            }
            break;
    }

    logger.debug(`Resources successfully subbed, type:${type}, quantity:${quantity}`);

    if (response.changedRows == 0) {
        logger.error(`Not enough balance: ${addressSender}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "Not enough balance"
                }
            });
    }



    switch (type) {
        case 1:
            try {
                response = await UserQueries.addAncien(addressReceiver, quantity);
            } catch (error) {
                logger.error(`Error in UserQueries.addAncien: ${Utils.printErrorLog(error)}`);
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    });
            }
            break;

        case 2:
            try {
                response = await UserQueries.addWood(addressReceiver, quantity);
            } catch (error) {
                logger.error(`Error in UserQueries.addWood: ${Utils.printErrorLog(error)}`);
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    });
            }
            break;

        case 3:
            try {
                response = await UserQueries.addStone(addressReceiver, quantity);
            } catch (error) {
                logger.error(`Error in UserQueries.addStone: ${Utils.printErrorLog(error)}`);
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    });
            }
            break;
    }

    logger.debug(`Resources successfully added to the receiver , type:${type}, quantity:${quantity}`);

    //Getting receiver resources to save them in resource_transfer
    try {
        receiverResources = await request.getResources(addressReceiver);
    } catch (error) {
        logger.error(`Error in InventoryService getResources: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    transferObject.receiverBalanceAfter = inventoryService.getResourceGivenType(receiverResources, type);

    //ritornare inventario utente chiamante
    try {
        rawInventory = await request.getResources(addressSender);
    } catch (error) {
        logger.error(`Error in UserService getResources: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.debug(`getResources response: ${JSON.stringify(rawInventory)}`);

    resource = inventoryService.getResourceGivenType(rawInventory, type);

    transferObject.senderBalanceAfter = resource;

    //Saving transfer in resource_transfer
    try {
        transferSaveResponse = await UserQueries.setResourceTransfer(transferObject);
    } catch (error) {
        logger.error(`Error in UserQueries.setResourceTransfer: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }


    logger.debug(`directTransfer response:${JSON.stringify(resource)}`);
    logger.info(`directTransfer END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                newAmount: resource
            }
        })
}

async function isSigned(req, res) {
    let validation;

    validation = userValidation.isSignedValidation(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    let address = req.body.address;
    let response;
    let accountCheck;

    try {
        response = await UserQueries.getUser(address);

    } catch (error) {
        logger.error(`Error in getUser, address: ${address}, error: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error
            });
    }

    logger.debug(`getUser response : ${JSON.stringify(response)}`);

    if (!UserHelper.accountChecker(response)) {
        return res
            .status(404)
            .json({
                success: false,
            });
    } else {
        logger.info(`isSigned END`);
        return res
            .json({
                success: true,
            });
    }

}

async function signUp(req, res) {
    let validation;

    validation = userValidation.isSignedValidation(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    let address = req.body.address;
    let captcha = req.body.captcha;
    let captchaResult;
    let response;

    try {
        captchaResult = await UserHelper.validateHuman(captcha);
    } catch (error) {
        logger.error(`Error in validateHuman, address: ${address}`);
        return res
            .json({
                success: false,
                error
            });
    }

    if (!captchaResult) {
        logger.warn(`Bot detected, captcha check failed !`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "Bot detected !"
                }
            });
    }

    try {
        response = await UserQueries.createUser(address);
    } catch (error) {
        logger.error(`Error in UserQueries.createUser: ${Utils.printErrorLog(error)}`);

        return res
            .json({
                success: false,
                error
            });

    }

    if (response.affectedRows != 1) {
        return res
            .json({
                success: false,
                error: "affectedRows not one",
            });
    }

    try {
        response = await UserQueries.createProfile(address);
    } catch (error) {
        logger.error(`Error in UserQueries.createUser: ${Utils.printErrorLog(error)}`);

        return res
            .json({
                success: false,
                error
            });

    }

    logger.info(`signUp END`);
    return res
        .json({
            success: true,
        });
}

async function suspectedClick(req, res) {
    let addressLocals = req.locals.address;
    let addressBody = req.body.address;
    let click = req.body.ancien; //FAKE NAME

    if (!Validator.validateInput(addressBody, click))
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'not valide'
                }
            });

    if (!Validator.validateAddress(addressBody))
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'not address'
                }
            });

    if (typeof click !== 'object')
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'not object'
                }
            });

    let suspect = click.suspect ? click.suspect : 'error'
    let clientX = click.clientX ? click.clientX : 'error'
    let clientY = click.clientY ? click.clientY : 'error'
    let target = click.target ? click.target : 'error'
    let isTrusted = click.isTrusted ? click.isTrusted : 'error'
    let timeStamp = click.timeStamp ? click.timeStamp : 'error'
    let detail = click.detail ? click.detail : 'error'

    try {

        await LogQueries.setLogBot(
            addressLocals,
            addressBody,
            suspect,
            clientX,
            clientY,
            target,
            isTrusted,
            timeStamp,
            detail
        )

    } catch (error) {
        logger.error(`Error in LogQueries.LogQueries: ${Utils.printErrorLog(error)}`);

        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });

    }

    return res
        .json({
            success: true,
        });
}

module.exports = {
    getInventory,
    getAlerts,
    getBuilders,
    getLeaderboard,
    directTransfer,
    isSigned,
    signUp,
    suspectedClick
};