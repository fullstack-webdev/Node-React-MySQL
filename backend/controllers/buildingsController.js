const express = require('express');
const mysql = require('../config/databaseConfig');
const BuildingsModel = require('../models/buildingsModel');
const UserModel = require("../models/userModel");
const logger = require('../logging/logger');
const Sanitizer = require('../utils/sanitizer');
const { ShopService } = require('../models/shopModel');
const { BuildingsValidation } = require("../validations/buildingsValidation");
const { BuildingsInterface } = require('../interfaces/JS/buildingsInterface');
const { BuildingsQueries } = require("../queries/buildingsQueries");
const { BuildingsHelper } = require("../helpers/buildingsHelper");
const { BuildingService } = require('../services/buildingService');
const { FishermanService } = require('../services/fishermanService');
const { UserQueries } = require('../queries/userQueries');
const { UserHelper } = require('../helpers/userHelper');
const { ItemQueries } = require('../queries/inventory/itemQueries');
const { InventoryQueries } = require(`../queries/inventoryQueries`);
const leaderboardQueries = require(`../queries/leaderboardQueries`);
const Validator = require('../utils/validator')

const { Utils } = require("../utils/utils");
const { PassiveService } = require('../services/passiveService');

const { MAX_LEVELS } = require('../config/buildingLevel');

const { FishermanQueries } = require('../queries/fishermanQueries');

let sanitizer = new Sanitizer();

