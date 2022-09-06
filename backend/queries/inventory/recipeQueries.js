const mysql = require('../../config/databaseConfig');
const logger = require('../../logging/logger');
const {Utils} = require("../../utils/utils");

class RecipeQueries{
    constructor() {}

    static async craft(idRecipeInstance) {
        logger.info(`craft start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
                rec.chanceCraft,
                t.idTool, i.idItem, rec.itemQuantity,
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
                t_req.burn, t_ins.idToolInstance,
                IF(t_ins.idToolInstance IS NULL, FALSE, TRUE) AS isToolAllowed,
                IF(rec_req.quantity IS NULL, 0, rec_req.quantity) AS requiredRecipeQuantity,
                IF(IF(rec_req.quantity IS NULL, 0, rec_req.quantity) > IF(r_rec_ins.quantity IS NULL, 0, r_rec_ins.quantity), FALSE, TRUE) AS isRecipeAllowed,
                r_rec_ins.idRecipeInstance, u.ancien AS ancienBefore, u.wood AS woodBefore, u.stone AS stoneBefore, i_ins.quantity AS itemQuantityBefore, r_rec_ins.quantity AS recipeQuantityBefore,
                i_ins.idItem AS idItemReq, r_rec_ins.idRecipe AS idRecipeReq
            FROM
                recipe_instance AS rec_ins 
                JOIN
                    utente AS u 
                    ON u.address = rec_ins.address 
                JOIN
                    recipe AS rec 
                    ON rec.idRecipe = rec_ins.idRecipe 
                LEFT JOIN
                    tool AS t 
                    ON t.idTool = rec.idTool 
                LEFT JOIN
                    item AS i 
                    ON i.idItem = rec.idItem 
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
                    tool_requirements AS t_req 
                    ON t_req.idToolRequirement = c_req.idToolRequirement 
                LEFT JOIN
                    tool_instance AS t_ins 
                    ON t_ins.address = rec_ins.address 
                    AND t_ins.idToolLevel = t_req.idToolLevel 
                LEFT JOIN
                    recipe_requirements AS rec_req 
                    ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement 
                LEFT JOIN
                    recipe_instance AS r_rec_ins 
                    ON r_rec_ins.address = rec_ins.address 
                    AND r_rec_ins.idRecipe = rec_req.idRecipe 
            WHERE
                rec_ins.idRecipeInstance = ?
                `;
            mysql.query(sql, idRecipeInstance, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`craft end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async craftNPC(address,idRecipe) {
        logger.info(`craftNPC start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    rec.chanceCraft,
                    t.idTool, i.idItem, rec.itemQuantity,
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
                    t_req.burn, t_ins.idToolInstance,
                    IF(t_ins.idToolInstance IS NULL, FALSE, TRUE) AS isToolAllowed,
                    IF(rec_req.quantity IS NULL, 0, rec_req.quantity) AS requiredRecipeQuantity,
                    IF(IF(rec_req.quantity IS NULL, 0, rec_req.quantity) > IF(r_rec_ins.quantity IS NULL, 0, r_rec_ins.quantity), FALSE, TRUE) AS isRecipeAllowed,
                    r_rec_ins.idRecipeInstance, u.ancien AS ancienBefore, u.wood AS woodBefore, u.stone AS stoneBefore, i_ins.quantity AS itemQuantityBefore, r_rec_ins.quantity AS recipeQuantityBefore,
                    i_ins.idItem AS idItemReq, r_rec_ins.idRecipe AS idRecipeReq
                FROM
                    recipe AS rec 
                    JOIN
                        utente AS u 
                        ON u.address = ? 
                    LEFT JOIN
                        tool AS t 
                        ON t.idTool = rec.idTool 
                    LEFT JOIN
                        item AS i 
                        ON i.idItem = rec.idItem 
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
                        tool_requirements AS t_req 
                        ON t_req.idToolRequirement = c_req.idToolRequirement 
                    LEFT JOIN
                        tool_instance AS t_ins 
                        ON t_ins.address = ? 
                        AND t_ins.idToolLevel = t_req.idToolLevel 
                    LEFT JOIN
                        recipe_requirements AS rec_req 
                        ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement 
                    LEFT JOIN
                        recipe_instance AS r_rec_ins 
                        ON r_rec_ins.address = ? 
                        AND r_rec_ins.idRecipe = rec_req.idRecipe 
                WHERE
                    rec.idRecipe = ?
                `;
            mysql.query(sql, [address,address,address,address,idRecipe], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`craftNPC end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async craftGem(address,idRecipe) {
        logger.info(`craftGem start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    rec.chanceCraft,
                    t.idTool, i.idItem, rec.itemQuantity,
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
                    t_req.burn, t_ins.idToolInstance,
                    IF(t_ins.idToolInstance IS NULL, FALSE, TRUE) AS isToolAllowed,
                    IF(rec_req.quantity IS NULL, 0, rec_req.quantity) AS requiredRecipeQuantity,
                    IF(IF(rec_req.quantity IS NULL, 0, rec_req.quantity) > IF(r_rec_ins.quantity IS NULL, 0, r_rec_ins.quantity), FALSE, TRUE) AS isRecipeAllowed,
                    r_rec_ins.idRecipeInstance, u.ancien AS ancienBefore, u.wood AS woodBefore, u.stone AS stoneBefore, i_ins.quantity AS itemQuantityBefore, r_rec_ins.quantity AS recipeQuantityBefore,
                    i_ins.idItem AS idItemReq, r_rec_ins.idRecipe AS idRecipeReq
                FROM
                    recipe AS rec 
                    JOIN
                        utente AS u 
                        ON u.address = ? 
                    LEFT JOIN
                        tool AS t 
                        ON t.idTool = rec.idTool 
                    LEFT JOIN
                        item AS i 
                        ON i.idItem = rec.idItem 
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
                        tool_requirements AS t_req 
                        ON t_req.idToolRequirement = c_req.idToolRequirement 
                    LEFT JOIN
                        tool_instance AS t_ins 
                        ON t_ins.address = ? 
                        AND t_ins.idToolLevel = t_req.idToolLevel 
                    LEFT JOIN
                        recipe_requirements AS rec_req 
                        ON rec_req.idRecipeRequirement = c_req.idRecipeRequirement 
                    LEFT JOIN
                        recipe_instance AS r_rec_ins 
                        ON r_rec_ins.address = ? 
                        AND r_rec_ins.idRecipe = rec_req.idRecipe 
                WHERE
                    rec.idRecipe = ?
                `;
            mysql.query(sql, [address,address,address,address,idRecipe], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`craftGem end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getRecipesMaxAvailable(idRecipe){
        logger.info(`getRecipesMaxAvailable start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT maxSupply as `max`, maxCraft FROM recipe WHERE idRecipe = ?";
                    
            mysql.query(sql, idRecipe, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getRecipesMaxAvailable end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getRecipesAvailable(idRecipe){
        logger.info(`getRecipesAvailable start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT (SELECT maxSupply as `max` FROM recipe WHERE idRecipe = ?) - IFNULL((SELECT SUM(requiredQuantity) FROM craft_history WHERE idRecipe = ?), 0) as available";
                    
            mysql.query(sql, [idRecipe, idRecipe], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getRecipesAvailable end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getMenuByIdRecipeInstance(idRecipeInstance) {
        logger.debug(`getMenuByIdRecipeInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    m.craft, m.view, m.send, m.sell 
                FROM
                    recipe_instance AS r_ins 
                    JOIN
                        recipe AS r
                        ON r.idRecipe = r_ins.idRecipe
                    JOIN
                        menu AS m 
                        ON m.idMenu = r.idMenu 
                WHERE
                    r_ins.idRecipeInstance = ?
                `
    
            mysql.query(sql, idRecipeInstance, (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getMenuByIdRecipeInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }

    static async getRecipeInstanceByAddress(address){
        logger.info(`getRecipeInstanceByAddress start`);
        return new Promise((resolve, reject) => {
            /* let sql = `
            SELECT recipe_instance.id as instanceId, recipe_instance.quantity as instanceQuantity, 
            recipe_instance.address as address, recipe.*, menu.craft as craft, menu.send as send, menu.view as view

            FROM recipe_instance JOIN recipe ON recipe_instance.idRecipe = recipe.id JOIN menu ON recipe.idMenu = menu.id
            WHERE recipe_instance.address =  ?`; */
            let sql = `
                SELECT
                    a.idRecipeInstance AS id,
                    a.quantity,
                    b.idRecipe,
                    b.name,
                    b.description,
                    b.chanceCraft,
                    c.image,
                    d.craft,
                    d.view,
                    d.send
                FROM recipe_instance AS a
                JOIN recipe AS b ON b.idRecipe = a.idRecipe
                JOIN tool AS c ON c.idTool = b.idTool
                JOIN menu AS d ON d.idMenu = b.idMenu
                WHERE a.address = ?
                `;
                    
            mysql.query(sql, address, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getRecipeInstanceByAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getRecipeInstanceByAddressAndIdItem(address, idRecipe){
        logger.info(`getRecipeInstanceByAddressAndIdItem start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT * 
                FROM recipe_instance
                WHERE recipe_instance.address = ?
                AND recipe_instance.idRecipe = ?
                `;
                    
            mysql.query(sql, [address, idRecipe], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getRecipeInstanceByAddressAndIdItem end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async getQuantityByIdRecipeInstance(idRecipeInstance) {
        logger.info(`getQuantityByIdRecipeInstance start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
                quantity
            FROM 
                recipe_instance
            WHERE
                idRecipeInstance = ?
            `;
    
            mysql.query(sql, [idRecipeInstance] , (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getQuantityByIdRecipeInstance end`);
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }
    static async getRecipeQuantityByAddressAndIdRecipe(address, idRecipe) {
        logger.info(`getRecipeQuantityByAddressAndIdRecipe start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
                quantity
            FROM 
                recipe_instance
            WHERE
                address = ?
            AND
                idRecipe = ?
            `;
    
            mysql.query(sql, [address, idRecipe] , (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getRecipeQuantityByAddressAndIdRecipe end`);
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }

    static async subRecipeByIdRecipeAndAddress(address, idRecipe, quantity) {
        logger.info(`subRecipeByIdRecipeAndAddress start`);
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE
                recipe_instance 
            SET
                quantity = IF(quantity >= ? , quantity - ? , quantity) 
            WHERE
                address = ?
            AND
                idRecipe = ?
            `;
    
            mysql.query(sql, [quantity, quantity, address, idRecipe] , (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subRecipeByIdRecipeAndAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async addRecipeByIdRecipeAndAddress(address, idRecipe, quantity) {
        logger.info(`addRecipeByIdRecipeAndAddress start`);
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE
                recipe_instance 
            SET
                quantity = quantity + ?
            WHERE
                idRecipe = ?
            AND
                address = ?
            ;`
            
            mysql.query(sql, [quantity, idRecipe, address] , (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`addRecipeByIdRecipeAndAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async addRecipeByIdRecipeInstanceMarket(idRecipeInstance, quantity, idMarketplaceInventory){
        logger.info(`addRecipeByIdRecipeInstanceMarket start`);
        return new Promise((resolve, reject) => {
            let sql = `
                LOCK TABLES recipe_instance write, marketplace_inventory write;
                    UPDATE
                        recipe_instance
                    SET
                        quantity = quantity + ? 
                    WHERE 
                        recipe_instance.idRecipeInstance = ?
                    AND
                        (SELECT status FROM marketplace_inventory WHERE idMarketplaceInventory = ?) = 1 
                    ;

                    UPDATE
                        marketplace_inventory 
                    SET
                        status = 0
                    WHERE
                        idMarketplaceInventory = ?
                    ;
                UNLOCK TABLES`;
                    
            mysql.query(sql, [quantity, idRecipeInstance, idMarketplaceInventory, idMarketplaceInventory], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`addRecipeByIdRecipeInstanceMarket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getRecipeResourceRequirementsByIdRecipe(idRecipe){
        logger.info(`getRecipeResourceRequirementsByIdRecipe start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    b.ancien,
                    b.wood,
                    b.stone
                FROM craft_requirements AS a
                JOIN resource_requirements AS b ON b.idResourceRequirement = a.idResourceRequirement
                WHERE a.idRecipe = ?
            `;
    
            mysql.query(sql, idRecipe, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getRecipeResourceRequirementsByIdRecipe end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getRecipeItemRequirementsByIdRecipe(idRecipe){
        logger.info(`getRecipeItemRequirementsByIdRecipe start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    b.quantityItem,
                    c.name,
                    c.image
                FROM craft_requirements AS a
                JOIN item_requirements AS b ON b.idItemRequirement = a.idItemRequirement
                JOIN item AS c ON c.idItem = b.idItem
                WHERE a.idRecipe = ?
            `;
    
            mysql.query(sql, idRecipe, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getRecipeItemRequirementsByIdRecipe end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getIdRecipeGivenIdRecipeInstance(address,idRecipeInstance){
        logger.info(`getIdRecipeGivenIdRecipeInstance start`);
        return new Promise((resolve, reject) => {

            let sql = `SELECT idRecipe FROM recipe_instance WHERE address = ? AND idRecipeInstance = ?`;
                    
            mysql.query(sql, [address, idRecipeInstance], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getIdRecipeGivenIdRecipeInstance end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getQuantityGivenIdRecipeInstanceForSell(idRecipeInstance){
        logger.info(`getQuantityGivenIdRecipeInstanceForSell start`);
        return new Promise((resolve, reject) => {

            let sql = `
            SELECT 
                quantity 
            FROM 
                recipe_instance 
            WHERE 
                idRecipeInstance = ? 
            AND 
                quantity > 0`;
                    
            mysql.query(sql, idRecipeInstance, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return resolve([]);
                }else{
                    logger.info(`getQuantityGivenIdRecipeInstanceForSell end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
}

module.exports = { RecipeQueries }