const mysql = require('../config/databaseConfig');
const logger = require('../logging/logger');

const Sanitizer = require('../utils/sanitizer');
const {Utils} = require("../utils/utils");

let sanitizer = new Sanitizer();

class InventoryModel {
    constructor(result, ancien, wood, stone){
        this.status = result,
        this.resources = {
            ancien : ancien,
            wood : wood,
            stone : stone
        }
        
    }
}

class InventoryService {
    constructor(){}

    async  getResources(address){
        logger.info('getResources start');

        return new Promise((resolve, reject) => {
            let sql = "SELECT ancien, wood, stone FROM utente WHERE address = ?";

            mysql.query(sql, address, (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info('getResources end');    
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }

    async setResources(address, resources){
        logger.info(`setResources start`);

        
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET ancien = ?, wood = ?, stone = ? WHERE address = ?";

            mysql.query(sql, [resources.resources.ancien, resources.resources.wood, resources.resources.stone, address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`setResources end`);
                    return resolve(rows);
                }
            });
        });
    }

    //Va messa le await qui??
    async setResourcesGivenType(address, type, resource){ 
        logger.info(`setResourcesGivenType start`); 
        logger.info(`type setRes:${resource}`);
        switch(type){
            case 1: {
                return await this.setAncien(address, resource);
            }

            case 2: {
                return await this.setWood(address, resource);
            }

            case 3: {
                console.log("arrivato");
                return await this.setStone(address, resource);
            }

            default: 
                return null;
        }
    }

    async subResourcesGivenType(address, type, resource){ 
        logger.info(`setResourcesGivenType start`); 
        logger.info(`type setRes:${resource}`);
        switch(type){
            case 1: {
                return await this.subAncien(address, resource);
            }

            case 2: {
                return await this.subWood(address, resource);
            }

            case 3: {
                return await this.subStone(address, resource);
            }

            default: 
                return null;
        }
    }