async function getAccountData(req, res) {
    logger.info(`getAccountData START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let address = req.locals.address;
    let responseAccountData;
    let buildingsOwned;
    let responseFinal;
    let newStoredResponse;

    let validation = BuildingsValidation.getAccountDataValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    logger.info(`getAccountData address: ${address}`);

    try {
        buildingsOwned = await BuildingsQueries.testV2(address);
    } catch (error) {
        logger.error(`Error in BuildingsQueries buildingsOwnedWithModel:${JSON.stringify(error)}`);
        return res.json({
            success: false,
            data: []
        });
    }

    try {
        buildingsOwned = buildingsOwned[0]
    } catch (error) {
        logger.error(`Error in BuildingsQueries buildingsOwnedWithModel:${Utils.printErrorLog(error)}`);

        buildingsOwned = []
    }
    if (!buildingsOwned) buildingsOwned = []


    // logger.debug(`response retrieveImageSprite: ${JSON.stringify(responseAccountData)}`);


    responseFinal = BuildingsInterface.buildBuildingsModel(buildingsOwned);


    logger.debug(`getAccountData response: ${JSON.stringify(responseFinal)}`);
    logger.info("getAccountData END");

    res.json({ success: true, data: responseFinal });
}

//PAYLOAD
/*
{
    "address": "0x08655....",
    "nftId": ...,
    "type": ...,
    "consumableIds" : [] 
}
*/

async function upgradeNFT(req, res) {//manca il try e catch
    logger.info('upgradeNFT START');
    logger.debug(`ipAddress:${sanitizer.getIpAddress(req)}`);

    let address = req.locals.address;
    let nftId = req.body.nftId;
    let type = req.body.type;
    let consumableIds = req.body.consumableIds;

    logger.info(`upgradeNFT address: ${address}`);
    logger.info(`upgradeNFT request, address: ${address}, nftId: ${nftId},type: ${type}, consumableIds: ${consumableIds}`);

    let validation = BuildingsValidation.upgradeNFTValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let resources;
    let resourcesResponse;
    let upgradeResources;
    let nft;
    let upgradeTime;
    let endingTime;
    let builders;
    let response;
    let upgradeSprite;
    //for upgrade history
    let upgradeResult;
    let upgradeObjects = [];

    try {
        verify = await BuildingService.verifyProperty(address, nftId, type);
    } catch (error) {
        logger.error(`Error in BuildingService verifyProperty: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });
    }
    if (!verify) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "You are not the owner of these nfts"
                }
            });
    }

    logger.debug(`verified: ${address} on nftID: ${nftId}  type: ${type}`);

    try {
        nft = await BuildingsQueries.getNFT(nftId, type);
    } catch (error) {
        logger.error(`Error in buildingModel.getNFT:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }

    logger.debug(`response getNFT : ${JSON.stringify(nft)} `);

    if (nft.upgradeStatus) {
        return res.json({
            success: false,
            error: {
                errorMessage: "Already in upgrade"
            }
        });
    }

    if (!nft.stake) {
        return res.json({
            success: false,
            error: {
                errorMessage: "Building not staked"
            }
        });
    }

    if (nft.level >= MAX_LEVELS[nft.type]) {
        return res.json({
            success: false,
            error: {
                errorMessage: "maxLevel reached"
            }
        })
    }

    let startLevel = nft.level;
    let endLevel = nft.level + 1;

    try {
        builders = await BuildingService.getBuilders(address);
    } catch (error) {
        logger.error(`Error in BuildingService getBuilders:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }

    logger.debug(`response getBuilders : ${JSON.stringify(builders)} `);

    if (builders.buildersAvailable == 0) {
        return res.json({
            success: false,
            error: {
                errorMessage: "Builders not available"
            }
        });
    }

    let check;
    try {
        check = await BuildingsQueries.checkRequirementsUpgradeNFT(address, type, nft.level + 1, consumableIds);
    } catch (error) {
        logger.error(`Error in BuildingsQueries checkRequirementsUpgradeNFT:${JSON.stringify(error)}`);
        return res
            .json({
                success: false,
                error: error
            });
    }
    logger.debug(`response checkRequirementsUpgradeNFT : ${JSON.stringify(check)} `);
    if (check.length == 0) {
        return res.json({
            success: false,
            error: {
                errorMessage: "Error in checkRequirementsUpgradeNFT: requirements not found"
            }
        })
    }

    let objectAncien = {};
    let objectWood = {};
    let objectStone = {};

    if (check[0].requiredAncien != null && check[0].requiredAncien != 0) {

        objectAncien.idBuilding = nftId;
        objectAncien.type = type;
        objectAncien.address = address;
        objectAncien.inventoryType = null;
        objectAncien.idItem = null;
        objectAncien.resourceType = 1;
        objectAncien.requiredQuantity = check[0].requiredAncien;
        objectAncien.quantityBefore = check[0].ancienBefore;
        objectAncien.startLevel = startLevel;
        objectAncien.endLevel = endLevel;
    }

    if (check[0].requiredWood != null && check[0].requiredWood != 0) {

        objectWood.idBuilding = nftId;
        objectWood.type = type;
        objectWood.address = address;
        objectWood.inventoryType = null;
        objectWood.idItem = null;
        objectWood.resourceType = 2;
        objectWood.requiredQuantity = check[0].requiredWood;
        objectWood.quantityBefore = check[0].woodBefore;
        objectWood.startLevel = startLevel;
        objectWood.endLevel = endLevel;
    }

    if (check[0].requiredStone != null && check[0].requiredStone != 0) {

        objectStone.idBuilding = nftId;
        objectStone.type = type;
        objectStone.address = address;
        objectStone.inventoryType = null;
        objectStone.idItem = null;
        objectStone.resourceType = 3;
        objectStone.requiredQuantity = check[0].requiredStone;
        objectStone.quantityBefore = check[0].stoneBefore;
        objectStone.startLevel = startLevel;
        objectStone.endLevel = endLevel;
    }


    let isUpgradable = check[0].isAncienAllowed && check[0].isWoodAllowed && check[0].isStoneAllowed
    if (isUpgradable) {
        for (let requirement of check) {
            if (!requirement.isItemAllowed) {
                isUpgradable = false
                break
            }
        }
    }
    if (!isUpgradable) {
        logger.error(`Error in checkRequirementsUpgradeNFT: not enough resources to upgrade`);
        return res.json({
            success: false,
            error: {
                errorMessage: "Error in checkRequirementsUpgradeNFT: not enough resources to upgrade"
            }
        })
    }

    logger.debug(`response checkRequirementsUpgradeNFT : ${JSON.stringify(check)} `);

    try {
        resourcesResponse = await UserQueries.getResources(address);
    } catch (error) {
        logger.error(`Error in UserQueries getResources:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });
    }

    try {
        upgradeResources = await BuildingsQueries.retrieveUpgradeResources(type, nft.level + 1);
    } catch (error) {
        logger.error(`Error in BuildingsQueries retrieveUpgradeResources:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });
    }

    logger.debug(`response getResources : ${JSON.stringify(resourcesResponse)} `);
    logger.debug(`response retrieveUpgradeResources : ${JSON.stringify(upgradeResources)} `);

    resourcesResponse = BuildingsHelper.calculateNewResources(resourcesResponse, upgradeResources);
    resources = UserHelper.buildResourcesResponse(resourcesResponse);

    //pushing the resource objects in the upgradeObjects array
    if (check[0].requiredAncien != null && check[0].requiredAncien != 0) {
        objectAncien.quantityAfter = resourcesResponse.ancien;
        upgradeObjects.push(objectAncien);
    }

    if (check[0].requiredWood != null && check[0].requiredWood != 0) {
        objectWood.quantityAfter = resourcesResponse.wood;
        upgradeObjects.push(objectWood);
    }

    if (check[0].requiredStone != null && check[0].requiredStone != 0) {
        objectStone.quantityAfter = resourcesResponse.stone;
        upgradeObjects.push(objectStone);
    }

    //logger.debug(`upgradeObjects response : ${JSON.stringify(upgradeObjects)}`)

    if (resources.status) {
        try {
            upgradeTime = await BuildingsQueries.getUpgradeTime(type, nft.level + 1);
        } catch (error) {
            logger.error(`Error in BuildingsQueries getUpgradeTime:${Utils.printErrorLog(error)}`);
            return res
                .json({
                    success: false,
                    error: error
                });
        }

        logger.debug(`consumables: ${consumableIds}`);
        logger.debug(`upgrade time before consumables: ${upgradeTime}`);

        //MOCK UP FOR CONSUMABLE_BUILDINGS
        for (let i = 0; i < consumableIds.length; i++) {

            if (consumableIds[i] == 14) {
                upgradeTime = upgradeTime - 218000;
                logger.debug(`upgrade time in consumable=14: ${upgradeTime}`);
            }

            if (consumableIds[i] == 15) {
                upgradeTime = upgradeTime - 60;
                logger.debug(`upgrade time in consumable=15: ${upgradeTime}`);
            }
        }

        logger.debug(`upgrade time after consumables: ${upgradeTime}`);

        endingTime = await BuildingsHelper.createEndingTime(upgradeTime);

        try {
            response = await BuildingsQueries.setUpgrade(nftId, type, endingTime);
        } catch (error) {
            logger.error(`Error in BuildingsQueries setUpgrade:${Utils.printErrorLog(error)}`);
            return res
                .json({
                    success: false,
                    error: error
                });

        }
        let responseUpdateLastClaim;

        if (type != 4) {
            try {
                responseUpdateLastClaim = await BuildingsQueries.updateLastClaimAction(nftId, type,);
            } catch (error) {
                logger.error(`Error in BuildingsQueries setUpgrade:${Utils.printErrorLog(error)}`);
                return res
                    .json({
                        success: false,
                        error: error
                    });

            }
        }


        logger.debug(`response getUpgradeTime : ${upgradeTime} `);
        logger.debug(`response createEndingTime : ${endingTime} `);
        logger.debug(`response setUpgrade : ${JSON.stringify(response)} `);

        if (response.affectedRows == 0) {
            return res.json({
                success: false,
                error: {
                    errorMessage: "Conditional Update fails, not staked"
                }
            });
        }

        try {
            await UserQueries.setResources(address, resources);
        } catch (error) {
            logger.error(`Error in UserQueries setResources:${Utils.printErrorLog(error)}`);
            return res
                .json({
                    success: false,
                    error: error
                });

        }

        for (let i = 0; i < check.length; i++) {

            let object = {};
            object.idBuilding = nftId;
            object.type = type;
            object.address = address;
            object.inventoryType = 'item';
            object.idItem = check[i].idItemReq;
            object.resourceType = null;
            object.requiredQuantity = check[i].requiredItemQuantity;
            object.quantityBefore = check[i].itemBefore;
            object.startLevel = startLevel;
            object.endLevel = endLevel;

            if (check[i].idItemInstance == null || check[i].idItemInstance == undefined) continue

            try {
                await ItemQueries.subItemByIdItemInstance(check[i].idItemInstance, check[i].requiredItemQuantity)
            } catch (error) {
                logger.error("Error in ItemQueries subItemByIdItemInstance: ", JSON.stringify(error));
                return res
                    .json({
                        success: false,
                        error: error
                    });
            }

            let remainQuantity
            try {
                remainQuantity = await ItemQueries.getQuantityByIdItemInstance(check[i].idItemInstance)
            } catch (error) {
                logger.error("Error in ItemQueries getQuantityByIdItemInstance: ", JSON.stringify(error));
                return res
                    .json({
                        success: false,
                        error: error
                    });
            }

            object.quantityAfter = remainQuantity[0].quantity;
            upgradeObjects.push(object);

            if (remainQuantity[0].quantity == 0) {
                try {
                    await ItemQueries.removeItemInstance(check[i].idItemInstance)
                } catch (error) {
                    logger.error("Error in ItemQueries removeItemInstance: ", JSON.stringify(error));
                    return res
                        .json({
                            success: false,
                            error: error
                        });
                }

            }
        }
    }
    resources.upgradeEndingTime = endingTime;

    try {
        builders = await BuildingService.getBuilders(address);
    } catch (error) {
        logger.error(`Error in BuildingService getBuilders:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }

    logger.debug(`response getBuilders : ${JSON.stringify(builders)} `);

    upgradeSprite = BuildingsHelper.createImageSpriteUpgradeUrl(nft.type, nft.level);

    try {
        upgradeResult = await InventoryQueries.setUpgradeBldHistory(upgradeObjects);
    } catch (error) {
        logger.error(`Error in InventoryQueries.setUpgradeBldHistory, error: ${Utils.printErrorLog(error)}`)
    }

    logger.debug(`setUpgradeBldHistory response : ${JSON.stringify(upgradeResult)}`)

    logger.info(`upgradeNFT response : ${JSON.stringify({
        resources: resources.resources,
        upgradeEndingTime: resources.upgradeEndingTime,
        builders: builders,
        upgradeSprite
    })
        }`)
    logger.info('upgradeNFT END');

    return res.json({
        success: true,
        data: {
            resources: resources.resources,
            upgradeEndingTime: resources.upgradeEndingTime,
            builders: builders,
            imageSprite: upgradeSprite
        }
    });
}

async function upgradeDone(req, res) {
    logger.info("upgradeDone START");
    logger.debug(`ipAddress:${sanitizer.getIpAddress(req)}`);

    let nftId = req.body.nftId;
    let type = req.body.type;
    let address = req.locals.address;

    let validation = BuildingsValidation.upgradeDoneValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }
    logger.info(`upgradeDone address: ${address}`);
    logger.info(`upgradeDone request, address: ${address}, nftId: ${nftId}, type: ${type}`);

    let awaitingUpgradeDone = BuildingsQueries.upgradeDone(nftId, type);

    try {
        verify = await BuildingService.verifyProperty(address, nftId, type);
    } catch (error) {
        logger.error(`Error in BuildingService verifyProperty: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });
    }
    if (!verify) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "You are not the owner of these nfts"
                }
            });
    }

    logger.debug(`verified: ${address} on nftID: ${nftId}  type: ${type}`);

    try {
        let response = await awaitingUpgradeDone;
        logger.info(`upgradeDone response:${JSON.stringify({ rows: response.affectedRows })}`)
        logger.info("upgradeDone END");
        return res
            .json({
                success: true,
                data: { rows: response.affectedRows }
            });
    } catch (error) {
        logger.error(`Error in upgradeDone: ${Utils.printErrorLog(error)}}`);
        return res
            .json({
                success: false,
            });
    }
}

