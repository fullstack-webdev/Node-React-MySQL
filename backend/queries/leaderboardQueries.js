const mysql = require('../config/databaseConfig');
const logger= require('../logging/logger');
const {Utils} = require("../utils/utils");

class LeaderboardQueries{
    static async retrieveLeaderboard(leaderboard){
        logger.debug(`retrieveLeaderboard start`);
        return new Promise((resolve, reject) => {
            // let sql = "SELECT * FROM leaderboard , profile WHERE leaderboard.address = profile.address ORDER BY  experience desc ";
            let orderBy = 'experience'
            if(leaderboard == 'fisherman') orderBy = 'experienceFisherman'

            let sql = 
                `SELECT leaderboard.*, profile.image, profile.cityName, emblems.imageEmblem, emblems.toShow
                FROM leaderboard
                JOIN profile on leaderboard.address = profile.address
                LEFT JOIN  emblems ON profile.idEmblem = emblems.idEmblem
                ORDER BY ${orderBy} desc`;

            mysql.query(sql, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`retrieveLeaderboard end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async retrieveLeaderboardCrafting(){
        logger.debug(`retrieveLeaderboardNPC start`);
        return new Promise((resolve, reject) => {
            let sql = 
                `SELECT 
                item_instance.quantity, 
                profile.image, 
                profile.cityName, 
                emblems.imageEmblem, 
                emblems.toShow
                FROM item_instance
                JOIN profile on item_instance.address = profile.address
                LEFT JOIN  emblems ON profile.idEmblem = emblems.idEmblem
                WHERE item_instance.idItem = 50000
                ORDER BY quantity desc`;

            mysql.query(sql, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`retrieveLeaderboard end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async addExperience(address,exp){
        logger.debug(`addExperience start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE leaderboard SET experience = experience + ? WHERE address = ?";

            mysql.query(sql,[exp,address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`addExperience end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async  getUserLeaderboard(address){
        logger.info(`getUserLeaderboard start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM leaderboard WHERE address = ?";
    
            mysql.query(sql, address, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getUserLeaderboard end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async  createUserLeaderboard(address,incrementExp){
        logger.info(`createUserLeaderboard start`);
        return new Promise((resolve, reject) => {
            let sql = "INSERT INTO leaderboard (address, experience) VALUES (?,?)";
    
            mysql.query(sql, [address, incrementExp], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`createUserLeaderboard end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async  createOrUpdateUserLeaderboard(address,incrementExp){
        logger.info(`createUserLeaderboard start`);
        return new Promise((resolve, reject) => {
            let sql = `
                        INSERT INTO leaderboard (address, experience)
                        VALUES (?,?)
                        ON DUPLICATE KEY
                        UPDATE experience = experience + ? , address = ?`;
    
            mysql.query(sql, [address, incrementExp, incrementExp, address], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`createUserLeaderboard end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

}

module.exports = LeaderboardQueries;