const mysql = require('../config/databaseConfig');
const logger= require('../logging/logger');
const {Utils} = require("../utils/utils");

class NotificationQueries{
    static async getNotificationGivenIdNotificationInstance(idNotificationInstance) {
        logger.debug(`getNotificationGivenIdNotificationInstance START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    * 
                FROM
                    notification_instance
                    LEFT JOIN notification ON notification_instance.idNotification = notification.idNotification
                     
                WHERE
                    idNotificationInstance = ?
                `
            mysql.query(sql, [idNotificationInstance], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getNotificationGivenIdNotificationInstance END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

}


module.exports = {NotificationQueries}