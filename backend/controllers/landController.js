const logger = require("../logging/logger");
const Validator = require('../utils/validator');
const {Utils} = require("../utils/utils");

const {LandValidation} = require("../validations/landValidation");
const {LandQueries} = require("../queries/landQueries");
const { LandService } = require("../services/landService");
const { BuildingsService } = require("../models/buildingsModel");
const { UserQueries } = require("../queries/userQueries");
const { BuildingsHelper } = require("../helpers/buildingsHelper");
const { UserHelper } = require("../helpers/userHelper");
const { ItemQueries } = require("../queries/inventory/itemQueries");
const { BuildingService } = require("../services/buildingService");
const { VoucherService } = require("../services/voucherService");
const { id } = require("ethers/lib/utils");

const {MAX_LEVELS} = require('../config/buildingLevel');

async function getContractStatus(req, res) {
    logger.info(`getContractStatus START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.getContractStatusValidation(req)
    if ( !validation.success ) {
        return res
        .status(401)
        .json(validation)
    }

    let address = req.locals.address;
    let idContract = req.body.idContract;
    
    let contractStatus
    try {
        contractStatus = await LandQueries.getContractStatus(idContract);
    } catch (error) {
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
    if ( contractStatus.length != 1 ) {
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Unknown idContract"
            }
        });
    }

    logger.info("getContractStatus END");
    return res.json({
        success: true,
        data: contractStatus[0].contractStatus
    });
}
async function isStake(req, res) {
    logger.info(`isStake START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.isStakeValidation(req)
    if ( !validation.success ) {
        return res
        .status(401)
        .json(validation)
    }

    let address = req.locals.address;
    let nftId = req.body.id;
    let newStatus = req.body.newStatus;
    
    let verify;
    let nft;
    let builders;

    try {
        verify = await LandQueries.verifyProperty(address, nftId);
    } catch (error) {
        logger.error(`Error in LandQueries verifyProperty:${Utils.printErrorLog(error)}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
    if ( verify.length != 1 ) {
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "You are not the owner of the nft"
            }
        });
    }

    logger.debug(`verified: ${address} on nftID: ${nftId}`);

    try {
        nft = await LandQueries.getNFT(nftId);
    } catch (error) {
        logger.error(`Error in BuildingsQueries getNFT:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
        
    }
    if( !(nft.stake == newStatus) ){
        return res.json({
            success: false,
            error:{
                errorMessage: "newStatus not equals stake"
            }
        });
    }

    logger.info("isStake END");

    return res.json({
        success: true,
        data: {
            message: 'successfully done'
        }
    });

}

async function getAllLands(req, res) {
    logger.info(`getAllLands START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.getAllLandsValidation(req)
    if ( !validation.success ) {
        return res
        .status(401)
        .json(validation)
    }
    
    let address = req.locals.address
    let response;

    let landListRawData = []
    try {
        landListRawData = await LandQueries.getOwnedLands(address);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getOwnedLands: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }
    logger.debug(`getOwnedLands response : ${JSON.stringify(landListRawData)}`);

    if(landListRawData.length == 0){
        logger.info(`getAllLands END`)
        return res
        .status(200)
        .json({
            success: true,
            data: {
                crown: false,
                stakable: false
            }
        })
    }

    try {
        response = await LandService.buildOwnerResponse(landListRawData, address);
    } catch ( error ) {
        logger.error(`Error in LandService.buildOwnerResponse: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }

    logger.info(`getAllLands END`)
    return res
    .status(200)
    .json({
        success: true,
        data: {
            crown:true,
            ...response
        }
    })
}

async function getLand(req, res) {
    logger.info(`getLand START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    //gestire caso upgrade finito
    let validation = LandValidation.getLandOwnerValidation(req)
    if ( !validation.success ) {
        return res
        .status(401)
        .json(validation)
    }
    
    let address = req.locals.address
    let idLandInstance = req.body.idLandInstance
    let response = {}, property;

    //to check if the address is the real owner
    try {
        property = await LandQueries.getLandProperty(idLandInstance,address);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getOwnedLands: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }
    let owner;
    if(property.length != 0) owner = 1
    else owner = 0

    //check if the contract is still active
    //else we set it  expired and kick all the guests
    let check;   
    try {
        check = await LandQueries.activeContractCheck(idLandInstance);
    } catch (error) {
        logger.error(`Error in LandQueries activeContractCheck: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`activeContractCheck info : ${JSON.stringify(check)}`);

    if(check.length != 0){
        check = check[0];
        if(check.expired){
            let expired;   
            try {
                expired = await LandQueries.setContractExpired(check.idContract);
            } catch (error) {
                logger.error(`Error in LandQueries setContractExpired: ${Utils.printErrorLog(error)}`);
                return res
                .json({
                    success: false,
                    error: error
                });
            }
            logger.debug(`setContractExpired info : ${JSON.stringify(expired)}`);

            let kick
            try {
                kick = await LandQueries.kickAllGuests(check.idContract);
            } catch (error) {
                logger.error(`Error in LandQueries kickAllGuests: ${Utils.printErrorLog(error)}`);
                return res
                .json({
                    success: false,
                    error: error
                });
            }
            logger.debug(`kickAllGuests info : ${JSON.stringify(expired)}`);
        }

    }

    let guestsRawData = []
    try {
        guestsRawData = await LandQueries.getLandGuestsGivenIdLandInstance(idLandInstance);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getOwnedLands: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }
    logger.debug(`getGuests response : ${JSON.stringify(guestsRawData)}`);

    let guests
    try {
        guests =  LandService.buildGuestsResponse(guestsRawData,address);
    } catch ( error ) {
        logger.error(`Error in LandService.buildGuestsResponse: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }


    
    let landInfo;
    try {
        landInfo =  await LandQueries.getLandGivenIdLandInstance(idLandInstance);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getLandGivenIdLandInstance: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }
    landInfo = landInfo[0]
    logger.debug(`LandQueries getLandGivenIdLandInstance response :${JSON.stringify(landInfo)}`);

    if(owner){   
        let landUpgradeCheck;
        try {
            landUpgradeCheck = await LandService.checkUpgradeStatusLand(landInfo);
        } catch ( error ) {
            logger.error(`Error in LandService.checkUpgradeStatusLand: ${Utils.printErrorLog(error)}`)
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
        }
    }
        //logger.debug(`checkUpgradeStatusLand response :${JSON.stringify(landUpgradeCheck)}`);

        //gestire upgrade finito
        //creare

    try {
        response =  await LandService.buildGetLandOwnerResponse(guests, landInfo,owner);
    } catch ( error ) {
        logger.error(`Error in LandService.buildGetLandOwnerResponse: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }

    logger.info(`getLand END`)
    return res
    .status(200)
    .json({
        success: true,
        data:{
            ...response
        }
    })
}

async function getHomeLand(req, res) {
    logger.info(`getLand START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    //gestire caso upgrade finito
    let validation = LandValidation.getHomeLandValidation(req)
    if ( !validation.success ) {
        return res
        .status(401)
        .json(validation)
    }
    
    let address = req.locals.address
    // get idLandInstance from address
    let idLandInstance
    try {
        idLandInstance = await LandQueries.getIdLandInstanceFromAddress(address);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getIdLandInstanceFromAddress: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }
    if ( idLandInstance == undefined ) {
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: 'You are not land-guest!'
            }
        })
    }
    idLandInstance = idLandInstance.idLandInstance;

    let response = {}, property;

    //to check if the address is the real owner
    try {
        property = await LandQueries.getLandProperty(idLandInstance,address);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getOwnedLands: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }
    let owner;
    if(property.length != 0) owner = 1
    else owner = 0

    //check if the contract is still active
    //else we set it  expired and kick all the guests
    let check;   
    try {
        check = await LandQueries.activeContractCheck(idLandInstance);
    } catch (error) {
        logger.error(`Error in LandQueries activeContractCheck: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`activeContractCheck info : ${JSON.stringify(check)}`);

    if(check.length != 0){
        check = check[0];
        if(check.expired){
            let expired;   
            try {
                expired = await LandQueries.setContractExpired(check.idContract);
            } catch (error) {
                logger.error(`Error in LandQueries setContractExpired: ${Utils.printErrorLog(error)}`);
                return res
                .json({
                    success: false,
                    error: error
                });
            }
            logger.debug(`setContractExpired info : ${JSON.stringify(expired)}`);

            let kick
            try {
                kick = await LandQueries.kickAllGuests(check.idContract);
            } catch (error) {
                logger.error(`Error in LandQueries kickAllGuests: ${Utils.printErrorLog(error)}`);
                return res
                .json({
                    success: false,
                    error: error
                });
            }
            logger.debug(`kickAllGuests info : ${JSON.stringify(expired)}`);
        }

    }

    let guestsRawData = []
    try {
        guestsRawData = await LandQueries.getLandGuestsGivenIdLandInstance(idLandInstance);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getOwnedLands: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }
    logger.debug(`getGuests response : ${JSON.stringify(guestsRawData)}`);

    let guests
    try {
        guests =  LandService.buildGuestsResponse(guestsRawData,address);
    } catch ( error ) {
        logger.error(`Error in LandService.buildGuestsResponse: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }


    
    let landInfo;
    try {
        landInfo =  await LandQueries.getLandGivenIdLandInstance(idLandInstance);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getLandGivenIdLandInstance: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }
    landInfo = landInfo[0]
    logger.debug(`LandQueries getLandGivenIdLandInstance response :${JSON.stringify(landInfo)}`);

    if(owner){   
        let landUpgradeCheck;
        try {
            landUpgradeCheck = await LandService.checkUpgradeStatusLand(landInfo);
        } catch ( error ) {
            logger.error(`Error in LandService.checkUpgradeStatusLand: ${Utils.printErrorLog(error)}`)
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
        }
    }
        //logger.debug(`checkUpgradeStatusLand response :${JSON.stringify(landUpgradeCheck)}`);

        //gestire upgrade finito
        //creare

    try {
        response =  await LandService.buildGetLandOwnerResponse(guests, landInfo,owner);
    } catch ( error ) {
        logger.error(`Error in LandService.buildGetLandOwnerResponse: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }

    logger.info(`getLand END`)
    return res
    .status(200)
    .json({
        success: true,
        data:{
            ...response
        }
    })
}

async function getLandInfo(req, res) {
    logger.info(`getLandInfo START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation = LandValidation.getLandInfoOwnerValidation(req)
    if ( !validation.success ) {
        return res
        .status(401)
        .json(validation)
    }
    
    let address = req.locals.address
    let idLandInstance = req.body.idLandInstance
    let response = {},property, owned = 0

    //to check if the address is the real owner
    try {
        property = await LandQueries.getLandProperty(idLandInstance,address);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getOwnedLands: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }

    if(property.length != 0) owned = 1

    let landInfo;
    try {
        landInfo =  await LandQueries.getLandGivenIdLandInstance(idLandInstance);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getLandGivenIdLandInstance: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }
    landInfo = landInfo[0]
    logger.debug(`getLandGivenIdLandInstance response :${JSON.stringify(landInfo)}`);






    try {
        response =  await LandService.buildGetLandInfoOwnerResponse(landInfo,idLandInstance,address,owned);
    } catch ( error ) {
        logger.error(`Error in LandService.buildGetLandOwnerResponse: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }

    logger.info(`getLandInfoOwner END`)
    return res
    .status(200)
    .json({
        success: true,
        data:{
            ...response
        }
    })
}

async function getWorld(req, res) {
    logger.info(`getWorld START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation = LandValidation.getWorldValidation(req)
    if ( !validation.success ) {
        return res
        .status(401)
        .json(validation)
    }
    
    let address = req.locals.address
    let idWorld = req.body.idWorld

    let worldInfo
    try {
        worldInfo = await LandQueries.getWorldInfo(idWorld);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getWorldInfo: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }

    if(worldInfo.length == 0){
        logger.warn(`idWorld does not exist`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: 'idWorld does not exist'
            }
        })
    }
    worldInfo= worldInfo[0];

    let landListRawData = []
    try {
        landListRawData = await LandQueries.getLandsGivenIdWorld(idWorld);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getLandsGivenIdWorld: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }
    logger.debug(`getLandsGivenIdWorld response : ${JSON.stringify(landListRawData)}`);

    let landList = []
    let landIndex = 0
    for (let land of landListRawData) {
        if ( land.stake == 0 ) {
            continue;
        }
        ++ landIndex;
        let home,owned
        
        let homeRaw
        try {
            homeRaw = await LandQueries.getUserHomeGivenIdLandInstance(land.idLandInstance,address
                );
        } catch ( error ) {
            logger.error(`Error in LandQueries.getHomeGivenIdLandInstance: ${Utils.printErrorLog(error)}`)
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
        }

        logger.debug(`getUserHomeGivenIdLandInstance response :${JSON.stringify(homeRaw)}`)

        let ownerRaw
        try {
            ownerRaw = await LandQueries.getLandProperty(land.idLandInstance,address);
        } catch ( error ) {
            logger.error(`Error in LandQueries.getHomeGivenIdLandInstance: ${Utils.printErrorLog(error)}`)
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
        }

        logger.debug(`getLandProperty response :${JSON.stringify(JSON.stringify(ownerRaw))}`)

        if(homeRaw.length != 0) home = 1
        else home = 0

        if(ownerRaw.length!=0) owned = 1
        else owned = 0

        let ownerInfoRaw
        try {
            ownerInfoRaw = await LandQueries.getOwnerInfo(land.address);
        } catch ( error ) {
            logger.error(`Error in LandQueries.getOwnerInfo: ${Utils.printErrorLog(error)}`)
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
        }
        logger.debug(`ownerInfo response : ${JSON.stringify(ownerInfoRaw)}`)
        let ownerInfo={}
        if(ownerInfoRaw.length!=0){
            ownerInfoRaw = ownerInfoRaw[0];

            ownerInfo = {
                cityName:ownerInfoRaw.cityName,
                cityImage:ownerInfoRaw.image
            }
        }

        landList.push({
            index: landIndex,
            id: land.idLandInstance,
            type: land.type,
            level: land.level,
            rarity: land.rarity, 
            //owner: land.address,
            ownerInfo:ownerInfo,
            name: land.name,
            //position:land.position,
            image: land.image,
            bonus: land.bonus,
            isPrivate: land.isPrivate,
            spotOccupied: land.spotOccupied,
            maxSpot: land.maxSpot,
            home:home,
            owned:owned
        })
    }

    

    let home,homeRaw
    try {
        homeRaw = await LandQueries.getUserHomeFromWorld(idWorld,address);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getUserHomeFromWorld: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }
    logger.debug(`getUserHomeFromWorld response :${JSON.stringify(homeRaw)}`)

    if (homeRaw.length!=0) home=1
    else home = 0

    let info = {
        id:worldInfo.idWorld,
        name:worldInfo.name,
        image:worldInfo.image,
        home:home

    }
    

    logger.info(`getWorld END`)
    return res
    .status(200)
    .json({
        success: true,
        data: {
            lands: landList,
            info:info
        }
    })
}

async function getHomeWorld(req, res) {
    logger.info(`getHomeWorld START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation = LandValidation.getHomeWorldValidation(req)
    if ( !validation.success ) {
        return res
        .status(401)
        .json(validation)
    }
    
    let address = req.locals.address

    // get idWorld from address
    let idWorld
    try {
        idWorld = await LandQueries.getIdWorldFromAddress(address);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getIdWorldFromAddress: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }
    if ( idWorld == undefined ) {
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: 'You are not land-guest!'
            }
        })
    }
    idWorld = idWorld.idWorld;
    
    let worldInfo
    try {
        worldInfo = await LandQueries.getWorldInfo(idWorld);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getWorldInfo: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }

    if(worldInfo.length == 0){
        logger.warn(`idWorld does not exist`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: 'idWorld does not exist'
            }
        })
    }
    worldInfo= worldInfo[0];

    let landListRawData = []
    try {
        landListRawData = await LandQueries.getLandsGivenIdWorld(idWorld);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getLandsGivenIdWorld: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }
    logger.debug(`getLandsGivenIdWorld response : ${JSON.stringify(landListRawData)}`);

    let landList = []
    let landIndex = 0
    for (let land of landListRawData) {
        if ( land.stake == 0 ) {
            continue;
        }
        ++ landIndex;
        let home,owned
        
        let homeRaw
        try {
            homeRaw = await LandQueries.getUserHomeGivenIdLandInstance(land.idLandInstance,address
                );
        } catch ( error ) {
            logger.error(`Error in LandQueries.getHomeGivenIdLandInstance: ${Utils.printErrorLog(error)}`)
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
        }

        logger.debug(`getUserHomeGivenIdLandInstance response :${JSON.stringify(homeRaw)}`)

        let ownerRaw
        try {
            ownerRaw = await LandQueries.getLandProperty(land.idLandInstance,address);
        } catch ( error ) {
            logger.error(`Error in LandQueries.getHomeGivenIdLandInstance: ${Utils.printErrorLog(error)}`)
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
        }

        logger.debug(`getLandProperty response :${JSON.stringify(JSON.stringify(ownerRaw))}`)

        if(homeRaw.length != 0) home = 1
        else home = 0

        if(ownerRaw.length!=0) owned = 1
        else owned = 0

        let ownerInfoRaw
        try {
            ownerInfoRaw = await LandQueries.getOwnerInfo(land.address);
        } catch ( error ) {
            logger.error(`Error in LandQueries.getOwnerInfo: ${Utils.printErrorLog(error)}`)
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
        }
        logger.debug(`ownerInfo response : ${JSON.stringify(ownerInfoRaw)}`)
        let ownerInfo={}
        if(ownerInfoRaw.length!=0){
            ownerInfoRaw = ownerInfoRaw[0];

            ownerInfo = {
                cityName:ownerInfoRaw.cityName,
                cityImage:ownerInfoRaw.image
            }
        }

        landList.push({
            index: landIndex,
            id: land.idLandInstance,
            type: land.type,
            level: land.level,
            rarity: land.rarity, 
            //owner: land.address,
            ownerInfo:ownerInfo,
            name: land.name,
            //position:land.position,
            image: land.image,
            bonus: land.bonus,
            isPrivate: land.isPrivate,
            spotOccupied: land.spotOccupied,
            maxSpot: land.maxSpot,
            home:home,
            owned:owned
        })
    }

    

    let home,homeRaw
    try {
        homeRaw = await LandQueries.getUserHomeFromWorld(idWorld,address);
    } catch ( error ) {
        logger.error(`Error in LandQueries.getUserHomeFromWorld: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }
    logger.debug(`getUserHomeFromWorld response :${JSON.stringify(homeRaw)}`)

    if (homeRaw.length!=0) home=1
    else home = 0

    let info = {
        id:worldInfo.idWorld,
        name:worldInfo.name,
        image:worldInfo.image,
        home:home

    }
    

    logger.info(`getWorld END`)
    return res
    .status(200)
    .json({
        success: true,
        data: {
            lands: landList,
            info:info
        }
    })
}

async function getUniverse(req, res) {
    logger.info(`getUniverse START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation = LandValidation.getAllLandsValidation(req)
    if ( !validation.success ) {
        return res
        .status(401)
        .json(validation)
    }
    
    let address = req.locals.address

    let worldListRaw = []
    try {
        worldListRaw = await LandQueries.getAllWorlds();
    } catch ( error ) {
        logger.error(`Error in LandQueries.getAllWorlds: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }
    logger.debug(`getAllWorlds response : ${JSON.stringify(worldListRaw)}`);

    let worlds = []
    for (let world of worldListRaw) {
        let home
        let getHomeInfo

        try {
            getHomeInfo = await LandQueries.getUserHomeFromWorld(world.idWorld,address);
        } catch ( error ) {
            logger.error(`Error in LandQueries.getUserHomeFromWorld: ${Utils.printErrorLog(error)}`)
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
        }
        logger.debug(`getUserHomeFromWorld response:${getHomeInfo}`)

        if(getHomeInfo.length!= 0)  home = 1;
        else home = 0

        worlds.push({
            id: world.idWorld,
            name: world.name,
            image: world.image,
            landCount: world.landCount,
            home: home,
        })
    }

    logger.info(`getUniverse END`)
    return res
    .status(200)
    .json({
        success: true,
        data: {
            worlds
        }
    })
}

async function upgradeLand(req, res) {
    logger.info(`upgradeLand START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    
    
    
    let validation = LandValidation.upgradeLandValidation(req)
        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    let idLandInstance = req.body.idLandInstance;
    let consumableIds = req.body.consumableIds;

    logger.info(`upgradeLand request, address: ${address}, idLandInstance: ${idLandInstance}, consumableIds: ${consumableIds}`);

    let resources;
    let resourcesResponse;
    let upgradeResources = {};
    let land;
    let upgradeTime;
    let endingTime;
    let builders;
    let response;
    let upgradeSprite;
    //for upgrade history
    let upgradeResult;
    let upgradeObjects = [];

    try {
        verify = await LandQueries.getLandProperty(idLandInstance,address);
    } catch (error) {
        logger.error(`Error in LandQueries getLandProperty: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`veify: ${JSON.stringify(verify)}`)
    if(verify.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "You are not the owner of this land"
            }
        });
    }

    logger.debug(`verified: ${address} on idLandInstance: ${idLandInstance}`);

    try{
        land = await LandQueries.getLandGivenIdLandInstance(idLandInstance);
    }catch(error){
        logger.error(`Error in LandQueries.getLandGivenIdLandInstance:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    land = land[0]

    let type = land.type;
    
    logger.debug(`Land type is :${type}`);
    
    logger.debug(`response getLandGivenIdLandInstance : ${JSON.stringify(land)} `);

    if(land.upgradeStatus){
        return res.json({
            success: false,
            error: "Already in upgrade"

        });
    }

    if(!land.stake){
        return res.json({
            success: false,
            error: "Land not staked"
  
        });
    }

    if(land.level >= MAX_LEVELS[land.type]){
        return res.json({
            success: false,
            error: "maxLevel reached"

        })
    }

    let check;
    try{
        check = await LandQueries.checkRequirementsUpgradeLand(address, idLandInstance, consumableIds);
    }catch(error){
        logger.error(`Error in LandQueries checkRequirementsUpgradeLand:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`response checkRequirementsUpgradeLand : ${JSON.stringify(check)} `);
    if ( check.length == 0 ) {
        return res.json({
            success: false,
            error: "Error in checkRequirementsUpgradeNFT: requirements not found"
            
        })
    }

    let objectAncien = {};
    let objectWood= {};
    let objectStone = {};
    
    if(check[0].requiredAncien != null && check[0].requiredAncien != 0){
        
        objectAncien.idLandInstance = idLandInstance;
        objectAncien.type = type;
        objectAncien.address = address;
        objectAncien.inventoryType = null;
        objectAncien.idItem = null;
        objectAncien.resourceType = 1;
        objectAncien.requiredQuantity = check[0].requiredAncien;
        objectAncien.quantityBefore = check[0].ancienBefore;
    }
    
    if(check[0].requiredWood != null && check[0].requiredWood != 0){
        
        objectWood.idLandInstance = idLandInstance;
        objectWood.type = type;
        objectWood.address = address;
        objectWood.inventoryType = null;
        objectWood.idItem = null;
        objectWood.resourceType = 2;
        objectWood.requiredQuantity = check[0].requiredWood;
        objectWood.quantityBefore = check[0].woodBefore;
    }
    
    if(check[0].requiredStone != null && check[0].requiredStone != 0){
        
        objectStone.idLandInstance = idLandInstance;
        objectStone.type = type;
        objectStone.address = address;
        objectStone.inventoryType = null;
        objectStone.idItem = null;
        objectStone.resourceType = 3;
        objectStone.requiredQuantity = check[0].requiredStone;
        objectStone.quantityBefore = check[0].stoneBefore;
    }

    
    let isUpgradable = check[0].isAncienAllowed && check[0].isWoodAllowed && check[0].isStoneAllowed
        if ( isUpgradable ) {
            for ( let requirement of check ) {
                if ( !requirement.isItemAllowed ) {
                    isUpgradable = false
                    break
                }
            }
        }
        if ( !isUpgradable ) {
            logger.error(`Error in checkrequirementsUpgradeLand: not enough resources to upgrade`);
            return res.json({
                success: false,
                error: "Error in checkRequirementsUpgradeNFT: not enough resources to upgrade"
            
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

    upgradeResources.ancien = check[0].requiredAncien
    upgradeResources.wood = check[0].requiredWood
    upgradeResources.stone = check[0].requiredStone

    logger.debug(`response getResources : ${JSON.stringify(resourcesResponse)} `);
    logger.debug(`UpgradeResources : ${JSON.stringify(upgradeResources)} `);

    resourcesResponse = BuildingsHelper.calculateNewResources(resourcesResponse, upgradeResources);
    resources = UserHelper.buildResourcesResponse(resourcesResponse);
    
    //pushing the resource objects in the upgradeObjects array
    if(check[0].requiredAncien != null && check[0].requiredAncien != 0){
        objectAncien.quantityAfter = resourcesResponse.ancien;
        upgradeObjects.push(objectAncien);
    }
    
    if(check[0].requiredWood != null && check[0].requiredWood != 0){
        objectWood.quantityAfter = resourcesResponse.wood;
        upgradeObjects.push(objectWood);
    }
    
    if(check[0].requiredStone != null && check[0].requiredStone != 0){
        objectStone.quantityAfter = resourcesResponse.stone;
        upgradeObjects.push(objectStone);
    }

    //da vedere l upgrade time
    //TODO
    if(resources.status){
        try {
            upgradeTime = await LandQueries.getUpgradeTime(land.idLand, land.level);
        } catch (error) {
            logger.error(`Error in LandQueries getUpgradeTime:${Utils.printErrorLog(error)}`);
            return res
            .json({
                success: false,
                error: error
            });
        }
        
        logger.debug(`consumables: ${consumableIds}`);
        logger.debug(`upgrade time before consumables: ${upgradeTime}`);

        //MOCK UP FOR CONSUMABLE_BUILDINGS
        for(let i = 0; i < consumableIds.length; i++ ){

            if(consumableIds[i] == 14){
                upgradeTime = upgradeTime - 218000; 
                logger.debug(`upgrade time in consumable=14: ${upgradeTime}`);
            }

            if(consumableIds[i] == 15){
                upgradeTime = upgradeTime - 60; 
                logger.debug(`upgrade time in consumable=15: ${upgradeTime}`);
            }
        }
        
        logger.debug(`upgrade time after consumables: ${upgradeTime}`);

        endingTime = await BuildingsHelper.createEndingTime(upgradeTime);

        try {
            response = await LandQueries.setUpgradeLand(idLandInstance, land.idLand, endingTime);
        } catch (error) {
            logger.error(`Error in BuildingsQueries setUpgradeLand:${Utils.printErrorLog(error)}`);
            return res
            .json({
                success: false,
                error: error
            });
    
        }

        logger.debug(`response getUpgradeTime : ${upgradeTime} `);
        logger.debug(`response createEndingTime : ${endingTime} `);
        logger.debug(`response setUpgrade : ${JSON.stringify(response)} `);

        if(response.affectedRows == 0){
            return res.json({
                success: false,
                error: "Conditional Update fails, not staked"

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
        
        for (let i=0; i<check.length ; i++) {

            let object = {};
            object.idLandInstance = idLandInstance;
            object.type = type;
            object.address = address;
            object.inventoryType = 'item';
            object.idItem = check[i].idItemReq;
            object.resourceType = null;
            object.requiredQuantity = check[i].requiredItemQuantity;
            object.quantityBefore = check[i].itemBefore;
            
            if(check[i].idItemInstance == null || check[i].idItemInstance == undefined ) continue

            try{
                await ItemQueries.subItemByIdItemInstance(check[i].idItemInstance, check[i].requiredItemQuantity)
            } catch (error){ 
                logger.error("Error in ItemQueries subItemByIdItemInstance: ", JSON.stringify(error));
                return res
                .json({
                    success: false,
                    error: error
                });
            }

            let remainQuantity
            try{
                remainQuantity = await ItemQueries.getQuantityByIdItemInstance(check[i].idItemInstance)
            } catch (error){ 
                logger.error("Error in ItemQueries getQuantityByIdItemInstance: ", JSON.stringify(error));
                return res
                .json({
                    success: false,
                    error: error
                });
            }
            
            object.quantityAfter = remainQuantity[0].quantity;
            upgradeObjects.push(object);

            if ( remainQuantity[0].quantity == 0 ) {
                try{
                    await ItemQueries.removeItemInstance(check[i].idItemInstance)
                } catch (error){ 
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


    //TODO the updated image and landUpgradehistory

    // upgradeSprite = BuildingsHelper.createImageSpriteUpgradeUrl(nft.type, nft.level);

    // try{
    //     upgradeResult = await InventoryQueries.setUpgradeBldHistory(upgradeObjects);
    // }catch(error){
    //     logger.error(`Error in InventoryQueries.setUpgradeBldHistory, error: ${Utils.printErrorLog(error)}`)
    // }

    // logger.debug(`setUpgradeBldHistory response : ${JSON.stringify(upgradeResult)}`)

    logger.info(`upgradeNFT response : ${
        JSON.stringify({
            resources: resources.resources,
            upgradeEndingTime: resources.upgradeEndingTime,
            // upgradeSprite
        })
    }`)
    logger.info('upgradeNFT END');

    return res.json({
        success: true,
        data: {
            resources: resources.resources,
            upgradeEndingTime: resources.upgradeEndingTime,
            //imageSprite: upgradeSprite
        }
    });
}

async function getTicketsOwner(req, res) {
    logger.info(`getTicketsOwner START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    
    let validation = LandValidation.getTicketsOwnerValidation(req)
        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    let idLandInstance = req.body.idLandInstance;

    logger.info(`getTicketsOwner request, address: ${address}, idLandInstance: ${idLandInstance}`);

    let resources;
    let land;
    let response;
    let upgradeObjects = [];
    let verify;
    try {
        verify = await LandQueries.getLandProperty(idLandInstance,address);
    } catch (error) {
        logger.error(`Error in LandQueries getLandProperty: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`veify: ${JSON.stringify(verify)}`)
    if(verify.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "You are not the owner of this land or it is not staked"
            }
        });
    }
    logger.debug(`verified: ${address} on idLandInstance: ${idLandInstance}`);


    let contract
    try{
        contract = await LandQueries.getActiveContractGivenIdLandInstance(idLandInstance);
    }catch(error){
        logger.error(`Error in LandQueries.getContract:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`response getContract : ${JSON.stringify(contract)} `);

    if(contract.length != 1){
        return res.json({
            success: false,
            error: "There is no contract established for this land"
            
        })
    }

    contract = contract[0]

    

    let allTickets
    try{
        allTickets = await LandQueries.getAllTicketsOwner(contract.idContract);
    }catch(error){
        logger.error(`Error in LandQueries.getAllTicketsOwner:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`response getAllTicketsOwner : ${JSON.stringify(allTickets)} `);
    
    if(allTickets.length == 0){
        return res.json({
            success: true,
            message: "There are no tickets for your contract",
            data: {
                generatedTickets: [],
                sellingTickets: [],
                otherTickets: []
            }
        })   
    }



    try {
        response = await LandService.allTicketsResponseBuilder(allTickets);
    } catch (error) {
        logger.error(`Error in LandService.allTicketsResponseBuilder:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`response allTicketsResponseBuilder : ${JSON.stringify(response)} `);

    logger.info('getTicketsOwner END');

    return res.json({
        success: true,
        data: {
            ...response
        }
    });
}

async function getAllTicketsUser(req, res) {
    logger.info(`getAllTicketsUser START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    
    
    
    let validation = LandValidation.getWorldValidation(req)
        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    let idWorld = req.body.idWorld;

    logger.info(`getAllTicketsUser request, address: ${address}`);

    let response;
    let verify; 

    try {
        response = await LandService.buildGetAllTicketsUserResponse(address,idWorld)
    } catch (error) {
        logger.error(`Error in LandService buildGetAllTicketsUserResponse: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    

    logger.debug(`response buildGetAllTicketsUserResponse : ${JSON.stringify(response)} `);

    logger.info('getAllTicketsUser END');

    return res.json({
        success: true,
        data: response
    });
}

async function createTickets(req, res) {
    logger.info(`createTickets START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    
    
    
    let validation = LandValidation.createTicketsValidation(req)
        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    let idLandInstance = req.body.idLandInstance;
    let idContract = req.body.idContract;
    let quantity = req.body.quantity;
    let type = req.body.type;

    logger.info(`createTickets request, address: ${address}, idLandInstance: ${idLandInstance}`);



    let response;
    let upgradeObjects = [];

    let verify;
    try {
        verify = await LandQueries.getLandProperty(idLandInstance,address);
    } catch (error) {
        logger.error(`Error in LandQueries getLandProperty: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`verify: ${JSON.stringify(verify)}`)
    if(verify.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "You are not the owner of this land or it is not staked"
            }
        });
    }
    verify = verify[0];
    logger.debug(`verified: ${address} on idLandInstance: ${idLandInstance}`);


    let contract
    try{
        contract = await LandQueries.getContractGivenIdContract(idLandInstance, address, idContract);
    }catch(error){
        logger.error(`Error in LandQueries.getContractGivenIdContract:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`response getContractGivenIdContract : ${JSON.stringify(contract)} `);

    if(contract.length != 1){
        return res.json({
            success: false,
            error: "There is no contract established for this land, no contract at all or the contract Status isn't active"
        })
    }

    contract = contract[0]

    //check if i can generate the quantity 
    let maxSpot;
    try{
        maxSpot = await LandQueries.getMaxSpotGivenIdLandInstance(idLandInstance);
    }catch(error){
        logger.error(`Error in LandQueries.getMaxSpotGivenIdLandInstance:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`maxSpot response : ${JSON.stringify(maxSpot)}`)

    logger.debug(`maxSpot : ${JSON.stringify(maxSpot)}, generated tickets: ${contract.quantityGenerated}, craftable tickets:${((maxSpot.maxSpot)-contract.quantityGenerated)}`);
    if(quantity>((maxSpot.maxSpot)-contract.quantityGenerated)){
        return res.json({
            success: false,
            error: "You can't create more tickets than the number of spots on your land"
        })
    }


    let update
    try{
        update = await LandQueries.updateTicketCreated(idContract,quantity);
    }catch(error){
        logger.error(`Error in LandQueries.updateTicketCreated:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`updateTicketCreated response : ${JSON.stringify(update)}`);



    let createdTickets
    try {
        createdTickets = await LandQueries.insertNewTickets(idContract,quantity,type,address);
    } catch (error) {
        logger.error(`Error in LandService.insertNewTickets:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`response insertNewTickets : ${JSON.stringify(createdTickets)} `);


    let allTickets
    try{
        allTickets = await LandQueries.getAllTicketsOwner(idContract);
    }catch(error){
        logger.error(`Error in LandQueries.getAllTicketsOwner:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`response getAllTicketsOwner : ${JSON.stringify(allTickets)} `);

    try {
        response = await LandService.allTicketsResponseBuilder(allTickets);
    } catch (error) {
        logger.error(`Error in LandService.allTicketsResponseBuilder:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`response allTicketsResponseBuilder : ${JSON.stringify(response)} `);

    logger.info('createTickets END');

    return res.json({
        success: true,
        data: {
            ...response
        }
    });
}

async function createListingTicket(req, res) {
    logger.info(`createTicketListing START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    

    
    let validation = LandValidation.createTicketListingValidation(req)

        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    let idTicket = req.body.idTicket;
    let price = req.body.price;
    let durationMilliSec,now,creationTime,endingTime,finalListing,response,ticket

    price = parseFloat(price);
    //duration = parseInt(duration);


    logger.info(`createTicketListing request, address: ${address}, diTicket: ${idTicket}`);



    //verify if the user owns the ticket and its status is generated
    try {
        ticket = await LandQueries.getTicketGivenIdTicket(idTicket,address);
    } catch (error) {
        logger.error(`Error in LandQueries verifySaleableTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`ticket info : ${JSON.stringify(ticket)}`);

    if(ticket.length != 1){

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "You dont own this ticket"
            }
        });
    }

    ticket = ticket [0]

    if(ticket.status != 'generated'){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "You can't sell a ticket that is not in your inventory"
            }
        });
    }
    
    //check if there is a contract defined for the ticket and if the contract is on a staked land
    let verify;
    try {
        verify = await LandQueries.verifySaleableTicket(idTicket,address);
    } catch (error) {
        logger.error(`Error in LandQueries verifySaleableTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`verify: ${JSON.stringify(verify)}`)
    if(verify.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "To sell a ticket you must have a valid contract on a staked land "
            }
        });
    }
    verify = verify[0];
    logger.debug(`verified: ${address} on idTicket: ${idTicket}`);





    



    creationTime = new Date().toISOString();
    endingTime = verify.endingTime ;

    logger.debug(`creationTime: ${creationTime}, endingTime: ${endingTime}`);


    let listing
    try{
        listing = await LandQueries.createListing(idTicket, price, creationTime, endingTime);
    }catch(error){
        logger.error(`Error in LandQueries.createListing:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`response createListing : ${JSON.stringify(listing)} `);




    //Update the ticket address to market address and change status from generated to onSale
    try{
        response = await LandQueries.updateTicketSellingStatus(idTicket,address);
    }catch(error){
        logger.error(`Error in LandQueries.ticketSellingStatus:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`updateTicketSellingStatus response : ${JSON.stringify(response)}`)


    try{
        response = await LandQueries.getSellingTicket(idTicket);
    }catch(error){
        logger.error(`Error in LandQueries.getSellingTicket:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    if(response.length != 1){
        return res.json({
            success:false,
            error:"Error getting the ticket on the marketplace"
            
        })
    }




    logger.info('createTicketListing END');

    return res.json({
        success: true,
        data: {
        }
    });
}

async function removeListingTicket(req, res) {
    logger.info(`removeListingTicket START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    
    let validation = LandValidation.removeListingTicketValidation(req)
        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    let idTicket = req.body.idTicket;
    let idTicketMarketplace = req.body.idTicketMarketplace;

    logger.info(`removeListingTicket request, address: ${address}, idTicket: ${idTicket}, idTicketMarketplace: ${idTicketMarketplace}`);

    let response;
    let upgradeObjects = [];

    let verify;
    try {
        verify = await LandQueries.getLandPropertyGivenIdTicket(idTicket, address, idTicketMarketplace);
    } catch (error) {
        logger.error(`Error in LandQueries getLandPropertyGivenIdTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`verify: ${JSON.stringify(verify)}`)
    if(verify.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Not the owner of the land || Land not staked || Ticket is deleted, does not exist"
            }
        });
    }
    
    logger.debug(`verified: ${address} on idTicket: ${idTicket}`);

    let removeMarketplace;
    try{
        removeMarketplace = await LandQueries.removeIdTicketMarketplace(idTicketMarketplace, idTicket, address);
    }catch(error){
        logger.error(`Error in LandQueries removeIdTicketMarketplace:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`removeIdTicketMarketplace response : ${JSON.stringify(removeMarketplace)}`);

    let updateTicket;
    try{
        updateTicket = await LandQueries.updateTicket(idTicket, address);
    }catch(error){
        logger.error(`Error in LandQueries updateTicket:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`updateTicket response : ${JSON.stringify(updateTicket)}`);


    let ticket
    try{
        ticket = await LandQueries.getTicket(idTicket, address);
    }catch(error){
        logger.error(`Error in LandQueries getTicket:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`response getTicket : ${JSON.stringify(ticket)} `);

    logger.info('removeListingTicket END');

    return res.json({
        success: true,
        data: {
        }
    });
}

async function createContract(req,res){
    logger.info(`createContract START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    
    let validation = LandValidation.createContractValidation(req)
        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let creation = true;
    let address = req.locals.address;
    let idLandInstance = req.body.idLandInstance;
    let duration = req.body.duration;
    let fee = req.body.fee;
    let isPrivate = req.body.isPrivate;

    logger.info(`createContract request, address: ${address}, idLandInstance: ${idLandInstance}, duration: ${duration}`);

    let response;
    
    //verify the land property
    let verify;
    try {
        verify = await LandQueries.getLandProperty(idLandInstance, address);
    } catch (error) {
        logger.error(`Error in LandQueries getLandProperty: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`verify: ${JSON.stringify(verify)}`)
    if(verify.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Not the owner of the land || Land not staked "
            }
        });
    }
    verify = verify[0];
    logger.debug(`verified: ${address} on idLandInstance: ${idLandInstance}`);

    //there should be no active contract when we create one
    let activeContract;
    try{
        activeContract = await LandQueries.getLandContractGivenIdLandInstance(idLandInstance,'active');
    }catch(error){
        logger.error(`Error in LandQueries getLandContractGivenIdLandInstance:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`getActiveContract response : ${JSON.stringify(activeContract)}`)

    if(activeContract.length != 0){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "You already have an active contract"
            }
        });
    }

    //there should be no created contract when we create one
    let createdContract;
    try{
        createdContract = await LandQueries.getLandContractGivenIdLandInstance(idLandInstance,'created');
    }catch(error){
        logger.error(`Error in LandQueries getLandContractGivenIdLandInstance:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`getLandContractGivenIdLandInstance response : ${JSON.stringify(createdContract)}`)

    if(createdContract.length != 0){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "You already have a created contract"
            }
        });
    }

    //there should be no pending contract while we create a new one
    let pendingContract;
    try{
        pendingContract = await LandQueries.getLandContractGivenIdLandInstance(idLandInstance,'pending');
    }catch(error){
        logger.error(`Error in LandQueries getLandContractGivenIdLandInstance:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`getLandContractGivenIdLandInstance response : ${JSON.stringify(pendingContract)}`)

    if(pendingContract.length != 0){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "You need to delete your contract before creating another one"
            }
        });
    }



    try {
		response = await LandQueries.getCreatedContractVoucherCreation(address);
	} catch (error) {
		logger.error(`Error in LandQueries getCreatedContractVoucherCreation:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
	}
	logger.debug(`response getCreatedContractVoucherCreation: ${JSON.stringify(response)}`);
	if(response == undefined || response == null || response.length > 0){
		return res
		.json({
			success: false,
			error: "Voucher already created and not minted"
			
		});
	}
	logger.debug(`response getCreatedContractVoucherCreation: ${JSON.stringify(response)}`);

    let durationMilliSec,now,creationTime,endingTime

    durationMilliSec = duration * 1000;
        
    now = new Date().getTime();

    let ending = now + durationMilliSec;

    creationTime = new Date().toISOString();
    endingTime = new Date(ending).toISOString();

    logger.debug(`durationMillisec: ${durationMilliSec}, now: ${now}, ending: ${ending}, creationTime: ${creationTime}, endingTime: ${endingTime}`);


    let newContract
    try {
		newContract = await LandQueries.createNewContract(address,idLandInstance,fee,creationTime,endingTime,isPrivate);
	} catch (error) {
		logger.error(`Error in LandQueries.getCreatedContractVoucher:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
	}

    logger.debug(`response createNewContract : ${JSON.stringify(newContract)}`);

    if(newContract.affectedRows != 1){
		return res
		.json({
			success: false,
			error:  "affectedRows not one"
			
		});
	}


	idContract = newContract.insertId;

    let update
    try {
		update = await LandQueries.insertContractIntoLand(idLandInstance,idContract)
	} catch (error) {
		logger.error(`Error in LandQueries.insertContractIntoLand:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
	}

    let finalTime = parseInt((new Date(endingTime)).getTime()/1000)
    
    let final
    try {
		final = await VoucherService.createLandVoucher(address,idContract,creation,finalTime,fee)
	} catch (error) {
		logger.error(`Error in VoucherService createLandVoucher:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
	}

    logger.debug(`createContract final response : ${JSON.stringify(final)}`)
    logger.debug(`createContract END`);
    return res.json({
        success: true,
        data: {
            ...final,
            idLand:verify.idLandInstance
        }
    });
  
}

async function deleteContract(req,res){
    logger.info(`deleteContract START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    
    let validation = LandValidation.deleteContractValidation(req)
        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let creation = false;
    let address = req.locals.address;
    let idLandInstance = req.body.idLandInstance;
    let idContract = req.body.idContract;

    logger.info(`deleteContract request, address: ${address}, idLandInstance: ${idLandInstance}, idContract: ${idContract}`);

    let response;

    let verify;
    try {
        verify = await LandQueries.getLandProperty(idLandInstance, address);
    } catch (error) {
        logger.error(`Error in LandQueries getLandProperty: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`verify: ${JSON.stringify(verify)}`)
    if(verify.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Not the owner of the land || Land not staked "
            }
        });
    }
    verify = verify[0];
    logger.debug(`verified: ${address} on idLandInstance: ${idLandInstance}`);

    let contract;
    try{
        contract = await LandQueries.getContractProperty(address,idContract);
    }catch(error){
        logger.error(`Error in LandQueries getContractProperty:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`getContractProperty response : ${JSON.stringify(contract)}`)



    if(contract.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "You don't own this contract"
            }
        });
    }

    contract = contract[0]

    if(contract.contractStatus != 'active'){
        if(contract.contractStatus != 'created'){
            if(contract.contractStatus == 'pending'){
                try {
                    response = await LandQueries.getCreatedContractVoucherDelete(address,idContract);
                } catch (error) {
                    logger.error(`Error in LandQueries.getCreatedContractVoucherDelete:${Utils.printErrorLog(error)}`);
                    return res
                    .json({
                        success: false,
                        error: error
                    });
                }
                logger.debug(`getCreatedContractVoucherDelete response: ${JSON.stringify(response)}`)
                response = response[0]
                return res.json({
                    success: true,
                    data: {
                        ...response
                    }
                });

            }else{
                return res
                .status(401)
                .json({
                success: false,
                error: {
                    errorMessage: "You cannot delete deleted contracts"
                    }
                }); 
            }


        }
        return res
		.json({
			success: false,
			error:  "You must sign a contract before deleting it"
			
		});
        
    }

    try {
		response = await LandQueries.getCreatedContractVoucherDelete(address,idContract);
	} catch (error) {
		logger.error(`Error in LandQueries.getCreatedContractVoucherDelete:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
	}
    //MUST BE RETURNED TE VOUCHER TO SIGN
	logger.debug(`response getCreatedContractVoucherDelete: ${JSON.stringify(response)}`);
	if(response?.length > 0){
        response = response[0];

        let responseVoucher = {
            idContract: response.idContract,
            owner: address,
            blockNumber: response.blockNumber,
            creation: response.creation,
            expireTime: response.expireTime,
            fee: response.fee,
            signature: response.signature,
            idLand: idLandInstance
        };

		return res
		.json({
			success: true,
            data:{
                ...responseVoucher
            }
			
		});
	}

    let allTickets
    try {
		allTickets = await LandQueries.getAllTicketsOwner(idContract);
	} catch (error) {
		logger.error(`Error in LandQueries.getAllTicketsOwner:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
	}

    logger.debug(`getAlltickets response : ${JSON.stringify(allTickets)}`)

    verify = LandService.deleteContractTicketVerify(allTickets)

    if(!verify){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "All the tickets related to the contract must be expired or you must be the owner "
            }
        });
    }

    let guests
    try {
		guests = await LandQueries.getLandGuestsGivenIdLandInstance(idLandInstance);
	} catch (error) {
		logger.error(`Error in LandQueries.getLandGuestsGivenIdLandInstance:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
	}

    if (guests.length != 0 ){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "There must be no guests on a land to delete a contract"
            }
        }); 
    }


    let deletedContract
    try {
		deletedContract = await LandQueries.deleteContract(address,idLandInstance,idContract);
	} catch (error) {
		logger.error(`Error in LandQueries.deleteContract:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
	}

    logger.debug(`response deleteContract : ${JSON.stringify(deletedContract)}`);

    if(deletedContract.affectedRows != 1){
		return res
		.json({
			success: false,
			error: {
				errorMessage: "affectedRows not one"
			}
		});
	}


    let pendingContract
    try {
		pendingContract = await LandQueries.getContractProperty(address,idContract);
	} catch (error) {
		logger.error(`Error in LandQueries.getContractProperty:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
	}

    logger.debug(`getPending contract response : ${JSON.stringify(pendingContract)}`)

    pendingContract = pendingContract [0];

    let finalTime = parseInt((new Date(pendingContract.endingTime)).getTime()/1000);

    //land voucher for deleting a contract\
    
    let final
    try {
		//expireTime and fee must be 0 when deleting a contract
		final = await VoucherService.createLandVoucher(address,idContract,creation,/* pendingContract.endingTime */0,0)
	} catch (error) {
		logger.error(`Error in VoucherService.createLandVoucher:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
	}

    logger.debug(`deleteContract final response : ${JSON.stringify(final)}`)
    logger.debug(`deleteContract END`);
    return res.json({
        success: true,
        data: {
            ...final
        }
    });
  
}

async function getTicketMarketplace(req, res) {
    logger.info(`getTicketMarketplace START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.getTicketMarketplaceValidation(req)
    if(!validation.success){
        return res
        .status(401)
        .json(validation)
    }

    let address = req.locals.address;
    let idLandInstance = req.body.idLandInstance;
    logger.info(`getTicketMarketplace request, address: ${address}, idLandInstance: ${idLandInstance}`);

    // CHECK IF THE USER HAS ALREADY BOUGHT THE TICKET
    let hasTicket
    try {
        hasTicket = await LandQueries.checkIfHasBoughtTicket(idLandInstance, address);
    } catch (error) {
        logger.error(`Error in LandQueries checkIfHasBoughtTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`checkIfHasBoughtTicket info : ${JSON.stringify(hasTicket)}`);
    if ( hasTicket.length != 0 ) {
        // price = 0 if the ticket is free ticket.
        let ticketContract = JSON.parse(JSON.stringify(hasTicket[0]))
        ticketContract.price = ticketContract.ticketType == 'free' ? 0 : ticketContract.price;

        return res
        .json({
            success: true,
            data: {
                hasBought: true,
                data: ticketContract
            }
        });
    }

    //get tickets in marketplace
    let tickets;
    try {
        tickets = await LandQueries.getSellingAndPublicTicket(idLandInstance, address);
    } catch (error) {
        logger.error(`Error in LandQueries getSellingAndPublicTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`getSellingAndPublicTicket info : ${JSON.stringify(tickets)}`);

    if(tickets.length < 1){
        return res
        .json({
            success: true,
            data: {
                hasBought: false,
                data: []
            }
        });
    }

    let finalListing = [];
    finalListing = LandService.buildGetTicketMarketplace(tickets);

    logger.info('getTicketMarketplace END');
    return res
    .json({
        success: true,
        data: {
            hasBought: false,
            data: finalListing
        }
    });
}

async function buyTicketMarketplace(req, res) {
    logger.info(`buyTicketMarketplace START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.buyTicketMarketplaceValidation(req)

        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    let idTicket = req.body.idTicket;
    let checkArray, checkTickets, check, updateStatus, subAncien, addAncien;
    logger.info(`buyTicketMarketplace request, address: ${address}, idTicket: ${idTicket}`);

    //check if ticket is active, toShow, paid, etc
    //if address has enough resources checkReq.checkReq = ticket price, else -1
    try {
        checkArray = await LandQueries.checkRequirementsTicket(idTicket, address);
    } catch (error) {
        logger.error(`Error in LandQueries checkRequirementsTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    check = checkArray[0];
    logger.debug(`checkRequirementsTicket info : ${JSON.stringify(check)}`);

    if(checkArray.length != 1){
        return res
        .json({
            success: false,
            error: "The ticket is no more buyable"
            
        });
    } else if (check.ownerAddress == address){
        return res
        .json({
            success: false,
            error: "You are the owner of the ticket"
            
        });
    } else if (check.checkReq == -1){
        return res
        .json({
            success: false,
            error: "You don't have enough anciens to buy the ticket"
        });
    }
    let idContract = check.idContract;
    
    let guest
    try {
        guest = await LandQueries.checkSubscription(address);
    } catch (error) {
        logger.error(`Error in LandQueries checkExistenceTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    if(guest.length != 0){
        return res
        .json({
            success: false,
            error: "You are already a land guest"
            
        });
    }
    
    //check if address owns another ticket for the same contract


    try {
        checkTickets = await LandQueries.checkTicketOwnership(address);
    } catch (error) {
        logger.error(`Error in LandQueries checkExistenceTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    if(checkTickets.length != 0){
        return res
        .json({
            success: false,
            error: "You already own a ticket"
            
        });
    }

       //check if address owns another ticket 


       try {
        checkTickets = await LandQueries.getTicketsGivenAddress(idContract, address);
    } catch (error) {
        logger.error(`Error in LandQueries checkExistenceTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    if(checkTickets.length != 0){
        return res
        .json({
            success: false,
            error: "You already own a ticket for this land"
            
        });
    }

    //update ad in ticket_marketplace of saleTime, marketStatus
    try {
        updateStatus = await LandQueries.updateBuyTicketMarketpalceStatus(idTicket);
    } catch (error) {
        logger.error(`Error in LandQueries updateBuyTicketMarketpalceStatus: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`updateBuyTicketMarketpalceStatus info : ${JSON.stringify(updateStatus)}`);

    //update ticket in land_ticket of status, address, idMenu
    try {
        updateStatus = await LandQueries.updateBuyLandTicketStatus(idTicket, address);
    } catch (error) {
        logger.error(`Error in LandQueries updateBuyLandTicketStatus: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`updateBuyLandTicketStatus info : ${JSON.stringify(updateStatus)}`);

    //sub ancien from address
    try {
        subAncien = await UserQueries.subAncien(address, check.checkReq);
    } catch (error) {
        logger.error(`Error in UserQueries subAncien: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`subAncien info : ${JSON.stringify(subAncien)}`);

    //add ancien to ownerAddress
    try {
        addAncien = await UserQueries.addAncien(check.ownerAddress, check.checkReq);
    } catch (error) {
        logger.error(`Error in UserQueries addAncien: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`addAncien info : ${JSON.stringify(addAncien)}`);



    logger.info('buyTicketMarketplace END');

    return res.json({
        success: true,
        data: {
            ticket: idTicket
        }
    });
}

async function getLandGuest(req, res) {
    logger.info(`getLandGuest START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.getLandGuestValidation(req)

        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    let idLandInstance = req.body.idLandInstance;

    logger.info(`getLandGuest request, address: ${address}, idLandInstance: ${idLandInstance}`);

    //check if the contract is still active
    let check;   
    try {
        check = await LandQueries.activeContractCheck(idLandInstance);
    } catch (error) {
        logger.error(`Error in LandQueries activeContractCheck: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`activeContractCheck info : ${JSON.stringify(check)}`);

    if(check.length != 0){
        check = check[0];
        if(check.expired){
            let expired;   
            try {
                expired = await LandQueries.setContractExpired(check.idContract);
            } catch (error) {
                logger.error(`Error in LandQueries setContractExpired: ${Utils.printErrorLog(error)}`);
                return res
                .json({
                    success: false,
                    error: error
                });
            }
            logger.debug(`setContractExpired info : ${JSON.stringify(expired)}`);

            let kick
            try {
                kick = await LandQueries.kickAllGuests(check.idContract);
            } catch (error) {
                logger.error(`Error in LandQueries kickAllGuests: ${Utils.printErrorLog(error)}`);
                return res
                .json({
                    success: false,
                    error: error
                });
            }
            logger.debug(`kickAllGuests info : ${JSON.stringify(expired)}`);
        }

    }


    //get land isPrivate for check + get needed data from guests 
    let guests;   
    try {
        guests = await LandQueries.getLandGuests(idLandInstance, address);
    } catch (error) {
        logger.error(`Error in LandQueries getLandGuests: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`getLandGuests info : ${JSON.stringify(guests)}`);
    
    if(guests.length < 1){

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "No land guests for idLandInstance || idLandInstance doesn't exist"
            }
        });
    }
    if(guests[0].isPrivate == 1){
        for(let i = 0; i<guests.length; i++){
            if(guests[i].address == address){
                break;
            } else {
                return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: "The Land is private and address is not a guest"
                    }
                });
            }
        }
    }

    let finalResponse = [];

    finalResponse = LandService.buildGuestsResponse(guests);
    logger.info('getLandGuest END');

    return res.json({
        success: true,
        cities: [
            ...finalResponse
        ]
    });
}

async function guestCheck(req, res) {
    logger.info(`guestCheck START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.guestCheckValidation(req)

        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    logger.info(`guestCheck request, address: ${address}`);
    let hasOwnLand = false , hasHome = false


    let idLand;   
    try {
        idLand = await LandQueries.getLandInstanceGivenAddress(address);
    } catch (error) {
        logger.error(`Error in LandQueries getLandInstanceGivenAddress: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`getLandInstanceGivenAddress info : ${JSON.stringify(idLand)}`);

    let owner;   
    try {
        owner = await LandQueries.getOwnedLands(address);
    } catch (error) {
        logger.error(`Error in LandQueries getOwnedLands: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    logger.debug(`getOwnedLands info : ${JSON.stringify(owner)}`);
    
    if(idLand.length != 0 ) hasHome = 1
    if(owner.length !=0 ) hasOwnLand = 1
    

    logger.info(`guestChekc END`)

    return res.json({
        success: true,
        data: {
            hasHome:hasHome,
            hasOwnLand:hasOwnLand
        }
    });
    
}

async function getContractOwner(req, res) {
    logger.info(`getContractOwner START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.getContractOwnerValidation(req)

        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    let idLandInstance = req.body.idLandInstance;

    logger.info(`getContractOwner request, address: ${address}, idLandInstance: ${idLandInstance}`);

    //verify the land property
    let verify;
    try {
        verify = await LandQueries.getLandProperty(idLandInstance, address);
    } catch (error) {
        logger.error(`Error in LandQueries getLandProperty: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`verify: ${JSON.stringify(verify)}`)
    if(verify.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Not the owner of the land || Land not staked "
            }
        });
    }
    verify = verify[0];
    logger.debug(`verified: ${address} on idLandInstance: ${idLandInstance}`);


    let contract;
    try {
        contract = await LandQueries.getValuableContract(idLandInstance, address);
    } catch (error) {
        logger.error(`Error in LandQueries getValuableContract: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`contract response ${JSON.stringify(contract)}`)

    if(contract.length > 1){
        logger.warn(`This user has more than one valuable contract`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Error , you have more than one contract in a certain state"
            }
        });
    }else if(contract.length == 0){
        return res
        .status(200)
        .json({
            success: true,
            data : {}
        });
    }

    contract = contract[0]

    let response 

    try {
        response = await LandService.buildGetContractOwnerResponse(contract,address,idLandInstance)
    } catch (error) {
        logger.error(`Error in LandService buildGetContractOwnerResponse: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    
    logger.debug(`getContractOwner response: ${JSON.stringify(response)}`);
    
    logger.info('getContractOwner END');

    return res.json({
        success: true,
        data: {
            ...response
        }
    });
}

async function getInstanceTicket(req, res) {
    logger.info(`getInstanceTicket START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.getInstanceTicketValidation(req)

        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    let idTicket = req.body.idTicket;

    logger.info(`getInstanceTicket request, address: ${address}, idTicket: ${idTicket}`);

    let ownedTicket;   
    try {
        ownedTicket = await LandQueries.getTicketGivenAddress(idTicket, address);
    } catch (error) {
        logger.error(`Error in LandQueries getTicketGivenAddress: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`getTicketGivenAddress info : ${JSON.stringify(ownedTicket)}`);
    
    if(ownedTicket.length < 1){

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "You do not own idTicket || idTicket does not exist"
            }
        });
    }

    let response;

    response = LandService.buildGetTicket(ownedTicket[0]);
    
    logger.debug(`buildGetTicket info: ${JSON.stringify(response)}`);

    response = response [0];

    let ticketState;   
    try {
        ticketState = await LandQueries.getTicketState(idTicket);
    } catch (error) {
        logger.error(`Error in LandQueries getTicketState: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    if ( ticketState.address != address ) {
        response.subscribe = (ticketState.status != "used");
    }


    logger.info('getInstanceTicket END');

    return res.json({
        success: true,
        data: {
            ticket: response
        }
    });
}

async function subscribeTicket(req, res) {
    logger.info(`subscribeTicket START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.subscribeTicketValidation(req)
        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    let idTicket = req.body.idTicket;
    let isVisitable = req.body.isVisitable;
    let newPosition = 0 ;

    let awaitingCheckValidityTicket = LandQueries.checkValidityTicket(idTicket);
    let awaitingCheckSubscription = LandQueries.checkSubscription(address);
    let awaitingGetTicketInfoGivenIdTicket = LandQueries.getTicketInfoGivenIdTicket(idTicket, address);


    logger.info(`subscribeTicket request, address: ${address}, idTicket: ${idTicket}`);

    //check ticket validity and contract status
    let checkValidity;
    try {
        checkValidity = await awaitingCheckValidityTicket;
    } catch (error) {
        logger.error(`Error in LandQueries checkValidityTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`checkValidityTicket info : ${JSON.stringify(checkValidity)}`);
    if(checkValidity.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Ticket not valid || Contract not active"
            }
        });
    }

    //check address doesn't have other subscriptions
    let checkSub;
    try {
        checkSub = await awaitingCheckSubscription;
    } catch (error) {
        logger.error(`Error in LandQueries checkSubscription: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`checkSubscription info : ${JSON.stringify(checkSub)}`);
    if(checkSub.length != 0){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Address already in land_guest"
            }
        });
    }

    //check address owns ticket
    let checkOwnership;   
    try {
        checkOwnership = await awaitingGetTicketInfoGivenIdTicket;
    } catch (error) {
        logger.error(`Error in LandQueries getTicketInfoGivenIdTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`getTicketInfoGivenIdTicket info : ${JSON.stringify(checkOwnership)}`);
    if(checkOwnership.length < 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "You do not own idTicket || idTicket does not exist"
            }
        });
    }
    checkOwnership = checkOwnership[0];

    //check if ticket has been bought (has status == sent)
    if(checkOwnership.status != 'sent'){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "You can't subscribe to the ticket"
            }
        });
    }

    let idContract = checkOwnership.idContract;
    let fee = checkOwnership.fee;
    let spotOccupied = checkOwnership.spotOccupied;
    let idLandInstance = checkOwnership.idLandInstance;
    let type = checkOwnership.type;

    let allGuests
    try {
        allGuests = await LandQueries.getLandGuests(idLandInstance);
    } catch (error) {
        logger.error(`Error in LandQueries getLandGuests: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`getLandGuests info : ${JSON.stringify(allGuests)}`);

    let found
    while(!found){
        if(LandService.isPositionUsed(allGuests, newPosition)){
            newPosition++;
        }else{
            found = true;
        }
    }
    
    //check ticket type
    if(type == 'free'){
        let updateGuest, updateLand, updateTicket; 

        try {
            updateGuest = await LandQueries.createLandGuest(address, idContract, isVisitable, type, newPosition);
        } catch (error) {
            logger.error(`Error in LandQueries createLandGuest: ${Utils.printErrorLog(error)}`);
            return res
            .json({
                success: false,
                error: error
            });
        }
        logger.debug(`createLandGuest info : ${JSON.stringify(updateGuest)}`);
        
        try {
            updateLand = await LandQueries.updateLandInstanceSpot(spotOccupied + 1, idLandInstance);
        } catch (error) {
            logger.error(`Error in LandQueries updateLandInstanceSpot: ${Utils.printErrorLog(error)}`);
            return res
            .json({
                success: false,
                error: error
            });
        }
        logger.debug(`updateLandInstanceSpot info : ${JSON.stringify(updateLand)}`);

        try {
            updateTicket = await LandQueries.updateTicketStatus('used', idTicket);
        } catch (error) {
            logger.error(`Error in LandQueries updateTicketStatus: ${Utils.printErrorLog(error)}`);
            return res
            .json({
                success: false,
                error: error
            });
        }
        logger.debug(`updateTicketStatus info : ${JSON.stringify(updateTicket)}`);

        logger.info('subscribeTicket END');
        return res.json({
            success: true,
            data: {
                
            }
        });

    } else if(type == 'paid'){
        let updateGuest, updateLand, updateTicket; 




        try {
            updateGuest = await LandQueries.createLandGuest(address, idContract, isVisitable, type, newPosition);
        } catch (error) {
            logger.error(`Error in LandQueries createLandGuest: ${Utils.printErrorLog(error)}`);
            return res
            .json({
                success: false,
                error: error
            });
        }
        logger.debug(`createLandGuest info : ${JSON.stringify(updateGuest)}`);
        
        try {
            updateLand = await LandQueries.updateLandInstanceSpot(spotOccupied + 1, idLandInstance);
        } catch (error) {
            logger.error(`Error in LandQueries updateLandInstanceSpot: ${Utils.printErrorLog(error)}`);
            return res
            .json({
                success: false,
                error: error
            });
        }
        logger.debug(`updateLandInstanceSpot info : ${JSON.stringify(updateLand)}`);

        try {
            updateTicket = await LandQueries.updateTicketStatus('used', idTicket);
        } catch (error) {
            logger.error(`Error in LandQueries updateTicketStatus: ${Utils.printErrorLog(error)}`);
            return res
            .json({
                success: false,
                error: error
            });
        }
        logger.debug(`updateTicketStatus info : ${JSON.stringify(updateTicket)}`);

        logger.info('subscribeTicket END');
        return res.json({
            success: true,
            data: {
            }
        });
    }

}

async function unsubscribeTicket(req, res) {
    logger.info(`unsubscribeTicket START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.unsubscribeTicketValidation(req)

        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    let idTicket = req.body.idTicket;

    logger.info(`unsubscribeTicket request, address: ${address}, idTicket: ${idTicket}`);

    let subscription;
    try {
        subscription = await LandQueries.checkTicketSubscription(address, idTicket, 'used');
    } catch (error) {
        logger.error(`Error in LandQueries checkTicketSubscription: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`checkTicketSubscription info : ${JSON.stringify(subscription)}`); 
    
    if(subscription.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "The address is not subscribed || The subscription is not valid"
            }
        });
    }

    let ownerAddress = subscription[0].ownerAddress;
    let spotOccupied = subscription[0].spotOccupied;
    let idLandInstance = subscription[0].idLandInstance;
    let type = subscription[0].type;

    //delete instance in land_guest
    let deleteLandGuest;
    try {
        deleteLandGuest = await LandQueries.deleteLandGuest(address);
    } catch (error) {
        logger.error(`Error in LandQueries deleteLandGuest: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`deleteLandGuest info : ${JSON.stringify(deleteLandGuest)}`); 

    //update status and address in land_ticket
    let updateTicket;
    try {
        updateTicket = await LandQueries.updateTicketStatusAndAddress('generated', idTicket, ownerAddress, type);
    } catch (error) {
        logger.error(`Error in LandQueries updateTicketStatusAndAddress: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`updateTicketStatusAndAddress info : ${JSON.stringify(updateTicket)}`);

    //update spotOccupied in land_instance
    let updateLand;
    try {
        updateLand = await LandQueries.updateLandInstanceSpot(spotOccupied - 1, idLandInstance);
    } catch (error) {
        logger.error(`Error in LandQueries updateLandInstanceSpot: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`updateLandInstanceSpot info : ${JSON.stringify(updateLand)}`);

    logger.info('unsubscribeTicket END');
    return res.json({
        success: true
    });
    

}

async function getCity(req, res) {
    logger.info(`getCity START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.getAccountCityValidation(req)

        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    let idGuest = req.body.idGuest;

    logger.info(`getAccountCity request, address: ${address}, idGuest: ${idGuest}`);

    let guest;
    try {
        guest = await LandQueries.getGuestGivenIdGuest(idGuest);
    } catch (error) {
        logger.error(`Error in LandQueries getGuestGivenIdGuest: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`getGuestGivenIdGuest response : ${JSON.stringify(guest)}`); 

    if(guest.length != 1){

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "The guest does not exist"
            }
        });
    }

    guest = guest[0]
    
    if(!guest.isVisitable){
        return res
        .status(200)
        .json({
            success: true,
            data:{
                message:`The user's city is private`
            }
        });
    }
    let home;
    if(guest.address == address) home = 1
    else home = 0 

    logger.debug(`guest address : ${guest.address}`)
    let cityInfo
    try {
        cityInfo = await LandQueries.getOwnerInfo(guest.address);
    } catch (error) {
        logger.error(`Error in LandQueries getOwnerInfo: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`city profile info response :${cityInfo}`)

    if(cityInfo.length != 1 ){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "The guest account does not exist"
            }
        });
    }
    cityInfo = cityInfo[0]


    //start procedure to get city data 
    let cityRaw;
    try {
        cityRaw = await LandQueries.getCityProcedure(guest.address);
    } catch (error) {
        logger.error(`Error in LandQueries getCityProcedure: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`getCityProcedure response : ${JSON.stringify(cityRaw)}`); 

    cityRaw = cityRaw[0]



    //update spotOccupied in land_instance
    let response;

    response = LandService.cityResponseBuidler(cityRaw,guest,cityInfo,home)


    logger.debug(`getCity response : ${JSON.stringify(response)}`);

    logger.info('getCity END');
    return res.json({
        success: true,
        data:{
            ...response
        }
    });
    

}

async function sendTicket(req, res) {
    logger.info(`sendTicket START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.sendTicketValidation(req)

        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let addressSender =  req.locals.address;
    let addressReceiver = req.body.receiver;
    let idTicket = req.body.idTicket;

    logger.info(`sendTicket request, addressSender: ${addressSender}, addressReceiver: ${addressReceiver}, idTicket: ${idTicket}`);

    //check ticket is free, generated and still owned by the contract owner
    let checkTicket;
    try {
        checkTicket = await LandQueries.checkValidityFreeTicket(idTicket, addressSender);
    } catch (error) {
        logger.error(`Error in LandQueries checkValidityFreeTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`checkValidityFreeTicket info : ${JSON.stringify(checkTicket[0])}`);
    if(checkTicket.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "The ticket is not active || type not free || status is not generated || ticket does not exist"
            }
        });
    }

    //check addressReceiver!=addressSender
    if(addressSender == addressReceiver){
        return res
        .json({
            success: false,
            error: 'Not allowed to send the ticket to your own address'
        })
    }

    let idContract = checkTicket[0].idContract;
    let check;
    //check if address owns another ticket for the same contract
    try {
        check = await LandQueries.checkExistenceTicket(idContract, addressReceiver);
    } catch (error) {
        logger.error(`Error in LandQueries checkExistenceTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }

    if(check.length != 0){
        return res
        .json({
            success: false,
            error: "The reciever already owns a ticket for this land"
            
        });
    } 

    //update ticket in land_ticket of status, address, idMenu
    try {
        updateStatus = await LandQueries.updateBuyLandTicketStatus(idTicket, addressReceiver);
    } catch (error) {
        logger.error(`Error in LandQueries updateBuyLandTicketStatus: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`updateBuyLandTicketStatus info : ${JSON.stringify(updateStatus)}`);

    //get updated land ticket
    let ticket;
    try {
        ticket = await LandQueries.getTicket(idTicket, addressReceiver);
    } catch (error) {
        logger.error(`Error in LandQueries getTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`getTicket info : ${JSON.stringify(ticket)}`);

    if(ticket.length != 1){
        return res
        .json({
            success: false,
            error: "The ticket was not successfully sent"
            
        });
    }



    logger.info('sendTicket END');

    return res.json({
        success: true,
        data: {
        }
    });

}

async function deleteTicket(req, res) {
    logger.info(`deleteTicket START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.deleteTicketValidation(req)

        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address =  req.locals.address;
    let idTicket = req.body.idTicket;

    logger.info(`deleteTicket request, address: ${address}, idTicket: ${idTicket}`);

    //check ticket is generated and still owned by the contract owner
    let checkTicket;
    try {
        checkTicket = await LandQueries.checkValidityAndOwnershipTicket(idTicket, address);
    } catch (error) {
        logger.error(`Error in LandQueries checkValidityAndOwnershipTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`checkValidityAndOwnershipTicket info : ${JSON.stringify(checkTicket)}`);
    if(checkTicket.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "The ticket is not active || address is not owner || status is not generated || ticket does not exist"
            }
        });
    }

    let quantityGenerated = checkTicket[0].quantityGenerated;
    let idContract = checkTicket[0].idContract;
    logger.debug(`quantityGenerated: ${JSON.stringify(quantityGenerated)}, idContract: ${JSON.stringify(idContract)}`);

    let deleteTicket;
    try {
        deleteTicket = await LandQueries.deleteTicket(address, idTicket);
    } catch (error) {
        logger.error(`Error in LandQueries deleteTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`deleteTicket info : ${JSON.stringify(deleteTicket)}`);

    let updateContract;
    try {
        updateContract = await LandQueries.updateContract(idContract, quantityGenerated - 1);
    } catch (error) {
        logger.error(`Error in LandQueries updateContract: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`updateContract info : ${JSON.stringify(updateContract)}`);
    
    //get updated land ticket
    let ticket;
    try {
        ticket = await LandQueries.getTicket(idTicket, address);
    } catch (error) {
        logger.error(`Error in LandQueries getTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`getTicket info : ${JSON.stringify(ticket)}`);
    if(ticket.length != 0){

        logger.info('sendTicket END');
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "The ticket is still in land tickets"
            }
        });
    } else {
        
        logger.info('sendTicket END');
        return res.json({
            success: true
        });
    }
}

async function claimStorageOwner(req, res) {
    logger.info(`claimStorageOwner START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    //for claim history
    let claimResult;
    let claimObject = {};

    let validation = LandValidation.claimStorageOwnerValidation(req)

        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    let idLandInstance = req.body.idLandInstance;

    claimObject.address = address;
    claimObject.idLandInstance = idLandInstance;

    logger.info(`claimStorageOwner request, address: ${address}, idLandInstance: ${idLandInstance}`);

    let check;
    try {
        check = await LandQueries.checkAddressIsOwner(address, idLandInstance);
    } catch (error) {
        logger.error(`Error in LandQueries checkAddressIsOwner: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`checkAddressIsOwner info : ${JSON.stringify(check[0])}`);

    if(check.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "The address doesn't own this land instance"
            }
        });
    }

    //get resource type and storage amount
    check = check[0];
    let type = check.type;
    let storage = check.storage;

    claimObject.landType = type;
    claimObject.resourceBalanceBefore = storage;

    let resourcesInfo;
    try {
        resourcesInfo = await UserQueries.getResources(address);
    } catch (error) {
        logger.error(`Error in  UserQueries getResources: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`getResources info : ${JSON.stringify(resourcesInfo)}`);

    let info, resource;
    
    //need to set lands in DB 
    switch(type){
        case "forest":
            resource = 'wood';
            //WOOD
            try {
                info = await UserQueries.addWood(address, storage);
            } catch (error) {
                logger.error(`Error in UserQueries addWood: ${Utils.printErrorLog(error)}`);
                return res
                .json({
                    success: false,
                    error: error
                });
            }
            logger.debug(`UserQueries addWood info : ${JSON.stringify(info)}`);
            
            claimObject.resourceBefore = resourcesInfo.wood;
            claimObject.resourceAfter = resourcesInfo.wood + storage;
            
            break;

        case "mountain":
            //STONE
            resource = 'stone';
            try {
                info = await UserQueries.addStone(address, storage);
            } catch (error) {
                logger.error(`Error in UserQueries addStone: ${Utils.printErrorLog(error)}`);
                return res
                .json({
                    success: false,
                    error: error
                });
            }
            logger.debug(`UserQueries addStone info : ${JSON.stringify(info)}`);

            claimObject.resourceBefore = resourcesInfo.stone;
            claimObject.resourceAfter = resourcesInfo.stone + storage;

            break;
    }
    
    //update storage in land instances
    try {
        info = await LandQueries.updateLandInstanceStorage(0, idLandInstance);
    } catch (error) {
        logger.error(`Error in LandQueries updateLandInstanceStorage: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`LandQueries updateLandInstanceStorage info : ${JSON.stringify(info)}`);
    
    claimObject.resourceBalanceAfter = 0;

    let arrayObj = [];
    arrayObj.push(claimObject);

    try {
        info = await LandQueries.landClaimHistory(arrayObj);
    } catch (error) {
        logger.error(`Error in LandQueries landClaimHistory: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`LandQueries landClaimHistory info : ${JSON.stringify(info)}`);

    logger.info('claimStorageOwner END');

    return res.json({
        success: true,
        data: {
            resourceType: resource,
            claimedStorage: storage,
            newStorage: 0
        }
    });
}

async function setIsVisitable(req, res) {
    logger.info(`setIsVisitable START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.setIsVisitableValidation(req)

        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    let idGuest = req.body.idGuest;
    let isVisitable = req.body.isVisitable;

    logger.info(`setIsVisitable request, address: ${address}, idGuest: ${idGuest}`);

    let check;
    try {
        check = await LandQueries.getGuestGivenIdGuest(idGuest);
    } catch (error) {
        logger.error(`Error in LandQueries getGuestGivenIdGuest: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`checkGuest info : ${JSON.stringify(check[0])}`);

    if(check.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "The user is not a land guest"
            }
        });
    }

    
    let response
    try {
        response = await LandQueries.updateIsVisitable(idGuest,isVisitable);
    } catch (error) {
        logger.error(`Error in LandQueries updateIsVisitable: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`LandQueries updateIsVisitable info : ${JSON.stringify(response)}`);

    if(response.affectedRows != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "IsVisitable not updated"
            }
        });
    }


    logger.info('setIsVisitable END');

    return res.json({
        success: true,
        data: {
        }
    });
}
async function setLandName(req, res) {
    logger.info(`setLandName START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.setLandNameValidation(req)

    if(!validation.success){
        return res
        .status(401)
        .json(validation)
    }

    let address = req.locals.address;
    let idLandInstance = req.body.idLandInstance;
    let landName = req.body.landName;

    logger.info(`setLandName request, address: ${address}, idLandInstance: ${idLandInstance}, landName: ${landName}`);

    let check;
    try {
        check = await LandQueries.checkIfLandOwner(address, idLandInstance);
    } catch (error) {
        logger.error(`Error in LandQueries checkIfLandOwner: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`checkIfLandOwner info : ${JSON.stringify(check[0])}`);

    if(check.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "The user is not a land owner"
            }
        });
    }

    let response
    try {
        response = await LandQueries.updateLandName(idLandInstance,landName);
    } catch (error) {
        logger.error(`Error in LandQueries updateLandName: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`LandQueries updateLandName info : ${JSON.stringify(response)}`);

    if(response.affectedRows != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "landName not updated"
            }
        });
    }


    logger.info('setLandName END');

    return res.json({
        success: true,
        data: {
        }
    });
}

async function getBannerLand(req, res) {
    logger.info(`getBannerLand START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    let validation = LandValidation.getLandOwnerValidation(req)

        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address = req.locals.address;
    let idLandInstance = req.body.idLandInstance;


    let owned;
    logger.info(`getLandBanner request, address: ${address}, idLandInstance: ${idLandInstance}`);

    let check;
    try {
        check = await LandQueries.getLandProperty(idLandInstance,address);
    } catch (error) {
        logger.error(`Error in LandQueries getLandProperty: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`property info : ${JSON.stringify(check[0])}`);

    if(check.length != 1){
        owned = 0
    }else { owned = 1}

    if(owned){
        logger.info('getBannerLand END');
        return res
        .status(200)
        .json({
            success:true,
            data:{
                banner:{
                    message:"You cannot stake your city in your own land",
                    display : true
                }
                
            }
        })
    }


    
    let ticketInfo
    try {
        ticketInfo = await LandQueries.getTicketGivenUser(address);
    } catch (error) {
        logger.error(`Error in LandQueries getTicketGivenUser: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`LandQueries getTicketGivenUser info : ${JSON.stringify(ticketInfo)}`);

    if(ticketInfo.length > 0){
        logger.info('getBannerLand END');
        return res
        .status(200)
        .json({
            success: true,
            data:{
                banner:{
                    message:`If you don’t join the Land in 48 Hours, the Land Owner can re-claim the Ticket. MAKE SURE TO JOIN A LAND IN TIME!`,
                    display : true
                }
            }
        });
    }

    let guestInfo
    try {
        guestInfo = await LandQueries.getUserHomeGivenIdLandInstance(idLandInstance,address);
    } catch (error) {
        logger.error(`Error in LandQueries getUserHomeGivenIdLandInstance: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`LandQueries guest info : ${JSON.stringify(guestInfo)}`);
    if(guestInfo.length != 0){
        logger.info('getBannerLand END');
        return res.json({
            success: true,
            data: {
                banner:{
                    message:"",
                    display : false
                }
            }
        });
    }


    logger.info('getBannerLand END');

    return res.json({
        success: true,
        data: {
            banner:{
                message:"You need a ticket to join a land",
                display : true
            }
        }
    });
}

async function revokeTicket(req, res) {
    logger.info(`revokeTicket START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = LandValidation.revokeTicketValidation(req)

        if(!validation.success){
            return res
            .status(401)
            .json(validation)
        }

    let address =  req.locals.address;
    let idTicket = req.body.idTicket;

    logger.info(`revokeTicket request, address: ${address}, idTicket: ${idTicket}`);

    //check ticket is generated and not owned by the contract owner
    let checkTicket;
    try {
        checkTicket = await LandQueries.checkRevokeTicket(idTicket, address);
    } catch (error) {
        logger.error(`Error in LandQueries checkRevokeTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`checkRevokeTicket info : ${JSON.stringify(checkTicket)}`);
    if(checkTicket.length != 1){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "The ticket is not active || address is owner || status is not sent || ticket does not exist"
            }
        });
    }
    if(checkTicket[0].status == "sent"){
        let now = new Date().getTime();
        let dbTime = new Date(checkTicket[0].statusTime).getTime();
        let durationMilliSec = process.env.MIN_REVOKE_SEC * 1000;
        let sum = dbTime + durationMilliSec;
        
        if(sum > now){
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "The ticket can't be revoked before the minimum time"
                }
            });
        }
    }

    let revokeTicket;
    try {
        revokeTicket = await LandQueries.revokeTicket(address, idTicket);
    } catch (error) {
        logger.error(`Error in LandQueries revokeTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`revokeTicket info : ${JSON.stringify(revokeTicket)}`);
    
    //get updated land ticket
    let ticket;
    try {
        ticket = await LandQueries.getTicket(idTicket, address);
    } catch (error) {
        logger.error(`Error in LandQueries getTicket: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
    }
    logger.debug(`getTicket info : ${JSON.stringify(ticket)}`);
    if(ticket[0].status != 'generated'){

        logger.info('revokeTicket END');
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "The ticket was not revoked"
            }
        });
    } else {
        let response = LandService.buildRevokeTicket(ticket[0]);
        logger.debug(`buildRevokeTicket info: ${JSON.stringify(response)}`);
        
        logger.info('revokeTicket END');
        return res.json({
            success: true,
            data: {
                ...response
            }
            
        });
    }
}



module.exports = {getContractStatus, isStake, getWorld,getHomeWorld,getAllLands,getLand,getHomeLand,getLandInfo,upgradeLand,getTicketsOwner,createTickets, createListingTicket, removeListingTicket, getTicketMarketplace, createContract, deleteContract, getLandGuest, guestCheck, getInstanceTicket, getContractOwner, buyTicketMarketplace, subscribeTicket, unsubscribeTicket, getCity, sendTicket, claimStorageOwner,getAllTicketsUser,getUniverse, deleteTicket, setIsVisitable, getBannerLand, setLandName, revokeTicket}