    async setAncien(address, newAncien){
        logger.info(`setAncien start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET ancien = ? WHERE address = ?";

            mysql.query(sql, [newAncien, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`setAncien end`);
                    return resolve(rows);
                }
            });
        });
    }

    async setWood(address, newWood){
        logger.info(`srtWood start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET wood = ? WHERE address = ?";

            mysql.query(sql, [newWood, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`srtWood end`);
                    return resolve(rows);
                }
            });
        });
    }

    async setStone(address, newStone){
        logger.info(`setStone start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET stone = ? WHERE address = ?";

            mysql.query(sql, [newStone, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`setStone end`);
                    return resolve(rows);
                }
            });
        });
    }
    
    async addResourcesGivenType(address, type, resource){ 
        logger.info(`addResourcesGivenType start`); 
        logger.info(`type setRes:${resource}`);
        switch(type){
            case 1: {
                return await this.addAncien(address, resource);
            }

            case 2: {
                return await this.addWood(address, resource);
            }

            case 3: {
                return await this.addStone(address, resource);
            }

            default: 
                return null;
        }
    }

    async addAncien(address, newAncien){
        logger.info(`addAncien start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET ancien = ancien + ? WHERE address = ?";

            mysql.query(sql, [newAncien, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`addAncien end`);
                    return resolve(rows);
                }
            });
        });
    }

    async addWood(address, newWood){
        logger.info(`addWood start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET wood = wood + ? WHERE address = ?";

            mysql.query(sql, [newWood, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`addWood end`);
                    return resolve(rows);
                }
            });
        });
    }

    async addStone(address, newStone){
        logger.info(`addStone start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET stone = stone + ? WHERE address = ?";

            mysql.query(sql, [newStone, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`addStone end`);
                    return resolve(rows);
                }
            });
        });
    }

    async addResourcesGivenTypeMarket(address, type, resource, id){ 
        logger.info(`addResourcesGivenType start`); 
        logger.info(`type setRes:${resource}`);
        switch(type){
            case 1: {
                return await this.addAncienMarket(address, resource, id, id);
            }

            case 2: {
                return await this.addWoodMarket(address, resource, id, id);
            }

            case 3: {
                return await this.addStoneMarket(address, resource, id, id);
            }

            default: 
                return null;
        }
    }

    async addAncienMarket(address, newAncien, id){
        logger.info(`addAncien start`);
        return new Promise((resolve, reject) => {
            let sql = `
            LOCK TABLES marketplace WRITE, utente WRITE;
            UPDATE utente 
            SET ancien = ancien + ? 
            WHERE address = ?
            AND (SELECT status FROM marketplace WHERE id = ?) = 1;

            UPDATE marketplace 
            SET status = 3, deleteTime = current_timestamp 
            WHERE id = ?;
            UNLOCK TABLES;`;

            mysql.query(sql, [newAncien, address, id, id], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`addAncien end`);
                    return resolve(rows);
                }
            });
        });
    }

    async addWoodMarket(address, newWood, id){
        logger.info(`addWood start`);
        return new Promise((resolve, reject) => {
            let sql = `
            LOCK TABLES marketplace WRITE, utente WRITE;
            UPDATE utente 
            SET wood = wood + ? 
            WHERE address = ?
            AND (SELECT status FROM marketplace WHERE id = ?) = 1;

            UPDATE marketplace 
            SET status = 3, deleteTime = current_timestamp 
            WHERE id = ?;
            UNLOCK TABLES;`;


            mysql.query(sql, [newWood, address, id, id], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`addWood end`);
                    return resolve(rows);
                }
            });
        });
    }

    async addStoneMarket(address, newStone, id){
        logger.info(`addStone start`);
        return new Promise((resolve, reject) => {
            let sql = `
            LOCK TABLES marketplace WRITE, utente WRITE;
            UPDATE utente 
            SET stone = stone + ? 
            WHERE address = ?
            AND (SELECT status FROM marketplace WHERE id = ?) = 1;

            UPDATE marketplace 
            SET status = 3, deleteTime = current_timestamp 
            WHERE id = ?;
            UNLOCK TABLES;`;

            mysql.query(sql, [newStone, address, id, id], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`addStone end`);
                    return resolve(rows);
                }
            });
        });
    }

    async subAncien(address, ancien){
        logger.info(`subAncien start`);
        logger.debug(`address: ${address}, ancien: ${ancien}`)
        
        return new Promise((resolve, reject) => {
            let sql = `UPDATE utente
            SET ancien = CASE WHEN (ancien >= ?) THEN ancien - ? ELSE ancien END
            WHERE address = ?`;

            mysql.query(sql, [ancien, ancien, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subAncien end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async subWood(address, wood){
        logger.info(`subWood start`);
        logger.debug(`address: ${address}, wood: ${wood}`)
        
        return new Promise((resolve, reject) => {
            let sql = `UPDATE utente
            SET wood = CASE WHEN (wood >= ?) THEN wood - ? ELSE wood END
            WHERE address = ?`;

            mysql.query(sql, [wood, wood, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subWood end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async subStone(address, stone){
        logger.info(`subStone start`);
        logger.debug(`address: ${address}, ancien: ${stone}`)
        
        return new Promise((resolve, reject) => {
            let sql = `UPDATE utente
            SET stone = CASE WHEN (stone >= ?) THEN stone - ? ELSE stone END
            WHERE address = ?`;

            mysql.query(sql, [stone, stone, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subStone end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async setAncienAfterPurchase(owner, buyer, totalPrice){
        logger.info(`setAncienAfterPurchase start`);
        logger.debug(`owner: ${owner}, buyer: ${owner}, totalPrice: ${owner}`)
        
        return new Promise((resolve, reject) => {
            let sql = `UPDATE utente
            SET ancien = CASE WHEN (address = ?) AND ((SELECT * FROM ( SELECT ancien FROM utente where address = ?) AS temp) >= ?) THEN ancien + ? ELSE ancien END,
            ancien = CASE WHEN (address = ?) AND (ancien >= ?) THEN ancien - ? ELSE ancien END`;

            mysql.query(sql, [owner, buyer, totalPrice, totalPrice, buyer, totalPrice, totalPrice], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`setAncienAfterPurchase end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    getResourceGivenType(resources, type){
        switch(type){
            case 1: {
                return resources.ancien;
            }

            case 2: {
                return resources.wood;
            }

            case 3: {
                return resources.stone;
            }

            default: {
                return null;
            }
        }
    }

    buildResourcesResponse(rows){
        let response;
        if(rows.ancien != undefined && rows.wood != undefined && rows.stone != undefined)
            response = new InventoryModel(true, rows.ancien, rows.wood, rows.stone);
        else{
            response = new InventoryModel(false);
        }
        return response;
    }
}

class UserService {
    constructor() {}

    static async  getUser(address){
        logger.info(`getUser start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM utente WHERE address = ?";
    
            mysql.query(sql, address, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getUser end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    async createUser(address, nickname){
        logger.info(`createUser start`);
        return new Promise((resolve, reject) => {
            let sql = "INSERT INTO utente (address, nickname, ancien, wood, stone) values (?, ?, 0, 0, 0)";
    
            mysql.query(sql, [address, nickname], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`createUser end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
}

module.exports = {InventoryModel, InventoryService, UserService};

