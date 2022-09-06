const mysql = require('../config/databaseConfig');
const { add } = require('../logging/logger');
const logger = require('../logging/logger');
const { Utils } = require("../utils/utils");



class InventoryQueries {
    static async getToolQuantity(address, idToolLevel) {
        logger.info(`getToolQuantity start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idToolInstance
                FROM 
                    tool_instance
                WHERE
                    address = ?
                AND
                    idToolLevel = ?
            `;

            mysql.query(sql, [address, idToolLevel], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getToolQuantity end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async getItemQuantity(address, idItem) {
        logger.info(`getItemQuantity start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
                idItemInstance,
                quantity
            FROM 
                item_instance
            WHERE
                address = ?
            AND
                idItem = ?
            `;

            mysql.query(sql, [address, idItem], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getItemQuantity end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async getRecipeQuantity(address, idRecipe) {
        logger.info(`getRecipeQuantity start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
                idRecipeInstance,
                quantity
            FROM 
                recipe_instance
            WHERE
                address = ?
            AND
                idRecipe = ?
            `;

            mysql.query(sql, [address, idRecipe], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getRecipeQuantity end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async getRecipeRequirements(address, idRecipeInstance) {
        logger.info(`InventoryQueries.getRecipeRequirements START`)
        let sql, params
        sql = `
            SELECT
                rec_ins.quantity AS recipeCount,
                rec.chanceCraft, rec.idTool, rec.idItem, rec.itemQuantity,
                c_req.idResourceRequirement,
                c_req.idItemRequirement,
                c_req.idToolRequirement,
                c_req.idRecipeRequirement,
                res_req.ancien AS requiredAncien,
                res_req.wood AS requiredWood,
                res_req.stone AS requiredStone,
                i_req.idItem AS requiredIdItem,
                i_req.quantityItem AS requiredItemQuantity,
                i_req.burn AS requiredItemBurn,
                t_req.idToolLevel AS requiredIdToolLevel,
                t_req.burn AS requiredToolBurn,
                rec_req.idRecipe AS requiredIdRecipe,
                rec_req.quantity AS requiredRecipeQuantity,
                rec_req.burn AS requiredRecipeBurn
            FROM recipe_instance AS rec_ins
                JOIN recipe AS rec
                    ON rec.idRecipe = rec_ins.idRecipe
                LEFT JOIN craft_requirements AS c_req
                    ON c_req.idRecipe = rec.idRecipe
                LEFT JOIN resource_requirements AS res_req
                    ON res_req.idResourceRequirement = c_req.idResourceRequirement
                LEFT JOIN item_requirements AS i_req
                    ON i_req.idItemRequirement = c_req.idItemRequirement
                LEFT JOIN tool_requirements AS t_req
                    ON t_req.idToolRequirement = c_req.idToolRequirement
                LEFT JOIN recipe_requirements AS rec_req
                    ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement
            WHERE
                rec_ins.idRecipeInstance = ?
                AND rec_ins.address = ?
        `;
        params = [idRecipeInstance, address];
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getRecipeRequirements END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getRecipeRequirementsByIdRecipe(idRecipe) {
        logger.info(`InventoryQueries.getRecipeRequirementsByIdRecipe START`)
        let sql, params
        sql = `
            SELECT
                rec.chanceCraft, rec.idTool, rec.idItem, rec.itemQuantity,
                c_req.idResourceRequirement,
                c_req.idItemRequirement,
                c_req.idToolRequirement,
                c_req.idRecipeRequirement,
                res_req.ancien AS requiredAncien,
                res_req.wood AS requiredWood,
                res_req.stone AS requiredStone,
                i_req.idItem AS requiredIdItem,
                i_req.quantityItem AS requiredItemQuantity,
                i_req.burn AS requiredItemBurn,
                t_req.idToolLevel AS requiredIdToolLevel,
                t_req.burn AS requiredToolBurn,
                rec_req.idRecipe AS requiredIdRecipe,
                rec_req.quantity AS requiredRecipeQuantity,
                rec_req.burn AS requiredRecipeBurn
            FROM recipe AS rec
                LEFT JOIN craft_requirements AS c_req
                    ON c_req.idRecipe = rec.idRecipe
                LEFT JOIN resource_requirements AS res_req
                    ON res_req.idResourceRequirement = c_req.idResourceRequirement
                LEFT JOIN item_requirements AS i_req
                    ON i_req.idItemRequirement = c_req.idItemRequirement
                LEFT JOIN tool_requirements AS t_req
                    ON t_req.idToolRequirement = c_req.idToolRequirement
                LEFT JOIN recipe_requirements AS rec_req
                    ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement
            WHERE
                rec.idRecipe = ?
        `;
        params = [idRecipe];
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getRecipeRequirementsByIdRecipe END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getNPCRecipeRequirements(idRecipe) {
        logger.info(`InventoryQueries.getNPCRecipeRequirements START`)
        let sql, params
        sql = `
            SELECT
                rec.chanceCraft, rec.idTool, rec.idItem, rec.itemQuantity,
                c_req.idResourceRequirement,
                c_req.idItemRequirement,
                c_req.idToolRequirement,
                c_req.idRecipeRequirement,
                res_req.ancien AS requiredAncien,
                res_req.wood AS requiredWood,
                res_req.stone AS requiredStone,
                i_req.idItem AS requiredIdItem,
                i_req.quantityItem AS requiredItemQuantity,
                i_req.burn AS requiredItemBurn,
                t_req.idToolLevel AS requiredIdToolLevel,
                t_req.burn AS requiredToolBurn,
                rec_req.idRecipe AS requiredIdRecipe,
                rec_req.quantity AS requiredRecipeQuantity,
                rec_req.burn AS requiredRecipeBurn
            FROM recipe AS rec
                LEFT JOIN craft_requirements AS c_req
                    ON c_req.idRecipe = rec.idRecipe
                LEFT JOIN resource_requirements AS res_req
                    ON res_req.idResourceRequirement = c_req.idResourceRequirement
                LEFT JOIN item_requirements AS i_req
                    ON i_req.idItemRequirement = c_req.idItemRequirement
                LEFT JOIN tool_requirements AS t_req
                    ON t_req.idToolRequirement = c_req.idToolRequirement
                LEFT JOIN recipe_requirements AS rec_req
                    ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement
            WHERE
                rec.idRecipe = ?
        `;
        params = [idRecipe];
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getNPCRecipeRequirements END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getGemRecipeRequirements(idRecipe) {
        logger.info(`InventoryQueries.getGemRecipeRequirements START`)
        let sql, params
        sql = `
            SELECT
                rec.chanceCraft, rec.idTool, rec.idItem, rec.itemQuantity,
                c_req.idResourceRequirement,
                c_req.idItemRequirement,
                c_req.idToolRequirement,
                c_req.idRecipeRequirement,
                res_req.ancien AS requiredAncien,
                res_req.wood AS requiredWood,
                res_req.stone AS requiredStone,
                i_req.idItem AS requiredIdItem,
                i_req.quantityItem AS requiredItemQuantity,
                i_req.burn AS requiredItemBurn,
                t_req.idToolLevel AS requiredIdToolLevel,
                t_req.burn AS requiredToolBurn,
                rec_req.idRecipe AS requiredIdRecipe,
                rec_req.quantity AS requiredRecipeQuantity,
                rec_req.burn AS requiredRecipeBurn
            FROM recipe AS rec
                LEFT JOIN craft_requirements AS c_req
                    ON c_req.idRecipe = rec.idRecipe
                LEFT JOIN resource_requirements AS res_req
                    ON res_req.idResourceRequirement = c_req.idResourceRequirement
                LEFT JOIN item_requirements AS i_req
                    ON i_req.idItemRequirement = c_req.idItemRequirement
                LEFT JOIN tool_requirements AS t_req
                    ON t_req.idToolRequirement = c_req.idToolRequirement
                LEFT JOIN recipe_requirements AS rec_req
                    ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement
            WHERE
                rec.idRecipe = ?
        `;
        params = [idRecipe];
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getGemRecipeRequirements END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getSingleInventoryData(address, idInventory, inventoryType) {
        logger.info(`InventoryQueries.getSingleInventoryData START`)
        let sql, params
        if (inventoryType == 'item') {
            sql = `
                SELECT
                    0 as durability, 0 as level, i.rarity,
                    i_ins.idItemInstance AS id, IF(c.idChest IS NULL, FALSE, TRUE) AS isChest,
                    'item' AS type,
                    i_ins.quantity,
                    i.name, i.image,
                    m.craft, m.view, m.send, m.sell 
                FROM
                    item_instance AS i_ins 
                    JOIN
                        item AS i 
                        ON i.idItem = i_ins.idItem 
                    LEFT JOIN
                        chest AS c 
	                    ON c.idItem = i.idItem 
                    JOIN
                        menu AS m 
                        ON m.idMenu = i.idMenu 
                WHERE
                    i_ins.address = ?
                    AND
                    i_ins.quantity > 0
                    AND
                    i_ins.idItem = ?
                `
            params = [address, idInventory]
        } else if (inventoryType == 'recipe') {
            sql = `
                SELECT
                    0 as durability, 0 as level, rec.rarity,
                    rec_ins.idRecipeInstance AS id, FALSE AS isChest,
                    'recipe' AS type,
                    rec_ins.quantity,
                    rec.name, rec.image,
                    m.craft, m.view, m.send, m.sell 
                FROM
                    recipe_instance AS rec_ins 
                    JOIN
                        recipe AS rec 
                        ON rec.idRecipe = rec_ins.idRecipe 
                    JOIN
                        menu AS m 
                        ON m.idMenu = rec.idMenu 
                WHERE
                    rec_ins.address = ?
                    AND
                    rec_ins.quantity > 0
                    AND
                    rec_ins.idRecipe = ?
                `
            params = [address, idInventory]
        }
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getSingleInventoryData END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }
    static async getInventoryListFromAddress(address) {
        logger.info(`InventoryQueries.getInventoryListFromAddress START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    0 as durability, 0 as level, 0 as idToolLevel, i.rarity,
                    i_ins.idItemInstance AS id, IF(c.idChest IS NULL, FALSE, TRUE) AS isChest,
                    'item' AS type,
                    i_ins.quantity,
                    i.name, i.image,
                    m.craft, m.view, m.send, m.sell 
                FROM
                    item_instance AS i_ins 
                    JOIN
                        item AS i 
                        ON i.idItem = i_ins.idItem 
                    LEFT JOIN
                        chest AS c 
	                    ON c.idItem = i.idItem 
                    JOIN
                        menu AS m 
                        ON m.idMenu = i.idMenu 
                WHERE
                    i_ins.address = ?
                    AND
                    i_ins.quantity > 0
                UNION
                SELECT
                    t_ins.durability, t_lev.level, t_lev.idToolLevel, t.rarity,
                    t_ins.idToolInstance AS id, FALSE AS isChest,
                    'tool' AS type,
                    1 AS quantity,
                    t.name, t.image,
                    m.craft, m.view, m.send, m.sell 
                FROM
                    tool_instance AS t_ins 
                    JOIN
                        tool_level AS t_lev 
			            ON t_lev.idToolLevel = t_ins.idToolLevel 
                    JOIN
                        tool AS t 
                        ON t.idTool = t_ins.idTool 
                    JOIN
                        menu AS m 
                        ON m.idMenu = t.idMenu 
                WHERE
                    t_ins.address = ? 
                UNION
                SELECT
                    0 as durability, 0 as level, 0 as idToolLevel, rec.rarity,
                    rec_ins.idRecipeInstance AS id, FALSE AS isChest,
                    'recipe' AS type,
                    rec_ins.quantity,
                    rec.name, rec.image,
                    m.craft, m.view, m.send, m.sell 
                FROM
                    recipe_instance AS rec_ins 
                    JOIN
                        recipe AS rec 
                        ON rec.idRecipe = rec_ins.idRecipe 
                    JOIN
                        menu AS m 
                        ON m.idMenu = rec.idMenu 
                WHERE
                    rec_ins.address = ?
                    AND
                    rec_ins.quantity > 0
                `
            mysql.query(sql, [address, address, address], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getInventoryListFromAddress END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async addChestLoots(address,) {

    }
    static async getChestLoots(idItemInstance) {
        logger.info(`InventoryQueries.getChestLoots START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    i.idItem as id, 'item' as type, i.name, i.description, i.image, i.rarity,
                    c_l_i.dropProbability, c_l_i.maxQuantity, c_l_i.alpha, c_l_i.beta 
                FROM
                    item_instance AS i_ins 
                    JOIN
                        chest AS c 
                        ON c.idItem = i_ins.idItem 
                    JOIN
                        chest_loot_item AS c_l_i 
                        ON c_l_i.idChest = c.idChest 
                    JOIN
                        item AS i 
                        ON i.idItem = c_l_i.idItem 
                WHERE
                    i_ins.idItemInstance = ? 
                UNION
                SELECT
                    rec.idRecipe as id, 'recipe' as type, rec.name, rec.description, rec.image, rec.rarity,
                    c_l_r.dropProbability, c_l_r.maxQuantity, c_l_r.alpha, c_l_r.beta 
                FROM
                    item_instance AS i_ins 
                    JOIN
                        chest AS c 
                        ON c.idItem = i_ins.idItem 
                    JOIN
                        chest_loot_recipe AS c_l_r 
                        ON c_l_r.idChest = c.idChest 
                    JOIN
                        recipe AS rec 
                        ON rec.idRecipe = c_l_r.idRecipe 
                WHERE
                    i_ins.idItemInstance = ?
                `
            mysql.query(sql, [idItemInstance, idItemInstance], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getChestLoots END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getInventoryInstanceDataFromAddressAndIdInventoryInstanceAndInventoryType(address, idInventoryInstance, inventoryType) {
        logger.info(`InventoryQueries.getInventoryInstanceDataFromAddressAndIdInventoryInstanceAndInventoryType START`)
        let sql, params
        if (inventoryType == 'item') {
            sql = `
                SELECT
                    i_ins.idItemInstance AS id, IF(c.idChest IS NULL, FALSE, TRUE) AS isChest,
                    'item' AS type,
                    i_ins.quantity, i.name, i.description, i.image,
                    m.craft, m.view, m.send, m.sell,
                    c.minDrops, c.maxDrops,
                    IF(res_req.ancien IS NULL, 0, res_req.ancien) AS requiredAncien,
                    IF(res_req.wood IS NULL, 0, res_req.wood) AS requiredWood,
                    IF(res_req.stone IS NULL, 0, res_req.stone) AS requiredStone,
                    IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
                    i_req.burn, i_inst.idItemInstance,
                    IF(IF(res_req.ancien IS NULL, 0, res_req.ancien) > u.ancien, FALSE, TRUE) AS isAncienAllowed,
                    IF(IF(res_req.wood IS NULL, 0, res_req.wood) > u.wood, FALSE, TRUE) AS isWoodAllowed,
                    IF(IF(res_req.stone IS NULL, 0, res_req.stone) > u.stone, FALSE, TRUE) AS isStoneAllowed,
                    IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_inst.quantity IS NULL, 0, i_inst.quantity), FALSE, TRUE) AS isItemAllowed,
                    ins_i.name AS requiredItemName, ins_i.image AS requiredItemImage 
                FROM
                    item_instance AS i_ins 
                    JOIN
                        item AS i 
                        ON i.idItem = i_ins.idItem 
                    LEFT JOIN
                        chest AS c 
                        ON c.idItem = i.idItem 
                    LEFT JOIN
                        chest_requirements AS c_req 
                        ON c_req.idChest = c.idChest 
                    LEFT JOIN
                        resource_requirements AS res_req 
                        ON res_req.idResourceRequirement = c_req.idResourceRequirement 
                    LEFT JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = c_req.idItemRequirement 
                    LEFT JOIN
                        item_instance AS i_inst 
                        ON i_inst.idItem = i_req.idItem 
                        AND i_inst.address = ? 
                    LEFT JOIN
                        item AS ins_i 
                        ON ins_i.idItem = i_req.idItem 
                    JOIN
                        utente AS u 
                        ON u.address = ? 
                    JOIN
                        menu AS m 
                        ON m.idMenu = i.idMenu 
                WHERE
                    i_ins.idItemInstance = ? 
                    AND i_ins.address = ?
                `
            params = [address, address, idInventoryInstance, address]
        } else if (inventoryType == 'recipe') {
            sql = `
                SELECT
                    rec_ins.idRecipeInstance AS id,
                    'recipe' AS type,
                    rec_ins.quantity,
                    rec.idRecipe, rec.name, rec.image, rec.description, rec.chanceCraft,
                    m.craft, m.view, m.send, m.sell,
                    t.name AS productName, t.image AS productImage,
                    r_i.name AS productName1, r_i.image AS productImage1,
                    rec.itemQuantity AS productQuantity,
                    c_req.idResourceRequirement, c_req.idItemRequirement, c_req.idToolRequirement, c_req.idRecipeRequirement,
                    IF(res_req.ancien IS NULL, 0, res_req.ancien) AS requiredAncien,
                    IF(res_req.wood IS NULL, 0, res_req.wood) AS requiredWood,
                    IF(res_req.stone IS NULL, 0, res_req.stone) AS requiredStone,
                    IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
                    i_ins.idItemInstance,
                    IF(IF(res_req.ancien IS NULL, 0, res_req.ancien) > u.ancien, FALSE, TRUE) AS isAncienAllowed,
                    IF(IF(res_req.wood IS NULL, 0, res_req.wood) > u.wood, FALSE, TRUE) AS isWoodAllowed,
                    IF(IF(res_req.stone IS NULL, 0, res_req.stone) > u.stone, FALSE, TRUE) AS isStoneAllowed,
                    IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
                    i.name AS requiredItemName, i.image AS requiredItemImage,
                    t_req.burn, t_ins.idToolInstance,
                    t_lev.level AS requiredToolLevel,
                    t_lev.idToolLevel AS requiredIdToolLevel,
                    r_t.name AS requiredToolName, r_t.image AS requiredToolImage,
                    IF(t_ins.idToolInstance IS NULL, FALSE, TRUE) AS isToolAllowed,
                    r_rec.name AS requiredRecipeName, r_rec.image AS requiredRecipeImage,
                    IF(rec_req.quantity IS NULL, 0, rec_req.quantity) AS requiredRecipeQuantity,
                    IF(IF(rec_req.quantity IS NULL, 0, rec_req.quantity) > IF(r_rec_ins.quantity IS NULL, 0, r_rec_ins.quantity), FALSE, TRUE) AS isRecipeAllowed,
                    r_rec_ins.idRecipeInstance 
                FROM
                    recipe_instance AS rec_ins 
                    JOIN
                        utente AS u 
                        ON u.address = rec_ins.address 
                    JOIN
                        recipe AS rec 
                        ON rec.idRecipe = rec_ins.idRecipe 
                    JOIN
                        menu AS m 
                        ON m.idMenu = rec.idMenu 
                    LEFT JOIN
                        tool AS t 
                        ON t.idTool = rec.idTool 
                    LEFT JOIN
                        item AS r_i 
                        ON r_i.idItem = rec.idItem 
                    LEFT JOIN
                        craft_requirements AS c_req 
                        ON c_req.idRecipe = rec_ins.idRecipe 
                    LEFT JOIN
                        resource_requirements AS res_req 
                        ON res_req.idResourceRequirement = c_req.idResourceRequirement 
                    LEFT JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = c_req.idItemRequirement 
                    LEFT JOIN
                        item_instance AS i_ins 
                        ON i_ins.address = rec_ins.address 
                        AND i_ins.idItem = i_req.idItem 
                    LEFT JOIN
                        item AS i 
                        ON i.idItem = i_req.idItem 
                    LEFT JOIN
                        tool_requirements AS t_req 
                        ON t_req.idToolRequirement = c_req.idToolRequirement 
                    LEFT JOIN
                        tool_level AS t_lev 
                        ON t_lev.idToolLevel = t_req.idToolLevel 
                    LEFT JOIN
                        tool AS r_t 
                        ON r_t.idTool = t_lev.idTool 
                    LEFT JOIN
                        tool_instance AS t_ins 
                        ON t_ins.address = rec_ins.address 
                        AND t_ins.idToolLevel = t_req.idToolLevel 
                    LEFT JOIN
                        recipe_requirements AS rec_req 
                        ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement 
                    LEFT JOIN
                        recipe AS r_rec 
                        ON r_rec.idRecipe = rec_req.idRecipe 
                    LEFT JOIN
                        recipe_instance AS r_rec_ins 
                        ON r_rec_ins.address = rec_ins.address 
                        AND r_rec_ins.idRecipe = rec_req.idRecipe 
                WHERE
                    rec_ins.idRecipeInstance = ? 
                    AND rec_ins.address = ?
                `
            params = [idInventoryInstance, address]
        } else if (inventoryType == 'tool') {
            sql = `
                SELECT
                    t_ins.idToolInstance AS id, t_ins.durability, 1 AS quantity,
                    'tool' AS type, 'repair' AS action,
                    t_lev.chanceUpgrade, t_lev.level, t_lev.isUpgradable, t_lev.durabilityTotal,
                    t.name, t.image, t.description, t.isRepairable, t.rarity,
                    m.craft, m.view, m.send, m.sell,
                    IF(res_req.ancien IS NULL, 0, res_req.ancien) AS requiredAncien,
                    IF(res_req.wood IS NULL, 0, res_req.wood) AS requiredWood,
                    IF(res_req.stone IS NULL, 0, res_req.stone) AS requiredStone,
                    IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
                    i_ins.idItemInstance,
                    IF(IF(res_req.ancien IS NULL, 0, res_req.ancien) > u.ancien, FALSE, TRUE) AS isAncienAllowed,
                    IF(IF(res_req.wood IS NULL, 0, res_req.wood) > u.wood, FALSE, TRUE) AS isWoodAllowed,
                    IF(IF(res_req.stone IS NULL, 0, res_req.stone) > u.stone, FALSE, TRUE) AS isStoneAllowed,
                    IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
                    i.name as requiredItemName, i.image as requiredItemImage 
                FROM
                    tool_instance AS t_ins 
                    JOIN
                        utente AS u 
                        ON u.address = t_ins.address 
                    JOIN
                        tool_level AS t_lev 
                        ON t_lev.idToolLevel = t_ins.idToolLevel 
                    JOIN
                        tool AS t 
                        ON t.idTool = t_ins.idTool 
                    JOIN
                        menu AS m 
                        ON m.idMenu = t.idMenu 
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
                        ON i_ins.address = t_ins.address 
                        AND i_ins.idItem = i_req.idItem 
                    LEFT JOIN
                        item AS i 
                        ON i.idItem = i_req.idItem 
                WHERE
                    t_ins.idToolInstance = ? 
                    AND t_ins.address = ? 
                UNION
                SELECT
                    t_ins.idToolInstance AS id, t_ins.durability, 1 AS quantity,
                    'tool' AS type, 'upgrade' AS action,
                    t_lev.chanceUpgrade, t_lev.level, t_lev.isUpgradable, t_lev.durabilityTotal,
                    t.name, t.image, t.description, t.isRepairable, t.rarity,
                    m.craft, m.view, m.send, m.sell,
                    IF(res_req.ancien IS NULL, 0, res_req.ancien) AS requiredAncien,
                    IF(res_req.wood IS NULL, 0, res_req.wood) AS requiredWood,
                    IF(res_req.stone IS NULL, 0, res_req.stone) AS requiredStone,
                    IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
                    i_ins.idItemInstance,
                    IF(IF(res_req.ancien IS NULL, 0, res_req.ancien) > u.ancien, FALSE, TRUE) AS isAncienAllowed,
                    IF(IF(res_req.wood IS NULL, 0, res_req.wood) > u.wood, FALSE, TRUE) AS isWoodAllowed,
                    IF(IF(res_req.stone IS NULL, 0, res_req.stone) > u.stone, FALSE, TRUE) AS isStoneAllowed,
                    IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
                    i.name as requiredItemName, i.image as requiredItemImage 
                FROM
                    tool_instance AS t_ins 
                    JOIN
                        utente AS u 
                        ON u.address = t_ins.address 
                    JOIN
                        tool_level AS t_lev 
                        ON t_lev.idToolLevel = t_ins.idToolLevel 
                    JOIN
                        tool AS t 
                        ON t.idTool = t_ins.idTool 
                    JOIN
                        menu AS m 
                        ON m.idMenu = t.idMenu 
                    LEFT JOIN
                        upgrade_requirements AS up_req 
                        ON up_req.idToolLevel = (SELECT idToolLevel as newIdLevel
                            FROM tool_level as tl 
                            WHERE tl.idTool = t_ins.idTool 
                            AND level = (SELECT level FROM tool_level as tl2 WHERE tl2.idToolLevel = t_ins.idToolLevel) + 1)  
                    LEFT JOIN
                        resource_requirements AS res_req 
                        ON res_req.idResourceRequirement = up_req.idResourceRequirement 
                    LEFT JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = up_req.idItemRequirement 
                    LEFT JOIN
                        item_instance AS i_ins 
                        ON i_ins.address = t_ins.address 
                        AND i_ins.idItem = i_req.idItem 
                    LEFT JOIN
                        item AS i 
                        ON i.idItem = i_req.idItem 
                WHERE
                    t_ins.idToolInstance = ? 
                    AND t_ins.address = ?
                `
            params = [idInventoryInstance, address, idInventoryInstance, address]
        }

        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getInventoryInstanceDataFromAddressAndIdInventoryInstanceAndInventoryType END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async removeToolInstance(idToolInstance) {
        logger.info(`InventoryQueries.removeToolInstance START`)
        return new Promise((resolve, reject) => {
            let sql = `
                DELETE
                FROM
                    tool_instance 
                WHERE
                    idToolInstance = ?
                `
            mysql.query(sql, idToolInstance, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.removeToolInstance END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getSenderItemData(address, idItemInstance, quantity) {
        logger.info(`InventoryQueries.getSenderItemData START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idItem,
                    quantity - ? AS expectedQuantity,
                    quantity AS currentQuantity
                FROM
                    item_instance 
                WHERE
                    idItemInstance = ? 
                    AND address = ?
                `
            mysql.query(sql, [quantity, idItemInstance, address, quantity], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getSenderItemData END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getReceiverItemData(address, idItem, quantity) {
        logger.info(`InventoryQueries.getReceiverItemData START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    quantity + ? AS expectedQuantity,
                    quantity AS currentQuantity
                FROM
                    item_instance 
                WHERE
                    address = ? 
                    AND idItem = ?
                `
            mysql.query(sql, [quantity, address, idItem], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getReceiverItemData END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getSenderToolData(address, idToolInstance) {
        logger.info(`InventoryQueries.getSenderToolData START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idTool, idToolInstance
                FROM
                    tool_instance 
                WHERE
                    idToolInstance = ? 
                    AND address = ?
                `
            mysql.query(sql, [idToolInstance, address], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getSenderToolData END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async updatedItemInstanceByAddress(action, address, idItem, quantity) {
        logger.info(`InventoryQueries.updatedItemInstanceByAddress START`)
        let sql, params
        if (action == 'create') {
            sql = `
                INSERT IGNORE INTO
                    item_instance (address, idItem, quantity) 
                VALUES
                    (
                        ?, ?, ?
                    )
                `
            params = [address, idItem, quantity]
        } else if (action == 'update') {
            sql = `
                UPDATE
                    item_instance 
                SET
                    quantity = ? 
                WHERE
                    address = ? 
                    AND idItem = ?    
                `
            params = [quantity, address, idItem]
        } else if (action == 'remove') {
            sql = `
                DELETE
                FROM
                    item_instance 
                WHERE
                    address = ? 
                    AND idItem = ?
                `
            params = [address, idItem]
        }
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.updatedItemInstanceByAddress END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async changeToolOwner(idToolInstance, addressSender, addressReceiver) {
        logger.info(`InventoryQueries.changeToolOwner START`)
        let sql, params
        sql = `
            UPDATE
                tool_instance 
            SET 
                address = ?,
                equipped = 0,
                pkBuilding = null
            WHERE
                address = ? 
                AND idToolInstance = ?
            `
        params = [addressReceiver, addressSender, idToolInstance]
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.changeToolOwner END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async updateBuildingEquipped(idToolInstance) {
        logger.info(`InventoryQueries.updateBuildingEquipped START`)
        let sql, params
        sql = `
            UPDATE
                buildings 
            SET 
                idToolInstance = null
            WHERE
                idToolInstance = ?
            `
        params = idToolInstance
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.updateBuildingEquipped END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getSenderRecipeData(address, idRecipeInstance, quantity) {
        logger.info(`InventoryQueries.getSenderRecipeData START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idRecipe,
                    quantity - ? AS expectedQuantity,
                    quantity AS currentQuantity 
                FROM
                    recipe_instance 
                WHERE
                    idRecipeInstance = ? 
                    AND address = ?
                `
            mysql.query(sql, [quantity, idRecipeInstance, address, quantity], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getSenderRecipeData END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getReceiverRecipeData(address, idRecipe, quantity) {
        logger.info(`InventoryQueries.getReceiverRecipeData START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    quantity + ? AS expectedQuantity,
                    quantity AS currentQuantity
                FROM
                    recipe_instance 
                WHERE
                    address = ? 
                    AND idRecipe = ?
                `
            mysql.query(sql, [quantity, address, idRecipe], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getReceiverRecipeData END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async updatedRecipeInstanceByAddress(action, address, idRecipe, quantity) {
        logger.info(`InventoryQueries.updatedRecipeInstanceByAddress START`)
        let sql, params
        if (action == 'create') {
            sql = `
                INSERT IGNORE INTO
                recipe_instance (address, idRecipe, quantity) 
                VALUES
                    (
                        ?, ?, ?
                    )
                `
            params = [address, idRecipe, quantity]
        } else if (action == 'update') {
            sql = `
                UPDATE
                    recipe_instance 
                SET
                    quantity = ? 
                WHERE
                    address = ? 
                    AND idRecipe = ?    
                `
            params = [quantity, address, idRecipe]
        } else if (action == 'remove') {
            sql = `
                DELETE
                FROM
                    recipe_instance 
                WHERE
                    address = ? 
                    AND idRecipe = ?
                `
            params = [address, idRecipe]
        }
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.updatedRecipeInstanceByAddress END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async checkIfAddressExists(address) {
        logger.info(`InventoryQueries.checkIfAddressExists START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    address
                FROM
                    utente 
                WHERE
                    address = ?
                `
            mysql.query(sql, address, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.checkIfAddressExists END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async checkIfUserHasIdItem(address, idItem, quantity) {
        logger.debug(`checkIfUserHasIdItem start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idItemInstance,
                    quantity + ? AS expectedQuantity 
                FROM
                    item_instance 
                WHERE
                    address = ? 
                    AND idItem = ?
                `

            mysql.query(sql, [quantity, address, idItem], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`checkIfUserHasIdItem end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async checkIfUserHasChest(address, idItemInstance, openCount) {
        logger.debug(`checkIfUserHasChest start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    c.idChest 
                FROM
                    item_instance AS i_ins 
                    JOIN
                        chest AS c 
                        ON c.idItem = i_ins.idItem 
                WHERE
                    i_ins.idItemInstance = ? 
                    AND i_ins.address = ? 
                    AND quantity >= ?
                `

            mysql.query(sql, [idItemInstance, address, openCount], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`checkIfUserHasChest end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async checkRequirementsToOpenChest(address, idChest) {
        logger.debug(`checkRequirementsToOpenChest start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    c.minDrops, c.maxDrops, c.alpha, c.beta,
                    IF(res_req.ancien IS NULL, 0, res_req.ancien) AS requiredAncien,
                    IF(res_req.wood IS NULL, 0, res_req.wood) AS requiredWood,
                    IF(res_req.stone IS NULL, 0, res_req.stone) AS requiredStone,
                    IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
                    i_req.burn, i_inst.idItemInstance,
                    IF(IF(res_req.ancien IS NULL, 0, res_req.ancien) > u.ancien, FALSE, TRUE) AS isAncienAllowed,
                    IF(IF(res_req.wood IS NULL, 0, res_req.wood) > u.wood, FALSE, TRUE) AS isWoodAllowed,
                    IF(IF(res_req.stone IS NULL, 0, res_req.stone) > u.stone, FALSE, TRUE) AS isStoneAllowed,
                    IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_inst.quantity IS NULL, 0, i_inst.quantity), FALSE, TRUE) AS isItemAllowed 
                FROM
                    chest AS c 
                    LEFT JOIN
                        chest_requirements AS c_req 
                        ON c_req.idChest = c.idChest 
                    LEFT JOIN
                        resource_requirements AS res_req 
                        ON res_req.idResourceRequirement = c_req.idResourceRequirement 
                    LEFT JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = c_req.idItemRequirement 
                    LEFT JOIN
                        item_instance AS i_inst 
                        ON i_inst.idItem = i_req.idItem 
                        AND i_inst.address = ? 
                    JOIN
                        utente AS u 
                        ON u.address = ? 
                WHERE
                    c.idChest = ?
            `

            mysql.query(sql, [address, address, idChest], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`checkRequirementsToOpenChest end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async createItemInstance(address, idItem, quantity) {
        logger.debug(`createItemInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO
                    item_instance (address, idItem, quantity) 
                VALUES
                    (
                        ?, ?, ?
                    )
                `

            mysql.query(sql, [address, idItem, quantity], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`createItemInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async updateItemInstance(idItemInstance, quantity) {
        logger.debug(`updateItemInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    item_instance 
                SET
                    quantity = ? 
                WHERE
                    idItemInstance = ?
                `

            mysql.query(sql, [quantity, idItemInstance], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`updateItemInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getIdItemInstance(address, idItem) {
        logger.debug(`updateItemInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idItemInstance 
                FROM
                    item_instance 
                WHERE
                    address = ? 
                    AND idItem = ?
                `

            mysql.query(sql, [address, idItem], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`updateItemInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }
    static async getFishConsumables(address) {
        logger.debug(`getFishConsumables start`)
        let sql = `
            SELECT
                i_con.idItemConsumable, i_con.quantity, i_con.effect AS description,
                i.name, i.image 
            FROM
                item_consumable_fishing AS i_con_f 
                JOIN
                    item_consumable AS i_con 
                    ON i_con.idItemConsumable = i_con_f.idItemConsumable 
                JOIN
                    item AS i 
                    ON i.idItem = i_con.idItem 
                JOIN
                    item_instance AS i_ins 
                    ON i_ins.idItem = i.idItem 
                    AND i_ins.address = ? 
            WHERE
                IF(i_ins.quantity IS NULL, 0, i_ins.quantity) >= i_con.quantity
            `
        return new Promise((resolve, reject) => {
            mysql.query(sql, address, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getFishConsumables end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getRecipeConsumables(address) {
        logger.debug(`getRecipeConsumables start`)
        let sql = `
            SELECT
                i_con.idItemConsumable, i_con.quantity, i_con.effect AS description,
                i.name, i.image 
            FROM
                item_consumable_recipe AS i_con_rec 
                JOIN
                    item_consumable AS i_con 
                    ON i_con.idItemConsumable = i_con_rec.idItemConsumable 
                JOIN
                    item AS i 
                    ON i.idItem = i_con.idItem 
                JOIN
                    item_instance AS i_ins 
                    ON i_ins.idItem = i.idItem 
                    AND i_ins.address = ? 
            WHERE
                IF(i_ins.quantity IS NULL, 0, i_ins.quantity) >= i_con.quantity
            `
        return new Promise((resolve, reject) => {
            mysql.query(sql, address, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getRecipeConsumables end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getToolConsumables(actionType, idToolInstance) {
        logger.debug(`getToolConsumables start`)
        let sql
        sql = `
            SELECT
                i_con.idItemConsumable, i_con.quantity, i_con.effect AS description,
                i.name, i.image 
            FROM
                tool_instance AS t_ins 
                JOIN
                    item_consumable_tool AS i_con_t 
                    ON i_con_t.idToolLevel = t_ins.idToolLevel `
        sql += (actionType == 'repair' ? `AND i_con_t.repair = TRUE ` : `AND i_con_t.upgrade = TRUE `)
        sql += `        
                JOIN
                    item_consumable AS i_con 
                    ON i_con.idItemConsumable = i_con_t.idItemConsumable 
                JOIN
                    item AS i 
                    ON i.idItem = i_con.idItem 
                JOIN
                    item_instance AS i_ins 
                    ON i_ins.idItem = i.idItem 
                    AND i_ins.address = t_ins.address 
            WHERE
                t_ins.idToolInstance = ? 
                AND IF(i_ins.quantity IS NULL, 0, i_ins.quantity) >= i_con.quantity
            `
        return new Promise((resolve, reject) => {
            mysql.query(sql, idToolInstance, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getToolConsumables end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async setInventoryTransfer(transferObject) {
        logger.info(`setInventoryTransfer start`);
        return new Promise((resolve, reject) => {
            let sql;
            let params = [
                transferObject.sender,
                transferObject.receiver,
                transferObject.id,
                transferObject.quantity,
                transferObject.senderBalanceBefore,
                transferObject.senderBalanceAfter,
                transferObject.receiverBalanceBefore,
                transferObject.receiverBalanceAfter
            ]

            sql = `
            INSERT INTO inventory_transfer (
                sender, 
                receiver, 
                ${transferObject.idName}, 
                quantity, 
                senderBalanceBefore, 
                senderBalanceAfter, 
                receiverBalanceBefore, 
                receiverBalanceAfter,
                transferTime
            ) VALUES (?,?,?,?,?,?,?,?, current_timestamp)`;


            mysql.query(sql, params, (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`setInventoryTransfer end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async setUpgradeBldHistory(Objects) {
        logger.debug('setUpgradeBldHistory start');

        let idx;
        let upgradeStartTime = new Date().toISOString();

        let ObjectsArray = Objects.map(
            function (elem) {
                return [
                    elem.idBuilding,
                    elem.type,
                    elem.address,
                    elem.idItem,
                    elem.inventoryType,
                    elem.resourceType,
                    elem.requiredQuantity,
                    elem.quantityBefore,
                    elem.quantityAfter,
                    elem.startLevel,
                    elem.endLevel,
                    idx,
                    upgradeStartTime
                ]
            }
        )


        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO upgrade_building_history (
                idBuilding,
                type,
                address,
                idItem,
                inventoryType,
                resourceType,
                requiredQuantity,
                quantityBefore,
                quantityAfter,
                startLevel,
                endLevel,
                idx,
                upgradeStartTime
            ) VALUES ?`;


            mysql.query(sql, [ObjectsArray], (err, rows, fields) => {
                if (err) {
                    logger.error(`Query error: ${Utils.printErrorLog(err)}`);
                    return reject(new Error(err.message));
                }
                if (rows == undefined || rows == null) {
                    //logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug('setUpgradeBldHistory end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async setUpgradeToolHistory(Objects) {
        logger.debug('setUpgradeToolHistory start');

        let idx;
        let upgradeTime = new Date().toISOString();

        let ObjectsArray = Objects.map(
            function (elem) {
                return [
                    elem.resultUpgrade,
                    elem.idToolInstance,
                    elem.address,
                    elem.idItem,
                    elem.inventoryType,
                    elem.resourceType,
                    elem.requiredQuantity,
                    elem.quantityBefore,
                    elem.quantityAfter,
                    elem.startLevel,
                    elem.endLevel,
                    idx,
                    upgradeTime

                ]
            }
        )


        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO upgrade_tool_history (
                resultUpgrade,
                idToolInstance,
                address,
                idItem,
                inventoryType,
                resourceType,
                requiredQuantity,
                quantityBefore,
                quantityAfter,
                startLevel,
                endLevel,
                idx,
                upgradeTime
                
            ) VALUES ?`;


            mysql.query(sql, [ObjectsArray], (err, rows, fields) => {
                if (err) {
                    logger.error(`Query error: ${Utils.printErrorLog(err)}`);
                    return reject(new Error(err.message));
                }
                if (rows == undefined || rows == null) {
                    //logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug('setUpgradeToolHistory end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async setCraftHistory(craftObjects) {
        logger.debug('setCraftHistory start');

        let idx;
        let craftTime = new Date().toISOString();

        let craftObjectsArray = craftObjects.map(
            function (elem) {
                return [
                    elem.isGem,
                    elem.isNPC,
                    elem.address,
                    elem.inventoryType,
                    elem.idItem,
                    elem.idToolInstance,
                    elem.idRecipe,
                    elem.resourceType,
                    elem.requiredQuantity,
                    elem.quantityBefore,
                    elem.quantityAfter,
                    idx,
                    craftTime
                ]
            }
        )


        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO craft_history (
                isGem,
                isNPC,
                address,
                inventoryType,
                idItem,
                idToolInstance,
                idRecipe,
                resourceType,
                requiredQuantity,
                quantityBefore,
                quantityAfter,
                idx,
                craftTime
            ) VALUES ?`;


            mysql.query(sql, [craftObjectsArray], (err, rows, fields) => {
                if (err) {
                    logger.error(`Query error: ${Utils.printErrorLog(err)}`);
                    return reject(new Error(err.message));
                }
                if (rows == undefined || rows == null) {
                    //logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug('setCraftHistory end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async getIdToolInstanceByAddressIdToolLevel(address, idToolLevel) {
        logger.debug(`getIdToolInstanceByAddressIdToolLevel start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idToolInstance 
                FROM
                    tool_instance 
                WHERE
                    address = ? 
                    AND idToolLevel = ? 
                    AND durability = 
                    (
                        SELECT
                            durabilityTotal 
                        FROM
                            tool_level 
                        WHERE
                            idToolLevel = ?
                    )
                ORDER BY idToolInstance DESC
                `

            mysql.query(sql, [address, idToolLevel, idToolLevel], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getIdToolInstanceByAddressIdToolLevel end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].idToolInstance)
                }
            })
        })
    }
    static async getIdToolLevelByIdRecipe(idRecipe) {
        logger.debug(`getIdToolLevelByIdRecipe start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idToolLevel 
                FROM
                    tool_level 
                WHERE
                    idTool = 
                    (
                        SELECT
                            idTool 
                        FROM
                            recipe 
                        WHERE
                            idRecipe = ?
                    )
                    AND level = 
                    (
                        SELECT
                            MIN(level) 
                        FROM
                            tool_level 
                        WHERE
                            idTool = 
                            (
                                SELECT
                                    idTool 
                                FROM
                                    recipe 
                                WHERE
                                    idRecipe = ?
                            )
                    )
                `

            mysql.query(sql, [idRecipe, idRecipe], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getIdToolLevelByIdRecipe end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].idToolLevel)
                }
            })
        })
    }
    static async getResponseInventory(type, params) {
        logger.debug(`getResponseInventory start`)

        if (type == 'sendRecipe') {
            return new Promise((resolve, reject) => {
                let sql = `
                    SELECT
                        quantity 
                    FROM
                        recipe_instance 
                    WHERE
                        idRecipeInstance = ? 
                        AND address = ?
                    `

                mysql.query(sql, [params.idRecipeInstance, params.address], (err, rows) => {
                    if (err) reject(err)
                    if (rows == undefined) {
                        logger.error(`query error: ${Utils.printErrorLog(err)}`)
                        return reject({
                            message: "undefined"
                        });
                    } else {
                        logger.info(`getResponseInventory end`)
                        return resolve(JSON.parse(JSON.stringify(rows)))
                    }
                })
            })
        } else if (type == 'sendItem') {
            return new Promise((resolve, reject) => {
                let sql = `
                    SELECT
                        quantity 
                    FROM
                        item_instance 
                    WHERE
                        idItemInstance = ? 
                        AND address = ?
                    `

                mysql.query(sql, [params.idItemInstance, params.address], (err, rows) => {
                    if (err) reject(err)
                    if (rows == undefined) {
                        logger.error(`query error: ${Utils.printErrorLog(err)}`)
                        return reject({
                            message: "undefined"
                        });
                    } else {
                        logger.info(`getResponseInventory end`)
                        return resolve(JSON.parse(JSON.stringify(rows)))
                    }
                })
            })
        }
    }

    static async moveBonusInstance(burnToolId, idToolInstance) {
        logger.debug(`moveBonusInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                update
                    bonus_instance
                set
                    idToolInstance = ?
                where
                    idToolInstance = ?
                `

            mysql.query(sql, [idToolInstance, burnToolId], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`moveBonusInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getToolInstanceData(idToolInstance) {
        logger.debug(`getToolInstanceData start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    t_ins.durability,
                    t_lev.isUpgradable,
                    t_lev.durabilityTotal,
                    t_lev.level,
                    t.name,
                    t.description,
                    t.image,
                    t.isRepairable,
                    m.craft,
                    m.view,
                    m.send,
                    m.sell 
                FROM
                    tool_instance AS t_ins 
                    JOIN
                        tool_level AS t_lev 
                        ON t_lev.idToolLevel = t_ins.idToolLevel 
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
                    logger.info(`getToolInstanceData end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getUpgradeRequirements(idToolInstance) {
        logger.debug(`getUpgradeRequirements start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    t_lev.chanceUpgrade,
                    IF(res_req.ancien IS NULL, 0, res_req.ancien) AS requiredAncien,
                    IF(res_req.wood IS NULL, 0, res_req.wood) AS requiredWood,
                    IF(res_req.stone IS NULL, 0, res_req.stone) AS requiredStone,
                    IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
                    IF(IF(res_req.ancien IS NULL, 0, res_req.ancien) > u.ancien, FALSE, TRUE) AS isAncienAllowed,
                    IF(IF(res_req.wood IS NULL, 0, res_req.wood) > u.wood, FALSE, TRUE) AS isWoodAllowed,
                    IF(IF(res_req.stone IS NULL, 0, res_req.stone) > u.stone, FALSE, TRUE) AS isStoneAllowed,
                    IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
                    i.name,
                    i.image 
                FROM
                    tool_instance AS t_ins 
                    JOIN
                        tool_level AS t_lev 
                        ON t_lev.idToolLevel = t_ins.idToolLevel 
                    JOIN
                        utente AS u 
                        ON u.address = t_ins.address 
                    LEFT JOIN
                        upgrade_requirements AS up_req 
                        ON up_req.idToolLevel = t_ins.idToolLevel 
                    LEFT JOIN
                        resource_requirements AS res_req 
                        ON res_req.idResourceRequirement = up_req.idResourceRequirement 
                    LEFT JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = up_req.idItemRequirement 
                    LEFT JOIN
                        item_instance AS i_ins 
                        ON i_ins.address = t_ins.address 
                        AND i_ins.idItem = i_req.idItem 
                    LEFT JOIN
                        item AS i 
                        ON i.idItem = i_ins.idItem 
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
                    logger.info(`getUpgradeRequirements end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getUpgradeConsumables(idToolInstance) {
        logger.debug(`getUpgradeConsumables start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    i.name,
                    i.idItem,
                    i.description,
                    i.image,
                    IF(i_ins.quantity IS NULL, 0, i_ins.quantity) AS quantity 
                FROM
                    tool_instance AS t_ins 
                    JOIN
                        item_consumable_tool AS i_con 
                        ON i_con.idToolLevel = t_ins.idToolLevel 
                        AND i_con.upgrade = 1 
                    JOIN
                        item AS i 
                        ON i.idItem = i_con.idItem 
                    JOIN
                        item_instance AS i_ins 
                        ON i_ins.idItem = i.idItem 
                        AND i_ins.address = t_ins.address 
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
                    logger.info(`getUpgradeConsumables end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getRepairRequirements(idToolInstance) {
        logger.debug(`getRepairRequirements start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    IF(t_ins.durability < t_lev.durabilityTotal, TRUE, FALSE  ) AS isRepairable,
                    IF(res_req.ancien IS NULL, 0, res_req.ancien) AS requiredAncien,
                    IF(res_req.wood IS NULL, 0, res_req.wood) AS requiredWood,
                    IF(res_req.stone IS NULL, 0, res_req.stone) AS requiredStone,
                    IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
                    IF(IF(res_req.ancien IS NULL, 0, res_req.ancien) > u.ancien, FALSE, TRUE) AS isAncienAllowed,
                    IF(IF(res_req.wood IS NULL, 0, res_req.wood) > u.wood, FALSE, TRUE) AS isWoodAllowed,
                    IF(IF(res_req.stone IS NULL, 0, res_req.stone) > u.stone, FALSE, TRUE) AS isStoneAllowed,
                    IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
                    i.name,
                    i.image 
                FROM
                    tool_instance AS t_ins 
                    JOIN
                        tool_level AS t_lev 
                        ON t_lev.idToolLevel = t_ins.idToolLevel 
                    JOIN
                        utente AS u 
                        ON u.address = t_ins.address 
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
                        ON i_ins.address = t_ins.address 
                        AND i_ins.idItem = i_req.idItem 
                    LEFT JOIN
                        item AS i 
                        ON i.idItem = i_ins.idItem 
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
                    logger.info(`getRepairRequirements end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getRepairConsumables(idToolInstance) {
        logger.debug(`getRepairConsumables start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    i.name,
                    i.idItem,
                    i.description,
                    i.image,
                    IF(i_ins.quantity IS NULL, 0, i_ins.quantity) AS quantity 
                FROM
                    tool_instance AS t_ins 
                    JOIN
                        item_consumable_tool AS i_con 
                        ON i_con.idToolLevel = t_ins.idToolLevel 
                        AND i_con.repair = 1 
                    JOIN
                        item AS i 
                        ON i.idItem = i_con.idItem 
                    JOIN
                        item_instance AS i_ins 
                        ON i_ins.idItem = i.idItem 
                        AND i_ins.address = t_ins.address 
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
                    logger.info(`getRepairConsumables end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getUser(address) {
        logger.info(`getUser start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM utente WHERE address = ?";

            mysql.query(sql, address, (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getUser end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getRecipeGivenIdRecipeInstance(address, idRecipeInstance) {
        logger.info(`getRecipeGivenIdRecipeInstance start`)
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM recipe_instance WHERE idRecipeInstance = ? AND address = ?"

            mysql.query(sql, [idRecipeInstance, address], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`getRecipeGivenIdRecipeInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getRecipeGivenIdRecipe(address, idRecipe) {
        logger.info(`getRecipeGivenIdRecipe start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM recipe_instance WHERE address = ? AND idRecipe = ?";

            mysql.query(sql, [address, idRecipe], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getRecipeGivenIdRecipe end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async subRecipe(address, idRecipeInstance, quantity) {
        logger.info(`subRecipe start`);
        return new Promise((resolve, reject) => {
            let sql = `UPDATE recipe_instance
            SET quantity = CASE WHEN (quantity >= ?) THEN quantity - ? ELSE quantity END
            WHERE address = ? AND idRecipeInstance = ?`;

            mysql.query(sql, [quantity, quantity, address, idRecipeInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`subRecipe end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async newRecipe(address, idRecipe, quantity) {
        logger.info(`newRecipe start`);
        return new Promise((resolve, reject) => {
            let sql = `INSERT IGNORE INTO recipe_instance (address,idRecipe,quantity) VALUES (?,?,?)`;

            mysql.query(sql, [address, idRecipe, quantity], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`newRecipe end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async addRecipes(address, idRecipe, quantity) {
        logger.info(`newRecipe start`);
        return new Promise((resolve, reject) => {
            let sql = `LOCK TABLE recipe_instance write;
            UPDATE recipe_instance
            SET quantity = quantity + ? 
            WHERE address = ? AND idRecipe = ?;
            UNLOCK TABLE;
             `;

            mysql.query(sql, [quantity, address, idRecipe], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`newRecipe end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getItemGivenIdItemInstance(address, idItemInstance) {
        logger.info(`getItemGivenIdItemInstance start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM item_instance WHERE address = ? AND idItemInstance = ?";

            mysql.query(sql, [address, idItemInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getItemGivenIdItemInstance end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getItemGivenIdItem(address, idItem) {
        logger.info(`getItemGivenIdItem start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM item_instance WHERE address = ? AND idItem = ?";

            mysql.query(sql, [address, idItem], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getItemGivenIdItem end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async subItem(address, idItemInstance, quantity) {
        logger.info(`subItem start`);
        return new Promise((resolve, reject) => {
            let sql = `UPDATE item_instance
            SET quantity = CASE WHEN (quantity >= ?) THEN quantity - ? ELSE quantity END
            WHERE address = ? AND idItemInstance = ?`;

            mysql.query(sql, [quantity, quantity, address, idItemInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`subItem end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async addCraftedTool(address, idRecipe) {
        logger.info(`addCraftedTool start`);

        return new Promise((resolve, reject) => {
            let sql = `
            INSERT IGNORE tool_instance (idToolLevel, idTool, address, durability, equipped)
            VALUES (
                (SELECT idToolLevel FROM tool_level where idTool = (SELECT idTool FROM recipe WHERE idRecipe = ?)
                AND level = (select min(level) from tool_level where idTool = (SELECT idTool FROM recipe WHERE idRecipe = ?))),

                (SELECT idTool FROM recipe WHERE idRecipe = ?),

                ?,

                (SELECT durabilityTotal FROM tool_level where idTool = (SELECT idTool FROM recipe WHERE idRecipe = ?)
                and level = (select min(level) from tool_level where idTool = (SELECT idTool FROM recipe WHERE idRecipe = ?))),

                0
            )`;

            mysql.query(sql, [idRecipe, idRecipe, idRecipe, address, idRecipe, idRecipe], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`addCraftedTool end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }


    static async getRecipeDropType(idRecipe) {
        logger.info(`getRecipeDropType start`);

        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM recipe WHERE idRecipe = ?`;

            mysql.query(sql, idRecipe, (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getRecipeDropType end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async newItem(address, idItem, quantity) {
        logger.info(`newItem start`);
        return new Promise((resolve, reject) => {
            let sql = `INSERT IGNORE INTO item_instance (address,idItem,quantity) VALUES (?,?,?)`;

            mysql.query(sql, [address, idItem, quantity], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`newItem end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async addItems(address, idItem, quantity) {
        logger.info(`addItems start`);
        return new Promise((resolve, reject) => {
            let sql = `
            LOCK TABLE item_instance write;
            UPDATE item_instance
            SET quantity = quantity + ? 
            WHERE address = ? AND idItem = ?;
            UNLOCK TABLE`;

            mysql.query(sql, [quantity, address, idItem], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`addItems end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getToolInstance(address, idToolInstance) {
        logger.info(`getTool start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM tool_instance WHERE address = ? AND idToolInstance = ?";

            mysql.query(sql, [address, idToolInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getTool end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getRarity(idTool) {
        logger.info(`getRarity start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT rarity FROM tool WHERE idTool = ?";

            mysql.query(sql, idTool, (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getRarity end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getEquippedTool(nftId, type) {
        logger.info(`getEquippedTool start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT idToolInstance FROM buildings WHERE idBuilding = ? AND type = ? ";

            mysql.query(sql, [nftId, type], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getEquippedTool end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async unequipTool(idToolInstance) {
        logger.info(`unequipTool start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE tool_instance SET equipped = false WHERE idToolInstance = ?;";

            mysql.query(sql, idToolInstance, (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`unequipTool end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async equipTool(idToolInstance) {
        logger.info(`setEquippedToolBuildings start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE tool_instance SET equipped = CASE WHEN ( idToolInstance = ? ) THEN true ELSE equipped END;";

            mysql.query(sql, idToolInstance, (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`setEquippedToolBuildings end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async equipAndUnequipTool(oldIdToolInstance, newIdToolInstance, nftId) {
        logger.info(`equipAndUnequipTool start`);
        return new Promise((resolve, reject) => {
            let sql = `UPDATE tool_instance
                SET pkbuilding = CASE WHEN ( idToolInstance = ? ) THEN ? ELSE pkbuilding END,
                pkbuilding = CASE WHEN ( idToolInstance = ? ) THEN null ELSE pkbuilding END,
                equipped = CASE WHEN ( idToolInstance = ? ) THEN true ELSE equipped END,
                equipped = CASE WHEN ( idToolInstance = ? ) THEN false ELSE equipped END 
                `;

            mysql.query(sql, [newIdToolInstance, nftId, oldIdToolInstance, newIdToolInstance, oldIdToolInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`equipAndUnequipTool end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }


    static async setEquippedToolBuildings(idToolInstance, nftId, type) {
        logger.info(`setEquippedToolBuildings start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE buildings SET idToolInstance = ?  WHERE idBuilding = ? AND type = ?";

            mysql.query(sql, [idToolInstance, nftId, type], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`setEquippedToolBuildings end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async sendItemStatus(idItem) {
        logger.info(`sendItemStatus start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM item JOIN menu ON item.idMenu = menu.idMenu WHERE idItem = ? ";

            mysql.query(sql, idItem, (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`sendItemStatus end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async sendRecipeStatus(idRecipe) {
        logger.info(`sendRecipeStatus start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM recipe JOIN menu ON recipe.idMenu = menu.idMenu WHERE idRecipe = ? ";

            mysql.query(sql, idRecipe, (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`sendRecipeStatus end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getToolGivenIdToolInstance(address, idToolInstance) {
        logger.info(`getToolGivenIdToolInstance start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM tool_instance WHERE address = ? AND idToolInstance = ?";

            mysql.query(sql, [address, idToolInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getToolGivenIdToolInstance end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async toolFakeProperty(idToolInstance) {

        console.log("DOVE SCAPPI PKD", process.env.MARKETPLACE_INVENTORY_TOOL_ADDRESS, idToolInstance)
        logger.info(`toolFakeProperty start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE tool_instance SET address = ?, equipped = 0, pkbuilding = null WHERE idToolInstance = ?";

            mysql.query(sql, [process.env.MARKETPLACE_INVENTORY_TOOL_ADDRESS, idToolInstance], (err, rows) => {
                if (err) reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`toolFakeProperty end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getNPCRecipes() {
        logger.info(`InventoryQueries.getNPCRecipes start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idRecipe AS id, name, image, rarity
                FROM
                    recipe
                WHERE
                    NPC = TRUE
                `
            mysql.query(sql, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getNPCRecipes end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getNPCRecipesInstance(address, idRecipe) {
        logger.info(`InventoryQueries.getNPCRecipesInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    rec.idRecipe AS id,
                    'recipe' AS type,
                    rec.name, rec.image, rec.description, rec.chanceCraft,
                    m.craft, m.view, m.send, m.sell,
                    t.name AS productName, t.image AS productImage,
                    r_i.name AS productName1, r_i.image AS productImage1,
                    rec.itemQuantity AS productQuantity,
                    c_req.idResourceRequirement, c_req.idItemRequirement, c_req.idToolRequirement, c_req.idRecipeRequirement,
                    IF(res_req.ancien IS NULL, 0, res_req.ancien) AS requiredAncien,
                    IF(res_req.wood IS NULL, 0, res_req.wood) AS requiredWood,
                    IF(res_req.stone IS NULL, 0, res_req.stone) AS requiredStone,
                    IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
                    i_ins.idItemInstance,
                    IF(IF(res_req.ancien IS NULL, 0, res_req.ancien) > u.ancien, FALSE, TRUE) AS isAncienAllowed,
                    IF(IF(res_req.wood IS NULL, 0, res_req.wood) > u.wood, FALSE, TRUE) AS isWoodAllowed,
                    IF(IF(res_req.stone IS NULL, 0, res_req.stone) > u.stone, FALSE, TRUE) AS isStoneAllowed,
                    IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
                    i.name AS requiredItemName, i.image AS requiredItemImage,
                    t_req.burn, t_ins.idToolInstance,
                    t_lev.level AS requiredToolLevel,
                    r_t.name AS requiredToolName, r_t.image AS requiredToolImage,
                    IF(t_ins.idToolInstance IS NULL, FALSE, TRUE) AS isToolAllowed,
                    r_rec.name AS requiredRecipeName, r_rec.image AS requiredRecipeImage,
                    IF(rec_req.quantity IS NULL, 0, rec_req.quantity) AS requiredRecipeQuantity,
                    IF(IF(rec_req.quantity IS NULL, 0, rec_req.quantity) > IF(r_rec_ins.quantity IS NULL, 0, r_rec_ins.quantity), FALSE, TRUE) AS isRecipeAllowed,
                    r_rec_ins.idRecipeInstance 
                FROM
                    recipe AS rec 
                    JOIN
                        utente AS u 
                        ON u.address = ? 
                    JOIN
                        menu AS m 
                        ON m.idMenu = rec.idMenu 
                    LEFT JOIN
                        tool AS t 
                        ON t.idTool = rec.idTool 
                    LEFT JOIN
                        item AS r_i 
                        ON r_i.idItem = rec.idItem 
                    LEFT JOIN
                        craft_requirements AS c_req 
                        ON c_req.idRecipe = rec.idRecipe 
                    LEFT JOIN
                        resource_requirements AS res_req 
                        ON res_req.idResourceRequirement = c_req.idResourceRequirement 
                    LEFT JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = c_req.idItemRequirement 
                    LEFT JOIN
                        item_instance AS i_ins 
                        ON i_ins.address = ? 
                        AND i_ins.idItem = i_req.idItem 
                    LEFT JOIN
                        item AS i 
                        ON i.idItem = i_req.idItem 
                    LEFT JOIN
                        tool_requirements AS t_req 
                        ON t_req.idToolRequirement = c_req.idToolRequirement 
                    LEFT JOIN
                        tool_level AS t_lev 
                        ON t_lev.idToolLevel = t_req.idToolLevel 
                    LEFT JOIN
                        tool AS r_t 
                        ON r_t.idTool = t_lev.idTool 
                    LEFT JOIN
                        tool_instance AS t_ins 
                        ON t_ins.address = ? 
                        AND t_ins.idToolLevel = t_req.idToolLevel 
                    LEFT JOIN
                        recipe_requirements AS rec_req 
                        ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement 
                    LEFT JOIN
                        recipe AS r_rec 
                        ON r_rec.idRecipe = rec_req.idRecipe 
                    LEFT JOIN
                        recipe_instance AS r_rec_ins 
                        ON r_rec_ins.address = ? 
                        AND r_rec_ins.idRecipe = rec_req.idRecipe 
                WHERE
                    rec.idRecipe = ?
                `
            mysql.query(sql, [address, address, address, address, idRecipe], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries.getNPCRecipesInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getGemRecipesInstance(address, idRecipe) {
        logger.info(`InventoryQueries getGemRecipesInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    rec.idRecipe AS id,
                    'recipe' AS type,
                    rec.name, rec.image, rec.description, rec.chanceCraft,
                    m.craft, m.view, m.send, m.sell,
                    t.name AS productName, t.image AS productImage,
                    r_i.name AS productName1, r_i.image AS productImage1,
                    rec.itemQuantity AS productQuantity,
                    c_req.idResourceRequirement, c_req.idItemRequirement, c_req.idToolRequirement, c_req.idRecipeRequirement,
                    IF(res_req.ancien IS NULL, 0, res_req.ancien) AS requiredAncien,
                    IF(res_req.wood IS NULL, 0, res_req.wood) AS requiredWood,
                    IF(res_req.stone IS NULL, 0, res_req.stone) AS requiredStone,
                    IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
                    i_ins.idItemInstance,
                    IF(IF(res_req.ancien IS NULL, 0, res_req.ancien) > u.ancien, FALSE, TRUE) AS isAncienAllowed,
                    IF(IF(res_req.wood IS NULL, 0, res_req.wood) > u.wood, FALSE, TRUE) AS isWoodAllowed,
                    IF(IF(res_req.stone IS NULL, 0, res_req.stone) > u.stone, FALSE, TRUE) AS isStoneAllowed,
                    IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
                    i.name AS requiredItemName, i.image AS requiredItemImage,
                    t_req.burn, t_ins.idToolInstance,
                    t_lev.level AS requiredToolLevel,
                    r_t.name AS requiredToolName, r_t.image AS requiredToolImage,
                    IF(t_ins.idToolInstance IS NULL, FALSE, TRUE) AS isToolAllowed,
                    r_rec.name AS requiredRecipeName, r_rec.image AS requiredRecipeImage,
                    IF(rec_req.quantity IS NULL, 0, rec_req.quantity) AS requiredRecipeQuantity,
                    IF(IF(rec_req.quantity IS NULL, 0, rec_req.quantity) > IF(r_rec_ins.quantity IS NULL, 0, r_rec_ins.quantity), FALSE, TRUE) AS isRecipeAllowed,
                    r_rec_ins.idRecipeInstance 
                FROM
                    recipe AS rec 
                    JOIN
                        utente AS u 
                        ON u.address = ? 
                    JOIN
                        menu AS m 
                        ON m.idMenu = rec.idMenu 
                    LEFT JOIN
                        tool AS t 
                        ON t.idTool = rec.idTool 
                    LEFT JOIN
                        item AS r_i 
                        ON r_i.idItem = rec.idItem 
                    LEFT JOIN
                        craft_requirements AS c_req 
                        ON c_req.idRecipe = rec.idRecipe 
                    LEFT JOIN
                        resource_requirements AS res_req 
                        ON res_req.idResourceRequirement = c_req.idResourceRequirement 
                    LEFT JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = c_req.idItemRequirement 
                    LEFT JOIN
                        item_instance AS i_ins 
                        ON i_ins.address = ? 
                        AND i_ins.idItem = i_req.idItem 
                    LEFT JOIN
                        item AS i 
                        ON i.idItem = i_req.idItem 
                    LEFT JOIN
                        tool_requirements AS t_req 
                        ON t_req.idToolRequirement = c_req.idToolRequirement 
                    LEFT JOIN
                        tool_level AS t_lev 
                        ON t_lev.idToolLevel = t_req.idToolLevel 
                    LEFT JOIN
                        tool AS r_t 
                        ON r_t.idTool = t_lev.idTool 
                    LEFT JOIN
                        tool_instance AS t_ins 
                        ON t_ins.address = ? 
                        AND t_ins.idToolLevel = t_req.idToolLevel 
                    LEFT JOIN
                        recipe_requirements AS rec_req 
                        ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement 
                    LEFT JOIN
                        recipe AS r_rec 
                        ON r_rec.idRecipe = rec_req.idRecipe 
                    LEFT JOIN
                        recipe_instance AS r_rec_ins 
                        ON r_rec_ins.address = ? 
                        AND r_rec_ins.idRecipe = rec_req.idRecipe 
                WHERE
                    rec.idRecipe = ?
                `
            mysql.query(sql, [address, address, address, address, idRecipe], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries getGemRecipesInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async logChestOpening(info) {
        /*
            info = {
                address,
                idChest,
                lootNumber,
                idItem,
                idRecipe,
                quantityBefore,
                quantity,
                quantityAfter,
            };
        */
        return new Promise((resolve, reject) => {
            let sql = `
            INSERT INTO chest_history
            (address, idChest, lootNumber, idItem, idRecipe, quantityBefore, quantity, quantityAfter, timestamp)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;

            mysql.query(sql,
                [
                    info.address,
                    info.idChest, info.lootNumber,
                    info.idItem, info.idRecipe,
                    info.quantityBefore, info.quantity, info.quantityAfter
                ], (err, rows) => {
                    if (err) reject(err);
                    if (rows == undefined) {
                        logger.error(`query error: ${Utils.printErrorLog(err)}`);
                        return reject({
                            message: "undefined"
                        });
                    } else {
                        return resolve(JSON.parse(JSON.stringify(rows)));
                    }
                });
        });
    }

    static async getGemRecipes() {
        logger.info(`InventoryQueries getGemRecipes start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idRecipe AS id, name, image, rarity
                FROM
                    recipe
                WHERE
                    gem = TRUE
                `
            mysql.query(sql, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries getGemRecipes end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getBundleGem() {
        logger.info(`InventoryQueries getBundleGem start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    b_gem.*,
                    i.name AS itemName, i.image AS itemImage, i.description AS itemDescription
                FROM
                    bundle_gems AS b_gem
                    JOIN item AS i
                    ON i.idItem = b_gem.idItem
                WHERE
                    b_gem.active = 1
                `
            mysql.query(sql, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`InventoryQueries getBundleGem end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
}


module.exports = { InventoryQueries };