const mysql = require('../config/databaseConfig');
const logger= require('../logging/logger');

class MarketQueries{

    static async getCheapestResources(address) {
        logger.info(`MarketQueries.getCheapestResources START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT DISTINCT
                    mar.type,
                    mar.price 
                FROM
                    marketplace AS mar 
                    JOIN
                        (
                            SELECT
                                type,
                                MIN(price) AS minPrice 
                            FROM
                                marketplace 
                            WHERE
                                status = 1 
                                AND endingTime > CURRENT_TIMESTAMP 
                                AND owner <> ?
                            GROUP BY
                                TYPE
                        )
                        AS minPriceTable 
                        ON minPriceTable.type = mar.type 
                        AND mar.price = minPriceTable.minPrice 
                WHERE
                    mar.status = 1 
                    AND mar.endingTime > CURRENT_TIMESTAMP
                    AND owner <> ?
                `
            mysql.query(sql, [address, address], (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.info(`MarketQueries.getCheapestResources END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getPersonalHistoryGivenType(address, limit, offset, type){
        return new Promise((resolve, reject) => {
            let orderBy = 'price asc';
            if (status == 2) orderBy = 'saleTime desc'

            let sql = `SELECT * FROM upgrade;
            SELECT * 
            FROM marketplace 
            WHERE buyer = ?
            AND status = 2
            AND type = ? 
            order by ? 
            LIMIT ? OFFSET ?;
            SELECT count(*) as counter FROM marketplace WHERE status = 2 AND type = ?`; 

            mysql.query(sql, [address, type, orderBy, limit, offset, type], (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error in getAllListing: ", address, limit, offset);

                    return reject({
                        message: "undefined"
                    });
                }else{
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }


    static async getPersonalHistory(address, limit, offset){
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM upgrade;  
            SELECT * 
            FROM marketplace 
            WHERE buyer = ?
            AND status = 2
            order by price asc 
            LIMIT ? OFFSET ?;
            SELECT count(*) as counter FROM marketplace WHERE status = 2`;

            mysql.query(sql, [address, limit, offset], (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    console.log("null error in getAllListing: ", address, limit, offset);

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

module.exports = {MarketQueries};