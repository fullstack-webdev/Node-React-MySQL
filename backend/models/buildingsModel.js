const mysql = require('../config/databaseConfig');
const logger= require('../logging/logger');
const leaderboardQueries = require(`../queries/leaderboardQueries`);
const { Utils } = require("../utils/utils");

const {MAX_LEVELS} = require('../config/buildingLevel');

class UpgradeResources{
    constructor(ancien, wood, stone){
        this.ancien = ancien;
        this.wood = wood;
        this.stone = stone;
    }
}

class BuildingsModel{
    constructor(
        id,
        name,
        type,
        description,
        moreInfo,
        image,
        imageSprite,
        level,
        stake,
        stored,
        capacity,
        dropQuantity,
        dropInterval,
        upgradeCapacity,
        upgradeDropQuantity,
        upgradeImage,
        upgradeTime,
        upgradeResources,
        upgradeStatus,
        upgradeFirstLogin,
        endingTime,
        levelMax,
        prestige,
        position

    ){
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
        this.moreInfo = moreInfo;
        this.image = image;
        this.imageSprite = imageSprite;
        this.level = level;
        this.stake = stake;
        this.stored = stored;
        this.capacity = capacity;
        this.dropQuantity = dropQuantity;
        this.dropInterval = dropInterval;
        this.upgradeCapacity = upgradeCapacity;
        this.upgradeDropQuantity = upgradeDropQuantity;
        this.upgradeImage = upgradeImage,
        this.upgradeTime = upgradeTime,
        this.upgradeResources = upgradeResources;
        this.upgradeStatus = upgradeStatus;
        this.upgradeFirstLogin = upgradeFirstLogin;
        this.upgradeEndingTime = endingTime;
        this.levelMax = levelMax;
        this.prestige = prestige;
        this.position = position;
    }

}

class BuildingsService{
    constructor(){}

    async getBuilders(address){
        logger.debug('getBuilders start');
        let responseGetTownhallStaked
        let buildingsInUpgrade
        try{
            responseGetTownhallStaked = await this.getTownhallLevelStaked(address);
        }
        catch(err){
                return err;
        }
        logger.debug(`response getTownhallLevelStaked: ${responseGetTownhallStaked}`);

        let levelTownhallStaked = responseGetTownhallStaked.length > 0 ? responseGetTownhallStaked[0].level : 0;
        let buildersTotal = this.getBuildersAvailable(levelTownhallStaked) + 1;
        try{
            buildingsInUpgrade = await this.getBuildingsInUpgrade(address);
        }catch(err){
            return err;
        }
            let buildersAvailable = buildersTotal - buildingsInUpgrade.length;
            logger.debug('getBuilders end');
            return {
                buildersTotal: buildersTotal,
                buildersAvailable: buildersAvailable
            }
    }

