const logger = require("../logging/logger");
const Validator = require('../utils/validator')

const random = require('random');

const { InventoryValidation } = require("../validations/inventoryValidation")
const { InventoryQueries } = require(`../queries/inventoryQueries`)
const { InventoryService } = require("../services/inventory/inventoryService");
// uncompleted
const { ItemQueries } = require(`../queries/inventory/itemQueries`);

const { InventoryInterface } = require("../interfaces/JS/inventoryInterface");
const { InventoryHelper } = require("../helpers/inventoryHelper");
const { RecipeService } = require("../services/inventory/recipeService");
const { UserQueries } = require("../queries/userQueries");
const { RecipeQueries } = require("../queries/inventory/recipeQueries");
const { ToolQueries } = require("../queries/inventory/toolQueries");
const { Utils } = require("../utils/utils");
const { PassiveQueries } = require("../queries/passiveQueries");
const { ToolService } = require("../services/inventory/toolService");

//

async function getInventoryList(req, res) {
    logger.info(`getInventoryList START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation = InventoryValidation.getInventoryListValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let inventoryListRawData = []
    try {
        inventoryListRawData = await InventoryQueries.getInventoryListFromAddress(address)
    } catch (error) {
        logger.error(`Error in InventoryQueries.getInventoryListFromAddress: ${Utils.printErrorLog(error)}`)
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
    for (let inventory of inventoryListRawData) {
        if (inventory.type === 'tool') {
            toolIds.push(inventory.id)
        }
    }
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

        for (let inventory of inventoryListRawData) {
            if (inventory.type === 'tool') {
                inventory.bonuses = toolBonuses[inventory.id] ? toolBonuses[inventory.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
            } else {
                inventory.bonuses = []
            }
        }
    }

    let inventoryList = []
    for (var i = 0; i < inventoryListRawData.length; ++i) {
        let inventoryRawData = inventoryListRawData[i]
        inventoryList.push({
            id: inventoryRawData.id,
            idToolLevel: inventoryRawData.idToolLevel,
            bonuses: inventoryRawData.bonuses,
            type: inventoryRawData.type,
            isChest: inventoryRawData.isChest,
            quantity: inventoryRawData.quantity,
            name: inventoryRawData.name,
            image: inventoryRawData.image,
            durability: inventoryRawData.durability,
            level: inventoryRawData.level,
            rarity: inventoryRawData.rarity,
            menu: {
                craft: inventoryRawData.craft,
                view: inventoryRawData.view,
                send: inventoryRawData.send,
                sell: inventoryRawData.sell
            }
        })
    }

    logger.info(`getInventoryList END`)
    return res
        .status(200)
        .json({
            success: true,
            data: {
                inventoryList
            }
        })
}
async function getInventoryInstanceData(req, res) {
    logger.info(`getInventoryInstanceData START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation = InventoryValidation.getInventoryInstanceDataValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let idInventoryInstance = req.body.idInventoryInstance
    let inventoryType = req.body.inventoryType

    let inventoryInstanceData = {}
    try {
        inventoryInstanceData = await InventoryService.getInventoryInstanceData(address, idInventoryInstance, inventoryType)
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

    if (inventoryInstanceData.type == 'tool') {
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

            inventoryInstanceData.bonuses = toolBonuses[inventoryInstanceData.id] ? toolBonuses[inventoryInstanceData.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
        }
    }

    logger.info(`getInventoryInstanceData END`)

    return res
        .status(200)
        .json({
            success: true,
            data: {
                inventoryInstanceData
            }
        })
}
async function sendItem(req, res) {
    logger.info(`sendItem START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let validation;
    validation = InventoryValidation.sendItemValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let addressSender = req.locals.address
    let addressReceiver = req.body.receiver
    let idItemInstance = req.body.idItemInstance
    let quantity = parseInt(req.body.quantity)

    let quantityAfterSub;
    let userUpdate;

    let transferQueryResult;
    let transferObject = {};

    transferObject.sender = addressSender;
    transferObject.receiver = addressReceiver;
    transferObject.quantity = quantity;

    if (addressSender == addressReceiver) {
        return res
            .status(200)
            .json({
                success: false,
                error: {
                    errorMessage: 'Not allowed to send to your own address'
                }
            })
    }

    let senderItemData
    try {
        senderItemData = await InventoryQueries.getSenderItemData(addressSender, idItemInstance, quantity)
    } catch (error) {
        logger.error(`Error in InventoryQueries.getSenderItemData: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.debug(`getSenderItemData response : ${JSON.stringify(senderItemData)}`);

    if (senderItemData.length == 0) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'You haven\'t got that item.'
                }
            })
    } else if (senderItemData[0].expectedQuantity < 0) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'Not enough items to send.'
                }
            })
    }

    transferObject.id = senderItemData[0].idItem;
    transferObject.idName = 'idItem';


    let receiverValid
    try {
        receiverValid = await InventoryQueries.checkIfAddressExists(addressReceiver)
    } catch (error) {
        logger.error(`Error in InventoryQueries.checkIfAddressExists: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (receiverValid.length == 0) {
        return res
            .status(200)
            .json({
                success: false,
                error: {
                    errorMessage: 'Invalid receiver wallet address.'
                }
            })
    }
    //CHECKING IF IS SENDABLE
    let sendValid;
    try {
        sendValid = await ItemQueries.getMenuByIdItemInstance(idItemInstance)
    } catch (error) {
        logger.error(`Error in ItemQueries.getMenuByIdItemInstance: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (!sendValid.send) {
        logger.error(`Send is not allowed in sendItem: ${Utils.printErrorLog(sendValid)}`)

        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'Send is not allowed'
                }
            })
    }

    let receiverItemData
    try {
        receiverItemData = await InventoryQueries.getReceiverItemData(addressReceiver, senderItemData[0].idItem, quantity)
    } catch (error) {
        logger.error(`Error in InventoryQueries.getReceiverItemData: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.debug(`getReceiverItemData response : ${JSON.stringify(receiverItemData)}`);

    let editElements = [], removeElements = []

    try {
        userUpdate = await ItemQueries.subItemByIdItemAndAddress(addressSender, senderItemData[0].idItem, quantity)
    } catch (error) {
        console.log(error)
        logger.error(`Error in ItemQueries.subItemByIdItemAndAddress: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.debug(`subItemByIdItemAndAddress response : ${JSON.stringify(userUpdate)}`);

    if (userUpdate.changedRows != 1) {
        logger.error(`Error in Abuse sendItem, address: ${addressSender}, ipAddress:${Validator.getIpAddress(req)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                But also remember that we are logging everything.
                Unauthorized access is illegal.`
                }
            })
    }

    try {
        quantityAfterSub = await ItemQueries.getItemQuantityByAddressAndIdItem(addressSender, senderItemData[0].idItem)
    } catch (error) {
        console.log(error)
        logger.error(`Error in ItemQueries.getItemQuantityByAddressAndIdItem: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (quantityAfterSub.quantity == 0) {
        removeElements.push({
            id: idItemInstance,
            type: 'item'
        })
    } else {
        editElements.push({
            id: idItemInstance,
            type: 'item',
            quantity: quantityAfterSub.quantity
        })
    }

    if (receiverItemData.length == 0) {
        try {
            userUpdate = await InventoryQueries.updatedItemInstanceByAddress('create', addressReceiver, senderItemData[0].idItem, quantity)
        } catch (error) {
            console.log(error)
            logger.error(`Error in InventoryQueries.updatedItemInstanceByAddress: ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
    } else {
        try {
            userUpdate = await ItemQueries.addItemByIdItemAndAddress(addressReceiver, senderItemData[0].idItem, quantity)
        } catch (error) {
            logger.error(`Error in ItemQueries.addItemByIdItemAndAddress: ${Utils.printErrorLog(error)}`)
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

    transferObject.senderBalanceBefore = senderItemData[0].currentQuantity;
    transferObject.receiverBalanceBefore = receiverItemData.length == 0 ? 0 : receiverItemData[0].currentQuantity;

    transferObject.senderBalanceAfter = quantityAfterSub.quantity;
    transferObject.receiverBalanceAfter = receiverItemData.length == 0 ? quantity : receiverItemData[0].expectedQuantity;

    try {
        transferQueryResult = await InventoryQueries.setInventoryTransfer(transferObject);
    } catch (error) {
        logger.error(`Error in InventoryQueries.setInventoryTransfer, error: ${Utils.printErrorLog(error)}`)
    }

    logger.debug(`setInventoryTransfer response : ${JSON.stringify(transferQueryResult)}`);

    let inventory = [
        {
            action: 'edit',
            elements: editElements
        },
        {
            action: 'remove',
            elements: removeElements
        }
    ]

    logger.info(`sendItem END`)
    return res
        .json({
            success: true,
            data: {
                done: true,
                addressReceiver: addressReceiver,
                idItem: senderItemData[0].idItem,
                quantity: quantity,
                inventory: inventory
            }
        })
}
async function sendTool(req, res) {
    logger.info(`sendTool START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let validation;
    validation = InventoryValidation.sendToolValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let addressSender = req.locals.address
    let addressReceiver = req.body.receiver
    let idToolInstance = req.body.idToolInstance

    let transferQueryResult;
    let transferObject = {};

    transferObject.sender = addressSender;
    transferObject.receiver = addressReceiver;
    transferObject.quantity = 1;

    transferObject.id = idToolInstance;
    transferObject.idName = 'idToolInstance';


    if (addressSender == addressReceiver) {
        return res
            .status(200)
            .json({
                success: false,
                error: {
                    errorMessage: 'Not allowed to send to your own address'
                }
            })
    }

    let senderToolData
    try {
        senderToolData = await InventoryQueries.getSenderToolData(addressSender, idToolInstance)
    } catch (error) {
        logger.error(`Error in InventoryQueries.getSenderToolData: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.debug(`getSenderToolData response : ${JSON.stringify(senderToolData)}`)

    if (senderToolData.length == 0) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'You haven\'t got that tool.'
                }
            })
    }

    let receiverValid
    try {
        receiverValid = await InventoryQueries.checkIfAddressExists(addressReceiver)
    } catch (error) {
        logger.error(`Error in InventoryQueries.checkIfAddressExists: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (receiverValid.length == 0) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'Invalid receiver wallet address.'
                }
            })
    }
    //CHECKING IF IS SENDABLE
    let sendValid;
    try {
        sendValid = await ToolQueries.getMenuByIdToolInstance(idToolInstance)
    } catch (error) {
        logger.error(`Error in ToolQueries.getMenuByIdToolInstance: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (!sendValid.send) {
        logger.error(`Send is not allowed in sendTool: ${Utils.printErrorLog(sendValid)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'Send is not allowed'
                }
            })
    }

    let buildingUpdate
    try {
        buildingUpdate = await InventoryQueries.updateBuildingEquipped(senderToolData[0].idToolInstance)
    } catch (error) {
        logger.error(`Error in InventoryQueries.updateBuildingEquipped: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let userUpdate
    try {
        userUpdate = await InventoryQueries.changeToolOwner(senderToolData[0].idToolInstance, addressSender, addressReceiver)
    } catch (error) {
        logger.error(`Error in InventoryQueries.changeToolOwner: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.debug(`changeToolOwner response : ${JSON.stringify(userUpdate)}`)

    if (userUpdate.length == 0) {
        return res
            .json({
                success: false,
                error: {
                    errorMessage: 'Send has failed'
                }
            })
    }

    //Let's add the total quantity for that kind of tool
    transferObject.senderBalanceBefore = 1
    transferObject.receiverBalanceBefore = 0;

    transferObject.senderBalanceAfter = 0;
    transferObject.receiverBalanceAfter = 1;

    try {
        transferQueryResult = await InventoryQueries.setInventoryTransfer(transferObject);
    } catch (error) {
        logger.error(`Error in InventoryQueries.setInventoryTransfer, error: ${Utils.printErrorLog(error)}`)
    }

    logger.debug(`setInventoryTransfer response : ${JSON.stringify(transferQueryResult)}`)

    removeElements = []
    removeElements.push({
        id: idToolInstance,
        type: 'tool'
    })
    let inventory = [
        {
            action: 'remove',
            elements: removeElements
        }
    ]

    logger.info(`sendTool END`)
    return res
        .json({
            success: true,
            data: {
                done: true,
                addressReceiver: addressReceiver,
                idTool: senderToolData[0].idTool,
                inventory: inventory
            }
        })
}
async function repairTool(req, res) {
    logger.info(`repairTool START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation
    validation = InventoryValidation.repairToolValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let idToolInstance = req.body.idToolInstance
    let consumableIds = req.body.consumableIds

    let response = {}
    try {
        response = await InventoryService.repairTool(address, idToolInstance, consumableIds)
    } catch (error) {
        logger.error(`Error in InventoryService.repairTool: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
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
        logger.info(`repairTool END`)

        return res
            .status(200)
            .json({
                success: true,
                data: {
                    ...response
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
    if (passiveData == undefined) {
        logger.info(`repairTool END`)

        return res
            .status(200)
            .json({
                success: true,
                data: {
                    ...response
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

    let maxPerformableActions = Math.min(Math.floor(ancien / ancienCostPerEachFishingAction), passiveData.burntActions, passiveData.storedActions, Math.floor(rodDurability / 10))

    response.maxPerformableActions = maxPerformableActions

    logger.info(`repairTool END`)

    return res
        .status(200)
        .json({
            success: true,
            data: {
                ...response
            }
        })

}
async function upgradeTool(req, res) {
    logger.info(`upgradeTool START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation
    validation = InventoryValidation.upgradeToolValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let idToolInstance = req.body.idToolInstance
    let consumableIds = req.body.consumableIds

    let response = {}
    try {
        response = await InventoryService.upgradeTool(address, idToolInstance, consumableIds)
    } catch (error) {
        console.log("coddiego", error)
        logger.error(`Error in InventoryService.upgradeTool: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.info(`upgradeTool END`)

    return res
        .status(200)
        .json({
            success: true,
            data: {
                ...response
            }
        })
}
async function openChest(req, res) {
    logger.info(`openChest START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)


    let validation
    validation = InventoryValidation.openChestValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let idItemInstance = req.body.idItemInstance
    let openCount = req.body.openCount

    let response = {}
    try {
        response = await InventoryService.openChest(address, idItemInstance, openCount)
    } catch (error) {
        logger.error(`Error in InventoryService.openChest: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }

    logger.info(`openChest END`)

    return res
        .status(200)
        .json({
            success: true,
            data: {
                ...response
            }
        })
}
async function craft(req, res) {
    logger.info(`craft START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)

    let validation;
    validation = InventoryValidation.craftValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address
    let idRecipeInstance = req.body.idRecipeInstance
    let burnToolIds = req.body.burnToolIds
    let consumableIds = req.body.consumableIds
    let craftCount = req.body.craftCount

    let totalAncienSpent; //Need for AncientSpentReward

    let userRecipe
    try {
        userRecipe = await InventoryQueries.getRecipeGivenIdRecipeInstance(address, idRecipeInstance)
    } catch (error) {
        logger.error(`Error in InventoryQueries.getRecipeGivenIdRecipeInstance: ${Utils.printErrorLog(error)}`)
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (userRecipe.length != 1) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'User hasn\'t got that recipe'
                }
            })
    } else if (userRecipe[0].quantity < craftCount) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'Own 0 recipe - can\'t craft'
                }
            })
    } else if (craftCount > 100) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'You are forcing the API'
                }
            })
    }

    let checkRequirements
    try {
        checkRequirements = await InventoryQueries.getRecipeRequirements(address, idRecipeInstance)
    } catch (error) {
        logger.error(`Error in InventoryQueries.getRecipeRequirements: ${Utils.printErrorLog(error)}`)
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let maxPossibleCraftCount = craftCount

    logger.debug(`maxPossibleCraftCount: ${maxPossibleCraftCount}`)

    let currentResource
    try {
        currentResource = await UserQueries.getResources(address)
    } catch (error) {
        logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    let resourceRequirement = { ancien: 0, wood: 0, stone: 0 }, itemRequirement = [], recipeRequirement = []
    for (const requirement of checkRequirements) {
        if (requirement.idResourceRequirement != null) {
            if (currentResource.ancien < requirement.requiredAncien || currentResource.wood < requirement.requiredWood || currentResource.stone < requirement.requiredStone) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        error: {
                            errorMessage: 'You have not enough resource requirements to craft'
                        }
                    })
            }
            if (Validator.validateInput(requirement.requiredAncien) && requirement.requiredAncien != 0) {
                maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(currentResource.ancien / requirement.requiredAncien));
                resourceRequirement.ancien = requirement.requiredAncien;
            }
            if (Validator.validateInput(requirement.requiredWood) && requirement.requiredWood != 0) {
                maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(currentResource.wood / requirement.requiredWood));
                resourceRequirement.wood = requirement.requiredWood;
            }
            if (Validator.validateInput(requirement.requiredStone) && requirement.requiredStone != 0) {
                maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(currentResource.stone / requirement.requiredStone));
                resourceRequirement.stone = requirement.requiredStone;
            }

            logger.debug(`resource - maxPossibleCraftCount: ${maxPossibleCraftCount}`)
        } else if (requirement.idItemRequirement != null) {
            let check
            try {
                check = await InventoryQueries.getItemQuantity(address, requirement.requiredIdItem)
            } catch (error) {
                logger.error(`Error in InventoryQueries.getItemQuantity: ${Utils.printErrorLog(error)}`)
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    })
            }
            if (check.length != 1 || check[0].quantity < requirement.requiredItemQuantity) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        error: {
                            errorMessage: 'You have not enough item requirements to craft'
                        }
                    })
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
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    })
            }
            if (check.length == 0) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        error: {
                            errorMessage: 'You have not enough tool requirements to craft'
                        }
                    })
            }
            if (requirement.requiredToolBurn == 1) {
                let hasBurn = false
                for (const burnTool of check) {
                    const idToolInstance = burnTool.idToolInstance
                    for (const burnToolId of burnToolIds) {
                        if (burnToolId == idToolInstance) {
                            hasBurn = true
                            break
                        }
                    }
                    if (hasBurn) {
                        break
                    }
                }
                if (!hasBurn) {
                    return res
                        .status(401)
                        .json({
                            success: false,
                            error: {
                                errorMessage: 'You are forcing the API with out burning tools'
                            }
                        })
                }
                maxPossibleCraftCount = 1
            }
        } else if (requirement.idRecipeRequirement != null) {
            let check
            try {
                check = await InventoryQueries.getRecipeQuantity(address, requirement.requiredIdRecipe)
            } catch (error) {
                logger.error(`Error in InventoryQueries.getRecipeQuantity: ${Utils.printErrorLog(error)}`)
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    })
            }
            if (check.length != 1 || check[0].quantity < requirement.requiredRecipeQuantity) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        error: {
                            errorMessage: 'You have not enough recipe requirements to craft'
                        }
                    })
            }
            if (requirement.requiredRecipeBurn == 1) {
                maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(check[0].quantity / requirement.requiredRecipeQuantity))
                recipeRequirement.push({ id: requirement.requiredIdRecipe, quantity: requirement.requiredRecipeQuantity, idInstance: check[0].idRecipeInstance, quantityInstance: check[0].quantity })
            }
        }
    }

    let craftResponse = {};
    let craftResult;
    let craftObjects = [];
    let addElements = [], editElements = [], removeElements = []

    // crafted recipe
    let object = {};
    object.isGem = 0;
    object.isNPC = 0;
    object.address = address;
    object.inventoryType = 'recipe';
    object.idItem = null;
    object.idToolInstance = null;
    object.idRecipe = userRecipe[0].idRecipe;
    object.resourceType = null;
    object.requiredQuantity = maxPossibleCraftCount;
    object.quantityBefore = userRecipe[0].quantity;
    object.quantityAfter = (userRecipe[0].quantity - maxPossibleCraftCount);
    craftObjects.push(object);

    // resources
    if (resourceRequirement.ancien != 0) {
        let ancienObject = {}
        ancienObject.isGem = 0;
        ancienObject.isNPC = 0;
        ancienObject.address = address;
        ancienObject.inventoryType = null;
        ancienObject.idItem = null;
        ancienObject.idToolInstance = null;
        ancienObject.idRecipe = null;
        ancienObject.resourceType = 1;
        ancienObject.requiredQuantity = resourceRequirement.ancien * maxPossibleCraftCount;
        ancienObject.quantityBefore = currentResource.ancien;
        ancienObject.quantityAfter = currentResource.ancien - resourceRequirement.ancien * maxPossibleCraftCount;
        craftObjects.push(ancienObject);
        totalAncienSpent = ancienObject.requiredQuantity; //Need for AncienSpentReward
    }
    if (resourceRequirement.wood != 0) {
        let woodObject = {}
        woodObject.isGem = 0;
        woodObject.isNPC = 0;
        woodObject.address = address;
        woodObject.inventoryType = null;
        woodObject.idItem = null;
        woodObject.idToolInstance = null;
        woodObject.idRecipe = null;
        woodObject.resourceType = 2;
        woodObject.requiredQuantity = resourceRequirement.wood * maxPossibleCraftCount;
        woodObject.quantityBefore = currentResource.wood;
        woodObject.quantityAfter = currentResource.wood - resourceRequirement.wood * maxPossibleCraftCount;
        craftObjects.push(woodObject);
    }
    if (resourceRequirement.stone != 0) {
        let stoneObject = {}
        stoneObject.isGem = 0;
        stoneObject.isNPC = 0;
        stoneObject.address = address;
        stoneObject.inventoryType = null;
        stoneObject.idItem = null;
        stoneObject.idToolInstance = null;
        stoneObject.idRecipe = null;
        stoneObject.resourceType = 3;
        stoneObject.requiredQuantity = resourceRequirement.stone * maxPossibleCraftCount;
        stoneObject.quantityBefore = currentResource.stone;
        stoneObject.quantityAfter = currentResource.stone - resourceRequirement.stone * maxPossibleCraftCount;
        craftObjects.push(stoneObject);
    }

    try {
        await UserQueries.subResources(address, resourceRequirement.ancien * maxPossibleCraftCount, resourceRequirement.wood * maxPossibleCraftCount, resourceRequirement.stone * maxPossibleCraftCount)
    } catch (error) {
        logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`)
        return res
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
        logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    let storage = {}
    storage.ancien = resources.ancien
    storage.wood = resources.wood
    storage.stone = resources.stone
    craftResponse.storage = storage

    for (const i_req of itemRequirement) {
        let itemObject = {}
        itemObject.isGem = 0;
        itemObject.isNPC = 0;
        itemObject.address = address;
        itemObject.inventoryType = 'item';
        itemObject.idItem = i_req.id;
        itemObject.idToolInstance = null;
        itemObject.idRecipe = null;
        itemObject.resourceType = null;
        itemObject.requiredQuantity = i_req.quantity * maxPossibleCraftCount;
        itemObject.quantityBefore = i_req.quantityInstance;
        itemObject.quantityAfter = i_req.quantityInstance - i_req.quantity * maxPossibleCraftCount;
        craftObjects.push(itemObject);

        try {
            await ItemQueries.subItemByIdItemInstance(i_req.idInstance, i_req.quantity * maxPossibleCraftCount)
        } catch (error) {
            logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        if (itemObject.quantityAfter == 0) {
            try {
                await ItemQueries.removeItemInstance(i_req.idInstance)
            } catch (error) {
                logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    })
            }
            removeElements.push({
                id: i_req.idInstance,
                type: 'item'
            })
        } else {
            editElements.push({
                id: i_req.idInstance,
                type: 'item',
                quantity: itemObject.quantityAfter
            })
        }
    }

    let burnToolId = -1
    if (burnToolIds.length != 0) {
        burnToolId = burnToolIds[0];

        // log history
        let toolObject = {}
        toolObject.isGem = 0;
        toolObject.isNPC = 0;
        toolObject.address = address;
        toolObject.inventoryType = 'tool';
        toolObject.idItem = null;
        toolObject.idToolInstance = burnToolId;
        toolObject.idRecipe = null;
        toolObject.resourceType = null;
        toolObject.requiredQuantity = 1;
        toolObject.quantityBefore = 1;
        toolObject.quantityAfter = 0;
        craftObjects.push(toolObject);

        // remove tool instance
        try {
            await InventoryQueries.removeToolInstance(burnToolId)
        } catch (error) {
            logger.error(`Error in InventoryQueries.removeToolInstance: ${Utils.printErrorLog(error)}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }

        removeElements.push({
            id: burnToolId,
            type: 'tool'
        })
    }

    for (const i_req of recipeRequirement) {
        let recipeObject = {}
        recipeObject.isGem = 0;
        recipeObject.isNPC = 0;
        recipeObject.address = address;
        recipeObject.inventoryType = 'recipe';
        recipeObject.idItem = null;
        recipeObject.idToolInstance = null;
        recipeObject.idRecipe = i_req.id;
        recipeObject.resourceType = null;
        recipeObject.requiredQuantity = i_req.quantity * maxPossibleCraftCount;
        recipeObject.quantityBefore = i_req.quantityInstance;
        recipeObject.quantityAfter = i_req.quantityInstance - i_req.quantity * maxPossibleCraftCount;
        craftObjects.push(recipeObject);

        try {
            await InventoryQueries.subRecipe(address, i_req.idInstance, i_req.quantity * maxPossibleCraftCount)
        } catch (error) {
            logger.error(`Error in InventoryQueries.subRecipe: ${Utils.printErrorLog(error)}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        if (recipeObject.quantityAfter == 0) {
            try {
                await ItemQueries.removeRecipeInstance(i_req.idInstance)
            } catch (error) {
                logger.error(`Error in ItemQueries.removeRecipeInstance: ${Utils.printErrorLog(error)}`)
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    })
            }
            removeElements.push({
                id: i_req.idInstance,
                type: 'recipe'
            })
        } else {
            editElements.push({
                id: i_req.idInstance,
                type: 'recipe',
                quantity: recipeObject.quantityAfter
            })
        }
    }
    craftResponse.inventory = [
        {
            action: 'add',
            elements: addElements
        },
        {
            action: 'edit',
            elements: editElements
        },
        {
            action: 'remove',
            elements: removeElements
        }
    ]

    let recipeIndex = 0, failedRecipeCount = 0
    let craftType = checkRequirements[0].idTool == null ? 'item' : 'tool';
    while (recipeIndex < maxPossibleCraftCount) {
        ++recipeIndex
        let probability = random.int(0, 99)
        if (probability < checkRequirements[0].chanceCraft) {
            let idRecipe = userRecipe[0].idRecipe
            if (craftType == 'tool') {
                let craftedTool
                try {
                    craftedTool = await InventoryQueries.addCraftedTool(address, idRecipe)
                } catch (error) {
                    logger.error(`Error in InventoryQueries addCraftedItem: ${Utils.printErrorLog(error)}`)
                    return res
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }

                let idToolLevel
                try {
                    idToolLevel = await InventoryQueries.getIdToolLevelByIdRecipe(idRecipe)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getIdToolLevelByIdRecipe: ${Utils.printErrorLog(error)}`);
                    return res
                        .status(401)
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }
                let idToolInstance
                try {
                    idToolInstance = await InventoryQueries.getIdToolInstanceByAddressIdToolLevel(address, idToolLevel)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getIdToolInstanceByAddressIdToolLevel: ${Utils.printErrorLog(error)}`);
                    return res
                        .status(401)
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }

                // move original bonus info to the crafted tool instance
                if (burnToolId != -1) {
                    try {
                        await InventoryQueries.moveBonusInstance(burnToolId, idToolInstance)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries.moveBonusInstance: ${Utils.printErrorLog(error)}`);
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

                let toolData
                try {
                    toolData = await InventoryQueries.getToolInstanceData(idToolInstance)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getToolInstanceData: ${Utils.printErrorLog(error)}`)
                    return res
                        .status(401)
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }

                // get the bonus info of the tool
                let bonusInfo

                let toolIds = [idToolInstance]
                toolIds = toolIds.join(', ')
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
                bonusInfo = toolBonuses[idToolInstance] ? toolBonuses[idToolInstance].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']

                craftResponse.inventory.push({
                    action: 'add',
                    elements: [{
                        id: idToolInstance,
                        bonuses: bonusInfo,
                        type: 'tool',
                        quantity: 1,
                        level: toolData[0].level,
                        name: toolData[0].name,
                        image: toolData[0].image,
                        menu: {
                            craft: toolData[0].craft,
                            view: toolData[0].view,
                            send: toolData[0].send,
                            sell: toolData[0].sell
                        }
                    }]
                })
            } else {
                let userItemData
                try {
                    userItemData = await InventoryQueries.checkIfUserHasIdItem(address, checkRequirements[0].idItem, checkRequirements[0].itemQuantity)
                } catch (error) {
                    logger.error(`Error in InventoryQueries checkIfUserHasIdItem: ${Utils.printErrorLog(error)}`)
                    return res
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }
                let idItemInstance, newItemInstance
                if (userItemData.length == 0) {
                    let createItemInstance
                    try {
                        createItemInstance = await InventoryQueries.createItemInstance(address, checkRequirements[0].idItem, checkRequirements[0].itemQuantity)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries createItemInstance: ${Utils.printErrorLog(error)}`)
                        return res
                            .json({
                                success: false,
                                error: {
                                    errorMessage: error
                                }
                            })
                    }
                    try {
                        idItemInstance = await InventoryQueries.getIdItemInstance(address, checkRequirements[0].idItem)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries getIdItemInstance: ${Utils.printErrorLog(error)}`)
                        return res
                            .json({
                                success: false,
                                error: {
                                    errorMessage: error
                                }
                            })
                    }
                    try {
                        newItemInstance = await InventoryService.getInventoryInstanceData(address, idItemInstance.idItemInstance, 'item')
                    } catch (error) {
                        logger.error(`Error in InventoryQueries getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
                        return res
                            .json({
                                success: false,
                                error: {
                                    errorMessage: error
                                }
                            })
                    }
                    craftResponse.inventory.push({
                        action: 'add',
                        elements: [newItemInstance]
                    })
                } else {
                    idItemInstance = userItemData[0].idItemInstance
                    let updateItemInstance
                    try {
                        updateItemInstance = await InventoryQueries.updateItemInstance(userItemData[0].idItemInstance, userItemData[0].expectedQuantity)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries updateItemInstance: ${Utils.printErrorLog(error)}`)
                        return res
                            .json({
                                success: false,
                                error: {
                                    errorMessage: error
                                }
                            })
                    }
                    craftResponse.inventory.push({
                        action: 'edit',
                        elements: [{
                            id: idItemInstance,
                            type: 'item',
                            quantity: userItemData[0].expectedQuantity
                        }]
                    })
                }
            }
        } else {
            logger.debug(`probability: ${probability}, chanceCraft: ${checkRequirements[0].chanceCraft}`);
            ++failedRecipeCount
        }
    }

    if (failedRecipeCount == maxPossibleCraftCount) {
        craftResponse.done = false
        craftResponse.message = 'All recipes craft has failed'
    } else {
        craftResponse.done = true
        craftResponse.message = `${maxPossibleCraftCount - failedRecipeCount} recipes has been crafted successfully, ${failedRecipeCount} has failed`
    }

    logger.debug(`craftObject response : ${JSON.stringify(craftObjects)}`)

    try {
        craftResult = await InventoryQueries.setCraftHistory(craftObjects);
    } catch (error) {
        logger.error(`Error in InventoryQueries.setCraftHistory, error: ${Utils.printErrorLog(error)}`)
    }

    logger.debug(`setCraftHistory response : ${JSON.stringify(craftResult)}`);

    try {
        await InventoryQueries.subRecipe(address, idRecipeInstance, maxPossibleCraftCount)
    } catch (error) {
        logger.error(`Error in InventoryQueries subRecipe: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    if (userRecipe[0].quantity == maxPossibleCraftCount) {
        try {
            await ItemQueries.removeRecipeInstance(idRecipeInstance)
        } catch (error) {
            logger.error(`Error in ItemQueries.removeRecipeInstance: ${Utils.printErrorLog(error)}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        craftResponse.inventory.push({
            action: 'remove',
            elements: [{
                id: idRecipeInstance,
                type: 'recipe'
            }]
        })
    } else {
        let inventoryInstanceData
        try {
            inventoryInstanceData = await InventoryService.getInventoryInstanceData(address, idRecipeInstance, 'recipe')
        } catch (error) {
            logger.error(`Error in InventoryService.getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        craftResponse.inventory.push({
            action: 'edit',
            elements: [inventoryInstanceData]
        })
    }

    //Give Item Qt 1:1 with spent Ancien
    // console.log('ANCIEN SPENT: ', totalAncienSpent)
    if (totalAncienSpent) {
        InventoryService.dropItem(address, 50000, totalAncienSpent)
    }

    logger.info(`craft END`)

    return res
        .json({
            success: true,
            data: {
                ...craftResponse
            }
        })
}
async function craftNPC(req, res) {
    logger.info(`craft START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let validation;
    validation = InventoryValidation.craftNpcValidation(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    let address = req.locals.address;
    let idRecipe = req.body.idRecipe;
    let burnToolIds = req.body.burnToolIds
    let consumableIds = req.body.consumableIds
    let craftCount = req.body.craftCount

    let totalAncienSpent; //Need for AncientSpentReward

    //Check if Recipe has a Max Qt and get the Remaining Supply -- START
    let recipesMax;
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
    if (recipesMax[0].max != null) {

        if (recipesMax[0]?.maxCraft < craftCount) {
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: 'Quantity not allowed'
                    }
                })
        }

        let recipesAvailable;
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

        if (recipesAvailable[0].available == null || recipesAvailable[0].available <= 0 || craftCount > recipesAvailable[0].available) {
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: 'The supply is over!'
                    }
                })
        }
    }
    //Check if Recipe has a Max Qt -- END


    if (craftCount > 100) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'You are forcing the API'
                }
            })
    }

    let checkRequirements
    try {
        checkRequirements = await InventoryQueries.getNPCRecipeRequirements(idRecipe)
    } catch (error) {
        logger.error(`Error in InventoryQueries.getNPCRecipeRequirements: ${Utils.printErrorLog(error)}`)
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let maxPossibleCraftCount = craftCount

    logger.debug(`maxPossibleCraftCount: ${maxPossibleCraftCount}`)

    let currentResource
    try {
        currentResource = await UserQueries.getResources(address)
    } catch (error) {
        logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    let resourceRequirement = { ancien: 0, wood: 0, stone: 0 }, itemRequirement = [], recipeRequirement = []
    for (const requirement of checkRequirements) {
        if (requirement.idResourceRequirement != null) {
            if (currentResource.ancien < requirement.requiredAncien || currentResource.wood < requirement.requiredWood || currentResource.stone < requirement.requiredStone) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        error: {
                            errorMessage: 'You have not enough resource requirements to craft'
                        }
                    })
            }
            if (Validator.validateInput(requirement.requiredAncien) && requirement.requiredAncien != 0) {
                maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(currentResource.ancien / requirement.requiredAncien));
                resourceRequirement.ancien = requirement.requiredAncien;
            }
            if (Validator.validateInput(requirement.requiredWood) && requirement.requiredWood != 0) {
                maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(currentResource.wood / requirement.requiredWood));
                resourceRequirement.wood = requirement.requiredWood;
            }
            if (Validator.validateInput(requirement.requiredStone) && requirement.requiredStone != 0) {
                maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(currentResource.stone / requirement.requiredStone));
                resourceRequirement.stone = requirement.requiredStone;
            }

            logger.debug(`resource - maxPossibleCraftCount: ${maxPossibleCraftCount}`)
        } else if (requirement.idItemRequirement != null) {
            let check
            try {
                check = await InventoryQueries.getItemQuantity(address, requirement.requiredIdItem)
            } catch (error) {
                logger.error(`Error in InventoryQueries.getItemQuantity: ${Utils.printErrorLog(error)}`)
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    })
            }
            if (check.length != 1 || check[0].quantity < requirement.requiredItemQuantity) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        error: {
                            errorMessage: 'You have not enough item requirements to craft'
                        }
                    })
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
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    })
            }
            if (check.length == 0) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        error: {
                            errorMessage: 'You have not enough tool requirements to craft'
                        }
                    })
            }
            if (requirement.requiredToolBurn == 1) {
                let hasBurn = false
                for (const burnTool of check) {
                    const idToolInstance = burnTool.idToolInstance
                    for (const burnToolId of burnToolIds) {
                        if (burnToolId == idToolInstance) {
                            hasBurn = true
                            break
                        }
                    }
                    if (hasBurn) {
                        break
                    }
                }
                if (!hasBurn) {
                    return res
                        .status(401)
                        .json({
                            success: false,
                            error: {
                                errorMessage: 'You are forcing the API with out burning tools'
                            }
                        })
                }
                maxPossibleCraftCount = 1
            }
        } else if (requirement.idRecipeRequirement != null) {
            let check
            try {
                check = await InventoryQueries.getRecipeQuantity(address, requirement.requiredIdRecipe)
            } catch (error) {
                logger.error(`Error in InventoryQueries.getRecipeQuantity: ${Utils.printErrorLog(error)}`)
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    })
            }
            if (check.length != 1 || check[0].quantity < requirement.requiredRecipeQuantity) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        error: {
                            errorMessage: 'You have not enough recipe requirements to craft'
                        }
                    })
            }
            if (requirement.requiredRecipeBurn == 1) {
                maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(check[0].quantity / requirement.requiredRecipeQuantity))
                recipeRequirement.push({ id: requirement.requiredIdRecipe, quantity: requirement.requiredRecipeQuantity, idInstance: check[0].idRecipeInstance, quantityInstance: check[0].quantity })
            }
        }
    }

    let craftResponse = {};
    let craftResult;
    let craftObjects = [];
    let addElements = [], editElements = [], removeElements = []

    // crafted recipe
    let object = {};
    object.isGem = 0;
    object.isNPC = 1;
    object.address = address;
    object.inventoryType = 'recipe';
    object.idItem = null;
    object.idToolInstance = null;
    object.idRecipe = idRecipe;
    object.resourceType = null;
    object.requiredQuantity = maxPossibleCraftCount;
    object.quantityBefore = null;
    object.quantityAfter = null;
    craftObjects.push(object);

    // resources
    if (resourceRequirement.ancien != 0) {
        let ancienObject = {}
        ancienObject.isGem = 0;
        ancienObject.isNPC = 0;
        ancienObject.address = address;
        ancienObject.inventoryType = null;
        ancienObject.idItem = null;
        ancienObject.idToolInstance = null;
        ancienObject.idRecipe = null;
        ancienObject.resourceType = 1;
        ancienObject.requiredQuantity = resourceRequirement.ancien * maxPossibleCraftCount;
        ancienObject.quantityBefore = currentResource.ancien;
        ancienObject.quantityAfter = currentResource.ancien - resourceRequirement.ancien * maxPossibleCraftCount;
        craftObjects.push(ancienObject);
        totalAncienSpent = ancienObject.requiredQuantity; //Need for AncienSpentReward
    }
    if (resourceRequirement.wood != 0) {
        let woodObject = {}
        woodObject.isGem = 0;
        woodObject.isNPC = 0;
        woodObject.address = address;
        woodObject.inventoryType = null;
        woodObject.idItem = null;
        woodObject.idToolInstance = null;
        woodObject.idRecipe = null;
        woodObject.resourceType = 2;
        woodObject.requiredQuantity = resourceRequirement.wood * maxPossibleCraftCount;
        woodObject.quantityBefore = currentResource.wood;
        woodObject.quantityAfter = currentResource.wood - resourceRequirement.wood * maxPossibleCraftCount;
        craftObjects.push(woodObject);
    }
    if (resourceRequirement.stone != 0) {
        let stoneObject = {}
        stoneObject.isGem = 0;
        stoneObject.isNPC = 0;
        stoneObject.address = address;
        stoneObject.inventoryType = null;
        stoneObject.idItem = null;
        stoneObject.idToolInstance = null;
        stoneObject.idRecipe = null;
        stoneObject.resourceType = 3;
        stoneObject.requiredQuantity = resourceRequirement.stone * maxPossibleCraftCount;
        stoneObject.quantityBefore = currentResource.stone;
        stoneObject.quantityAfter = currentResource.stone - resourceRequirement.stone * maxPossibleCraftCount;
        craftObjects.push(stoneObject);
    }

    try {
        await UserQueries.subResources(address, resourceRequirement.ancien * maxPossibleCraftCount, resourceRequirement.wood * maxPossibleCraftCount, resourceRequirement.stone * maxPossibleCraftCount)
    } catch (error) {
        logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`)
        return res
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
        logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    let storage = {}
    storage.ancien = resources.ancien
    storage.wood = resources.wood
    storage.stone = resources.stone
    craftResponse.storage = storage

    for (const i_req of itemRequirement) {
        let itemObject = {}
        itemObject.isGem = 0;
        itemObject.isNPC = 0;
        itemObject.address = address;
        itemObject.inventoryType = 'item';
        itemObject.idItem = i_req.id;
        itemObject.idToolInstance = null;
        itemObject.idRecipe = null;
        itemObject.resourceType = null;
        itemObject.requiredQuantity = i_req.quantity * maxPossibleCraftCount;
        itemObject.quantityBefore = i_req.quantityInstance;
        itemObject.quantityAfter = i_req.quantityInstance - i_req.quantity * maxPossibleCraftCount;
        craftObjects.push(itemObject);

        try {
            await ItemQueries.subItemByIdItemInstance(i_req.idInstance, i_req.quantity * maxPossibleCraftCount)
        } catch (error) {
            logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        if (itemObject.quantityAfter == 0) {
            try {
                await ItemQueries.removeItemInstance(i_req.idInstance)
            } catch (error) {
                logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    })
            }
            removeElements.push({
                id: i_req.idInstance,
                type: 'item'
            })
        } else {
            editElements.push({
                id: i_req.idInstance,
                type: 'item',
                quantity: itemObject.quantityAfter
            })
        }
    }
    for (const burnToolId of burnToolIds) {
        let toolObject = {}
        toolObject.isGem = 0;
        toolObject.isNPC = 0;
        toolObject.address = address;
        toolObject.inventoryType = 'tool';
        toolObject.idItem = null;
        toolObject.idToolInstance = burnToolId;
        toolObject.idRecipe = null;
        toolObject.resourceType = null;
        toolObject.requiredQuantity = 1;
        toolObject.quantityBefore = 1;
        toolObject.quantityAfter = 0;
        craftObjects.push(toolObject);

        try {
            await InventoryQueries.removeToolInstance(burnToolId)
        } catch (error) {
            logger.error(`Error in InventoryQueries.removeToolInstance: ${Utils.printErrorLog(error)}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        removeElements.push({
            id: burnToolId,
            type: 'tool'
        })
    }
    for (const i_req of recipeRequirement) {
        let recipeObject = {}
        recipeObject.isGem = 0;
        recipeObject.isNPC = 0;
        recipeObject.address = address;
        recipeObject.inventoryType = 'recipe';
        recipeObject.idItem = null;
        recipeObject.idToolInstance = null;
        recipeObject.idRecipe = i_req.id;
        recipeObject.resourceType = null;
        recipeObject.requiredQuantity = i_req.quantity * maxPossibleCraftCount;
        recipeObject.quantityBefore = i_req.quantityInstance;
        recipeObject.quantityAfter = i_req.quantityInstance - i_req.quantity * maxPossibleCraftCount;
        craftObjects.push(recipeObject);

        try {
            await InventoryQueries.subRecipe(address, i_req.idInstance, i_req.quantity * maxPossibleCraftCount)
        } catch (error) {
            logger.error(`Error in InventoryQueries.subRecipe: ${Utils.printErrorLog(error)}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        if (recipeObject.quantityAfter == 0) {
            try {
                await ItemQueries.removeRecipeInstance(i_req.idInstance)
            } catch (error) {
                logger.error(`Error in ItemQueries.removeRecipeInstance: ${Utils.printErrorLog(error)}`)
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    })
            }
            removeElements.push({
                id: i_req.idInstance,
                type: 'recipe'
            })
        } else {
            editElements.push({
                id: i_req.idInstance,
                type: 'recipe',
                quantity: recipeObject.quantityAfter
            })
        }
    }
    craftResponse.inventory = [
        {
            action: 'add',
            elements: addElements
        },
        {
            action: 'edit',
            elements: editElements
        },
        {
            action: 'remove',
            elements: removeElements
        }
    ]

    let recipeIndex = 0, failedRecipeCount = 0
    let craftType = checkRequirements[0].idTool == null ? 'item' : 'tool';
    while (recipeIndex < maxPossibleCraftCount) {
        ++recipeIndex
        let probability = random.int(0, 99)
        if (probability < checkRequirements[0].chanceCraft) {
            if (craftType == 'tool') {
                let craftedTool
                try {
                    craftedTool = await InventoryQueries.addCraftedTool(address, idRecipe)
                } catch (error) {
                    logger.error(`Error in InventoryQueries addCraftedItem: ${Utils.printErrorLog(error)}`)
                    return res
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }

                let idToolLevel
                try {
                    idToolLevel = await InventoryQueries.getIdToolLevelByIdRecipe(idRecipe)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getIdToolLevelByIdRecipe: ${Utils.printErrorLog(error)}`);
                    return res
                        .status(401)
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }
                let idToolInstance
                try {
                    idToolInstance = await InventoryQueries.getIdToolInstanceByAddressIdToolLevel(address, idToolLevel)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getIdToolInstanceByAddressIdToolLevel: ${Utils.printErrorLog(error)}`);
                    return res
                        .status(401)
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }
                let toolData
                try {
                    toolData = await InventoryQueries.getToolInstanceData(idToolInstance)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getToolInstanceData: ${Utils.printErrorLog(error)}`)
                    return res
                        .status(401)
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }
                craftResponse.inventory.push({
                    action: 'add',
                    elements: [{
                        id: idToolInstance,
                        type: 'tool',
                        quantity: 1,
                        name: toolData[0].name,
                        image: toolData[0].image,
                        menu: {
                            craft: toolData[0].craft,
                            view: toolData[0].view,
                            send: toolData[0].send,
                            sell: toolData[0].sell
                        }
                    }]
                })
            } else {
                let userItemData
                try {
                    userItemData = await InventoryQueries.checkIfUserHasIdItem(address, checkRequirements[0].idItem, checkRequirements[0].itemQuantity)
                } catch (error) {
                    logger.error(`Error in InventoryQueries checkIfUserHasIdItem: ${Utils.printErrorLog(error)}`)
                    return res
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }
                let idItemInstance, newItemInstance
                if (userItemData.length == 0) {
                    let createItemInstance
                    try {
                        createItemInstance = await InventoryQueries.createItemInstance(address, checkRequirements[0].idItem, checkRequirements[0].itemQuantity)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries createItemInstance: ${Utils.printErrorLog(error)}`)
                        return res
                            .json({
                                success: false,
                                error: {
                                    errorMessage: error
                                }
                            })
                    }
                    try {
                        idItemInstance = await InventoryQueries.getIdItemInstance(address, checkRequirements[0].idItem)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries getIdItemInstance: ${Utils.printErrorLog(error)}`)
                        return res
                            .json({
                                success: false,
                                error: {
                                    errorMessage: error
                                }
                            })
                    }
                    try {
                        newItemInstance = await InventoryService.getInventoryInstanceData(address, idItemInstance.idItemInstance, 'item')
                    } catch (error) {
                        logger.error(`Error in InventoryQueries getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
                        return res
                            .json({
                                success: false,
                                error: {
                                    errorMessage: error
                                }
                            })
                    }
                    craftResponse.inventory.push({
                        action: 'add',
                        elements: [newItemInstance]
                    })
                } else {
                    idItemInstance = userItemData[0].idItemInstance
                    let updateItemInstance
                    try {
                        updateItemInstance = await InventoryQueries.updateItemInstance(userItemData[0].idItemInstance, userItemData[0].expectedQuantity)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries updateItemInstance: ${Utils.printErrorLog(error)}`)
                        return res
                            .json({
                                success: false,
                                error: {
                                    errorMessage: error
                                }
                            })
                    }
                    craftResponse.inventory.push({
                        action: 'edit',
                        elements: [{
                            id: idItemInstance,
                            type: 'item',
                            quantity: userItemData[0].expectedQuantity
                        }]
                    })
                }
            }
        } else {
            logger.debug(`probability: ${probability}, chanceCraft: ${checkRequirements[0].chanceCraft}`);
            ++failedRecipeCount
        }
    }

    if (failedRecipeCount == maxPossibleCraftCount) {
        craftResponse.done = false
        craftResponse.message = 'All recipes craft has failed'
    } else {
        craftResponse.done = true
        craftResponse.message = `${maxPossibleCraftCount - failedRecipeCount} recipes has been crafted successfully, ${failedRecipeCount} has failed`
    }

    logger.debug(`craftObject response : ${JSON.stringify(craftObjects)}`)

    try {
        craftResult = await InventoryQueries.setCraftHistory(craftObjects);
    } catch (error) {
        logger.error(`Error in InventoryQueries.setCraftHistory, error: ${Utils.printErrorLog(error)}`)
    }

    logger.debug(`setCraftHistory response : ${JSON.stringify(craftResult)}`);

    let recipeNPCData
    try {
        recipeNPCData = await InventoryService.getRecipeNPCInstanceData(idRecipe, address);
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
    craftResponse.currentRecipeData = recipeNPCData
    logger.info(`craftNPC END`)

    //Give Item Qt 1:1 with spent Ancien
    // console.log('ANCIEN SPENT: ', totalAncienSpent)
    if (totalAncienSpent) {
        InventoryService.dropItem(address, 50000, totalAncienSpent)
    }

    return res
        .json({
            success: true,
            data: {
                ...craftResponse
            }
        })
}
async function sendRecipe(req, res) {
    logger.info(`sendRecipe START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let validation;
    validation = InventoryValidation.sendRecipeValidation(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let addressSender = req.locals.address
    let addressReceiver = req.body.receiver
    let idRecipeInstance = req.body.idRecipeInstance
    let quantity = parseInt(req.body.quantity)

    let quantityAfterSub;
    let userUpdate;

    let transferQueryResult;
    let transferObject = {};

    transferObject.sender = addressSender;
    transferObject.receiver = addressReceiver;
    transferObject.quantity = quantity;

    if (addressSender == addressReceiver) {
        return res
            .status(200)
            .json({
                success: false,
                error: {
                    errorMessage: 'Not allowed to send to your own address'
                }
            })
    }

    let senderRecipeData
    try {
        senderRecipeData = await InventoryQueries.getSenderRecipeData(addressSender, idRecipeInstance, quantity)
    } catch (error) {
        logger.error(`Error in InventoryQueries.getSenderRecipeData: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.debug(`getSenderRecipeData response : ${JSON.stringify(senderRecipeData)}`)

    if (senderRecipeData.length == 0) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'You haven\'t got that recipe.'
                }
            })
    } else if (senderRecipeData[0].expectedQuantity < 0) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'Not enough recipes to send.'
                }
            })
    }

    transferObject.id = senderRecipeData[0].idRecipe;
    transferObject.idName = 'idRecipe';

    let receiverValid
    try {
        receiverValid = await InventoryQueries.checkIfAddressExists(addressReceiver)
    } catch (error) {
        logger.error(`Error in InventoryQueries.checkIfAddressExists: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (receiverValid.length == 0) {
        return res
            .status(200)
            .json({
                success: false,
                error: {
                    errorMessage: 'Invalid receiver wallet address.'
                }
            })
    }
    //CHECKING IF IS SENDABLE
    let sendValid;
    try {
        sendValid = await RecipeQueries.getMenuByIdRecipeInstance(idRecipeInstance)
    } catch (error) {
        logger.error(`Error in RecipeQueries.getMenuByIdRecipeInstance: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    if (!sendValid.send) {
        logger.error(`Send is not allowed in sendRecipe: ${Utils.printErrorLog(sendValid)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'Send is not allowed'
                }
            })
    }

    let receiverRecipeData
    try {
        receiverRecipeData = await InventoryQueries.getReceiverRecipeData(addressReceiver, senderRecipeData[0].idRecipe, quantity)
    } catch (error) {
        logger.error(`Error in InventoryQueries.getReceiverRecipeData: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.debug(`getReceiverRecipeData response : ${JSON.stringify(receiverRecipeData)}`)

    let editElements = [], removeElements = []

    try {
        userUpdate = await RecipeQueries.subRecipeByIdRecipeAndAddress(addressSender, senderRecipeData[0].idRecipe, quantity)
    } catch (error) {
        logger.error(`Error in RecipeQueries.subRecipeByIdRecipeAndAddress: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.debug(`subRecipeByIdRecipeAndAddress response : ${JSON.stringify(userUpdate)}`)

    if (userUpdate.changedRows != 1) {
        logger.error(`Error in Abuse sendRecipe, address: ${addressSender}, ipAddress:${Validator.getIpAddress(req)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: `We are happy that you are forcing the APIs, remember that we have bug bounties if you find something.
                But also remember that we are logging everything.
                Unauthorized access is illegal.`
                }
            })
    }

    try {
        quantityAfterSub = await RecipeQueries.getRecipeQuantityByAddressAndIdRecipe(addressSender, senderRecipeData[0].idRecipe, quantity)
    } catch (error) {
        logger.error(`Error in RecipeQueries.subRecipeByIdRecipeAndAddress: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    if (quantityAfterSub.quantity == 0) {
        removeElements.push({
            id: idRecipeInstance,
            type: 'recipe'
        })
    } else {
        editElements.push({
            id: idRecipeInstance,
            type: 'recipe',
            quantity: quantityAfterSub.quantity
        })
    }

    if (receiverRecipeData.length == 0) {
        try {
            userUpdate = await InventoryQueries.updatedRecipeInstanceByAddress('create', addressReceiver, senderRecipeData[0].idRecipe, quantity)
        } catch (error) {
            logger.error(`Error in InventoryQueries.updatedRecipeInstanceByAddress: ${Utils.printErrorLog(error)}`)
            return res
                .status(401)
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
    } else {
        try {
            userUpdate = await RecipeQueries.addRecipeByIdRecipeAndAddress(addressReceiver, senderRecipeData[0].idRecipe, quantity)
        } catch (error) {
            logger.error(`Error in RecipeQueries.addRecipeByIdRecipesendrecipeAndAddress: ${Utils.printErrorLog(error)}`)
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

    transferObject.senderBalanceBefore = senderRecipeData[0].currentQuantity;
    transferObject.receiverBalanceBefore = receiverRecipeData.length == 0 ? 0 : receiverRecipeData[0].currentQuantity;

    transferObject.senderBalanceAfter = quantityAfterSub.quantity;
    transferObject.receiverBalanceAfter = receiverRecipeData.length == 0 ? quantity : receiverRecipeData[0].expectedQuantity;

    try {
        transferQueryResult = await InventoryQueries.setInventoryTransfer(transferObject);
    } catch (error) {
        logger.error(`Error in InventoryQueries.setInventoryTransfer, error: ${Utils.printErrorLog(error)}`)
    }

    logger.debug(`setInventoryTransfer response : ${JSON.stringify(transferQueryResult)}`)

    let inventory = [
        {
            action: 'edit',
            elements: editElements
        },
        {
            action: 'remove',
            elements: removeElements
        }
    ]

    logger.info(`sendRecipe END`)
    return res
        .json({
            success: true,
            data: {
                done: true,
                addressReceiver: addressReceiver,
                idRecipe: senderRecipeData[0].idRecipe,
                quantity: quantity,
                inventory: inventory
            }
        })
}

async function getRecipeNPC(req, res) {
    logger.info(`getRecipeNpc START  ipAddress: ${Validator.getIpAddress(req)}`);

    let recipeList;

    try {
        recipeList = await InventoryQueries.getNPCRecipes()
    } catch (error) {
        logger.error(`Error in InventoryQueries.getNPCRecipes: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    if (recipeList.length == 0) {
        console.log("length 0")
    }

    let recipeListFinal = []
    for (var i = 0; i < recipeList.length; ++i) {
        let recipeListRaw = recipeList[i]
        recipeListFinal.push({
            id: recipeListRaw.id,
            name: recipeListRaw.name,
            image: recipeListRaw.image,
            rarity: recipeListRaw.rarity,
        })
    }

    logger.info(`getRecipeNpc END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                recipeListFinal
            }
        })
}

async function getRecipeNPCInstance(req, res) {
    logger.info(`getRecipeNPCInstance START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let validation = InventoryValidation.getRecipeNPCInstanceValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address;
    let idRecipe = req.body.idRecipe;

    let recipeNPCData = {}
    try {
        recipeNPCData = await InventoryService.getRecipeNPCInstanceData(idRecipe, address);
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

    logger.info(`getRecipeNPCInstance END`)

    return res
        .status(200)
        .json({
            success: true,
            data: {
                recipeNPCData
            }
        })
}

async function getRecipeGem(req, res) {
    logger.info(`getRecipeGem START  ipAddress: ${Validator.getIpAddress(req)}`);

    let recipeList;

    try {
        recipeList = await InventoryQueries.getGemRecipes()
    } catch (error) {
        logger.error(`Error in InventoryQueries getGemRecipes: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    if (recipeList.length == 0) {
        console.log("length 0")
    }

    let recipeListFinal = []
    for (var i = 0; i < recipeList.length; ++i) {
        let recipeListRaw = recipeList[i]
        recipeListFinal.push({
            id: recipeListRaw.id,
            name: recipeListRaw.name,
            image: recipeListRaw.image,
            rarity: recipeListRaw.rarity,
        })
    }

    logger.info(`getGemRecipes END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                recipeListFinal
            }
        })
}

async function getBundleGem(req, res) {
    logger.info(`getBundleGem START  ipAddress: ${Validator.getIpAddress(req)}`);

    let gemList;

    try {
        gemList = await InventoryQueries.getBundleGem()
    } catch (error) {
        logger.error(`Error in InventoryQueries getBundleGem: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    if (gemList.length == 0) {
        console.log("length 0")
    }

    logger.info(`getBundleGem END`);

    return res
        .status(200)
        .json({
            success: true,
            data: {
                gemList
            }
        })
}

async function getRecipeGemInstance(req, res) {
    logger.info(`getRecipeGemInstance START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let validation = InventoryValidation.getRecipeGemInstanceValidation(req)
    if (!validation.success) {
        return res
            .status(401)
            .json(validation)
    }

    let address = req.locals.address;
    let idRecipe = req.body.idRecipe;

    let recipeGemData = {}
    try {
        recipeGemData = await InventoryService.getRecipeGemInstanceData(idRecipe, address);
    } catch (error) {
        logger.error(`Error in InventoryService getRecipeGemInstanceData: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    logger.info(`getRecipeGemInstance END`)

    return res
        .status(200)
        .json({
            success: true,
            data: {
                recipeGemData
            }
        })
}

async function craftGem(req, res) {
    logger.info(`craftGem START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);


    let validation;
    validation = InventoryValidation.craftGemValidation(req);
    if (!validation.success) {
        return res
            .status(401)
            .json(validation);
    }

    let address = req.locals.address;
    let idRecipe = req.body.idRecipe;
    let burnToolIds = req.body.burnToolIds
    let consumableIds = req.body.consumableIds
    let craftCount = req.body.craftCount

    if (craftCount > 100) {
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: 'You are forcing the API'
                }
            })
    }

    let checkRequirements
    try {
        checkRequirements = await InventoryQueries.getGemRecipeRequirements(idRecipe)
    } catch (error) {
        logger.error(`Error in InventoryQueries.getGemRecipeRequirements: ${Utils.printErrorLog(error)}`)
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }

    let maxPossibleCraftCount = craftCount

    logger.debug(`maxPossibleCraftCount: ${maxPossibleCraftCount}`)

    let currentResource
    try {
        currentResource = await UserQueries.getResources(address)
    } catch (error) {
        logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    let resourceRequirement = { ancien: 0, wood: 0, stone: 0 }, itemRequirement = [], recipeRequirement = []
    for (const requirement of checkRequirements) {
        if (requirement.idResourceRequirement != null) {
            if (currentResource.ancien < requirement.requiredAncien || currentResource.wood < requirement.requiredWood || currentResource.stone < requirement.requiredStone) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        error: {
                            errorMessage: 'You have not enough resource requirements to craft'
                        }
                    })
            }
            if (Validator.validateInput(requirement.requiredAncien) && requirement.requiredAncien != 0) {
                maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(currentResource.ancien / requirement.requiredAncien));
                resourceRequirement.ancien = requirement.requiredAncien;
            }
            if (Validator.validateInput(requirement.requiredWood) && requirement.requiredWood != 0) {
                maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(currentResource.wood / requirement.requiredWood));
                resourceRequirement.wood = requirement.requiredWood;
            }
            if (Validator.validateInput(requirement.requiredStone) && requirement.requiredStone != 0) {
                maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(currentResource.stone / requirement.requiredStone));
                resourceRequirement.stone = requirement.requiredStone;
            }

            logger.debug(`resource - maxPossibleCraftCount: ${maxPossibleCraftCount}`)
        } else if (requirement.idItemRequirement != null) {
            let check
            try {
                check = await InventoryQueries.getItemQuantity(address, requirement.requiredIdItem)
            } catch (error) {
                logger.error(`Error in InventoryQueries.getItemQuantity: ${Utils.printErrorLog(error)}`)
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    })
            }
            if (check.length != 1 || check[0].quantity < requirement.requiredItemQuantity) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        error: {
                            errorMessage: 'You have not enough item requirements to craft'
                        }
                    })
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
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    })
            }
            if (check.length == 0) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        error: {
                            errorMessage: 'You have not enough tool requirements to craft'
                        }
                    })
            }
            if (requirement.requiredToolBurn == 1) {
                let hasBurn = false
                for (const burnTool of check) {
                    const idToolInstance = burnTool.idToolInstance
                    for (const burnToolId of burnToolIds) {
                        if (burnToolId == idToolInstance) {
                            hasBurn = true
                            break
                        }
                    }
                    if (hasBurn) {
                        break
                    }
                }
                if (!hasBurn) {
                    return res
                        .status(401)
                        .json({
                            success: false,
                            error: {
                                errorMessage: 'You are forcing the API with out burning tools'
                            }
                        })
                }
                maxPossibleCraftCount = 1
            }
        } else if (requirement.idRecipeRequirement != null) {
            let check
            try {
                check = await InventoryQueries.getRecipeQuantity(address, requirement.requiredIdRecipe)
            } catch (error) {
                logger.error(`Error in InventoryQueries.getRecipeQuantity: ${Utils.printErrorLog(error)}`)
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    })
            }
            if (check.length != 1 || check[0].quantity < requirement.requiredRecipeQuantity) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        error: {
                            errorMessage: 'You have not enough recipe requirements to craft'
                        }
                    })
            }
            if (requirement.requiredRecipeBurn == 1) {
                maxPossibleCraftCount = Math.min(maxPossibleCraftCount, parseInt(check[0].quantity / requirement.requiredRecipeQuantity))
                recipeRequirement.push({ id: requirement.requiredIdRecipe, quantity: requirement.requiredRecipeQuantity, idInstance: check[0].idRecipeInstance, quantityInstance: check[0].quantity })
            }
        }
    }

    let craftResponse = {};
    let craftResult;
    let craftObjects = [];
    let addElements = [], editElements = [], removeElements = []

    // crafted recipe
    let object = {};
    object.isGem = 1;
    object.isNPC = 0;
    object.address = address;
    object.inventoryType = 'recipe';
    object.idItem = null;
    object.idToolInstance = null;
    object.idRecipe = idRecipe;
    object.resourceType = null;
    object.requiredQuantity = maxPossibleCraftCount;
    object.quantityBefore = null;
    object.quantityAfter = null;
    craftObjects.push(object);

    // resources
    if (resourceRequirement.ancien != 0) {
        let ancienObject = {}
        ancienObject.isGem = 0;
        ancienObject.isNPC = 0;
        ancienObject.address = address;
        ancienObject.inventoryType = null;
        ancienObject.idItem = null;
        ancienObject.idToolInstance = null;
        ancienObject.idRecipe = null;
        ancienObject.resourceType = 1;
        ancienObject.requiredQuantity = resourceRequirement.ancien * maxPossibleCraftCount;
        ancienObject.quantityBefore = currentResource.ancien;
        ancienObject.quantityAfter = currentResource.ancien - resourceRequirement.ancien * maxPossibleCraftCount;
        craftObjects.push(ancienObject);
    }
    if (resourceRequirement.wood != 0) {
        let woodObject = {}
        woodObject.isGem = 0;
        woodObject.isNPC = 0;
        woodObject.address = address;
        woodObject.inventoryType = null;
        woodObject.idItem = null;
        woodObject.idToolInstance = null;
        woodObject.idRecipe = null;
        woodObject.resourceType = 2;
        woodObject.requiredQuantity = resourceRequirement.wood * maxPossibleCraftCount;
        woodObject.quantityBefore = currentResource.wood;
        woodObject.quantityAfter = currentResource.wood - resourceRequirement.wood * maxPossibleCraftCount;
        craftObjects.push(woodObject);
    }
    if (resourceRequirement.stone != 0) {
        let stoneObject = {}
        stoneObject.isGem = 0;
        stoneObject.isNPC = 0;
        stoneObject.address = address;
        stoneObject.inventoryType = null;
        stoneObject.idItem = null;
        stoneObject.idToolInstance = null;
        stoneObject.idRecipe = null;
        stoneObject.resourceType = 3;
        stoneObject.requiredQuantity = resourceRequirement.stone * maxPossibleCraftCount;
        stoneObject.quantityBefore = currentResource.stone;
        stoneObject.quantityAfter = currentResource.stone - resourceRequirement.stone * maxPossibleCraftCount;
        craftObjects.push(stoneObject);
    }

    try {
        await UserQueries.subResources(address, resourceRequirement.ancien * maxPossibleCraftCount, resourceRequirement.wood * maxPossibleCraftCount, resourceRequirement.stone * maxPossibleCraftCount)
    } catch (error) {
        logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`)
        return res
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
        logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`);
        return res
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
    }
    let storage = {}
    storage.ancien = resources.ancien
    storage.wood = resources.wood
    storage.stone = resources.stone
    craftResponse.storage = storage

    for (const i_req of itemRequirement) {
        let itemObject = {}
        itemObject.isGem = 0;
        itemObject.isNPC = 0;
        itemObject.address = address;
        itemObject.inventoryType = 'item';
        itemObject.idItem = i_req.id;
        itemObject.idToolInstance = null;
        itemObject.idRecipe = null;
        itemObject.resourceType = null;
        itemObject.requiredQuantity = i_req.quantity * maxPossibleCraftCount;
        itemObject.quantityBefore = i_req.quantityInstance;
        itemObject.quantityAfter = i_req.quantityInstance - i_req.quantity * maxPossibleCraftCount;
        craftObjects.push(itemObject);

        try {
            await ItemQueries.subItemByIdItemInstance(i_req.idInstance, i_req.quantity * maxPossibleCraftCount)
        } catch (error) {
            logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        if (itemObject.quantityAfter == 0) {
            try {
                await ItemQueries.removeItemInstance(i_req.idInstance)
            } catch (error) {
                logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    })
            }
            removeElements.push({
                id: i_req.idInstance,
                type: 'item'
            })
        } else {
            editElements.push({
                id: i_req.idInstance,
                type: 'item',
                quantity: itemObject.quantityAfter
            })
        }
    }
    for (const burnToolId of burnToolIds) {
        let toolObject = {}
        toolObject.isGem = 0;
        toolObject.isNPC = 0;
        toolObject.address = address;
        toolObject.inventoryType = 'tool';
        toolObject.idItem = null;
        toolObject.idToolInstance = burnToolId;
        toolObject.idRecipe = null;
        toolObject.resourceType = null;
        toolObject.requiredQuantity = 1;
        toolObject.quantityBefore = 1;
        toolObject.quantityAfter = 0;
        craftObjects.push(toolObject);

        try {
            await InventoryQueries.removeToolInstance(burnToolId)
        } catch (error) {
            logger.error(`Error in InventoryQueries.removeToolInstance: ${Utils.printErrorLog(error)}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        removeElements.push({
            id: burnToolId,
            type: 'tool'
        })
    }
    for (const i_req of recipeRequirement) {
        let recipeObject = {}
        recipeObject.isGem = 0;
        recipeObject.isNPC = 0;
        recipeObject.address = address;
        recipeObject.inventoryType = 'recipe';
        recipeObject.idItem = null;
        recipeObject.idToolInstance = null;
        recipeObject.idRecipe = i_req.id;
        recipeObject.resourceType = null;
        recipeObject.requiredQuantity = i_req.quantity * maxPossibleCraftCount;
        recipeObject.quantityBefore = i_req.quantityInstance;
        recipeObject.quantityAfter = i_req.quantityInstance - i_req.quantity * maxPossibleCraftCount;
        craftObjects.push(recipeObject);

        try {
            await InventoryQueries.subRecipe(address, i_req.idInstance, i_req.quantity * maxPossibleCraftCount)
        } catch (error) {
            logger.error(`Error in InventoryQueries.subRecipe: ${Utils.printErrorLog(error)}`)
            return res
                .json({
                    success: false,
                    error: {
                        errorMessage: error
                    }
                })
        }
        if (recipeObject.quantityAfter == 0) {
            try {
                await ItemQueries.removeRecipeInstance(i_req.idInstance)
            } catch (error) {
                logger.error(`Error in ItemQueries.removeRecipeInstance: ${Utils.printErrorLog(error)}`)
                return res
                    .json({
                        success: false,
                        error: {
                            errorMessage: error
                        }
                    })
            }
            removeElements.push({
                id: i_req.idInstance,
                type: 'recipe'
            })
        } else {
            editElements.push({
                id: i_req.idInstance,
                type: 'recipe',
                quantity: recipeObject.quantityAfter
            })
        }
    }
    craftResponse.inventory = [
        {
            action: 'add',
            elements: addElements
        },
        {
            action: 'edit',
            elements: editElements
        },
        {
            action: 'remove',
            elements: removeElements
        }
    ]

    let recipeIndex = 0, failedRecipeCount = 0
    let craftType = checkRequirements[0].idTool == null ? 'item' : 'tool';
    while (recipeIndex < maxPossibleCraftCount) {
        ++recipeIndex
        let probability = random.int(0, 99)
        if (probability < checkRequirements[0].chanceCraft) {
            if (craftType == 'tool') {
                let craftedTool
                try {
                    craftedTool = await InventoryQueries.addCraftedTool(address, idRecipe)
                } catch (error) {
                    logger.error(`Error in InventoryQueries addCraftedItem: ${Utils.printErrorLog(error)}`)
                    return res
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }

                let idToolLevel
                try {
                    idToolLevel = await InventoryQueries.getIdToolLevelByIdRecipe(idRecipe)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getIdToolLevelByIdRecipe: ${Utils.printErrorLog(error)}`);
                    return res
                        .status(401)
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }
                let idToolInstance
                try {
                    idToolInstance = await InventoryQueries.getIdToolInstanceByAddressIdToolLevel(address, idToolLevel)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getIdToolInstanceByAddressIdToolLevel: ${Utils.printErrorLog(error)}`);
                    return res
                        .status(401)
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }
                let toolData
                try {
                    toolData = await InventoryQueries.getToolInstanceData(idToolInstance)
                } catch (error) {
                    logger.error(`Error in InventoryQueries.getToolInstanceData: ${Utils.printErrorLog(error)}`)
                    return res
                        .status(401)
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }
                craftResponse.inventory.push({
                    action: 'add',
                    elements: [{
                        id: idToolInstance,
                        type: 'tool',
                        quantity: 1,
                        name: toolData[0].name,
                        image: toolData[0].image,
                        menu: {
                            craft: toolData[0].craft,
                            view: toolData[0].view,
                            send: toolData[0].send,
                            sell: toolData[0].sell
                        }
                    }]
                })
            } else {
                let userItemData
                try {
                    userItemData = await InventoryQueries.checkIfUserHasIdItem(address, checkRequirements[0].idItem, checkRequirements[0].itemQuantity)
                } catch (error) {
                    logger.error(`Error in InventoryQueries checkIfUserHasIdItem: ${Utils.printErrorLog(error)}`)
                    return res
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }
                let idItemInstance, newItemInstance
                if (userItemData.length == 0) {
                    let createItemInstance
                    try {
                        createItemInstance = await InventoryQueries.createItemInstance(address, checkRequirements[0].idItem, checkRequirements[0].itemQuantity)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries createItemInstance: ${Utils.printErrorLog(error)}`)
                        return res
                            .json({
                                success: false,
                                error: {
                                    errorMessage: error
                                }
                            })
                    }
                    try {
                        idItemInstance = await InventoryQueries.getIdItemInstance(address, checkRequirements[0].idItem)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries getIdItemInstance: ${Utils.printErrorLog(error)}`)
                        return res
                            .json({
                                success: false,
                                error: {
                                    errorMessage: error
                                }
                            })
                    }
                    try {
                        newItemInstance = await InventoryService.getInventoryInstanceData(address, idItemInstance.idItemInstance, 'item')
                    } catch (error) {
                        logger.error(`Error in InventoryQueries getInventoryInstanceData: ${Utils.printErrorLog(error)}`)
                        return res
                            .json({
                                success: false,
                                error: {
                                    errorMessage: error
                                }
                            })
                    }
                    craftResponse.inventory.push({
                        action: 'add',
                        elements: [newItemInstance]
                    })
                } else {
                    idItemInstance = userItemData[0].idItemInstance
                    let updateItemInstance
                    try {
                        updateItemInstance = await InventoryQueries.updateItemInstance(userItemData[0].idItemInstance, userItemData[0].expectedQuantity)
                    } catch (error) {
                        logger.error(`Error in InventoryQueries updateItemInstance: ${Utils.printErrorLog(error)}`)
                        return res
                            .json({
                                success: false,
                                error: {
                                    errorMessage: error
                                }
                            })
                    }
                    craftResponse.inventory.push({
                        action: 'edit',
                        elements: [{
                            id: idItemInstance,
                            type: 'item',
                            quantity: userItemData[0].expectedQuantity
                        }]
                    })
                }
            }
        } else {
            logger.debug(`probability: ${probability}, chanceCraft: ${checkRequirements[0].chanceCraft}`);
            ++failedRecipeCount
        }
    }

    if (failedRecipeCount == maxPossibleCraftCount) {
        craftResponse.done = false
        craftResponse.message = 'All recipes craft has failed'
    } else {
        craftResponse.done = true
        craftResponse.message = `${maxPossibleCraftCount - failedRecipeCount} recipes has been crafted successfully, ${failedRecipeCount} has failed`
    }

    logger.debug(`craftObject response : ${JSON.stringify(craftObjects)}`)

    try {
        craftResult = await InventoryQueries.setCraftHistory(craftObjects);
    } catch (error) {
        logger.error(`Error in InventoryQueries.setCraftHistory, error: ${Utils.printErrorLog(error)}`)
    }

    logger.debug(`setCraftHistory response : ${JSON.stringify(craftResult)}`);

    let recipeGemData
    try {
        recipeGemData = await InventoryService.getRecipeGemInstanceData(idRecipe, address);
    } catch (error) {
        logger.error(`Error in InventoryService getRecipeGemInstanceData: ${Utils.printErrorLog(error)}`)
        return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            })
    }
    craftResponse.currentRecipeData = recipeGemData
    logger.info(`craftGem END`)
    return res
        .json({
            success: true,
            data: {
                ...craftResponse
            }
        })
}


module.exports = { getBundleGem, getInventoryList, getInventoryInstanceData, sendItem, sendTool, repairTool, upgradeTool, craft, sendRecipe, craftNPC, getRecipeNPC, getRecipeNPCInstance, openChest, getRecipeGem, getRecipeGemInstance, craftGem }
