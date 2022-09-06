const ShopModel = require("../models/shopModel");
const UserModel = require('../models/userModel');
const BuildingsModel = require('../models/buildingsModel');
const ShopBuildingService = require('../services/shop/shopBuildingService');
const mysql = require('../config/databaseConfig');

const Sanitizer = require('../utils/sanitizer');
const logger = require("../logging/logger");

const {ShopValidation} = require('../validations/shopValidation');
const {ShopQueries} = require('../queries/shop/shopQueries');
const {ShopService} = require('../services/shop/shopService');
const { Utils } = require("../utils/utils");
const Validator = require('../utils/validator');
let shopService = new ShopModel.ShopService();
let landService = new ShopModel.LandService();
let ticketService = new ShopModel.TicketService();
let userInventory = new UserModel.InventoryService();
let buildingService = new BuildingsModel.BuildingsService();



let sanitizer = new Sanitizer();


async function getShop(req, res){
    logger.info(`getShop START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let address = req.locals.address;
    let shopList;
    let response = [];
    let nfts;

    if(!sanitizer.validateInput(address)){
        logger.warn(`getShop address undefined`);
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

    logger.info(`getShop address: ${address}`);

    try{
        shopList = await shopService.getShop();

    }catch(error){
        logger.error(`Error in shopService getShop: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }

    logger.debug(`shopService getShop response: ${JSON.stringify(shopList)}`);

    try{
        nfts = await buildingService.getStakedNFT(address);

    }catch(error){
        logger.error(`Error in shopService getStakedBuildings: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }

    logger.debug(`shopService getStakedBuildings response: ${JSON.stringify(nfts)}`);


    response = await shopService.shopBuilder(shopList,nfts);
    



    logger.info(`getShop response:${JSON.stringify(response)}`);
    logger.info("getShop END");
    return res
        .status(200)
        .json({
            success: true,
            data: {
                catalog: response,
            }
        });
}

async function buyShop(req, res){
    logger.info(`buyShop START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let address = req.locals.address;
    let id = req.body.id;
    let shopItem;
    let nfts;
    let tickets;
    let shopObject;
    let resources;
    let response;
    let maxLand;
    let rarity;
    let inventory;
    let hasNfts;
    let editedNfts;

    if(!sanitizer.validateInput(address, id)){
        logger.warn(`buyShop address or id undefined, address: ${address}, id: ${id}`);
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

    logger.info(`buyShop address: ${address}`);
    logger.info(`buyShop request, address:${address}, id:${id}`);

    id = parseInt(id);

    try{
        nfts = await buildingService.getStakedNFT(address);

    }catch(error){
        logger.error(`Error in shopService getStakedBuildings: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }

    logger.debug(`shopService getStakedBuildings response: ${JSON.stringify(nfts)}`);

    try{
        shopItem = await shopService.getShopItem(id);
    }catch(error){
        logger.error(`Error in shopService getShopItem: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }

    logger.debug(`shopService getShopItem response:${JSON.stringify(shopItem)}`);

    if(shopItem.length == 0){
        logger.error("shopItem not exist");

        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "shopItem not exist"
            }
        })
    }

    //shopItem = shopItem[0];

    //switch su category 1 su land 2 su ticket
    switch (shopItem[0].category) {
        case 1:

            try {
                response = await landService.landBuidler(res,id,address,shopItem,nfts);
            } catch (error) {
                logger.error(`Error in LandService LandBuilder: ${Utils.printErrorLog(error)}`);
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
                response = await ticketService.buyTicket(res,id,address,shopItem,nfts);
                if (response == 409) return res 
                .status(409)
                .json({
                    success: false,
                    error: {
                        errorMessage: 'Out of supply'
                    }
                });
                if (response == 401) return res 
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: 'Error #12938761'
                    }
                });
            } catch (error) {
                logger.error(`Error in ticketService buyTicket: ${Utils.printErrorLog(error)}`);
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
                responseBuildings = await ShopBuildingService.buildingBuilder(res,id,address,shopItem,nfts);
            } catch (error) {
                logger.error(`Error in ShopBuildingService buildingBuidler: ${Utils.printErrorLog(error)}`);
                return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                });
            }

            if (response == 409) return res 
                .status(409)
                .json({
                    success: false,
                    error: {
                        errorMessage: 'Out of supply'
                    }
                });

            if (responseBuildings == 401) 
            return res 
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'Error #12938761'
                }
            });

            hasNfts = responseBuildings.hasNfts;
            editedNfts = responseBuildings.nfts;
            response = responseBuildings.buildings;
            break;

        default:
            break;
    }

    try {

        inventory = await userInventory.getResources(address);
        inventory = userInventory.buildResourcesResponse(inventory);

    } catch(error){
        logger.error(`Error in userInventory getResources:  ${address}, ${Utils.printErrorLog(error)}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Error in shopService userInventory.getResources"
            }
        });
    }

    // if(shopItem.category == 2){
    //     try {//return tickets

    //         tickets = await userInventory.getResources(address);
    //         tickets = userInventory.buildResourcesResponse(inventory);

    //     } catch(error){
    //         logger.error(`Error in userInventory getResources:  ${address}, ${Utils.printErrorLog(error)}`);
    //         return res
    //         .status(401)
    //         .json({
    //             success: false,
    //             error: {
    //                 errorMessage: "Error in shopService userInventory.getResources"
    //             }
    //         });
    //     }

    //     return res
    //     .json({
    //         success: true,
    //         data: {
    //             inventory,
    //             tickets
    //         }
    //     })
    // }
    


    
    logger.info(`buyShop END: address: ${address}, inventory: ${JSON.stringify(inventory)}`);

    return res
    .json({
        success: true,
        data: {
            inventory,
            minted: response,
            hasNfts,
            nfts: editedNfts 
        }
    })


}

async function shopHistory(req, res){
    logger.info(`shopHistory START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    

    let validation;
        validation = ShopValidation.shopHistoryValidation(req);
        if(!validation.success){
            return res
            .status(401)
            .json(validation);
        }

    
    let address = req.locals.address;
    let lands, tickets, buildingtemp;
    let response;
    
    try {
        lands = await ShopQueries.getLands(address);
    } catch (error) {
        logger.error(`Error in shopQueries.getLands: ${Utils.printErrorLog(error)}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });  
    }

    logger.debug(`getLands response : ${JSON.stringify(lands)}`);

    try {
        tickets = await ShopQueries.getTickets(address);
    } catch (error) {
        logger.error(`Error in shopQueries.getTickets: ${Utils.printErrorLog(error)}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });  
    }

    logger.debug(`getTickets response : ${JSON.stringify(tickets)}`);

    try {
        buildingtemp = await ShopQueries.getBuildingtemp(address);
    } catch (error) {
        logger.error(`Error in shopQueries.getBuildingtemp: ${Utils.printErrorLog(error)}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });  
    }

    logger.debug(`getBuildingtemp response : ${JSON.stringify(buildingtemp)}`);
    
    response = ShopService.shopHistoryBuilder(lands, tickets, buildingtemp);
    logger.info(`shopHistoryBuilder END: address: ${JSON.stringify(response)}`);
    
    return res
    .json({
        success: true,
        data: {
            shopHistory: response
        }
    })

}

module.exports = {getShop, buyShop, shopHistory}