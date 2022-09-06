const logger = require("../logging/logger");
const Validator = require('../utils/validator');

const { BonusValidation } = require("../validations/bonusValidation");
const { BonusQueries } = require(`../queries/bonusQueries`);
const { BonusService } = require("../services/bonusService");

const { InventoryQueries } = require(`../queries/inventoryQueries`);
const { ItemQueries } = require(`../queries/inventory/itemQueries`);
const { Utils } = require("../utils/utils");


async function getEnchantingTable(req, res) {
    logger.info(`getEnchantingTable START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation
    validation = BonusValidation.getEnchantingTableValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address;

    //get tools owned by address
    let idToolInstances;
    try {
        idToolInstances = await BonusQueries.getIdToolInstances(address);
    } catch (error) {
        logger.error(`Error in BonusQueries getIdToolInstances: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    //logger.debug(`getIdToolInstances response: ${JSON.stringify(idToolInstances)}`)

    //get bonus infos on tools owned by address
    let toolsInfo;
    try {
        toolsInfo = await BonusQueries.getToolInfoAndBonus(address);
    } catch (error) {
        logger.error(`Error in BonusQueries getToolInfoAndBonus: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    //logger.debug(`getToolInfoAndBonus response: ${JSON.stringify(toolsInfo)}`)

    //get bonus consumables owned by address
    let consumables;
    try {
        consumables = await BonusQueries.getBonusConsumables(address);
    } catch (error) {
        logger.error(`Error in BonusQueries getBonusConsumables: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    //logger.debug(`getBonusConsumables response: ${JSON.stringify(consumables)}`)

    //build array of tools with relative infos and applied bonuses
    let toolsResponse = [];
    toolsResponse = BonusService.buildToolsResponse(idToolInstances, toolsInfo);
    logger.debug(`response toolsResponse : ${JSON.stringify(toolsResponse)} `);

    //build array of owned bonus consumables
    let consumablesResponse = [];
    consumablesResponse = BonusService.buildConsumablesResponse(consumables);
    logger.debug(`response consumablesResponse : ${JSON.stringify(consumablesResponse)} `);


    logger.info('getEnchantingTable END')
    return res
        .status(200)
        .json({
            success: true,
            data: {
                tools: toolsResponse,
                bonus_consumables: consumablesResponse
            }
        })
}

async function elevateBonus(req, res) {
    logger.info(`elevateBonus START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation
    validation = BonusValidation.elevateBonusValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address;
    let idToolInstance = req.body.idToolInstance;
    let idItemConsumableBonus = req.body.idItemConsumableBonus;

    //check if tool is owned by address and get its bonuses
    let checkTool;
    try {
        checkTool = await BonusQueries.getToolBonusGivenIdToolInstance(address, idToolInstance);
    } catch (error) {
        logger.error(`Error in BonusQueries getToolBonusGivenIdToolInstance: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (checkTool.length == 0) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "Address is not the owner of the tool || Tool does not exist"
                }
            });
    }
    if (checkTool[0].idBonus == null) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "Tool is not enchanted"
                }
            });
    }
    logger.debug(`verified: ${address} on idToolInstance: ${idToolInstance}`);
    logger.debug(`checkTool response: ${JSON.stringify(checkTool)}`);


    //check if consumable is owned by address, if quantity > 0 and if type is ELEVATE
    let checkConsumable;
    try {
        checkConsumable = await BonusQueries.getIdItemBonusGivenAddress(address, idItemConsumableBonus, 'ELEVATE');
    } catch (error) {
        logger.error(`Error in BonusQueries getIdItemBonusGivenAddress: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (checkConsumable.length != 1) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "Address does not own this consumable || Consumable is not suited for ELEVATE"
                }
            });
    }
    logger.debug(`verified: ${address} on idItemConsumableBonus: ${idItemConsumableBonus}`);
    logger.debug(`checkConsumable response: ${JSON.stringify(checkConsumable)}`);

    let effectOn = checkConsumable[0].effectOn;

    let idBonusArray = BonusService.getBonusInfoForIdToolInstance(checkTool, effectOn);
    logger.debug(`idBonusArray: ${JSON.stringify(idBonusArray)}`);
    if (idBonusArray.length < 2) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "Consumable is not suited for bonus TYPE || Not enough bonuses on the Tool"
                }
            });
    }

    //randomize -> bonus to update, bonus to downgrade
    let bonus = BonusService.randomizeElevate(idBonusArray);
    if (bonus == -1) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'The tiers are all maxed out, no bonus to upgrade'
                }
            })
    }

    //get UPGRADED idBonus and upgrade bonus instance
    let upgradeInfo;
    let upgrade = bonus.upgrade;
    try {
        upgradeInfo = await BonusQueries.getBonusGivenIdBonusCode(upgrade.idBonusCode, upgrade.tier + 1);
    } catch (error) {
        logger.error(`Error in BonusQueries getBonusGivenIdBonusCode: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`getBonusGivenIdBonusCode response: ${JSON.stringify(upgradeInfo)}`);
    try {
        await BonusQueries.updateBonusInstance(upgrade.idBonusInstance, upgradeInfo[0].idBonus);
    } catch (error) {
        logger.error(`Error in BonusQueries updateBonusInstance: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    //get DOWNGRADED idBonus and downgrade bonus instance (downgrade doesn't happen if all bonuses are min tier)
    let downgradeInfo;
    let downgrade = bonus.downgrade;
    if (downgrade != null) {

        try {
            downgradeInfo = await BonusQueries.getBonusGivenIdBonusCode(downgrade.idBonusCode, downgrade.tier - 1);
        } catch (error) {
            logger.error(`Error in BonusQueries getBonusGivenIdBonusCode: ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        logger.debug(`getBonusGivenIdBonusCode response: ${JSON.stringify(downgradeInfo)}`);
        try {
            await BonusQueries.updateBonusInstance(downgrade.idBonusInstance, downgradeInfo[0].idBonus);
        } catch (error) {
            logger.error(`Error in BonusQueries updateBonusInstance: ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
    }

    //update consumable instance in owner's inventory
    let updateConsumable;
    try {
        updateConsumable = await ItemQueries.subItemByIdItemAndAddress(address, checkConsumable[0].idItem, 1);
    } catch (error) {
        console.log(error)
        logger.error(`Error in ItemQueries subItemByIdItemAndAddress: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`subItemByIdItemAndAddress response : ${JSON.stringify(updateConsumable)}`);
    let action = 'edit';
    let qty = checkConsumable[0].consumableQty - 1;
    if (qty == 0) {
        action = 'remove';
        try {
            await ItemQueries.removeItemInstance(checkConsumable[0].idItemInstance);
        } catch (error) {
            logger.error(`Error in ItemQueries removeItemInstance: ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
    }
    upgradeInfo = upgradeInfo[0];
    if (downgradeInfo != null) {
        downgradeInfo = downgradeInfo[0];
    } else {
        downgradeInfo = null;
    }

    // let newBonuses = BonusService.buildElevateBonusesResponse(upgradeInfo, downgradeInfo);

    let toolInfo = {};
    try {
        toolInfo = await BonusService.getToolInfo(idToolInstance);
    } catch (error) {
        logger.error(`Error in BonusService getToolInfo: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info('elevateBonus END')
    return res
        .status(200)
        .json({
            success: true,
            data: {
                tool: toolInfo,
                inventory: {
                    action: action,
                    idItemConsumableBonus: idItemConsumableBonus,
                    remainingQuantity: qty
                }
            }
        })
}

async function enchantTool(req, res) {
    logger.info(`enchantTool START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation
    validation = BonusValidation.enchantToolValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address;
    let idToolInstance = req.body.idToolInstance;
    let idItemConsumableBonus = req.body.idItemConsumableBonus;

    //check if tool is owned by address and get information about bonuses
    let checkTool;
    try {
        checkTool = await BonusQueries.checkToolGetTypeAndBonuses(address, idToolInstance);
    } catch (error) {
        logger.error(`Error in BonusQueries checkToolGetTypeAndBonuses: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (checkTool.length == 0) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "Address is not the owner of the tool || Tool does not exist"
                }
            });
    }
    let toolType = checkTool[0].toolType;
    logger.debug(`verified: ${address} on idToolInstance: ${idToolInstance}, type: ${toolType}`);
    logger.debug(`checkTool response: ${JSON.stringify(checkTool)}`);


    //check if consumable is owned by address, if quantity > 0 and if type is ENCHANTMENT
    let checkConsumable;
    try {
        checkConsumable = await BonusQueries.getIdItemBonusGivenAddress(address, idItemConsumableBonus, 'ENCHANTMENT');
    } catch (error) {
        logger.error(`Error in BonusQueries getIdItemBonusGivenAddress: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (checkConsumable.length != 1) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "Address does not own this consumable || Consumable not suited for Enchantment"
                }
            });
    }
    logger.debug(`verified: ${address} on idItemConsumableBonus: ${idItemConsumableBonus}`);
    logger.debug(`checkConsumable response: ${JSON.stringify(checkConsumable)}`);


    let prefix = 0; let suffix = 0; let implicit = 0;
    let isEnchantable = {};
    //calculate applied bonuses
    for (let check of checkTool) {
        if (check.type == 'PREFIX') {
            prefix += 1;
        } else if (check.type == 'SUFFIX') {
            suffix += 1;
        } else if (check.type == 'IMPLICIT') {
            implicit += 1;
        }
    }

    //effectOn is an array of strings (prefix, suffix, implicit)
    let effectOn = checkConsumable[0].effectOn;
    effectOn = effectOn.split(",").map(element => element.trim());
    logger.debug(`effectOn response: ${JSON.stringify(effectOn)}`);

    isEnchantable = BonusService.setIsEnchantable(prefix, suffix, implicit);
    logger.debug(`setIsEnchantable response: ${JSON.stringify(isEnchantable)}`);

    effectOn = BonusService.setEffectOn(effectOn, isEnchantable);
    logger.debug(`effectOn response: ${JSON.stringify(effectOn)}`);

    //create pool of valid bonuses bonusArray (do not include bonuses that the tool already has)
    let bonusArray = [];
    for (let effect of effectOn) {
        let bonusObject = {};
        logger.debug(`effect response: ${JSON.stringify(effect)}`);
        try {
            bonusObject = await BonusQueries.getBonusesEnchantment(effect, toolType, checkTool);
        } catch (error) {
            logger.error(`Error in BonusQueries getBonusesEnchantment: ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        bonusArray.push(bonusObject);
        //logger.debug(`bonusObject response: ${JSON.stringify(bonusObject)}`);
    }
    bonusArray = bonusArray.flat();
    if (bonusArray.length < 1) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "There are no valid bonuses to enchant the tool || This consumable cannot enchant the tool more than this"
                }
            });
    }
    logger.debug(`bonusArray response: ${JSON.stringify(bonusArray)}`);

    //choose a random bonus from the pool
    let randomize = {};
    randomize = BonusService.randomizeEnchant(bonusArray);
    logger.debug(`randomize response: ${JSON.stringify(randomize)}`);

    let updateBonus;
    try {
        updateBonus = await BonusQueries.addBonusInstance(idToolInstance, randomize.idBonus, randomize.type);
    } catch (error) {
        logger.error(`Error in BonusQueries addBonusInstance: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`BonusQueries addBonusInstance response: ${JSON.stringify(updateBonus)}`);


    //update consumable instance in owner's inventory
    let updateConsumable;
    try {
        updateConsumable = await ItemQueries.subItemByIdItemAndAddress(address, checkConsumable[0].idItem, 1);
    } catch (error) {
        console.log(error)
        logger.error(`Error in ItemQueries subItemByIdItemAndAddress: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`subItemByIdItemAndAddress response : ${JSON.stringify(updateConsumable)}`);
    let action = 'edit';
    let qty = checkConsumable[0].consumableQty - 1;
    if (qty == 0) {
        action = 'remove';
        try {
            await ItemQueries.removeItemInstance(checkConsumable[0].idItemInstance);
        } catch (error) {
            logger.error(`Error in ItemQueries removeItemInstance: ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
    }

    // let newBonus = {};
    // newBonus = BonusService.buildEnchantToolResponse(randomize);

    let toolInfo = {};
    try {
        toolInfo = await BonusService.getToolInfo(idToolInstance);
    } catch (error) {
        logger.error(`Error in BonusService getToolInfo: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info('enchantTool END')
    return res
        .status(200)
        .json({
            success: true,
            data: {
                tool: toolInfo,
                inventory: {
                    action: action,
                    idItemConsumableBonus: idItemConsumableBonus,
                    remainingQuantity: qty
                }
            }

        })
}

async function rerollBonus(req, res) {
    logger.info(`rerollBonus START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation
    validation = BonusValidation.rerollBonusValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address;
    let idToolInstance = req.body.idToolInstance;
    let idItemConsumableBonus = req.body.idItemConsumableBonus;

    //check if tool is owned by address and get informations about bonuses
    let checkTool;
    try {
        checkTool = await BonusQueries.checkToolGetTypeAndBonuses(address, idToolInstance);
    } catch (error) {
        logger.error(`Error in BonusQueries checkToolGetTypeAndBonuses: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (checkTool.length == 0) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "Address is not the owner of the tool || Tool does not exist"
                }
            });
    }
    let toolType = checkTool[0].toolType;
    logger.debug(`verified: ${address} on idToolInstance: ${idToolInstance}, type: ${toolType}`);
    logger.debug(`checkTool response: ${JSON.stringify(checkTool)}`);


    //check if consumable is owned by address, if quantity > 0 and if type is REROLL
    let checkConsumable;
    try {
        checkConsumable = await BonusQueries.getIdItemBonusGivenAddress(address, idItemConsumableBonus, 'REROLL');
    } catch (error) {
        logger.error(`Error in BonusQueries getIdItemBonusGivenAddress: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (checkConsumable.length != 1) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "Address does not own this consumable || Consumable not suited for Reroll"
                }
            });
    }
    logger.debug(`verified: ${address} on idItemConsumableBonus: ${idItemConsumableBonus}`);
    logger.debug(`checkConsumable response: ${JSON.stringify(checkConsumable)}`);


    let prefix = 0; let suffix = 0; let implicit = 0;
    let isRollable = {};
    //calculate applied bonuses
    for (let check of checkTool) {
        if (check.type == 'PREFIX') {
            prefix += 1;
        } else if (check.type == 'SUFFIX') {
            suffix += 1;
        } else if (check.type == 'IMPLICIT') {
            implicit += 1;
        }
    }
    logger.debug(`prefix response: ${JSON.stringify(prefix)}, suffix response: ${JSON.stringify(suffix)}, implicit response: ${JSON.stringify(implicit)}`);

    //effectOn is an array of strings (prefix, suffix, implicit) taken from the consumable
    let effectOn = checkConsumable[0].effectOn;
    effectOn = effectOn.split(",").map(element => element.trim());
    logger.debug(`effectOn response: ${JSON.stringify(effectOn)}`);

    isRollable = BonusService.setIsRollable(prefix, suffix, implicit);
    logger.debug(`setIsRollable response: ${JSON.stringify(isRollable)}`);

    //real effectOn given consumable and existing tool bonuses
    effectOn = BonusService.setEffectOn(effectOn, isRollable);
    logger.debug(`effectOn response: ${JSON.stringify(effectOn)}`);

    //create pool of valid bonuses bonusArray (do not include bonuses that the tool already has)
    let bonusArray = [];
    for (let effect of effectOn) {
        let bonusObject = {};
        logger.debug(`effect response: ${JSON.stringify(effect)}`);
        try {
            bonusObject = await BonusQueries.getBonusesEnchantment(effect, toolType, checkTool);
        } catch (error) {
            logger.error(`Error in BonusQueries getBonusesEnchantment: ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        bonusArray.push(bonusObject);
        //logger.debug(`bonusObject response: ${JSON.stringify(bonusObject)}`);
    }
    bonusArray = bonusArray.flat();
    if (bonusArray.length < 1) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "There are no valid bonuses to enchant the tool || This consumable cannot reroll the existing bonuses"
                }
            });
    }
    //logger.debug(`bonusArray response: ${JSON.stringify(bonusArray)}`);

    //choose a random bonus from the pool
    let randomize = [];
    randomize = BonusService.randomizeReroll(bonusArray, implicit, prefix, suffix);
    logger.debug(`randomizeReroll response: ${JSON.stringify(randomize)}`);

    await BonusService.updateReroll(checkTool, randomize);

    //update consumable instance in owner's inventory
    let updateConsumable;
    try {
        updateConsumable = await ItemQueries.subItemByIdItemAndAddress(address, checkConsumable[0].idItem, 1);
    } catch (error) {
        console.log(error)
        logger.error(`Error in ItemQueries subItemByIdItemAndAddress: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`subItemByIdItemAndAddress response : ${JSON.stringify(updateConsumable)}`);
    let action = 'edit';
    let qty = checkConsumable[0].consumableQty - 1;
    if (qty == 0) {
        action = 'remove';
        try {
            await ItemQueries.removeItemInstance(checkConsumable[0].idItemInstance);
        } catch (error) {
            logger.error(`Error in ItemQueries removeItemInstance: ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
    }

    logger.info('rerollBonus END')
    // let newBonuses = BonusService.buildRerollBonusesResponse(randomImplicit, randomPrefix, randomSuffix);

    let toolInfo = {};
    try {
        toolInfo = await BonusService.getToolInfo(idToolInstance);
    } catch (error) {
        logger.error(`Error in BonusService getToolInfo: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    return res
        .status(200)
        .json({
            success: true,
            data: {
                tool: toolInfo,
                inventory: {
                    action: action,
                    idItemConsumableBonus: idItemConsumableBonus,
                    remainingQuantity: qty
                }
            }
        })
}


module.exports = { getEnchantingTable, elevateBonus, enchantTool, rerollBonus }
