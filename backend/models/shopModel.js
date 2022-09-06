const logger= require('../logging/logger');
const mysql = require('../config/databaseConfig');
const random = require('random');

const UserModel = require('../models/userModel');
const TicketModel = require('../models/ticketModel');
const Sanitizer = require('../utils/sanitizer');
const ShopBuildingQueries = require('../queries/shop/shopBuildingQueries');
const { Utils } = require("../utils/utils");


let userInventory = new UserModel.InventoryService();
let ticketService = new TicketModel.TicketService();
let sanitizer = new Sanitizer();

class ShopService {

    constructor() {}

    async getShop(){
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT * 
            FROM catalog 
            WHERE toShow = 1
            ORDER BY available desc`;

            mysql.query(sql, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error("null error in getShop: ");

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    async getShopCatalog(idShop){
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT id, name, description, image, ancienCost, woodCost, stoneCost 
            FROM catalog
            WHERE idShop = ? `;

            mysql.query(sql, idShop, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error("null error in getShopCatalog: ", address);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });

    }
    async getShopItem(id){
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM catalog
            WHERE id = ?`;

            mysql.query(sql, id, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error("null error in getShopCatalog: ");

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });

    }

    async setUnavialable(id){
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE catalog
            SET available = 0
            WHERE id = ?`;

            mysql.query(sql, id, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error("null error in setUnavailable");

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });

    }

    async buyLand(type,rarity,idCatalog,name,image,description,address){
        return new Promise((resolve, reject) => {
            let sql = `
            INSERT INTO lands (name,image,description,address, type, rarity, idLand, idCatalog, saleTime)
            VALUES(?, ?, ?, ?, ?, ?,(SELECT * FROM (SELECT count(*) FROM lands) as temp), ?, current_timestamp)`;

            mysql.query(sql, [name,image,description,address, type, rarity, idCatalog, idCatalog], (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error("null error in buyLand");

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });

    }


    checkBuildingCursedRequired(nfts,type,require){
        for (let nft of nfts){
            if (nft.type==type && nft.level>=require && !nft.cursed){           
                return {
                    success: true,
                    id: nft.id,
                    nftId: nft.idBuilding
                };                 
            }
        }
        return {success: false};
    }

    buildCursedRequirements(shopItem, nfts){
        console.log("entrato buildCursedRequirements");
        let resultCheck;
        let requirements = [];
        if(shopItem.thRequire > 0){
            resultCheck = this.checkBuildingCursedRequired(nfts, 1, shopItem.thRequire);
     
            requirements.push({
                type: 1,
                level: shopItem.thRequire,
                isAllowed: resultCheck.success,
                id: resultCheck.success ? resultCheck.id : null,
                backLevel: shopItem.thBackLevel,
                nftId: resultCheck.success ? resultCheck.nftId : null
            })
        }
     
        if(shopItem.ljRequire > 0){
            resultCheck = this.checkBuildingCursedRequired(nfts, 2, shopItem.ljRequire);
     
            requirements.push({
                type: 2,
                level: shopItem.ljRequire,
                isAllowed: resultCheck.success,
                id: resultCheck.success ? resultCheck.id : null,
                backLevel: shopItem.ljBackLevel,
                nftId: resultCheck.success ? resultCheck.nftId : null
            })
        }
     
        if(shopItem.smRequire > 0){
            resultCheck = this.checkBuildingCursedRequired(nfts, 3, shopItem.smRequire);
     
            requirements.push({
                type: 3,
                level: shopItem.smRequire,
                isAllowed: resultCheck.success,
                id: resultCheck.success ? resultCheck.id : null,
                backLevel: shopItem.smBackLevel,
                nftId: resultCheck.success ? resultCheck.nftId : null
            })
        }
        return requirements;
    }


    checkBuildingRequired(nfts,type,require){
        for (let nft of nfts){
            if (nft.type==type && nft.level>=require){           
                return true;                 
            }
        }
        return false;
    }

    buildRequirements(shopItem, nfts){
        console.log("entrato build Requirements");
        let resultCheck;
        let requirements = [];
        if(shopItem.thRequire > 0){
            resultCheck = this.checkBuildingRequired(nfts, 1, shopItem.thRequire);
     
            requirements.push({
                type: 1,
                level: shopItem.thRequire,
                isAllowed: resultCheck
            })
        }
     
        if(shopItem.ljRequire > 0){
            resultCheck = this.checkBuildingRequired(nfts, 2, shopItem.ljRequire);
     
            requirements.push({
                type: 2,
                level: shopItem.ljRequire,
                isAllowed: resultCheck
            })
        }
     
        if(shopItem.smRequire > 0){
            resultCheck = this.checkBuildingRequired(nfts, 3, shopItem.smRequire);
     
            requirements.push({
                type: 3,
                level: shopItem.smRequire,
                isAllowed: resultCheck
            })
        }
        return requirements;
    }

    checkRequirements(shopItem){
        let requirements= shopItem.requirements;
        for(let req of requirements){
            if(!req.isAllowed)
                return false
        }
        return true;
    }

    checkSupply(shopItem){
        let supply = shopItem.supply;
    
        if(!supply.isAllowed)
            return false;
    
        return true;
    }

    checkResources(resources,shopItem){
        let price = shopItem.price;
        if(!((resources.ancien>=price.ancien) && (resources.wood>=price.wood) && (resources.stone>=price.stone)))
            return false;
        return true;
    }

    async getCountFromLands(id){
        console.log(id);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT count(*) as counter
            FROM lands
            WHERE idCatalog = ?`;

            mysql.query(sql, id, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                // if(rows == undefined || rows == null){
                //     logger.error("null error in getCountFromLands: ", address);

                //     return reject({
                //         message: "undefined"
                //     });
                //}
                return resolve(JSON.parse(JSON.stringify(rows)));
                

            });
        });

    }
    
    retrieveMaxValueGivenIdCatalog(id){
        switch(id){
            case 1 :
            case 4: 
                return process.env.MAX_FOREST_COMMON;
            case 124:
                return process.env.MAX_BUILDINGS_TOWNHALL_SHOP
            case 134:
                return process.env.MAX_BUILDINGS_LUMBERJACK_SHOP
            case 144:
                return process.env.MAX_BUILDINGS_STONEMINE_SHOP;
            default: 
                return 0;
        }
    }

    retrieveRarityGivenIdCatalog(id){
        switch(id){
            case 1 :
            case 4: 
                return 1;
            default: 
                return 1;
        }
    }

    async buildSupply(shopItem){
        logger.debug(`buildSupply start`);
        logger.debug(`buildSupply shopItem:${JSON.stringify(shopItem)}`);
        let supply = {};
        let result;
        let resultNextEndingDraws;
        let counter;
        let max_land_type;
        let typeDraw;
        let max_buildings_type;

        if(shopItem.category == 1){
            try {
                result = await this.getCountFromLands(shopItem.id);
            } catch (error) {
                console.log(error);
                logger.error(`error in buildSupply:${Utils.printErrorLog(error)}`); 
                return error;
            }
            if(result == null || result == undefined){
                counter = 0;
            }else{
                counter = result[0].counter;
            }
            max_land_type = parseInt(this.retrieveMaxValueGivenIdCatalog(shopItem.id));

            logger.debug(`\n result , ${JSON.stringify(result)}`);
            if(counter < max_land_type && shopItem.available){
                supply.isAllowed = true
            }else{
                supply.isAllowed = false
            }

            supply.total = max_land_type;
            supply.available = counter;

            if(shopItem.type == 1){
                supply.isAllowed = shopItem.available ? true : false;
                supply.total = -1;
                supply.available = null;
            }
            
     
            
     
        }

        if(shopItem.category == 2){
            typeDraw = ticketService.retrieveTicketTypeGivenIdCatalog(shopItem.id);
            
            try {
                result = await ticketService.getBoughtTicketsInCurrentDrawGivenType(typeDraw);
            } catch (error) {
                console.log(error);
                logger.error(`error in getBoughtTicketsInCurrentDrawGivenType:${Utils.printErrorLog(error)}`); 
                return error;
            }

            logger.debug(`result getBoughtTicketsInCurrentDrawGivenType:, ${JSON.stringify(result)}`);

            try {
                resultNextEndingDraws = await ticketService.getNextEndingDrawsGivenType(typeDraw);
            } catch (error) {
                console.log(error);
                logger.error(`error in getNextEndingDrawsGivenType:${Utils.printErrorLog(error)}`); 
                return error;
            }

            logger.debug(`result getNextEndingDrawsGivenType:, ${JSON.stringify(resultNextEndingDraws)}`);

            if(resultNextEndingDraws.length == 0){
                
                try {
                    result = await ticketService.getNextStartingDrawsGivenType(typeDraw);
                } catch (error) {
                    console.log(error);
                    logger.error(`error in getNextStartingDrawsGivenType:${Utils.printErrorLog(error)}`); 
                    return error;
                }

                supply.isAllowed = false;
                supply.nextOpen = sanitizer.validateInput(result[0]) ? result[0].startTime : null;

            }else if(shopItem.available && sanitizer.validateInput(result) && sanitizer.validateInput(result[0]) ){
                supply.isAllowed = true
                supply.total = result[0] ? result[0].quantity : 0;
                supply.available = -1;
            }else{
                supply.total = result[0] ? result[0].quantity : 0;

                try {
                    result = await ticketService.getNextStartingDrawsGivenType(typeDraw);
                } catch (error) {
                    console.log(error);
                    logger.error(`error in getNextStartingDrawsGivenType:${Utils.printErrorLog(error)}`); 
                    return error;
                }

                supply.isAllowed = false;
                supply.available = -1;
                supply.nextOpen = sanitizer.validateInput(result[0]) ? result[0].startTime : null;
            }
     
        }

        if(shopItem.category == 3){
            try {
                result = await ShopBuildingQueries.getCountFromTempBuildingGivenCatalogId(shopItem.id);
            } catch (error) {
                console.log(error);
                logger.error(`error in buildSupply:${Utils.printErrorLog(error)}`); 
                return error;
            }
            if(result == null || result == undefined){
                counter = 0;
            }else{
                counter = result[0].counter - 1;
            }
            max_buildings_type = parseInt(this.retrieveMaxValueGivenIdCatalog(shopItem.id));

            logger.debug(`\n result , ${JSON.stringify(result)}`);
            if(counter < max_buildings_type && shopItem.available){
                supply.isAllowed = true
            }else{
                supply.isAllowed = false
            }

            supply.total = max_buildings_type;
            supply.available = counter;
        }

        logger.debug(`supply response:${JSON.stringify(supply)}`)
        logger.debug(`buildSupply end`);
        return supply;
    }

    async shopBuilder(shopList, nfts){
        let response = []
        for (let shopItem of shopList){
            //logger.debug(`elem :${JSON.stringify(elem)}`);
            let newElem={};
            let price={};
    
            newElem.id=shopItem.id;
            newElem.name=shopItem.name;
            newElem.description=shopItem.description;
            newElem.image=shopItem.image;
            newElem.category=shopItem.category;
            newElem.type=shopItem.type;
    
            price.ancien=shopItem.ancienCost;
            price.wood=shopItem.woodCost;
            price.stone=shopItem.stoneCost;
    
            newElem.price=price;

            if(shopItem.id == 124 || shopItem.id == 134 || shopItem.id == 144){
                newElem.requirements=this.buildCursedRequirements(shopItem, nfts);
            }else{
                newElem.requirements=this.buildRequirements(shopItem, nfts);
            }
    
            newElem.supply = await this.buildSupply(shopItem);
    
            response.push(newElem);
        }
        return response;
    }
}
//this a tutte le funzioni del model richiamate nel model stesso
class TicketService{
    constructor() {}

    async subAncienTicket(address, idDraw, ancien){
        logger.info(`subAncienTicket start`);
        logger.debug(`address: ${address}, ancien: ${ancien}, idDraw:${idDraw}`)
        
        return new Promise((resolve, reject) => {
            let sql = `UPDATE utente
            SET ancien = CASE WHEN (ancien >= ?) AND ((SELECT endingTime FROM draws WHERE id = ?) > current_timestamp) THEN ancien - ? ELSE ancien END
            WHERE address = ?`;

            mysql.query(sql, [ancien, idDraw, ancien, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subAncienTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async subStoneTicket(address,idDraw, stone){
        logger.info(`subStoneTicket start`);
        logger.debug(`address: ${address}, stone: ${stone}, idDraw:${idDraw}`)
        
        return new Promise((resolve, reject) => {
            let sql = `UPDATE utente
            SET stone = CASE WHEN (stone >= ?) AND ((SELECT endingTime FROM draws WHERE id = ?) > current_timestamp) THEN stone - ? ELSE stone END
            WHERE address = ?;`;

            mysql.query(sql, [stone, idDraw, stone, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subStoneTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async subWoodTicket(address,idDraw, wood){
        logger.info(`subWoodTicket start`);
        logger.debug(`address: ${address}, wood: ${wood}, idDraw:${idDraw}`)
        
        return new Promise((resolve, reject) => {
            let sql = `UPDATE utente
            SET wood = CASE WHEN (wood >= ?) AND ((SELECT endingTime FROM draws WHERE id = ?) > current_timestamp) THEN wood - ? ELSE wood END
            WHERE address = ?`;

            mysql.query(sql, [wood, idDraw, wood, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subWoodTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async purchaseTicket(address, name, idCatalog, idDraw){
        logger.info(`purchaseTicket start`);
        logger.debug(`address: ${address}, name: ${name}, idCatalog: ${idCatalog}, idDraw: ${idDraw}`)
        
        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO tickets (address, name, status, idCatalog, idDraw, saleTime)
            values (?, ?, 0, ?, ?, current_timestamp);`;

            mysql.query(sql, [address, name, idCatalog, idDraw], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`purchaseTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    retrieveTicketTypeGivenIdCatalog(id){
        switch (id) {
            case 14:
                return "forest";

            case 1002:
                return "lumberjack";
        
            default:
                return "";
        }
    }

    async getCurrentIdDrawGivenTicketType(type){
        logger.info(`getCurrentIdDrawGivenTicketType start`);
        logger.debug(`type :${type}`);
        
        return new Promise((resolve, reject) => {
            let sql = `SELECT *
            FROM draws 
            WHERE startTime <= current_timestamp 
            AND current_timestamp <= endingTime
            AND type = ?`;

            mysql.query(sql, type, (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getCurrentIdDrawGivenTicketType end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async getNextDrawGivenTicketType(type){
        logger.info(`getNextDrawGivenTicketType start`);
        logger.debug(`type :${type}`);
        
        return new Promise((resolve, reject) => {
            let sql = `SELECT * 
            FROM draws
            WHERE startTime in (
              SELECT min(startTime)
              FROM draws
              WHERE startTime >= current_timestamp
              GROUP BY type)
            AND type = ?;`;

            mysql.query(sql, type, (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getNextDrawGivenTicketType end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    ticketBuilder(shopList,nfts,shopService){
        console.log("entrato ticketBuidler");
        let response = [];
        for (let shopItem of shopList){
            console.log("entrato ticketBuidler for");
            //logger.debug(`elem :${JSON.stringify(elem)}`);
            let newElem={};
            let price={};
    
            newElem.id=shopItem.id;
            newElem.name=shopItem.name;
            newElem.description=shopItem.description;
            newElem.image=shopItem.image;
            newElem.category=shopItem.category;
            newElem.type=shopItem.type;
    
            price.ancien=shopItem.ancienCost;
            price.wood=shopItem.woodCost;
            price.stone=shopItem.stoneCost;
    
            newElem.price=price;
    
            newElem.requirements= shopService.buildRequirements(shopItem,nfts);
    
            response.push(newElem);
        }
        return response;
    }

    async buyTicket(res, id, address, shopItem, nfts){
        console.log("entrato");
        let shopService = new ShopService();
        
        let shopObject;
        let responseTicketObject = {};
        let responseTicket = [];
        let response;
        let resources;
        let ticketType;
        let rarity;
        let idDraw;

        shopObject = this.ticketBuilder(shopItem, nfts,shopService);

        if(shopObject.length == 0){
            logger.error("Error in ticketService buyTicket, id does not exist:",id);
            return 401
            // .status(401)
            // .json({
            //     success: false,
            //     error: {
            //         errorMessage: "Error in shopService buyTicket"
            //     }
            // });
        }
        
        shopObject = shopObject[0];


        logger.debug(`ticketService buyTicket response :${JSON.stringify(shopObject)}`);

        if(!shopService.checkRequirements(shopObject)){
            logger.warn(`Error in shopService checkRequirements`)
            return 401
            // .status(401)
            // .json({
            //     success: false,
            //     error: {
            //         errorMessage: "Error in shopService checkRequirements"
            //     }
            // });
        }


        try {
            resources = await userInventory.getResources(address);
        } catch (error) {
            logger.error(`Error in UserModel InventoryService getResources: ${Utils.printErrorLog(error)}`);
            return 401
            // .json({
            //     success: false,
            //     error: {
            //         errorMessage: error
            //     }
            // });
        }
        logger.debug(`userInventory.getResources response : ${JSON.stringify(resources)}`);

        if(!shopService.checkResources(resources,shopObject)){
            logger.warn(`Error in shopService checkResources ,resources:${resources}`);
            return 401
            // .status(401)
            // .json({
            //     success: false,
            //     error: {
            //         errorMessage: "Error in shopService checkResources"
            //     }
            // });
        }
        console.log(id);

        ticketType = this.retrieveTicketTypeGivenIdCatalog(id);

        console.log(ticketType);

        try {

            idDraw = await this.getCurrentIdDrawGivenTicketType(ticketType);

        } catch (error) {
            logger.error(`Error in getCurrentIdDrawGivenTicketType :${Utils.printErrorLog(error)}`);
            return 401
            // .status(401)
            // .json({
            //     success: false,
            //     error: {
            //         errorMessage: "Error in ticketService getCurrentIdDrawGivenTicketType"
            //     }
            // });
        }
        logger.debug(`getCurrentIdDrawGivenTicketType response : ${JSON.stringify(idDraw)}`);

        if(idDraw.length == 0){
            logger.error(`Error in ticketService getCurrentIdDrawGivenTicketType : idDraw does not exist`);
            return 401
            // .status(401)
            // .json({
            //     success: false,
            //     error: {
            //         errorMessage: "Error in ticketService getCurrentIdDrawGivenTicketType : idDraw does not exist"
            //     }
            // });
        }

        idDraw = idDraw[0].id;
        

        if (shopObject.price.ancien > 0) {
            try {
            response = await this.subAncienTicket(address, idDraw, shopObject.price.ancien);
            } catch (error) {
                logger.error(`Error in subAncien : ${address}, ${Utils.printErrorLog(error)}`);
        
                return 401
                // .status(401)
                // .json({
                //     success: false,
                //     error: {
                //         errorMessage: "Error in ticketService subAncienTicket"
                //     }
                // });
            }
            logger.debug(`ticketService subAncienTicket response : ${JSON.stringify(response)}`);
        }

        
        
        if (shopObject.price.wood > 0) {
            try {
                response = await this.subWoodTicket(address, idDraw,  shopObject.price.wood);
            } catch (error) {
                logger.error(`Error in subWood:  ${address}, ${Utils.printErrorLog(error)}`);
        
                return 401
                // .status(401)
                // .json({
                //     success: false,
                //     error: {
                //         errorMessage: "Error in ticketService subWoodTicket"
                //     }
                // });
            }
            logger.debug(`ticketService subWoodTicket response : ${JSON.stringify(response)}`);
        }

    

        if (shopObject.price.stone > 0) {
            try {
                response = await this.subStoneTicket(address, idDraw, shopObject.price.stone);
            } catch (error) {
                logger.error(`Error in subStoneTicket:  ${address}, ${Utils.printErrorLog(error)}`);
                return 401
                // .status(401)
                // .json({
                //     success: false,
                //     error: {
                //         errorMessage: "Error in ticketService subStoneTicket"
                //     }
                // });
                
            }
            logger.debug(`ticketService subStoneTicket response : ${JSON.stringify(response)}`);
        }

        


        //rarity = shopService.retrieveRarityGivenIdCatalog(id);

        try {
            response = await this.purchaseTicket(address, shopObject.name, shopObject.id, idDraw);
        } catch (error) {
            logger.error(`Error in purchaseTicket:  ${address}, ${Utils.printErrorLog(error)}`);
            return 401
            // .status(401)
            // .json({
            //     success: false,
            //     error: {
            //         errorMessage: "Error in shopService purchaseTicket"
            //     }
            // });
        }

        logger.debug(`shopService.purchaseTicket response : ${JSON.stringify(response)}`);

        responseTicketObject.item = shopObject;
        responseTicketObject.quantity = 1;
        responseTicketObject.prng = false;

        responseTicket.push(responseTicketObject);

        logger.debug(`response TICKET : ${JSON.stringify(responseTicket)}`);

        switch(shopObject.id){
            case 14: {
                
                if (random.int(1, 10) == 1){
                    let responseTicketObject = {};
                    
                    try {
                        // response = await this.getNextDrawGivenTicketType(ticketType);
                        response = await this.getCurrentIdDrawGivenTicketType('mountain');
                    } catch (error) {
                        logger.error(`Error in getNextDrawGivenTicketType:  ${address}, ${Utils.printErrorLog(error)}`);
                        return 401
                        // .status(401)
                        // .json({
                        //     success: false,
                        //     error: {
                        //         errorMessage: "Error in shopService getNextDrawGivenTicketType"
                        //     }
                        // });
                    }
        
                    logger.debug(`shopService.getNextDrawGivenTicketType response : ${JSON.stringify(response)}`);
        
                    if(sanitizer.validateInput(response) && response.length > 0){
                        try {
                            response = await this.purchaseTicket(address, 'Lottery Ticket Mountain', null, response[0].id);
                        } catch (error) {
                            logger.error(`Error in purchaseTicket mountain:  ${address}, ${Utils.printErrorLog(error)}`);
                            return 401
                            // .status(401)
                            // .json({
                            //     success: false,
                            //     error: {
                            //         errorMessage: "Error in shopService purchaseTicket Mountain"
                            //     }
                            // });
                        }
                    }
        
                    responseTicketObject.item = {
                        name: 'Lottery Ticket Mountain',
                        description: 'This lottery ticket can drop you an Ancient Land Mountain',
                        image: 'https://ancient-society.s3.eu-central-1.amazonaws.com/tickets/ticketMountain.jpg'
                    };
                    responseTicketObject.quantity = 1;
                    responseTicketObject.prng = true;
        
                    responseTicket.push(responseTicketObject);
        
                    logger.debug(`response TICKET mountain: ${JSON.stringify(responseTicket)}`);
                }
                break;
            }

            case 1002: {
                let randomStonemine = random.int(1, 10);

                if (randomStonemine == 1 || randomStonemine == 2 || randomStonemine == 3){
                    let responseTicketObject = {};
                    
                    try {
                        // response = await this.getNextDrawGivenTicketType(ticketType);
                        response = await this.getCurrentIdDrawGivenTicketType('stonemine');
                    } catch (error) {
                        logger.error(`Error in getNextDrawGivenTicketType:  ${address}, ${Utils.printErrorLog(error)}`);
                        return 401
                        // .status(401)
                        // .json({
                        //     success: false,
                        //     error: {
                        //         errorMessage: "Error in shopService getNextDrawGivenTicketType"
                        //     }
                        // });
                    }
        
                    logger.debug(`shopService.getNextDrawGivenTicketType response : ${JSON.stringify(response)}`);
        
                    if(sanitizer.validateInput(response) && response.length > 0){
                        try {
                            response = await this.purchaseTicket(address, 'Lottery Ticket Stonemine', 1003, response[0].id);
                        } catch (error) {
                            logger.error(`Error in purchaseTicket mountain:  ${address}, ${Utils.printErrorLog(error)}`);
                            return 401
                            // .status(401)
                            // .json({
                            //     success: false,
                            //     error: {
                            //         errorMessage: "Error in shopService purchaseTicket Mountain"
                            //     }
                            // });
                        }
                    }
        
                    responseTicketObject.item = {
                        name: 'Lottery Ticket Stonemine',
                        description: 'This lottery ticket can drop you an Ancient Stonemine',
                        image: 'https://ancient-society.s3.eu-central-1.amazonaws.com/tickets/ticketMountain.jpg'
                    };
                    responseTicketObject.quantity = 1;
                    responseTicketObject.prng = true;
                    responseTicketObject.prngRarity = 1;
        
                    responseTicket.push(responseTicketObject);
        
                    logger.debug(`response TICKET stonemine: ${JSON.stringify(responseTicket)}`);
                }

                let randomTownhall = random.int(1, 10);

                if (randomTownhall == 1){
                    let responseTicketObject = {};
                    
                    try {
                        // response = await this.getNextDrawGivenTicketType(ticketType);
                        response = await this.getCurrentIdDrawGivenTicketType('townhall');
                    } catch (error) {
                        logger.error(`Error in getNextDrawGivenTicketType:  ${address}, ${Utils.printErrorLog(error)}`);
                        return 401
                        // .status(401)
                        // .json({
                        //     success: false,
                        //     error: {
                        //         errorMessage: "Error in shopService getNextDrawGivenTicketType"
                        //     }
                        // });
                    }
        
                    logger.debug(`shopService.getNextDrawGivenTicketType response : ${JSON.stringify(response)}`);
        
                    if(sanitizer.validateInput(response) && response.length > 0){
                        try {
                            response = await this.purchaseTicket(address, 'Lottery Ticket Town Hall', 1001, response[0].id);
                        } catch (error) {
                            logger.error(`Error in purchaseTicket townhall:  ${address}, ${Utils.printErrorLog(error)}`);
                            return 401
                            // .status(401)
                            // .json({
                            //     success: false,
                            //     error: {
                            //         errorMessage: "Error in shopService purchaseTicket Mountain"
                            //     }
                            // });
                        }
                    }
        
                    responseTicketObject.item = {
                        name: 'Lottery Ticket Townhall',
                        description: 'This lottery ticket can drop you an Ancient Town Hall',
                        image: 'https://ancient-society.s3.eu-central-1.amazonaws.com/tickets/ticketMountain.jpg'
                    };
                    responseTicketObject.quantity = 1;
                    responseTicketObject.prng = true;
                    responseTicketObject.prngRarity = 2;
        
                    responseTicket.push(responseTicketObject);
        
                    logger.debug(`response TICKET townhall: ${JSON.stringify(responseTicket)}`);
                }
                break;
            }

            default:
                break;
        }

        

        logger.debug(`response TICKET FINAL: ${JSON.stringify(responseTicket)}`);

        return responseTicket;
    }


}

class LandService{
    constructor() {}

    async subAncienLand(address,idCatalog, max_land_type, ancien){
        logger.info(`subAncienLand start`);
        logger.debug(`address: ${address}, ancien: ${ancien}, idCatalog`)
        
        return new Promise((resolve, reject) => {
            let sql = `UPDATE utente
            SET ancien = CASE WHEN (ancien >= ?) AND ((SELECT count(*) FROM lands WHERE idCatalog = ?) < ?) THEN ancien - ? ELSE ancien END
            WHERE address = ?`;

            mysql.query(sql, [ancien, idCatalog, max_land_type, ancien, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subAncienLand end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async subStoneLand(address,idCatalog, max_land_type, stone){
        logger.info(`subStoneLand start`);
        logger.debug(`address: ${address}, stone: ${stone}, idCatalog`)
        
        return new Promise((resolve, reject) => {
            let sql = `UPDATE utente
            SET stone = CASE WHEN (stone >= ?) AND ((SELECT count(*) FROM lands WHERE idCatalog = ?) < ?) THEN stone - ? ELSE stone END
            WHERE address = ?`;

            mysql.query(sql, [stone, idCatalog, max_land_type, stone, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subStoneLand end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async subWoodLand(address,idCatalog, max_land_type, wood){
        logger.info(`subWoodLand start`);
        logger.debug(`address: ${address}, wood: ${wood}, idCatalog`)
        
        return new Promise((resolve, reject) => {
            let sql = `UPDATE utente
            SET wood = CASE WHEN (wood >= ?) AND ((SELECT count(*) FROM lands WHERE idCatalog = ?) < ?) THEN wood - ? ELSE wood END
            WHERE address = ?`;

            mysql.query(sql, [wood, idCatalog, max_land_type, wood, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subWoodLand end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async landBuidler(res,id,address,shopItem,nfts){
        let shopService = new ShopService();
        let shopObject;
        let responseLandObject = {};
        let responseLand = [];
        let response;
        let resources;
        let maxLand;
        let rarity;

        shopObject = await shopService.shopBuilder(shopItem,nfts);

        if(shopObject.length == 0){
            logger.error("Error in shopService shopBuilder, id does not exist:",id);
            return 401
            // .status(401)
            // .json({
            //     success: false,
            //     error: {
            //         errorMessage: "Error in shopService shopBuilder"
            //     }
            // });
        }
        
        shopObject = shopObject[0];


        logger.debug(`shopService shopBuilder response :${JSON.stringify(shopObject)}`);

        if(!shopService.checkRequirements(shopObject)){
            logger.warn(`Error in shopService checkRequirements`)
            return 401
            // .status(401)
            // .json({
            //     success: false,
            //     error: {
            //         errorMessage: "Error in shopService checkRequirements"
            //     }
            // });
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
            // .json({
            //     success: false,
            //     error: {
            //         errorMessage: error
            //     }
            // });
        }
        logger.debug(`userInventory.getResources response : ${JSON.stringify(resources)}`);

        if(!shopService.checkResources(resources,shopObject)){
            logger.warn(`Error in shopService checkResources ,resources:${resources}`);
            return 401
            // .status(401)
            // .json({
            //     success: false,
            //     error: {
            //         errorMessage: "Error in shopService checkResources"
            //     }
            // });
        }

        maxLand = shopService.retrieveMaxValueGivenIdCatalog(id);

        if (shopObject.price.ancien > 0) {
            try {
            response = await this.subAncienLand(address, id, maxLand, shopObject.price.ancien);
            } catch (error) {
                logger.error(`Error in subAncien : ${address}, ${Utils.printErrorLog(error)}`);
        
                return 401
                // .status(401)
                // .json({
                //     success: false,
                //     error: {
                //         errorMessage: "Error in shopService subAncien"
                //     }
                // });
            }
            logger.debug(`shopService subAncienLand response : ${JSON.stringify(response)}`);
        }

        
        
        if (shopObject.price.wood > 0) {
            try {
                response = await this.subWoodLand(address, id, maxLand, shopObject.price.wood);
            } catch (error) {
                logger.error(`Error in subWood:  ${address}, ${Utils.printErrorLog(error)}`);
        
                return 401
                
            }
            logger.debug(`shopService.subWoodLand response : ${JSON.stringify(response)}`);
        }

    

    if (shopObject.price.stone > 0) {
        try {
            response = await this.subStoneLand(address, id, maxLand, shopObject.price.stone);
        } catch (error) {
            logger.error(`Error in subStone:  ${address}, ${Utils.printErrorLog(error)}`);
            return 401
            // .status(401)
            // .json({
            //     success: false,
            //     error: {
            //         errorMessage: "Error in shopService subStone"
            //     }
            // });
            
        }
        logger.debug(`shopService subStoneLand response : ${JSON.stringify(response)}`);
    }

        


        rarity = shopService.retrieveRarityGivenIdCatalog(id);

        try {
            response = await shopService.buyLand(shopObject.type,rarity,id,shopObject.name,shopObject.image,shopObject.description,address);
        } catch (error) {
            logger.error(`Error in buyLand:  ${address}, ${Utils.printErrorLog(error)}`);
            return 401
            // .status(401)
            // .json({
            //     success: false,
            //     error: {
            //         errorMessage: "Error in shopService buyLand"
            //     }
            // });
        }

        logger.debug(`shopService.buyLand response : ${JSON.stringify(response)}`);

        responseLandObject.item = shopObject;
        responseLandObject.quantity = 1;
        responseLandObject.prng = false;

        responseLand.push(responseLandObject);

        return responseLand;
    }

    async buildingBuilder(res,id,address,shopItem,nfts){
        let shopService = new ShopService();
        let shopObject;
        let responseBuildingObject = {};
        let responseBuilding = [];
        let response;
        let resources;
        let maxLand;
        let rarity;

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
            response = await this.subAncienLand(address, id, maxBuildings, shopObject.price.ancien);
            } catch (error) {
                logger.error(`Error in subAncien : ${address}, ${Utils.printErrorLog(error)}`);
        
                return 401
            
            }
            logger.debug(`shopService subAncienLand response : ${JSON.stringify(response)}`);
        }

        
        
        if (shopObject.price.wood > 0) {
            try {
                response = await this.subWoodLand(address, id, maxBuildings, shopObject.price.wood);
            } catch (error) {
                logger.error(`Error in subWood:  ${address}, ${Utils.printErrorLog(error)}`);
        
                return 401
                
            }
            logger.debug(`shopService.subWoodLand response : ${JSON.stringify(response)}`);
        }

    

    if (shopObject.price.stone > 0) {
        try {
            response = await this.subStoneLand(address, id, maxBuildings, shopObject.price.stone);
        } catch (error) {
            logger.error(`Error in subStone:  ${address}, ${Utils.printErrorLog(error)}`);
            return 401
            
            
        }
        logger.debug(`shopService subStoneLand response : ${JSON.stringify(response)}`);
    }

        


        rarity = shopService.retrieveRarityGivenIdCatalog(id);

        try {
            response = await shopService.buyTempBuilding(shopObject.type,rarity,id,shopObject.name,shopObject.image,shopObject.description,address);
        } catch (error) {
            logger.error(`Error in buyLand:  ${address}, ${Utils.printErrorLog(error)}`);
            return 401
            
        }

        logger.debug(`shopService.buyLand response : ${JSON.stringify(response)}`);

        responseLandObject.item = shopObject;
        responseLandObject.quantity = 1;
        responseLandObject.prng = false;

        responseLand.push(responseLandObject);

        return responseLand;
    }
}

module.exports = {
    ShopService,TicketService,LandService
}