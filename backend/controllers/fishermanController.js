//LOGGER
const logger = require("../logging/logger");

//VALIDATOR
const Validator = require('../utils/validator')

//BUILDING IMPORTS
const { BuildingService } = require(`../services/buildingService`);

//FISHERMAN IMPORTS
const { FishermanValidation } = require("../validations/fishermanValidation")
const { FishermanQueries } = require(`../queries/fishermanQueries`);
const { InventoryQueries } = require(`../queries/inventoryQueries`);
const { BuildingsQueries } = require(`../queries/buildingsQueries`);
const { FishermanService } = require("../services/fishermanService");
const { FishermanInterface } = require("../interfaces/JS/fishermanInterface");
const { InventoryService } = require("../services/inventory/inventoryService");
const { ToolService } = require('../services/inventory/toolService');

const { Utils } = require("../utils/utils");
const { PassiveService } = require("../services/passiveService");
const { PassiveQueries } = require("../queries/passiveQueries");
const { UserQueries } = require("../queries/userQueries");

const random = require("random");
const TYPE = 4;

// 1)aggiungere controllo che abbia un fisherman stakato, che non sia in upgrade e che non stia pescando altrimenti tutti i mari hanno isAllowed = false.
// Aggiungere messageNotAllowed in ogni sea specificando se: non stakato, in upgrade, pesca in corso, rarity non sufficiente.

// 2)nella response delle rods, per la rodEquipped dobbiamo vedere se esiste un record in fishing con status == 1 e idToolInstance = rodEquippedId e

// if il fishinfEndingTime è nel futuro(sta ancora pescando) allora isFishing = true e fishingEndingTime = fishing.fishingEndingTime

