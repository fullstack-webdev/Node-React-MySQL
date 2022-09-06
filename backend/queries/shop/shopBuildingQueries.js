const mysql = require('../../config/databaseConfig');
const logger= require('../../logging/logger');
const { Utils } = require("../../utils/utils");

class ShopBuildingQueries {

    //Verify the property of a Buiding
    static async getCountFromTempBuildingGivenCatalogId(id){
        console.log(id);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT count(*) as counter
            FROM buildingtemp
            WHERE idCatalog = ?`;

            mysql.query(sql, id, (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                // if(rows == undefined || rows == null){
                //     logger.error(`null error in getCountFromLands: ", address);

                //     return reject({
                //         message: "undefined"
                //     });
                //}
                return resolve(JSON.parse(JSON.stringify(rows)));
                

            });
        });

    }

    static async buyTempBuilding(type, address, idCatalog){
        return new Promise((resolve, reject) => {
            let sql = `
            INSERT INTO buildingtemp (idBuilding, type, address, status, saleTime, idCatalog)
            VALUES( (SELECT * FROM (SELECT max(idBuilding)+1 FROM buildingtemp WHERE type = ?) as temp), ?,?,1, current_timestamp, ?)`;

            mysql.query(sql, [type, type, address, idCatalog], (err, rows, fields) => {
                if(err) return reject(new Error(err.message));
                // if(rows == undefined || rows == null){
                //     logger.error(`null error in getCountFromLands: ", address);

                //     return reject({
                //         message: "undefined"
                //     });
                //}
                return resolve(JSON.parse(JSON.stringify(rows)));
                

            });
        });

    }

    static async subAncienBuilding(address,idCatalog, max_building_type, ancien){
        logger.info(`subAncienBuilding start`);
        logger.debug(`address: ${address}, ancien: ${ancien}, idCatalog`)
        
        return new Promise((resolve, reject) => {
            let sql = `UPDATE utente
            SET ancien = CASE WHEN (ancien >= ?) AND ((SELECT count(*) FROM buildingtemp WHERE idCatalog = ?) < ?) THEN ancien - ? ELSE ancien END
            WHERE address = ?`;

            mysql.query(sql, [ancien, idCatalog, max_building_type, ancien, address], (err, rows) =>{
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subAncienBuilding end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

}

module.exports = ShopBuildingQueries;