    async getTownhallLevelStaked(address){
        logger.debug(`getTownhallLevelStaked start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT level FROM buildings WHERE address = ? AND type = 1 AND stake = 1";

            mysql.query(sql, address, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getTownhallLevelStaked end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async getBuildingsInUpgrade(address){
        logger.debug(`getBuildingsInUpgrade start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM buildings WHERE address = ? AND upgradeStatus = 1";

                mysql.query(sql, address, (err, rows, fields) => {
                    if(err) return reject(new Error(err.message));
                    if(rows == undefined){
                        logger.error(`null error: ${address}`);
                        return reject({
                            message: "undefined"
                        });
                    }else{
                        logger.debug(`getBuildingsInUpgrade end`);
                        return resolve(JSON.parse(JSON.stringify(rows)));
                    }

                });
        });
    }

    getBuildersAvailable(TownhallLevel){
        if(TownhallLevel < 11){
            return 0;
        }
    }

    async getAccountData(address){
        logger.debug(`getAccountData start`);
        return new Promise((resolve, reject) => {
            // let sql = "SELECT * FROM buildings WHERE address = ? AND type <> 4 order by stake desc, type asc";
            let sql = "SELECT * FROM buildings WHERE address = ? order by stake desc, type asc";

            mysql.query(sql, address, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getAccountData end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });

    }

    async getNFT(nftId, type){
        logger.debug('getNFT start');
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM buildings WHERE idBuilding = ? AND type = ?";

            mysql.query(sql, [nftId, type], (err, rows, fields) => {
                if(err){ 
                    logger.error(`Query error: ${Utils.printErrorLog(err)}`);
                    return reject(new Error(err.message));
                }
                if(rows == undefined || rows == null){
                    //logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug('getNFT end');
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }

            });
        });
    }

    async updatePosition(nftId, type, position){
        logger.debug(`updatePosition start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE buildings SET position = ? WHERE idBuilding = ? AND type = ?";

            mysql.query(sql, [position,nftId, type], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`updatePosition end`);
                    return resolve(rows);
                }
            });
        });
    }

    async getStakedNFT(address){
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM buildings
            WHERE address = ? AND stake = 1`;

            mysql.query(sql, address, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error("null error in getStakedBuildings: ", address);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async retrieveUpgradeModel(){
        logger.debug(`retrieveUpgradeModel start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM upgrade";

            mysql.query(sql, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`retrieveUpgradeModel end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });


    }

    async retrieveUpgradeResources(type, level){
        logger.debug(`retrieveUpgradeResources start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT ancien, wood, stone FROM upgrade WHERE type = ? AND level = ?";

            mysql.query(sql, [type, level], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`retrieveUpgradeResources end`);
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }

    buildBuildingsModel(rows, upgradeModel){
        let finalResponse = [];
        logger.debug(`buildBuildingsModel start`);

        for(let i = 0; i < rows.length; i++){
            for(let j = 0; j < upgradeModel.length; j++){

                if(rows[i].level == MAX_LEVELS[rows[i].type]){
                    let newUpgradeResources = new UpgradeResources(null, null, null);

                    let newNFT = new BuildingsModel(
                        rows[i].idBuilding,
                        rows[i].name,
                        rows[i].type,
                        rows[i].description,
                        rows[i].moreInfo,
                        rows[i].imageURL,
                        rows[i].imageSprite,
                        rows[i].level,
                        rows[i].stake,
                        rows[i].stored,
                        rows[i].capacity,
                        rows[i].dropQuantity,
                        rows[i].dropInterval,
                        null,
                        null,
                        null,
                        null,
                        newUpgradeResources,
                        rows[i].upgradeStatus,
                        rows[i].upgradeFirstLogin,
                        rows[i].endingTime,
                        true,
                        rows[i].position
                    );

                    finalResponse.push(newNFT);
                    break;

                }

                if(upgradeModel[j].type == rows[i].type && upgradeModel[j].level == (rows[i].level+1)){



                    let newUpgradeResources = new UpgradeResources(
                        upgradeModel[j].ancien,
                        upgradeModel[j].wood,
                        upgradeModel[j].stone);

                    let newNFT = new BuildingsModel(
                        rows[i].idBuilding,
                        rows[i].name,
                        rows[i].type,
                        rows[i].description,
                        rows[i].moreInfo,
                        rows[i].imageURL,
                        rows[i].imageSprite,
                        rows[i].level,
                        rows[i].stake,
                        rows[i].stored,
                        rows[i].capacity,
                        rows[i].dropQuantity,
                        rows[i].dropInterval,
                        upgradeModel[j].newCapacity,
                        upgradeModel[j].newDropQuantity,
                        rows[i].upgradeImage,  //new version 1
                        upgradeModel[j].upgradeTime,
                        newUpgradeResources,
                        rows[i].upgradeStatus,
                        rows[i].upgradeFirstLogin,
                        rows[i].endingTime,
                        false,
                        rows[i].position
                    );

                    finalResponse.push(newNFT);

                }
            }
        }
        logger.debug(`final response : ${JSON.stringify(finalResponse)}`);
        logger.debug(`buildBuildingsModel end`);

        return finalResponse;
    }

    buildResponseModelNFTProc(responseData){
        let finalResponse;
        logger.debug(`buildResponseModelNFTProc start`);
        
        if(responseData.level ==  MAX_LEVELS[responseData.type]){
            let newUpgradeResources = new UpgradeResources();

            let newNFT = new BuildingsModel(
                responseData.idBuilding,
                responseData.name,
                responseData.type,
                responseData.description,
                responseData.moreInfo,
                responseData.imageURL,
                responseData.imageSprite,
                responseData.level,
                responseData.stake,
                responseData.stored,
                responseData.capacity,
                responseData.dropQuantity,
                responseData.dropInterval,
                null,
                null,
                null,
                null,
                newUpgradeResources,
                responseData.upgradeStatus,
                responseData.upgradeFirstLogin,
                responseData.endingTime,
                true,
                responseData.position
            );

            finalResponse = newNFT;
        }

        let newUpgradeResources = new UpgradeResources(
            responseData.ancien,
            responseData.wood,
            responseData.stone);

        let newNFT = new BuildingsModel(
            responseData.idBuilding,
            responseData.name,
            responseData.type,
            responseData.description,
            responseData.moreInfo,
            responseData.imageURL,
            responseData.imageSprite,
            responseData.level,
            responseData.stake,
            responseData.stored,
            responseData.capacity,
            responseData.dropQuantity,
            responseData.dropInterval,
            responseData.newCapacity,
            responseData.newDropQuantity,
            responseData.upgradeImage,
            responseData.upgradeTime,
            newUpgradeResources,
            responseData.upgradeStatus,
            responseData.upgradeFirstLogin,
            responseData.endingTime,
            false,
            responseData.position
        );

        finalResponse = newNFT;

        logger.debug(`final response: ${JSON.stringify(finalResponse)}`);
        logger.debug(`buildResponseModelNFTProc end`);

        return finalResponse;
    }

    buildResponseModelNFT(responseData, upgradeModel){

        let finalResponse;
        logger.debug(`buildResponseModelNFT start`);
        
        for(let j = 0; j < upgradeModel.length; j++){

            if(responseData.level ==  MAX_LEVELS[responseData.type]){
                let newUpgradeResources = new UpgradeResources();

                let newNFT = new BuildingsModel(
                    responseData.idBuilding,
                    responseData.name,
                    responseData.type,
                    responseData.description,
                    responseData.moreInfo,
                    responseData.imageURL,
                    responseData.imageSprite,
                    responseData.level,
                    responseData.stake,
                    responseData.stored,
                    responseData.capacity,
                    responseData.dropQuantity,
                    responseData.dropInterval,
                    null,
                    null,
                    null,
                    null,
                    newUpgradeResources,
                    responseData.upgradeStatus,
                    responseData.upgradeFirstLogin,
                    responseData.endingTime,
                    true,
                    responseData.position
                );

                finalResponse = newNFT;
                break;

            }


            if(upgradeModel[j].type == responseData.type && upgradeModel[j].level == (responseData.level+1)){



                let newUpgradeResources = new UpgradeResources(
                    upgradeModel[j].ancien,
                    upgradeModel[j].wood,
                    upgradeModel[j].stone);

                let newNFT = new BuildingsModel(
                    responseData.idBuilding,
                    responseData.name,
                    responseData.type,
                    responseData.description,
                    responseData.moreInfo,
                    responseData.imageURL,
                    responseData.imageSprite,
                    responseData.level,
                    responseData.stake,
                    responseData.stored,
                    responseData.capacity,
                    responseData.dropQuantity,
                    responseData.dropInterval,
                    upgradeModel[j].newCapacity,
                    upgradeModel[j].newDropQuantity,
                    responseData.upgradeImage,
                    upgradeModel[j].upgradeTime,
                    newUpgradeResources,
                    responseData.upgradeStatus,
                    responseData.upgradeFirstLogin,
                    responseData.endingTime,
                    false,
                    responseData.position
                );

                finalResponse = newNFT;
            }
        }

        logger.debug(`final response: ${JSON.stringify(finalResponse)}`);
        logger.debug(`buildResponseModelNFT end`);

        return finalResponse;
    }
    
    async retrieveImage(responseAccountData){
        logger.debug(`retrieveImage start`);
        for(let i = 0; i < responseAccountData.length; i++){
            let bkService = new BackgroundService();
            let bkNumber = await bkService.getBkNumberGivenBuildingId(responseAccountData[i].id);
            let imageUrl;
            let upgradeImageUrl;

            bkNumber = bkNumber[0].idSkin;

            imageUrl = this.createImageUrl(responseAccountData[i].type, 
                responseAccountData[i].level,
                responseAccountData[i].bundle,
                bkNumber);

            if(responseAccountData[i].level <  MAX_LEVELS[responseAccountData[i].type]){
                upgradeImageUrl = this.createImageUrl(responseAccountData[i].type, 
                    responseAccountData[i].level + 1,
                    responseAccountData[i].bundle,
                    bkNumber);
            }else{
                upgradeImageUrl = null;
            }

            responseAccountData[i].imageURL = imageUrl;
            responseAccountData[i].upgradeImage = upgradeImageUrl;

        }
        logger.debug(`final response: ${JSON.stringify(responseAccountData)}`);
        logger.debug(`retrieveImage end`);
        return responseAccountData;
    }

    async retrieveImageSprite(responseAccountData){
        logger.debug(`retrieveImageSprite start`);
        for(let i = 0; i < responseAccountData.length; i++){
            let imageSprite;

            if(responseAccountData[i].upgradeStatus){
                imageSprite = this.createImageSpriteUpgradeUrl(responseAccountData[i].type, responseAccountData[i].level);
            }else{
                imageSprite = this.createImageSpriteUrl(responseAccountData[i].type, responseAccountData[i].level);
            }

            responseAccountData[i].imageSprite = imageSprite;
        }
        logger.debug(`final response: ${JSON.stringify(responseAccountData)}`);
        logger.debug(`retrieveImageSprite end`);
        return responseAccountData;
    }

    async retrieveImageNFT(responseAccountData){
        logger.debug(`retrieveImageNFT start`);
        
        let bkService = new BackgroundService();
        let bkNumber = await bkService.getBkNumberGivenBuildingId(responseAccountData.id);
        let imageUrl;
        let upgradeImageUrl;

        bkNumber = bkNumber[0].idSkin;

        imageUrl = this.createImageUrl(responseAccountData.type, 
            responseAccountData.level,
            responseAccountData.bundle,
            bkNumber);

        if(responseAccountData.level < MAX_LEVELS[responseAccountData.type]){
            upgradeImageUrl = this.createImageUrl(responseAccountData.type, 
                responseAccountData.level + 1,
                responseAccountData.bundle,
                bkNumber);
        }else{
            upgradeImageUrl = null;
        }

        responseAccountData.imageURL = imageUrl;
        responseAccountData.upgradeImage = upgradeImageUrl;

        logger.debug(`final response : ${JSON.stringify(responseAccountData)}`);
        logger.debug(`retrieveImageNFT end`);

        return responseAccountData;
        
    }

    async retrieveImageSpriteNFT(responseAccountData){
        logger.debug(`retrieveImageSpriteNFT start`);
        
        let imageSprite;

        if(responseAccountData.upgradeStatus){
            imageSprite = this.createImageSpriteUpgradeUrl(responseAccountData.type, responseAccountData.level);
        }else{
            imageSprite = this.createImageSpriteUrl(responseAccountData.type, responseAccountData.level);
        }

        responseAccountData.imageSprite = imageSprite;

        // logger.debug(`final response : ${JSON.stringify(responseAccountData)}`);
        logger.debug(`retrieveImageSpriteNFT end`);

        return responseAccountData;
        
    }

    createImageUrl(type, level, bundle, bkNumber){
        logger.debug(`createImageUrl start`);
        const baseUri = "https://ancient-society.s3.eu-central-1.amazonaws.com/reveal/";
        let imageUrl = baseUri;

        switch(type){
            case 1:{
                imageUrl += "townhall/" + level + "-" + bkNumber;
                break;
            }
            case 2:{
                imageUrl += "lumberjack/" + level + "-" + bkNumber;
                break;
            }
            case 3:{
                imageUrl += "stonemine/" + level + "-" + bkNumber;
                break;
            }
            case 4:{
                imageUrl += "fisherman/" + level + "-" + bkNumber;
                break;
            }
            default:
                break;
        }

        if(bundle){
            imageUrl += "-bundle";
        }
        imageUrl += ".jpg";
        logger.debug(`imageUrl: ${imageUrl}`);
        logger.debug(`createImageUrl end`);
        return imageUrl
    }

    createImageSpriteUpgradeUrl(type, level){
        logger.debug(`createImageSpriteUpgradeUrl start`);
        const baseUri = "https://ancient-society.s3.eu-central-1.amazonaws.com/sprite/upgrade/";
        
        return `${baseUri}spriteUpgrade.webp`
        /*  DIFFERENT UPGRADE SPRITE TYPE BASED
        let imageUrl = baseUri;

        switch(type){
            case 1:{
                imageUrl += "townhall/" + level;
                break;
            }
            case 2:{
                imageUrl += "lumberjack/" + level;
                break;
            }
            case 3:{
                imageUrl += "stonemine/" + level;
                break;
            }
            case 4:{
                imageUrl += "fisherman/" + level;
                break;
            }
            default:
                break;
        }

        imageUrl += ".webp";
        logger.debug(`imageUrl: ${imageUrl}`);
        logger.debug(`createImageSpriteUpgradeUrl end`);
        return imageUrl
        */
    }

    createImageSpriteUrl(type, level){
        logger.debug(`createImageSpriteUrl start`);
        const baseUri = "https://ancient-society.s3.eu-central-1.amazonaws.com/sprite/";
        let imageUrl = baseUri;

        switch(type){
            case 1:{
                imageUrl += "townhall/" + level;
                break;
            }
            case 2:{
                imageUrl += "lumberjack/" + level;
                break;
            }
            case 3:{
                imageUrl += "stonemine/" + level;
                break;
            }
            case 4:{
                imageUrl += "fisherman/" + level;
                break;
            }
            default:
                break;
        }

        imageUrl += ".webp";
        logger.debug(`imageUrl: ${imageUrl}`);
        logger.debug(`createImageSpriteUrl end`);
        return imageUrl
    }
}

class BackgroundService {
    constructor(){}

    async getBkNumberGivenBuildingId(nftId){
        logger.debug(`getBkNumberGivenBuildingId start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT idSkin FROM inventario WHERE idBuilding = ?";
            mysql.query(sql, nftId, (err, rows) => {
                if(err) reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getBkNumberGivenBuildingId end`);
                    resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
}

class UpgradeService {
    constructor(){}

    checkAvailability(resources, upgradeResources){
        
        if(resources.ancien >= upgradeResources.ancien &&
            resources.wood >= upgradeResources.wood &&
            resources.stone >= upgradeResources.stone){
            
            return true;
        }

        return false;
    }

    calculateNewResources(resources, upgradeResources){
        resources.ancien = resources.ancien - upgradeResources.ancien;
        resources.wood = resources.wood - upgradeResources.wood;
        resources.stone = resources.stone - upgradeResources.stone;
        return resources;

    }

    async upgradeDone(nftId, type){
        logger.debug(`upgradeDone start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE buildings SET upgradeFirstLogin = false WHERE idBuilding = ? AND type = ?";

            mysql.query(sql, [nftId, type], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`upgradeDone end`);
                    return resolve(rows);
                }
            });
        });
    }

    async updateFirstLogin(id, level, description, capacity, dropQuantity, imageURL, moreInfo, lastClaim){
        logger.debug(`updateFirstLogin start`);
        return new Promise((resolve, reject) => {
            let sql = `UPDATE buildings 
            SET upgradeFirstLogin = true, 
            upgradeStatus = false, level = ?, 
            description = ?, 
            capacity = ?, 
            dropQuantity = ?, 
            imageURL = ?, 
            moreInfo = ?, 
            lastClaim = ?,
            lastClaimAction = endingTime
            WHERE id = ?`;

            mysql.query(sql, [level, description, capacity, dropQuantity, imageURL, moreInfo, lastClaim, id], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`updateFirstLogin end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async checkUpgradeStatus(responseAccountData, responseUpgradeModel){
        logger.debug("checkUpgradeStatus start");

        for(let i = 0; i < responseAccountData.length; i++){
            if(responseAccountData[i].stake && responseAccountData[i].upgradeStatus){
                // logger.debug(`analizing: ${JSON.stringify(responseAccountData[i])}`);

                let endingTime = new Date(responseAccountData[i].endingTime);
                let nowTime = new Date();


                let endingTimeSeconds = endingTime.getTime();
                let nowTimeSeconds = nowTime.getTime();


                let upgradeModel;
                //TODO coSA SUCCEDE SE NON TROVA QUALCOSA AL LIVELLO USCCESSIVO? pUò SUCEDERE?

                for(let j = 0; j < responseUpgradeModel.length; j++){
                    if(responseUpgradeModel[j].type == responseAccountData[i].type
                        && responseUpgradeModel[j].level == responseAccountData[i].level + 1){
                            upgradeModel = responseUpgradeModel[j];
                            break;
                        }
                }

                let lastClaim = endingTime;  //TODO da rimuovere
                // console.log("lastClaim: ", lastClaim);
                // console.log("now: ", nowTime);
                // console.log();

                if(nowTimeSeconds >= endingTimeSeconds){
                    // logger.debug(`elemento: ${JSON.stringify(responseAccountData[i])}, ended upgrade`);
                    // logger.debug(`upgrade ended, passing into updateFirstLogin: responseAccountData: ${JSON.stringify(responseAccountData[i])}, upgradeModel: ${JSON.stringify(upgradeModel)}, lastClaim: ${JSON.stringify(lastClaim)}`);

                    console.log('UpgradeDone Leaderboard ENTARTO')

                    let expUpgrade;
                
                    if(responseAccountData[i].type != 4){
                        try{
                        expUpgrade = await DropService.calculateExperienceAfterUpgrade(responseAccountData[i], responseUpgradeModel);
                        }catch(error){
                            logger.error(`Error in calculateExperienceAfterUpgrade:${Utils.printErrorLog(error)}`);
                        }
                    }

                    try {
                        let resultUpdate = await this.updateFirstLogin(responseAccountData[i].id,
                            upgradeModel.level,
                            upgradeModel.newDescription,
                            upgradeModel.newCapacity,
                            upgradeModel.newDropQuantity,
                            upgradeModel.upgradeImage,
                            upgradeModel.newMoreInfo,
                            lastClaim);
                    } catch (error) {
                        logger.error(`Error in updateFirstLogin:${Utils.printErrorLog(error)}`);
                    }

                    
                    
                    responseAccountData[i].upgradeStatus = false;
                    responseAccountData[i].upgradeFirstLogin = true;
                    responseAccountData[i].level = upgradeModel.level;
                    responseAccountData[i].description = upgradeModel.newDescription;
                    responseAccountData[i].capacity = upgradeModel.newCapacity;
                    responseAccountData[i].dropQuantity = upgradeModel.newDropQuantity;
                    responseAccountData[i].imageURL = upgradeModel.upgradeImage;
                    responseAccountData[i].moreInfo = upgradeModel.newMoreInfo;
                    responseAccountData[i].lastClaim = lastClaim;

                }
            }
        }

        // logger.debug(`response checkUpgradeStatus:, ${JSON.stringify(responseAccountData)}`);
        logger.debug("checkUpgradeStatus end");

        return responseAccountData;

    }

    async checkUpgradeStatusNFT(responseAccountData, responseUpgradeModel){
        logger.debug("checkUpgradeStatusNFT start");
        if(responseAccountData.stake && responseAccountData.upgradeStatus){
            let endingTime = new Date(responseAccountData.endingTime);
            let nowTime = new Date();


            let endingTimeSeconds = endingTime.getTime();
            let nowTimeSeconds = nowTime.getTime();


            let upgradeModel;

            for(let j = 0; j < responseUpgradeModel.length; j++){
                if(responseUpgradeModel[j].type == responseAccountData.type
                    && responseUpgradeModel[j].level == responseAccountData.level + 1){
                        upgradeModel = responseUpgradeModel[j];
                        break;
                    }

            }

            let lastClaim = endingTime;  //TODO da rimuovere
            
            // let lastResetLeaderboard = new Date('2022-06-29 15:00:00.000000');
            let lastResetLeaderboard = new Date(process.env.LAST_RESET_LEADERBOARD);

            let currentLevel = responseUpgradeModel.filter( elem => elem.level == responseAccountData.level + 1 && elem.type == responseAccountData.type);
            // let currentUpgradeTime = new Date(currentLevel[0].upgradeTime)
            let startingTimeUpgrade = endingTime - currentLevel[0].upgradeTime * 1000;
            
            console.log("currentLevel: ", currentLevel)
            // console.log("currentUpgradeTime: ", currentUpgradeTime)
            console.log("startingTimeUpgrade: ", startingTimeUpgrade)
            console.log("lastResetLeaderboard: ", lastResetLeaderboard.toISOString())
            console.log("process.env.LAST_RESET_LEADERBOARD: ", process.env.LAST_RESET_LEADERBOARD)

            if(nowTimeSeconds >= endingTimeSeconds){
                let expUpgrade;
                
                if(responseAccountData.type != 4 && startingTimeUpgrade > lastResetLeaderboard) {
                    try{
                        expUpgrade = await DropService.calculateExperienceAfterUpgrade(responseAccountData, responseUpgradeModel)
                    }catch(error){
                        logger.error(`Error in calculateExperienceAfterUpgrade:${Utils.printErrorLog(error)}`);
                    }
                }

                try {
                    let resultUpdate = await this.updateFirstLogin(responseAccountData.id,
                        upgradeModel.level,
                        upgradeModel.newDescription,
                        upgradeModel.newCapacity,
                        upgradeModel.newDropQuantity,
                        upgradeModel.upgradeImage,
                        upgradeModel.newMoreInfo,
                        lastClaim);
                } catch (error) {
                    logger.error(`Error in updateFirstLogin:${Utils.printErrorLog(error)}`);
                }

                responseAccountData.upgradeStatus = false;
                responseAccountData.upgradeFirstLogin = true;
                responseAccountData.level = upgradeModel.level;
                responseAccountData.description = upgradeModel.newDescription;
                responseAccountData.capacity = upgradeModel.newCapacity;
                responseAccountData.dropQuantity = upgradeModel.newDropQuantity;
                responseAccountData.imageURL = upgradeModel.upgradeImage;
                responseAccountData.moreInfo = upgradeModel.newMoreInfo;
                responseAccountData.lastClaim = lastClaim;

            }

        }
        // logger.debug(`final response: ${JSON.stringify(responseAccountData)}`);
        logger.debug("checkUpgradeStatusNFT end");
        return responseAccountData;
    }

    async getUpgradeTime(type, level){
        logger.debug("getUpgradeTime start");
        return new Promise((resolve, reject) => {
            let sql = "SELECT upgradeTime FROM upgrade WHERE type = ? AND level = ?";

            mysql.query(sql, [type, level], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("getUpgradeTime end");
                    return resolve(JSON.parse(JSON.stringify(rows))[0].upgradeTime);
                }
            });
        });
    }

    async setUpgrade(nftId, type, endingTime){
        logger.debug("setUpgrade start");
        return new Promise((resolve, reject) => {
            let sql = "UPDATE buildings SET endingTime = ?, upgradeStatus = true WHERE idBuilding = ? AND type = ? AND stake = 1";

            mysql.query(sql, [endingTime, nftId, type], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("setUpgrade end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async createEndingTime(upgradeTime){
        logger.debug("createEndingTime start");

        let now = new Date();
        let nowTime = now.getTime();
        let endingTime = new Date(nowTime + (upgradeTime * 1000));

        logger.debug(`endingTime: ${endingTime.toISOString()}`);
        logger.debug("createEndingTime end");

        return endingTime.toISOString();
    }


}

class ClaimService {
    constructor(){}

    async getLastClaim(nftId, type){
        logger.debug("getLastClaim start");
        return new Promise((resolve, reject) => {
            let sql = "SELECT lastClaim FROM buildings WHERE idBuilding = ? AND type = ?";
            mysql.query(sql, [nftId, type], (err, rows) => {
                if(err) reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("getLastClaim end");
                    resolve(JSON.parse(JSON.stringify(rows))[0].stored);
                }
            });
        });
    }

    async checkAvailability(nftId, type, amount){
        logger.debug("getAccountData start");
        return new Promise((resolve, reject) => {
            let sql = "SELECT stored FROM buildings WHERE idBuilding = ? AND type = ?";

            mysql.query(sql, [nftId, type], (err, rows) => {
                if(err) reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("getAccountData end");
                    resolve(JSON.parse(JSON.stringify(rows))[0].stored);
                }
            });
        });
    }

    async makeClaim(newLastClaim, nftId, type, stored){
        logger.debug("makeClaim start");
        return new Promise((resolve, reject) => {
            let sql = "UPDATE buildings SET stored = ?, lastClaim = ? WHERE idBuilding = ? AND type = ?";

            mysql.query(sql, [stored, newLastClaim, nftId, type], (err, rows) => {
                if(err) reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("makeClaim end");
                    resolve(rows);
                }
            });
        });
    }

    async setResourceAfterClaim(address, newAmount, resource){
        logger.debug("setResourceAfterClaim start");
        return new Promise((resolve, reject) => {
            let secondSql = "UPDATE utente SET " + resource + " = ? WHERE address = ?";
            mysql.query(secondSql, [newAmount, address], (err, rows) => {
                if(err) reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("setResourceAfterClaim end");
                    resolve(rows);
                }
            });
        });
    }

    getResourceType(type){
        switch(type){
            case 1: {
                return "ancien";
            }

            case 2: {
                return "wood";
            }

            case 3: {
                return "stone";
            }

            default: {
                return null;
            }
        }
    }
}

class StakeService {
    constructor() {}

    async checkStakeStatus(id, type){
        logger.debug("checkStakeStatus start");

        return new Promise((resolve, reject) => {
            let secondSql = "SELECT utente SET " + resource + " = ? WHERE address = ?";
            mysql.query(secondSql, [newAmount, address], (err, rows) => {
                if(err) reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("checkStakeStatus end");
                    resolve(rows);
                }
            });
        });

    }

    async changeStakeStatus(id, type, stake, lastClaim){
        logger.debug("changeStakeStatus start");
        return new Promise((resolve, reject) => {
            let secondSql = "UPDATE buildings SET stake = ?, lastClaim = ? WHERE idBuilding = ? AND type = ?";
            mysql.query(secondSql, [stake, lastClaim, id, type], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("changeStakeStatus end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });

    }
}

class DropService {
    constructor() {}

    async getLastClaim(id, type){
        logger.debug("getLastClaim start");
        return new Promise((resolve, reject) => {
            let secondSql = "SELECT stored, lastClaim, dropQuantity, dropInterval, capacity FROM buildings WHERE idBuilding = ? AND type = ?";
            mysql.query(secondSql, [id, type], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("getLastClaim end");
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }

    async updateStoredResources(newStored, id, type, newLastClaim){
        logger.debug("updateStoredResources start");
        return new Promise((resolve, reject) => {
            let sql = "UPDATE buildings SET stored = ?, lastClaim = ? WHERE idBuilding = ? AND type = ?";

            mysql.query(sql, [newStored, newLastClaim, id, type], (err, rows) => {
                if(err) reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("updateStoredResources end");
                    resolve({ affectedRows: rows,
                        newStored: newStored
                    });
                }
            });

        });
    }

    async calculateNewStoredResources(id, type, address){
        
        logger.debug("calculateNewStoredResources start");

        try{
            let lastClaimResponse = await this.getLastClaim(id, type);  //Togliere questa query e prenderla in input
            logger.debug(`lastClaimResponse:${JSON.stringify(lastClaimResponse)}`);


            let lastClaimSeconds = (new Date(lastClaimResponse.lastClaim).getTime()) / 1000;
            let stored = lastClaimResponse.stored;
            let dropQuantity = lastClaimResponse.dropQuantity;
            let dropInterval = lastClaimResponse.dropInterval;
            let capacity = lastClaimResponse.capacity;

            let dropPerSecond = dropQuantity / dropInterval;

            logger.debug(`dropPerSecond:${dropPerSecond}`);

            let newClaimSeconds = (new Date().getTime()) / 1000;


            let intervalsFromLastClaim = (newClaimSeconds - lastClaimSeconds);
            let increment = intervalsFromLastClaim * dropPerSecond;

            logger.debug(`intervalsFromLastClaim: ${intervalsFromLastClaim}, increment: ${increment}`);


            if(increment < 0) return false;

            let newStored = stored + increment;
            if(newStored > capacity) newStored = capacity;

            let newLastClaim = new Date().toISOString();

            logger.debug(`newStored: ${newStored}, newLastClaim: ${newLastClaim}`);

            // let incrementExp;

            // switch (type) {
            //     case 1:
            //         incrementExp = increment * 4 ;
            //         break;
            //     case 2:
            //         incrementExp = increment ;
            //         break;
            //     case 3:
            //         incrementExp = increment * 3;
            //         break;
            // }

            // if(isClaim){
            //     let responseExp;
            //     try {
            //         responseExp = await this.experienceHandler(address,incrementExp);
            //     } catch (error) {
            //         logger.error(`Errore in leaderboardQueries experienceHandler error: ${Utils.printErrorLog(error)}`);
            //         return error;
            //     }
            // }
            

            let response = await this.updateStoredResources(newStored, id, type, newLastClaim);

            logger.debug(`response: ${JSON.stringify(response)}`);
            logger.debug("calculateNewStoredResources end");
            return response;


        }catch(error){
            logger.error(`Errore in calculateNewStoredResources, error: ${Utils.printErrorLog(error)}`);
            return error;
        }

    }

    static async experienceHandler(address,incrementExp){
        logger.debug(`experienceHandler start, address : ${address}, incrementExp: ${incrementExp}`);

        let response;
        let final;

        try {
            response = await leaderboardQueries.getUserLeaderboard(address);
        } catch (error) {
            logger.error(`Errore in calculateNewStoredResources, error: ${Utils.printErrorLog(error)}`);
            return error;
        }
        logger.debug(`leaderboardQueries.getUserLeaderboard response : ${JSON.stringify(response)}`);

        if(response.length == 0){
            try {
                final = await leaderboardQueries.createUserLeaderboard(address, incrementExp);
            } catch (error) {
                logger.error(`Errore in leaderboardQueries.createUserLeaderboard, error: ${Utils.printErrorLog(error)}`);
                return error;
            }
        }else{
            try {
                final = await leaderboardQueries.addExperience(address, incrementExp);
            } catch (error) {
                logger.error(`Errore in leaderboardQueries.addExperience, error: ${Utils.printErrorLog(error)}`);
                return error;  
            }
        }

        return final;
    }

    static async calculateExperienceAfterUpgrade(responseAccountData, responseUpgradeModel){
        logger.debug("calculateExperienceAfterUpgrade start");
        let upgradeModel;

        // for(let elem of responseUpgradeModel){
        //     if(elem.level == responseAccountData.level && elem.type == responseAccountData.type){
        //         upgradeModel = elem;
        //     }
        // }  
        responseUpgradeModel.map(elem => {
            if(elem.level == responseAccountData.level && elem.type == responseAccountData.type){
                upgradeModel = elem;
            }
        })   


        try{
            
            let upgradeHour = upgradeModel.upgradeTime / 3600;
            let increment = upgradeHour * upgradeModel.newDropQuantity;

            increment = parseInt(increment);
            
            

            if(increment < 0) return false;

            let incrementExp;

            switch (responseAccountData.type) {
                case 1:
                    incrementExp = increment * 4 ;
                    break;
                case 2:
                    incrementExp = increment ;
                    break;
                case 3:
                    incrementExp = increment * 3;
                    break;
            }

            logger.debug(`calculateExperienceAfterUpgrade, increment: ${increment}, incrementExp: ${incrementExp}, address: ${responseAccountData.address}`);
            let responseExp;
            try {
                responseExp = await DropService.experienceHandler(responseAccountData.address,incrementExp);
            } catch (error) {
                logger.error(`Errore in leaderboardQueries experienceHandler error: ${Utils.printErrorLog(error)}`);
                return error;
            }

            logger.debug("calculateExperienceAfterUpgrade end");
            return responseExp;


        }catch(error){
            logger.error(`Errore in calculateExperienceAfterUpgrade, error: ${Utils.printErrorLog(error)}`);
            return error;
        }

    }
    
}

class VerifyService{
    constructor() {}

    async verifyProperty(address, nftId, type){
        logger.debug(`verifyProperty start`);
        try{
            let response = await this.verifypropertyFunction(address, nftId, type)
            logger.debug(`responseVerify: ${JSON.stringify(response)} `);
            if(response == null || response == undefined || response.length < 1){
                return false;
            }
            logger.debug(`verifyProperty end`);
            return true;
        }catch(err){
            logger.error(`error in verifyProperty:${Utils.printErrorLog(err)} `);
            return false;
        }
    }

    async verifypropertyFunction(address, nftId, type){
        logger.debug(`verifypropertyFunction start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM buildings WHERE address = ? AND idBuilding = ? AND TYPE = ?";
            mysql.query(sql, [address, nftId, type], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`verifypropertyFunction end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    verifyPosition(NFTS,position,nftId, type){
        for(let elem of NFTS){
            if (elem.position == position){
                if(elem.idBuilding == nftId && elem.type == type){
                    return 3;
                }
                return 2;
            }
        }
        return 1;
    }
}

module.exports = {UpgradeResources, BuildingsModel, BuildingsService, UpgradeService, ClaimService, StakeService, DropService, VerifyService};