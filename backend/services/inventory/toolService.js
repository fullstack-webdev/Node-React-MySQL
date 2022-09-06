const logger = require('../../logging/logger');

const { ToolQueries } = require('../../queries/inventory/toolQueries')
const { UserQueries } = require('../../queries/userQueries');
const { ItemQueries } = require('../../queries/inventory/itemQueries')
const { InventoryQueries } = require('../../queries/inventoryQueries')
const { ToolHelper } = require('../../helpers/inventory/toolHelper');
const { Utils } = require("../../utils/utils");
const random = require("random");


class ToolService {
    constructor() { }

    static async getToolBonuses(toolIds) {
        logger.info(`ToolService getToolBonuses Start`)

        let bonusRows
        try {
            bonusRows = await ToolQueries.getToolBonuses(toolIds)
        } catch (error) {
            logger.error(`Error in ToolQueries.getToolBonuses: ${Utils.printErrorLog(error)}`);
            throw error
        }
        logger.info(`ToolQueries.getToolBonuses response: ${JSON.stringify(bonusRows)}`)

        let tools = {}
        let currentTool = {
            idToolInstance: -1,
            bonuses: [],
        }
        for (const bonusRow of bonusRows) {
            if (currentTool.idToolInstance != bonusRow.idToolInstance) {
                if (currentTool.idToolInstance != -1) {
                    let bonuses = currentTool.bonuses;
                    let newBonuses = [];
                    let suffix = [], prefix = [], implicit = [];
                    for (const bonus of bonuses) {
                        if (bonus.type == 'SUFFIX') {
                            suffix.push(bonus);
                        } else if (bonus.type == 'PREFIX') {
                            prefix.push(bonus);
                        } else if (bonus.type == 'IMPLICIT') {
                            implicit.push(bonus);
                        }
                    }
                    for (let i = 0; i < process.env.MAX_PREFIX_BONUS; ++i) {
                        newBonuses.push(prefix[i] ? prefix[i] : 'PREFIX');
                    }
                    for (let i = 0; i < process.env.MAX_SUFFIX_BONUS; ++i) {
                        newBonuses.push(suffix[i] ? suffix[i] : 'SUFFIX');
                    }
                    for (let i = 0; i < process.env.MAX_IMPLICIT_BONUS; ++i) {
                        newBonuses.push(implicit[i] ? implicit[i] : 'IMPLICIT');
                    }

                    currentTool.bonuses = newBonuses;
                    tools[currentTool.idToolInstance] = JSON.parse(JSON.stringify(currentTool))
                }

                logger.info(`currentTool: ${JSON.stringify(currentTool)}`)

                currentTool = {
                    idToolInstance: bonusRow.idToolInstance,
                    bonuses: [],
                }
            }
            const newBonus = {
                name: bonusRow.name,
                type: bonusRow.type,
                description: bonusRow.description,

                chance: bonusRow.chance,
                percentageBoost: bonusRow.percentageBoost,
                flatBoost: bonusRow.flatBoost,
                tier: bonusRow.tier,
            }
            logger.info(`newBonus: ${JSON.stringify(newBonus)}`)

            currentTool.bonuses.push(newBonus)
        }

        // run for the last toolInstance
        {
            let bonuses = currentTool.bonuses;
            let newBonuses = [];
            let suffix = [], prefix = [], implicit = [];
            for (const bonus of bonuses) {
                if (bonus.type == 'SUFFIX') {
                    suffix.push(bonus);
                } else if (bonus.type == 'PREFIX') {
                    prefix.push(bonus);
                } else if (bonus.type == 'IMPLICIT') {
                    implicit.push(bonus);
                }
            }
            for (let i = 0; i < process.env.MAX_PREFIX_BONUS; ++i) {
                newBonuses.push(prefix[i] ? prefix[i] : 'PREFIX');
            }
            for (let i = 0; i < process.env.MAX_SUFFIX_BONUS; ++i) {
                newBonuses.push(suffix[i] ? suffix[i] : 'SUFFIX');
            }
            for (let i = 0; i < process.env.MAX_IMPLICIT_BONUS; ++i) {
                newBonuses.push(implicit[i] ? implicit[i] : 'IMPLICIT');
            }

            currentTool.bonuses = newBonuses;
            tools[currentTool.idToolInstance] = JSON.parse(JSON.stringify(currentTool))
        }

        logger.info(`ToolService.getToolBonuses response: ${JSON.stringify(tools)}`)

        logger.info(`ToolService getToolBonuses END`)
        return tools
    }

