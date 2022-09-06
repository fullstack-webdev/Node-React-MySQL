const logger = require('../logging/logger');

const BuildingsModel = require('../models/buildingsModel');
const UserModel = require("../models/userModel");
const {BuildingsValidation} = require("../validations/buildingsValidation");
const {BuildingsQueries} = require ("../queries/buildingsQueries");
const {BuildingsHelper} = require ("../helpers/buildingsHelper");
const {Utils} = require("../utils/utils");

const LeaderboardQueries = require('../queries/leaderboardQueries')

const requestClaim = new BuildingsModel.ClaimService();
const nftRequest = new BuildingsModel.BuildingsService();
const userModel = new UserModel.InventoryService();
const dropService = new BuildingsModel.DropService();
const verifyService = new BuildingsModel.VerifyService();

const {MAX_LEVELS} = require('../config/buildingLevel');
class BuildingService{
    constructor() {}

    static async getNFTUpgradeRequirements(address, buildingType, buildingLevel) {
        logger.info(`BuildingService.getNFTUpgradeRequirements START`)

        let nextLevel = buildingLevel + 1
        if ( nextLevel > MAX_LEVELS[buildingType] ) {
            throw `At Max Level`
        }

        let requirements
        try {
            requirements = await BuildingsQueries.getNFTUpgradeRequirements(address, buildingType, nextLevel)
        } catch (error) {
            logger.error(`BuildingsQueries.getNFTUpgradeRequirements error : ${Utils.printErrorLog(error)}`)
            throw error;
        }
        let upgradeAllowed = true
        let requirementsArray = []
        if ( requirements.length != 0 ) {
            let requirement = requirements[0]
            if ( !(requirement.isAncienAllowed && requirement.isWoodAllowed && requirement.isStoneAllowed) ) {
                upgradeAllowed = false
            }
            if ( requirement.requiredAncien != 0 ) {
                requirementsArray.push({
                    name: 'ancien',
                    image: process.env.ANCIEN_IMAGE,
                    quantity: requirement.requiredAncien,
                    isAllowed: requirement.isAncienAllowed
                })
            }
            if ( requirement.requiredWood != 0 ) {
                requirementsArray.push({
                    name: 'wood',
                    image: process.env.WOOD_IMAGE,
                    quantity: requirement.requiredWood,
                    isAllowed: requirement.isWoodAllowed
                })
            }
            if ( requirement.requiredStone != 0 ) {
                requirementsArray.push({
                    name: 'stone',
                    image: process.env.STONE_IMAGE,
                    quantity: requirement.requiredStone,
                    isAllowed: requirement.isStoneAllowed
                })
            }
        }
        for ( let requirement of requirements ) {
            if ( !requirement.isItemAllowed ) {
                upgradeAllowed = false
            }
            if ( requirement.requiredItemQuantity != 0 ) {
                requirementsArray.push({
                    name: requirement.requiredItemName,
                    image: requirement.requiredItemImage,
                    quantity: requirement.requiredItemQuantity,
                    isAllowed: requirement.isItemAllowed
                })
            }
        }

        logger.info(`BuildingService.getNFTUpgradeRequirements END`)
        return { upgradeAllowed: upgradeAllowed, requirementsArray: requirementsArray, requirements: requirements }
    }

