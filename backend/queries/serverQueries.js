const mysql = require('../config/databaseConfig');
const logger= require('../logging/logger');
const {Utils} = require("../utils/utils");

class ServerQueries {

    static async getOnlineUser(){
        logger.debug(`getOnlineUser start`);
        return new Promise((resolve, reject) => {
            let sql = `SELECT count(DISTINCT address) as counter
            FROM buildings 
            WHERE TIMESTAMPDIFF(MINUTE, lastClaim, current_timestamp) < 120`;

            mysql.query(sql, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getOnlineUser end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getTotalUser(){
        logger.debug(`getTotalUser start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT count(*) as counter FROM utente";

            mysql.query(sql, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getTotalUser end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getBrokenMarketplace(){
        logger.debug(`getBrokenMarketplace start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT 
            bm.name as marketName, bm.description as marketDescription, bm.image as marketImage, 
            bm.idBrokenMarketplace, bm.price, bm.price as price,
            bmo.offerType, bmo.quantity, 

            it.name as itemName,
            rec.name as recipeName,
            t.name as toolName, tl.level as toolLevel,
            up.name as bldName, up.level as bldLevel
            
            FROM broken_marketplace as bm
            JOIN broken_marketplace_offer as bmo
                ON bmo.idBrokenMarketplace = bm.idBrokenMarketplace
            LEFT JOIN item as it
                ON bmo.idItem = it.idItem
            LEFT JOIN recipe as rec
                ON bmo.idRecipe = rec.idRecipe
            LEFT JOIN tool_level as tl
                ON bmo.idToolLevel = tl.idToolLevel
            LEFT JOIN tool as t
                ON tl.idTool = t.idTool
            LEFT JOIN upgrade as up
                ON bmo.idUpgrade = up.id
            WHERE bm.active = true
            `;

            mysql.query(sql, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getBrokenMarketplace end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getSpecialCurrencies(){
        logger.debug(`getSpecialCurrencies start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT 
                bm.idBrokenMarketplace, 
                cur.name, cur.contractAddress, cur.oracleAddress, 
                cur.isOracle, cur.anyOffer, cur.isNative, cur.chainId
                
            FROM broken_marketplace as bm
            LEFT JOIN currencies_instance as cur_ins
                ON cur_ins.idBrokenMarketplace = bm.idBrokenMarketplace
            LEFT JOIN currencies as cur
                ON cur.idCurrencies = cur_ins.idCurrencies
            WHERE 
                cur.active = true
            AND 
                cur.anyOffer = false
            ORDER BY 
                idBrokenMarketplace ASC
            `;

            mysql.query(sql, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getSpecialCurrencies end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getAnyCurrencies(){
        logger.debug(`getAnyCurrencies start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT 
            cur.name, cur.contractAddress, cur.oracleAddress, 
            cur.isOracle, cur.anyOffer, cur.isNative, cur.chainId
            
            FROM currencies as cur
                
            WHERE
                cur.active = true
            AND
                anyOffer = true
            `;

            mysql.query(sql, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getAnyCurrencies end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
}

module.exports = {ServerQueries}