const logger = require('../logging/logger');


class BuildingsHelper{

    static createImageUrl(type, level, bundle, bkNumber){
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

    static createImageSpriteUpgradeUrl(type, level){
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

    static createImageSpriteUrl(type, level){
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

    static async createEndingTime(upgradeTime){
        logger.debug("createEndingTime start");

        let now = new Date();
        let nowTime = now.getTime();
        let endingTime = new Date(nowTime + (upgradeTime * 1000));

        logger.debug(`endingTime: ${endingTime.toISOString()}`);
        logger.debug("createEndingTime end");

        return endingTime.toISOString();
    }

    static calculateNewResources(resources, upgradeResources){
        resources.ancien = resources.ancien - upgradeResources.ancien;
        resources.wood = resources.wood - upgradeResources.wood;
        resources.stone = resources.stone - upgradeResources.stone;

        return resources;

    }
    
    static checkCursed(response){
        if(response != null && response.cursed != null && response.cursed == 1)
            return true;
        return false;
    }
}
module.exports = {BuildingsHelper}