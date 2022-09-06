
const { add } = require('winston');
const mysql = require('../config/databaseConfig');
const logger= require('../logging/logger');
const {Utils} = require("../utils/utils");

class LandQueries{
    static async getTicketState(idTicket) {
        logger.debug(`getTicketState START`);

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT l_tic.status, l_con.address
                FROM land_ticket AS l_tic
                JOIN land_contract AS l_con
                ON l_con.idContract = l_tic.idContract
                WHERE l_tic.idTicket = ?
            `

            mysql.query(sql, [idTicket], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getTicketState END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }

    static async getTicketGivenUser(address) {
        logger.debug(`getTicketGivenUser START`);

        return new Promise((resolve, reject) => {
            let sql = `
                SELECT * 
                FROM land_ticket
                WHERE address = ? AND status = ?
            `

            mysql.query(sql, [address, "sent"], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getTicketGivenUser END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getContractStatus(idContract) {
        logger.debug(`getContractStatus START`);

        return new Promise((resolve, reject) => {
            let sql = `SELECT contractStatus FROM land_contract WHERE idContract = ?`

            mysql.query(sql, [idContract], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getContractStatus END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async verifyProperty(address, nftId) {
        logger.debug(`verifyProperty START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT * FROM land_instance WHERE idLandInstance = ? AND address = ?
                `
            mysql.query(sql, [nftId, address], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`verifyProperty END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getNFT(nftId ) {
        logger.debug(`getNFT START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT * FROM land_instance WHERE idLandInstance = ?
                `
            mysql.query(sql, [nftId], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getNFT END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }
    
    static async getIdLandInstanceFromAddress(address) {
        logger.debug(`getIdLandInstanceFromAddress START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT land_contract.idLandInstance
                FROM land_guest
                LEFT JOIN land_contract
                ON land_contract.idContract = land_guest.idContract
                WHERE land_guest.address = ?
                `
            mysql.query(sql, [address], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getIdLandInstanceFromAddress END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }
    static async getIdWorldFromAddress(address) {
        logger.debug(`getIdWorldFromAddress START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT land_instance.idWorld
                FROM land_guest
                LEFT JOIN land_contract
                ON land_contract.idContract = land_guest.idContract
                LEFT JOIN land_instance
                ON land_instance.idLandInstance = land_contract.idLandInstance
                WHERE land_guest.address = ?
                `
            mysql.query(sql, [address], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getIdWorldFromAddress END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }

    static async getLandsGivenIdWorld(idWorld) {
        logger.debug(`getLandsGivenIdWorld START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    * 
                FROM
                    land_instance
                    LEFT JOIN land_level ON land_instance.idLandLevel = land_level.idLandLevel
                    LEFT JOIN land ON land_instance.idLand = land.idLand
                
                WHERE
                    idWorld = ?
                `
            mysql.query(sql, [idWorld], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getLandsGivenIdWorld END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getAllWorlds() {
        logger.debug(`getAllWorlds START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT world.*, COUNT(land_instance.idLandInstance) AS landCount
                FROM world
                LEFT JOIN land_instance
                ON land_instance.idWorld = world.idWorld AND land_instance.stake = 1
                GROUP BY world.idWorld
                `
            mysql.query(sql, (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getAllWorlds END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getWorldInfo(idWorld) {
        logger.debug(`getWorldInfo START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    * 
                FROM
                    world
                WHERE
                    idWorld = ?
                `
            mysql.query(sql, idWorld,(err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getWorldInfo END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getOwnerInfo(address) {
        logger.debug(`getOwnerInfo START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    * 
                FROM
                    profile
                LEFT JOIN emblems on profile.idEmblem = emblems.idEmblem
                LEFT JOIN leaderboard on profile.address = leaderboard.address
                WHERE
                    profile.address = ?
                `
            mysql.query(sql, address,(err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getOwnerInfo END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getUserHomeFromWorld(idWorld,address) {
        logger.debug(`getUserHomeFromWorld START`);
        return new Promise((resolve, reject) => {
            let sql = `
            select *
            from world w 
            left join land_instance li on li.idWorld = w.idWorld 
            left join land_guest lg on li.idContract = lg.idContract 
            where w.idWorld =? and lg.address =?
                `
            mysql.query(sql, [idWorld,address], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getUserHomeFromWorld END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getUserHomeGivenIdLandInstance(idLandInstance,address) {
        logger.debug(`getUserHomeGivenIdLandInstance START`);
        return new Promise((resolve, reject) => {
            let sql = `
            select *
            FROM
                land_instance li  
            left join land_guest lg on li.idContract = lg.idContract 
            where li.idLandInstance =? and lg.address =?
                `
            mysql.query(sql, [idLandInstance,address], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getUserHomeGivenIdLandInstance END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }



    static async getOwnedLands(address) {
        logger.debug(`getOwnedLands START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *, land_instance.image as nftImage 
                FROM
                    land_instance
                    LEFT JOIN land_level ON land_instance.idLandLevel = land_level.idLandLevel
                    LEFT JOIN land ON land_instance.idLand = land.idLand
                
                WHERE
                    address = ?
                `
            mysql.query(sql, [address], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getOwnedLands END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getLandGuestsGivenIdLandInstance(idLandInstance) {
        logger.debug(`getLandGuestsGivenIdLandInstance START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    land_guest.*, land_contract.*, profile.*, emblems.*, leaderboard.*, profile.address AS address, buildings.level AS thLevel
                FROM
                    land_guest
                    LEFT JOIN land_contract ON land_guest.idContract = land_contract.idContract
                    LEFT JOIN profile ON land_guest.address = profile.address
                    LEFT JOIN emblems ON profile.idEmblem= emblems.idEmblem
                    LEFT JOIN leaderboard ON leaderboard.address = land_guest.address
                    LEFT JOIN buildings ON buildings.stake = 1 AND buildings.type = 1 AND buildings.address = land_guest.address
                WHERE
                    idLandInstance = ? and contractStatus = 'active'
                `
            mysql.query(sql, [idLandInstance], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getLandGuestsGivenIdLandInstance END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getLandProperty(idLandInstance,address) {
        logger.debug(`getLandProperty START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    * 
                FROM
                    land_instance
                WHERE
                    idLandInstance = ? AND address = ? AND stake = 1

                `
            mysql.query(sql, [idLandInstance,address], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getLandProperty END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getLandPropertyGivenIdTicket(idTicket, address, idTicketMarketplace) {
        logger.debug(`getLandPropertyGivenIdTicket START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    * 
                FROM
                    land_instance
                JOIN
                    land_ticket ON land_ticket.idContract = land_instance.idContract
                JOIN
                    ticket_marketplace ON ticket_marketplace.idTicket = land_ticket.idTicket
                JOIN
                    land_contract ON land_contract.idContract = land_ticket.idContract
                WHERE
                    ticket_marketplace.idTicketMarketplace = ?
                    AND ticket_marketplace.marketStatus = ?
                    AND land_ticket.idTicket = ?
                    AND land_contract.address = ? 
                    AND stake = 1
                `
            mysql.query(sql, [idTicketMarketplace, 'active', idTicket, address], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getLandPropertyGivenIdTicket END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    
    static async getStakedLand(address) {
        logger.debug(`getStakedLand START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    * 
                FROM
                    land_instance
                WHERE
                    stake = 1 AND address = ?

                `
            mysql.query(sql, [address], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getStakedLand END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getLandGivenIdLandInstance(idLandInstance) {
        logger.debug(`getLandGivenIdLandInstance START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    * 
                FROM
                    land_instance
                LEFT JOIN land_level
                ON  land_instance.idLandLevel = land_level.idLandLevel
                LEFT JOIN land
                ON land_instance.idLand = land.idLand
                WHERE
                    idLandInstance = ?

                `
            mysql.query(sql, [idLandInstance], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getLandGivenIdLandInstance END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getLandContractGivenIdLandInstance(idLandInstance,status) {
        logger.debug(`getLandContractGivenIdLandInstance START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    * 
                FROM
                    land_contract
                WHERE
                    idLandInstance = ? AND endingTime > current_timestamp AND contractStatus = ?

                `
            mysql.query(sql, [idLandInstance,status], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getLandContractGivenIdLandInstance END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async insertContractIntoLand(idLandInstance,idContract) {
        logger.debug(`insertContractIntoLand START`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE 
                    land_instance
                SET
                    idContract = ?
                WHERE
                    idLandInstance = ? 

                `
            mysql.query(sql, [idContract,idLandInstance], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`insertContractIntoLand END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getTicketsNotOwned(idLandInstance) {
        logger.debug(`getTicketsNotOwned START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    * 
                FROM
                    land_ticket
                    LEFT JOIN land_contract ON land_ticket.idContract = land_contract.idContract
                WHERE
                    status = ? AND idLandInstance = ?

                `
            mysql.query(sql, ["sent", idLandInstance], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getTicketsNotOwned END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getLandUpgradeInfo(idLandInstance,address) {
        logger.debug(`getLandInfo START`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
            up_la.idResourceRequirement, up_la.idItemRequirement,
            IF(res_req.ancien IS NULL, 0, res_req.ancien) AS requiredAncien,
            IF(res_req.wood IS NULL, 0, res_req.wood) AS requiredWood,
            IF(res_req.stone IS NULL, 0, res_req.stone) AS requiredStone,
            IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
            i_ins.idItemInstance,
            IF(IF(res_req.ancien IS NULL, 0, res_req.ancien) > u.ancien, FALSE, TRUE) AS isAncienAllowed,
            IF(IF(res_req.wood IS NULL, 0, res_req.wood) > u.wood, FALSE, TRUE) AS isWoodAllowed,
            IF(IF(res_req.stone IS NULL, 0, res_req.stone) > u.stone, FALSE, TRUE) AS isStoneAllowed,
            IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
            i.name AS requiredItemName, i.image AS requiredItemImage
        FROM
            land_instance AS la_ins
            JOIN
                utente AS u 
                ON u.address = la_ins.address
            left JOIN
            land_level as la_le
            ON la_ins.idLandLevel = la_le.idLandLevel 
            LEFT JOIN
                upgrade_land AS up_la 
                ON  up_la.idUpgradeLand = la_le.idUpgradeLand
            LEFT JOIN
                resource_requirements AS res_req 
                ON res_req.idResourceRequirement = up_la.idResourceRequirement 
            LEFT JOIN
                item_requirements AS i_req 
                ON i_req.idItemRequirement = up_la.idItemRequirement 
            LEFT JOIN
                item_instance AS i_ins 
                ON i_ins.address = la_ins.address 
                AND i_ins.idItem = i_req.idItem 
            LEFT JOIN
                item AS i 
                ON i.idItem = i_req.idItem 
        WHERE
            la_ins.idLandInstance = ? 
            AND la_ins.address = ?
                `
            mysql.query(sql, [idLandInstance,address], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getLandInfo END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getNotification(idNotificationInstance,address) {
        logger.debug(`getNotification START`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT * 
            FROM notification_instance
            WHERE idNotificationInstance = ? AND address = ? AND seen=false
                `
            mysql.query(sql, [idNotificationInstance,address], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getNotification END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async createNotificationInstance(idNotification, address, seen, description) {
        logger.debug(`setNotification START`);
        return new Promise((resolve, reject) => {
            let sql = `
            INSERT INTO notification_instance ( idNotification, address, seen, description )
            VALUES (?, ?, ?, ?)`

            mysql.query(sql, [idNotification, address, seen, description], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`setNotification END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getNotificationInstance(address, seen) {
        logger.debug(`setNotification START`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT idNotificationInstance
            FROM notification_instance
            WHERE address = ? AND seen = ?
            `

            mysql.query(sql, [address, seen], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`setNotification END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async setNotificationSeen(idNotificationInstance) {
        logger.debug(`setNotificationSeen START`);
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE 
            notification_instance
            SET seen = true
            WHERE idNotificationInstance = ?
                `
            mysql.query(sql, [idNotificationInstance], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`setNotificationSeen END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    
    static async removeNotificationLand(idNotificationInstance,idLandInstance) {
        logger.debug(`removeNotificationLand START`);
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE 
            land_instance
            SET idNotificationInstance = null , upgradeFirstLogin = false
            WHERE idNotificationInstance = ? AND idLandInstance = ?
                `
            mysql.query(sql, [idNotificationInstance,idLandInstance], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`removeNotificationLand END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async checkRequirementsUpgradeLand(address, idLandInstance, consumableIds){
        logger.info(`checkRequirementsUpgradeLand start`)
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
            up_la.idResourceRequirement, up_la.idItemRequirement,
            IF(res_req.ancien IS NULL, 0, res_req.ancien) AS requiredAncien,
            IF(res_req.wood IS NULL, 0, res_req.wood) AS requiredWood,
            IF(res_req.stone IS NULL, 0, res_req.stone) AS requiredStone,
            IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
            i_ins.idItemInstance,
            IF(IF(res_req.ancien IS NULL, 0, res_req.ancien) > u.ancien, FALSE, TRUE) AS isAncienAllowed,
            IF(IF(res_req.wood IS NULL, 0, res_req.wood) > u.wood, FALSE, TRUE) AS isWoodAllowed,
            IF(IF(res_req.stone IS NULL, 0, res_req.stone) > u.stone, FALSE, TRUE) AS isStoneAllowed,
            IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
            u.ancien AS ancienBefore, u.wood AS woodBefore, u.stone AS stoneBefore,
            i_ins.quantity AS itemBefore, i_ins.idItem AS idItemReq
        FROM
            land_instance AS la_ins
            JOIN
                utente AS u 
                ON u.address = la_ins.address
            left JOIN
            land_level as la_le
            ON la_ins.idLandLevel = la_le.idLandLevel 
            LEFT JOIN
                upgrade_land AS up_la 
                ON  up_la.idUpgradeLand = la_le.idUpgradeLand
            LEFT JOIN
                resource_requirements AS res_req 
                ON res_req.idResourceRequirement = up_la.idResourceRequirement 
            LEFT JOIN
                item_requirements AS i_req 
                ON i_req.idItemRequirement = up_la.idItemRequirement 
            LEFT JOIN
                item_instance AS i_ins 
                ON i_ins.address = la_ins.address 
                AND i_ins.idItem = i_req.idItem 
            LEFT JOIN
                item AS i 
                ON i.idItem = i_req.idItem 
        WHERE
            la_ins.idLandInstance = ? 
            AND la_ins.address = ?
                `, params = [idLandInstance, address]
            if(consumableIds.length > 0){    
            for(let i = 0; i < consumableIds.length; i++) {
                sql += `
                    UNION
                    SELECT
                        0 AS requiredAncien, 0 AS requiredWood, 0 AS requiredStone,
                        i_con.quantity AS requiredItemQuantity,
                        i_ins.idItemInstance,
                        TRUE AS isAncienAllowed, TRUE AS isWoodAllowed, TRUE AS isStoneAllowed,
                        IF(IF(i_con.quantity IS NULL, 0, i_con.quantity) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
                        0 AS ancienBefore, 0 AS woodBefore, 0 AS stoneBefore,
                        i_ins.quantity AS itemBefore, i_ins.idItem AS idItemReq
                    FROM
                        item_consumable AS i_con 
                        JOIN
                            item AS i 
                            ON i.idItem = i_con.idItem 
                        LEFT JOIN
                            item_instance AS i_ins 
                            ON i_ins.idItem = i.idItem 
                            AND i_ins.address = ? 
                    WHERE
                        i_con.idItemConsumable = ?
                    `
                params.push(address, consumableIds[i])
            }}
        

            mysql.query(sql, params , (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    logger.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.info(`checkRequirementsUpgradeLand end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getUpgradeTime(idLand,level) {
        logger.debug(`getUpgradeTime START`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT 
            upgradeTime
            FROM land_level
            WHERE idLand = ? AND level = ?
                `
            mysql.query(sql, [idLand,level], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getUpgradeTime END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].upgradeTime)
                }
            })
        })
    }

    static async setUpgradeLand(idLandInstance, idLand, endingTime){
        logger.debug("setUpgradeLand start");
        return new Promise((resolve, reject) => {
            let sql = "UPDATE land_instance SET upgradeEndTime = ?, upgradeStatus = true, upgradeStartTime = current_timestamp WHERE idLandInstance = ?  AND stake = 1 AND idLand = ?";

            mysql.query(sql, [endingTime, idLandInstance, idLand], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("setUpgradeLand end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getAllTicketsOwner(idContract){
        logger.debug("getAllTicketsOwner start");
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM land_ticket
            LEFT JOIN menu ON menu.idMenu = land_ticket.idMenu
            WHERE  idContract = ?
            `
            mysql.query(sql, [idContract], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("getAllTicketsOwner end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    
    static async getTicket(idTicket, address){
        logger.debug("getTicket start");
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM land_ticket
            LEFT JOIN menu ON menu.idMenu = land_ticket.idMenu
            WHERE  idTicket = ? AND address = ?
            `
            mysql.query(sql, [idTicket, address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("getTicket end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }


    static async getTicketGivenAddress(idTicket, address){
        logger.debug("getTicketGivenAddress start");
        return new Promise((resolve, reject) => {
            /* let sql = `
            SELECT 
                land_ticket.idTicket,
                land_ticket.type,
                land_ticket.status,
                ticket_marketplace.price,
                ticket_marketplace.endingTime,
                menu.view,
                menu.send,
                menu.sell
            FROM land_ticket
                LEFT JOIN menu ON menu.idMenu = land_ticket.idMenu
                LEFT JOIN ticket_marketplace ON ticket_marketplace.idTicket = land_ticket.idTicket
                LEFT JOIN land_contract ON land_contract.idContract = land_ticket.idContract
            WHERE  land_ticket.idTicket = ? AND land_contract.address = ?
            ` */
            let sql = `
            SELECT 
                land_ticket.idTicket,
                land_ticket.type,
                land_ticket.status,
                land_ticket.statusTime,
                ticket_marketplace.price,
                ticket_marketplace.endingTime,
                menu.view,
                menu.send,
                menu.sell,
                land_contract.fee,
                land.bonus
            FROM land_ticket
                LEFT JOIN menu ON menu.idMenu = land_ticket.idMenu
                LEFT JOIN ticket_marketplace ON ticket_marketplace.idTicket = land_ticket.idTicket
                LEFT JOIN land_contract ON land_contract.idContract = land_ticket.idContract
                LEFT JOIN land_instance ON land_instance.idLandInstance = land_contract.idLandInstance
                LEFT JOIN land ON land.idLand = land_instance.idLand
            WHERE  land_ticket.idTicket = ?
            `
            mysql.query(sql, [idTicket/* , address */], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("getTicketGivenAddress end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    //added control on contractStatus
    static async getContractGivenIdContract(idLandInstance, address, idContract){
        logger.debug("getContractGivenIdContract start");
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM land_contract
            WHERE idLandInstance = ? AND address = ? AND idContract = ? AND contractStatus = 'active'
            `
            mysql.query(sql, [idLandInstance,address, idContract], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("getContractGivenIdContract end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getContract(idLandInstance,address){
        logger.debug("getContract start");
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM land_contract
            WHERE idLandInstance = ? AND address = ?
            `
            mysql.query(sql, [idLandInstance,address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("getContract end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getActiveContractGivenIdLandInstance(idLandInstance){
        logger.debug("getActiveContractGivenIdLandInstance start");
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM land_contract
            WHERE idLandInstance = ? AND contractStatus = 'active'
            `
            mysql.query(sql, [idLandInstance], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("getActiveContractGivenIdLandInstance end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async activeContractCheck(idLandInstance){
        logger.debug("activeContractCheck start");
        return new Promise((resolve, reject) => {
            let sql = `
            select  (case 
                when endingTime < current_timestamp() 
                then 1 
                else 0
            end ) as expired , idContract
                        FROM
                            land_contract lc 
                        WHERE
                            idLandInstance = ? and contractStatus = 'active'
            `
            mysql.query(sql, [idLandInstance], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("activeContractCheck end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async setContractExpired(idContract){
        logger.debug("activeContractCheck start");
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE land_contract
            SET contractStatus = CASE when endingTime < current_timestamp() AND contractStatus = 'active'
                                    THEN 'expired' 
                                    ELSE contractStatus END
            WHERE idContract = ?
            `
            mysql.query(sql, [idContract], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("activeContractCheck end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async kickAllGuests(idContract){
        logger.debug("kickAllGuests start");
        return new Promise((resolve, reject) => {
            let sql = `
            DELETE FROM land_guest
            WHERE idContract = ?
            `
            mysql.query(sql, [idContract], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("kickAllGuests end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getTicketMarketplace(idTicket){
        logger.debug("getTicketMarketplace start");
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM ticket_marketplace
            WHERE idTicket = ?
            ORDER BY idTicketMarketplace DESC
            `
            mysql.query(sql, [idTicket], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("getTicketMarketplace end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getMaxSpotGivenIdLandInstance(idLandInstance){
        logger.debug("getMaxSpotGivenIdLandInstance start");
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT maxSpot
            FROM land_instance
            LEFT JOIN land_level ON land_instance.idLandLevel = land_level.idLandLevel
            WHERE idLandInstance = ?
            `
            mysql.query(sql, [idLandInstance], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("getMaxSpotGivenIdLandInstance end");
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }

    static async updateTicketCreated(idContract,quantity){
        logger.debug("updateTicketCreated start");
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE land_contract
            SET quantityGenerated = quantityGenerated + ?
            WHERE idContract = ?
            `
            mysql.query(sql, [quantity,idContract], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("updateTicketCreated end");
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }

    static async removeIdTicketMarketplace(idTicketMarketplace, idTicket){
    logger.debug("removeIdTicketMarketplace start");
    return new Promise((resolve, reject) => {
        let sql = `
        UPDATE 
            ticket_marketplace
        SET 
            deleteTime = current_timestamp,
            marketStatus = ?,
            toShow = 0

        WHERE idTicketMarketplace = ? AND idTicket = ?
        `
        mysql.query(sql, ['deleted', idTicketMarketplace, idTicket], (err, rows) => {
            if(err) return reject(new Error(err.message));
            if(rows == undefined || rows == null){
                logger.error(`query error: ${Utils.printErrorLog(err)}`);
                return reject({
                    message: "undefined"
                });
            }else{
                logger.debug("removeIdTicketMarketplace end");
                return resolve(JSON.parse(JSON.stringify(rows))[0]);
            }
        });
    });
}

    static async updateTicket(idTicket, address){
        logger.debug("updateTicket start");
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE 
                land_ticket
            SET 
                status = ?,
                address = ?,
                idMenu = (SELECT MIN(idMenu) FROM menu WHERE craft=0 AND view = 1 AND send = 1 and sell =1),
                statusTime = current_timestamp
            WHERE 
                idTicket = ?
            `
            mysql.query(sql, ['generated', address, idTicket], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("updateTicket end");
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }

    static async updateLandFirstLogin(idLandInstance, idLandLevel){
        logger.debug(`updateLandFirstLogin start`);
        return new Promise((resolve, reject) => {
            let sql = `
                    UPDATE land_instance
                    SET upgradeStatus = 0, idLandLevel = ?
                    WHERE idLandInstance = ?
                    `;

            mysql.query(sql, [idLandLevel, idLandInstance], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`updateLandFirstLogin end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async insertNewTickets(idContract,quantity,type,address){
        logger.debug("insertNewTickets start");
        return new Promise((resolve, reject) => {
            let sql = `
               INSERT INTO land_ticket (idContract, type, status, idMenu, address, statusTime) VALUES (?,?,'generated',(SELECT MIN(idMenu) from menu WHERE craft= 0 AND send=1 AND sell=1 AND view =1),?, current_timestamp)
            `,params = [idContract,type,address]
            if(quantity>1){
                for(let i = 1;i<quantity;i++){
                    sql +=`
                        ,(?,?,'generated',(SELECT MIN(idMenu) from menu WHERE craft= 0 AND send=1 AND sell=1 AND view =1),?, current_timestamp)
                    `
                    params.push(idContract,type,address);
                }
            }
            mysql.query(sql, params, (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("insertNewTickets end");
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }

    static async getLandLevel(idLand, level){
        logger.debug(`getLandLevel start`);
        return new Promise((resolve, reject) => {
            let sql = `
                    SELECT *
                    FROM land_level
                    WHERE idLand = ? AND level = ?
                    `;
            mysql.query(sql, [idLand, level], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getLandLevel end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async verifySaleableTicket(idTicket, address){
        logger.debug(`verifySaleableTicket start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
            * 
            FROM
                land_ticket lt 
            LEFT JOIN land_contract lc ON  lt.idContract  = lc.idContract 
            LEFT JOIN land_instance li ON li.idLandInstance  = lc.idLandInstance 
            WHERE
                lt.address = ?
                AND stake = 1
                AND idTicket = ?
                AND lt.status = 'generated'
                AND contractStatus = 'active'
                    `;
            mysql.query(sql, [address, idTicket], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`verifySaleableTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async createListing(idTicket,price,creationTime,endingTime){
        logger.debug(`createListing start`);
        return new Promise((resolve, reject) => {
            let sql = `
            INSERT IGNORE INTO ticket_marketplace (idTicket,price,creationTime,endingTime,marketStatus,toShow)
            VALUES (?,?,?,?,'active',1)
                    `;
            mysql.query(sql, [idTicket, price, creationTime, endingTime], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`createListing end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateTicketSellingStatus(idTicket,address){
        logger.debug(`ticketSellingStatusUpdate start`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE land_ticket
                SET address = ? , status = 'onSale' , idMenu=(SELECT min(idMenu) FROM menu m WHERE m.view = 1 AND m.sell = 0 AND m.send = 0 AND m.craft = 0), statusTime = current_timestamp
                WHERE idTicket = ? AND address = ?
                    `;
            mysql.query(sql, [process.env.MARKETPLACE_TICKET_ADDRESS, idTicket, address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`ticketSellingStatusUpdate end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getSellingTicket(idTicket){
        logger.debug(`getSellingTicket start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT *
                FROM ticket_marketplace
                WHERE marketStatus = 'active' AND idTicket = ?
                    `;
            mysql.query(sql, [ idTicket], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getSellingTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getTicketGivenIdTicket(idTicket,address){
        logger.debug(`getTicketGivenIdTicket start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT *
                FROM land_ticket
                WHERE idTicket = ? AND address = ? AND status = ?
                    `;
            mysql.query(sql, [ idTicket,address, 'generated'], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getTicketGivenIdTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getTicketInfoGivenIdTicket(idTicket, address){
        logger.debug(`getTicketInfoGivenIdTicket start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT 
                    land_ticket.idTicket,
                    land_ticket.idContract,
                    land_ticket.type,
                    land_ticket.status,
                    land_ticket.address,
                    land_contract.fee,
                    land_contract.address AS ownerAddress,
                    land_contract.idLandInstance,
                    land_contract.contractStatus,
                    land_instance.idLand,
                    land_instance.idLandLevel,
                    land_instance.spotOccupied
                FROM 
                    land_ticket
                    JOIN land_contract ON land_ticket.idContract = land_contract.idContract
                    JOIN land_instance ON land_contract.idLandInstance = land_instance.idLandInstance

                WHERE land_ticket.idTicket = ? AND land_ticket.address = ?
                    `;
            mysql.query(sql, [ idTicket,address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getTicketInfoGivenIdTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async checkIfHasBoughtTicket(idLandInstance, address) {
        logger.debug(`checkIfHasBoughtTicket start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    l.bonus,
                    l_con.fee,
                    l_con.endingTime,
                    l_con.creationTime,
                    l_tic.idTicket,
                    l_tic.type as ticketType,
                    l_tic.status,
                    t_mar.price,
                    IF(l_gue.idGuest IS NULL, FALSE, TRUE) AS subscribe 
                FROM
                    land_instance AS l_ins 
                    JOIN
                        land AS l 
                        ON l.idLand = l_ins.idLand 
                    JOIN
                        land_contract AS l_con 
                        ON l_con.idLandInstance = l_ins.idLandInstance 
                        AND l_con.isPrivate = 0 
                        AND l_con.contractStatus = 'active' 
                    JOIN
                        land_ticket AS l_tic 
                        ON l_tic.idContract = l_con.idContract 
                        AND (l_tic.status = ? OR l_tic.status = ?) 
                        AND l_tic.address = ? 
                    LEFT JOIN
                        land_guest AS l_gue 
                        ON l_gue.idContract = l_con.idContract 
                        AND l_gue.address = ? 
                    LEFT JOIN
                        ticket_marketplace AS t_mar 
                        ON t_mar.idTicket = l_tic.idTicket 
                WHERE
                    l_ins.idLandInstance = ? 
                    AND l_ins.stake = 1 
                    AND l_ins.isPrivate = 0
                `;
            mysql.query(sql, ["sent", "used", address, address, idLandInstance], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`checkIfHasBoughtTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getSellingAndPublicTicket(idLandInstance, address){
        logger.debug(`getSellingAndPublicTicket start`);
        return new Promise((resolve, reject) => {
            let sql = `
                    SELECT 
                        IF( utente.ancien > ticket_marketplace.price, TRUE, FALSE) AS isBuyable,
                        land_ticket.idTicket,
                        ticket_marketplace.creationTime,
                        ticket_marketplace.endingTime,
                        ticket_marketplace.price,
                        ticket_marketplace.marketStatus,
                        ticket_marketplace.toShow
                    FROM
                        ticket_marketplace
                    JOIN 
                        land_ticket 
                        ON ticket_marketplace.idTicket = land_ticket.idTicket
                    JOIN
                        land_instance
                        ON land_ticket.idContract = land_instance.idContract
                    JOIN 
                        land_contract
                        ON land_instance.idContract = land_contract.idContract
                    JOIN
                        utente
                        ON utente.address = ?
                    WHERE
                        ticket_marketplace.marketStatus = 'active'
                        AND ticket_marketplace.toShow = 1
                        AND land_ticket.status = 'onSale'
                        AND land_instance.isPrivate = 0 AND land_instance.idLandInstance = ?
                        AND land_contract.isPrivate = 0 AND land_contract.contractStatus = 'active'
                        AND land_contract.endingTime > current_timestamp()
                    `;
            mysql.query(sql, [address, idLandInstance], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getSellingAndPublicTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    
    static async getCreatedContractVoucherCreation(address){
        logger.debug(`getCreatedContractVoucherCreation start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT *
                FROM voucher_contract
                WHERE owner = ? AND status = 'created' AND creation = 1
                    `;
            mysql.query(sql, [address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{

                    logger.debug(`getCreatedContractVoucherCreation end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }

    static async getCreatedContractVoucherDelete(address,idContract){
        logger.debug(`getCreatedContractVoucher start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT *
                FROM voucher_contract
                WHERE owner = ? AND status = 'created' AND creation = 0 AND idContract = ?
                    `;
            mysql.query(sql, [address,idContract], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getCreatedContractVoucher end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }

    static async createNewContract(address,idLandInstance,fee,creationTime,endingTime,isPrivate){
        logger.debug(`createNewContract start`);
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO land_contract
                (fee,endingTime,creationTime,address,idLandInstance,quantityGenerated,isPrivate,contractStatus)

                VALUES (?,?,?,?,?,0,?,'created')
                    `;
            mysql.query(sql, [fee,endingTime,creationTime,address,idLandInstance,isPrivate], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`createNewContract end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }

    static async deleteContract(address,idLandInstance,idContract){
        logger.debug(`deleteContract start`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE land_contract
                SET contractStatus = 'pending'
                WHERE idContract = ? AND idLandInstance = ? AND address = ?
                    `;
            mysql.query(sql, [idContract,idLandInstance,address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`deleteContract end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }
    
    static async getPendingContract(address,idContract){
        logger.debug(`getPendingContract start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT *
                FROM land_contract
                WHERE contractStatus = 'pending' AND address = ? AND idContract = ?
                    `;
            mysql.query(sql, [address,idContract], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getPendingContract end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }

    static async getContractProperty(address,idContract){
        logger.debug(`getContractProperty start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT *
                FROM land_contract
                WHERE address = ? AND idContract = ?
                    `;
            mysql.query(sql, [address,idContract], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getContractProperty end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }

    static async getLandGuests(idLandInstance) {
        logger.debug(`getLandGuests START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    land_guest.address,
                    land_instance.isPrivate,
                    land_guest.idGuest,
                    utente.nickname as name,
                    profile.cityName,
                    profile.image as cityImage,
                    emblems.imageEmblem,
                    land_guest.startingTime,
                    land_guest.isVisitable,
                    leaderboard.experience,
                    land_guest.position 
                FROM
                    land_guest
                    LEFT JOIN land_contract ON land_guest.idContract = land_contract.idContract
                    LEFT JOIN land_instance ON land_contract.idContract = land_instance.idContract
                    LEFT JOIN profile ON land_guest.address = profile.address
                    LEFT JOIN emblems ON profile.idEmblem= emblems.idEmblem
                    LEFT JOIN leaderboard ON leaderboard.address = land_guest.address
                    LEFT JOIN utente ON profile.address = utente.address 
                WHERE
                land_contract.idLandInstance = ?
                `
            mysql.query(sql, [idLandInstance], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getLandGuests END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getLandInstanceGivenAddress(address){
        logger.debug(`getLandInstanceGivenAddress start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT land_instance.idLandInstance
                FROM land_instance 
                    JOIN land_contract ON land_instance.idContract = land_contract.idContract
                    JOIN land_guest ON land_guest.idContract = land_contract.idContract
                WHERE land_guest.address = ? 
                    `;
            mysql.query(sql, [address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getLandInstanceGivenAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }

    static async checkRequirementsTicket(idTicket, address){
        logger.debug(`checkRequirementsTicket start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT IF((utente.ancien >= ticket_marketplace.price), ticket_marketplace.price, -1) AS checkReq,
                land_contract.address AS ownerAddress,
                land_contract.idContract AS idContract
                FROM
                    land_ticket
                    JOIN 
                    ticket_marketplace ON land_ticket.idTicket = ticket_marketplace.idTicket 
                    JOIN
                    land_contract ON land_ticket.idContract = land_contract.idContract
                    JOIN
                    utente ON utente.address = ?
                WHERE
                    land_ticket.idTicket = ?
                    AND land_ticket.type = 'paid'
                    AND ticket_marketplace.marketStatus = 'active'
                    AND ticket_marketplace.endingTime > current_timestamp
                    AND land_contract.isPrivate = 0
                    AND land_contract.contractStatus = 'active'
                    AND land_contract.endingTime > current_timestamp
                    `;
            mysql.query(sql, [address, idTicket], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`checkRequirementsTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }

    static async getValuableContract(idLandInstance,address){
        logger.debug(`getValuableContract start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT *
                FROM land_contract
                WHERE contractStatus != 'expired' AND contractStatus != 'deleted' AND address=? AND idLandInstance = ?
                    `;
            mysql.query(sql, [address,idLandInstance], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getValuableContract end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }

    static async updateBuyTicketMarketpalceStatus(idTicket){
        logger.debug(`updateBuyTicketMarketpalceStatus start`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE ticket_marketplace
                SET 
                    saleTime = current_timestamp,
                    marketStatus = 'sold'
                WHERE idTicket = ?
                    `;
            mysql.query(sql, [idTicket], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`updateBuyTicketMarketpalceStatus end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getTicketsGivenAddress(address,idWorld){
        logger.debug(`getTicketsGivenAddress start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT *, lt.type as ticketType, l.type as landType
                FROM land_ticket lt
                LEFT JOIN land_contract lc on lc.idContract = lt.idContract
                LEFT JOIN land_instance li on li.idContract = lc.idContract
                LEFT JOIN land l on li.idLand = l.idLand
                WHERE lt.address = ? AND li.idWorld = ?
                    `;
            mysql.query(sql, [address,idWorld], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`getTicketsGivenAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateBuyLandTicketStatus(idTicket, address){
        logger.debug(`updateBuyLandTicketStatus start`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE land_ticket
                SET 
                    status = ?,
                    address = ?,
                    idMenu = (SELECT MIN(idMenu) from menu WHERE craft = 0 AND sell = 0 AND view =1 AND send = 0),
                    statusTime = current_timestamp
                WHERE idTicket = ?
                    `;
            mysql.query(sql, ['sent', address, idTicket], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`updateBuyLandTicketStatus end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async checkValidityTicket(idTicket){
        logger.debug(`checkValidityTicket start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT *
                FROM
                    land_ticket
                    JOIN land_contract ON land_contract.idContract = land_ticket.idContract
                WHERE
                    land_ticket.idTicket = ?
                    AND land_contract.contractStatus = 'active'
                    AND land_contract.endingTime > current_timestamp
                    `;
            mysql.query(sql, [idTicket], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`checkValidityTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }

    static async checkValidityAndOwnershipTicket(idTicket, address){
        logger.debug(`checkValidityAndOwnershipTicket start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT *
                FROM
                    land_ticket
                    JOIN land_contract ON land_contract.idContract = land_ticket.idContract
                WHERE
                    land_ticket.idTicket = ?
                    AND land_ticket.address = ?
                    AND land_ticket.status = 'generated'
                    AND land_contract.contractStatus = 'active'
                    AND land_contract.endingTime > current_timestamp
                    `;
            mysql.query(sql, [idTicket, address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`checkValidityAndOwnershipTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }

    static async checkRevokeTicket(idTicket, address){
        logger.debug(`checkRevokeTicket start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT *
                FROM
                    land_ticket
                    JOIN land_contract ON land_contract.idContract = land_ticket.idContract
                WHERE
                    land_ticket.idTicket = ?
                    AND land_ticket.address != ?
                    AND land_ticket.status = ?
                    AND land_contract.contractStatus = 'active'
                    AND land_contract.endingTime > current_timestamp
                    `;
            mysql.query(sql, [idTicket, address, 'sent'], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`checkRevokeTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }

    static async checkValidityFreeTicket(idTicket, address){
        logger.debug(`checkValidityFreeTicket start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT *
                FROM
                    land_ticket
                    JOIN land_contract ON land_contract.idContract = land_ticket.idContract
                    JOIN land_instance ON land_instance.idContract = land_contract.idContract
                    ` + 
                "WHERE land_ticket.idTicket = ? AND land_ticket.`type` = ?" + `
                    AND land_ticket.status = ?
                    AND land_ticket.address = ?
                    AND land_contract.contractStatus = ?
                    AND land_contract.endingTime > current_timestamp
                    AND land_contract.address = ?
                    AND land_instance.address = ?
                    `;
            mysql.query(sql, [idTicket, "free", "generated", address, "active", address, address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`checkValidityFreeTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }

    static async createLandGuest(address, idContract, isVisitable, type, position){
        logger.info(`createLandGuest start`);
        return new Promise((resolve, reject) => {
            let sql = `
                        INSERT INTO land_guest (
                            address,
                            idContract,
                            type,
                            position,
                            isVisitable,
                            startingTime
                        )
                        VALUES (?, ?, ?, ?, ?, current_timestamp)
                        `;
    
            mysql.query(sql, [address, idContract, type, position, isVisitable], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`createLandGuest end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async checkSubscription(address){
        logger.info(`checkSubscription start`);
        return new Promise((resolve, reject) => {
            let sql = `
                    SELECT *
                    FROM land_guest
                    WHERE address = ?
                `;

            mysql.query(sql, [address], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`checkSubscription end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateLandInstanceSpot(newSpotOccupied, idLandInstance){
        logger.debug("updateLandInstanceSpot start");
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE 
                land_instance
            SET 
                spotOccupied = ?
            WHERE 
                idLandInstance = ?
            `
            mysql.query(sql, [newSpotOccupied, idLandInstance], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("updateLandInstanceSpot end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateTicketStatus(newStatus, idTicket){
        logger.debug("updateTicketStatus start");
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE 
                land_ticket
            SET 
                status = ?,
                statusTime = current_timestamp
            WHERE 
                idTicket = ?
            `
            mysql.query(sql, [newStatus, idTicket], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("updateTicketStatus end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateTicketStatusAndAddress(newStatus, idTicket, address, type){
        logger.debug("updateTicketStatusAndAddress start");
        return new Promise((resolve, reject) => {
            let sql;
            if(type == 'free'){
            sql = `
            UPDATE 
                land_ticket
            SET 
                status = ?,
                address = ?,
                idMenu = (select MIN(idMenu) from menu where send = 1 AND view = 1 AND sell = 0 AND craft = 0),
                statusTime = current_timestamp
            WHERE 
                idTicket = ?
            `}else{
                sql = `
                UPDATE 
                    land_ticket
                SET 
                    status = ?,
                    address = ?,
                    idMenu = (select MIN(idMenu) from menu where send = 0 AND view = 1 AND sell = 1 AND craft = 0),
                    statusTime = current_timestamp
                WHERE 
                    idTicket = ?
                ` 
            }
            mysql.query(sql, [newStatus, address, idTicket], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("updateTicketStatusAndAddress end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async checkTicketSubscription(address, idTicket, checkStatus){
        logger.debug("checkTicketSubscription start");
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT 
                land_contract.address AS ownerAddress,
                land_instance.spotOccupied,
                land_instance.idLandInstance,
                land_ticket.type
            FROM 
                land_guest
                JOIN
                land_contract ON land_guest.idContract = land_contract.idContract
                JOIN
                land_instance ON land_contract.idLandInstance = land_instance.idLandInstance 
                JOIN
                land_ticket ON land_instance.idContract = land_ticket.idContract
            WHERE 
                land_guest.address = ?
                AND land_ticket.idTicket = ?
                AND land_ticket.status = ?
            `
            mysql.query(sql, [address, idTicket, checkStatus], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("checkTicketSubscription end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async deleteLandGuest(address){
        logger.debug("deleteLandGuest start");
        return new Promise((resolve, reject) => {
            let sql = `
            DELETE
            FROM land_guest
            WHERE address = ?
            `
            mysql.query(sql, [address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("deleteLandGuest end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getGuestGivenIdGuest(idGuest){
        logger.debug("getGuestGivenIdGuest start");
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM land_guest
            WHERE idGuest = ?
            `
            mysql.query(sql, [idGuest], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("getGuestGivenIdGuest end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getCityProcedure(addressGuest){
        logger.debug("getCityProcedure start");
        return new Promise((resolve, reject) => {
            let sql = `call getAccountCity(?)
            `
            mysql.query(sql, [addressGuest], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("getCityProcedure end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async checkIfLandOwner(address, idLandInstance) {
        logger.debug(`checkIfLandOwner start`);
        return new Promise((resolve, reject) => {
            let sql = `
                    SELECT *
                    FROM land_instance
                    WHERE
                        stake = 1
                        AND address = ?
                        AND idLandInstance = ?
                    `;
            mysql.query(sql, [address, idLandInstance], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`checkIfLandOwner end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }

    static async checkAddressIsOwner(address, idLandInstance){
        logger.debug(`checkAddressIsOwner start`);
        return new Promise((resolve, reject) => {
            let sql = `
                    SELECT 
                        land.type,
                        land_instance.storage
                    FROM
                        land_instance
                        JOIN land_contract ON land_instance.idContract = land_contract.idContract
                        JOIN land ON land_instance.idLand = land.idLand
                    WHERE
                        land_contract.address = ?
                        AND land_instance.idLandInstance = ?
                    `;
            mysql.query(sql, [address, idLandInstance], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`checkAddressIsOwner end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }


    static async updateLandInstanceStorage(newStorage, idLandInstance){
        logger.debug("updateLandInstanceStorage start");
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE 
                land_instance
            SET 
                storage = ?
            WHERE 
                idLandInstance = ?
            `
            mysql.query(sql, [newStorage, idLandInstance], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("updateLandInstanceStorage end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async checkExistenceTicket(idContract, address){
        logger.debug(`checkExistenceTicket start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT *
                FROM land_ticket
                WHERE 
                    idContract = ?
                    AND address = ?
                    `;
            mysql.query(sql, [idContract, address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`checkExistenceTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }

    static async deleteTicket(address, idTicket){
        logger.debug(`deleteTicket start`);
        return new Promise((resolve, reject) => {
            let sql = `
                    DELETE FROM land_ticket
                    WHERE address = ? AND idTicket = ?
                    `;
            mysql.query(sql, [address, idTicket], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`deleteTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }

    static async revokeTicket(address, idTicket){
        logger.debug(`revokeTicket start`);
        return new Promise((resolve, reject) => {
            let sql = `
                    UPDATE land_ticket
                    SET status = 'generated', idMenu = (SELECT MIN(idMenu) FROM menu WHERE craft=0 AND view = 1 AND send = 1 and sell =1), address = ?, statusTime = current_time
                    WHERE idTicket = ?
                    `;
            mysql.query(sql, [address, idTicket], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug(`revokeTicket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });  
    }

    static async updateContract(idContract, quantity){
        logger.debug("updateContract start");
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE 
                land_contract
            SET 
                quantityGenerated = ?
            WHERE 
                idContract = ?
            `
            mysql.query(sql, [quantity, idContract], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("updateContract end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async checkTicketOwnership(address){
        logger.debug("checkTicketOwnership start");
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT 
                *
            from 
                land_ticket 
            WHERE 
                status = ?
                AND address = ?
            `
            mysql.query(sql, ["sent", address], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("checkTicketOwnership end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateIsVisitable(idGuest,isVisitable){
        logger.debug("updateIsVisitable start");
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE land_guest
            SET isVisitable = ?
            WHERE idGuest = ?
            `
            mysql.query(sql, [isVisitable,idGuest], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("updateIsVisitable end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateLandName(idLandInstance,landName){
        logger.debug("updateLandName start");
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE land_instance
                SET name = ?
                WHERE idLandInstance = ?
            `
            mysql.query(sql, [landName,idLandInstance], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("updateLandName end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async landClaimHistory(obj){
        logger.debug("landClaimHistory start");

        let claimTime = new Date().toISOString();

        let ObjectArray = obj.map(
            function(elem){
                return [
                    elem.idLandInstance,
                    elem.landType,
                    elem.address, 
                    elem.resourceBefore,
                    elem.resourceAfter,
                    elem.resourceBalanceBefore,
                    elem.resourceBalanceAfter,
                    claimTime

                ]
            }
        )

        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO    
                    land_claim_history (idLandInstance, landType, address, resourceBefore, resourceAfter,
                    resourceBalanceBefore, resourceBalanceAfter, claimTime) VALUES ?

            `
            mysql.query(sql, [ObjectArray], (err, rows) => {
                if(err) return reject(new Error(err.message));
                if(rows == undefined || rows == null){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug("landClaimHistory end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
}

module.exports = {LandQueries}