//getNFT PROCEDURE
/*
async function getNFT(req, res) {
    logger.info(`getNFT START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let address = req.locals.address;
    let nftId = req.body.nftId;
    let type = req.body.type;

    let request = new BuildingsModel.BuildingsService();
    let buildingService = new BuildingsModel.UpgradeService();
    let dropService = new BuildingsModel.DropService();
    let verifyService = new BuildingsModel.VerifyService();

    let newStoredResponse;
    let responseAccountData;
    let responseUpgradeModel;
    let responseFinal;
    let verify;
    let builders;

    let validation = BuildingsValidation.getNFTValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }
    logger.info(`getNFT address: ${address}`);
    logger.info(`getNFT request, address: ${address}, nftId: ${nftId}, type:${type}`);

    //logger.debug(`on nftID:${nftId},type: ${type}`);

    try {
        verify = await verifyService.verifyProperty(address, nftId, type);
    } catch (error) {
        logger.error(`Error in verifyService.verifyProperty: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }
    if (!verify) {
        logger.warn("You are not the owner of these nfts");
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "You are not the owner of these nfts"
                }
            });
    }
    logger.debug(`verified: ${address} on nftID: ${nftId}  type: ${type}`);

    try {
        responseAccountData = await BuildingsQueries.getNFTProc(address, nftId, type);
    } catch (error) {
        logger.error(`Error in BuildingsQueries getNFTProc:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }
     try {
        responseAccountData = responseAccountData[0][0]
    } catch (error) {
        logger.error(`Error in BuildingsQueries responseAccountData:${Utils.printErrorLog(error)}`);

        responseAccountData = []
    }
    if (!responseAccountData) responseAccountData = []
    logger.debug(`responseAccountData: ${JSON.stringify(responseAccountData)}`);
    
    responseFinal = request.buildResponseModelNFTProc(responseAccountData);

    try {
        builders = await request.getBuilders(address);
    } catch (error) {
        logger.error(`Error in request.getBuilders:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }
    // logger.debug(`response getBuilders ${JSON.stringify(builders)}`);
    // logger.info(`getNFT response:${JSON.stringify({nft: responseFinal,builders: builders})}`)
    logger.info("getNFT END");

    return res
        .json({
            success: true,
            data: {
                nft: responseFinal,
                builders: builders
            }
        });

}
*/

