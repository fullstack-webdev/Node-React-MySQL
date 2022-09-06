const mysql = require('../config/databaseConfig');
const logger= require('../logging/logger');
const {Utils} = require("../utils/utils");

class VoucherContractQueries{
    static async createVoucher(){
        logger.info(`createVoucher start`);
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT IGNORE INTO voucher_contract
                    (status)
                VALUES
                    ('created')
            `;
    
            mysql.query(sql, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`createVoucher end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateCreatedVoucher(voucher){
        logger.info(`updateCreatedVoucher start`);
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE 
                voucher_contract
            SET 
                idContract = ?,
                owner = ?,
                blockNumber = ?,
                signature = ?,
                creation = ?,
                expireTime = ?,
                fee = ?,
                createTime = current_timestamp
            WHERE
                idVoucherContract = ?

            `;

            let params = [
                voucher.idContract,
                voucher.owner,
                voucher.blockNumber,
                voucher.signature,
                voucher.creation,
                voucher.expireTime,
                voucher.fee,
                voucher.id
            ];
    
            mysql.query(sql, params, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`updateCreatedVoucher end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    
}

module.exports = {VoucherContractQueries}
