const mysql = require('../../config/databaseConfig');
const logger = require('../../logging/logger');
const {Utils} = require("../../utils/utils");

class ShopQueries {
    static async  getLands(address){
        logger.info(`getLands start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM lands WHERE address = ?";
    
            mysql.query(sql, address, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getLands end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async  getTickets(address){
        logger.info(`getTickets start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM tickets WHERE address = ?";
    
            mysql.query(sql, address, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getTickets end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async  getBuildingtemp(address){
        logger.info(`getBuildingtemp start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM buildingtemp WHERE address = ?";
    
            mysql.query(sql, address, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getBuildingtemp end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
}


module.exports = {ShopQueries};