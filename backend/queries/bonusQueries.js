const mysql = require('../config/databaseConfig');
const logger = require('../logging/logger');
const { Utils } = require("../utils/utils");

class BonusQueries {
    static async getToolInfoByIdToolInstance(idToolInstance) {
        logger.debug("getToolInfoByIdToolInstance start");
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    tool_instance.idToolInstance,
                    tool.name AS toolName,
                    tool.description AS toolDesc,
                    tool.image AS toolImage,
                    tool.type AS toolType,
                    tool_level.level AS toolLevel,
                    bonus.idBonus,
                    bonus_code.name AS bonusName,
                    bonus_code.description AS bonusDesc,
                    bonus.tier AS bonusTier,
                    bonus.percentageBoost,
                    bonus.flatBoost,
                    bonus_code.type AS bonusType,
                    bonus_code.idBonusCode
                    
                FROM tool_instance 
                    JOIN tool_level ON tool_instance.idToolLevel = tool_level.idToolLevel
                    JOIN tool ON tool_instance.idTool = tool.idTool
                    LEFT JOIN bonus_instance ON tool_instance.idToolInstance = bonus_instance.idToolInstance
                    LEFT JOIN bonus ON bonus_instance.idBonus = bonus.idBonus
                    LEFT JOIN bonus_code ON bonus.idBonusCode = bonus_code.idBonusCode

                WHERE
                tool_instance.idToolInstance = ?

                ORDER BY bonus_code.type
            `
            mysql.query(sql, [idToolInstance], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug("getToolInfoByIdToolInstance end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async getToolInfoAndBonus(address) {
        logger.debug("getToolInfoAndBonus start");
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    tool_instance.idToolInstance,
                    tool.name AS toolName,
                    tool.description AS toolDesc,
                    tool.image AS toolImage,
                    tool.type AS toolType,
                    tool_level.level AS toolLevel,
                    bonus.idBonus,
                    bonus_code.name AS bonusName,
                    bonus_code.description AS bonusDesc,
                    bonus.tier AS bonusTier,
                    bonus.percentageBoost,
                    bonus.flatBoost,
                    bonus_code.type AS bonusType,
                    bonus_code.idBonusCode
                    
                FROM tool_instance 
                    JOIN tool_level ON tool_instance.idToolLevel = tool_level.idToolLevel
                    JOIN tool ON tool_instance.idTool = tool.idTool
                    LEFT JOIN bonus_instance ON tool_instance.idToolInstance = bonus_instance.idToolInstance
                    LEFT JOIN bonus ON bonus_instance.idBonus = bonus.idBonus
                    LEFT JOIN bonus_code ON bonus.idBonusCode = bonus_code.idBonusCode

                WHERE
                tool_instance.address = ?

                ORDER BY bonus_code.type
            `
            mysql.query(sql, [address], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug("getToolInfoAndBonus end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getToolBonusGivenIdToolInstance(address, idToolInstance) {
        logger.debug("getToolBonusGivenIdToolInstance start");
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    bonus_instance.idBonusInstance, 
                    tool_instance.idToolInstance,
                    bonus.idBonus,
                    bonus_code.name AS bonusName,
                    bonus_code.description AS bonusDesc,
                    bonus.tier AS bonusTier,
                    bonus.percentageBoost,
                    bonus.flatBoost,
                    bonus.idBonusCode,
                    bonus_code.type AS bonusType
                    
                FROM tool_instance 
                    LEFT JOIN bonus_instance ON tool_instance.idToolInstance = bonus_instance.idToolInstance
                    LEFT JOIN bonus ON bonus_instance.idBonus = bonus.idBonus
                    LEFT JOIN bonus_code ON bonus.idBonusCode = bonus_code.idBonusCode

                WHERE
                tool_instance.address = ?
                AND tool_instance.idToolInstance = ?

                ORDER BY bonus_code.type
            `
            mysql.query(sql, [address, idToolInstance], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug("getToolBonusGivenIdToolInstance end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getIdToolInstances(address) {
        logger.debug("getIdToolInstances start");
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT idToolInstance
                FROM tool_instance 
                WHERE tool_instance.address = ?
            `
            mysql.query(sql, [address], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug("getIdToolInstances end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async checkToolGetTypeAndBonuses(address, idToolInstance) {
        logger.debug("checkToolGetTypeAndBonuses start");
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT 
                    tool_instance.idTool,
                    tool.name,
                    tool.description,
                    tool.image,
                    tool.type as toolType,
                    bonus_instance.idBonusInstance,
                    bonus_instance.idBonus,
                    bonus_instance.type,
                    bonus.idBonusCode,
                    bonus_code.name as bonusName,
                    bonus_code.description as bonusDesc,
                    bonus_code.idItem
                FROM
                    tool_instance 
                    JOIN tool ON tool_instance.idTool = tool.idTool
                    LEFT JOIN bonus_instance ON tool_instance.idToolInstance = bonus_instance.idToolInstance
                    LEFT JOIN bonus ON bonus_instance.idBonus = bonus.idBonus
                    LEFT JOIN bonus_code ON bonus.idBonusCode = bonus_code.idBonusCode
                WHERE
                    tool_instance.address = ? AND tool_instance.idToolInstance = ?
                ORDER BY bonus_code.type  
            `
            mysql.query(sql, [address, idToolInstance], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug("checkToolGetTypeAndBonuses end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getBonusConsumables(address) {
        logger.debug("getBonusConsumables start");
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    item.idItem,
                    item_instance.quantity,
                    item.name,
                    item.description,
                    item.image,
                    item_consumable_bonus.type,
                    item_consumable_bonus.effectOn,
                    item_consumable_bonus.idItemConsumableBonus
                FROM
                    item
                    JOIN item_instance ON item.idItem = item_instance.idItem
                    JOIN item_consumable ON item.idItem = item_consumable.idItem
                    JOIN item_consumable_bonus ON item_consumable.idItemConsumable = item_consumable_bonus.idItemConsumable
                WHERE
                    item_instance.address = ?
                    ORDER BY type
            `
            mysql.query(sql, [address], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug("getBonusConsumables end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getIdItemBonusGivenAddress(address, idItemConsumableBonus, type) {
        logger.debug("getIdItemBonusGivenAddress start");
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *, item_instance.quantity AS consumableQty
                FROM
                    item_instance
                    JOIN item_consumable ON item_instance.idItem = item_consumable.idItem
                    JOIN item_consumable_bonus ON item_consumable.idItemConsumable = item_consumable_bonus.idItemConsumable
                WHERE
                    item_instance.address = ?
                    AND item_consumable_bonus.idItemConsumableBonus = ?
                    AND item_instance.quantity > 0
                    AND item_consumable_bonus.type = ?
            `
            mysql.query(sql, [address, idItemConsumableBonus, type], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug("getIdItemBonusGivenAddress end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getBonusGivenIdBonusCode(idBonusCode, tier) {
        logger.debug("getBonusGivenIdBonusCode start");
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                        bonus_code.idBonusCode,
                        bonus_code.name,
                        bonus_code.type,
                        bonus.idBonus,
                        bonus_code.description,
                        bonus.chance,
                        bonus.percentageBoost,
                        bonus.flatBoost,
                        bonus.tier
                FROM
                    bonus
                    JOIN bonus_code ON bonus.idBonusCode = bonus_code.idBonusCode
                WHERE
                    bonus_code.idBonusCode = ? AND bonus.tier = ?
            `
            mysql.query(sql, [idBonusCode, tier], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug("getBonusGivenIdBonusCode end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getBonusesEnchantment(effect, type, check) {
        logger.debug("getBonusesEnchantment start");
        return new Promise((resolve, reject) => {
            let sql = `
                    SELECT
                        bonus_code.idBonusCode,
                        bonus_code.name,
                        bonus_code.type,
                        bonus.idBonus,
                        bonus_code.description,
                        bonus.chance,
                        bonus.percentageBoost,
                        bonus.flatBoost,
                        bonus.tier
                    FROM
                        bonus_code
                        JOIN bonus ON bonus.idBonusCode = bonus_code.idBonusCode
                    WHERE 
                        bonus_code.type = ? AND bonus_code.tool = ?
                        `, params = [effect, type]
            if (check[0].idBonusCode != null) {
                for (let i = 0; i < check.length; i++) {
                    sql += 'AND (NOT bonus.idBonus = ?)'
                    params.push(check[i].idBonus)
                }
            }
            mysql.query(sql, params, (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug("getBonusesEnchantment end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateBonusInstance(idBonusInstance, idBonus) {
        logger.debug("updateBonusInstance start");
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE bonus_instance
            SET idBonus = ?
            WHERE idBonusInstance = ?
            `
            mysql.query(sql, [idBonus, idBonusInstance], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug("updateBonusInstance end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async addBonusInstance(idToolInstance, idBonus, type) {
        logger.debug("addBonusInstance start");
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO
                    bonus_instance (idToolInstance, idBonus, type) 
                VALUES
                    (?, ?, ?)
            `
            mysql.query(sql, [idToolInstance, idBonus, type], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug("addBonusInstance end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

}

module.exports = { BonusQueries };