    static async getBuilders(address){
        logger.debug('getBuilders start');
        let responseGetTownhallStaked
        let buildingsInUpgrade

        try{
            responseGetTownhallStaked = await BuildingsQueries.getTownhallLevelStaked(address);
        }
        catch(err){
                return err;
        }
        logger.debug(`response getTownhallLevelStaked: ${responseGetTownhallStaked}`);
  
        let levelTownhallStaked = responseGetTownhallStaked.length > 0 ? responseGetTownhallStaked[0].level : 0;

        let buildersTotal = this.getBuildersAvailable(levelTownhallStaked) + 1;
        
        try{
            buildingsInUpgrade = await BuildingsQueries.getBuildingsInUpgrade(address);
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

    static getBuildersAvailable(TownhallLevel){
        if(TownhallLevel < 11){
            return 0;
        }
    }


    static async retrieveImage(responseAccountData){
        logger.debug(`retrieveImage start`);
        for(let i = 0; i < responseAccountData.length; i++){
            let bkNumber = await BuildingsQueries.getBkNumberGivenBuildingId(responseAccountData[i].id);
            let imageUrl;
            let upgradeImageUrl;

            bkNumber = bkNumber[0].idSkin;

            imageUrl = BuildingsHelper.createImageUrl(responseAccountData[i].type, 
                responseAccountData[i].level,
                responseAccountData[i].bundle,
                bkNumber);

            if(responseAccountData[i].level < MAX_LEVELS[responseAccountData[i].type]){
                upgradeImageUrl = BuildingsHelper.createImageUrl(responseAccountData[i].type, 
                    responseAccountData[i].level + 1,
                    responseAccountData[i].bundle,
                    bkNumber);
            }else{
                upgradeImageUrl = null;
            }

            responseAccountData[i].imageURL = imageUrl;
            responseAccountData[i].upgradeImage = upgradeImageUrl;

        }
        // logger.debug(`final response: ${JSON.stringify(responseAccountData)}`);
        logger.debug(`retrieveImage end`);
        return responseAccountData;
    }

    static async retrieveImageSprite(responseAccountData){
        logger.debug(`retrieveImageSprite start`);
        for(let i = 0; i < responseAccountData.length; i++){
            let imageSprite;

            if(responseAccountData[i].upgradeStatus){
                imageSprite = BuildingsHelper.createImageSpriteUpgradeUrl(responseAccountData[i].type, responseAccountData[i].level);
            }else{
                imageSprite = BuildingsHelper.createImageSpriteUrl(responseAccountData[i].type, responseAccountData[i].level);
            }

            responseAccountData[i].imageSprite = imageSprite;
        }
        // logger.debug(`final response: ${JSON.stringify(responseAccountData)}`);
        logger.debug(`retrieveImageSprite end`);
        return responseAccountData;
    }

    static async calculateNewExpClaim(nft){
        
        logger.debug("calculateNewExpClaim start");

            let lastClaimResponse = nft;

            let newClaim = new Date();

            let lastClaimAction = new Date(lastClaimResponse.lastClaimAction);
            let lastResetLeaderboard = new Date(process.env.LAST_RESET_LEADERBOARD);

            logger.debug(`newClaim:${newClaim}`);
            logger.debug(`lastClaimActionBefore:${lastClaimAction}`);

            if(lastClaimAction < lastResetLeaderboard) lastClaimAction = lastResetLeaderboard
            let lastClaimStored = lastClaimResponse.lastClaimStored;
            let lastClaimSeconds = (new Date(lastClaimAction).getTime()) / 1000;
            let dropQuantity = lastClaimResponse.dropQuantity;
            let dropInterval = lastClaimResponse.dropInterval;
            let capacity = lastClaimResponse.capacity;

            let dropPerSecond = dropQuantity / dropInterval;

            logger.debug(`dropPerSecond:${dropPerSecond}`);

            let newClaimSeconds = (new Date().getTime()) / 1000;

            let intervalsFromLastClaim = (newClaimSeconds - lastClaimSeconds);
            let increment = intervalsFromLastClaim * dropPerSecond;

            logger.debug(`newClaimSeconds: ${newClaimSeconds}, lastClaimSeconds: ${lastClaimSeconds}`);
            logger.debug(`intervalsFromLastClaim: ${intervalsFromLastClaim}, increment: ${increment}`);


            if(increment < 0) return false;

            let newLastClaimStored = lastClaimStored + increment;
            if(newLastClaimStored > capacity) newLastClaimStored = capacity;

            let newLastClaim = new Date().toISOString();
            
            let response;
            logger.debug(`response: ${JSON.stringify(response)}`);
            logger.debug("calculateNewExpClaim end");

            
            return newLastClaimStored;
    }

    static async calculateNewStoredResources(nft){
        
        logger.debug("calculateNewStoredResources start");

            let lastClaimResponse = nft;

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
            
            let response;
            
            try {
                response = await BuildingsQueries.updateStoredResources(newStored, nft.idBuilding, nft.type, newLastClaim);
            } catch (error) {
                logger.error(`Error in BuildingsQueries updateStoredResources:${Utils.printErrorLog(error)}`);
                return res
                .json({
                    success: false,
                    error: error
                });
                
            }
            logger.debug(`response: ${JSON.stringify(response)}`);
            logger.debug("calculateNewStoredResources end");

            response = {newStored}
            return response;
    }

    static async calculateExperienceAfterUpgrade(building){
        logger.debug("calculateExperienceAfterUpgrade start");
        
        let upgradeModel = building;

        try{
            let upgradeHour = upgradeModel.upgradeTime / 3600;
            let increment = upgradeHour * upgradeModel.newDropQuantity;

            increment = parseInt(increment);

            if(increment < 0) return false;

            let incrementExp;

            switch (building.type) {
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

            logger.debug(`calculateExperienceAfterUpgrade, increment: ${increment}, incrementExp: ${incrementExp}, address: ${building.address}`);
            let responseExp;
            try {
                responseExp = await BuildingService.experienceHandler(building.address,incrementExp);
            } catch (error) {
                logger.error(`Errore in BuildingService experienceHandler error: ${JSON.stringify(error)}`);
                return error;
            }

            logger.debug("calculateExperienceAfterUpgrade end");
            return responseExp;


        }catch(error){
            logger.error(`Error in calculateExperienceAfterUpgrade, error: ${JSON.stringify(error)}`);
            return error;
        }

    }

    static async experienceHandler(address,incrementExp){
        logger.debug(`experienceHandler start, address : ${address}, incrementExp: ${incrementExp}`);

        let response;
        let final;

        try {
            response = await LeaderboardQueries.getUserLeaderboard(address);
        } catch (error) {
            logger.error(`Errore in calculateNewStoredResources, error: ${JSON.stringify(error)}`);
            return error;
        }
        logger.debug(`leaderboardQueries.getUserLeaderboard response : ${JSON.stringify(response)}`);

        if(response.length == 0){
            try {
                final = await LeaderboardQueries.createUserLeaderboard(address, incrementExp);
            } catch (error) {
                logger.error(`Errore in leaderboardQueries.createUserLeaderboard, error: ${JSON.stringify(error)}`);
                return error;
            }
        }else{
            try {
                final = await LeaderboardQueries.addExperience(address, incrementExp);
            } catch (error) {
                logger.error(`Errore in leaderboardQueries.addExperience, error: ${JSON.stringify(error)}`);
                return error;  
            }
        }

        return final;
    }

    static async checkUpgradeStatus(buildingsOwned){
        logger.debug("checkUpgradeStatus start");

        let building;
        for(building of buildingsOwned){
            
            if(building.stake && building.upgradeStatus){
                logger.debug(`analizing: ${JSON.stringify(building)}`);

                let endingTime = new Date(building.endingTime);
                let nowTime = new Date();

                let endingTimeSeconds = endingTime.getTime();
                let nowTimeSeconds = nowTime.getTime();


                //TODO coSA SUCCEDE SE NON TROVA QUALCOSA AL LIVELLO USCCESSIVO? pUò SUCEDERE?

                let lastClaim = endingTime;
        
                if(nowTimeSeconds >= endingTimeSeconds){
                    logger.debug(`elemento: ${JSON.stringify(building)}, ended upgrade`);
                    logger.debug(`upgrade ended, passing into updateFirstLogin: building and upgrade model: ${JSON.stringify(building)}, lastClaim: ${JSON.stringify(building.lastClaim)}`);

                    console.log('UpgradeDone Leaderboard ENTARTO')

                    let expUpgrade;
                
                    if(building.type != 4){
                        try{
                        expUpgrade = await BuildingService.calculateExperienceAfterUpgrade(building);
                        }catch(error){
                            logger.error(`Error in calculateExperienceAfterUpgrade:${JSON.stringify(error)}`);
                        }
                    }

                    try {
                        let resultUpdate = await BuildingsQueries.updateFirstLogin(
                            building,
                            lastClaim
                            );
                    } catch (error) {
                        logger.error(`Error in updateFirstLogin:${Utils.printErroLog(error)}`);
                    }
                    
                    building.upgradeStatus = false;
                    building.upgradeFirstLogin = true;
                    building.lastClaim = lastClaim;
                    building.level = building.upgradeLevel;

                    building.capacity = building.newCapacity;
                    building.dropQuantity = building.newDropQuantity;

                    building.description = building.newDescription;
                    building.imageURL = building.upgradeImage;
                    building.moreInfo = building.newMoreInfo;


                    
                    building.newCapacity = building.doubleNewCapacity;
                    building.newDropQuantity = building.doubleNewDropQuantity;
                    
                    building.ancien = building.doubleAncien;
                    building.wood = building.doubleWood;
                    building.stone = building.doubleStone;
                    building.upgradeTime = building.doubleUpgradeTime;
                    building.upgradeImage = building.doubleUpgradeImage;
                    building.newDescription = building.doubleNewDescription;
                    building.newMoreInfo = building.doubleNewMoreInfo;

                }
            }
        
        }

        logger.debug("checkUpgradeStatus end");

        return buildingsOwned;
    }

    static async verifyProperty(address, nftId, type){
        logger.debug(`verifyProperty start`);
        try{
            let response = await BuildingsQueries.verifyProperty(address, nftId, type)
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

    static async verifyPropertyAndStake(address, nftId, type){
        logger.debug(`verifyPropertyAndStake start`);
        try{
            let response = await BuildingsQueries.verifyPropertyAndStake(address, nftId, type)
            logger.debug(`responseVerify: ${JSON.stringify(response)} `);
            if(response == null || response == undefined || response.length < 1){
                return false;
            }
            logger.debug(`verifyPropertyAndStake end`);
            return true;
        }catch(err){
            logger.error(`error in verifyPropertyAndStake:${Utils.printErrorLog(err)} `);
            return false;
        }
    }

    static async claimAll(){
        logger.debug(`claimAll start`);

        let buildings;
        try{
            buildings = await BuildingsQueries.getStakedBuildings();
            logger.debug(`getStakedBuildings: ${JSON.stringify(buildings)} `);
        }catch(err){
            logger.error(`error in getStakedBuildings:${Utils.printErrorLog(err)} `);
            return {success: false};
        }

        for (let building of buildings){
            
            let nftId = building.idBuilding;
            let type = building.type;
            let address = building.address;

            let responseNewStored, newLastClaim, resources, resourceAmount, response, resourceType;

            try {
                responseNewStored = await dropService.calculateNewStoredResources(nftId, type, address);
            } catch (error) {
                logger.error(`Error in dropService.calculcateNewStoredResources:${Utils.printErrorLog(error)}`);
                return {success: false};
            }
            logger.debug(`response calculateNewStoredResources : ${JSON.stringify(responseNewStored)} `);
            if(responseNewStored == false){
                return {success: false};
            }
            newLastClaim = new Date().toISOString();
        
        
            try {
                resources = await userModel.getResources(address);
            } catch (error) {
                logger.error(`Error in userModel.getResources:${Utils.printErrorLog(error)}`);
                return {success: false};
            }
            logger.debug(`response getResources : ${JSON.stringify(resources)} `);
        
            resourceAmount = userModel.getResourceGivenType(resources, type);
        
        
            let integerPart = Math.floor(responseNewStored.newStored);
            let remainRes = responseNewStored.newStored - integerPart;
        
            try {
                response = await requestClaim.makeClaim(newLastClaim, nftId, type, remainRes);
            } catch (error) {
                logger.error(`Error in requestClaim.makeClaim:${Utils.printErrorLog(error)}`);
                return {success: false};
            }
            logger.debug(`response makeClaim : ${JSON.stringify(response)} `);
        
            resourceType = requestClaim.getResourceType(type);


            try {
                response = await requestClaim.setResourceAfterClaim(address, newAmount, resourceType);
            } catch (error) {
                logger.error(`Error in requestClaim.setResourceAfterClaim:${Utils.printErrorLog(error)}`);
                return {success: false};
            }
            logger.debug(`response setResourceAfterClaim : ${JSON.stringify(response)} `);
        
        }

        try {
            let resetExp = await BuildingsQueries.resetExp();
        } catch (error) {
            logger.error(`Error in BuildingsQueries resetExp:${Utils.printErrorLog(error)}`);
                return {success: false};
        }

        logger.debug(`claimAll end`);
    }
    
    static verifyPosition(NFTS, position, nftId, type){
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

module.exports = {BuildingService}