    static async getRequirementsUpgradeV2(toolUpgradeGrouped) {
        let requirements = [];

        // requirements = RecipeHelper.buildResourceRequirements(resourceRequirements, requirements);
        //TODO test sideEffect on requirements

        ToolHelper.buildResourceRequirementsV2(toolUpgradeGrouped[0], requirements);
        logger.debug(`RecipeHelper.buildResourceRequirements response, requirements: ${JSON.stringify(requirements)}`);

        // requirements = RecipeHelper.buildItemRequirements(itemRequirements, requirements);
        //TODO test sideEffect on requirements
        ToolHelper.buildItemRequirementsV2(toolUpgradeGrouped, requirements);
        logger.debug(`RecipeHelper.buildItemRequirements response, requirements: ${JSON.stringify(requirements)}`);

        return requirements;
    }

    static async getRequirementsRepairV2(toolRepairGrouped) {
        let requirements = [];

        // requirements = RecipeHelper.buildResourceRequirements(resourceRequirements, requirements);
        //TODO test sideEffect on requirements

        ToolHelper.buildResourceRequirementsV2(toolRepairGrouped[0], requirements);
        logger.debug(`RecipeHelper.buildResourceRequirements response, requirements: ${JSON.stringify(requirements)}`);

        // requirements = RecipeHelper.buildItemRequirements(itemRequirements, requirements);
        //TODO test sideEffect on requirements
        ToolHelper.buildItemRequirementsV2(toolRepairGrouped, requirements);
        logger.debug(`RecipeHelper.buildItemRequirements response, requirements: ${JSON.stringify(requirements)}`);

        return requirements;
    }

    static async getConsumables() {
        let consumables;

        return consumables;
    }

