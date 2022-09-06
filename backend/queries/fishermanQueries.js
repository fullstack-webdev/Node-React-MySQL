const mysql = require('../config/databaseConfig');
const logger = require('../logging/logger');
const { Utils } = require("../utils/utils");

class FishermanQueries {
    static async checkIfValidPassiveBuilding(pkBuilding) {
        logger.debug(`checkIfValidPassiveBuilding START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    bud.level,
                    pas.idPassive,
                    pas.isPassive 
                FROM
                    buildings AS bud 
                    LEFT JOIN
                        passive AS pas 
                        ON pas.idPassive = bud.idPassive 
                WHERE
                    bud.id = ?
                `
            mysql.query(sql, [pkBuilding], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkIfValidPassiveBuilding END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0])
                }
            })
        })
    }
    static async checkFisherman(address) {
        logger.debug(`checkFisherman START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    bud.id AS idFisherman, bud.level, bud.stake, bud.upgradeStatus, bud.idToolInstance,
                    fs.fishingEndingTime,
                    IF ( t_ins.idToolInstance IS NULL, FALSE, TRUE) AS hasToolInstance, t.rarity,
                    IF ( fs.idFishing IS NOT NULL, TRUE, FALSE) AS nowFishing 
                FROM
                    buildings AS bud 
                    LEFT JOIN
                        tool_instance AS t_ins 
                        ON t_ins.idToolInstance = bud.idToolInstance 
                        AND t_ins.address = ? 
                    LEFT JOIN tool AS t
                        ON t.idTool = t_ins.idTool
                    LEFT JOIN
                        fishing AS fs 
                        ON (fs.idToolInstance = bud.idToolInstance OR fs.idFisherman = bud.id) 
                        AND status = 1 
                WHERE
                    bud.address = ? 
                    AND bud.type = 4
                ORDER BY
					stake DESC
                `
            mysql.query(sql, [address, address], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkFisherman END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async removeEquippedTool(idFisherman) {
        logger.debug(`removeEquippedTool START`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    buildings 
                SET
                    idToolInstance = NULL 
                WHERE
                    id = ?
                `
            mysql.query(sql, idFisherman, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`removeEquippedTool END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async isAlwaysSea(idSea) {
        logger.debug(`isAlwaysSea START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT always FROM sea WHERE idSea = ?
                `
            mysql.query(sql, [idSea], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`isAlwaysSea END`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].always)
                }
            })
        })
    }
    static async getSpecialRequirements(address, idSea) {
        logger.debug(`getSpecialRequirements START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    i_req.burn,
                    i_req.quantityItem AS quantity,
                    IF(i_ins.idItemInstance IS NULL, FALSE, TRUE) AS hasInstance,
                    i_ins.idItemInstance AS idInventoryInstance,
                    'item' AS type 
                FROM
                    sea_hidden_item_requirements AS sea_hir 
                    JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = sea_hir.idItemRequirement 
                    LEFT JOIN
                        item_instance AS i_ins 
                        ON i_ins.idItem = i_req.idItem 
                        AND i_ins.address = ? 
                        AND i_ins.quantity >= i_req.quantityItem 
                WHERE
                    sea_hir.idSea = ? 
                UNION
                SELECT
                    t_req.burn,
                    1 AS quantity,
                    IF(t_ins.idToolInstance IS NULL, FALSE, TRUE) AS hasInstance,
                    t_ins.idToolInstance AS idInventoryInstance,
                    'tool' AS type 
                FROM
                    sea_hidden_tool_requirements AS sea_htr 
                    JOIN
                        tool_requirements AS t_req 
                        ON t_req.idToolRequirement = sea_htr.idToolRequirement 
                    JOIN
                        tool_instance AS t_ins 
                        ON t_ins.idToolLevel = t_req.idToolLevel 
                        AND t_ins.address = ? 
                WHERE
                    sea_htr.idSea = ?
                `
            mysql.query(sql, [address, idSea, address, idSea], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getSpecialRequirements END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getAllowedSpecialSeas(address) {
        logger.debug(`getAllowedSpecialSeas START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    sea_hir.idSea AS id,
                    i_req.burn, i_req.quantityItem AS quantity,
                    i.name, i.description, i.image, 1 AS level,
                    i_ins.idItemInstance AS idInventoryInstance,
                    'item' AS type 
                FROM
                    sea_hidden_item_requirements AS sea_hir 
                    JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = sea_hir.idItemRequirement 
                    JOIN
                        item AS i 
                        ON i.idItem = i_req.idItem 
                    JOIN
                        item_instance AS i_ins 
                        ON i_ins.idItem = i_req.idItem 
                        AND i_ins.address = ? 
                        AND i_ins.quantity >= i_req.quantityItem 
                UNION
                SELECT
                    sea_htr.idSea AS id,
                    t_req.burn, 1 AS quantity,
                    t.name, t.description, t.image, t_lev.level,
                    t_ins.idToolInstance AS idInventoryInstance,
                    'tool' AS type 
                FROM
                    sea_hidden_tool_requirements AS sea_htr 
                    JOIN
                        tool_requirements AS t_req 
                        ON t_req.idToolRequirement = sea_htr.idToolRequirement 
                    JOIN
                        tool_level AS t_lev 
                        ON t_lev.idToolLevel = t_req.idToolLevel 
                    JOIN
                        tool AS t 
                        ON t.idTool = t_lev.idTool 
                    JOIN
                        tool_instance AS t_ins 
                        ON t_ins.idToolLevel = t_req.idToolLevel 
                        AND t_ins.equipped = TRUE 
                        AND t_ins.address = ?
                `
            mysql.query(sql, [address, address], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getAllowedSpecialSeas END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getSeas() {
        logger.debug(`getSeas START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                sea.idSea AS id, sea.always, sea.name AS title, sea.description, sea.rarityRequired,
                i.name AS itemName, i.description AS itemDescription, i.image AS itemImage, i.rarity AS itemRarity,
                'item' AS type
                FROM sea 
                
                JOIN sea_item AS s_i 
                ON s_i.idSea = sea.idSea 
                
                JOIN item AS i 
                ON i.idItem = s_i.idItem
                
                UNION 
                SELECT
                sea.idSea AS id, sea.always, sea.name AS title, sea.description, sea.rarityRequired,
                r.name AS itemName, r.description AS itemDescription, r.image AS itemImage, r.rarity AS itemRarity,
                'recipe' AS type
                
                FROM sea 
                
                JOIN sea_recipe AS s_r
                ON s_r.idSea = sea.idSea 
                
                JOIN recipe AS r 
                ON r.idRecipe = s_r.idRecipe
                
                ORDER BY id, itemRarity ASC, type ASC
                `
            mysql.query(sql, [], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getSeas END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getRods(address) {
        logger.debug(`getRods START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    t_ins.idToolInstance AS id, t_ins.equipped, t_ins.durability,
                    t_lev.level,
                    t.name, t.image, t.rarity,
                    IF(fs.idFishing IS NULL, FALSE, TRUE) AS isFishing,
                    fs.fishingEndingTime AS rodEndingTime 
                FROM
                    tool_instance AS t_ins 
                    JOIN
                        tool_level AS t_lev 
                        ON t_lev.idToolLevel = t_ins.idToolLevel 
                    JOIN
                        tool AS t 
                        ON t.idTool = t_ins.idTool 
                    LEFT JOIN
                        fishing AS fs 
                        ON fs.idToolInstance = t_ins.idToolInstance 
                        AND status = 1 
                WHERE
                    t_ins.address = ? 
                    AND t.type = 'rod'
                `
            mysql.query(sql, address, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getRods END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async unEquipRod(buildingId) {
        logger.debug(`unEquipRod START`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE buildings
                SET idToolInstance = NULL
                WHERE id = ?
                `
            mysql.query(sql, buildingId, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`unEquipRod END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async unEquipTool(idToolInstance) {
        logger.debug(`unEquipTool START`);
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE tool_instance
                SET equipped = FALSE, pkBuilding = NULL
                WHERE idToolInstance = ?
                `
            mysql.query(sql, idToolInstance, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`unEquipTool END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }














    static async getTool(address) {
        logger.debug(`getTool [START]`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM tool_instance JOIN tool_level ON tool_instance.idToolLevel = tool_level.idToolLevel JOIN tool ON tool_instance.idTool = tool.idTool WHERE address = ? AND type = ?";
            mysql.query(sql, [address, 'rod'], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getTool [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    static async getQueryFisherman(address) {
        logger.debug(`getQueryFisherman [START]`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM buildings WHERE type = 4 AND stake = 1 AND address = ?";
            mysql.query(sql, address, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getQueryFisherman [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    static async getQuerySea() {
        logger.debug(`getQuerySea [START]`);
        return new Promise((resolve, reject) => {
            let sql = `SELECT sea.*, item.name, item.image, item.rarity 
                FROM sea 
                JOIN sea_item ON sea.idSea = sea_item.idSea
                JOIN item ON sea_item.idItem = item.idItem`;
            mysql.query(sql, null, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getQuerySea [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    static async getQueryEquippedTool(address) {
        logger.debug(`getQueryEquippedTool [START]`);
        return new Promise((resolve, reject) => {
            let sql = `SELECT * 
                FROM   tool JOIN tool_instance on tool.idTool = tool_instance.idTool 
                WHERE  tool_instance.equipped = true AND tool.type = ? AND tool_instance.address = ?`;
            mysql.query(sql, ['rod', address], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getQueryEquippedTool [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    static async getQuerySeaItem() {
        logger.debug(`getQuerySeaItem [START]`);
        return new Promise((resolve, reject) => {
            let sql = `SELECT sea_item.idSea, item.name, item.image, item.rarity, item.description 
                FROM sea_item JOIN item ON sea_item.idItem = item.idItem`;
            mysql.query(sql, null, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getQuerySeaItem [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }


    static async getPassiveStatus(idFisherman) {
        logger.debug(`getPassiveStatus start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    isPassive 
                FROM
                    passive
                WHERE
                    pkBuilding = ?
                `;
            mysql.query(sql, idFisherman, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getPassiveStatus end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    static async verifyStakedFisherman(address) {
        logger.debug(`verifyStakedFisherman start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    bud.id, bud.idToolInstance,
                    t_ins.idToolLevel, t_ins.idTool 
                FROM
                    buildings AS bud 
                    JOIN
                        tool_instance AS t_ins 
                        ON t_ins.idToolInstance = bud.idToolInstance 
                WHERE
                    bud.type = 4 
                    AND bud.stake = 1 
                    AND bud.upgradeStatus = 0 
                    AND bud.address = ?
                `;
            mysql.query(sql, address, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`verifyStakedFisherman end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }
    static async checkBySeaTool(idSea, rodIdTool) {
        logger.debug(`checkBySeaTool start`)
        return new Promise((resolve, reject) => {
            /* let sql = `
                SELECT
                    idSeaTool 
                FROM
                    sea_tool 
                WHERE
                    idSea = ? 
                    AND idTool = ?
                ` */
            let sql = `
                SELECT
                    idSeaTool 
                FROM
                    sea_tool_requirements 
                WHERE
                    idSea = ? 
                    AND idTool = ?
                `
            mysql.query(sql, [idSea, rodIdTool], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkBySeaTool end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async checkUsingOfBuildingAndRod(idFisherman, rodIdInstance) {
        logger.debug(`checkUsingOfBuildingAndRod start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idFishing 
                FROM
                    fishing 
                WHERE
                    status = 1 
                    AND 
                    (
                        idFisherman = ? 
                        OR idToolInstance = ?
                    )
                    AND fishingEndingTime >= current_timestamp 
                `
            mysql.query(sql, [idFisherman, rodIdInstance], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkUsingOfBuildingAndRod end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getToolRarityGivenIdToolInstance(address, idToolInstance) {
        logger.debug(`getToolRarityGivenIdToolInstance start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    t.rarity 
                FROM
                    tool_instance AS t_ins 
                    JOIN
                        tool AS t 
                        ON t.idTool = t_ins.idTool 
                WHERE
                    idToolInstance = ? AND address = ?
                `;
            mysql.query(sql, [idToolInstance, address], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getToolRarityGivenIdToolInstance end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }
    static async getRarityGivenIdSea(idSea) {
        logger.debug(`getRarityGivenIdSea start`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    rarityRequired 
                FROM
                    sea 
                WHERE
                    idSea = ?
                `;
            mysql.query(sql, idSea, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getRarityGivenIdSea end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }
    static async getConsumableRequirements(address, consumableIds) {
        logger.debug(`getConsumableRequirements start`)
        let sql = '', params = []
        if (consumableIds[0] != null) {
            sql = `
                SELECT
                    i_con.idItemConsumable, i_con.quantity AS requiredItemQuantity,
                    i_ins.idItemInstance,
                    IF(IF(i_con.quantity IS NULL, 0, i_con.quantity) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed 
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
            params = [address, consumableIds[0]]
        }
        if (consumableIds[1] != null) {
            if (sql != '') {
                sql += `
                    UNION
                    `
            }
            sql += `
                SELECT
                    i_con.idItemConsumable, i_con.quantity AS requiredItemQuantity,
                    i_ins.idItemInstance,
                    IF(IF(i_con.quantity IS NULL, 0, i_con.quantity) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed 
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
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getConsumableRequirements end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getFishChance(idSea) {
        logger.debug(`getFishChance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    chanceItem, chanceRecipe 
                FROM
                    sea 
                WHERE
                    idSea = ?
                `
            mysql.query(sql, idSea, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getFishChance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async checkDurability(idToolInstance, checkAmount) {
        logger.debug(`checkDurability start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idToolInstance, durability 
                FROM
                    tool_instance 
                WHERE
                    idToolInstance = ? 
                    AND 
                        (durability >= ?
                        OR 
                        durability = -1)
                `
            mysql.query(sql, [idToolInstance, checkAmount], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkDurability end ${JSON.stringify(rows)}`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getDurability(idToolInstance) {
        logger.debug(`getDurability start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    durability 
                FROM
                    tool_instance 
                WHERE
                    idToolInstance = ?
                `
            mysql.query(sql, [idToolInstance], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getDurability end ${JSON.stringify(rows)}`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async reduceDurability(idToolInstance, reduceAmount) {
        logger.debug(`reduceDurability start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    tool_instance 
                SET
                    durability = IF(durability >= ?, durability - ?, durability) 
                WHERE
                    idToolInstance = ?
                `
            mysql.query(sql, [reduceAmount, reduceAmount, idToolInstance], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`reduceDurability end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getDurabilityByIdToolInstance(idToolInstance) {
        logger.debug(`getDurabilityByIdToolInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    durability 
                FROM
                    tool_instance 
                WHERE
                    idToolInstance = ?
                `
            mysql.query(sql, idToolInstance, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getDurabilityByIdToolInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async fishItems(idSea) {
        logger.debug(`fishItems start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    s_i.idItem, s_i.alpha, s_i.beta, s_i.maxDrop,
                    IF ( RAND(CURRENT_TIME) < s_i.itemProbability, TRUE, FALSE) AS fished,
                    i.name, i.image, i.rarity 
                FROM
                    sea_item AS s_i 
                    JOIN
                        item AS i 
                        ON i.idItem = s_i.idItem 
                WHERE
                    s_i.idSea = ?
                `
            mysql.query(sql, idSea, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`fishItems end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async fishableItems(idSea) {
        logger.debug(`fishItems start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    s_i.idItem, s_i.alpha, s_i.beta, s_i.maxDrop, s_i.itemProbability,
                    i.name, i.image, i.rarity 
                FROM
                    sea_item AS s_i 
                    JOIN
                        item AS i 
                        ON i.idItem = s_i.idItem 
                WHERE
                    s_i.idSea = ?
                ORDER BY 
                    s_i.itemProbability ASC
                `
            mysql.query(sql, idSea, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`fishItems end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async fishRecipes(idSea) {
        logger.debug(`fishRecipes start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    s_r.idRecipe, s_r.alpha, s_r.beta, s_r.maxDrop,
                    IF ( RAND(CURRENT_TIME) < s_r.recipeProbability, TRUE, FALSE) AS fished,
                    rec.name, rec.image,
                    t.rarity 
                FROM
                    sea_recipe AS s_r 
                    JOIN
                        recipe AS rec 
                        ON rec.idRecipe = s_r.idRecipe 
                    JOIN
                        tool AS t 
                        ON t.idTool = rec.idTool 
                WHERE
                    s_r.idSea = ?
                `
            mysql.query(sql, idSea, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${idSea}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`fishRecipes end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async fishableRecipes(idSea) {
        logger.debug(`fishRecipes start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    s_r.idRecipe, s_r.alpha, s_r.beta, s_r.maxDrop, s_r.recipeProbability,
                    rec.name, rec.image, rec.rarity
                FROM
                    sea_recipe AS s_r 
                    JOIN
                        recipe AS rec 
                        ON rec.idRecipe = s_r.idRecipe 
                WHERE
                    s_r.idSea = ?
                ORDER BY 
                    s_r.recipeProbability ASC
                `
            mysql.query(sql, idSea, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${idSea}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`fishRecipes end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async fishExp(idSea) {
        logger.debug(`fishExp start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    IF ( RAND(CURRENT_TIME) < probability, TRUE, FALSE) AS fished,
                    experience 
                FROM
                    sea_fish 
                WHERE
                    idSea = ?
                `
            mysql.query(sql, idSea, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`fishExp end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async fishableFishes(idSea) {
        logger.debug(`fishExp start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idSeaFish, name, image, rarity,
                    probability,
                    experience 
                FROM
                    sea_fish 
                WHERE
                    idSea = ?
                ORDER BY 
                    probability ASC
                `
            mysql.query(sql, idSea, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`fishExp end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async checkIfUserHasRecipe(address, idRecipe) {
        logger.debug(`checkIfUserHasRecipe start`)
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
                idRecipeInstance ,
                quantity
            FROM
                recipe_instance 
            WHERE
                address = ? 
                AND idRecipe = ?    
            `
            mysql.query(sql, [address, idRecipe], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkIfUserHasRecipe end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async createRecipeInstanceByAddressIdRecipeQuantity(address, idRecipe, quantity) {
        logger.debug(`createRecipeInstanceByAddressIdRecipeQuantity start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO
                    recipe_instance (address, idRecipe, quantity) 
                VALUES
                    (
                        ? , ?, ?
                    )
                `
            mysql.query(sql, [address, idRecipe, quantity], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`createRecipeInstanceByAddressIdRecipeQuantity end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async updateRecipeInstanceByIdRecipeInstance(idRecipeInstance, quantity) {
        logger.debug(`updateRecipeInstanceByIdRecipeInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    recipe_instance 
                SET
                    quantity = quantity + ? 
                WHERE
                    idRecipeInstance = ?
                `
            mysql.query(sql, [quantity, idRecipeInstance], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`updateRecipeInstanceByIdRecipeInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async checkIfUserHasItem(address, idItem) {
        logger.debug(`checkIfUserHasItem start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    idItemInstance,
                    quantity 
                FROM
                    item_instance 
                WHERE
                    address = ? 
                    AND idItem = ?    
            `
            mysql.query(sql, [address, idItem], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`checkIfUserHasItem end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async createItemInstanceByAddressIdItemQuantity(address, idItem, quantity) {
        logger.debug(`createItemInstanceByAddressIdItemQuantity start`)
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
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`createItemInstanceByAddressIdItemQuantity end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async updateItemInstanceByIdItemInstance(idItemInstance, quantity) {
        logger.debug(`updateItemInstanceByIdItemInstance start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    item_instance 
                SET
                    quantity = quantity + ? 
                WHERE
                    idItemInstance = ?
                `
            mysql.query(sql, [quantity, idItemInstance], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`updateItemInstanceByIdItemInstance end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async updateExpByAddress(address, fishedExp) {
        logger.debug(`updateExpByAddress start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    leaderboard 
                SET
                    experience = experience + ?,
                    experienceFisherman = experienceFisherman + ?
                WHERE
                    address = ?
                `
            mysql.query(sql, [fishedExp, fishedExp, address], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`updateExpByAddress end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async createExpByAddress(address, fishedExp) {
        logger.debug(`createExpByAddress start`)
        return new Promise((resolve, reject) => {
            let sql = `
                INSERT IGNORE INTO leaderboard 
                    (address, experience, experienceFisherman)
                VALUES
                    (?, ?, ?)
                `;

            mysql.query(sql, [address, fishedExp, fishedExp], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`createExpByAddress end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async updateExpFishermanByAddress(address, fishedExp) {
        logger.debug(`updateExpFishermanByAddress start`)
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE
                    leaderboard 
                SET
                    experienceFisherman = IF(experienceFisherman IS NULL, 0, experienceFisherman) + ? 
                WHERE
                    address = ?
                `
            mysql.query(sql, [fishedExp, address], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`updateExpFishermanByAddress end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getIdPassiveFishing() {
        logger.debug(`getIdPassiveFishing start`)
        return new Promise((resolve, reject) => {
            let sql = `SELECT IF(MAX(idPassiveFishing) IS NULL, 0, MAX(idPassiveFishing)) + 1 AS newIdPassiveFishing FROM fishing`
            mysql.query(sql, [], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getIdPassiveFishing end`)
                    return resolve(JSON.parse(JSON.stringify(rows))[0].newIdPassiveFishing)
                }
            })
        })
    }
    static async createPassiveFishing(type, address, idSea, id, quantity, idFisherman, idToolLevel, idToolInstance, idPassiveFishing, actionNumber, qtyBefore, qtyAfter, coolDown, idFish, quantityFish) {
        let now = new Date();
        let nowTime = now.getTime();
        let startingTime = (new Date(nowTime)).toISOString()
        let endingTime = (new Date(nowTime + (30 * 60 * 1000))).toISOString()

        // let endingTime = (new Date(nowTime + (actionNumber * coolDown * 60 * 1000))).toISOString()
        // let endingTime = (new Date(nowTime - 3600).toISOString())
        let sql, params
        if (type == 1) { // item
            sql = `
                INSERT INTO
                    fishing (idSea, idItem, quantityItem, fishingStartingTime, fishingEndingTime, status, address, idToolInstance, idToolLevel, idFisherman, idPassiveFishing, quantityBefore, quantityAfter, idFish, quantityFish) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
                `
            params = [idSea, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idFisherman, idPassiveFishing, qtyBefore, qtyAfter, idFish, quantityFish]
        } else if (type == 2) { // recipe
            sql = `
                INSERT INTO
                    fishing (idSea, idRecipe, quantityRecipe, fishingStartingTime, fishingEndingTime, status, address, idToolInstance, idToolLevel, idFisherman, idPassiveFishing, quantityBefore, quantityAfter, idFish, quantityFish) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
            `
            params = [idSea, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idFisherman, idPassiveFishing, qtyBefore, qtyAfter, idFish, quantityFish]
        } else if (type == 4) { // fish
            sql = `
                INSERT INTO
                    fishing (idSea, idFish, quantityFish, fishingStartingTime, fishingEndingTime, status, address, idToolInstance, idToolLevel, idFisherman, idPassiveFishing) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ? 
                    )
            `
            params = [idSea, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idFisherman, idPassiveFishing]
        }
        // else if ( type == 3 ) { // drop null
        //     sql = `
        //         INSERT INTO
        //             fishing (idSea, fishingStartingTime, fishingEndingTime, status, address, idToolInstance, idToolLevel, idFisherman, idPassiveFishing) 
        //         VALUES
        //             (
        //                 ?, ?, ?, 1, ?, ?, ?, ?, ? 
        //             )
        //     `
        //     params = [idSea, startingTime, endingTime, address, idToolInstance, idToolLevel, idFisherman, idPassiveFishing]
        // }
        logger.debug(`createPassiveFishing start`)
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`createPassiveFishing end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async createFishing(type, address, idSea, id, quantity, idFisherman, idToolLevel, idToolInstance, firstIdConsumable, secondIdConsumable, reduceCoolDown, noCoolDown, qtyBefore, qtyAfter, idFish, quantityFish) {
        let now = new Date();
        let nowTime = now.getTime();
        let startingTime = (new Date(nowTime)).toISOString()
        let endingTime = (new Date(nowTime + ((reduceCoolDown ? 30 * 0.8 : 30) * (noCoolDown ? 0 : 1) * 60 * 1000))).toISOString()
        // let endingTime = (new Date(nowTime - 3600).toISOString())
        let sql, params
        if (type == 1) { // item
            sql = `
                INSERT INTO
                    fishing (idSea, idItem, quantityItem, fishingStartingTime, fishingEndingTime, status, address, idToolInstance, idToolLevel, idFisherman, firstIdConsumable, secondIdConsumable, quantityBefore, quantityAfter, idFish, quantityFish) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
                `
            params = [idSea, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idFisherman, firstIdConsumable, secondIdConsumable, qtyBefore, qtyAfter, idFish, quantityFish]
        } else if (type == 2) { // recipe
            sql = `
                INSERT INTO
                    fishing (idSea, idRecipe, quantityRecipe, fishingStartingTime, fishingEndingTime, status, address, idToolInstance, idToolLevel, idFisherman, firstIdConsumable, secondIdConsumable, quantityBefore, quantityAfter, idFish, quantityFish) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
            `
            params = [idSea, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idFisherman, firstIdConsumable, secondIdConsumable, qtyBefore, qtyAfter, idFish, quantityFish]
        }
        // else if ( type == 3 ) { // drop null
        //     sql = `
        //         INSERT INTO
        //             fishing (idSea, fishingStartingTime, fishingEndingTime, status, address, idToolInstance, idToolLevel, idFisherman, firstIdConsumable, secondIdConsumable) 
        //         VALUES
        //             (
        //                 ?, ?, ?, 1, ?, ?, ?, ?, ?, ?
        //             )
        //     `
        //     params = [idSea, startingTime, endingTime, address, idToolInstance, idToolLevel, idFisherman, firstIdConsumable, secondIdConsumable]
        // } 
        else if (type == 4) { // fish
            sql = `
                INSERT INTO
                    fishing (idSea, idFish, quantityFish, fishingStartingTime, fishingEndingTime, status, address, idToolInstance, idToolLevel, idFisherman, firstIdConsumable, secondIdConsumable) 
                VALUES
                    (
                        ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?
                    )
            `
            params = [idSea, id, quantity, startingTime, endingTime, address, idToolInstance, idToolLevel, idFisherman, firstIdConsumable, secondIdConsumable]
        }
        logger.debug(`createFishing start`)
        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`createFishing end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }
    static async getFishingEndingTime(address, idSea, idFisherman, rodIdInstance) {
        logger.debug(`getFishingEndingTime start`)
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    MAX(fishingEndingTime) AS time 
                FROM
                    fishing 
                WHERE
                    address = ? 
                    AND status = 1 
                    AND idFisherman = ? 
                    AND idToolInstance = ? 
                    AND idSea = ?
                `
            mysql.query(sql, [address, idFisherman, rodIdInstance, idSea], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getFishingEndingTime end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getFishingGivenIdBuilding(idBuilding) {
        logger.debug(`getFishingGivenFishermanId [START]`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM fishing WHERE status = 1 AND idFisherman = ? AND fishingEndingTime >= current_timestamp";
            mysql.query(sql, idBuilding, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getFishingGivenFishermanId [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }


    static async getFishingRodGivenidRod(idRod) {
        logger.debug(`getFishingRodGivenidRod start`)
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM fishing WHERE (idToolInstance = ? ) AND status = 1 AND fishingEndingTime >= current_timestamp`
            mysql.query(sql, idRod, (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getFishingRodGivenidRod end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async UpdateFishingStatus() {
        logger.debug(`UpdateFishingStatus [START]`);
        return new Promise((resolve, reject) => {
            let sql = `
                update
                    fishing
                set
                    status = 2,
                    fishingCompleteTime = fishingEndingTime
                where
                    status = 1
                    and fishingEndingTime <= current_timestamp
                `;

            mysql.query(sql, [], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`UpdateFishingStatus [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    // static async UpdateFishingStatus(idRod){
    //     logger.debug(`getFishingRodGivenidRod [START]`);
    //     return new Promise((resolve, reject) => {
    //         let sql = `UPDATE fishing SET fishingCompleteTime = CASE WHEN (fishingEndingTime <= current_timestamp) THEN fishingEndingTime ELSE fishingCompleteTime WHERE idToolInstance = ? , 
    //         SET status = CASE WHEN (fishingCompleteTime != NULL ) THEN 2 ELSE status WHERE idToolInstance = ? `
    //         mysql.query(sql, [idRod, idRod], (err, rows) => {
    //             if(err) return reject(err);
    //             if(rows == undefined){
    //                 logger.error(`null error`);
    //                 return reject({
    //                     message: "undefined"
    //                 });
    //             }else{
    //                 logger.debug(`getFishingRodGivenidRod [END]`);
    //                 return resolve(JSON.parse(JSON.stringify(rows)));
    //             }
    //         })
    //     });
    // }

    static async verifyOwnConsumablesFisherman(address, consumable) {
        let sql = `
        SELECT i_ins.quantity 
        FROM item_instance as i_ins
        JOIN item_consumable as i_con
        ON i_ins.idItem = i_con.idItem
        WHERE i_ins.address = ?
        AND idItemConsumable = ?
        `;

        return new Promise((resolve, reject) => {
            mysql.query(sql, [address, consumable], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`createFishing end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
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
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getBonuses END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }


}

module.exports = { FishermanQueries };