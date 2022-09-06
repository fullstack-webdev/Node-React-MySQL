const logger = require('../../logging/logger');

const { ItemQueries } = require('../../queries/inventory/itemQueries');
const { RecipeQueries } = require('../../queries/inventory/recipeQueries');
const { InventoryQueries } = require('../../queries/inventoryQueries');
const { BuildingsQueries } = require('../../queries/buildingsQueries');
const { ToolQueries } = require('../../queries/inventory/toolQueries');
const { UserQueries } = require('../../queries/userQueries');

const { ToolService } = require('./toolService');
const { RecipeService } = require('./recipeService');
const { FishermanService } = require('../fishermanService');
const { FishermanQueries } = require('../../queries/fishermanQueries');

const { InventoryHelper } = require('../../helpers/inventoryHelper');
const { RecipeHelper } = require('../../helpers/inventory/recipeHelper');

const { Utils } = require('../../utils/utils');

const random = require('random');
class InventoryService {
    constructor() { }

    static async getInventoryInstanceData(address, idInventoryInstance, inventoryType) {
        console.log('############# getInventoryInstanceData: ', address, idInventoryInstance, inventoryType)
        let inventoryInstanceRawData = []
        try {
            inventoryInstanceRawData = await InventoryQueries.getInventoryInstanceDataFromAddressAndIdInventoryInstanceAndInventoryType(address, idInventoryInstance, inventoryType)
            console.log('**************** 1: ', inventoryInstanceRawData)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getInventoryInstanceDataFromAddressAndIdInventoryInstanceAndInventoryType: ${Utils.printErrorLog(error)}`)
            throw error
        }
        if (inventoryInstanceRawData.length == 0) {
            throw 'The user hasn\'t got that inventory'
        }
        let inventoryInstanceData = {
            id: inventoryInstanceRawData[0].id,
            type: inventoryInstanceRawData[0].type,
            isChest: (inventoryInstanceRawData[0].type == 'item' ? inventoryInstanceRawData[0].isChest : false),
            image: inventoryInstanceRawData[0].image,
            name: inventoryInstanceRawData[0].name,
            description: inventoryInstanceRawData[0].description,
            rarity: inventoryInstanceRawData[0].rarity,
            quantity: inventoryInstanceRawData[0].quantity,
            menu: {
                craft: inventoryInstanceRawData[0].craft,
                view: inventoryInstanceRawData[0].view,
                send: inventoryInstanceRawData[0].send,
                sell: inventoryInstanceRawData[0].sell
            }
        }
        if (inventoryType == 'item' && inventoryInstanceRawData[0].isChest == 1) {
            let loots
            try {
                loots = await InventoryQueries.getChestLoots(idInventoryInstance)
            } catch (error) {
                logger.error(`Error in InventoryQueries.getChestLoots: ${Utils.printErrorLog(error)}`)
                throw error
            }
            let chestIsAllowed = inventoryInstanceRawData[0].isAncienAllowed && inventoryInstanceRawData[0].isWoodAllowed && inventoryInstanceRawData[0].isStoneAllowed
            let requirementsArray = []
            if (inventoryInstanceRawData[0].requiredAncien != 0) {
                requirementsArray.push({
                    name: 'ancien',
                    image: process.env.ANCIEN_IMAGE,
                    quantity: inventoryInstanceRawData[0].requiredAncien,
                    isAllowed: inventoryInstanceRawData[0].isAncienAllowed
                })
            }
            if (inventoryInstanceRawData[0].requiredWood != 0) {
                requirementsArray.push({
                    name: 'wood',
                    image: process.env.WOOD_IMAGE,
                    quantity: inventoryInstanceRawData[0].requiredWood,
                    isAllowed: inventoryInstanceRawData[0].isWoodAllowed
                })
            }
            if (inventoryInstanceRawData[0].requiredStone != 0) {
                requirementsArray.push({
                    name: 'stone',
                    image: process.env.STONE_IMAGE,
                    quantity: inventoryInstanceRawData[0].requiredStone,
                    isAllowed: inventoryInstanceRawData[0].isStoneAllowed
                })
            }
            if (!inventoryInstanceRawData[0].isItemAllowed) {
                chestIsAllowed = false
            }
            if (inventoryInstanceRawData[0].requiredItemQuantity != 0) {
                requirementsArray.push({
                    name: inventoryInstanceRawData[0].requiredItemName,
                    image: inventoryInstanceRawData[0].requiredItemImage,
                    quantity: inventoryInstanceRawData[0].requiredItemQuantity,
                    isAllowed: inventoryInstanceRawData[0].isItemAllowed
                })
            }
            inventoryInstanceData.chest = {
                loots: loots.map((loot) => {
                    return { ...loot, maxQuantity: 0 }
                }),
                isAllowed: chestIsAllowed,
                minDrops: inventoryInstanceRawData[0].minDrops,
                maxDrops: inventoryInstanceRawData[0].maxDrops,
                requirements: requirementsArray
            }
        } else if (inventoryType == 'tool') {
            inventoryInstanceData.level = inventoryInstanceRawData[0].level
            inventoryInstanceData.isAvailable = {
                repair: inventoryInstanceRawData[0].isRepairable,
                upgrade: inventoryInstanceRawData[0].isUpgradable
            },
                inventoryInstanceData.durability = inventoryInstanceRawData[0].durability,
                inventoryInstanceData.durabilityTotal = inventoryInstanceRawData[0].durabilityTotal

            let repairRequirements = [], upgradeRequirements = []
            for (var i = 0; i < inventoryInstanceRawData.length; ++i) {
                const row = inventoryInstanceRawData[i]
                if (row.action == 'repair') {
                    repairRequirements.push(row)
                } else if (row.action == 'upgrade') {
                    upgradeRequirements.push(row)
                }
            }
            if (inventoryInstanceRawData[0].isRepairable) {
                let repairIsAllowed = (inventoryInstanceRawData[0].durability < inventoryInstanceRawData[0].durabilityTotal) && repairRequirements[0].isAncienAllowed && repairRequirements[0].isWoodAllowed && repairRequirements[0].isStoneAllowed
                let requirementsArray = []
                if (repairRequirements[0].requiredAncien != 0) {
                    requirementsArray.push({
                        name: 'ancien',
                        image: process.env.ANCIEN_IMAGE,
                        quantity: repairRequirements[0].requiredAncien,
                        isAllowed: repairRequirements[0].isAncienAllowed
                    })
                }
                if (repairRequirements[0].requiredWood != 0) {
                    requirementsArray.push({
                        name: 'wood',
                        image: process.env.WOOD_IMAGE,
                        quantity: repairRequirements[0].requiredWood,
                        isAllowed: repairRequirements[0].isWoodAllowed
                    })
                }
                if (repairRequirements[0].requiredStone != 0) {
                    requirementsArray.push({
                        name: 'stone',
                        image: process.env.STONE_IMAGE,
                        quantity: repairRequirements[0].requiredStone,
                        isAllowed: repairRequirements[0].isStoneAllowed
                    })
                }
                for (var requirement of repairRequirements) {
                    if (!requirement.isItemAllowed) {
                        repairIsAllowed = false
                    }
                    if (requirement.requiredItemQuantity != 0) {
                        requirementsArray.push({
                            name: requirement.requiredItemName,
                            image: requirement.requiredItemImage,
                            quantity: requirement.requiredItemQuantity,
                            isAllowed: requirement.isItemAllowed
                        })
                    }
                }
                repairIsAllowed = requirementsArray.length == 0 ? false : repairIsAllowed
                inventoryInstanceData.repair = {
                    isAllowed: repairIsAllowed,
                    requirements: requirementsArray,
                    hasConsumables: false,
                    consumables: []
                }

                let repairConsumables
                try {
                    repairConsumables = await InventoryQueries.getToolConsumables('repair', idInventoryInstance)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getToolConsumables: ${Utils.printErrorLog(error)}`)
                    throw error
                }
                inventoryInstanceData.repair.hasConsumables = repairConsumables.length > 0 ? true : false
                for (var i = 0; i < repairConsumables.length; ++i) {
                    inventoryInstanceData.repair.consumables.push({
                        id: repairConsumables[i].idItemConsumable,
                        name: repairConsumables[i].name,
                        image: repairConsumables[i].image,
                        description: repairConsumables[i].description,
                        quantity: repairConsumables[i].quantity
                    })
                }
            }
            if (inventoryInstanceRawData[0].isUpgradable) {
                let upgradeIsAllowed = upgradeRequirements[0].isAncienAllowed && upgradeRequirements[0].isWoodAllowed && upgradeRequirements[0].isStoneAllowed
                let requirementsArray = []
                if (upgradeRequirements[0].requiredAncien != 0) {
                    requirementsArray.push({
                        name: 'ancien',
                        image: process.env.ANCIEN_IMAGE,
                        quantity: upgradeRequirements[0].requiredAncien,
                        isAllowed: upgradeRequirements[0].isAncienAllowed
                    })
                }
                if (upgradeRequirements[0].requiredWood != 0) {
                    requirementsArray.push({
                        name: 'wood',
                        image: process.env.WOOD_IMAGE,
                        quantity: upgradeRequirements[0].requiredWood,
                        isAllowed: upgradeRequirements[0].isWoodAllowed
                    })
                }
                if (upgradeRequirements[0].requiredStone != 0) {
                    requirementsArray.push({
                        name: 'stone',
                        image: process.env.STONE_IMAGE,
                        quantity: upgradeRequirements[0].requiredStone,
                        isAllowed: upgradeRequirements[0].isStoneAllowed
                    })
                }
                for (var requirement of upgradeRequirements) {
                    if (!requirement.isItemAllowed) {
                        upgradeIsAllowed = false
                    }
                    if (requirement.requiredItemQuantity != 0) {
                        requirementsArray.push({
                            name: requirement.requiredItemName,
                            image: requirement.requiredItemImage,
                            quantity: requirement.requiredItemQuantity,
                            isAllowed: requirement.isItemAllowed
                        })
                    }
                }
                upgradeIsAllowed = requirementsArray.length == 0 ? false : upgradeIsAllowed
                inventoryInstanceData.upgrade = {
                    isAllowed: upgradeIsAllowed,
                    probability: upgradeRequirements[0].chanceUpgrade,
                    requirements: requirementsArray,
                    hasConsumables: false,
                    consumables: []
                }

                let upgradeConsumables
                try {
                    upgradeConsumables = await InventoryQueries.getToolConsumables('upgrade', idInventoryInstance)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getToolConsumables: ${Utils.printErrorLog(error)}`)
                    throw error
                }
                inventoryInstanceData.upgrade.hasConsumables = upgradeConsumables.length > 0 ? true : false
                for (var i = 0; i < upgradeConsumables.length; ++i) {
                    inventoryInstanceData.upgrade.consumables.push({
                        id: upgradeConsumables[i].idItemConsumable,
                        name: upgradeConsumables[i].name,
                        image: upgradeConsumables[i].image,
                        description: upgradeConsumables[i].description,
                        quantity: upgradeConsumables[i].quantity
                    })
                }
            }
        } else if (inventoryType == 'recipe') {
            let craftType = 'tool'
            if (inventoryInstanceRawData[0].productName == null && inventoryInstanceRawData[0].productName1 == null) {
                console.log('**************** 2: ', inventoryInstanceRawData)
                throw 'The user hasn\'t got that inventory'
            } else if (inventoryInstanceRawData[0].productName == null) {
                craftType = 'item'
            }
            inventoryInstanceData.isAvailable = {
                craft: 1
            }
            let craftRequirements = []
            for (var i = 0; i < inventoryInstanceRawData.length; ++i) {
                const row = inventoryInstanceRawData[i]
                craftRequirements.push(row)
            }

            let craftIsAllowed = true
            let requirementsArray = []
            let idToolRequirement = {}
            let hasToolBurn = false
            for (let requirement of craftRequirements) {
                if (requirement.idResourceRequirement != null) {
                    if (!(requirement.isAncienAllowed && requirement.isWoodAllowed && requirement.isStoneAllowed)) {
                        craftIsAllowed = false
                    }
                    if (requirement.requiredAncien != 0) {
                        requirementsArray.push({
                            name: 'ancien',
                            image: process.env.ANCIEN_IMAGE,
                            quantity: requirement.requiredAncien,
                            isAllowed: requirement.isAncienAllowed
                        })
                    }
                    if (requirement.requiredWood != 0) {
                        requirementsArray.push({
                            name: 'wood',
                            image: process.env.WOOD_IMAGE,
                            quantity: requirement.requiredWood,
                            isAllowed: requirement.isWoodAllowed
                        })
                    }
                    if (requirement.requiredStone != 0) {
                        requirementsArray.push({
                            name: 'stone',
                            image: process.env.STONE_IMAGE,
                            quantity: requirement.requiredStone,
                            isAllowed: requirement.isStoneAllowed
                        })
                    }
                } else if (requirement.idItemRequirement != null) {
                    if (!requirement.isItemAllowed) {
                        craftIsAllowed = false
                    }
                    if (requirement.requiredItemQuantity != 0) {
                        requirementsArray.push({
                            name: requirement.requiredItemName,
                            image: requirement.requiredItemImage,
                            quantity: requirement.requiredItemQuantity,
                            isAllowed: requirement.isItemAllowed
                        })
                    }
                } else if (requirement.idToolRequirement != null && idToolRequirement[requirement.idToolRequirement] == undefined) {
                    idToolRequirement[requirement.idToolRequirement] = true
                    if (!requirement.isToolAllowed) {
                        craftIsAllowed = false
                    }
                    if (requirement.burn) {
                        hasToolBurn = true
                    }
                    requirementsArray.push({
                        name: requirement.requiredToolName,
                        image: requirement.requiredToolImage,
                        quantity: 1,
                        level: requirement.requiredToolLevel,
                        burn: requirement.burn,
                        isAllowed: requirement.isToolAllowed,
                        idToolLevel: requirement.requiredIdToolLevel
                    })
                } else if (requirement.idRecipeRequirement != null) {
                    if (!requirement.isRecipeAllowed) {
                        craftIsAllowed = false
                    }
                    if (requirement.requiredRecipeQuantity != 0) {
                        requirementsArray.push({
                            name: requirement.requiredRecipeName,
                            image: requirement.requiredRecipeImage,
                            quantity: requirement.requiredRecipeQuantity,
                            isAllowed: requirement.isRecipeAllowed
                        })
                    }
                }
            }
            craftIsAllowed = requirementsArray.length == 0 ? false : craftIsAllowed
            inventoryInstanceData.craft = {
                isAllowed: craftIsAllowed,
                probability: craftRequirements[0].chanceCraft,
                requirements: requirementsArray,
                hasToolBurn: hasToolBurn,
                hasConsumables: false,
                consumables: [],
                product: {
                    name: craftRequirements[0][craftType == 'tool' ? 'productName' : 'productName1'],
                    image: craftRequirements[0][craftType == 'tool' ? 'productImage' : 'productImage1'],
                    quantity: (craftType == 'tool' ? 1 : craftRequirements[0].productQuantity)
                }
            }

            let craftConsumables
            try {
                craftConsumables = await InventoryQueries.getRecipeConsumables(address)
            } catch (error) {
                logger.error(`Error in InventoryQueries.getRecipeConsumables: ${Utils.printErrorLog(error)}`)
                throw error
            }
            inventoryInstanceData.craft.hasConsumables = craftConsumables.length > 0 ? true : false
            for (var i = 0; i < craftConsumables.length; ++i) {
                inventoryInstanceData.craft.consumables.push({
                    id: craftConsumables[i].idItemConsumable,
                    name: craftConsumables[i].name,
                    image: craftConsumables[i].image,
                    description: craftConsumables[i].description,
                    quantity: craftConsumables[i].quantity
                })
            }

            let maxPossibleCraftCount
            try {
                maxPossibleCraftCount = await this.getMaxPossibleCraftCount(address, inventoryInstanceRawData[0].idRecipe)
            } catch (error) {
                logger.error(`Error in InventoryService.getMaxPossibleCraftCount: ${Utils.printErrorLog(error)}`)
                throw error
            }
            inventoryInstanceData.maxPossibleCraftCount = maxPossibleCraftCount
        }
        return inventoryInstanceData
    }

    static async getMaxPossibleCraftCount(address, idRecipe) {
        let maxPossibleCraftCount = 100

        let checkRequirements
        try {
            checkRequirements = await InventoryQueries.getRecipeRequirementsByIdRecipe(idRecipe)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getRecipeRequirementsByIdRecipe: ${Utils.printErrorLog(error)}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }

        let currentResource
        try {
            currentResource = await UserQueries.getResources(address)
        } catch (error) {
            logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
            throw error
        }
        let resourceRequirement = { ancien: 0, wood: 0, stone: 0 }, itemRequirement = [], recipeRequirement = []
        for (const requirement of checkRequirements) {
            if (requirement.idResourceRequirement != null) {
                if (currentResource.ancien < requirement.requiredAncien || currentResource.wood < requirement.requiredWood || currentResource.stone < requirement.requiredStone) {
                    return 0
                }
                if (requirement.requiredAncien != 0) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(currentResource.ancien / requirement.requiredAncien));
                }
                if (requirement.requiredWood != 0) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(currentResource.wood / requirement.requiredWood));
                }
                if (requirement.requiredStone != 0) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(currentResource.stone / requirement.requiredStone));
                }
                resourceRequirement = { ancien: requirement.requiredAncien, wood: requirement.requiredWood, stone: requirement.requiredStone }
                logger.debug(`resource - maxPossibleCraftCount: ${maxPossibleCraftCount}`)
            } else if (requirement.idItemRequirement != null) {
                let check
                try {
                    check = await InventoryQueries.getItemQuantity(address, requirement.requiredIdItem)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getItemQuantity: ${Utils.printErrorLog(error)}`)
                    throw error
                }
                if (check.length != 1 || check[0].quantity < requirement.requiredItemQuantity) {
                    return 0
                }
                if (requirement.requiredItemBurn == 1) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(check[0].quantity / requirement.requiredItemQuantity))
                    itemRequirement.push({ id: requirement.requiredIdItem, quantity: requirement.requiredItemQuantity, idInstance: check[0].idItemInstance, quantityInstance: check[0].quantity })
                    logger.debug(`item - maxPossibleCraftCount: ${maxPossibleCraftCount}`)
                }
            } else if (requirement.idToolRequirement != null) {
                let check
                try {
                    check = await InventoryQueries.getToolQuantity(address, requirement.requiredIdToolLevel)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getToolQuantity: ${Utils.printErrorLog(error)}`)
                    throw error
                }
                if (check.length == 0) {
                    return 0
                }
                if (requirement.requiredToolBurn == 1) {
                    return 1
                }
            } else if (requirement.idRecipeRequirement != null) {
                let check
                try {
                    check = await InventoryQueries.getRecipeQuantity(address, requirement.requiredIdRecipe)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getRecipeQuantity: ${Utils.printErrorLog(error)}`)
                    throw error
                }
                if (check.length != 1 || check[0].quantity < requirement.requiredRecipeQuantity) {
                    return 0
                }
                if (requirement.requiredRecipeBurn == 1) {
                    maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(check[0].quantity / requirement.requiredRecipeQuantity))
                    recipeRequirement.push({ id: requirement.requiredIdRecipe, quantity: requirement.requiredRecipeQuantity, idInstance: check[0].idRecipeInstance, quantityInstance: check[0].quantity })
                }
            }
        }

        return maxPossibleCraftCount
    }

    static async repairTool(address, idToolInstance, consumableIds) {
        let result

        try {
            result = await ToolService.repair(address, idToolInstance, consumableIds)
        } catch (error) {
            logger.error(`Error in ToolService.repair: ${Utils.printErrorLog(error)}`)
            throw error
        }

        let inventoryInstanceData = {}
        try {
            inventoryInstanceData = await InventoryService.getInventoryInstanceData(address, idToolInstance, 'tool')
        } catch (error) {
            logger.error(`Error in InventoryService.getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
            throw error
        }

        let toolIds = []
        toolIds.push(inventoryInstanceData.id)
        if (toolIds.length != 0) {
            toolIds = toolIds.join(', ')
            logger.info(`toolIds: ${toolIds}`)
            let toolBonuses
            try {
                toolBonuses = await ToolService.getToolBonuses(toolIds)
            } catch (error) {
                logger.error(`Error in ToolService.getToolBonuses: ${Utils.printErrorLog(error)}`)
                throw error
            }
            logger.info(`toolBonuses response: ${JSON.stringify(toolBonuses)}`)

            inventoryInstanceData.bonuses = toolBonuses[inventoryInstanceData.id] ? toolBonuses[inventoryInstanceData.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
        }

        if (result.inventory != undefined) {
            result.inventory.map(obj => {
                if (obj != null && obj != undefined && obj.action == 'edit') obj.elements.push(inventoryInstanceData)
                return obj
            })
        }

        return result
    }
    static async openChest(address, idItemInstance, openCount) {
        let response = { done: false, message: '', openedCount: '' }

        console.log("Morto 1")
        let check
        try {
            check = await InventoryQueries.checkIfUserHasChest(address, idItemInstance, openCount)
        } catch (error) {
            logger.error(`Error in InventoryQueries.checkIfUserHasChest: ${Utils.printErrorLog(error)}`)
            throw error
        }
        if (check.length == 0) {
            throw 'You don\'t have enough item'
        } else if (check[0].idChest == null) {
            throw 'That item is not the chest'
        }

        let idChest = check[0].idChest

        let openedCount = 0
        let editElementObj = {}, removeElementObj = {}, addElementObj = {}
        let editElements = [], removeElements = [], addElements = []

        let drops = []
        let hasDrop = {}
        // burn chest item
        let chestBurnt = false

        while (openedCount < openCount) {
            console.log("Morto 3")
            let result
            try {
                result = await InventoryQueries.checkRequirementsToOpenChest(address, idChest)
            } catch (error) {
                logger.error(`Error in InventoryQueries.checkRequirementsToOpenChest: ${Utils.printErrorLog(error)}`)
                throw error
            }

            console.log("Morto 4")
            let chestAllowed = result[0].isAncienAllowed && result[0].isWoodAllowed && result[0].isStoneAllowed && result[0].isItemAllowed
            if (!chestAllowed) {
                // stop opening chests
                break;
            }

            try {
                await UserQueries.subResources(address, result[0].requiredAncien, result[0].requiredWood, result[0].requiredStone)
            } catch (error) {
                logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`);
                throw error
            }

            // burn requirements
            if (result[0].idItemInstance != null && result[0].idItemInstance != undefined && result[0].burn == 1) {
                try {
                    await ItemQueries.subItemByIdItemInstance(result[0].idItemInstance, result[0].requiredItemQuantity)
                } catch (error) {
                    logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`);
                    throw error
                }

                let remainQuantity
                try {
                    remainQuantity = await ItemQueries.getQuantityByIdItemInstance(result[0].idItemInstance)
                } catch (error) {
                    logger.error(`Error in ItemQueries.getQuantityByIdItemInstance: ${Utils.printErrorLog(error)}`);
                    throw error
                }
                if (remainQuantity[0].quantity == 0) {
                    try {
                        await ItemQueries.removeItemInstance(result[0].idItemInstance)
                    } catch (error) {
                        logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                        throw error
                    }
                    delete addElementObj[result[0].idItemInstance];
                    delete editElementObj[result[0].idItemInstance];
                    removeElementObj[result[0].idItemInstance] = {
                        id: result[0].idItemInstance,
                        type: 'item'
                    }
                } else {
                    editElementObj[result[0].idItemInstance] = {
                        id: result[0].idItemInstance,
                        type: 'item',
                        quantity: remainQuantity[0].quantity
                    }
                }
            }

            let loots
            try {
                loots = await InventoryQueries.getChestLoots(idItemInstance)
                logger.debug(`InventoryQueries.getChestLoots response : ${JSON.stringify(loots)}`)
            } catch (error) {
                logger.error(`InventoryQueries.getChestLoots error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            try {
                await ItemQueries.subItemByIdItemInstance(idItemInstance, 1)
            } catch (error) {
                logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`);
                throw error
            }

            let chestQuantity
            try {
                chestQuantity = await ItemQueries.getQuantityByIdItemInstance(idItemInstance)
            } catch (error) {
                logger.error(`Error in ItemQueries.getQuantityByIdItemInstance: ${Utils.printErrorLog(error)}`);
                throw error
            }
            if (chestQuantity[0].quantity == 0) {
                try {
                    await ItemQueries.removeItemInstance(idItemInstance)
                } catch (error) {
                    logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                    throw error
                }
                chestBurnt = true
                delete addElementObj[idItemInstance];
                delete editElementObj[idItemInstance];
                removeElementObj[idItemInstance] = {
                    id: idItemInstance,
                    type: 'item'
                }
            } else {
                editElementObj[idItemInstance] = {
                    id: idItemInstance,
                    type: 'item',
                    quantity: chestQuantity[0].quantity
                }
            }

            let lootDrops = Math.max(Math.min(result[0].maxDrops, parseInt(FishermanService.exp_func(result[0].alpha, result[0].beta, random.int(1, 100)))), result[0].minDrops)
            if (loots.length == 0) {
                continue;
            }


            let randomNumber, baseNumber
            let remainQuantity
            let newRecipeInstance
            let newItemInstance

            while (lootDrops) {
                --lootDrops

                randomNumber = random.float(0, 100)
                baseNumber = 0

                let droppedLoot
                for (let loot of loots) {
                    baseNumber += loot.dropProbability

                    if (baseNumber >= randomNumber) {
                        droppedLoot = loot
                        break
                    }
                }

                let op, lootQuantity = Math.max(Math.min(droppedLoot.maxQuantity, parseInt(FishermanService.exp_func(droppedLoot.alpha, droppedLoot.beta, random.int(1, 100)))), 1)
                if (hasDrop[droppedLoot.type + droppedLoot.id]) {
                    drops.map(drop => {
                        if (drop.id == droppedLoot.id && drop.type == droppedLoot.type) {
                            drop.quantity += lootQuantity
                        }
                        return drop
                    })
                } else {
                    hasDrop[droppedLoot.type + droppedLoot.id] = true
                    drops.push({ id: droppedLoot.id, type: droppedLoot.type, rarity: droppedLoot.rarity, name: droppedLoot.name, image: droppedLoot.image, quantity: lootQuantity })
                }
                if (droppedLoot.type == 'recipe') {
                    try {
                        op = await FishermanQueries.checkIfUserHasRecipe(address, droppedLoot.id)
                        logger.debug(`FishermanQueries.checkIfUserHasRecipe response : ${JSON.stringify(op)}`)
                    } catch (error) {
                        logger.error(`FishermanQueries.checkIfUserHasRecipe error : ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }
                    if (op.length == 0) {
                        let create
                        try {
                            create = await FishermanQueries.createRecipeInstanceByAddressIdRecipeQuantity(address, droppedLoot.id, lootQuantity)
                            logger.debug(`FishermanQueries.createRecipeInstanceByAddressIdRecipeQuantity response : ${JSON.stringify(create)}`)
                        } catch (error) {
                            logger.error(`FishermanQueries.createRecipeInstanceByAddressIdRecipeQuantity error : ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        try {
                            newRecipeInstance = await InventoryQueries.getSingleInventoryData(address, droppedLoot.id, 'recipe')
                            logger.debug(`InventoryQueries.getSingleInventoryData response : ${JSON.stringify(newRecipeInstance)}`)
                        } catch (error) {
                            logger.error(`InventoryQueries.getSingleInventoryData error : ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        addElementObj[newRecipeInstance.id] = {
                            id: newRecipeInstance.id,
                            type: newRecipeInstance.type,
                            isChest: newRecipeInstance.isChest,
                            quantity: newRecipeInstance.quantity,
                            name: newRecipeInstance.name,
                            image: newRecipeInstance.image,
                            durability: newRecipeInstance.durability,
                            level: newRecipeInstance.level,
                            rarity: newRecipeInstance.rarity,
                            menu: {
                                craft: newRecipeInstance.craft,
                                view: newRecipeInstance.view,
                                send: newRecipeInstance.send,
                                sell: newRecipeInstance.sell
                            }
                        }
                    } else {
                        let update
                        try {
                            update = await FishermanQueries.updateRecipeInstanceByIdRecipeInstance(op[0].idRecipeInstance, lootQuantity)
                            logger.debug(`FishermanQueries.updateRecipeInstanceByIdRecipeInstance response : ${JSON.stringify(update)}`)
                        } catch (error) {
                            logger.error(`FishermanQueries.updateRecipeInstanceByIdRecipeInstance error : ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        try {
                            remainQuantity = await RecipeQueries.getQuantityByIdRecipeInstance(op[0].idRecipeInstance)
                        } catch (error) {
                            logger.error(`Error in RecipeQueries.getQuantityByIdRecipeInstance: ${Utils.printErrorLog(error)}`);
                            throw error
                        }
                        editElementObj[op[0].idRecipeInstance] = {
                            id: op[0].idRecipeInstance,
                            type: 'recipe',
                            quantity: remainQuantity.quantity
                        }
                    }
                } else if (droppedLoot.type == 'item') {
                    try {
                        op = await FishermanQueries.checkIfUserHasItem(address, droppedLoot.id)
                        logger.debug(`FishermanQueries.checkIfUserHasItem response : ${JSON.stringify(op)}`)
                    } catch (error) {
                        logger.error(`FishermanQueries.checkIfUserHasItem error : ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }
                    if (op.length == 0) {
                        let create
                        try {
                            create = await FishermanQueries.createItemInstanceByAddressIdItemQuantity(address, droppedLoot.id, lootQuantity)
                            logger.debug(`FishermanQueries.createItemInstanceByAddressIdItemQuantity response : ${JSON.stringify(create)}`)
                        } catch (error) {
                            logger.error(`FishermanQueries.createItemInstanceByAddressIdItemQuantity error : ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        try {
                            newItemInstance = await InventoryQueries.getSingleInventoryData(address, droppedLoot.id, 'item')
                            logger.debug(`InventoryQueries.getSingleInventoryData response : ${JSON.stringify(newItemInstance)}`)
                        } catch (error) {
                            logger.error(`InventoryQueries.getSingleInventoryData error : ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        addElementObj[newItemInstance.id] = {
                            id: newItemInstance.id,
                            type: newItemInstance.type,
                            isChest: newItemInstance.isChest,
                            quantity: newItemInstance.quantity,
                            name: newItemInstance.name,
                            image: newItemInstance.image,
                            durability: newItemInstance.durability,
                            level: newItemInstance.level,
                            rarity: newItemInstance.rarity,
                            menu: {
                                craft: newItemInstance.craft,
                                view: newItemInstance.view,
                                send: newItemInstance.send,
                                sell: newItemInstance.sell
                            }
                        }
                    } else {
                        let update
                        try {
                            update = await FishermanQueries.updateItemInstanceByIdItemInstance(op[0].idItemInstance, lootQuantity)
                            logger.debug(`FishermanQueries.updateItemInstanceByIdItemInstance response : ${JSON.stringify(update)}`)
                        } catch (error) {
                            logger.error(`FishermanQueries.updateItemInstanceByIdItemInstance error : ${Utils.printErrorLog(error)}`)
                            throw (error)
                        }
                        try {
                            remainQuantity = await ItemQueries.getQuantityByIdItemInstance(op[0].idItemInstance)
                        } catch (error) {
                            logger.error(`Error in ItemQueries.getQuantityByIdItemInstance: ${Utils.printErrorLog(error)}`);
                            throw error
                        }
                        editElementObj[op[0].idItemInstance] = {
                            id: op[0].idItemInstance,
                            type: 'item',
                            quantity: remainQuantity[0].quantity
                        }
                    }
                }

                //LOG CHEST OPENING - VARS
                let logChestOpening;
                let logChestOpeningInfo = {
                    address,
                    idChest,
                    lootNumber: lootDrops,
                    idItem: null,
                    idRecipe: null,
                    quantityBefore: 0,
                    quantity: lootQuantity,
                    quantityAfter: null,
                };
                //GET IDs
                if (droppedLoot.type == 'recipe') logChestOpeningInfo.idRecipe = droppedLoot.id
                if (droppedLoot.type == 'item') logChestOpeningInfo.idItem = droppedLoot.id
                //GET Quantity After - New Drop
                if (op.length == 0 && droppedLoot.type == 'recipe') logChestOpeningInfo.quantityAfter = newRecipeInstance.quantity
                if (op.length == 0 && droppedLoot.type == 'item') logChestOpeningInfo.quantityAfter = newItemInstance.quantity
                //GET Quantity After - Already Drop
                if (!op.length == 0) logChestOpeningInfo.quantityBefore = op[0].quantity
                if ((!op.length == 0) && droppedLoot.type == 'recipe') logChestOpeningInfo.quantityAfter = remainQuantity.quantity
                if ((!op.length == 0) && droppedLoot.type == 'item') logChestOpeningInfo.quantityAfter = remainQuantity[0].quantity
                //QUERY
                try {
                    logChestOpening = await InventoryQueries.logChestOpening(logChestOpeningInfo)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.logChestOpening: ${Utils.printErrorLog(error)}`)
                    throw error
                }
            }

            ++openedCount;
        }

        response.done = true
        response.openedCount = openedCount
        if (openedCount == openCount) {
            response.message = `All chests are opened successfully`
        } else if (openedCount == 0) {
            response.message = `Not enough cost - No chest opened`
        } else {
            response.message = `Not enough cost to open ALL chests - ${openedCount} opened`
        }
        for (const addElement in addElementObj) {
            addElements.push(addElementObj[addElement]);
        }
        for (const editElement in editElementObj) {
            editElements.push(editElementObj[editElement]);
        }
        for (const removeElement in removeElementObj) {
            removeElements.push(removeElementObj[removeElement]);
        }
        response.inventory = [
            {
                action: 'remove',
                elements: removeElements
            },
            {
                action: 'add',
                elements: addElements
            },
            {
                action: 'edit',
                elements: editElements
            },
        ]

        response.drop = drops

        let storage = {}
        let resources
        try {
            resources = await UserQueries.getResources(address)
        } catch (error) {
            logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`)
            throw error
        }
        storage.ancien = resources.ancien
        storage.wood = resources.wood
        storage.stone = resources.stone
        response.storage = storage

        if (!chestBurnt) {
            let inventoryInstanceData
            try {
                inventoryInstanceData = await InventoryService.getInventoryInstanceData(address, idItemInstance, 'item')
            } catch (error) {
                logger.error(`Error in InventoryService.getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
                throw error
            }

            response.inventory.push({
                action: 'edit',
                elements: [inventoryInstanceData]
            })
        }

        return response
    }
    static async upgradeTool(address, idToolInstance, consumableIds) {
        let result
        try {
            result = await ToolService.upgrade(address, idToolInstance, consumableIds)
        } catch (error) {
            logger.error(`Error in ToolService.upgrade: ${Utils.printErrorLog(error)}`);
            throw error
        }

        let inventoryInstanceData;
        try {
            inventoryInstanceData = await InventoryService.getInventoryInstanceData(address, idToolInstance, 'tool')
        } catch (error) {
            logger.error(`Error in InventoryService.getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
            throw error
        }

        if (result.inventory != undefined) {
            result.inventory.map(obj => {
                if (obj != null && obj != undefined && obj.action == 'edit') obj.elements.push(inventoryInstanceData)
                return obj
            })
        }

        return result
    }

    static async retrieveItems(inventory, address) {
        let items;

        //GET ITEMS by ADDRESS
        try {
            items = await ItemQueries.getItemInstanceAndItemByAddress(address)
        } catch (error) {
            logger.error(`Error in ItemQueries.getItemInstanceByAddress: ${Utils.printErrorLog(error)}`);
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                });
        }

        for (let item of items) {
            let itemObject = {};
            itemObject.id = item.idItemInstance;
            itemObject.name = item.name;
            itemObject.description = item.description;
            itemObject.image = item.image;
            itemObject.quantity = item.quantity;
            itemObject.type = 'item';

            itemObject.menu = {
                craft: item.craft,
                view: item.view,
                send: item.send
            }

            inventory.push(itemObject);
        }

        return inventory;
    }

    static async retrieveTools(inventory, address) {
        let tools;
        let toolsUpgrade;
        let toolsRepair;
        let toolsConsumables;

        let toolsGrouped;
        let toolsUpgradeGrouped;
        let toolsRepairGrouped;
        let toolsConsumablesGrouped;

        //GET RECIPES by ADDRESS
        try {
            tools = await ToolQueries.getToolsWithMenuByAddress(address)
        } catch (error) {
            logger.error(`Error in ToolQueries.getToolsWithMenuByAddress: ${Utils.printErrorLog(error)}`);
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                });
        }
        logger.debug(`ToolQueries.getToolsWithMenuByAddress response: ${JSON.stringify(tools)}`);
        //GET RECIPES by ADDRESS
        try {
            toolsUpgrade = await ToolQueries.getToolsWithUpgradeByAddress(address)
        } catch (error) {
            logger.error(`Error in ToolQueries.getToolsWithUpgradeByAddress: ${Utils.printErrorLog(error)}`);
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                });
        }
        logger.debug(`ToolQueries.getToolsWithUpgradeByAddress response: ${JSON.stringify(toolsUpgrade)}`);

        try {
            toolsRepair = await ToolQueries.getToolsWithRepairByAddress(address)
        } catch (error) {
            logger.error(`Error in ToolQueries.getToolsWithRepairByAddress: ${Utils.printErrorLog(error)}`);
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                });
        }
        logger.debug(`ToolQueries.getToolsWithRepairByAddress response: ${JSON.stringify(toolsRepair)}`);

        try {
            toolsConsumables = await ToolQueries.getToolsConsumablesAddress(address)
        } catch (error) {
            logger.error(`Error in ToolQueries.getToolsWithRepairByAddress: ${Utils.printErrorLog(error)}`);
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                });
        }
        logger.debug(`ToolQueries.getToolsWithRepairByAddress response: ${JSON.stringify(toolsConsumables)}`);


        toolsGrouped = InventoryHelper.groupBy(tools, "idToolInstance");
        toolsUpgradeGrouped = InventoryHelper.groupBy(toolsUpgrade, "idToolInstance");
        toolsRepairGrouped = InventoryHelper.groupBy(toolsRepair, "idToolInstance");
        toolsConsumablesGrouped = InventoryHelper.groupBy(toolsConsumables, "idToolInstance");

        console.log("toolsGrouped: ", toolsGrouped)
        console.log("toolsUpgradeGrouped: ", toolsUpgradeGrouped)
        console.log("toolsRepairGrouped: ", toolsRepairGrouped)
        console.log("toolsConsumablesGrouped: ", toolsConsumablesGrouped)

        for (let key in toolsGrouped) {
            let toolGrouped = toolsGrouped[key];
            let toolUpgradeGrouped = toolsUpgradeGrouped[key];
            let toolRepairGrouped = toolsRepairGrouped[key];
            let toolConsumablesGrouped = toolsConsumablesGrouped[key];
            console.log("Arrivato 1")

            for (let tool of toolGrouped) {

                let toolObject = {};

                let requirementsUpgrade = [];
                let requirementsRepair = [];
                let consumables = [];
                console.log("Arrivato 2")

                toolObject.id = tool.idToolInstance;
                toolObject.name = tool.name;
                toolObject.description = tool.description;
                toolObject.image = tool.image;
                toolObject.level = tool.level;
                toolObject.durability = tool.durability;
                toolObject.durabilityTotal = tool.durabilityTotal;
                toolObject.type = 'tool';
                console.log("Arrivato 3")

                toolObject.menu = {
                    craft: tool.craft,
                    view: tool.view,
                    send: tool.send
                }
                console.log("Arrivato 4")

                toolObject.isAvailable = {
                    upgrade: toolUpgradeGrouped && toolUpgradeGrouped.length > 0 ? true : false,
                    repair: toolRepairGrouped && toolRepairGrouped.length > 0 ? true : false
                }
                console.log("Arrivato 5")

                if (toolUpgradeGrouped && toolUpgradeGrouped.length > 0) {
                    toolObject.upgrade = {};

                    requirementsUpgrade = await ToolService.getRequirementsUpgradeV2(toolUpgradeGrouped);

                    toolObject.upgrade.isAllowed = RecipeHelper.checkRequirements(requirementsUpgrade);
                    toolObject.upgrade.probability = tool.chanceUpgrade;

                    toolObject.upgrade.hasConsumables = false;
                    toolObject.upgrade.requirements = requirementsUpgrade;

                    toolObject.upgrade.consumables = [];

                    if (toolConsumablesGrouped) {
                        for (let consumable of toolConsumablesGrouped) {
                            if (consumable.upgrade) {
                                let consumableObject = {};

                                consumableObject.id = consumable.idItemInstance;
                                consumableObject.description = consumable.description;
                                consumableObject.name = consumable.name;
                                consumableObject.image = consumable.image;
                                consumableObject.quantity = consumable.quantity;

                                toolObject.upgrade.consumables.push(consumableObject)
                            }
                        }
                    }
                }

                if (toolRepairGrouped && toolRepairGrouped.length > 0) {
                    toolObject.repair = {};

                    requirementsRepair = await ToolService.getRequirementsRepairV2(toolRepairGrouped);
                    console.log('7- requirementsRepair: ', requirementsRepair)

                    toolObject.repair.isAllowed =
                        RecipeHelper.checkRequirements(requirementsRepair)
                            && (toolObject.durability != tool.durabilityTotal)
                            ? true : false;
                    console.log('8')

                    toolObject.repair.hasConsumables = false;
                    toolObject.repair.requirements = requirementsRepair;

                    toolObject.repair.consumables = [];

                    console.log('9')

                    if (toolConsumablesGrouped) {
                        for (let consumable of toolConsumablesGrouped) {
                            console.log('[consumable]', consumable)
                            if (consumable.repair) {
                                let consumableObject = {};

                                consumableObject.id = consumable.idItemInstance;
                                consumableObject.description = consumable.description;
                                consumableObject.name = consumable.name;
                                consumableObject.image = consumable.image;
                                consumableObject.quantity = consumable.quantity;

                                toolObject.repair.consumables.push(consumableObject)
                            }
                        }
                    }
                }

                console.log("Arrivato 6")

                inventory.push(toolObject);
            }

        }

        return inventory
    }

    static async verifyEquipable(address, nftId, type, idTool) {
        //vedere se sono soddisfatti i rquirements per equipaggiare il tool al building
        // serve la rarity --> vedere livello nft
        logger.debug(`stampa debug ${address}, ${nftId} ${type} ${idTool}`);
        let rarity, userNft;
        try {
            rarity = await InventoryQueries.getRarity(idTool);
        } catch (error) {
            logger.error(`Error in InventoryQueries.getToolLevelGivenIdToolLevel: ${Utils.printErrorLog(error)}`);
            throw "Error in InventoryQueries.getToolLevelGivenIdToolLevel";
        }

        logger.debug(`InventoryQueries.getRarity response : ${JSON.stringify(rarity)}`);



        try {
            userNft = await BuildingsQueries.getNFT(nftId, type);
        } catch (error) {
            logger.error(`Error in InventoryQueries.getToolLevelGivenIdToolLevel: ${Utils.printErrorLog(error)}`);
            throw "Error in InventoryQueries.getToolLevelGivenIdToolLevel";
        }

        logger.debug(`BuildingsQueries.getNFT response : ${JSON.stringify(userNft)}`);

        switch (rarity[0].rarity) {
            case 0:
                return true;
            case 1:
                return true;
            case 2:
                if (userNft.level >= 4) return true;
                else return false;

            case 3:
                if (userNft.level >= 7) return true;
                else return false;
        }



    }

    static async setNewEquippedTool(nftId, type, OldidToolInstance, idToolInstance) {
        logger.debug(`setNewEquippedTool start`);
        let response;
        console.log("############################")
        console.log("############################")

        console.log("OldidToolInstance,idToolInstance: ", OldidToolInstance, idToolInstance)
        console.log("############################")
        console.log("############################")
        logger.debug(`getEquippedTool response : ${JSON.stringify(response)}`);

        try {
            response = await InventoryQueries.equipAndUnequipTool(OldidToolInstance, idToolInstance, nftId);
        } catch (error) {
            logger.error(`Error in InventoryQueries.equipAndUnequipTool: ${Utils.printErrorLog(error)}`);
            throw "Error in InventoryQueries.equipAndUnequipTool";
        }

        logger.debug(`InventoryQueries.equipAndUnequipTool response : ${JSON.stringify(response)}`);

        try {
            response = await InventoryQueries.setEquippedToolBuildings(idToolInstance, nftId, type);
        } catch (error) {
            logger.error(`Error in InventoryQueries.setEquippedToolBuildings: ${Utils.printErrorLog(error)}`);
            throw "Error in InventoryQueries.setEquippedToolBuildings";
        }


        logger.debug(`InventoryQueries.setEquippedToolBuildings response : ${JSON.stringify(response)}`);
        logger.debug(`setNewEquippedTool end`);
        return true;

    }

    static async getRecipeNPCInstanceData(idRecipe, address) {
        let inventoryInstanceRawData = []
        try {
            inventoryInstanceRawData = await InventoryQueries.getNPCRecipesInstance(address, idRecipe)
            console.log('**************** 1: ', inventoryInstanceRawData)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getNPCRecipesInstance: ${Utils.printErrorLog(error)}`)
            throw error
        }
        if (inventoryInstanceRawData.length == 0) {
            throw '#09126 The user hasn\'t got that inventory'
        }
        let inventoryInstanceData = {
            id: inventoryInstanceRawData[0].id,
            type: inventoryInstanceRawData[0].type,
            image: inventoryInstanceRawData[0].image,
            name: inventoryInstanceRawData[0].name,
            description: inventoryInstanceRawData[0].description,
            menu: {
                craft: inventoryInstanceRawData[0].craft,
                view: inventoryInstanceRawData[0].view,
                send: inventoryInstanceRawData[0].send,
                sell: inventoryInstanceRawData[0].sell
            }
        }
        let craftType = 'tool'
        if (inventoryInstanceRawData[0].productName == null && inventoryInstanceRawData[0].productName1 == null) {
            console.log('**************** 2: ', inventoryInstanceRawData)
            throw 'The user hasn\'t got that inventory'
        } else if (inventoryInstanceRawData[0].productName == null) {
            craftType = 'item'
        }
        inventoryInstanceData.isAvailable = {
            craft: 1
        }
        let craftRequirements = []
        for (var i = 0; i < inventoryInstanceRawData.length; ++i) {
            const row = inventoryInstanceRawData[i]
            craftRequirements.push(row)
        }

        let craftIsAllowed = true
        let requirementsArray = []
        let idToolRequirement = {}
        for (let requirement of craftRequirements) {
            if (requirement.idResourceRequirement != null) {
                if (!(requirement.isAncienAllowed && requirement.isWoodAllowed && requirement.isStoneAllowed)) {
                    craftIsAllowed = false
                }
                if (requirement.requiredAncien != 0) {
                    requirementsArray.push({
                        name: 'ancien',
                        image: process.env.ANCIEN_IMAGE,
                        quantity: requirement.requiredAncien,
                        isAllowed: requirement.isAncienAllowed
                    })
                }
                if (requirement.requiredWood != 0) {
                    requirementsArray.push({
                        name: 'wood',
                        image: process.env.WOOD_IMAGE,
                        quantity: requirement.requiredWood,
                        isAllowed: requirement.isWoodAllowed
                    })
                }
                if (requirement.requiredStone != 0) {
                    requirementsArray.push({
                        name: 'stone',
                        image: process.env.STONE_IMAGE,
                        quantity: requirement.requiredStone,
                        isAllowed: requirement.isStoneAllowed
                    })
                }
            } else if (requirement.idItemRequirement != null) {
                if (!requirement.isItemAllowed) {
                    craftIsAllowed = false
                }
                if (requirement.requiredItemQuantity != 0) {
                    requirementsArray.push({
                        name: requirement.requiredItemName,
                        image: requirement.requiredItemImage,
                        quantity: requirement.requiredItemQuantity,
                        isAllowed: requirement.isItemAllowed
                    })
                }
            } else if (requirement.idToolRequirement != null && idToolRequirement[requirement.idToolRequirement] == undefined) {
                idToolRequirement[requirement.idToolRequirement] = true
                if (!requirement.isToolAllowed) {
                    craftIsAllowed = false
                }
                requirementsArray.push({
                    name: requirement.requiredToolName,
                    image: requirement.requiredToolImage,
                    quantity: 1,
                    level: requirement.requiredToolLevel,
                    burn: requirement.burn,
                    isAllowed: requirement.isToolAllowed
                })
            } else if (requirement.idRecipeRequirement != null) {
                if (!requirement.isRecipeAllowed) {
                    craftIsAllowed = false
                }
                if (requirement.requiredRecipeQuantity != 0) {
                    requirementsArray.push({
                        name: requirement.requiredRecipeName,
                        image: requirement.requiredRecipeImage,
                        quantity: requirement.requiredRecipeQuantity,
                        isAllowed: requirement.isRecipeAllowed
                    })
                }
            }
        }
        craftIsAllowed = requirementsArray.length == 0 ? false : craftIsAllowed
        inventoryInstanceData.craft = {
            isAllowed: craftIsAllowed,
            probability: craftRequirements[0].chanceCraft,
            requirements: requirementsArray,
            hasConsumables: false,
            consumables: [],
            product: {
                name: craftRequirements[0][craftType == 'tool' ? 'productName' : 'productName1'],
                image: craftRequirements[0][craftType == 'tool' ? 'productImage' : 'productImage1'],
                quantity: (craftType == 'tool' ? 1 : craftRequirements[0].productQuantity)
            }
        }

        let craftConsumables
        try {
            craftConsumables = await InventoryQueries.getRecipeConsumables(address)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getRecipeConsumables: ${Utils.printErrorLog(error)}`)
            throw error
        }
        inventoryInstanceData.craft.hasConsumables = craftConsumables.length > 0 ? true : false
        for (var i = 0; i < craftConsumables.length; ++i) {
            inventoryInstanceData.craft.consumables.push({
                id: craftConsumables[i].idItemConsumable,
                name: craftConsumables[i].name,
                image: craftConsumables[i].image,
                description: craftConsumables[i].description,
                quantity: craftConsumables[i].quantity
            })
        }

        let maxPossibleCraftCount
        try {
            maxPossibleCraftCount = await this.getMaxPossibleCraftCount(address, idRecipe)
        } catch (error) {
            logger.error(`Error in InventoryService.getMaxPossibleCraftCount: ${Utils.printErrorLog(error)}`)
            throw error
        }
        inventoryInstanceData.maxPossibleCraftCount = maxPossibleCraftCount

        //Check if Recipe has a Max Qt and get the Remaining Supply -- START
        let recipesMax;
        let recipesAvailable;

        try {
            recipesMax = await RecipeQueries.getRecipesMaxAvailable(idRecipe)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getRecipesAvailableMax: ${Utils.printErrorLog(error)}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        if(recipesMax[0].max != null){
            try {
                recipesAvailable = await RecipeQueries.getRecipesAvailable(idRecipe)
            } catch (error) {
                logger.error(`Error in InventoryQueries.getRecipesAvailable: ${Utils.printErrorLog(error)}`)
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    })
            }

            console.log('AV: ', recipesAvailable[0]?.available)

            inventoryInstanceData.isAvailable.max = recipesMax[0]?.max
            inventoryInstanceData.isAvailable.now = (
                recipesAvailable[0]?.available <= 0
                    ? 0
                    : recipesAvailable[0]?.available
            )

            if(inventoryInstanceData.isAvailable.now <= 0){
                inventoryInstanceData.isAvailable.craft = 0;
            }

            if(inventoryInstanceData.maxPossibleCraftCount > recipesMax[0]?.maxCraft){
                inventoryInstanceData.maxPossibleCraftCount = recipesMax[0]?.maxCraft
            }
        }
        //Check if Recipe has a Max Qt -- END

        return inventoryInstanceData
    }

    static async getRecipeGemInstanceData(idRecipe, address) {
        let inventoryInstanceRawData = []
        try {
            inventoryInstanceRawData = await InventoryQueries.getGemRecipesInstance(address, idRecipe)
            console.log('**************** 1: ', inventoryInstanceRawData)
        } catch (error) {
            logger.error(`Error in InventoryQueries getGemRecipesInstance: ${Utils.printErrorLog(error)}`)
            throw error
        }
        if (inventoryInstanceRawData.length == 0) {
            throw 'The user hasn\'t got that inventory'
        }
        let inventoryInstanceData = {
            id: inventoryInstanceRawData[0].id,
            type: inventoryInstanceRawData[0].type,
            image: inventoryInstanceRawData[0].image,
            name: inventoryInstanceRawData[0].name,
            description: inventoryInstanceRawData[0].description,
            menu: {
                craft: inventoryInstanceRawData[0].craft,
                view: inventoryInstanceRawData[0].view,
                send: inventoryInstanceRawData[0].send,
                sell: inventoryInstanceRawData[0].sell
            }
        }
        let craftType = 'tool'
        if (inventoryInstanceRawData[0].productName == null && inventoryInstanceRawData[0].productName1 == null) {
            console.log('**************** 2: ', inventoryInstanceRawData)
            throw 'The user hasn\'t got that inventory'
        } else if (inventoryInstanceRawData[0].productName == null) {
            craftType = 'item'
        }
        inventoryInstanceData.isAvailable = {
            craft: 1
        }
        let craftRequirements = []
        for (var i = 0; i < inventoryInstanceRawData.length; ++i) {
            const row = inventoryInstanceRawData[i]
            craftRequirements.push(row)
        }

        let craftIsAllowed = true
        let requirementsArray = []
        let idToolRequirement = {}
        for (let requirement of craftRequirements) {
            if (requirement.idResourceRequirement != null) {
                if (!(requirement.isAncienAllowed && requirement.isWoodAllowed && requirement.isStoneAllowed)) {
                    craftIsAllowed = false
                }
                if (requirement.requiredAncien != 0) {
                    requirementsArray.push({
                        name: 'ancien',
                        image: process.env.ANCIEN_IMAGE,
                        quantity: requirement.requiredAncien,
                        isAllowed: requirement.isAncienAllowed
                    })
                }
                if (requirement.requiredWood != 0) {
                    requirementsArray.push({
                        name: 'wood',
                        image: process.env.WOOD_IMAGE,
                        quantity: requirement.requiredWood,
                        isAllowed: requirement.isWoodAllowed
                    })
                }
                if (requirement.requiredStone != 0) {
                    requirementsArray.push({
                        name: 'stone',
                        image: process.env.STONE_IMAGE,
                        quantity: requirement.requiredStone,
                        isAllowed: requirement.isStoneAllowed
                    })
                }
            } else if (requirement.idItemRequirement != null) {
                if (!requirement.isItemAllowed) {
                    craftIsAllowed = false
                }
                if (requirement.requiredItemQuantity != 0) {
                    requirementsArray.push({
                        name: requirement.requiredItemName,
                        image: requirement.requiredItemImage,
                        quantity: requirement.requiredItemQuantity,
                        isAllowed: requirement.isItemAllowed
                    })
                }
            } else if (requirement.idToolRequirement != null && idToolRequirement[requirement.idToolRequirement] == undefined) {
                idToolRequirement[requirement.idToolRequirement] = true
                if (!requirement.isToolAllowed) {
                    craftIsAllowed = false
                }
                requirementsArray.push({
                    name: requirement.requiredToolName,
                    image: requirement.requiredToolImage,
                    quantity: 1,
                    level: requirement.requiredToolLevel,
                    burn: requirement.burn,
                    isAllowed: requirement.isToolAllowed
                })
            } else if (requirement.idRecipeRequirement != null) {
                if (!requirement.isRecipeAllowed) {
                    craftIsAllowed = false
                }
                if (requirement.requiredRecipeQuantity != 0) {
                    requirementsArray.push({
                        name: requirement.requiredRecipeName,
                        image: requirement.requiredRecipeImage,
                        quantity: requirement.requiredRecipeQuantity,
                        isAllowed: requirement.isRecipeAllowed
                    })
                }
            }
        }
        craftIsAllowed = requirementsArray.length == 0 ? false : craftIsAllowed
        inventoryInstanceData.craft = {
            isAllowed: craftIsAllowed,
            probability: craftRequirements[0].chanceCraft,
            requirements: requirementsArray,
            hasConsumables: false,
            consumables: [],
            product: {
                name: craftRequirements[0][craftType == 'tool' ? 'productName' : 'productName1'],
                image: craftRequirements[0][craftType == 'tool' ? 'productImage' : 'productImage1'],
                quantity: (craftType == 'tool' ? 1 : craftRequirements[0].productQuantity)
            }
        }

        let craftConsumables
        try {
            craftConsumables = await InventoryQueries.getRecipeConsumables(address)
        } catch (error) {
            logger.error(`Error in InventoryQueries.getRecipeConsumables: ${Utils.printErrorLog(error)}`)
            throw error
        }
        inventoryInstanceData.craft.hasConsumables = craftConsumables.length > 0 ? true : false
        for (var i = 0; i < craftConsumables.length; ++i) {
            inventoryInstanceData.craft.consumables.push({
                id: craftConsumables[i].idItemConsumable,
                name: craftConsumables[i].name,
                image: craftConsumables[i].image,
                description: craftConsumables[i].description,
                quantity: craftConsumables[i].quantity
            })
        }

        let maxPossibleCraftCount
        try {
            maxPossibleCraftCount = await this.getMaxPossibleCraftCount(address, idRecipe)
        } catch (error) {
            logger.error(`Error in InventoryService.getMaxPossibleCraftCount: ${Utils.printErrorLog(error)}`)
            throw error
        }
        inventoryInstanceData.maxPossibleCraftCount = maxPossibleCraftCount

        return inventoryInstanceData
    }

    static async dropItem(address, idItem, quantity){
        //CHECK IF USER HAS THE ITEM
        let op;
        try {
            op = await FishermanQueries.checkIfUserHasItem(address, idItem);
            logger.debug(
            `FishermanQueries.checkIfUserHasItem response : ${JSON.stringify(op)}`
            );
        } catch (error) {
            logger.error(
            `FishermanQueries.checkIfUserHasItem error : ${Utils.printErrorLog(
                error
            )}`
            );
            throw error;
        }
        //IF THE USER DOESN'T HAVE THE ITEM
        if (op.length == 0) {
            //CREATE THE ITEM
            let create;
            try {
            create =
                await FishermanQueries.createItemInstanceByAddressIdItemQuantity(
                address,
                idItem,
                quantity
                );
            logger.debug(
                `FishermanQueries.createItemInstanceByAddressIdItemQuantity response : ${JSON.stringify(
                create
                )}`
            );
            } catch (error) {
            logger.error(
                `FishermanQueries.createItemInstanceByAddressIdItemQuantity error : ${Utils.printErrorLog(
                error
                )}`
            );
            throw error;
            }
            //IF THE USER ALREADY HAS THE ITEM
        } else {
            let update;
            try {
            update = await FishermanQueries.updateItemInstanceByIdItemInstance(
                op[0].idItemInstance,
                quantity
            );
            logger.debug(
                `FishermanQueries.updateItemInstanceByIdItemInstance response : ${JSON.stringify(
                update
                )}`
            );
            } catch (error) {
            logger.error(
                `FishermanQueries.updateItemInstanceByIdItemInstance error : ${Utils.printErrorLog(
                error
                )}`
            );
            throw error;
            }
        }
    }
}

module.exports = { InventoryService }