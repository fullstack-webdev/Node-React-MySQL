const logger = require('../logging/logger')
const mysql = require('../config/databaseConfig')
const {Utils} = require("../utils/utils");

class DelegateQueries {

    static async getDelegateByIdDelegateAndDeputy(idDelegate, deputy) {
        logger.debug('getDelegateByIdDelegateAndDeputy query start')

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT 
                    *
                FROM 
                    delegate
                WHERE 
                    idDelegate = ?
                AND 
                    deputy = ?
                `

            mysql.query(sql, [idDelegate, deputy], (err, rows) => {
                if ( err ) { 
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject(new Error(err.message))
                }
                if ( rows == undefined || rows == null ) {
                    logger.error(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug('getDelegateByIdDelegateAndDeputy query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }

    static async deleteDelegate(idDelegate) {
        logger.debug('deleteDelegate query start')

        return new Promise((resolve, reject) => {
            let sql = `
                DELETE
                FROM
                    delegate 
                WHERE
                    idDelegate = ?
                `

            mysql.query(sql, [idDelegate], (err, rows) => {
                if ( err ) { 
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject(new Error(err.message))
                }
                if ( rows == undefined || rows == null ) {
                    logger.error(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug('deleteDelegate query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }
    static async checkDelegateByAddress(address, idDelegate, deputy) {
        logger.debug('checkDelegateByAddress query start')

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idDelegate 
                FROM
                    delegate 
                WHERE
                    idDelegate = ? 
                    AND owner = ? 
                    AND deputy = ?
                `

            mysql.query(sql, [idDelegate, address, deputy], (err, rows) => {
                if ( err ) { 
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject(new Error(err.message))
                }
                if ( rows == undefined || rows == null ) {
                    logger.error(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug('checkDelegateByAddress query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }

    static async addDelegate(address, deputy) {
        logger.debug('addDelegate query start')

        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO
                    delegate (owner, deputy) 
                VALUES
                    (
                        ?, ?
                    )
                `

            mysql.query(sql, [address, deputy], (err, rows) => {
                if ( err ) { 
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject(new Error(err.message))
                }
                if ( rows == undefined || rows == null ) {
                    logger.error(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug('addDelegate query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }
    static async checkIfDelegateExists(address, deputy) {
        logger.debug('checkIfDelegateExists query start')

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idDelegate 
                FROM
                    delegate 
                WHERE
                    owner = ? 
                    AND deputy = ?
                `

            mysql.query(sql, [address, deputy], (err, rows) => {
                if ( err ) { 
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject(new Error(err.message))
                }
                if ( rows == undefined || rows == null ) {
                    logger.error(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug('checkIfDelegateExists query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }
    static async checkIfUserExists(address) {
        logger.debug('checkIfUserExists query start')

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    address 
                FROM
                    utente 
                WHERE
                    address = ?
                `

            mysql.query(sql, [address], (err, rows) => {
                if ( err ) { 
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject(new Error(err.message))
                }
                if ( rows == undefined || rows == null ) {
                    logger.error(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug('checkIfUserExists query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }

    static async getDelegationData(address, idDelegate) {
        logger.debug('getDelegate query start')

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT * FROM delegate WHERE idDelegate = ? AND deputy = ?
                `

            mysql.query(sql, [idDelegate, address], (err, rows) => {
                if ( err ) { 
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject(new Error(err.message))
                }
                if ( rows == undefined || rows == null ) {
                    logger.error(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug('getDelegate query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }

    static async getDelegate(address, deputy) {
        logger.debug('getDelegate query start')

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    d.*,
                    IF(p.id IS NULL OR p.cityName IS NULL, d.deputy, p.cityName) AS disDeputy 
                FROM
                    delegate AS d 
                    LEFT JOIN
                        profile AS p 
                        ON p.address = d.deputy 
                WHERE
                    d.owner = ? AND d.deputy = ?
                `

            mysql.query(sql, [address, deputy], (err, rows) => {
                if ( err ) { 
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject(new Error(err.message))
                }
                if ( rows == undefined || rows == null ) {
                    logger.error(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug('getDelegate query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }

    static async getDelegates(address) {
        logger.debug('getDelegates query start')

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    d.*,
                    IF(p.id IS NULL OR p.cityName IS NULL, d.deputy, p.cityName) AS disDeputy 
                FROM
                    delegate AS d 
                    LEFT JOIN
                        profile AS p 
                        ON p.address = d.deputy 
                WHERE
                    d.owner = ?
                ORDER BY
                    idDelegate DESC
                `

            mysql.query(sql, [address], (err, rows) => {
                if ( err ) { 
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject(new Error(err.message))
                }
                if ( rows == undefined || rows == null ) {
                    logger.error(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug('getDelegates query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }

    static async getDelegatedCities(address) {
        logger.debug('getDelegatedCities query start')

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    d.*,
                    IF(p.id IS NULL OR p.cityName IS NULL, d.owner, p.cityName) AS disOwner,
                    p.image 
                FROM
                    delegate AS d 
                    LEFT JOIN
                        profile AS p 
                        ON p.address = d.owner 
                WHERE
                    d.deputy = ? 
                ORDER BY
                    idDelegate DESC
                `

            mysql.query(sql, [address], (err, rows) => {
                if ( err ) { 
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject(new Error(err.message))
                }
                if ( rows == undefined || rows == null ) {
                    logger.error(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug('getDelegatedCities query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }
    
    static async updateDelegate(delegate) {
        logger.debug('updateDelegate query start')

        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    delegate 
                SET
                    isAllowed = ?, claim = ?, upgrade = ?, marketplace = ?, shop = ?, transfer = ?, profile = ?, inventory = ?, fisherman = ? 
                WHERE
                    idDelegate = ?
                `

            mysql.query(sql, [delegate.isAllowed, delegate.delegations.claim, delegate.delegations.upgrade, delegate.delegations.marketplace, delegate.delegations.shop, delegate.delegations.transfer, delegate.delegations.profile, delegate.delegations.inventory, delegate.delegations.fisherman, delegate.id], (err, rows) => {
                if ( err ) { 
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject(new Error(err.message))
                }
                if ( rows == undefined || rows == null ) {
                    logger.error(`query error: no result`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug('updateDelegate query end')
                }
                return (resolve(JSON.parse(JSON.stringify(rows))))
            })
        })
    }

    static async getCitiesDelegated(deputy){
        logger.debug('getDelegate query start');
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM delegate WHERE deputy = ?";

            mysql.query(sql, deputy, (err, rows) => {
                if(err){ 
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject(new Error(err.message));
                }
                if(rows == undefined || rows == null){
                    logger.error(`query error: no result`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug('getDelegate end');
                }
                return (resolve(JSON.parse(JSON.stringify(rows))));
            });
        });
    }
}

module.exports = {DelegateQueries}