async function getNFT(req, res) {
    logger.info(`getNFT START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let address = req.locals.address;
    let nftId = req.body.nftId;
    let type = req.body.type;


    let request = new BuildingsModel.BuildingsService();
    let buildingService = new BuildingsModel.UpgradeService();
    let dropService = new BuildingsModel.DropService();
    let verifyService = new BuildingsModel.VerifyService();

    let newStoredResponse;
    let responseAccountData;
    let responseUpgradeModel;
    let responseFinal;
    let verify;
    let builders;

    if (nftId == null || nftId == undefined || type == null || type == undefined || address == null || address == undefined) {
        logger.warn(`Bad request, input void or undefined, address: ${address}`);
        return res.status(401).json({
            success: false,
            error: {
                errorMessage: 'req is null'
            }
        })
    }
    if (!sanitizer.sanitizeAddress(address) || !sanitizer.sanitizeType(type) || !sanitizer.sanitizeNftId(nftId)) {
        logger.warn(`Bad request,invalid address: ${address}, or type: ${type}, or nftId: ${nftId}`);
        return res
            .status(401)
            .json({
                success: false,
                error: { errorMessage: 'not a valid address' }
            })
    }
    logger.info(`getNFT address: ${address}`);
    logger.info(`getNFT request, address: ${address}, nftId: ${nftId}, type:${type}`);

    //logger.debug(`on nftID:${nftId},type: ${type}`);

    try {
        verify = await verifyService.verifyProperty(address, nftId, type);
    } catch (error) {
        logger.error(`Error in verifyService.verifyProperty: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }
    if (!verify) {
        logger.warn("You are not the owner of these nfts");
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "You are not the owner of these nfts"
                }
            });
    }

    logger.debug(`verified: ${address} on nftID: ${nftId}  type: ${type}`);

    try {
        responseAccountData = await request.getNFT(nftId, type);
    } catch (error) {
        logger.error(`Error in request.getNft:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }
    try {
        responseUpgradeModel = await request.retrieveUpgradeModel();
    } catch (error) {
        logger.error(`Error in request.retrieveUpgradeModel:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }
    // logger.debug(`response getNFT : ${JSON.stringify(responseAccountData)} `);
    // logger.debug(`response retrieveUpgradeModel : ${JSON.stringify(responseUpgradeModel)} `);


    //try issue
    responseAccountData = await buildingService.checkUpgradeStatusNFT(responseAccountData, responseUpgradeModel);
    // logger.debug(`response checkUpgradeStatusNFT : ${JSON.stringify(responseAccountData)} `);

    if (responseAccountData.stake && !responseAccountData.upgradeStatus) {

        try {
            newStoredResponse = await dropService.calculateNewStoredResources(responseAccountData.idBuilding, responseAccountData.type, address);
        } catch (error) {
            logger.error(`Error in dropService.calculateNewStoredResources`);
            return res
                .json({
                    success: false,
                    error: error
                });

        }

        logger.debug(`calculatedNewStoredRes: ${address} on nftID: ${nftId} type: ${type}`);
    }


    try {
        responseAccountData = await request.getNFT(nftId, type);
    } catch (error) {
        logger.error(`Error in request.getNFT:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }

    // logger.debug(`nftAfterNewStored: ${address} on nftID:${nftId} type: ${type},  response: ${ JSON.stringify(responseAccountData)}`);

    try {
        responseAccountData = await request.retrieveImageNFT(responseAccountData);
    } catch (error) {
        logger.error(`Error in request.retrieveImageNFT:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });
    }

    // logger.debug(`response retrieveImage: ${JSON.stringify(responseAccountData)}`);

    try {
        responseAccountData = await request.retrieveImageSpriteNFT(responseAccountData);
    } catch (error) {
        logger.error(`Error in request.retrieveImageSpriteNFT:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });
    }
    // logger.debug(`response retrieveImageSprite: ${JSON.stringify(responseAccountData)}`);

    responseFinal = request.buildResponseModelNFT(responseAccountData, responseUpgradeModel);

    try {
        builders = await request.getBuilders(address);
    } catch (error) {
        logger.error(`Error in request.getBuilders:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }
    // logger.debug(`response getBuilders ${JSON.stringify(builders)}`);
    // logger.info(`getNFT response:${JSON.stringify({nft: responseFinal,builders: builders})}`)
    logger.info("getNFT END");

    return res
        .json({
            success: true,
            data: {
                nft: responseFinal,
                builders: builders
            }
        });

}