    static async upgrade(address, idToolInstance, consumableIds) {
        let response = { done: false, message: '' }

        //upgrade tool history

        let allBonus
        try {
            allBonus = await ToolQueries.getBonuses(idToolInstance)
        } catch (error) {
            logger.error(`Error in ToolQueries.getBonuses : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        logger.debug(`all bonuses:${JSON.stringify(allBonus)}`);

        let upgradeResult;
        let upgradeObjects = [];

        console.log("Morto 1")
        let checkPro
        try {
            checkPro = await ToolQueries.checkPropertyToUpgrade(idToolInstance, address)
        } catch (error) {
            logger.error(`Error in ToolQueries.checkPropertyToUpgrade: ${Utils.printErrorLog(error)}`);
            throw error
        }
        if (checkPro.length == 0) {
            response.message = 'You haven\'t got that tool'
            return response
        } /* else if ( checkPro[0].equipped ) {
            response.message = 'Equipped tool can\'t be upgraded'
            return response
        }  */else if (!checkPro[0].isUpgradable) {
            response.message = 'Not upgradable tool'
            return response
        }

        let currentLevel = checkPro[0].level;
        let successLevel = checkPro[0].nextLevel;
        let failLevel = checkPro[0].prevLevel;

        console.log("Morto 2")
        let upgradeToolLevel
        try {
            upgradeToolLevel = await ToolQueries.getToolLevelByIdToolAndLevel(checkPro[0].idTool, checkPro[0].nextLevel)
        } catch (error) {
            logger.error(`Error in ToolQueries.getToolLevelByIdToolAndLevel: ${Utils.printErrorLog(error)}`);
            throw error
        }
        if (upgradeToolLevel.length == 0) {
            response.message = 'Not upgradable tool'
            return response
        }

        console.log("Morto 3")
        let result
        try {
            result = await ToolQueries.checkRequirementsToUpgradeByAddressAndIdToolLevel(address, upgradeToolLevel[0].idToolLevel, consumableIds)
        } catch (error) {
            logger.error(`Error in ToolQueries.checkRequirementsToUpgradeByAddressAndIdToolLevel: ${Utils.printErrorLog(error)}`);
            throw error
        }
        if (result.length == 0) {
            response.message = 'Not upgradable tool - no requirements'
            return response
        }

        console.log("Morto 4")
        let isUpgradable = result[0].isAncienAllowed && result[0].isWoodAllowed && result[0].isStoneAllowed
        if (isUpgradable) {
            for (let requirement of result) {
                if (!requirement.isItemAllowed) {
                    isUpgradable = false
                    break
                }
            }
        }
        if (!isUpgradable) {
            response.message = 'Not enough cost to upgrade.'
            return response
        }

        let downgradeAllowed = true
        if (consumableIds[0] == 1 || consumableIds[1] == 1) {
            downgradeAllowed = false
        }
        if (consumableIds[0] == 2 || consumableIds[1] == 2) {
            checkPro[0].chanceUpgrade += 10
        }
        if (consumableIds[0] == 6 || consumableIds[1] == 6) {
            checkPro[0].chanceUpgrade += 5
        }
        if (consumableIds[0] == 7 || consumableIds[1] == 7) {
            checkPro[0].chanceUpgrade += 15
        }
        let upgradeBool = false
        if (random.int(0, 99) < checkPro[0].chanceUpgrade) {
            upgradeBool = true;
        }
        if (consumableIds[0] == 8 || consumableIds[1] == 8) {
            upgradeBool = true;
        }
        let reqBool = true;
        if (consumableIds[0] == 9 || consumableIds[1] == 9) {
            if (upgradeBool == false) {
                reqBool = false;
            }
        }

        let editElements = [], removeElements = []
        let ancienToSub = result[0].requiredAncien && 0, woodToSub = result[0].requiredWood && 0, stoneToSub = result[0].requiredStone && 0
        let lessUpgradeCost = false
        let lessRepairCost;
        let lessUpCost = allBonus.find(x => x['bonusCode'] === 'LESS_UP_COST');
        logger.debug(`bonus found ${lessUpCost}`)
        if (lessUpCost != undefined) {
            if (random.int(0, 99) < 25) {
                lessUpgradeCost = true;
                var boost = lessUpCost.percentageBoost
                ancienToSub -= (ancienToSub * boost) / 100
                woodToSub -= (woodToSub * boost) / 100
                stoneToSub -= (stoneToSub * boost) / 100
            }
        }

        let objectAncien = {};
        let objectWood = {};
        let objectStone = {};

        if (ancienToSub != 0) {
            objectAncien.resultUpgrade = null;
            objectAncien.idToolInstance = idToolInstance;
            objectAncien.address = address;
            objectAncien.inventoryType = null;
            objectAncien.idItem = null;
            objectAncien.resourceType = 1;
            objectAncien.requiredQuantity = ancienToSub;
            objectAncien.quantityBefore = result[0].ancienBefore;
        }

        if (woodToSub != 0) {
            objectWood.resultUpgrade = null;
            objectWood.idToolInstance = idToolInstance;
            objectWood.address = address;
            objectWood.inventoryType = null;
            objectWood.idItem = null;
            objectWood.resourceType = 2;
            objectWood.requiredQuantity = woodToSub;
            objectWood.quantityBefore = result[0].woodBefore;
        }

        if (stoneToSub != 0) {
            objectStone.resultUpgrade = null;
            objectStone.idToolInstance = idToolInstance;
            objectStone.address = address;
            objectStone.inventoryType = null;
            objectStone.idItem = null;
            objectStone.resourceType = 3;
            objectStone.requiredQuantity = stoneToSub;
            objectStone.quantityBefore = result[0].stoneBefore;
        }

        try {
            await UserQueries.subResources(address, ancienToSub, woodToSub, stoneToSub)
        } catch (error) {
            logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`);
            throw error
        }
        for (let i = 0; i < result.length; i++) {

            let object = {};
            object.resultUpgrade = null;
            object.idToolInstance = idToolInstance;
            object.address = address;
            object.inventoryType = 'item';
            object.idItem = result[i].idItemReq;
            object.resourceType = null;
            object.requiredQuantity = result[i].requiredItemQuantity;
            object.quantityBefore = result[i].itemBefore;

            if (result[i].idItemInstance == null || result[i].idItemInstance == undefined) continue

            let quantityToSub = result[i].requiredItemQuantity
            if (lessUpgradeCost) {
                quantityToSub -= Math.floor((quantityToSub * boost) / 100)
            }

            if (reqBool) {
                try {
                    await ItemQueries.subItemByIdItemInstance(result[i].idItemInstance, quantityToSub)
                } catch (error) {
                    logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`);
                    throw error
                }
            }

            if (!reqBool && result[i].isConsumable) {

                try {
                    await ItemQueries.subItemByIdItemInstance(result[i].idItemInstance, result[i].requiredItemQuantity)
                } catch (error) {
                    logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`);
                    throw error
                }

            }

            let remainQuantity
            try {
                remainQuantity = await ItemQueries.getQuantityByIdItemInstance(result[i].idItemInstance)
            } catch (error) {
                logger.error(`Error in ItemQueries.getQuantityByIdItemInstance: ${Utils.printErrorLog(error)}`);
                throw error
            }

            object.quantityAfter = remainQuantity[0].quantity;
            upgradeObjects.push(object);

            if (remainQuantity[0].quantity == 0) {
                try {
                    await ItemQueries.removeItemInstance(result[i].idItemInstance)
                } catch (error) {
                    logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                    throw error
                }
                removeElements.push({
                    id: result[i].idItemInstance,
                    type: 'item'
                })
            } else {
                editElements.push({
                    id: result[i].idItemInstance,
                    type: 'item',
                    quantity: remainQuantity[0].quantity
                })
            }
        }

