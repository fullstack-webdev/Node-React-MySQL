const logger = require('../../logging/logger');
const mysql  = require('../../config/databaseConfig');

const { ShopService }        = require('../../models/shopModel');
const { BuildingsQueries }    = require('../../queries/buildingsQueries')
const ShopBuildingQueries    = require('../../queries/shop/shopBuildingQueries')
const { Utils } = require("../../utils/utils");

const UserModel    = require('../../models/userModel')
let userInventory = new UserModel.InventoryService();

class buildingService{
    constructor() {}

    static async buildingBuilder(res,id,address,shopItem,nfts){
        let shopService = new ShopService();
        let shopObject;
        let responseBuildingObject = {};
        let responseBuilding = [];
        let responseUpdate;
        let responseNewNfts = [];
        let responseNewNft = {};
        let response;
        let finalResponse = {};
        let resources;
        let maxBuildings;
        let upgradeModel;

        shopObject = await shopService.shopBuilder(shopItem, nfts);


        if(shopObject.length == 0){
            logger.error("Error in shopService shopBuilder, id does not exist:",id);
            return 401
            
        }
        
        shopObject = shopObject[0];


        logger.debug(`shopService shopBuilder response :${JSON.stringify(shopObject)}`);

        if(!shopService.checkRequirements(shopObject)){
            logger.warn(`Error in shopService checkRequirements`)
            return 401
            
        }


        if(!shopService.checkSupply(shopObject)){
            logger.warn(`Error in shopService checkSupply`);
            try {
                response = await shopService.setUnavialable(shopObject.id);
                logger.debug(`shopService setUnavialable response:${JSON.stringify(response)}`);
            } catch (error) {
                logger.error(`Error in shopService setUnavialable :${Utils.printErrorLog(error)} `);
            }
            return 409;
        }


        try {
            resources = await userInventory.getResources(address);
        } catch (error) {
            logger.error(`Error in UserModel InventoryService getResources: ${Utils.printErrorLog(error)}`);
            return 401
            
        }
        logger.debug(`userInventory.getResources response : ${JSON.stringify(resources)}`);


        if(!shopService.checkResources(resources,shopObject)){
            logger.warn(`Error in shopService checkResources ,resources:${resources}`);
            return 401
           
        }


        maxBuildings = shopService.retrieveMaxValueGivenIdCatalog(id);

        if (shopObject.price.ancien > 0) {
            try {
            response = await ShopBuildingQueries.subAncienBuilding(address, id, maxBuildings, shopObject.price.ancien);
            } catch (error) {
                logger.error(`Error in subAncien : ${address}, ${Utils.printErrorLog(error)}`);
        
                return 401
            
            }
            logger.debug(`shopService subAncienLand response : ${JSON.stringify(response)}`);
        }

        
        for(let requirement of shopObject.requirements){
            console.log('requirement ', requirement)
            try{
                upgradeModel = await BuildingsQueries.getUpdateModelBytypeAndLevel(requirement.type, requirement.backLevel);
                console.log("upgradeModel first: ", upgradeModel);
                if(upgradeModel.length > 0) upgradeModel = upgradeModel[0];
                console.log("upgradeModel then: ", upgradeModel);
                responseUpdate = await BuildingsQueries.updateLevelAndCursed(requirement.id, requirement.backLevel, upgradeModel.newDropQuantity, upgradeModel.newCapacity);
            }catch(error){
                logger.error(`Error in updateLevel:  ${address}, ${Utils.printErrorLog(error)}`);
                return 401
            }

            responseNewNft.id = requirement.id;
            responseNewNft.type = requirement.type;
            responseNewNft.level = requirement.backLevel;
            responseNewNft.cursed = true;

            responseNewNfts.push(responseNewNft);
        }


        try {
            response = await ShopBuildingQueries.buyTempBuilding(shopObject.type,address,shopObject.id);
        } catch (error) {
            logger.error(`Error in buyTempBuilding:  ${address}, ${Utils.printErrorLog(error)}`);
            return 401
            
        }

        

        

        logger.debug(`shopService.buyLand response : ${JSON.stringify(response)}`);

        responseBuildingObject.item = shopObject;
        responseBuildingObject.quantity = 1;
        responseBuildingObject.prng = false;

        responseBuilding.push(responseBuildingObject);

        if(responseNewNfts.length > 0){
            finalResponse.nfts = responseNewNfts,
            finalResponse.hasNfts = true,
            finalResponse.buildings = responseBuilding
        }else{
            finalResponse.buildings = responseBuilding
        }
        
        return finalResponse;
    }
}

module.exports = buildingService