async function claim(req, res) {
    logger.info("claim START");
    logger.debug(`ipAddress:${sanitizer.getIpAddress(req)}`);

    let address = req.locals.address;
    let nftId = req.body.nftId;
    let type = req.body.type;

    let validation = BuildingsValidation.claimValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }
    logger.info(`getNFT address: ${address}`);
    logger.info(`getNFT request, address: ${address}, nftId: ${nftId}, type:${type}`);

    //Starting the queries in parallel and awaiting the results when needed - it speeds up the process
    let awaitingResourcesAndNFT = BuildingsQueries.getResourcesAndNFT(address, nftId, type);
    let awaitingBuilders = BuildingService.getBuilders(address);

    let responseNewStored;
    let newAmount;
    let resourceType;
    let response;
    let resources;
    let newLastClaim;
    let resourceAmount;
    let nft;

    //Create transferObject for claim_history_transfer (updated at the end)
    let transferObject = {}
    let claimResponse;

    transferObject.idBuilding = nftId;
    transferObject.typeBuilding = type;
    transferObject.address = address;

    try {
        nft = await awaitingResourcesAndNFT;
    } catch (error) {
        logger.error(`Error in BuildingsQueries getResourcesAndNFT:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }
    logger.debug(`response awaitingResourcesAndNFT : ${JSON.stringify(nft)} `);
    nft = nft[0];


    if (nft == null) {
        return res.json({
            success: false,
            error: {
                errorMessage: "Building not owned"
            }
        });
    }
    if (nft.type == 4) {
        return res.json({
            success: false,
            error: {
                errorMessage: "Type not valid"
            }
        });
    }
    if (!nft.stake) {
        return res.json({
            success: false,
            error: {
                errorMessage: "Building not staked"
            }
        });
    }
    if (nft.upgradeStatus) {
        return res.json({
            success: false,
            error: {
                errorMessage: "Building in upgrade"
            }
        });
    }

    let expClaim;
    try {
        expClaim = await BuildingService.calculateNewExpClaim(nft);
    } catch (error) {
        logger.error(`Error in BuildingService calculcateNewStoredResources:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }


    //Get new resources of nftId that have yet to be claimed, store it in transferObject.resourceBefore
    try {
        responseNewStored = await BuildingService.calculateNewStoredResources(nft);
    } catch (error) {
        logger.error(`Error in BuildingService calculcateNewStoredResources:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }
    logger.debug(`response calculateNewStoredResources : ${JSON.stringify(responseNewStored)} `);
    if (responseNewStored == false) {
        return res
            .json({
                success: false,
                info: { message: "Time is wrong" }
            });
    }
    newLastClaim = new Date().toISOString();

    transferObject.resourceBefore = responseNewStored.newStored;

    //Get all account's resources, calculate and store the resource about to be claimed in transferObject.resourceBalanceBefore
    resources = { "ancien": nft.ancien, "wood": nft.wood, "stone": nft.stone };
    resourceAmount = UserHelper.getResourceGivenType(resources, type);

    transferObject.resourceBalanceBefore = resourceAmount;

    //You can only claim the integer part of the newStored
    let integerExp = Math.floor(expClaim);
    let integerPart = Math.floor(responseNewStored.newStored);
    let remainRes = responseNewStored.newStored - integerPart;
    let remainExp = expClaim - integerExp;

    console.log("EXPCLAIM: ", expClaim)
    console.log("REMAINEXP: ", remainExp)

    transferObject.resourceAfter = remainRes;

    try {
        response = await BuildingsQueries.makeClaim(newLastClaim, nftId, type, remainRes, remainExp);
    } catch (error) {
        logger.error(`Error in BuildingsQueries makeClaim:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }
    logger.debug(`response makeClaim : ${JSON.stringify(response)} `);

    let incrementExp;
    switch (type) {
        case 1:
            incrementExp = integerExp * 4;
            break;
        case 2:
            incrementExp = integerExp;
            break;
        case 3:
            incrementExp = integerExp * 3;
            break;
    }
    logger.debug(`incrementExp: ${incrementExp}, integerPart: ${integerExp}`);

    //Update or Insert Exp
    let responseExp;
    try {
        responseExp = await leaderboardQueries.createOrUpdateUserLeaderboard(address, incrementExp);
    } catch (error) {
        logger.error(`Error in  LeaderboardQueries createOrUpdateUserLeaderboard, error: ${JSON.stringify(error)}`);
        return error;
    }
    logger.debug(`response LeaderboardQueries createOrUpdateUserLeaderboard : ${JSON.stringify(responseExp)} `);

    //Calculate and Update the new amount of the resource in account
    newAmount = resourceAmount + integerPart;
    resourceType = UserHelper.getResourceType(type);

    logger.debug(`address: ${address}, newAmount: ${newAmount}, resourceType: ${resourceType}`);

    try {
        response = await UserQueries.setResourceAfterClaim(address, newAmount, resourceType);
    } catch (error) {
        logger.error(`Error in UserQueries setResourceAfterClaim:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }
    logger.debug(`response setResourceAfterClaim : ${JSON.stringify(response)} `);

    //VALUTARE SE LA getResources E' NECESSARIA

    // try {
    //     resources = await UserQueries.getResources(address);
    // } catch (error) {
    //     logger.error(`Error in UserQueries getResources:${Utils.printErrorLog(error)}`);
    //     return res
    //     .json({
    //         success: false,
    //         error: error
    //     });

    // }
    // logger.debug(`response getResources : ${JSON.stringify(resources)} `);

    //transferObject.resourceBalanceAfter = UserHelper.getResourceGivenType(resources, type);

    transferObject.resourceBalanceAfter = newAmount;
    let awaitingClaimTransfer = UserQueries.setClaimTransfer(transferObject);

    let builders;
    try {
        builders = await awaitingBuilders;
    } catch (error) {
        logger.error(`Error in BuildingService getBuilders: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.debug(`response BuildingService getBuilders: ${JSON.stringify(builders)} `);

    //Set claim_history_transfer with data collected in transferObject
    try {
        claimResponse = await awaitingClaimTransfer;
    } catch (error) {
        logger.error(`Error in UserQueries setClaimTransfer: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    logger.debug(`setClaimTransfer response:${JSON.stringify(claimResponse)}`);
    logger.info(`setClaimTransfer END`);

    return res
        .json({
            success: true,
            data: {
                newStored: remainRes,
                resourceType: resourceType,
                newAmount: newAmount,
                builders: builders
            }
        });

}

async function doPrestige(req, res) {
    logger.info("doPrestige START");
    logger.debug(`ipAddress:${sanitizer.getIpAddress(req)}`);

    let validation = BuildingsValidation.doPrestigeValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address;
    let buildingType = req.body.buildingType;
    let level = req.body.level;

    let drops;
    try {
        drops = await BuildingsQueries.getPrestigeData(address, buildingType, level);
    } catch (error) {
        logger.error(`Error in BuildingsQueries.getPrestigeData: ${Utils.printErrorLog(error)}}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    if (drops.length == 0) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'You haven\'t got that building or any drop for prestige'
                }
            });
    }

    for (const drop of drops) {
        let op;
        try {
            op = await FishermanQueries.checkIfUserHasItem(address, drop.idItem)
            logger.debug(`FishermanQueries.checkIfUserHasItem response : ${JSON.stringify(op)}`)
        } catch (error) {
            logger.error(`FishermanQueries.checkIfUserHasItem error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if (op.length == 0) {
            let create
            try {
                create = await FishermanQueries.createItemInstanceByAddressIdItemQuantity(address, drop.idItem, drop.dropQuantity)
                logger.debug(`FishermanQueries.createItemInstanceByAddressIdItemQuantity response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`FishermanQueries.createItemInstanceByAddressIdItemQuantity error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        } else {
            let update
            try {
                update = await FishermanQueries.updateItemInstanceByIdItemInstance(op[0].idItemInstance, drop.dropQuantity)
                logger.debug(`FishermanQueries.updateItemInstanceByIdItemInstance response : ${JSON.stringify(update)}`)
            } catch (error) {
                logger.error(`FishermanQueries.updateItemInstanceByIdItemInstance error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }
    }

    let buildingInfo;
    try {
        buildingInfo = await BuildingsQueries.getBuildingInfo(address, buildingType, level);
    } catch (error) {
        logger.error(`Error in BuildingsQueries.getBuildingInfo: ${Utils.printErrorLog(error)}}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    buildingInfo = buildingInfo[0];

    let levelData
    try {
        levelData = await BuildingsQueries.getUpdateModelByTypeAndLevel(buildingType, 1);
    } catch (error) {
        logger.error(`Error in BuildingsQueries.getUpdateModelByTypeAndLevel: ${Utils.printErrorLog(error)}}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    if (buildingType == 4) {
        try {
            await BuildingsQueries.resetFishingTool(buildingInfo.idToolInstance);
        } catch (error) {
            logger.error(`Error in BuildingsQueries.resetFishingTool: ${Utils.printErrorLog(error)}}`);
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                });
        }
        try {
            await BuildingsQueries.resetPassive(buildingInfo.idPassive);
        } catch (error) {
            logger.error(`Error in BuildingsQueries.resetPassive: ${Utils.printErrorLog(error)}}`);
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                });
        }
    } else {
        try {
            await BuildingsQueries.claimRemainingStore(address, buildingType, buildingInfo.stored);
        } catch (error) {
            logger.error(`Error in BuildingsQueries.claimRemainingStore: ${Utils.printErrorLog(error)}}`);
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                });
        }
    }

    let response;
    try {
        response = await BuildingsQueries.doPrestige(address, buildingType, level, levelData);
    } catch (error) {
        logger.error(`Error in BuildingsQueries.doPrestige: ${Utils.printErrorLog(error)}}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.info("doPrestige END");
    return res.json({
        success: true
    });
}

async function getPrestigeData(req, res) {
    logger.info("getPrestigeData START");
    logger.debug(`ipAddress:${sanitizer.getIpAddress(req)}`);

    let validation = BuildingsValidation.getPrestigeDataValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address;
    let buildingType = req.body.buildingType;
    let level = req.body.level;

    let response;
    try {
        response = await BuildingsQueries.getPrestigeData(address, buildingType, level);
    } catch (error) {
        logger.error(`Error in BuildingsQueries.getPrestigeData: ${Utils.printErrorLog(error)}}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    /* if (response.length == 0) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'You haven\'t got that building or any drop for prestige'
                }
            });
    } */

    logger.info("getPrestigeData END");
    return res.json({
        success: true,
        data: response
    });
}