// else il fishinfEndingTime è nel passato(ha finito) allora set staus = 2, fishingCompleteTime = fishingEndingTime e ritorniamo al FE isFishing = false
async function getFisherman(req, res) {
    logger.info(`getFisherman START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let validation
    validation = FishermanValidation.getFishermanValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address

    let fishermanResponse
    try {
        fishermanResponse = await PassiveService.getFisherman(address)
    } catch (error) {
        logger.error(`Error in PassiveService.getFisherman: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info('getFisherman END')
    return res
        .status(200)
        .json({
            success: true,
            data: {
                fishermanResponse
            }
        })
}

async function changeRod(req, res) {
    logger.info(`changeRod START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let validation;
    validation = FishermanValidation.changeRodValidator(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }



    let address = req.locals.address;
    let idToolInstance = req.body.idToolInstance;
    let response, userTool, idToolLevel, check, idTool, nftId, actualEquippedRod, seas;

    try {
        userTool = await InventoryQueries.getToolInstance(address, idToolInstance);
    } catch (error) {
        logger.error(`Error in getFishermanFunction getTool: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (userTool.length == 0) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'You haven\'t got that rod'
                }
            })
    }

    idTool = userTool[0].idTool;
    idToolLevel = userTool[0].idToolLevel;

    try {
        response = await FishermanQueries.getQueryFisherman(address);
    } catch (error) {
        logger.error(`Error in FishermanQueries.getQueryFisherman: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.debug(`getQueryFisherman response : ${JSON.stringify(response)}`);

    if (response.length != 1) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'User does not have a fisherman staked'
                }
            })
    }

    nftId = response[0].idBuilding;
    actualEquippedRod = response[0].idToolInstance;

    if (actualEquippedRod == idToolInstance) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'Tool already equipped'
                }
            })
    }



    try {
        check = await InventoryService.verifyEquipable(address, nftId, TYPE, idTool);
    } catch (error) {
        logger.error(`
        Error in Inventory Service verifyEquipable: ${Utils.printErrorLog(error)}`
        );
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    if (!check) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'User does not have the requirements to equip the tool'
                }
            })
    }

    try {
        response = await InventoryService.setNewEquippedTool(nftId, TYPE, actualEquippedRod, idToolInstance);
    } catch (error) {
        logger.error(`Error in Inventory Service verifyEquipable: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    try {
        response = await FishermanService.changeRodBuilder(idToolInstance, address);
    } catch (error) {
        logger.error(`Error in FishermanService.changeRodBuilder: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    let result
    try {
        result = await FishermanService.getSeasWithFishermanAllowance(address)
    } catch (error) {
        logger.error(`Error in FishermanService.getSeasWithFishermanAllowance: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    seas = result.seas

    let equippedRodInstanceData
    try {
        equippedRodInstanceData = await InventoryService.getInventoryInstanceData(address, idToolInstance, 'tool')
    } catch (error) {
        logger.error(`Error in InventoryService.getInventoryInstanceData: ${JSON.stringify(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    let toolIds = []
    toolIds.push(equippedRodInstanceData.id)
    if (toolIds.length != 0) {
        toolIds = toolIds.join(', ')
        logger.info(`toolIds: ${toolIds}`)
        let toolBonuses
        try {
            toolBonuses = await ToolService.getToolBonuses(toolIds)
        } catch (error) {
            logger.error(`Error in ToolService.getToolBonuses: ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        logger.info(`toolBonuses response: ${JSON.stringify(toolBonuses)}`)

        equippedRodInstanceData.bonuses = toolBonuses[equippedRodInstanceData.id] ? toolBonuses[equippedRodInstanceData.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
    }

    // data for passiveFishing
    let pkBuilding
    try {
        pkBuilding = await PassiveQueries.getFishermanPkBuildingFromAddress(address)
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    try {
        pkBuilding = pkBuilding.id
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let passiveData
    try {
        passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let idPassiveFishingLureItem
    try {
        idPassiveFishingLureItem = await PassiveQueries.getPassiveConstant('idPassiveFishingLureItem')
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    let lureData
    try {
        lureData = await PassiveQueries.getItemInstanceData(address, idPassiveFishingLureItem)
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (lureData == undefined) {
        try {
            lureData = await PassiveQueries.getItemData(idPassiveFishingLureItem)
        } catch (error) {
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        lureData.quantity = 0
    }

    // check the max number of consecutive fishing actions (resource.ancien & rod.durability & passiveData.storedActions)
    let ancienCostPerEachFishingAction
    try {
        ancienCostPerEachFishingAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachFishingAction')
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let resources
    try {
        resources = await UserQueries.getResources(address)
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    let ancien = resources.ancien

    let rodDurability
    try {
        rodDurability = await PassiveQueries.getEquippedRodDurabilityFromPkBuilding(pkBuilding)
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    rodDurability = !rodDurability ? 0 : rodDurability

    let maxPerformableActions;

    if (passiveData == null || passiveData == undefined) maxPerformableActions = 0;
    else {
        maxPerformableActions = Math.min(passiveData.burntActions, passiveData.storedActions, Math.floor(rodDurability / 10))
    }

    logger.info(`changeRod END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                rod: response,
                seas,
                equippedRodInstanceData: equippedRodInstanceData,
                passiveInfo: {
                    maxPerformableActions: maxPerformableActions
                }
            }
        });
}

async function burnPassiveLure(req, res) {
    logger.info(`burnPassiveLure START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation = FishermanValidation.burnPassiveLureValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let burnLureCount = req.body.burnLureCount

    // data for passiveFishing
    let pkBuilding
    try {
        pkBuilding = await PassiveQueries.getFishermanPkBuildingFromAddress(address)
    } catch (error) {
        logger.error(`PassiveQueries.getFishermanPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    try {
        pkBuilding = pkBuilding.id
    } catch (error) {
        logger.error(`User is forcing API`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    // update passive status
    try {
        await PassiveService.updatePassiveStatus(pkBuilding)
    } catch (error) {
        logger.error(`PassiveService.updatePassiveStatus error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let response
    try {
        response = await FishermanService.burnPassiveLure(address, pkBuilding, burnLureCount)
    } catch (error) {
        logger.error(`Error in FishermanService.burnPassiveLure: ${Utils.printErrorLog(error)}}`)
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.debug(`burnPassiveLure response: ${JSON.stringify(response)}`)
    logger.info("burnPassiveLure END")

    return res
        .status(200)
        .json({
            success: true,
            data: response
        })
}

async function startPassiveFishing(req, res) {
    logger.info(`startPassiveFishing START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation = FishermanValidation.passiveFishValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let idSea = req.body.idSea
    let consumableIds = req.body.consumableIds
    let actionNumber = req.body.actionNumber

    let fisherman
    try {
        fisherman = await FishermanQueries.verifyStakedFisherman(address);
    } catch (error) {
        logger.error(`Error in FishermanQueries.verifyStakedFisherman : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (fisherman.length == 0) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'You must have a staked fisherman\'s hut that is not in upgrade'
                }
            })
    }

    let idFisherman = fisherman[0].id
    let rodIdToolLevel = fisherman[0].idToolLevel
    let rodIdTool = fisherman[0].idTool
    let rodIdInstance = fisherman[0].idToolInstance

    let usingCheck = true, usingCheckRes
    try {
        usingCheckRes = await FishermanQueries.checkUsingOfBuildingAndRod(idFisherman, rodIdInstance)
    } catch (error) {
        logger.error(`Error in FishermanQueries.checkUsingOfBuildingAndRod : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (usingCheckRes.length != 0) {
        usingCheck = false
    }
    if (!usingCheck) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'Fishing is already going on now.'
                }
            })
    }

    let rarityCheck
    try {
        rarityCheck = await FishermanService.checkRarityByRodSea(address, rodIdInstance, idSea)
    } catch (error) {
        logger.error(`Error in FishermanService.checkRarityByRodSea : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (!rarityCheck.pass) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: rarityCheck.error
                }
            })
    }

    let enableCheck = true, enableCheckRes
    try {
        enableCheckRes = await FishermanQueries.checkBySeaTool(idSea, rodIdTool)
    } catch (error) {
        logger.error(`Error in FishermanQueries.checkBySeaTool : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`enableCheckRes:${JSON.stringify(rodIdTool)}--${JSON.stringify(enableCheckRes)}`)
    if (enableCheckRes.length == 0) {
        enableCheck = false
    }
    if (!enableCheck) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'The current tool is not allowed to fish at the current sea.'
                }
            })
    }

    // data for passiveFishing
    let pkBuilding
    try {
        pkBuilding = await PassiveQueries.getFishermanPkBuildingFromAddress(address)
    } catch (error) {
        logger.error(`PassiveQueries.getFishermanPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    pkBuilding = pkBuilding.id

    // update passive status
    try {
        await PassiveService.updatePassiveStatus(pkBuilding)
    } catch (error) {
        logger.error(`PassiveService.updatePassiveStatus error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let allBonus
    try {
        allBonus = await FishermanQueries.getBonuses(rodIdInstance)
    } catch (error) {
        console.log(error);
        logger.error(`Error in FishermanService.fish : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`all bonuses:${JSON.stringify(allBonus)}`);
    // check performable
    let passiveData
    try {
        passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
    } catch (error) {
        logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (passiveData == undefined || !passiveData.isPassive) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'User didn\'t enable passive fishing mode'
                }
            })
    }

    // check performable by actionNumber
    let ancienCostPerEachFishingAction
    try {
        ancienCostPerEachFishingAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachFishingAction')
    } catch (error) {
        logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let resources
    try {
        resources = await UserQueries.getResources(address)
    } catch (error) {
        logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    let ancien = resources.ancien

    let rodDurability
    try {
        rodDurability = await PassiveQueries.getEquippedRodDurabilityFromPkBuilding(pkBuilding)
    } catch (error) {
        logger.error(`Error in PassiveQueries.getEquippedRodDurabilityFromPkBuilding: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    rodDurability = !rodDurability ? 0 : rodDurability

    let maxPerformableActions = Math.min(passiveData.burntActions, passiveData.storedActions, Math.floor(rodDurability / 10))
    if (maxPerformableActions != actionNumber) {
        return res
            .status(200)
            .json({
                success: false,
                error: {
                    errorMessage: 'Performable action count is wrong.'
                }
            })
    }

    maxPerformableActions = 0

    let storedActions = passiveData.storedActions - actionNumber
    let burntActions = passiveData.burntActions - actionNumber
    let costAncien = ancienCostPerEachFishingAction * actionNumber
    let result
    let totalFishedItems = [], totalFishedRecipes = [], totalFishedFishes = [], totalFishedExp = 0
    let lootForDurBonus = []

    let performActionNumber = actionNumber
    while (performActionNumber) {
        --performActionNumber

        let fishingRes
        try {
            fishingRes = await FishermanService.fish(address, idSea, consumableIds, allBonus)
        } catch (error) {
            console.log(error);
            logger.error(`Error in FishermanService.fish : ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        logger.debug(`fishingRes:${JSON.stringify(fishingRes)}`)

        let fishedItems = fishingRes.items
        totalFishedItems.push(...fishedItems)
        let fishedRecipes = fishingRes.recipes
        totalFishedRecipes.push(...fishedRecipes)
        let fishedFishes = fishingRes.fishes
        totalFishedFishes.push(...fishedFishes)
        let fishedExp = fishingRes.experience
        totalFishedExp += fishedExp
        let doubleLootDur = fishingRes.doubleLootDur
        lootForDurBonus.push(doubleLootDur)
    }


    // reduce rodDurability
    try {
        result = await FishermanQueries.getDurability(rodIdInstance)
    } catch (error) {
        logger.error(`Error in FishermanQueries.getDurability : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (result.durability != -1) { //-1 Means Infinite Durability
        let subDurability = 10
        var totalActions = actionNumber //used to modify the total count for LOOT_FOR_DURABILITY

        let durBonus = allBonus.find(x => x['bonusCode'] === 'LESS_DURABILITY');
        if (durBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(durBonus)}`)
            subDurability = subDurability - durBonus.flatBoost
        }

        let nodurBonus = allBonus.find(x => x['bonusCode'] === 'NO_DURABILITY');
        if (nodurBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(nodurBonus)}`);
            for (let i = 0; i < actionNumber; i++) {
                if (random.int(0, 99) < nodurBonus.percentageBoost) {
                    totalActions--
                }
            }
        }

        let doubleLootBonus = allBonus.find(x => x['bonusCode'] === 'LOOT_FOR_DURABILITY');
        if (doubleLootBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(doubleLootBonus)}`)
            for (let bool of lootForDurBonus) {
                if (bool) {
                    totalActions += 2
                }
            }
        }

        try {
            result = await FishermanQueries.reduceDurability(rodIdInstance, subDurability * totalActions)
        } catch (error) {
            logger.error(`Error in FishermanQueries.reduceDurability : ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }

        rodDurability -= (subDurability * totalActions)  //properly return the durability for the bonuses
    }

    // reduce ancien cost for passiveFishing
    // try{
    //     await UserQueries.subResources(address, costAncien, 0, 0)
    // } catch (error){
    //     logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`);
    //     return res
    //     .status(401)
    //     .json({
    //         success: false,
    //         error: {
    //             errorMessage: error
    //         }
    //     })
    // }



    // update passive
    try {
        await PassiveQueries.calculateStoredActions(passiveData.idPassive, storedActions, null)
    } catch (error) {
        logger.error(`PassiveQueries.calculateStoredActions error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    try {
        await PassiveQueries.calculateBurntActions(passiveData.idPassive, burntActions)
    } catch (error) {
        logger.error(`PassiveQueries.calculateBurntActions error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let idPassiveFishing
    try {
        idPassiveFishing = await FishermanQueries.getIdPassiveFishing()
    } catch (error) {
        logger.error(`FishermanQueries.getIdPassiveFishing error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    //MOVED IT DOWN FOR THE FISHING HISTORY
    // try {
    //     result = await FishermanService.updatePassiveFishingTable(address, idSea, totalFishedItems, totalFishedRecipes, totalFishedFishes, idFisherman, rodIdToolLevel, rodIdInstance, idPassiveFishing, actionNumber/*, quantityItem, quantityRecipe*/)
    // } catch (error) {
    //     logger.error(`Error in FishermanService.updatePassiveFishingTable : ${Utils.printErrorLog(error)}`)
    //     return res
    //     .status(401)
    //     .json({
    //         success: false,
    //         error: {
    //             errorMessage: error
    //         }
    //     })
    // }

    //let response = { hasConsumables: false, consumables: [], drop: [], fishingEndingTime: result, rodEndingTime: result }

    let response = { hasConsumables: false, consumables: [], drop: [] }

    let storage = {}
    try {
        resources = await UserQueries.getResources(address)
    } catch (error) {
        logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    storage.ancien = resources.ancien
    storage.wood = resources.wood
    storage.stone = resources.stone
    response.storage = storage

    response.passiveInfo = {
        burntActions: burntActions,
        storedActions: storedActions,
        maxPerformableActions: maxPerformableActions,
    }
    response.rod = { durability: rodDurability }

    try {
        let fishedItems = [], fishedRecipes = [], fishedExp = totalFishedExp
        let totalFishedItemsObj = {}
        for (var i = 0; i < totalFishedItems.length; ++i) {
            let item = totalFishedItems[i]
            if (totalFishedItemsObj[item.idItem] == undefined) {
                totalFishedItemsObj[item.idItem] = {
                    type: 'item',
                    idItem: item.idItem,
                    image: item.image,
                    name: item.name,
                    rarity: item.rarity,
                    quantity: item.quantity
                }
            } else {
                totalFishedItemsObj[item.idItem].quantity += item.quantity
            }
        }
        for (let idItem in totalFishedItemsObj) {
            fishedItems.push(totalFishedItemsObj[idItem])
            response.drop.push(totalFishedItemsObj[idItem])
        }

        let totalFishedRecipesObj = {}
        for (var i = 0; i < totalFishedRecipes.length; ++i) {
            let recipe = totalFishedRecipes[i]
            if (totalFishedRecipesObj[recipe.idRecipe] == undefined) {
                totalFishedRecipesObj[recipe.idRecipe] = {
                    type: 'recipe',
                    idRecipe: recipe.idRecipe,
                    image: recipe.image,
                    name: recipe.name,
                    rarity: recipe.rarity,
                    quantity: recipe.quantity
                }
            } else {
                totalFishedRecipesObj[recipe.idRecipe].quantity += recipe.quantity
            }
        }
        for (let idRecipe in totalFishedRecipesObj) {
            fishedRecipes.push(totalFishedRecipesObj[idRecipe])
            response.drop.push(totalFishedRecipesObj[idRecipe])
        }


        let totalFishedFishesObj = {}
        for (var i = 0; i < totalFishedFishes.length; ++i) {
            let fish = totalFishedFishes[i]
            if (totalFishedFishesObj[fish.idSeaFish] == undefined) {
                totalFishedFishesObj[fish.idSeaFish] = {
                    type: 'fish',
                    image: fish.image,
                    name: fish.name,
                    rarity: fish.rarity,
                    experience: fish.experience
                }
            } else {
                totalFishedFishesObj[fish.idSeaFish].experience += fish.experience
            }
        }
        for (let idSeaFish in totalFishedFishesObj) {
            response.drop.push(totalFishedFishesObj[idSeaFish])
        }

        let result;
        let quantityItem = {};
        let quantityRecipe = {};
        try {
            quantityItem = await FishermanService.addFishedItemsToAddress(address, totalFishedItems)
        } catch (error) {
            logger.error(`Error in FishermanService.addFishedItemsToAddress : ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }

        try {
            quantityRecipe = await FishermanService.addFishedRecipesToAddress(address, totalFishedRecipes)
        } catch (error) {
            logger.error(`Error in FishermanService.addFishedRecipesToAddress : ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }


        let cdBonus = allBonus.find(vendor => vendor['bonusCode'] === 'NO_CD');
        if (cdBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(cdBonus)}`)
            if (random.int(0, 99) < cdBonus.percentageBoost) {
                passiveData.fishingCoolDown = 0
            }
        }

        try {
            result = await FishermanService.updatePassiveFishingTable(
                address,
                idSea,
                totalFishedItems,
                totalFishedRecipes,
                totalFishedFishes,
                idFisherman,
                rodIdToolLevel,
                rodIdInstance,
                idPassiveFishing,
                actionNumber,
                quantityItem,
                quantityRecipe,
                passiveData.fishingCoolDown)
        } catch (error) {
            logger.error(`Error in FishermanService.updatePassiveFishingTable : ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }

        response.fishingEndingTime = result;
        response.rodEndingTime = result;

        try {
            result = await FishermanService.addExpToAddress(address, fishedExp)
        } catch (error) {
            logger.error(`Error in FishermanService.addExpToAddress : ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
    } catch (error) {
        logger.error(`Error in building response : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    try {
        result = await FishermanService.getSeasWithFishermanAllowance(address)
    } catch (error) {
        logger.error(`Error in FishermanService.getSeasWithFishermanAllowance: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    response.seas = result.seas

    try {
        result = await InventoryService.getInventoryInstanceData(address, rodIdInstance, 'tool')
    } catch (error) {
        logger.error(`Error in InventoryService.getInventoryInstanceData: ${JSON.stringify(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let toolIds = []
    toolIds.push(result.id)
    if (toolIds.length != 0) {
        toolIds = toolIds.join(', ')
        logger.info(`toolIds: ${toolIds}`)
        let toolBonuses
        try {
            toolBonuses = await ToolService.getToolBonuses(toolIds)
        } catch (error) {
            logger.error(`Error in ToolService.getToolBonuses: ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        logger.info(`toolBonuses response: ${JSON.stringify(toolBonuses)}`)

        result.bonuses = toolBonuses[result.id] ? toolBonuses[result.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
    }

    response.equippedRodInstanceData = result

    logger.debug(`startPassiveFishing response:${JSON.stringify(response)}`)
    logger.info(`startPassiveFishing END`)
    return res
        .status(200)
        .json({
            success: true,
            data: response
        });
}

async function startFishing(req, res) {
    logger.info(`startFishing START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation = FishermanValidation.fishValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let idSea = req.body.idSea
    let consumableIds = req.body.consumableIds
    let checkConsumables;

    let fisherman
    try {
        fisherman = await FishermanQueries.verifyStakedFisherman(address);
    } catch (error) {
        logger.error(`Error in FishermanQueries.verifyStakedFisherman : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (fisherman.length == 0) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'You must have a staked fisherman\'s hut that is not in upgrade'
                }
            })
    }

    let idFisherman = fisherman[0].id
    let rodIdToolLevel = fisherman[0].idToolLevel
    let rodIdTool = fisherman[0].idTool
    let rodIdInstance = fisherman[0].idToolInstance

    let usingCheck = true, usingCheckRes
    try {
        usingCheckRes = await FishermanQueries.checkUsingOfBuildingAndRod(idFisherman, rodIdInstance)
    } catch (error) {
        logger.error(`Error in FishermanQueries.checkUsingOfBuildingAndRod : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (usingCheckRes.length != 0) {
        usingCheck = false
    }
    if (!usingCheck) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'Fishing is already going on now.'
                }
            })
    }

    let rarityCheck
    try {
        rarityCheck = await FishermanService.checkRarityByRodSea(address, rodIdInstance, idSea)
    } catch (error) {
        logger.error(`Error in FishermanService.checkRarityByRodSea : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (!rarityCheck.pass) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: rarityCheck.error
                }
            })
    }

    let enableCheck = true, enableCheckRes
    try {
        enableCheckRes = await FishermanQueries.checkBySeaTool(idSea, rodIdTool)
    } catch (error) {
        logger.error(`Error in FishermanQueries.checkBySeaTool : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`enableCheckRes:${JSON.stringify(rodIdTool)}--${JSON.stringify(enableCheckRes)}`)
    if (enableCheckRes.length == 0) {
        enableCheck = false
    }
    if (!enableCheck) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'The current tool is not allowed to fish at the current sea.'
                }
            })
    }

    let durabilityCheck
    try {
        durabilityCheck = await FishermanService.checkDurabilityByIdRodInstance(rodIdInstance)
    } catch (error) {
        logger.error(`Error in FishermanService.checkDurabilityByIdRodInstance : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (!durabilityCheck) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'You need Rod\'s durability more than 10 to fish.'
                }
            })
    }

    let checkPassive;
    try {
        checkPassive = await FishermanQueries.getPassiveStatus(idFisherman)
    } catch (error) {
        logger.error(`Error in FishermanQueries.getPassiveStatus : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    if (checkPassive?.length > 0 && checkPassive[0]?.isPassive == 1) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'Your fisherman is in passive status'
                }
            })
    }

    let allBonus
    try {
        allBonus = await FishermanQueries.getBonuses(rodIdInstance)
    } catch (error) {
        console.log(error);
        logger.error(`Error in FishermanService.fish : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`all bonuses:${JSON.stringify(allBonus)}`);


    let fishingRes
    try {
        fishingRes = await FishermanService.fish(address, idSea, consumableIds, allBonus)
    } catch (error) {
        console.log(error);
        logger.error(`Error in FishermanService.fish : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    logger.debug(`fishingRes:${JSON.stringify(fishingRes)}`)

    let fishedItems = fishingRes.items
    let fishedRecipes = fishingRes.recipes
    let fishedFishes = fishingRes.fishes
    let fishedExp = fishingRes.experience

    let quantityFish = fishedFishes.length

    let result, quantityItem, quantityRecipe
    try {
        quantityItem = await FishermanService.addFishedItemsToAddress(address, fishedItems)
    } catch (error) {
        logger.error(`Error in FishermanService.addFishedItemsToAddress : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    try {
        quantityRecipe = await FishermanService.addFishedRecipesToAddress(address, fishedRecipes)
    } catch (error) {
        logger.error(`Error in FishermanService.addFishedRecipesToAddress : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    try {
        result = await FishermanService.addExpToAddress(address, fishedExp)
    } catch (error) {
        logger.error(`Error in FishermanService.addExpToAddress : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    try {
        result = await FishermanQueries.getDurability(rodIdInstance)
    } catch (error) {
        logger.error(`Error in FishermanQueries.getDurability : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (result.durability != -1) { //-1 Means Infinite Durability
        let subDurability = 10

        let durBonus = allBonus.find(vendor => vendor['bonusCode'] === 'LESS_DURABILITY');
        if (durBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(durBonus)}`)
            subDurability = subDurability - durBonus.flatBoost
        }

        let nodurBonus = allBonus.find(vendor => vendor['bonusCode'] === 'NO_DURABILITY');
        if (nodurBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(nodurBonus)}`);
            if (random.int(0, 99) < nodurBonus.percentageBoost) {
                subDurability = 0
            }
        }

        let doubleLootBonus = allBonus.find(x => x['bonusCode'] === 'LOOT_FOR_DURABILITY');
        if (doubleLootBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(doubleLootBonus)}`)
            if (fishingRes.doubleLootDur) {
                subDurability = 3 * subDurability
            }

        }
        try {
            result = await FishermanQueries.reduceDurability(rodIdInstance, subDurability)
        } catch (error) {
            logger.error(`Error in FishermanQueries.reduceDurability : ${Utils.printErrorLog(error)}`)
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
    try {
        quantityRecipe = await FishermanService.addFishedRecipesToAddress(address, fishedRecipes)
    } catch (error) {
        logger.error(`Error in FishermanService.addFishedRecipesToAddress : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    try {
        result = await FishermanService.addExpToAddress(address, fishedExp)
    } catch (error) {
        logger.error(`Error in FishermanService.addExpToAddress : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    try {
        result = await FishermanQueries.getDurability(rodIdInstance)
    } catch (error) {
        logger.error(`Error in FishermanQueries.getDurability : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let reduceCoolDown = false, noCoolDown = false
    if (consumableIds[0] == 1 || consumableIds[1] == 1) {
        reduceCoolDown = true
        let lureBonus = allBonus.find(x => x['bonusCode'] === 'LURE_CD');
        if (lureBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(lureBonus)}`)
            if (random.int(0, 99) < lureBonus.percentageBoost) {
                noCoolDown = true
            }
        }
    }

    let cdBonus = allBonus.find(x => x['bonusCode'] === 'NO_CD');
    if (cdBonus != undefined) {
        logger.debug(`bonus found ${JSON.stringify(cdBonus)}`)
        if (random.int(0, 99) < cdBonus.percentageBoost) {
            noCoolDown = true
        }
    }

    try {

        result = await FishermanService.updateFishingTable(address, idSea, fishedItems, fishedRecipes, fishedFishes, idFisherman, rodIdToolLevel, rodIdInstance, consumableIds, reduceCoolDown, noCoolDown, quantityItem, quantityRecipe, quantityFish)
    } catch (error) {
        logger.error(`Error in FishermanService.updateFishingTable : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let response = { hasConsumables: false, consumables: [], drop: [], fishingEndingTime: result, rodEndingTime: result }

    let consumables
    try {
        consumables = await InventoryQueries.getFishConsumables(address)
    } catch (error) {
        logger.error(`InventoryQueries.getFishConsumables error : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    response.hasConsumables = consumables.length == 0 ? false : true
    for (var i = 0; i < consumables.length; ++i) {
        response.consumables.push({
            id: consumables[i].idItemConsumable,
            name: consumables[i].name,
            image: consumables[i].image,
            description: consumables[i].description,
            quantity: consumables[i].quantity
        })
    }

    try {
        result = await FishermanQueries.getDurabilityByIdToolInstance(rodIdInstance)
    } catch (error) {
        logger.error(`Error in FishermanQueries.getDurabilityByIdToolInstance : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (result.length == 0) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'You haven\'t got that rod.'
                }
            })
    }
    response.rod = { durability: result[0].durability }
    try {
        for (var i = 0; i < fishedItems.length; ++i) {
            response.drop.push({
                type: 'item',
                image: fishedItems[i].image,
                name: fishedItems[i].name,
                rarity: fishedItems[i].rarity,
                quantity: fishedItems[i].quantity
            })
        }

        for (var i = 0; i < fishedRecipes.length; ++i) {
            response.drop.push({
                type: 'recipe',
                image: fishedRecipes[i].image,
                name: fishedRecipes[i].name,
                rarity: fishedRecipes[i].rarity,
                quantity: fishedRecipes[i].quantity
            })
        }

        for (let fish of fishedFishes) {
            response.drop.push({
                type: 'fish',
                image: fish.image,
                name: fish.name,
                rarity: fish.rarity,
                experience: fish.experience
            })
        }

    } catch (error) {
        logger.error(`Error in building response : ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    try {
        result = await FishermanService.getSeasWithFishermanAllowance(address)
    } catch (error) {
        logger.error(`Error in FishermanService.getSeasWithFishermanAllowance: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    response.seas = result.seas

    try {
        result = await InventoryService.getInventoryInstanceData(address, rodIdInstance, 'tool')
    } catch (error) {
        logger.error(`Error in InventoryService.getInventoryInstanceData: ${JSON.stringify(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let toolIds = []
    toolIds.push(result.id)
    if (toolIds.length != 0) {
        toolIds = toolIds.join(', ')
        logger.info(`toolIds: ${toolIds}`)
        let toolBonuses
        try {
            toolBonuses = await ToolService.getToolBonuses(toolIds)
        } catch (error) {
            logger.error(`Error in ToolService.getToolBonuses: ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        logger.info(`toolBonuses response: ${JSON.stringify(toolBonuses)}`)

        result.bonuses = toolBonuses[result.id] ? toolBonuses[result.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
    }

    response.equippedRodInstanceData = result

    logger.debug(`startFishing response:${JSON.stringify(response)}`)
    logger.info(`startFishing END`)
    return res
        .status(200)
        .json({
            success: true,
            data: {
                ...response
            }
        });
}

async function unEquipRod(req, res) {
    logger.info(`unEquipRod START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let validation;
    validation = FishermanValidation.unEquipRodValidator(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    let address = req.locals.address;
    let idToolInstance = req.body.idToolInstance;
    let response, actualEquippedRod, seas;

    try {
        response = await InventoryQueries.getToolInstance(address, idToolInstance);
    } catch (error) {
        logger.error(`Error in getFishermanFunction getTool: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (response.length == 0) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'You haven\'t got that rod'
                }
            })
    } else if (response[0].equipped == false) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'Not equipped tool'
                }
            })
    }

    try {
        response = await FishermanQueries.getQueryFisherman(address);
    } catch (error) {
        logger.error(`Error in FishermanQueries.getQueryFisherman: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.debug(`getQueryFisherman response : ${JSON.stringify(response)}`);

    if (response.length != 1) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'User does not have a fisherman staked'
                }
            })
    }

    let buildingId = response[0].id
    actualEquippedRod = response[0].idToolInstance;

    if (actualEquippedRod != idToolInstance) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'Not equipped tool.'
                }
            })
    }

    try {
        response = await FishermanQueries.unEquipRod(buildingId)
    } catch (error) {
        logger.error(`Error in FishermanQueries.unEquipRod: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    try {
        response = await FishermanQueries.unEquipTool(idToolInstance)
    } catch (error) {
        logger.error(`Error in FishermanQueries.unEquipTool: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    let result
    try {
        result = await FishermanService.getSeasWithFishermanAllowance(address);
    } catch (error) {
        logger.error(`Error in FishermanService.getSeasWithFishermanAllowance: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    seas = result.seas

    logger.info(`unEquipRod END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                seas
            }
        });
}

async function upgradeRod(req, res) {

    logger.info(`upgradeRod START`);

    let validation = FishermanValidation.upgradeRodValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let response
    let address = req.locals.address
    let idToolInstance = req.body.idToolInstance
    let consumableIds = req.body.consumableIds

    try {
        response = await ToolService.upgrade(address, idToolInstance, consumableIds)
    } catch (error) {
        logger.error(`Error in ToolService.upgrade: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    let seas, equippedRodInstanceData
    let result
    try {
        result = await FishermanService.getSeasWithFishermanAllowance(address)
    } catch (error) {
        logger.error(`Error in FishermanService.getSeasWithFishermanAllowance: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    seas = result.seas

    try {
        equippedRodInstanceData = await InventoryService.getInventoryInstanceData(address, idToolInstance, 'tool')
    } catch (error) {
        logger.error(`Error in InventoryService.getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info(`upgradeRod END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                seas,
                status: response,
                equippedRodInstanceData
            }
        });
}

async function repairRod(req, res) {

    logger.info(`repairRod START`);

    let validation = FishermanValidation.repairRodValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let response
    let address = req.locals.address;
    let idToolInstance = req.body.idToolInstance
    let consumableIds = req.body.consumableIds

    try {
        response = await ToolService.repair(address, idToolInstance, consumableIds)
    } catch (error) {
        logger.error(`Error in ToolService.upgrade: ${Utils.printErrorLog(error)}`);
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let equippedRodInstanceData

    try {
        equippedRodInstanceData = await InventoryService.getInventoryInstanceData(address, idToolInstance, 'tool')
    } catch (error) {
        logger.error(`Error in InventoryService.getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info(`repairRod END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                status: response,
                equippedRodInstanceData
            }
        });
}

module.exports = {
    getFisherman,
    changeRod,
    startFishing,
    unEquipRod,
    repairRod,
    upgradeRod,
    burnPassiveLure,
    startPassiveFishing
}