        if (upgradeBool) {
            response.done = true
            response.message = 'Upgraded successfully.'
            response.level = checkPro[0].nextLevel

            try {
                await ToolQueries.upgradeToolByIdToolInstance(idToolInstance, upgradeToolLevel[0].idToolLevel, upgradeToolLevel[0].durabilityTotal, checkPro[0].durabilityTotal)
            } catch (error) {
                logger.error(`Error in ToolQueries.upgradeToolByIdToolInstance: ${Utils.printErrorLog(error)}`);
                throw error
            }
        } else {
            response.done = false
            if (downgradeAllowed) {
                response.message = 'Upgrade failed. The tool has downgraded.'
                checkPro[0].prevLevel = checkPro[0].prevLevel < 0 ? 0 : checkPro[0].prevLevel
                response.level = checkPro[0].prevLevel

                let downgradeToolLevel
                try {
                    downgradeToolLevel = await ToolQueries.getToolLevelByIdToolAndLevel(checkPro[0].idTool, checkPro[0].prevLevel)
                } catch (error) {
                    logger.error(`Error in ToolQueries.getToolLevelByIdToolAndLevel: ${Utils.printErrorLog(error)}`);
                    throw error
                }
                if (downgradeToolLevel.length != 0) {
                    try {
                        await ToolQueries.downgradeToolByIdToolInstance(idToolInstance, downgradeToolLevel[0].idToolLevel, downgradeToolLevel[0].durabilityTotal)
                    } catch (error) {
                        logger.error(`Error in ToolQueries.downgradeToolByIdToolInstance: ${Utils.printErrorLog(error)}`);
                        throw error
                    }
                }
            } else {
                response.message = 'Upgrade failed. But the tool hasn\'t been downgraded.'
                response.level = checkPro[0].level
            }
        }
        response.inventory = [
            {
                action: 'edit',
                elements: editElements
            },
            {
                action: 'remove',
                elements: removeElements
            }
        ]


        let storage = {}
        let resources
        try {
            resources = await UserQueries.getResources(address)
        } catch (error) {
            logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
            throw error;
        }
        storage.ancien = resources.ancien
        storage.wood = resources.wood
        storage.stone = resources.stone
        response.storage = storage

        //pushing the resource objects in the upgradeObjects array
        if (result[0].requiredAncien != null && result[0].requiredAncien != 0) {
            objectAncien.quantityAfter = resources.ancien;
            upgradeObjects.push(objectAncien);
        }

        if (result[0].requiredWood != null && result[0].requiredWood != 0) {
            objectWood.quantityAfter = resources.wood;
            upgradeObjects.push(objectWood);
        }

        if (result[0].requiredStone != null && result[0].requiredStone != 0) {
            objectStone.quantityAfter = resources.stone;
            upgradeObjects.push(objectStone);
        }

        let objectResult = {};
        let startLevel, endLevel;

        if (response.done == true) {
            objectResult.resultUpgrade = 'upgraded';
            startLevel = currentLevel;
            endLevel = successLevel;
        } else if (!downgradeAllowed && response.done == false) {
            objectResult.resultUpgrade = 'NOT upgraded';
            startLevel = currentLevel;
            endLevel = currentLevel;
        } else if (response.done == false) {
            objectResult.resultUpgrade = 'downgraded';
            startLevel = currentLevel;
            endLevel = failLevel;
        }
        objectResult.idToolInstance = idToolInstance;
        objectResult.address = address;
        objectResult.inventoryType = null;
        objectResult.idItem = null;
        objectResult.resourceType = null;
        objectResult.requiredQuantity = null;
        objectResult.quantityBefore = null;
        objectResult.quantityAfter = null;
        objectResult.startLevel = startLevel;
        objectResult.endLevel = endLevel;
        upgradeObjects.push(objectResult);

        logger.debug(`upgradeObjects response : ${JSON.stringify(upgradeObjects)}`)

        try {
            upgradeResult = await InventoryQueries.setUpgradeToolHistory(upgradeObjects);
        } catch (error) {
            logger.error(`Error in InventoryQueries.setUpgradeToolHistory, error: ${Utils.printErrorLog(error)}`)
        }