async function isStake(req, res) {
    logger.info("isStake START");
    logger.debug(`ipAddress:${sanitizer.getIpAddress(req)}`);

    let type = req.body.type;
    let nftId = req.body.id;            //it works with "id" in payload, NOT "nftId"
    let address = req.locals.address;
    let newStatus = req.body.newStatus;

    let verify;
    let nft;
    let builders;

    let awaitingNFT = BuildingsQueries.getNFT(nftId, type);
    let awaitingBuilders = BuildingService.getBuilders(address);

    let validation = BuildingsValidation.isStakeValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }
    logger.info(`isStake address: ${address}`);
    logger.info(`isStake request, address: ${address}, type: ${type}, id: ${nftId}, newStatus: ${newStatus}`);

    try {
        verify = await BuildingService.verifyProperty(address, nftId, type);
    } catch (error) {
        logger.error(`Error in BuildingService verifyProperty:${Utils.printErrorLog(error)}`);
    }
    if (!verify) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "You are not the owner of these nfts"
                }
            });
    }

    logger.debug(`verified: ${address} on nftID: ${nftId}  type: ${type}`);

    try {
        nft = await awaitingNFT;
    } catch (error) {
        logger.error(`Error in BuildingsQueries getNFT:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });

    }
    if (!(nft.stake == newStatus)) {
        return res.json({
            success: false,
            error: {
                errorMessage: "newStatus not equals stake"
            }
        });
    }

    try {
        builders = await awaitingBuilders;
    } catch (error) {
        logger.error(`Error in BuildingService getBuilders:${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: error
            });
    }
    logger.info(`isStake response:${JSON.stringify({ builders: builders })}`)
    logger.info("isStake END");

    return res.json({
        success: true,
        data: {
            builders: builders
        }
    });


}

