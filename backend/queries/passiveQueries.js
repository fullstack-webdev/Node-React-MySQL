const mysql = require('../config/databaseConfig');
const logger= require('../logging/logger');
const {Utils} = require("../utils/utils");

class PassiveQueries {
    // get constant data for passiveFishing from the keyword
    static async getPassiveConstant(key) {
        logger.debug(`getPassiveConstant START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    value 
                FROM
                    passive_constant 
                WHERE
                    keyword = ?
                `
            mysql.query(sql, [key], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getPassiveConstant END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].value)
                }
            })
        })
    }

    // get whole row of the passive_level table where the level is ?
    static async getPassiveLevelFromLevel(level) {
        logger.debug(`getPassiveLevelFromLevel START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    * 
                FROM
                    passive_level 
                WHERE
                    level = ?
                `
            mysql.query(sql, [level], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getPassiveLevelFromLevel END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }

    // get maxStorableActions from BuildingType & level
    static async getMaxStorableActionCount(buildingType, level) {
        logger.debug(`getMaxStorableActionCount START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    maxAction 
                FROM
                    passive_max_action 
                WHERE
                    buildingType = ? 
                    AND level = ?
                `
            mysql.query(sql, [buildingType, level], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getMaxStorableActionCount END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].maxAction)
                }
            })
        })
    }

    // insert new row at the Passive table with given params
    static async unLockPassive(pkBuilding, maxStorableActions, idPassiveLevel) {
        logger.debug(`unLockPassive START`);
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO
                    passive (pkBuilding, storedActions, maxStorableActions, idPassiveLevel, isPassive, lastPassiveTime) 
                VALUES
                    (
                        ?, 0, ?, ?, TRUE, CURRENT_TIMESTAMP
                    )
                `
            mysql.query(sql, [pkBuilding, maxStorableActions, idPassiveLevel], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`unLockPassive END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    // get item's name+image+quantity from address and idItem
    static async getItemInstanceData(address, idItem) {
        logger.debug(`getItemInstanceData START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    i_ins.idItemInstance, i_ins.quantity,
                    i.name, i.image 
                FROM
                    item_instance AS i_ins 
                    JOIN
                        item AS i 
                        ON i.idItem = i_ins.idItem 
                WHERE
                    i_ins.address = ? 
                    AND i_ins.idItem = ?
                `
            mysql.query(sql, [address, idItem], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getItemInstanceData END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }

    // get item's name and image from idItem
    static async getItemData(idItem) {
        logger.debug(`getItemData START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    name, image 
                FROM
                    item 
                WHERE
                    idItem = ?
                `
            mysql.query(sql, [idItem], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getItemData END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }

    // update the burnt actions at passive table
    static async calculateBurntActions(idPassive, burntActions) {
        logger.debug(`calculateBurntActions START`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    passive 
                SET
                    burntActions = ? 
                WHERE
                    idPassive = ?
            `
            mysql.query(sql, [burntActions, idPassive], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`calculateBurntActions END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    // update the passive by calculating during time since lastPassiveTime
    static async calculateStoredActions(idPassive, storedActions, lastPassiveTime) {
        logger.debug(`calculateStoredActions START`);
        return new Promise((resolve, reject) => {
            let sql = lastPassiveTime == null ? `
                UPDATE
                    passive 
                SET
                    storedActions = ? 
                WHERE
                    idPassive = ?
            ` : `
                UPDATE
                    passive 
                SET
                    storedActions = ?,
                    lastPassiveTime = ? 
                WHERE
                    idPassive = ?
                `
            mysql.query(sql, lastPassiveTime == null ? [storedActions, idPassive] : [storedActions, lastPassiveTime, idPassive], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`calculateStoredActions END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    // update maxStorableActions based on building level
    static async updateMaxStorableActions(pkBuilding, maxStorableActions) {
        logger.debug(`updateMaxStorableActions START`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    passive 
                SET
                    maxStorableActions = ? 
                WHERE
                    pkBuilding = ?
                `
            mysql.query(sql, [maxStorableActions, pkBuilding], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`updateMaxStorableActions END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    // update lastPassiveTime at passive table
    static async updateLastPassiveTime(idPassive) {
        logger.debug(`updateLastPassiveTime START`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    passive 
                SET
                    lastPassiveTime = CURRENT_TIMESTAMP 
                WHERE
                    idPassive = ?
                `
            mysql.query(sql, [idPassive], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`updateLastPassiveTime END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    // set idPassiveLevel at passive table
    static async setIdPassiveLevelAtPassive(idPassive, idPassiveLevel) {
        logger.debug(`setIdPassiveLevelAtPassive START`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    passive 
                SET
                    idPassiveLevel = ? 
                WHERE
                    idPassive = ?
                `
            mysql.query(sql, [idPassiveLevel, idPassive], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`setIdPassiveLevelAtPassive END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    // get equipped rod durability from pkBuilding
    static async getEquippedRodDurabilityFromPkBuilding(pkBuilding) {
        logger.debug(`getEquippedRodDurabilityFromPkBuilding START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    t_ins.durability 
                FROM
                    buildings AS bud 
                    LEFT JOIN
                        tool_instance AS t_ins 
                        ON t_ins.idToolInstance = bud.idToolInstance 
                WHERE
                    bud.id = ?
                `
            mysql.query(sql, [pkBuilding], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getEquippedRodDurabilityFromPkBuilding END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].durability)
                }
            })
        })
    }

    // get whole passive data from pkBuilding
    static async getPassiveDataFromPkBuilding(pkBuilding) {
        logger.debug(`getPassiveDataFromPkBuilding START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    pas.*,
                    p_lev.level AS passiveLevel, p_lev.fishingCoolDown, p_lev.isUpgradable 
                FROM
                    passive AS pas 
                    JOIN
                        passive_level AS p_lev 
                        ON p_lev.idPassiveLevel = pas.idPassiveLevel 
                WHERE
                    pas.pkBuilding = ?
                `
            mysql.query(sql, [pkBuilding], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getPassiveDataFromPkBuilding END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }

    // get Fisherman's Hut pkBuilding from the address
    static async getFishermanPkBuildingFromAddress(address) {
        logger.debug(`getFishermanPkBuildingFromAddress START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    id 
                FROM
                    buildings 
                WHERE
                    address = ? 
                    AND type = 4 
                    AND stake = 1
                `
            mysql.query(sql, [address], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getFishermanPkBuildingFromAddress END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }

    // set isPassive at passive table
    static async setIsPassiveAtPassive(idPassive, isPassive) {
        logger.debug(`setIsPassiveAtPassive START`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    passive 
                SET
                    isPassive = ?,
                    lastPassiveTime = CURRENT_TIMESTAMP 
                WHERE
                    idPassive = ?
                `
            mysql.query(sql, [isPassive, idPassive], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`setIsPassiveAtPassive END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    // update buildings table with idPassive
    static async setIdPassiveAtBuilding(pkBuilding, idPassive) {
        logger.debug(`setIdPassiveAtBuilding START`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    buildings 
                SET
                    idPassive = ? 
                WHERE
                    id = ?
                `
            mysql.query(sql, [idPassive, pkBuilding], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`setIdPassiveAtBuilding END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    // requirements to upgrade to level ?
    static async getUpgradeRequirements(address, level) {
        logger.debug(`getUpgradeRequirements START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    p_up_req.idResourceRequirement, p_up_req.idItemRequirement,
                    IF(res_req.ancien IS NULL, 0, res_req.ancien) AS requiredAncien,
                    IF(res_req.wood IS NULL, 0, res_req.wood) AS requiredWood,
                    IF(res_req.stone IS NULL, 0, res_req.stone) AS requiredStone,
                    IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
                    i_ins.idItemInstance, i.name AS requiredItemName, i.image AS requiredItemImage,
                    IF(IF(res_req.ancien IS NULL, 0, res_req.ancien) > u.ancien, FALSE, TRUE) AS isAncienAllowed,
                    IF(IF(res_req.wood IS NULL, 0, res_req.wood) > u.wood, FALSE, TRUE) AS isWoodAllowed,
                    IF(IF(res_req.stone IS NULL, 0, res_req.stone) > u.stone, FALSE, TRUE) AS isStoneAllowed,
                    IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed 
                FROM
                    passive_level AS p_lev 
                    JOIN
                        utente AS u 
                        ON u.address = ? 
                    LEFT JOIN
                        passive_upgrade_requirements AS p_up_req 
                        ON p_up_req.idPassiveLevel = p_lev.idPassiveLevel 
                    LEFT JOIN
                        resource_requirements AS res_req 
                        ON res_req.idResourceRequirement = p_up_req.idResourceRequirement 
                    LEFT JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = p_up_req.idItemRequirement 
                    LEFT JOIN
                        item_instance AS i_ins 
                        ON i_ins.address = ? 
                        AND i_ins.idItem = i_req.idItem 
                    LEFT JOIN
                        item AS i 
                        ON i.idItem = i_req.idItem 
                WHERE
                    p_lev.level = ?
                `
            mysql.query(sql, [address, address, level], (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getUpgradeRequirements END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
}

module.exports = {PassiveQueries};