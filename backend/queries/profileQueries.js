const mysql = require('../config/databaseConfig');
const logger= require('../logging/logger');
const {Utils} = require("../utils/utils");

class ProfileQueries {

    static async createProfile(address){
        logger.debug(`createProfile start`);
        return new Promise((resolve, reject) => {
            let sql = "INSERT IGNORE INTO profile (address) values (?)";

            mysql.query(sql, address, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`createProfile end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateProfilePicture(address, imgUrl){
        logger.debug(`updateProfilePicture start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE profile SET image = ? WHERE address = ?";

            mysql.query(sql, [imgUrl, address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`updateProfilePicture end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateProfileCityName(address, cityName){
        logger.debug(`updateProfileCityName start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE profile SET cityName = ? WHERE address = ?";

            mysql.query(sql, [cityName, address], (err, rows) => {
                // console.log('ERROR DUPLICATE ', err)

                if(err) return reject(err);
                if(rows == undefined || rows == null){
                    // console.log('ERROR DUPLICATE [2]', err)
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`updateProfileCityName end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateProfileEmblem(address, idEmblem){
        logger.debug(`updateProfileEmblem [START], idEmblem: ${idEmblem}`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE profile SET idEmblem = ? WHERE address = ?";

            mysql.query(sql, [idEmblem, address], (err, rows) => {

                if(err) return reject(err);
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`updateProfileEmblem [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    

    static async getProfile(address){
        logger.debug(`getProfile start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM profile WHERE address = ?";

            mysql.query(sql, address, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getProfile end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getProfilePicture(address){
        logger.debug(`getProfilePicture start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT image FROM profile WHERE address = ?";

            mysql.query(sql, address, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getProfilePicture end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getEmblemImageUrl(address){
        logger.debug(`getEmblemImageUrl start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT emblems.image FROM profile JOIN emblems ON profile.idEmblem = emblems.idEmblem WHERE address = ? "; //JOIN TO GET EMBLEM.IMAGE BY EMBLEM.ID

            mysql.query(sql, address, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getEmblemImageUrl end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getEmblems(address){
        logger.debug(`getEmblems start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM emblems WHERE toShow = 1";

            mysql.query(sql, address, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getEmblems end: `);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getEmblem(idEmblem){
        logger.debug(`getEmblems start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM emblems WHERE idEmblem = ? AND toShow = 1";

            mysql.query(sql, idEmblem, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getEmblems end: `);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getEmblemEquipped(address){
        logger.debug(`getEmblemEquipped start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT idEmblem FROM profile WHERE address = ?";

            mysql.query(sql, address, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getEmblemEquipped end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getChainsAvailableForAirdrops(){
        return new Promise((resolve, reject) => {
            let sql = "SELECT DISTINCT chain FROM collection_airdrop WHERE available = 1";

            mysql.query(sql, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getAirdropsAvailable(address){
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM collection_airdrop WHERE available = 1";

            mysql.query(sql, address, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getNFTsUsedForAirdrop(address){
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM airdrop_history";

            mysql.query(sql, address, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async setAirdropHistory(sql){
        return new Promise((resolve, reject) => {

            mysql.query(sql, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getLiquidity(address){
        return new Promise((resolve, reject) => {
            let sql = "SELECT liquidity FROM liquidity WHERE address = ?";

            mysql.query(sql, address, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getBlessing(address){
        return new Promise((resolve, reject) => {
            let sql = "call getBlessing(?);";

            mysql.query(sql, address, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getAllBlessingsOnGoing(address){
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM blessings 
            WHERE (status = 'running' OR status = 'done')
            AND address = ?
            ;`;

            mysql.query(sql, address, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getAllBlessingRewards(){
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM blessings_rewards;`;

            mysql.query(sql, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    
    static async setNewBlessing(address, liquidity, days, idBlessingsRewards){
        return new Promise((resolve, reject) => {
            let sql = `
            INSERT INTO blessings 
                (address, liquidityProvided, blessingStartingTime, blessingEndingTime, status, idBlessingsRewards)
            VALUES 
                (?, ?, current_timestamp, DATE_ADD(current_timestamp, INTERVAL ? DAY), 'running', ?)
            ;`;

            mysql.query(sql, [address, liquidity, days, idBlessingsRewards], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getBlessingReward(address){
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT status, liquidityRemoved, idItem, quantity, i.name, i.image  
            FROM blessings AS b 
            INNER JOIN blessings_rewards AS r 
            NATURAL JOIN item AS i 
            ON b.idBlessingsRewards = r.idBlessingsRewards
            WHERE b.address=? AND status='done';
            `;

            mysql.query(sql, address, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async setBlessingStatus(address, statusNow, statusAfter){
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE blessings
            SET status=?
            WHERE address=?
            AND status=?;
            `;

            mysql.query(sql, [statusAfter, address, statusNow], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getAnnouncement(){
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT * FROM announcements 
            WHERE active=1 
            LIMIT 1;
            `;

            mysql.query(sql, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    
}

module.exports = ProfileQueries;