async function setStake(req, res) {//deprecata
    logger.info(`getAccountData START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);



    let stake = req.body.stake;
    let type = req.body.type;
    let nftId = req.body.nftId;
    let address = req.locals.address;


    let stakeService = new BuildingsModel.StakeService();
    let buildingsService = new BuildingsModel.BuildingsService()
    let verifyService = new BuildingsModel.VerifyService();

    if (!sanitizer.validateInput(nftId, type, address, stake)) {
        logger.warn(`Bad request, input void or undefined, address: ${address}`);
        return res
            .status(401)
            .json({
                success: false,
                error: { errorMessage: 'req is null' }
            })
    }
    //to sanitaze stake
    if (!sanitizer.sanitizeAddress(address) || !sanitizer.sanitizeType(type) || !sanitizer.sanitizeNftId(nftId)) {
        logger.warn(`Bad request,invalid address: ${address}, or type: ${type}, or nftId: ${nftId}`);
        return res.status(401).json({
            success: false,
            error: { errorMessage: 'not a valid address' }
        })
    }
    logger.info(`getAccountData request, stake:${stake}, type:${type}, nftId:${nftId}, address:${address}`)

    try {
        let verify = await verifyService.verifyProperty(address, nftId, type);
    } catch (error) {
        logger.error(`Error in verifyService.verifyProperty:${Utils.printErrorLog(error)}`);
    }
    if (!verify) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "You are not the owner of these nfts"
                }
            });
    }


    try {

        let nft = await buildingsService.getNFT(nftId, type);
        logger.debug(`response getNFT : ${JSON.stringify(nft)} `);

        if (nft.upgradeStatus) {
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: "Building in upgrade"
                    }
                });
        }

        let lastClaim = new Date().toISOString();
        let response = await stakeService.changeStakeStatus(nftId, type, stake, lastClaim);
        logger.debug(`response changeStakeStatus : ${JSON.stringify(response)} `);

        let builders = await buildingsService.getBuilders(address);
        logger.debug(`response getBuilderss : ${JSON.stringify(builders)} `);
        logger.info(`setStake response: ${JSON.stringify({
            affectedRows: response.affectedRows,
            builders: builders
        })
            }`);
        logger.info(`setStake END`);
        return res.json({
            success: true,
            data: {
                affectedRows: response.affectedRows,
                builders: builders
            }
        });
    } catch (error) {
        return res.json({ success: false, error: error });
    }


}

async function setPosition(req, res) {
    let address = req.locals.address;
    let nftId = req.body.id;
    let type = req.body.type;
    let position = req.body.position;

    let stakedNFTS;
    let response;
    let verify;

    logger.info(`setPosition START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation = BuildingsValidation.setPositionValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }


    logger.info(`setPosition address: ${address}`);
    logger.info(`setPosition request, type:${type}, nftId:${nftId}, address:${address}, position: ${position}`);

    try {
        verify = await BuildingService.verifyPropertyAndStake(address, nftId, type);
    } catch (error) {
        logger.error(`Error in BuildingService verifyPropertyAndStake:${Utils.printErrorLog(error)}`);
    }
    if (!verify) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "You are not the owner of these nfts, or your nft isn't staked"
                }
            });
    }

    logger.debug(`verified: ${address} on nftID: ${nftId}  type: ${type}`);

    try {
        stakedNFTS = await BuildingsQueries.getStakedNFT(address);
    } catch (error) {
        logger.error(`Error in BuildingsQueries getStakedNFT: ${Utils.printErrorLog(error)}}`);
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    response = BuildingService.verifyPosition(stakedNFTS, position, nftId, type);

    switch (response) {
        case 1:
            try {
                response = await BuildingsQueries.updatePosition(nftId, type, position);
            } catch (error) {
                logger.error(`Error in BuildingsQueries updatePosition: ${Utils.printErrorLog(error)}}`);
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    });
            }
            logger.info("setPosition END");
            return res
                .json({
                    success: true
                });
        case 2:
            logger.warn(`There is another building in the same position`);
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: `There is another building in the same position`
                    }
                });
        case 3:
            logger.debug(`The building is already in position`);
            return res
                .json({
                    success: true
                });
    }
}

