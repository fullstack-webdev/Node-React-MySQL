const mysql = require('../../config/databaseConfig');
const logger = require('../../logging/logger');
const {Utils} = require("../../utils/utils");

class ItemQueries{
    constructor() {}

    static async getItemInstanceAndItemByAddress(address){ //cambiare nome
        logger.info(`getItemInstanceByAddress start`);
        return new Promise((resolve, reject) => {
            /* let sql = `
            SELECT item_instance.id as instanceId, item_instance.quantity as instanceQuantity,
            item_instance.address as address, item.*, menu.*

            FROM item_instance INNER JOIN item ON item_instance.idItem = item.id JOIN menu ON item.idMenu = menu.id
            WHERE item_instance.address =  ?`; */
            let sql = `
                SELECT
                a.idItemInstance AS idItemInstance,
                a.idItem AS idItem,
                a.quantity,
                b.name,
                b.description,
                b.image,
                c.craft,
                c.view,
                c.send
            FROM item_instance AS a
            JOIN item AS b ON b.idItem = a.idItem
            JOIN menu AS c ON c.idMenu = b.idMenu
            WHERE a.address = ? AND a.quantity > 0`;

            /*
            SELECT a.idItemInstance AS instanceId, a.address AS address, a.quantity AS instanceQuantity,
             b.*, c.*

            FROM item_instance AS a INNER JOIN item AS b ON b.idItem = a.idItem JOIN menu AS c ON c.idMenu = b.idMenu
            WHERE a.address =  '0x3B2d8361c50197908D8A6135e83086335A8fd12B'
            */
            mysql.query(sql, address, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getItemInstanceByAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getMenuByIdItemInstance(idItemInstance) {
        logger.debug(`getMenuByIdItemInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    m.craft, m.view, m.send, m.sell
                FROM
                    item_instance AS i_ins
                    JOIN
                        item AS i
                        ON i.idItem = i_ins.idItem
                    JOIN
                        menu AS m
                        ON m.idMenu = i.idMenu
                WHERE
                    i_ins.idItemInstance = ?
                `

            mysql.query(sql, idItemInstance, (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getMenuByIdItemInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }

    static async getItemInstanceByAddress(address){
        logger.info(`getItemInstanceByAddress start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM item_instance
            WHERE item_instance.address = ?`;

            mysql.query(sql, address , (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getItemInstanceByAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getItemInstanceByAddressAndIdItem(address, idItem){
        logger.info(`getItemInstanceByAddressAndIdItem start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM item_instance
            WHERE item_instance.address = ?
            AND item_instance.idItem = ?`;

            mysql.query(sql, [address, idItem] , (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getItemInstanceByAddressAndIdItem end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async subItemByIdItemInstance(idItemInstance, quantity) {
        logger.info(`subItemByIdItemInstance start`);
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE
                item_instance
            SET
                quantity = IF(quantity >= ? , quantity - ? , quantity)
            WHERE
                idItemInstance = ?
            `;

            mysql.query(sql, [quantity, quantity, idItemInstance] , (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subItemByIdItemInstance end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getItemQuantityByAddressAndIdItem(address, idItem) {
        logger.info(`getItemQuantityByAddressAndIdItem start`);
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
                quantity
            FROM
                item_instance
            WHERE
                address = ?
            AND
                idItem = ?
            `;

            mysql.query(sql, [address, idItem] , (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getItemQuantityByAddressAndIdItem end`);
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }

    static async subItemByIdItemAndAddress(address, idItem, quantity) {
        logger.info(`subItemByIdItemAndAddress start`);
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE
                item_instance
            SET
                quantity = IF(quantity >= ? , quantity - ? , quantity)
            WHERE
                address = ?
            AND
                idItem = ?
            `;

            mysql.query(sql, [quantity, quantity, address, idItem] , (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`subItemByIdItemAndAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async addItemByIdItemAndAddress(address, idItem, quantity) {
        logger.info(`addItemByIdItemAndAddress start`);
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE
                item_instance
            SET
                quantity = quantity + ?
            WHERE
                idItem = ?
            AND
                address = ?
            ;`

            mysql.query(sql, [quantity, idItem, address] , (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`addItemByIdItemAndAddress end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async addItemByIdItemInstanceMarket(idItemInstance, quantity, idMarketplaceInventory) {
        logger.info(`addItemByIdItemInstanceMarket start`);
        return new Promise((resolve, reject) => {
            let sql = `
            LOCK TABLES item_instance write, marketplace_inventory write;
            UPDATE
                item_instance
            SET
                quantity = quantity + ?
            WHERE
                idItemInstance = ?
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

            mysql.query(sql, [quantity, idItemInstance, idMarketplaceInventory, idMarketplaceInventory] , (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`addItemByIdItemInstanceMarket end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getIdItemGivenIdItemInstance(address,idItemInstance){
        logger.info(`getIdItemGivenIdItemInstance start`);
        return new Promise((resolve, reject) => {

            let sql = `SELECT idItem FROM item_instance WHERE address = ? AND idItemInstance = ?`;

            mysql.query(sql, [address, idItemInstance], (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getIdItemGivenIdItemInstance end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getQuantityByIdRecipeInstance(idRecipeInstance) {
        logger.info(`getQuantityByIdRecipeInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    quantity
                FROM
                    recipe_instance
                WHERE
                    idRecipeInstance = ?
                `

            mysql.query(sql, idRecipeInstance, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.info(`getQuantityByIdRecipeInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getQuantityByIdItemInstance(idItemInstance) {
        logger.info(`getQuantityByIdItemInstance start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    quantity
                FROM
                    item_instance
                WHERE
                    idItemInstance = ?
            `;

            mysql.query(sql, idItemInstance, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getQuantityByIdItemInstance end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getQuantityByIdItemInstanceForSell(idItemInstance) {
        logger.info(`getQuantityByIdItemInstanceForSell start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    quantity
                FROM
                    item_instance
                WHERE
                    idItemInstance = ?
                AND
                    quantity > 0
            `;

            mysql.query(sql, idItemInstance, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return resolve([]);
                }else{
                    logger.info(`getQuantityByIdItemInstanceForSell end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }
    static async removeRecipeInstance(idRecipeInstance) {
        logger.info(`removeRecipeInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                DELETE FROM recipe_instance
                WHERE idRecipeInstance = ?
            `

            mysql.query(sql, idRecipeInstance, (err, rows) => {
                if(err) reject(err)
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                }else{
                    logger.info(`removeRecipeInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async removeItemInstance(idItemInstance) {
        logger.info(`removeItemInstance start`);
        return new Promise((resolve, reject) => {
            let sql = `
                DELETE FROM item_instance
                WHERE idItemInstance = ?
            `;

            mysql.query(sql, idItemInstance, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`removeItemInstance end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async getItemAndMenuGivenIdItem(idItem) {
        logger.info(`getItemGivenIdItem start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT * FROM item JOIN menu ON item.idMenu = menu.idMenu WHERE idItem = ?
            `;

            mysql.query(sql, idItem, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.info(`getItemGivenIdItem end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }


    static async getItemInfoFromDailyReward(){ //cambiare nome
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
                reward.quantity as quantity,
                info.name as name,
                info.description as description,
                info.image as image
            FROM daily_reward_drop as reward
            JOIN item AS info ON info.idItem = reward.idItem
            `;

            mysql.query(sql, (err, rows) => {
                if(err) reject(err);
                if(rows == undefined){
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);

                    return reject({
                        message: "undefined"
                    });
                }else{

                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });

    }
}

module.exports = { ItemQueries }
