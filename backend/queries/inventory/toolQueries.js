const mysql = require('../../config/databaseConfig');
const logger = require('../../logging/logger');
// const { UserQuires } = require('../userQueries');
const { Utils } = require("../../utils/utils");

class ToolQueries {
    constructor() { }

    static async getToolBonuses(toolIds) {
        logger.debug(`getToolBonuses start`)
        return new Promise((resolve, reject) => {
            let sql = `
                select
                    *
                from
                    bonus_instance bi
                join bonus b on
                    b.idBonus = bi.idBonus
                join bonus_code bc on
                    bc.idBonusCode = b.idBonusCode
                where
                    bi.idToolInstance in (${toolIds})
                order by
                    bi.idToolInstance
                `

            mysql.query(sql, [], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getToolBonuses end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getMenuByIdToolInstance(idToolInstance) {
        logger.debug(`getMenuByIdToolInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    m.craft, m.view, m.send, m.sell 
                FROM
                    tool_instance AS t_ins 
                    JOIN
                        tool AS t 
                        ON t.idTool = t_ins.idTool 
                    JOIN
                        menu AS m 
                        ON m.idMenu = t.idMenu 
                WHERE
                    t_ins.idToolInstance = ?
                `

            mysql.query(sql, idToolInstance, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getMenuByIdToolInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }

    static async checkPropertyToUpgrade(idToolInstance, address) {
        logger.info(`checkPropertyToUpgrade start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    t_ins.idTool, t_ins.equipped,
                    t_lev.durabilityTotal, t_lev.chanceUpgrade, t_lev.level, t_lev.isUpgradable,
                    t_lev.level - 1 AS prevLevel,
                    t_lev.level + 1 AS nextLevel 
                FROM
                    tool_instance AS t_ins 
                    JOIN
                        tool_level AS t_lev 
                        ON t_lev.idToolLevel = t_ins.idToolLevel 
                WHERE
                    t_ins.idToolInstance = ? 
                    AND t_ins.address = ?
                `

            mysql.query(sql, [idToolInstance, address], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`checkPropertyToUpgrade end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getToolLevelByIdToolAndLevel(idTool, level) {
        logger.info(`getToolLevelByIdToolAndLevel start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idToolLevel,
                    durabilityTotal  
                FROM
                    tool_level 
                WHERE
                    idTool = ? 
                    AND level = ?
                `
            mysql.query(sql, [idTool, level], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`getToolLevelByIdToolAndLevel end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async checkRequirementsToUpgradeByAddressAndIdToolLevel(address, idToolLevel, consumableIds) {
        logger.info(`checkRequirementsToUpgradeByAddressAndIdToolLevel start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
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
                    i_ins.quantity AS itemBefore, i_ins.idItem AS idItemReq,
                    false AS isConsumable
                FROM
                    upgrade_requirements AS up_req 
                    JOIN
                        utente AS u 
                        ON u.address = ? 
                    LEFT JOIN
                        resource_requirements AS res_req 
                        ON res_req.idResourceRequirement = up_req.idResourceRequirement 
                    LEFT JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = up_req.idItemRequirement 
                    LEFT JOIN
                        item_instance AS i_ins 
                        ON i_ins.address = ? 
                        AND i_ins.idItem = i_req.idItem 
                WHERE
                    up_req.idToolLevel = ?
                `, params = [address, address, idToolLevel]
            if (consumableIds[0] != null) {
                sql += `
                    UNION
                    SELECT
                        0 AS requiredAncien, 0 AS requiredWood, 0 AS requiredStone,
                        i_con.quantity AS requiredItemQuantity,
                        i_ins.idItemInstance,
                        TRUE AS isAncienAllowed, TRUE AS isWoodAllowed, TRUE AS isStoneAllowed,
                        IF(IF(i_con.quantity IS NULL, 0, i_con.quantity) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
                        0 AS ancienBefore, 0 AS woodBefore, 0 AS stoneBefore,
                        i_ins.quantity AS itemBefore, i_ins.idItem AS idItemReq,
                        true AS isConsumable
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
                params.push(address, consumableIds[0])
            }
            if (consumableIds[1] != null) {
                sql += `
                    UNION
                    SELECT
                        0 AS requiredAncien, 0 AS requiredWood, 0 AS requiredStone,
                        i_con.quantity AS requiredItemQuantity,
                        i_ins.idItemInstance,
                        TRUE AS isAncienAllowed, TRUE AS isWoodAllowed, TRUE AS isStoneAllowed,
                        IF(IF(i_con.quantity IS NULL, 0, i_con.quantity) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
                        0 AS ancienBefore, 0 AS woodBefore, 0 AS stoneBefore,
                        i_ins.quantity AS itemBefore, i_ins.idItem AS idItemReq,
                        true AS isConsumable
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
                params.push(address, consumableIds[1])
            }

            mysql.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`checkRequirementsToUpgradeByAddressAndIdToolLevel end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async upgradeToolByIdToolInstance(idToolInstance, idToolLevel, durabilityTotal, durability) {
        logger.info(`upgradeToolByIdToolInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    tool_instance 
                SET
                    idToolLevel = ?, durability = IF (durability + ? - ? > ?, ?, durability + ? - ?) 
                WHERE
                    idToolInstance = ?
                `

            mysql.query(sql, [idToolLevel, durabilityTotal, durability, durabilityTotal, durabilityTotal, durabilityTotal, durability, idToolInstance], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`upgradeToolByIdToolInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async downgradeToolByIdToolInstance(idToolInstance, idToolLevel, downDurabilityTotal) {
        logger.info(`downgradeToolByIdToolInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    tool_instance 
                SET
                    idToolLevel = ?, durability = IF(durability > ?, ?, durability) 
                WHERE
                    idToolInstance = ?
                `

            mysql.query(sql, [idToolLevel, downDurabilityTotal, downDurabilityTotal, idToolInstance], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`downgradeToolByIdToolInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getToolsWithMenuByAddress(address) { //cambiare nome
        logger.info(`getToolsWithMenuByAddress start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM tool_instance AS t_in
            JOIN tool AS t ON t_in.idTool = t.idTool
            JOIN tool_level as t_l ON t_l.idToolLevel = t_in.idToolLevel 
            JOIN menu AS m ON m.idMenu = t.idMenu
            WHERE address = ?`;

            mysql.query(sql, address, (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getToolsWithMenuByAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getToolsWithUpgradeByAddress(address) { //cambiare nome
        logger.info(`getToolsWithUpgradeByAddress start`);
        return new Promise((resolve, reject) => {
            /* let sql = `
            SELECT item_instance.id as instanceId, item_instance.quantity as instanceQuantity, 
            item_instance.address as address, item.*, menu.*
            
            FROM item_instance INNER JOIN item ON item_instance.idItem = item.id JOIN menu ON item.idMenu = menu.id
            WHERE item_instance.address =  ?`; */
            let sql = `
            SELECT t_in.idToolInstance AS idToolInstance, t_in.idTool AS idTool, t.name, t.description, t.image,
            up_res_req.ancien AS requiredAncien, up_res_req.wood AS requiredWood, up_res_req.stone AS requiredStone,
            up_i_req.quantityItem AS requiredItemQuantity,
            i.idItem AS requiredItemId, i.name AS requiredItemName, i.description as requiredItemDescription, i.image as requiredItemImage,
            u.ancien as ownAncien, u.wood as ownWood, u.stone as ownStone,
            
            IF(IF(up_res_req.ancien IS NULL, 0, up_res_req.ancien) <= u.ancien , TRUE, FALSE) as isAncienAllowed,
            IF(IF(up_res_req.wood IS NULL, 0, up_res_req.wood) <= u.wood , TRUE, FALSE) as isWoodAllowed,
            IF(IF(up_res_req.stone IS NULL, 0, up_res_req.stone) <= u.stone, TRUE, FALSE) as isStoneAllowed,
            IF(i_in.quantity IS NULL, 0, i_in.quantity) as ownItemQuantity,
            IF(IF(i_in.quantity IS NULL, 0, i_in.quantity) >=  IF(up_i_req.quantityItem IS NULL, 0, up_i_req.quantityItem), TRUE, FALSE) as isItemAllowed
            
            FROM tool_instance AS t_in
            JOIN tool AS t ON t.idTool = t_in.idTool
            
            JOIN upgrade_requirements AS up_req ON up_req.idToolLevel = (SELECT idToolLevel as newIdLevel
                                    FROM tool_level as tl 
                                    WHERE tl.idTool = t_in.idTool 
                                    AND level = (SELECT level FROM tool_level tl2 WHERE tl2.idToolLevel = t_in.idToolLevel) + 1)

            LEFT JOIN resource_requirements AS up_res_req ON up_res_req.idResourceRequirement = up_req.idResourceRequirement
            LEFT JOIN item_requirements AS up_i_req ON up_i_req.idItemRequirement = up_req.idItemRequirement
            
            LEFT JOIN item AS i ON i.idItem = up_req.idItemRequirement
            
            JOIN utente AS u ON u.address = ?
            LEFT join item_instance AS i_in ON i_in.address = ? AND i_in.idItem = up_i_req.idItem 
            
            WHERE t_in.address = ?`;

            /* 
            SELECT a.idItemInstance AS instanceId, a.address AS address, a.quantity AS instanceQuantity, 
             b.*, c.*
            
            FROM item_instance AS a INNER JOIN item AS b ON b.idItem = a.idItem JOIN menu AS c ON c.idMenu = b.idMenu
            WHERE a.address =  '0x3B2d8361c50197908D8A6135e83086335A8fd12B'
            */
            mysql.query(sql, [address, address, address], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getToolsWithUpgradeByAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getToolsWithRepairByAddress(address) { //cambiare nome
        logger.info(`getToolsWithRepairByAddress start`);
        return new Promise((resolve, reject) => {
            /* let sql = `
            SELECT item_instance.id as instanceId, item_instance.quantity as instanceQuantity, 
            item_instance.address as address, item.*, menu.*
            
            FROM item_instance INNER JOIN item ON item_instance.idItem = item.id JOIN menu ON item.idMenu = menu.id
            WHERE item_instance.address =  ?`; */
            let sql = `
            SELECT t_in.idToolInstance AS idToolInstance, t_in.idTool AS idTool, t.name, t.description, t.image,
            up_res_req.ancien AS requiredAncien, up_res_req.wood AS requiredWood, up_res_req.stone AS requiredStone,
            up_i_req.quantityItem AS requiredItemQuantity,
            i.idItem AS requiredItemId, i.name AS requiredItemName, i.description as requiredItemDescription, i.image as requiredItemImage,
            u.ancien as ownAncien, u.wood as ownWood, u.stone as ownStone,

            IF(IF(up_res_req.ancien IS NULL, 0, up_res_req.ancien) <= u.ancien , TRUE, FALSE) as isAncienAllowed,
            IF(IF(up_res_req.wood IS NULL, 0, up_res_req.wood) <= u.wood , TRUE, FALSE) as isWoodAllowed,
            IF(IF(up_res_req.stone IS NULL, 0, up_res_req.stone) <= u.stone, TRUE, FALSE) as isStoneAllowed,
            IF(i_in.quantity IS NULL, 0, i_in.quantity) as ownItemQuantity,
            IF(IF(i_in.quantity IS NULL, 0, i_in.quantity) >=  IF(up_i_req.quantityItem IS NULL, 0, up_i_req.quantityItem), TRUE, FALSE) as isItemAllowed

            FROM tool_instance AS t_in
            JOIN tool AS t ON t.idTool = t_in.idTool

            JOIN repair_requirements AS up_req ON up_req.idToolLevel = t_in.idToolLevel
            LEFT JOIN resource_requirements AS up_res_req ON up_res_req.idResourceRequirement = up_req.idResourceRequirement
            LEFT JOIN item_requirements AS up_i_req ON up_i_req.idItemRequirement = up_req.idItemRequirement

            LEFT JOIN item AS i ON i.idItem = up_req.idItemRequirement

            JOIN utente AS u ON u.address = ?
            LEFT join item_instance AS i_in ON i_in.address = ? AND i_in.idItem = up_i_req.idItem 

            WHERE t_in.address = ?`;

            /* 
            SELECT a.idItemInstance AS instanceId, a.address AS address, a.quantity AS instanceQuantity, 
             b.*, c.*
            
            FROM item_instance AS a INNER JOIN item AS b ON b.idItem = a.idItem JOIN menu AS c ON c.idMenu = b.idMenu
            WHERE a.address =  '0x3B2d8361c50197908D8A6135e83086335A8fd12B'
            */
            mysql.query(sql, [address, address, address], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getToolsWithRepairByAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getToolsConsumablesAddress(address) { //cambiare nome
        logger.info(`getToolsConsumablesAddress start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT i_in.idItemInstance AS idItemInstance,
            i_in.quantity,
            i.name,
            i.description,
            i.image,
            ict.repair, ict.upgrade,
            t_in.idTool as idTool,
            t_in.idToolInstance as idToolInstance
            FROM tool_instance AS t_in
            JOIN item_consumable_tool AS ict ON ict.idToolLevel = (SELECT idToolLevel as newIdLevel
                                    FROM tool_level as tl 
                                    WHERE tl.idTool = t_in.idTool 
                                    AND level = (SELECT level FROM tool_level tl2 WHERE tl2.idToolLevel = t_in.idToolLevel) + 1) 

            JOIN item_instance AS i_in ON i_in.address = ? AND i_in.idItem = ict.idItem
            JOIN item as i on i.idItem = i_in.idItem
            WHERE t_in.address = ?`;

            mysql.query(sql, [address, address], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getToolsConsumablesAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async repairToolByIdToolInstance(idToolInstance, durabilityTotal) {
        logger.info(`repairToolByIdToolInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE
                tool_instance 
            SET
                durability = ?
            WHERE
                idToolInstance = ?
            `

            mysql.query(sql, [durabilityTotal, idToolInstance], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`repairToolByIdToolInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async checkRequirementsToRepairByAddressAndIdToolInstanceAndConsumableIds(address, idToolInstance, consumableIds) {
        logger.info(`checkRequirementsToRepairByAddressAndIdToolInstanceAndConsumableIds start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    t_lev.durabilityTotal,
                    IF(t_ins.durability < t_lev.durabilityTotal, TRUE, FALSE) AS isRepairable,
                    t.isRepairable as isRepairAllowed,
                    IF(res_req.ancien IS NULL, 0, res_req.ancien) AS requiredAncien,
                    IF(res_req.wood IS NULL, 0, res_req.wood) AS requiredWood,
                    IF(res_req.stone IS NULL, 0, res_req.stone) AS requiredStone,
                    IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
                    i_ins.idItemInstance,
                    IF(IF(res_req.ancien IS NULL, 0, res_req.ancien) > u.ancien, FALSE, TRUE) AS isAncienAllowed,
                    IF(IF(res_req.wood IS NULL, 0, res_req.wood) > u.wood, FALSE, TRUE) AS isWoodAllowed,
                    IF(IF(res_req.stone IS NULL, 0, res_req.stone) > u.stone, FALSE, TRUE) AS isStoneAllowed,
                    IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed 
                FROM
                    tool_instance AS t_ins 
                    JOIN
                        utente AS u 
                        ON u.address = ? 
                    JOIN
                        tool_level AS t_lev 
                        ON t_lev.idToolLevel = t_ins.idToolLevel 
                    JOIN
                        tool AS t 
                        ON t.idTool = t_ins.idTool 
                    LEFT JOIN
                        repair_requirements AS rep_req 
                        ON rep_req.idToolLevel = t_ins.idToolLevel 
                    LEFT JOIN
                        resource_requirements AS res_req 
                        ON res_req.idResourceRequirement = rep_req.idResourceRequirement 
                    LEFT JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = rep_req.idItemRequirement 
                    LEFT JOIN
                        item_instance AS i_ins 
                        ON i_ins.address = ? 
                        AND i_ins.idItem = i_req.idItem 
                WHERE
                    t_ins.idToolInstance = ?
                    AND t_ins.address = ?
                `;
            mysql.query(sql, [address, address, idToolInstance, address], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`checkRequirementsToRepairByAddressAndIdToolInstanceAndConsumableIds end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getBonuses(idToolInstance) {
        logger.debug(`getBonuses START`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
            * 
            FROM
  			bonus_instance bi left join bonus b on bi.idBonus = b.idBonus 
  			left join bonus_code bc on b.idBonusCode = bc.idBonusCode 
  			where idToolInstance = ?
                `
            mysql.query(sql, idToolInstance, (err, rows) => {
                if(err) return reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.debug(`getBonuses END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
}

module.exports = { ToolQueries }