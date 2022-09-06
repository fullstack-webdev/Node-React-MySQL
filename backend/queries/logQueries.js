const mysql = require('../config/databaseConfig');
const logger= require('../logging/logger');
const {Utils} = require("../utils/utils");

class LogQueries{
    static async setLogBot(
        addressLocals, 
        addressBody, 
        suspect,
        clientX,
        clientY,
        target,
        isTrusted,
        timeStamp,
        detail
    ){
        return await new Promise((resolve, reject) => {
            let sql = `
            INSERT INTO log_bots (
                addressLocals, addressMetamask, 
                suspect, timestampInGame, target, 
                clickX, clickY, detail, isTrusted, 
                timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `;
    
            mysql.query(sql, [
                addressLocals, 
                addressBody, 
                suspect, 
                timeStamp,
                target,
                clientX,
                clientY,
                detail,
                isTrusted,
            ], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

}

module.exports = {LogQueries};