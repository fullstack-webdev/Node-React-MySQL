const mysql = require('../config/databaseConfig');
const logger = require('../logging/logger');
const { Utils } = require("../utils/utils");

class MarketInventoryQueries {
    static async getCheapestInventories(address) {
        logger.info(`MarketInventoryQueries.getCheapestInventories START`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT DISTINCT
                    1 as inventoryInstanceId, mar_inv.inventoryType, mar_inv.idItem AS inventoryId, mar_inv.price AS inventoryPrice,
                    i.name AS inventoryName, i.image AS inventoryImage, i.description AS inventoryDesc, 0 AS inventoryLevel
                FROM
                    marketplace_inventory AS mar_inv 
                    JOIN
                        item AS i 
                        ON i.idItem = mar_inv.idItem 
                    JOIN
                        (
                            SELECT
                                idItem, MIN(price) AS minItemPrice 
                            FROM
                                marketplace_inventory 
                            WHERE
                                status = 1 AND inventoryType = 'item' AND endingTime > CURRENT_TIMESTAMP  AND owner <> ?
                            GROUP BY
                                idItem
                        )
                        AS minItemTable 
                        ON minItemTable.idItem = mar_inv.idItem 
                        AND mar_inv.price = minItemTable.minItemPrice 
                WHERE
                    mar_inv.inventoryType = 'item' AND mar_inv.endingTime > CURRENT_TIMESTAMP AND mar_inv.status = 1 AND owner <> ?
                UNION
                SELECT DISTINCT
                    1 as inventoryInstanceId, mar_inv.inventoryType, mar_inv.idRecipe AS inventoryId, mar_inv.price AS inventoryPrice,
                    rec.name AS inventoryName, rec.image AS inventoryImage, rec.description AS inventoryDesc, 0 AS inventoryLevel 
                FROM
                    marketplace_inventory AS mar_inv 
                    JOIN
                        recipe AS rec 
                        ON rec.idRecipe = mar_inv.idRecipe 
                    JOIN
                        (
                            SELECT
                                idRecipe, MIN(price) AS minRecipePrice 
                            FROM
                                marketplace_inventory 
                            WHERE
                                status = 1 AND inventoryType = 'recipe' AND endingTime > CURRENT_TIMESTAMP AND owner <> ?
                            GROUP BY
                                idRecipe
                        )
                        AS minRecipeTable 
                        ON minRecipeTable.idRecipe = mar_inv.idRecipe 
                        AND mar_inv.price = minRecipeTable.minRecipePrice 
                WHERE
                    mar_inv.inventoryType = 'recipe' AND mar_inv.endingTime > CURRENT_TIMESTAMP AND mar_inv.status = 1 AND owner <> ?
                UNION
                SELECT DISTINCT
                    mar_inv.idToolInstance as inventoryInstanceId, mar_inv.inventoryType, t_ins.idTool AS inventoryId, mar_inv.price AS inventoryPrice,
                    t.name AS inventoryName, t.image AS inventoryImage, t.description AS inventoryDesc, t_lev.level AS inventoryLevel 
                FROM
                    marketplace_inventory AS mar_inv 
                    JOIN
                        tool_instance AS t_ins 
                        ON t_ins.idToolInstance = mar_inv.idToolInstance 
                    JOIN
                        tool_level AS t_lev 
                        ON t_lev.idToolLevel = t_ins.idToolLevel 
                    JOIN
                        tool AS t 
                        ON t.idTool = t_ins.idTool 
                    JOIN
                        (
                            SELECT
                                t_ins.idTool, t_lev.level,
                                MIN(mar_inv.price) AS minToolPrice 
                            FROM
                                marketplace_inventory AS mar_inv 
                                JOIN
                                    tool_instance AS t_ins 
                                    ON t_ins.idToolInstance = mar_inv.idToolInstance 
                                JOIN
                                    tool_level AS t_lev 
                                    ON t_lev.idToolLevel = t_ins.idToolLevel 
                            WHERE
                                mar_inv.status = 1 AND mar_inv.inventoryType = 'tool' AND mar_inv.endingTime > CURRENT_TIMESTAMP AND owner <> ?
                            GROUP BY
                                t_ins.idTool, t_lev.level
                        )
                        AS minToolTable 
                        ON minToolTable.idTool = t_ins.idTool 
                        AND minToolTable.level = t_lev.level 
                        AND mar_inv.price = minToolTable.minToolPrice 
                WHERE
                    mar_inv.inventoryType = 'tool' AND mar_inv.endingTime > CURRENT_TIMESTAMP AND mar_inv.status = 1 AND owner <> ?
                ORDER BY
                    inventoryType ASC,
                    inventoryName ASC,
                    inventoryId ASC
            `
            mysql.query(sql, [address, address, address, address, address, address], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`MarketInventoryQueries.getCheapestInventories END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getAllListingGivenType(limit, offset, element, type, status) {
        logger.info('getAllListingGivenType start');
        return new Promise((resolve, reject) => {
            // let sql = "SELECT * FROM marketplace_inventory WHERE endingTime > current_timestamp AND status = 1 AND type = ? order by price asc LIMIT ? OFFSET ?";  
            /*let sql = `UPDATE marketplace_inventory SET status = 0 WHERE endingTime < current_timestamp AND status = 1;
            SELECT * 
            FROM marketplace_inventory 
            WHERE status = 1 
            AND type = ? 
            order by price asc 
            LIMIT ? OFFSET ?;
            SELECT count(*) as counter FROM marketplace_inventory WHERE status = 1 AND type = ?`; 
            */

            let orderBy = 'price asc';
            if (status == 2) orderBy = 'saleTime desc'

            //TODO rimuovere prima query inutile
            let sql = `SELECT * FROM upgrade;
            SELECT * 
            FROM marketplace_inventory 
            WHERE status = ?
            AND type = ? 
            AND endingTime > current_timestamp
            order by ${orderBy}  
            LIMIT ? OFFSET ?;
            SELECT count(*) as counter FROM marketplace_inventory WHERE status = 1 AND type = ?`;

            mysql.query(sql, [status, type, limit, offset, type], (err, rows, fields) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    console.log("null error in getAllListing: ", address, limit, offset);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async getTotalListing(address, type, id, level) {
        logger.info('getTotalListing queries start');

        return new Promise((resolve, reject) => {
            let sql;
            let params;

            if (type == 'item') {
                sql = `
                SELECT marketplace_inventory.*,
                item.name as itemName, item.image as itemImage
                FROM marketplace_inventory
                LEFT JOIN item ON marketplace_inventory.idItem = item.idItem
                WHERE item.idItem = ?
                AND status = 1
                AND endingTime > current_timestamp
                AND toShow = 1
                AND owner <> ?
                Order by price asc, totalPrice desc`;

                params = [id, address];
            }
            else if (type == 'tool') {
                sql = `
                SELECT marketplace_inventory.*,
                tool.name as toolName, tool.image as toolImage, tool_level.level as toolLevel
                FROM marketplace_inventory
                LEFT JOIN tool_instance ON marketplace_inventory.idToolInstance = tool_instance.idToolInstance 
                LEFT JOIN tool ON tool_instance.idTool = tool.idTool
                LEFT JOIN tool_level ON tool_level.idToolLevel = tool_instance.idToolLevel
                WHERE tool.idTool = ?
                AND tool_level.level = ?
                AND status = 1
                AND endingTime > current_timestamp
                AND toShow = 1
                AND owner <> ?
                Order by price asc, totalPrice desc`;

                params = [id, level, address];
            }
            else if (type == 'recipe') {
                sql = `
                SELECT marketplace_inventory.*,
                recipe.name as recipeName, recipe.image as recipeImage
                FROM marketplace_inventory
                LEFT JOIN recipe ON marketplace_inventory.idRecipe= recipe.idRecipe
                WHERE recipe.idRecipe = ?
                AND status = 1
                AND endingTime > current_timestamp
                AND toShow = 1
                AND owner <> ?
                Order by price asc, totalPrice desc`;

                params = [id, address];
            }
            else if (type == 'resource') {
                sql = `
                SELECT * FROM marketplace
                WHERE type = ?
                AND status = 1
                AND endingTime > current_timestamp
                AND toShow = 1
                AND owner <> ?
                Order by price asc, totalPrice desc`;

                params = [id, address];
            }

            mysql.query(sql, params, (err, rows, fields) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    console.log("null error: ", address);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async getAllListing(limit, offset, status, inventoryType, name) {
        return new Promise((resolve, reject) => {
            let sql;
            let params;
            let likename;

            let orderBy = 'price asc';
            if (status == 2) orderBy = 'saleTime desc'

            if (
                inventoryType == undefined &&
                name == undefined
            ) {
                sql = ` 
                SELECT marketplace_inventory.*,
                item.name as itemName, item.image as itemImage,
                recipe.name as recipeName, recipe.image as recipeImage,
                tool.name as toolName, tool.image as toolImage, tool_level.level as toolLevel
                FROM marketplace_inventory
                LEFT JOIN item ON marketplace_inventory.idItem = item.idItem
                LEFT JOIN recipe ON marketplace_inventory.idRecipe= recipe.idRecipe
                LEFT JOIN tool_instance ON marketplace_inventory.idToolInstance = tool_instance.idToolInstance 
                LEFT JOIN tool ON tool_instance.idTool = tool.idTool
                LEFT JOIN tool_level ON tool_level.idToolLevel = tool_instance.idToolLevel
                WHERE status = ?
                AND endingTime > current_timestamp
                order by ${orderBy} 
                LIMIT ? OFFSET ?;
                SELECT count(*) as counter FROM marketplace_inventory WHERE status = 1`;

                params = [status, limit, offset];
            } else if (
                inventoryType != undefined &&
                name == undefined
            ) {
                sql = `
                SELECT marketplace_inventory.*,
                item.name as itemName, item.image as itemImage,
                recipe.name as recipeName, recipe.image as recipeImage,
                tool.name as toolName, tool.image as toolImage, tool_level.level as toolLevel
                FROM marketplace_inventory
                LEFT JOIN item ON marketplace_inventory.idItem = item.idItem
                LEFT JOIN recipe ON marketplace_inventory.idRecipe= recipe.idRecipe
                LEFT JOIN tool_instance ON marketplace_inventory.idToolInstance = tool_instance.idToolInstance 
                LEFT JOIN tool ON tool_instance.idTool = tool.idTool
                LEFT JOIN tool_level ON tool_level.idToolLevel = tool_instance.idToolLevel
                WHERE status = ?
                AND inventoryType = ? 
                AND endingTime > current_timestamp
                order by ${orderBy}  
                LIMIT ? OFFSET ?;
                SELECT count(*) as counter FROM marketplace_inventory WHERE status = 1 AND inventoryType = ?`;

                params = [status, inventoryType, limit, offset, inventoryType];
            } else if (
                inventoryType == undefined &&
                name != undefined
            ) {
                sql = `
                SELECT marketplace_inventory.*,
                item.name as itemName, item.image as itemImage,
                recipe.name as recipeName, recipe.image as recipeImage,
                tool.name as toolName, tool.image as toolImage, tool_level.level as toolLevel
                FROM marketplace_inventory
                LEFT JOIN item ON marketplace_inventory.idItem = item.idItem
                LEFT JOIN recipe ON marketplace_inventory.idRecipe= recipe.idRecipe
                LEFT JOIN tool_instance ON marketplace_inventory.idToolInstance = tool_instance.idToolInstance 
                LEFT JOIN tool ON tool_instance.idTool = tool.idTool
                LEFT JOIN tool_level ON tool_level.idToolLevel = tool_instance.idToolLevel
                WHERE status = ?
                AND (recipe.name like ? OR item.name like ?)
                AND endingTime > current_timestamp
                order by ${orderBy} 
                LIMIT ? OFFSET ?;

                SELECT count(*) as counter 
                FROM marketplace_inventory
                LEFT JOIN item ON marketplace_inventory.idItem = item.idItem
                LEFT JOIN recipe ON marketplace_inventory.idRecipe= recipe.idRecipe
                WHERE status = 1 
                AND (recipe.name like ? OR item.name like ?)`;

                likename = `%${name}%`;
                params = [status, likename, likename, limit, offset, likename, likename];

            } else if (
                inventoryType != undefined &&
                name != undefined
            ) {
                sql = `
                SELECT marketplace_inventory.*,
                item.name as itemName, item.image as itemImage,
                recipe.name as recipeName, recipe.image as recipeImage,
                tool.name as toolName, tool.image as toolImage, tool_level.level as toolLevel
                FROM marketplace_inventory
                LEFT JOIN item ON marketplace_inventory.idItem = item.idItem
                LEFT JOIN recipe ON marketplace_inventory.idRecipe= recipe.idRecipe
                LEFT JOIN tool_instance ON marketplace_inventory.idToolInstance = tool_instance.idToolInstance 
                LEFT JOIN tool ON tool_instance.idTool = tool.idTool
                LEFT JOIN tool_level ON tool_level.idToolLevel = tool_instance.idToolLevel
                WHERE status = ?
                AND inventoryType = ? 
                AND (recipe.name like ? OR item.name like ?)
                AND endingTime > current_timestamp
                order by ${orderBy} 
                LIMIT ? OFFSET ?;

                SELECT count(*) as counter 
                FROM marketplace_inventory
                LEFT JOIN item ON marketplace_inventory.idItem = item.idItem
                LEFT JOIN recipe ON marketplace_inventory.idRecipe= recipe.idRecipe
                WHERE status = 1 
                AND inventoryType = ?
                AND (recipe.name like ? OR item.name like ?)`;

                likename = `%${name}%`;
                params = [status, inventoryType, likename, likename, limit, offset, inventoryType, likename, likename]
            }

            mysql.query(sql, params, (err, rows, fields) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    console.log("null error in getAllListing: ", address, limit, offset);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async getPersonalHistory(address, limit, offset, inventoryType, name) {
        logger.info('getPersonalHistory start');
        return new Promise((resolve, reject) => {

            let sql;
            let params;
            let likename;

            if (
                inventoryType == undefined &&
                name == undefined
            ) {
                sql = `SELECT marketplace_inventory.*,
                item.name as itemName, item.image as itemImage,
                recipe.name as recipeName, recipe.image as recipeImage,
                tool.name as toolName, tool.image as toolImage, tool_level.level as toolLevel
                FROM marketplace_inventory
                LEFT JOIN item ON marketplace_inventory.idItem = item.idItem
                LEFT JOIN recipe ON marketplace_inventory.idRecipe= recipe.idRecipe
                LEFT JOIN tool_instance ON marketplace_inventory.idToolInstance = tool_instance.idToolInstance 
                LEFT JOIN tool ON tool_instance.idTool = tool.idTool
                LEFT JOIN tool_level ON tool_level.idToolLevel = tool_instance.idToolLevel
                WHERE buyer = ?
                AND status = 2
                order by saleTime desc 
                LIMIT ? OFFSET ?;

                SELECT count(*) as counter 
                FROM marketplace_inventory
                WHERE buyer = ? 
                AND status = 2`

                params = [address, limit, offset, address];
            } else if (
                inventoryType != undefined &&
                name == undefined
            ) {

                sql = `SELECT marketplace_inventory.*,
                item.name as itemName, item.image as itemImage,
                recipe.name as recipeName, recipe.image as recipeImage,
                tool.name as toolName, tool.image as toolImage, tool_level.level as toolLevel
                FROM marketplace_inventory
                LEFT JOIN item ON marketplace_inventory.idItem = item.idItem
                LEFT JOIN recipe ON marketplace_inventory.idRecipe= recipe.idRecipe
                LEFT JOIN tool_instance ON marketplace_inventory.idToolInstance = tool_instance.idToolInstance 
                LEFT JOIN tool ON tool_instance.idTool = tool.idTool
                LEFT JOIN tool_level ON tool_level.idToolLevel = tool_instance.idToolLevel
                WHERE buyer = ?
                AND status = 2
                AND inventoryType = ?
                order by saleTime desc 
                LIMIT ? OFFSET ?;

                SELECT count(*) as counter 
                FROM marketplace_inventory
                WHERE buyer = ? 
                AND status = 2 
                AND inventoryType = ?`;


                params = [address, inventoryType, limit, offset, address, inventoryType];
            } else if (
                inventoryType == undefined &&
                name != undefined
            ) {
                sql = `SELECT marketplace_inventory.*,
                item.name as itemName, item.image as itemImage,
                recipe.name as recipeName, recipe.image as recipeImage,
                tool.name as toolName, tool.image as toolImage, tool_level.level as toolLevel
                FROM marketplace_inventory
                LEFT JOIN item ON marketplace_inventory.idItem = item.idItem
                LEFT JOIN recipe ON marketplace_inventory.idRecipe= recipe.idRecipe
                LEFT JOIN tool_instance ON marketplace_inventory.idToolInstance = tool_instance.idToolInstance 
                LEFT JOIN tool ON tool_instance.idTool = tool.idTool
                LEFT JOIN tool_level ON tool_level.idToolLevel = tool_instance.idToolLevel
                WHERE buyer = ?
                AND status = 2
                AND (recipe.name like ? OR item.name like ?)
                order by saleTime desc 
                LIMIT ? OFFSET ?;

                SELECT count(*) as counter 
                FROM marketplace_inventory
                LEFT JOIN item ON marketplace_inventory.idItem = item.idItem
                LEFT JOIN recipe ON marketplace_inventory.idRecipe= recipe.idRecipe
                WHERE buyer = ? 
                AND status = 2 
                AND (recipe.name like ? OR item.name like ?)`;

                likename = `%${name}%`;
                params = [address, likename, likename, limit, offset, address, likename, likename];

            } else if (
                inventoryType != undefined &&
                name != undefined
            ) {
                sql = `
                SELECT marketplace_inventory.*,
                item.name as itemName, item.image as itemImage,
                recipe.name as recipeName, recipe.image as recipeImage,
                tool.name as toolName, tool.image as toolImage, tool_level.level as toolLevel
                FROM marketplace_inventory
                LEFT JOIN item ON marketplace_inventory.idItem = item.idItem
                LEFT JOIN recipe ON marketplace_inventory.idRecipe= recipe.idRecipe
                LEFT JOIN tool_instance ON marketplace_inventory.idToolInstance = tool_instance.idToolInstance 
                LEFT JOIN tool ON tool_instance.idTool = tool.idTool
                LEFT JOIN tool_level ON tool_level.idToolLevel = tool_instance.idToolLevel
                WHERE buyer = ?
                AND status = 2
                AND inventoryType = ?
                AND (recipe.name like ? OR item.name like ?)
                order by saleTime desc 
                LIMIT ? OFFSET ?;

                SELECT count(*) as counter 
                FROM marketplace_inventory
                LEFT JOIN item ON marketplace_inventory.idItem = item.idItem
                LEFT JOIN recipe ON marketplace_inventory.idRecipe= recipe.idRecipe
                WHERE buyer = ? 
                AND status = 2 
                AND inventoryType = ?
                AND (recipe.name like ? OR item.name like ?)`;

                likename = `%${name}%`;
                params = [address, inventoryType, likename, likename, limit, offset, address, inventoryType, likename, likename]
            }

            mysql.query(sql, params, (err, rows, fields) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    console.log("null error in getAllListing: ", address, limit, offset);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async getAccountListingGivenStatus(address, status) {
        logger.info('getAccountListingGivenStatus start');
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT marketplace_inventory.*,
            item.name as itemName, item.image as itemImage,
            recipe.name as recipeName, recipe.image as recipeImage
            FROM marketplace_inventory
            LEFT JOIN item ON marketplace_inventory.idItem = item.idItem
            LEFT JOIN recipe ON marketplace_inventory.idRecipe= recipe.idRecipe 
            WHERE owner = ? 
            AND toShow = 1 
            AND status = ? 
            order by idMarketplaceInventory desc`;  //limit ?

            mysql.query(sql, [address, status], (err, rows, fields) => {

                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    console.log("null error: ", address);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async getAccountListing(address) {
        logger.info('getAccountListing start');
        console.log("ADDRESS GETACCOUNT: ", address)
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT marketplace_inventory.*,
            item.name as itemName, item.image as itemImage,
            recipe.name as recipeName, recipe.image as recipeImage,
            tool.name as toolName, tool.image as toolImage, tool_level.level as toolLevel
            FROM marketplace_inventory
            LEFT JOIN item ON marketplace_inventory.idItem = item.idItem
            LEFT JOIN recipe ON marketplace_inventory.idRecipe= recipe.idRecipe
            LEFT JOIN tool_instance ON marketplace_inventory.idToolInstance = tool_instance.idToolInstance 
            LEFT JOIN tool ON tool_instance.idTool = tool.idTool
            LEFT JOIN tool_level ON tool_level.idToolLevel = tool_instance.idToolLevel
            WHERE owner = ?
            AND toShow = 1 
            order by status = 1 desc`;  //limit ?

            mysql.query(sql, address, (err, rows, fields) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    console.log("null error: ", address);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async removeAd(id, owner) {
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE marketplace_inventory 
            SET toShow = 0
            WHERE owner = ?
            AND status <> 1
            AND toShow = 1
            AND idMarketplaceInventory = ?`;

            mysql.query(sql, [owner, id], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    console.log("null error: ", address);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async updateAdStatus(id) {
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE marketplace_inventory
            SET status = 0 
            WHERE endingTime < current_timestamp 
            AND status = 1 
            AND idMarketplaceInventory = ?`;

            mysql.query(sql, id, (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    console.log("null error: ", address);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }



    static async getResources(address) {
        logger.info('getResources start');

        return new Promise((resolve, reject) => {
            let sql = "SELECT ancien, wood, stone FROM utente WHERE address = ?";

            mysql.query(sql, address, (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info('getResources end');
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }

    static async setAncien(address, newAncien) {
        logger.info(`setAncien start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET ancien = ? WHERE address = ?";

            mysql.query(sql, [newAncien, address], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`setAncien end`);
                    return resolve(rows);
                }
            });
        });
    }

    static async setWood(address, newWood) {
        logger.info(`srtWood start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET wood = ? WHERE address = ?";

            mysql.query(sql, [newWood, address], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`srtWood end`);
                    return resolve(rows);
                }
            });
        });
    }

    static async setStone(address, newStone) {
        logger.info(`setStone start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET stone = ? WHERE address = ?";

            mysql.query(sql, [newStone, address], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`setStone end`);
                    return resolve(rows);
                }
            });
        });
    }

    static async createAdItem(address, id, quantity, price, totalPrice, creationTime, endingTime) {
        logger.info('createAdItem start');
        return new Promise((resolve, reject) => {
            let sql = `LOCK TABLES marketplace_inventory write;
            INSERT INTO marketplace_inventory (owner, idItem, quantity, inventoryType, price, totalPrice, status, creationTime, endingTime) VALUES (?, ?, ?, 'item', ?, ?, 1, ?, ?);
            UNLOCK TABLES`

            mysql.query(sql, [address, id, quantity, price, totalPrice, creationTime, endingTime], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    console.log("null error: ", address);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info('createAdItem end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async createAdRecipe(address, id, quantity, price, totalPrice, creationTime, endingTime) {
        logger.info('createAdRecipe start');
        return new Promise((resolve, reject) => {
            let sql = `LOCK TABLES marketplace_inventory write;
            INSERT INTO marketplace_inventory (owner, idRecipe, quantity, inventoryType, price, totalPrice, status, creationTime, endingTime) VALUES (?, ?, ?, 'recipe', ?, ?, 1, ?, ?);
            UNLOCK TABLES ;`

            mysql.query(sql, [address, id, quantity, price, totalPrice, creationTime, endingTime], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    console.log("null error: ", address);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info('createAdRecipe end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async buyAdMarketplace(id, buyer) {
        logger.info(`buyAdMarketplace start`);
        return new Promise((resolve, reject) => {

            let sql = `
            
            UPDATE marketplace
            SET buyer = ?,
            status = 2,
            saleTime = CURRENT_TIMESTAMP()
            WHERE id = ?
            AND status = 1
            AND totalPrice <= (SELECT ancien FROM utente WHERE address = ?)
            AND endingTime > CURRENT_TIMESTAMP()
            AND owner <> ?;

            `;

            mysql.query(sql, [buyer, id, buyer, buyer], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    // logger.error(`query error: ${err}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`buyAdMarketplace end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async buyAd(id, buyer) {
        logger.info(`buyAd start`);
        return new Promise((resolve, reject) => {
            // let sql = `UPDATE marketplace_inventory
            // SET buyer = CASE WHEN (owner <> ?) AND (status = 1) AND (totalPrice <= (SELECT ancien FROM utente WHERE address = ?)) AND endingTime > CURRENT_TIMESTAMP() THEN ? ELSE null END,
            // status = CASE WHEN (owner <> ?) AND (status = 1) AND (totalPrice <= (SELECT ancien FROM utente WHERE address = ?)) AND endingTime > CURRENT_TIMESTAMP() THEN 2 ELSE status END,
            // saleTime = CASE WHEN (owner <> ?) AND (totalPrice <= (SELECT ancien FROM utente WHERE address = ?)) AND endingTime > CURRENT_TIMESTAMP() THEN CURRENT_TIMESTAMP() ELSE null END
            // where idMarketplaceInventory = ?;`;

            //there is a little possible bug on money quantity if address send all money while buying doesn't spend money

            //If needed LOCK TABLES, remember to lock both marketplace_inventory and utente
            let sql = `
            

            UPDATE marketplace_inventory
            SET buyer = ?,
            status = 2,
            saleTime = CURRENT_TIMESTAMP()
            WHERE idMarketplaceInventory = ?
            AND status = 1
            AND totalPrice <= (SELECT ancien FROM utente WHERE address = ?)
            AND endingTime > CURRENT_TIMESTAMP()
            AND owner <> ?;

            `;

            mysql.query(sql, [buyer, id, buyer, buyer], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    // logger.error(`query error: ${err}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`buyAd end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async subAncien(address, ancien) {
        logger.info(`subAncien start`);
        logger.debug(`address: ${address}, ancien: ${ancien}`)

        return new Promise((resolve, reject) => {
            let sql = `UPDATE utente
            SET ancien = IF(ancien >= ?, ancien - ?, ancien)
            WHERE address = ?`;

            mysql.query(sql, [ancien, ancien, address], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`subAncien end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async addAncien(address, newAncien) {
        logger.info(`addAncien start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET ancien = ancien + ? WHERE address = ?";

            mysql.query(sql, [newAncien, address], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`addAncien end`);
                    return resolve(rows);
                }
            });
        });
    }

    static async addWood(address, newWood) {
        logger.info(`addWood start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET wood = wood + ? WHERE address = ?";

            mysql.query(sql, [newWood, address], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`addWood end`);
                    return resolve(rows);
                }
            });
        });
    }

    static async addStone(address, newStone) {
        logger.info(`addStone start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE utente SET stone = stone + ? WHERE address = ?";

            mysql.query(sql, [newStone, address], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`addStone end`);
                    return resolve(rows);
                }
            });
        });
    }

    static async getMarketplaceSingleListing(id, buyer) {
        logger.info('getMarketplaceSingleListing start');
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT * 
                FROM marketplace 
                WHERE id = ?
                AND status = 1
                AND endingTime > CURRENT_TIMESTAMP()
                AND owner <> ?
                AND toShow = 1`;

            mysql.query(sql, [id, buyer], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    console.log("null error: ", id);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info('getMarketplaceSingleListing end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async getMarketplaceInventorySingleListing(id, buyer) {
        logger.info('getMarketplaceInventorySingleListing start');
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT marketplace_inventory.*,
                item.name as itemName, item.image as itemImage,
                recipe.name as recipeName, recipe.image as recipeImage,
                tool.name as toolName, tool.image as toolImage, tool_level.level as toolLevel
                FROM marketplace_inventory
                LEFT JOIN item ON marketplace_inventory.idItem = item.idItem
                LEFT JOIN recipe ON marketplace_inventory.idRecipe= recipe.idRecipe
                LEFT JOIN tool_instance ON marketplace_inventory.idToolInstance = tool_instance.idToolInstance 
                LEFT JOIN tool ON tool_instance.idTool = tool.idTool
                LEFT JOIN tool_level ON tool_level.idToolLevel = tool_instance.idToolLevel
                WHERE idMarketplaceInventory = ?
                AND status = 1
                AND endingTime > CURRENT_TIMESTAMP()
                AND owner <> ?
                AND toShow = 1`;

            mysql.query(sql, [id, buyer], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    console.log("null error: ", id);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info('getMarketplaceInventorySingleListing end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async getSingleListing(id) {
        logger.info('getSingleListing start');
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM marketplace_inventory WHERE idMarketplaceInventory = ?";

            mysql.query(sql, id, (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    console.log("null error: ", id);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info('getSingleListing end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async cancelSingleAdStatus(id, deleteTime) {
        logger.info('cancelSingleAdStatus start');
        return new Promise((resolve, reject) => {
            let sql = "UPDATE marketplace_inventory SET status = 3, deleteTime = ? WHERE idMarketplaceInventory = ?";

            mysql.query(sql, [deleteTime, id], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    console.log("null error: ", address);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info('cancelSingleAdStatus end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async createAdTool(address, id, quantity, price, totalPrice, creationTime, endingTime) {
        logger.info('createAdTool start');
        return new Promise((resolve, reject) => {
            let sql = `LOCK TABLES marketplace_inventory write;
            INSERT INTO marketplace_inventory (owner, idToolInstance, quantity, inventoryType, price, totalPrice, status, creationTime, endingTime) VALUES (?, ?, ?, 'tool', ?, ?, 1, ?, ?);
            UNLOCK TABLES`

            mysql.query(sql, [address, id, quantity, price, totalPrice, creationTime, endingTime], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    console.log("null error: ", address);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info('createAdTool end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

}
module.exports = { MarketInventoryQueries }