async function isCursed(req, res) {
    let validation;
    validation = BuildingsValidation.isCursedValidation(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    let nftId = req.body.id;
    let type = req.body.type;
    let response;
    let final;

    try {
        response = await BuildingsQueries.getCursed(nftId, type);
    } catch (error) {
        logger.error(`Error in BuildingsQueries.getCursed: ${Utils.printErrorLog(error)}}`);
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.debug(`The cursed state is : ${JSON.stringify(response)}`);

    logger.info("isCursed END");

    final = BuildingsHelper.checkCursed(response);

    return res
        .json({
            success: true,
            cursed: final
        });

}

async function setPassiveOn(req, res) {
    logger.info(`setPassiveOn START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation
    validation = BuildingsValidation.setPassiveOnValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let pkBuilding = req.body.pkBuilding
    let buildingType = req.body.buildingType

    let response = {}
    if (buildingType == 4) {
        try {
            response = await PassiveService.setFishermanPassiveOn(address)
        } catch (error) {
            logger.error(`Error in PassiveService.setFishermanPassiveOn: ${Utils.printErrorLog(error)}}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
    }

    logger.debug(`setPassiveOn response: ${JSON.stringify(response)}`)
    logger.info("setPassiveOn END")

    return res
        .status(200)
        .json({
            success: true,
            data: response
        })
}

async function setPassiveOff(req, res) {
    logger.info(`setPassiveOff START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation
    validation = BuildingsValidation.setPassiveOffValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let pkBuilding = req.body.pkBuilding
    let buildingType = req.body.buildingType

    let response
    if (buildingType == 4) {
        try {
            response = await PassiveService.setFishermanPassiveOff(address)
        } catch (error) {
            logger.error(`Error in PassiveService.setFishermanPassiveOff: ${Utils.printErrorLog(error)}}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
    }

    logger.debug(`setPassiveOff response: ${JSON.stringify(response)}`)
    logger.info("setPassiveOff END")

    return res
        .status(200)
        .json({
            success: true,
            data: response
        })
}

async function upgradePassive(req, res) {
    logger.info(`upgradePassive START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation
    validation = BuildingsValidation.upgradePassiveValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let pkBuilding = req.body.pkBuilding
    let buildingType = req.body.buildingType

    let response
    if (buildingType == 4) {
        try {
            response = await PassiveService.upgradeFishermanPassive(address)
        } catch (error) {
            logger.error(`Error in PassiveService.upgradeFishermanPassive: ${Utils.printErrorLog(error)}}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
    }

    logger.debug(`upgradePassive response: ${JSON.stringify(response)}`)
    logger.info("upgradePassive END")

    return res
        .status(200)
        .json({
            success: true,
            data: response
        })
}

async function getNFTUpgradeRequirements(req, res) {
    logger.info(`getNFTUpgradeRequirements START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation
    validation = BuildingsValidation.getNFTUpgradeRequirementsValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let buildingType = req.body.buildingType
    let buildingLevel = req.body.buildingLevel

    let response = {}
    try {
        response = await BuildingService.getNFTUpgradeRequirements(address, buildingType, buildingLevel)
    } catch (error) {
        logger.error(`Error in BuildingService.getNFTUpgradeRequirements: ${Utils.printErrorLog(error)}}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.debug(`getNFTUpgradeRequirements response: ${JSON.stringify(response)}`)
    logger.info("getNFTUpgradeRequirements END")

    return res
        .status(200)
        .json({
            success: true,
            data: response
        })
}

module.exports = { getPrestigeData, doPrestige, getAccountData, upgradeNFT, upgradeDone, getNFT, claim, setStake, isStake, setPosition, isCursed, setPassiveOn, setPassiveOff, upgradePassive, getNFTUpgradeRequirements };