const mysql = require('../config/databaseConfig');
const logger = require('../logging/logger');
const {Utils} = require("../utils/utils");

class VoucherService {
    constructor() {}

    async getVouchersGivenAddress(address){
        logger.info(`getVouchersGivenAddress start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM vouchers WHERE address = ? AND status = 'created'";

            mysql.query(sql, address, (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`); 
                    reject(new Error("Vouchers undefined, null or void"));
                }
                logger.info(`getVouchersGivenAddress end`);
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

    async getCreatedVouchersGivenAddressTypeStatus(address, type, status){
        logger.info(`getCreatedVouchersGivenAddressTypeStatus start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT id, address FROM vouchers WHERE address = ? AND type = ? AND status = ?";
            mysql.query(sql, [address, type, status], (err, rows) => {
                if(err){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`); 
                    return reject(err);
                }
                logger.info(`getCreatedVouchersGivenAddressTypeStatus end`);
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

    async getMaxId(){
        logger.info(`getMaxId start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT max(id) as id from vouchers";

            mysql.query(sql, (err, rows) => {
                if(err){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject(err);
                }
                logger.info(`getMaxId end`);
                return resolve(JSON.parse(JSON.stringify(rows))[0].id);
            });
        });
    }

    async createVoucher(status){ //TODO inserting id not working
        logger.info(`createVoucher start`);
        return new Promise((resolve, reject) => {
            let sql = "INSERT INTO vouchers (status) VALUES (?)";

            mysql.query(sql, status, (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined || rows == null || rows.length == 0){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    reject(new Error("Vouchers undefined, null or void"));
                }
                logger.info(`createVoucher end`);
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

    async updateCreatedVoucher(voucher){ //TODO inserting id not working
        logger.info(`updateCreatedVoucher start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE vouchers SET address = ?, quantity = ?, blockNumber = ?, type = ?, signature = ?, createTime = ? WHERE id = ?";

            mysql.query(sql, [voucher.address, voucher.quantity, voucher.blockNumber, voucher.type, voucher.signature, voucher.createTime, voucher.id], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined || rows == null || rows.length == 0){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    reject(new Error("Vouchers undefined, null or void"));
                    }
                logger.info(`updateCreatedVoucher start`);
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

    async mintVoucher(resValues, status){
        logger.info(`mintVoucher start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE vouchers SET status = ? WHERE id = ?";

            mysql.query(sql, [status, resValues.id], (err, rows) => {
                if(err){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject(err)
                };
                logger.info(`mintVoucher end`);
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

    async destroyVoucher(resValues, status){
        logger.info(`destroyVoucher start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE vouchers SET status = ? WHERE signature = ?";

            mysql.query(sql, [status, resValues.signature], (err, rows) => {
                if(err) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject(err);
                }
                logger.info(`destroyVoucher end`);
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

    async deleteVoucher(id, status){
        logger.info(`deleteVoucher start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE vouchers SET status = ? WHERE id = ?";

            mysql.query(sql, [status, id], (err, rows) => {
                if(err){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject(err);
                }
                logger.info(`deleteVoucher end`);
                return resolve(JSON.parse(JSON.stringify(rows)));
            });
        });
    }

}

module.exports = {VoucherService};