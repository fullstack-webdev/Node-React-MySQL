const mysql = require('../config/databaseConfig');
const logger = require('../logging/logger');
const { Utils } = require('../utils/utils');
const { MAX_LEVELS } = require('../config/buildingLevel');
class BuildingsQueries {
    static async claimRemainingStore(address, buildingType, stored) {
        logger.debug('claimRemainingStore start');

        let sql = ``
        if (buildingType == 1) {
            sql = `UPDATE utente SET ancien = ancien + ? WHERE address = ?`;
        } else if (buildingType == 2) {
            sql = `UPDATE utente SET wood = wood + ? WHERE address = ?`;
        } else if (buildingType == 3) {
            sql = `UPDATE utente SET stone = stone + ? WHERE address = ?`;
        }
        let params = [stored, address];

        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows, fields) => {
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
                    logger.debug('claimRemainingStore end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }
    static async resetPassive(idPassive) {
        logger.debug('resetPassive start');
        return new Promise((resolve, reject) => {
            let sql = `
                DELETE FROM passive WHERE idPassive = ?
            `;

            mysql.query(sql, [idPassive], (err, rows, fields) => {
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
                    logger.debug('resetPassive end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }
    static async resetFishingTool(idToolInstance) {
        logger.debug('resetFishingTool start');
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE tool_instance SET equipped = 0, pkBuilding = NULL WHERE idToolInstance = ?
            `;

            mysql.query(sql, [idToolInstance], (err, rows, fields) => {
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
                    logger.debug('resetFishingTool end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }
    static async getBuildingInfo(address, buildingType, level) {
        logger.debug('getBuildingInfo start');
        return new Promise((resolve, reject) => {
            let sql = `
                select
                    *
                from
                    buildings b
                where
                    address = ?
                    and stake = 1
                    and type = ?
                    and level = ?
            `;

            mysql.query(sql, [address, buildingType, level], (err, rows, fields) => {
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
                    logger.debug('getBuildingInfo end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }
    static async doPrestige(address, buildingType, level, levelData) {
        logger.debug('doPrestige start');

        return new Promise((resolve, reject) => {
            let sql = `
                update
                    buildings
                set
                    level = 1,
                    lastClaim = current_timestamp,
                    lastClaimAction = current_timestamp,
                    lastClaimStored = 0, ` +
                    "`stored` = 0, " +`
                    capacity = ?,
                    dropQuantity = ?,
                    idToolInstance = null,
                    idPassive = null
                where
                    address = ?
                    and level = ?
                    and stake = 1
                    and type = ?
            `;

            mysql.query(sql, [levelData.newCapacity, levelData.newDropQuantity, address, level, buildingType], (err, rows, fields) => {
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
                    logger.debug('doPrestige end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }
    static async getPrestigeData(address, buildingType, level) {
        logger.debug('getPrestigeData start');
        return new Promise((resolve, reject) => {
            let sql = `
                select
                    pd.idItem,
                    pd.dropQuantity,
                    i.name,
                    i.image
                from
                    buildings b
                join prestige_drops pd on
                    pd.buildingType = ?
                    and pd.level = ?
                join item i on
                    i.idItem = pd.idItem
                where
                    b.address = ?
                    and b.level = ?
                    and b.stake = 1
                    and b.type = ?
            `;

            mysql.query(sql, [buildingType, level, address, level, buildingType], (err, rows, fields) => {
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
                    logger.debug('getPrestigeData end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async getNFTUpgradeRequirements(address, buildingType, buildingLevel) {
        logger.debug(`getNFTUpgradeRequirements START`);
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    up.ancien AS requiredAncien, up.wood AS requiredWood, up.stone AS requiredStone,
                    IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
                    i_ins.idItemInstance, i.name AS requiredItemName, i.image AS requiredItemImage,
                    IF(up.ancien > u.ancien, FALSE, TRUE) AS isAncienAllowed,
                    IF(up.wood > u.wood, FALSE, TRUE) AS isWoodAllowed,
                    IF(up.stone > u.stone, FALSE, TRUE) AS isStoneAllowed,
                    IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed 
                FROM
                    upgrade AS up 
                    JOIN
                        utente AS u 
                        ON u.address = ? 
                    LEFT JOIN
                        upgrade_building AS up_bud 
                        ON up_bud.type = ? 
                        AND up_bud.level = ? 
                    LEFT JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = up_bud.idItemRequirement 
                    LEFT JOIN
                        item_instance AS i_ins 
                        ON i_ins.address = ? 
                        AND i_ins.idItem = i_req.idItem 
                    LEFT JOIN
                        item AS i 
                        ON i.idItem = i_req.idItem 
                WHERE
                    up.type = ? AND up.level = ?
                `
            mysql.query(sql, [address, buildingType, buildingLevel, address, buildingType, buildingLevel], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.debug(`getNFTUpgradeRequirements END`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async testV2(address) {
        logger.debug('testV2 start');
        return new Promise((resolve, reject) => {
            let sql = 'call getAccountData(?)'

            mysql.query(sql, address, (err, rows, fields) => {
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
                    logger.debug('testV2 end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }


    static async updateLastClaimAction(nftId, type) {
        logger.debug('updateLastClaimAction start');
        return new Promise((resolve, reject) => {
            let sql = `
            UPDATE buildings
            SET lastClaimStored = lastClaimStored + COALESCE( 
                (SELECT * FROM (
                    SELECT timestampdiff(SECOND, lastClaimAction, current_timestamp) * (dropQuantity/3600)
                    FROM buildings 
                    WHERE idBuilding = ?
                    AND type = ?) AS temp )  , 0),
                    
            lastClaimAction = current_timestamp
            WHERE idBuilding = ?
            AND type = ?
            `;

            mysql.query(sql, [nftId, type, nftId, type], (err, rows, fields) => {
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
                    logger.debug('updateLastClaimAction end');
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }

            });
        });
    }

    static async getNFT(nftId, type) {
        logger.debug('getNFT start');
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM buildings WHERE idBuilding = ? AND type = ?";

            mysql.query(sql, [nftId, type], (err, rows, fields) => {
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
                    logger.debug('getNFT end');
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }

            });
        });
    }

    static async getUpdateModelByTypeAndLevel(type, level) {
        logger.debug('getUpdateModelByTypeAndLevel start');
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM upgrade WHERE type = ? AND level = ?";

            mysql.query(sql, [type, level], (err, rows, fields) => {
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
                    logger.debug('getUpdateModelByTypeAndLevel end');
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }

            });
        });
    }

    static async updateLevelAndCursed(id, level, dropQuantity, capacity) {
        logger.debug(`BuildingQueries.updateLevelAndCursed [START]`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE buildings SET level = ?, dropQuantity = ?, capacity = ?, cursed = true WHERE id = ?";
            mysql.query(sql, [level, dropQuantity, capacity, id], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`BuildingQueries.updateLevelAndCursed [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    //Verify the property of a Buiding
    static async verifyProperty(address, nftId, type) {
        logger.debug(`BuildingQueries.verifyProperty [START]`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM buildings WHERE address = ? AND idBuilding = ? AND TYPE = ?";
            mysql.query(sql, [address, nftId, type], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`BuildingQueries.verifyProperty [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    static async verifyPropertyAndStake(address, nftId, type) {
        logger.debug(`BuildingQueries verifyPropertyAndStake [START]`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM buildings WHERE address = ? AND idBuilding = ? AND TYPE = ? AND stake = 1";
            mysql.query(sql, [address, nftId, type], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`BuildingQueries verifyPropertyAndStake [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    static async getCursed(nftId, type) {
        logger.debug('getCursed start');
        return new Promise((resolve, reject) => {
            let sql = "SELECT cursed FROM buildings WHERE idBuilding = ? AND type = ?";

            mysql.query(sql, [nftId, type], (err, rows, fields) => {
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
                    logger.debug('getCursed end');
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }

            });
        });
    }

    static async getStakedBuildings() {
        logger.debug('getStakedBuildings start');
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM buildings WHERE stake = 1";

            mysql.query(sql, [nftId, type], (err, rows, fields) => {
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
                    logger.debug('getStakedBuildings end');
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }

            });
        });
    }

    static async resetExp() {
        logger.debug('resetExp start');
        return new Promise((resolve, reject) => {
            let sql = "UPDATE leaderboard SET experience = 0";

            mysql.query(sql, (err, rows) => {
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
                    logger.debug('resetExp end');
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }

            });
        });
    }

    static async ownsConsumableUpgradeNFT(address, consumable) {
        logger.debug(`ownsConsumableUpgradeNFT start`)
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
                    logger.debug(`ownsConsumableUpgradeNFT end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getUpgradeNFTConsumables(address) {
        logger.debug(`getUpgradeNFTConsumables start`)
        let sql = `
            SELECT
                i_con.idItemConsumable, i_con.quantity, i_con.effect AS description,
                i.name, i.image 
            FROM
                    item_consumable AS i_con 
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
                    logger.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`getUpgradeNFTConsumables end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    //get all the buildings owned by the address + add to every building instance its corresponding upgrade model
    static async buildingsOwnedWithModel(address) {
        logger.debug(`buildingsOwnedWithModel start`)
        let sql = `
            SELECT b.*,
            u.level as upgradeLevel, u.ancien, u.wood, u.stone,
            u.newCapacity, u.newDropQuantity, u.upgradeTime, u.upgradeImage, u.newDescription,
            u.newMoreInfo,

            u2.level as doubleUpgradeLevel, u2.ancien as doubleAncien, u2.wood as doubleWood, u2.stone as doubleStone,
            u2.newCapacity as doubleNewCapacity, u2.newDropQuantity as doubleNewDropQuantity,
            u2.upgradeTime as doubleUpgradeTime, u2.upgradeImage as doubleUpgradeImage, 
            u2.newDescription as doubleNewDescription, u2.newMoreInfo as doubleNewMoreInfo
            
            FROM
                buildings AS b 
            LEFT JOIN
                upgrade AS u 
            ON
                b.type = u.type AND (b.level) + 1 = u.level
            LEFT JOIN 
                upgrade AS u2
            ON
                b.type = u2.type AND (b.level) + 2 = u2.level
            WHERE
                b.address = ?
            ORDER BY b.stake desc, b.type asc
            `
        return new Promise((resolve, reject) => {
            mysql.query(sql, address, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`buildingsOwnedWithModel end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getLastClaim(id, type) {
        logger.debug("getLastClaim start");
        return new Promise((resolve, reject) => {
            let secondSql =
                "SELECT `stored`, lastClaim, dropQuantity, dropInterval, capacity FROM buildings WHERE idBuilding = ? AND type = ?";
            mysql.query(secondSql, [id, type], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug("getLastClaim end");
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }

    static async getBkNumberGivenBuildingId(nftId) {
        logger.debug(`getBkNumberGivenBuildingId start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT idSkin FROM inventario WHERE idBuilding = ?";
            mysql.query(sql, nftId, (err, rows) => {
                if (err) reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getBkNumberGivenBuildingId end`);
                    resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async retrieveUpgradeModel(type, level) {
        logger.debug(`retrieveUpgradeModel start`);
        let sql = `
            SELECT * FROM upgrade WHERE type = ? AND level = (? + 1)
            `
        return new Promise((resolve, reject) => {
            mysql.query(sql, type, level, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`retrieveUpgradeModel end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })

    }

    static async updateFirstLogin(building, lastClaim) {
        logger.debug(`updateFirstLogin start`);
        let sql = `
            UPDATE buildings SET upgradeFirstLogin = true, 
            upgradeStatus = false, 
            level = ?, description = ?, capacity = ?, dropQuantity = ?, 
            imageURL = ?, moreInfo = ?, lastClaim = ? WHERE id = ?
            `
        let params = [
            building.upgradeLevel,
            building.newDescription,
            building.newCapacity,
            building.newDropQuantity,
            building.upgradeImage,
            building.newMoreInfo,
            lastClaim,
            building.id
        ];

        return new Promise((resolve, reject) => {
            mysql.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`updateFirstLogin end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async modelForBuilding(type, level) {
        logger.debug(`modelForBuilding start`);
        let sql = `
            SELECT *
            FROM upgrade
            WHERE
                type = ? AND level = ?
            `
        return new Promise((resolve, reject) => {
            mysql.query(sql, [type, level], (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.info(`modelForBuilding end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async checkRequirementsUpgradeNFT(address, type, level, consumableIds) {
        logger.info(`checkRequirementsUpgradeNFT start`)
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT
                    up.ancien AS requiredAncien, up.wood AS requiredWood, up.stone AS requiredStone,
                    IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) AS requiredItemQuantity,
                    i_ins.idItemInstance,
                    IF(up.ancien > u.ancien, FALSE, TRUE) AS isAncienAllowed,
                    IF(up.wood > u.wood, FALSE, TRUE) AS isWoodAllowed,
                    IF(up.stone > u.stone, FALSE, TRUE) AS isStoneAllowed,
                    IF(IF(i_req.quantityItem IS NULL, 0, i_req.quantityItem) > IF(i_ins.quantity IS NULL, 0, i_ins.quantity), FALSE, TRUE) AS isItemAllowed,
                    u.ancien AS ancienBefore, u.wood AS woodBefore, u.stone AS stoneBefore,
                    i_ins.quantity AS itemBefore, i_ins.idItem AS idItemReq
                FROM
                    upgrade AS up 
                    JOIN
                        utente AS u 
                        ON u.address = ? 
                    LEFT JOIN
                        upgrade_building AS up_bud 
                        ON up_bud.type = ? 
                        AND up_bud.level = ? 
                    LEFT JOIN
                        item_requirements AS i_req 
                        ON i_req.idItemRequirement = up_bud.idItemRequirement 
                    LEFT JOIN
                        item_instance AS i_ins 
                        ON i_ins.address = ? 
                        AND i_ins.idItem = i_req.idItem 
                    LEFT JOIN
                        item AS i 
                        ON i.idItem = i_req.idItem 
                WHERE
                    up.type = ? AND up.level = ?
                `, params = [address, type, level, address, type, level]
            if (consumableIds.length > 0) {
                for (let i = 0; i < consumableIds.length; i++) {
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
                }
            }


            mysql.query(sql, params, (err, rows) => {
                if (err) reject(err)
                if (rows == undefined) {
                    logger.error(`query error: ${JSON.stringify(err)}`)
                    return reject({
                        message: "undefined"
                    })
                } else {
                    logger.info(`checkRequirementsUpgradeNFT end`)
                    return resolve(JSON.parse(JSON.stringify(rows)))
                }
            })
        })
    }

    static async getModelAndNFT(nftId, type) {
        logger.debug('getModelAndNFT start');
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
            FROM buildings
            JOIN upgrade 
            ON buildings.level = upgrade.level && buildings.type = upgrade.type
            WHERE buildings.idBuilding = ? AND buildings.type = ?`;

            mysql.query(sql, [nftId, type], (err, rows, fields) => {
                if (err) {
                    logger.error(`Query error: ${JSON.stringify(err)}`);
                    return reject(new Error(err.message));
                }
                if (rows == undefined || rows == null) {
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug('getModelAndNFT end');
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }

            });
        });
    }

    static async stakeFix(address, nftId, type) {
        logger.debug(`stakeFix [START]`);
        return new Promise((resolve, reject) => {
            let sql = `UPDATE buildings
            SET (stake,upgradeStatus,lastClaim,position) 
            VALUES (1,0,current_timestamp,
                SELECT max(position) + 1 FROM buildings WHERE address = ?)
                WHERE address = ? AND idBuildings = ? AND type = ?`;
            mysql.query(sql, [address, address, nftId, type], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`stakeFix [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    static async unstakeFix(address, nftId, type) {
        logger.debug(`unstakeFix [START]`);
        return new Promise((resolve, reject) => {
            let sql = `UPDATE buildings
            SET (stake,upgradeStatus,lastClaim,position,idToolInstance) 
            VALUES (0,0,current_timestamp,0,null)
            WHERE address = ? AND idBuildings = ? AND type = ?`;
            mysql.query(sql, [address, nftId, type], (err, rows) => {
                if (err) return reject(err);
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`unstakeFix [END]`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            })
        });
    }

    static async updateStoredResources(newStored, id, type, newLastClaim) {
        logger.debug('updateStoredResources start');
        return new Promise((resolve, reject) => {
            let sql =
                "UPDATE buildings SET `stored` = ?, lastClaim = ?, lastClaimAction = ? WHERE idBuilding = ? AND type = ?";

            mysql.query(sql, [newStored, newLastClaim, newLastClaim, id, type], (err, rows, fields) => {
                if (err) {
                    logger.error(`Query error: ${JSON.stringify(err)}`);
                    return reject(new Error(err.message));
                }
                if (rows == undefined || rows == null) {
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug('updateStoredResources end');
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }

            });
        });
    }

    static async getTownhallLevelStaked(address) {
        logger.debug(`getTownhallLevelStaked start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT level FROM buildings WHERE address = ? AND type = 1 AND stake = 1";

            mysql.query(sql, address, (err, rows, fields) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getTownhallLevelStaked end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async getBuildingsInUpgrade(address) {
        logger.debug(`getBuildingsInUpgrade start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM buildings WHERE address = ? AND upgradeStatus = 1";

            mysql.query(sql, address, (err, rows, fields) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined) {
                    logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getBuildingsInUpgrade end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async retrieveUpgradeResources(type, level) {
        logger.debug(`retrieveUpgradeResources start`);
        return new Promise((resolve, reject) => {
            let sql = "SELECT ancien, wood, stone FROM upgrade WHERE type = ? AND level = ?";

            mysql.query(sql, [type, level], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`retrieveUpgradeResources end`);
                    return resolve(JSON.parse(JSON.stringify(rows))[0]);
                }
            });
        });
    }

    static async getUpgradeTime(type, level) {
        logger.debug("getUpgradeTime start");
        return new Promise((resolve, reject) => {
            let sql = "SELECT upgradeTime FROM upgrade WHERE type = ? AND level = ?";

            mysql.query(sql, [type, level], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug("getUpgradeTime end");
                    return resolve(JSON.parse(JSON.stringify(rows))[0].upgradeTime);
                }
            });
        });
    }

    static async setUpgrade(nftId, type, endingTime) {
        logger.debug("setUpgrade start");
        return new Promise((resolve, reject) => {
            let sql = "UPDATE buildings SET endingTime = ?, upgradeStatus = true WHERE idBuilding = ? AND type = ? AND stake = 1";

            mysql.query(sql, [endingTime, nftId, type], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug("setUpgrade end");
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }
            });
        });
    }

    static async upgradeDone(nftId, type) {
        logger.debug(`upgradeDone start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE buildings SET upgradeFirstLogin = false WHERE idBuilding = ? AND type = ?";

            mysql.query(sql, [nftId, type], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`upgradeDone end`);
                    return resolve(rows);
                }
            });
        });
    }

    static async getStakedNFT(address) {
        return new Promise((resolve, reject) => {
            logger.debug(`getStakedNFT start`);
            let sql = `
            SELECT *
            FROM buildings
            WHERE address = ? AND stake = 1`;

            mysql.query(sql, address, (err, rows, fields) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    logger.error("null error in getStakedBuildings: ", address);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`getStakedNFT end`);
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async updatePosition(nftId, type, position) {
        logger.debug(`updatePosition start`);
        return new Promise((resolve, reject) => {
            let sql = "UPDATE buildings SET position = ? WHERE idBuilding = ? AND type = ?";

            mysql.query(sql, [position, nftId, type], (err, rows) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug(`updatePosition end`);
                    return resolve(rows);
                }
            });
        });
    }

    static async getResourcesAndNFT(address, nftId, type) {
        return new Promise((resolve, reject) => {
            let sql = `
            SELECT *
                    FROM buildings LEFT JOIN utente 
                    ON utente.address = buildings.address
                    WHERE buildings.address = ? AND buildings.idBuilding = ? AND buildings.type = ?`;

            mysql.query(sql, [address, nftId, type], (err, rows, fields) => {
                if (err) return reject(new Error(err.message));
                if (rows == undefined || rows == null) {
                    logger.error("null error in getStakedBuildings: ", address);

                    return reject({
                        message: "undefined"
                    });
                } else {
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }

    static async makeClaim(newLastClaim, nftId, type, stored, lastClaimStored) {
        logger.debug("makeClaim start");
        return new Promise((resolve, reject) => {
            let sql =
                "UPDATE buildings SET `stored` = ?, lastClaimStored = ?, lastClaim = ? WHERE idBuilding = ? AND type = ?";

            mysql.query(sql, [stored, lastClaimStored, newLastClaim, nftId, type], (err, rows) => {
                if (err) reject(new Error(err.message));
                if (rows == undefined) {
                    logger.error(`query error: ${Utils.printErrorLog(err)}`);
                    return reject({
                        message: "undefined"
                    });
                } else {
                    logger.debug("makeClaim end");
                    resolve(rows);
                }
            });
        });
    }

    static async getNFTProc(address, nftId, type){
        logger.debug('getNFTProc start');
        return new Promise((resolve, reject) => {
            let sql = 'call getNFT(?, ?, ?)';

            mysql.query(sql, [address, nftId, type], (err, rows, fields) => {
                if(err){ 
                    logger.error(`Query error: ${Utils.printErrorLog(err)}`);
                    return reject(new Error(err.message));
                }
                if(rows == undefined || rows == null){
                    //logger.error(`null error: ${address}`);
                    return reject({
                        message: "undefined"
                    });
                }else{
                    logger.debug('getNFTProc end');
                    return resolve(JSON.parse(JSON.stringify(rows)));
                }

            });
        });
    }


}

module.exports = { BuildingsQueries }