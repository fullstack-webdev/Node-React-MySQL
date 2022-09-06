const logger = require('../../logging/logger')
const BuildingsModel = require('../../models/buildingsModel');
const { MAX_LEVELS } = require('../../config/buildingLevel');

class BuildingsInterface {
    constructor() { }

    static buildBuildingsModel(rows) {
        let finalResponse = [];
        logger.debug(`buildBuildingsModel start`);

        for (let i = 0; i < rows.length; i++) {
            if ((rows[i].level) == MAX_LEVELS[rows[i].type]) {

                let newUpgradeResources = new BuildingsModel.UpgradeResources(null, null, null);

                let newNFT = new BuildingsModel.BuildingsModel(
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
                    rows[i].level >= MAX_LEVELS.prestige[rows[i].type],
                    rows[i].position
                );

                finalResponse.push(newNFT);
                //break;

            }

            else {

                let newUpgradeResources = new BuildingsModel.UpgradeResources(
                    rows[i].ancien,
                    rows[i].wood,
                    rows[i].stone);

                let newNFT = new BuildingsModel.BuildingsModel(
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
                    rows[i].newCapacity,
                    rows[i].newDropQuantity,
                    rows[i].upgradeImage,  //new version 1
                    rows[i].upgradeTime,
                    newUpgradeResources,
                    rows[i].upgradeStatus,
                    rows[i].upgradeFirstLogin,
                    rows[i].endingTime,
                    false,
                    rows[i].level >= MAX_LEVELS.prestige[rows[i].type],
                    rows[i].position
                );

                finalResponse.push(newNFT);
            }
        }


        logger.debug(`buildBuildingsModel end`);

        return finalResponse;
    }

    static buildResponseModelNFT(responseData) {

        let finalResponse;
        logger.debug(`buildResponseModelNFT start`);


        if (responseData.level == MAX_LEVELS[responseData.type]) {
            let newUpgradeResources = new BuildingsModel.UpgradeResources();

            let newNFT = new BuildingsModel.BuildingsModel(
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
        else {
            let newUpgradeResources = new BuildingsModel.UpgradeResources(
                responseData.ancien,
                responseData.wood,
                responseData.stone);

            let newNFT = new BuildingsModel.BuildingsModel(
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
        }

        logger.debug(`final response: ${JSON.stringify(finalResponse)}`);
        logger.debug(`buildResponseModelNFT end`);

        return finalResponse;
    }

}

module.exports = { BuildingsInterface }