        logger.debug(`setUpgradeToolHistory response : ${JSON.stringify(upgradeResult)}`)

        return response
    }

    static async repair(address, idToolInstance, consumableIds) {
        let response = { done: false, message: '' }

        let allBonus
        try {
            allBonus = await ToolQueries.getBonuses(idToolInstance)
        } catch (error) {
            logger.error(`Error in toolService.upgrade : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        logger.debug(`all bonuses:${JSON.stringify(allBonus)}`);

        let result
        try {
            result = await ToolQueries.checkRequirementsToRepairByAddressAndIdToolInstanceAndConsumableIds(address, idToolInstance, consumableIds)
        } catch (error) {
            logger.error(`Error in ToolQueries.checkRequirementsToRepairByAddressAndIdToolInstanceAndConsumableIds: ${Utils.printErrorLog(error)}`);
            throw error;
        }
        if (result.length == 0) {
            response.message = 'You haven\'t got that tool'
            return response
        } else if (!result[0].isRepairAllowed) {
            response.message = 'Not repairable tool'
            return response
        } else if (!result[0].isRepairable) {
            response.message = 'The tool doesn\'t need to repair - max durability'
            return response
        }

        response.durability = result[0].durabilityTotal
        let isRepairable = result[0].isAncienAllowed && result[0].isWoodAllowed && result[0].isStoneAllowed
        if (isRepairable) {
            for (let requirement of result) {
                if (!requirement.isItemAllowed) {
                    isRepairable = false
                    break
                }
            }
        }
        if (!isRepairable) {
            response.message = 'Not enough cost to repair.'
            return response
        }

        response.done = true
        response.message = 'Repaired successfully.'
        let editElements = [], removeElements = []
        let ancienToSub = result[0].requiredAncien, woodToSub = result[0].requiredWood, stoneToSub = result[0].requiredStone
        let lessRepairCost = false
        let lessCost = allBonus.find(x => x['bonusCode'] === 'LESS_REPAIR_COST');
        logger.debug(`bonus found ${lessCost}`)
        if (lessCost != undefined) {
            if (random.int(0, 99) < 25) {
                lessRepairCost = true;
                var boost = lessCost.percentageBoost
                ancienToSub -= (ancienToSub * boost) / 100
                woodToSub -= (woodToSub * boost) / 100
                stoneToSub -= (stoneToSub * boost) / 100
            }
        }

        try {
            await UserQueries.subResources(address, ancienToSub, woodToSub, stoneToSub)
        } catch (error) {
            logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`);
            throw error
        }
        for (let requirement of result) {
            if (requirement.idItemInstance == null || requirement.idItemInstance == undefined) continue
            let quantityToSub = requirement.requiredItemQuantity
            if (lessRepairCost) {
                quantityToSub -= Math.floor((quantityToSub * boost) / 100)
            }
            try {
                await ItemQueries.subItemByIdItemInstance(requirement.idItemInstance, quantityToSub)
            } catch (error) {
                logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`);
                throw error
            }

            let remainQuantity
            try {
                remainQuantity = await ItemQueries.getQuantityByIdItemInstance(requirement.idItemInstance)
            } catch (error) {
                logger.error(`Error in ItemQueries.getQuantityByIdItemInstance: ${Utils.printErrorLog(error)}`);
                throw error
            }
            if (remainQuantity[0].quantity == 0) {
                try {
                    await ItemQueries.removeItemInstance(requirement.idItemInstance)
                } catch (error) {
                    logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                    throw error
                }
                removeElements.push({
                    id: requirement.idItemInstance,
                    type: 'item'
                })
            } else {
                editElements.push({
                    id: requirement.idItemInstance,
                    type: 'item',
                    quantity: remainQuantity[0].quantity
                })
            }
        }

        try {
            await ToolQueries.repairToolByIdToolInstance(idToolInstance, result[0].durabilityTotal)
        } catch (error) {
            logger.error(`Error in ToolQueries.repairToolByIdToolInstance: ${Utils.printErrorLog(error)}`);
            throw error
        }

        response.inventory = [
            {
                action: 'edit',
                elements: editElements
            },
            {
                action: 'remove',
                elements: removeElements
            }
        ]

        let storage = {}
        let resources
        try {
            resources = await UserQueries.getResources(address)
        } catch (error) {
            logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
            throw error;
        }
        storage.ancien = resources.ancien
        storage.wood = resources.wood
        storage.stone = resources.stone
        response.storage = storage

        return response
    }
}

module.exports = { ToolService }
