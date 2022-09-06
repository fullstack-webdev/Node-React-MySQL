const logger = require('../logging/logger');
const { FishermanQueries } = require('../queries/fishermanQueries');
const { ItemQueries } = require('../queries/inventory/itemQueries');
const { InventoryQueries } = require('../queries/inventoryQueries');
const { Utils } = require("../utils/utils");
const { PassiveQueries } = require('../queries/passiveQueries');
const { UserQueries } = require('../queries/userQueries');
const { FishermanService } = require('./fishermanService');
const { InventoryService } = require('../services/inventory/inventoryService');
const { ToolService } = require('./inventory/toolService');

class PassiveService {
    constructor() { }

    static async setFishermanPassiveOn(address) {
        logger.info(`setFishermanPassiveOn service START`)

        // min level of Fisherman's Hut for passiveFishing
        let minBuildingLevelForPassiveFishing
        try {
            minBuildingLevelForPassiveFishing = await PassiveQueries.getPassiveConstant('minBuildingLevelForPassiveFishing')
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
        }

        // get basic passive data for address Fisherman
        let pkBuilding
        try {
            pkBuilding = await PassiveQueries.getFishermanPkBuildingFromAddress(address)
        } catch (error) {
            logger.error(`PassiveQueries.getFishermanPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getFishermanPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`
        }
        try {
            pkBuilding = pkBuilding.id
        } catch (error) {
            logger.error(`User is forcing API`)
            throw `User is forcing API`
        }

        // update passive status
        try {
            await PassiveService.updatePassiveStatus(pkBuilding)
        } catch (error) {
            logger.error(`PassiveService.updatePassiveStatus error : ${Utils.printErrorLog(error)}`)
            throw `PassiveService.updatePassiveStatus error : ${Utils.printErrorLog(error)}`
        }

        let validate
        try {
            validate = await FishermanQueries.checkIfValidPassiveBuilding(pkBuilding)
        } catch (error) {
            logger.error(`FishermanQueries.checkIfValidPassiveBuilding error : ${Utils.printErrorLog(error)}`)
            throw `FishermanQueries.checkIfValidPassiveBuilding error : ${Utils.printErrorLog(error)}`
        }

        let response = {}
        if (validate.level < minBuildingLevelForPassiveFishing) {
            response.done = false
            response.message = `Fisherman\'s Hut level should be at least ${minBuildingLevelForPassiveFishing}.`
            return response
        } else if (validate.idPassive != null && validate.isPassive) {
            response.done = false
            response.message = 'Already in passive mode.'
            return response
        } else if (validate.idPassive == null) {
            // substract requirements to unlock = upgrade_requirements for level 1
            let requirements
            try {
                requirements = await PassiveService.getUpgradeRequirements(address, 1)
            } catch (error) {
                logger.error(`PassiveService.getUpgradeRequirements error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getUpgradeRequirements error : ${Utils.printErrorLog(error)}`
            }
            let isUnlockAble = requirements.upgradeAllowed
            if (!isUnlockAble) {
                response.done = false
                response.message = 'Not enough cost to Unlock.'
                return response
            }

            for (let requirement of requirements.requirements) {
                if (requirement.idResourceRequirement != null) {
                    try {
                        await UserQueries.subResources(address, requirement.requiredAncien, requirement.requiredWood, requirement.requiredStone)
                    } catch (error) {
                        logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`);
                        throw error
                    }
                } else if (requirement.idItemRequirement != null) {
                    try {
                        await ItemQueries.subItemByIdItemInstance(requirement.idItemInstance, requirement.requiredItemQuantity)
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
                    }
                }
            }

            // get data to create new passive
            let passiveLevel
            try {
                passiveLevel = await PassiveQueries.getPassiveLevelFromLevel(1)
            } catch (error) {
                logger.error(`PassiveQueries.getPassiveLevelFromLevel error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getPassiveLevelFromLevel error : ${Utils.printErrorLog(error)}`
            }
            let maxStorableActions
            try {
                maxStorableActions = await PassiveQueries.getMaxStorableActionCount(4, validate.level)
            } catch (error) {
                logger.error(`PassiveQueries.getMaxStorableActionCount error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getMaxStorableActionCount error : ${Utils.printErrorLog(error)}`
            }

            // insert new row into passive table
            try {
                await PassiveQueries.unLockPassive(pkBuilding, maxStorableActions, passiveLevel.idPassiveLevel)
            } catch (error) {
                logger.error(`PassiveQueries.unLockPassive error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.unLockPassive error : ${Utils.printErrorLog(error)}`
            }

            // update buildings table
            let newPassiveData
            try {
                newPassiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
            } catch (error) {
                logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`
            }
            try {
                await PassiveQueries.setIdPassiveAtBuilding(pkBuilding, newPassiveData.idPassive)
            } catch (error) {
                logger.error(`PassiveQueries.setIdPassiveAtBuilding error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.setIdPassiveAtBuilding error : ${Utils.printErrorLog(error)}`
            }

            // storage change return
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
        } else {
            // set isPassive2true at passive table
            try {
                await PassiveQueries.setIsPassiveAtPassive(validate.idPassive, true)
            } catch (error) {
                logger.error(`PassiveQueries.setIsPassiveAtPassive error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.setIsPassiveAtPassive error : ${Utils.printErrorLog(error)}`
            }
        }

        response.done = true
        response.message = 'Successfully done'

        // call getFisherman
        let fishermanResponse
        try {
            fishermanResponse = await PassiveService.getFisherman(address)
        } catch (error) {
            logger.error(`PassiveService.getFisherman error : ${Utils.printErrorLog(error)}`)
            throw `PassiveService.getFisherman error : ${Utils.printErrorLog(error)}`
        }
        response.fishermanResponse = fishermanResponse

        logger.info(`setFishermanPassiveOn service END`)
        return response
    }

    static async setFishermanPassiveOff(address) {
        logger.info(`setFishermanPassiveOff service START`)

        // get basic passive data for address Fisherman
        let pkBuilding
        try {
            pkBuilding = await PassiveQueries.getFishermanPkBuildingFromAddress(address)
        } catch (error) {
            logger.error(`PassiveQueries.getFishermanPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getFishermanPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`
        }
        try {
            pkBuilding = pkBuilding.id
        } catch (error) {
            logger.error(`User is forcing API`)
            throw `User is forcing API`
        }

        // update passive status
        try {
            await PassiveService.updatePassiveStatus(pkBuilding)
        } catch (error) {
            logger.error(`PassiveService.updatePassiveStatus error : ${Utils.printErrorLog(error)}`)
            throw `PassiveService.updatePassiveStatus error : ${Utils.printErrorLog(error)}`
        }

        let validate
        try {
            validate = await FishermanQueries.checkIfValidPassiveBuilding(pkBuilding)
        } catch (error) {
            logger.error(`FishermanQueries.checkIfValidPassiveBuilding error : ${Utils.printErrorLog(error)}`)
            throw `FishermanQueries.checkIfValidPassiveBuilding error : ${Utils.printErrorLog(error)}`
        }

        let response = {}
        if (validate.idPassive != null && validate.isPassive) {
            // set isPassive2false at passive table
            try {
                await PassiveQueries.setIsPassiveAtPassive(validate.idPassive, false)
            } catch (error) {
                logger.error(`PassiveQueries.setIsPassiveAtPassive error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.setIsPassiveAtPassive error : ${Utils.printErrorLog(error)}`
            }
        } else {
            response.done = false
            response.message = 'Already in active mode.'
            return response
        }

        response.done = true
        response.message = 'Successfully done'

        // call getPassiveInfo
        let fishermanResponse
        try {
            fishermanResponse = await PassiveService.getPassiveInfo(address)
        } catch (error) {
            logger.error(`PassiveService.getPassiveInfo error : ${Utils.printErrorLog(error)}`)
            throw `PassiveService.getPassiveInfo error : ${Utils.printErrorLog(error)}`
        }
        response.fishermanResponse = fishermanResponse

        // call getFisherman
        // let fishermanResponse
        // try {
        //     fishermanResponse = await PassiveService.getFisherman(address)
        // } catch ( error ) {
        //     logger.error(`PassiveService.getFisherman error : ${Utils.printErrorLog(error)}`)
        //     throw `PassiveService.getFisherman error : ${Utils.printErrorLog(error)}`
        // }
        // response.fishermanResponse = fishermanResponse

        logger.info(`setFishermanPassiveOff service END`)
        return response
    }

    static async upgradeFishermanPassive(address) {
        logger.info(`upgradeFishermanPassive service START`)

        // get basic passive data for address Fisherman
        let pkBuilding
        try {
            pkBuilding = await PassiveQueries.getFishermanPkBuildingFromAddress(address)
        } catch (error) {
            logger.error(`PassiveQueries.getFishermanPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getFishermanPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`
        }
        try {
            pkBuilding = pkBuilding.id
        } catch (error) {
            logger.error(`User is forcing API`)
            throw `User is forcing API`
        }

        // update passive status
        try {
            await PassiveService.updatePassiveStatus(pkBuilding)
        } catch (error) {
            logger.error(`PassiveService.updatePassiveStatus error : ${Utils.printErrorLog(error)}`)
            throw `PassiveService.updatePassiveStatus error : ${Utils.printErrorLog(error)}`
        }

        let validate
        try {
            validate = await FishermanQueries.checkIfValidPassiveBuilding(pkBuilding)
        } catch (error) {
            logger.error(`FishermanQueries.checkIfValidPassiveBuilding error : ${Utils.printErrorLog(error)}`)
            throw `FishermanQueries.checkIfValidPassiveBuilding error : ${Utils.printErrorLog(error)}`
        }

        let response = {}
        if (validate.idPassive != null) {
            let passiveData
            try {
                passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
            } catch (error) {
                logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`
            }
            if (!passiveData.isUpgradable) {
                response.done = false
                response.message = 'Passive Level is already at Max Level.'
                return response
            }

            // sub upgrade requirements
            let requirements
            try {
                requirements = await PassiveService.getUpgradeRequirements(address, passiveData.passiveLevel + 1)
            } catch (error) {
                logger.error(`PassiveService.getUpgradeRequirements error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getUpgradeRequirements error : ${Utils.printErrorLog(error)}`
            }
            let upgradeAllowed = requirements.upgradeAllowed
            if (!upgradeAllowed) {
                response.done = false
                response.message = 'Not enough cost to Upgrade.'
                return response
            }
            for (let requirement of requirements.requirements) {
                if (requirement.idResourceRequirement != null) {
                    try {
                        await UserQueries.subResources(address, requirement.requiredAncien, requirement.requiredWood, requirement.requiredStone)
                    } catch (error) {
                        logger.error(`Error in UserQueries.subResources: ${Utils.printErrorLog(error)}`);
                        throw error
                    }
                } else if (requirement.idItemRequirement != null) {
                    try {
                        await ItemQueries.subItemByIdItemInstance(requirement.idItemInstance, requirement.requiredItemQuantity)
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
                    }
                }
            }
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

            let passiveLevel
            try {
                passiveLevel = await PassiveQueries.getPassiveLevelFromLevel(passiveData.passiveLevel + 1)
            } catch (error) {
                logger.error(`PassiveQueries.getPassiveLevelFromLevel error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getPassiveLevelFromLevel error : ${Utils.printErrorLog(error)}`
            }

            try {
                await PassiveQueries.setIdPassiveLevelAtPassive(passiveData.idPassive, passiveLevel.idPassiveLevel)
            } catch (error) {
                logger.error(`PassiveQueries.setIdPassiveLevelAtPassive error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.setIdPassiveLevelAtPassive error : ${Utils.printErrorLog(error)}`
            }

            /* try {
                await PassiveQueries.updateLastPassiveTime(passiveData.idPassive)
            } catch (error) {
                logger.error(`PassiveQueries.updateLastPassiveTime error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.updateLastPassiveTime error : ${Utils.printErrorLog(error)}`
            } */

            /* response.upgradeInfo = {
                level: passiveLevel.level
            } */
        } else {
            response.done = false
            response.message = 'You should unlock passive mode first.'
            return response
        }

        response.done = true
        response.message = 'Successfully done'

        // call getFisherman
        let fishermanResponse
        try {
            fishermanResponse = await PassiveService.getFisherman(address)
        } catch (error) {
            logger.error(`PassiveService.getFisherman error : ${Utils.printErrorLog(error)}`)
            throw `PassiveService.getFisherman error : ${Utils.printErrorLog(error)}`
        }
        response.fishermanResponse = fishermanResponse

        logger.info(`upgradeFishermanPassive service END`)
        return response
    }

    static async getPassiveInfo(address) {
        logger.info(`passiveService.getPassiveInfo START`)
        // data for passiveFishing
        let pkBuilding
        try {
            pkBuilding = await PassiveQueries.getFishermanPkBuildingFromAddress(address)
        } catch (error) {
            logger.error(`PassiveQueries.getFishermanPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getFishermanPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`
        }
        try {
            pkBuilding = pkBuilding.id
        } catch (error) {
            logger.error(`User is forcing API`)
            throw `User is forcing API`
        }

        let fishermanResponse = {}

        let passiveData
        try {
            passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`
        }
        if (passiveData == undefined) {
            let requirements
            try {
                requirements = await PassiveService.getUpgradeRequirements(address, 1)
            } catch (error) {
                logger.error(`PassiveService.getUpgradeRequirements error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getUpgradeRequirements error : ${Utils.printErrorLog(error)}`
            }
            fishermanResponse.passiveInfo = {
                isPassive: false,
                locked: true,
                isUnlockAble: requirements.upgradeAllowed,
                unlockRequirements: requirements.requirementsArray
            }
        } else {
            let requirements
            try {
                requirements = await PassiveService.getUpgradeRequirements(address, passiveData.passiveLevel + 1)
            } catch (error) {
                logger.error(`PassiveService.getUpgradeRequirements error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getUpgradeRequirements error : ${Utils.printErrorLog(error)}`
            }
            let nextPassiveLevel
            try {
                nextPassiveLevel = await PassiveQueries.getPassiveLevelFromLevel(passiveData.passiveLevel + 1)
            } catch (error) {
                logger.error(`PassiveQueries.getPassiveLevelFromLevel error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getPassiveLevelFromLevel error : ${Utils.printErrorLog(error)}`
            }

            if (!passiveData.isPassive) {
                fishermanResponse.passiveInfo = {
                    isPassive: false,
                    locked: false,
                    passiveLevel: passiveData.passiveLevel,
                    fishingCoolDown: passiveData.fishingCoolDown,
                    upgradeInfo: {
                        isUpgradable: passiveData.isUpgradable,
                        passiveLevel: nextPassiveLevel != undefined ? nextPassiveLevel.level : -1,
                        fishingCoolDown: nextPassiveLevel != undefined ? nextPassiveLevel.fishingCoolDown : -1,
                        upgradeAllowed: requirements.upgradeAllowed,
                        upgradeRequirements: requirements.requirementsArray,
                    }
                }
            } else {
                // get Lure Item Full Data using idPassiveFishingLureItem at constant table
                let idPassiveFishingLureItem
                try {
                    idPassiveFishingLureItem = await PassiveQueries.getPassiveConstant('idPassiveFishingLureItem')
                } catch (error) {
                    logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                }
                let lureData
                try {
                    lureData = await PassiveQueries.getItemInstanceData(address, idPassiveFishingLureItem)
                } catch (error) {
                    logger.error(`PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`
                }
                if (lureData == undefined) {
                    try {
                        lureData = await PassiveQueries.getItemData(idPassiveFishingLureItem)
                    } catch (error) {
                        logger.error(`PassiveQueries.getItemData error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getItemData error : ${Utils.printErrorLog(error)}`
                    }
                    lureData.quantity = 0
                }

                // check the max number of consecutive fishing actions (resource.ancien & rod.durability & passiveData.storedActions)
                let ancienCostPerEachFishingAction
                try {
                    ancienCostPerEachFishingAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachFishingAction')
                } catch (error) {
                    logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                }

                let resources
                try {
                    resources = await UserQueries.getResources(address)
                } catch (error) {
                    logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`)
                    throw error
                }
                let ancien = resources.ancien

                let rodDurability
                try {
                    rodDurability = await PassiveQueries.getEquippedRodDurabilityFromPkBuilding(pkBuilding)
                } catch (error) {
                    logger.error(`Error in PassiveQueries.getEquippedRodDurabilityFromPkBuilding: ${Utils.printErrorLog(error)}`)
                    throw error
                }
                rodDurability = !rodDurability ? 0 : rodDurability

                let maxPerformableActions = Math.min(Math.floor(ancien / ancienCostPerEachFishingAction), passiveData.storedActions, passiveData.burntActions, Math.floor(rodDurability / 10))

                // get basic constant data for passiveFishing
                let actionCountPerFishingLure
                try {
                    actionCountPerFishingLure = await PassiveQueries.getPassiveConstant('actionCountPerFishingLure')
                } catch (error) {
                    logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                }

                // get next store time
                let lastTime = (new Date(passiveData.lastPassiveTime)).getTime()
                let nextStoreTime = (new Date(lastTime + passiveData.fishingCoolDown * 60 * 1000)).toISOString()

                // build response
                fishermanResponse.passiveInfo = {
                    isPassive: true,
                    locked: false,
                    passiveLevel: passiveData.passiveLevel,
                    fishingCoolDown: passiveData.fishingCoolDown,
                    upgradeInfo: {
                        isUpgradable: passiveData.isUpgradable,
                        passiveLevel: nextPassiveLevel != undefined ? nextPassiveLevel.level : -1,
                        fishingCoolDown: nextPassiveLevel != undefined ? nextPassiveLevel.fishingCoolDown : -1,
                        upgradeAllowed: requirements.upgradeAllowed,
                        upgradeRequirements: requirements.requirementsArray,
                    },

                    lureData: lureData,

                    constant: {
                        actionCountPerFishingLure: actionCountPerFishingLure,
                        ancienCostPerEachFishingAction: ancienCostPerEachFishingAction,
                    },

                    storedActions: passiveData.storedActions,
                    burntActions: passiveData.burntActions,
                    maxStorableActions: passiveData.maxStorableActions,
                    maxPerformableActions: maxPerformableActions,
                    nextStoreTime: nextStoreTime
                }
            }
        }

        logger.info(`passiveService.getPassiveInfo END`)
        return fishermanResponse
    }

    static async getFisherman(address) {
        logger.info(`passiveService.getFisherman START`)

        let result
        try {
            result = await FishermanService.getSeasWithFishermanAllowance(address)
        } catch (error) {
            throw error
        }
        let seas = result.seas
        let checkFisherman = result.checkFisherman

        let fishermanResponse = { hasConsumables: false, consumables: [], rods: [], seas: seas, fishermanIsFishing: checkFisherman[0].nowFishing, fishermanEndingTime: checkFisherman[0].fishingEndingTime, rodEndingTime: '' }

        let consumables
        try {
            consumables = await InventoryQueries.getFishConsumables(address)
        } catch (error) {
            throw error
        }
        fishermanResponse.hasConsumables = consumables.length == 0 ? false : true
        for (var i = 0; i < consumables.length; ++i) {
            fishermanResponse.consumables.push({
                id: consumables[i].idItemConsumable,
                name: consumables[i].name,
                image: consumables[i].image,
                description: consumables[i].description,
                quantity: consumables[i].quantity
            })
        }

        let rods
        try {
            rods = await FishermanQueries.getRods(address)
        } catch (error) {
            logger.error(`FishermanQueries.getRods error : ${Utils.printErrorLog(error)}`)
            throw error
        }

        let toolIds = []
        for (let rod of rods) {
            toolIds.push(rod.id)
        }
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

            for (let rod of rods) {
                rod.bonuses = toolBonuses[rod.id] ? toolBonuses[rod.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
            }
        }

        let rodId = -1
        let equippedRodIndex = -1
        for (var i = 0; i < rods.length; ++i) {
            if (rods[i].equipped) equippedRodIndex = i
            if (rodId == rods[i].id) {
                continue
            }
            rodId = rods[i].id
            fishermanResponse.rods.push({
                id: rods[i].id,
                bonuses: rods[i].bonuses,
                level: rods[i].level,
                name: rods[i].name,
                image: rods[i].image,
                rarity: rods[i].rarity,
                durability: rods[i].durability,
                status: (rods[i].equipped ? 'equipped' : (
                    rods[i].rarity == 1 ? 'available' : (
                        rods[i].rarity == 2 ? (checkFisherman[0].level >= 4 ? 'available' : 'not-available') : (
                            rods[i].rarity == 3 ? (checkFisherman[0].level >= 7 ? 'available' : 'not-available') : 'unknown rarity'
                        )
                    )
                )),
                isFishing: rods[i].isFishing
            })
            if (checkFisherman[0].idToolInstance == rods[i].id) {
                fishermanResponse.rodEndingTime = rods[i].rodEndingTime
            }
        }

        if (equippedRodIndex == -1) {
            fishermanResponse.hasEquippedRod = false
            fishermanResponse.equippedRodInstanceData = null
        } else {
            fishermanResponse.hasEquippedRod = true
            let equippedRodInstanceData
            try {
                equippedRodInstanceData = await InventoryService.getInventoryInstanceData(address, rods[equippedRodIndex].id, 'tool')
            } catch (error) {
                logger.error(`Error in InventoryService.getInventoryInstanceData: ${JSON.stringify(error)}`)
                throw error
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
                    throw error
                }
                logger.info(`toolBonuses response: ${JSON.stringify(toolBonuses)}`)

                equippedRodInstanceData.bonuses = toolBonuses[equippedRodInstanceData.id] ? toolBonuses[equippedRodInstanceData.id].bonuses : ['SUFFIX', 'SUFFIX', 'PREFIX', 'PREFIX', 'IMPLICIT']
            }

            fishermanResponse.equippedRodInstanceData = equippedRodInstanceData
        }

        // data for passiveFishing
        let pkBuilding
        try {
            pkBuilding = await PassiveQueries.getFishermanPkBuildingFromAddress(address)
        } catch (error) {
            logger.error(`PassiveQueries.getFishermanPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getFishermanPkBuildingFromAddress error : ${Utils.printErrorLog(error)}`
        }
        try {
            pkBuilding = pkBuilding.id
        } catch (error) {
            logger.error(`User is forcing API`)
            throw `User is forcing API`
        }

        // update passive status
        try {
            await PassiveService.updatePassiveStatus(pkBuilding)
        } catch (error) {
            logger.error(`PassiveService.updatePassiveStatus error : ${Utils.printErrorLog(error)}`)
            throw `PassiveService.updatePassiveStatus error : ${Utils.printErrorLog(error)}`
        }

        let passiveData
        try {
            passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`
        }
        if (passiveData == undefined) {
            let requirements
            try {
                requirements = await PassiveService.getUpgradeRequirements(address, 1)
            } catch (error) {
                logger.error(`PassiveService.getUpgradeRequirements error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getUpgradeRequirements error : ${Utils.printErrorLog(error)}`
            }
            fishermanResponse.passiveInfo = {
                isPassive: false,
                locked: true,
                isUnlockAble: requirements.upgradeAllowed,
                unlockRequirements: requirements.requirementsArray
            }
        } else {
            let requirements
            try {
                requirements = await PassiveService.getUpgradeRequirements(address, passiveData.passiveLevel + 1)
            } catch (error) {
                logger.error(`PassiveService.getUpgradeRequirements error : ${Utils.printErrorLog(error)}`)
                throw `PassiveService.getUpgradeRequirements error : ${Utils.printErrorLog(error)}`
            }
            let nextPassiveLevel
            try {
                nextPassiveLevel = await PassiveQueries.getPassiveLevelFromLevel(passiveData.passiveLevel + 1)
            } catch (error) {
                logger.error(`PassiveQueries.getPassiveLevelFromLevel error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getPassiveLevelFromLevel error : ${Utils.printErrorLog(error)}`
            }

            if (!passiveData.isPassive) {
                fishermanResponse.passiveInfo = {
                    isPassive: false,
                    locked: false,
                    passiveLevel: passiveData.passiveLevel,
                    fishingCoolDown: passiveData.fishingCoolDown,
                    upgradeInfo: {
                        isUpgradable: passiveData.isUpgradable,
                        passiveLevel: nextPassiveLevel != undefined ? nextPassiveLevel.level : -1,
                        fishingCoolDown: nextPassiveLevel != undefined ? nextPassiveLevel.fishingCoolDown : -1,
                        upgradeAllowed: requirements.upgradeAllowed,
                        upgradeRequirements: requirements.requirementsArray,
                    }
                }
            } else {
                // get Lure Item Full Data using idPassiveFishingLureItem at constant table
                let idPassiveFishingLureItem
                try {
                    idPassiveFishingLureItem = await PassiveQueries.getPassiveConstant('idPassiveFishingLureItem')
                } catch (error) {
                    logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                }
                let lureData
                try {
                    lureData = await PassiveQueries.getItemInstanceData(address, idPassiveFishingLureItem)
                } catch (error) {
                    logger.error(`PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`
                }
                if (lureData == undefined) {
                    try {
                        lureData = await PassiveQueries.getItemData(idPassiveFishingLureItem)
                    } catch (error) {
                        logger.error(`PassiveQueries.getItemData error : ${Utils.printErrorLog(error)}`)
                        throw `PassiveQueries.getItemData error : ${Utils.printErrorLog(error)}`
                    }
                    lureData.quantity = 0
                }

                // check the max number of consecutive fishing actions (resource.ancien & rod.durability & passiveData.storedActions)
                let ancienCostPerEachFishingAction
                try {
                    ancienCostPerEachFishingAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachFishingAction')
                } catch (error) {
                    logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                }

                let resources
                try {
                    resources = await UserQueries.getResources(address)
                } catch (error) {
                    logger.error(`Error in UserQueries.getResources: ${Utils.printErrorLog(error)}`)
                    throw error
                }
                let ancien = resources.ancien

                let rodDurability
                try {
                    rodDurability = await PassiveQueries.getEquippedRodDurabilityFromPkBuilding(pkBuilding)
                } catch (error) {
                    logger.error(`Error in PassiveQueries.getEquippedRodDurabilityFromPkBuilding: ${Utils.printErrorLog(error)}`)
                    throw error
                }
                rodDurability = !rodDurability ? 0 : rodDurability

                let maxPerformableActions = Math.min(passiveData.storedActions, passiveData.burntActions, Math.floor(rodDurability / 10))

                // get basic constant data for passiveFishing
                let actionCountPerFishingLure
                try {
                    actionCountPerFishingLure = await PassiveQueries.getPassiveConstant('actionCountPerFishingLure')
                } catch (error) {
                    logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
                    throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
                }

                // get next store time
                let lastTime = (new Date(passiveData.lastPassiveTime)).getTime()
                let nextStoreTime = (new Date(lastTime + passiveData.fishingCoolDown * 60 * 1000)).toISOString()

                // build response
                fishermanResponse.passiveInfo = {
                    isPassive: true,
                    locked: false,
                    passiveLevel: passiveData.passiveLevel,
                    fishingCoolDown: passiveData.fishingCoolDown,
                    upgradeInfo: {
                        isUpgradable: passiveData.isUpgradable,
                        passiveLevel: nextPassiveLevel != undefined ? nextPassiveLevel.level : -1,
                        fishingCoolDown: nextPassiveLevel != undefined ? nextPassiveLevel.fishingCoolDown : -1,
                        upgradeAllowed: requirements.upgradeAllowed,
                        upgradeRequirements: requirements.requirementsArray,
                    },

                    lureData: lureData,

                    constant: {
                        actionCountPerFishingLure: actionCountPerFishingLure,
                        ancienCostPerEachFishingAction: ancienCostPerEachFishingAction,
                    },

                    storedActions: passiveData.storedActions,
                    burntActions: passiveData.burntActions,
                    maxStorableActions: passiveData.maxStorableActions,
                    maxPerformableActions: maxPerformableActions,
                    nextStoreTime: nextStoreTime
                }
            }
        }

        logger.info(`passiveService.getFisherman END`)
        return fishermanResponse
    }

    static async updatePassiveStatus(pkBuilding) {
        logger.info(`updatePassiveStatus service START`)

        let validate
        try {
            validate = await FishermanQueries.checkIfValidPassiveBuilding(pkBuilding)
        } catch (error) {
            logger.error(`FishermanQueries.checkIfValidPassiveBuilding error : ${Utils.printErrorLog(error)}`)
            throw `FishermanQueries.checkIfValidPassiveBuilding error : ${Utils.printErrorLog(error)}`
        }

        if (validate.idPassive != null && validate.isPassive) {
            // update MaxStorableActions based on Building level
            let maxStorableActions
            try {
                maxStorableActions = await PassiveQueries.getMaxStorableActionCount(4, validate.level)
            } catch (error) {
                logger.error(`PassiveQueries.getMaxStorableActionCount error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getMaxStorableActionCount error : ${Utils.printErrorLog(error)}`
            }
            //ADD a check and not perform it anywhere wuld it a bit better
            try {
                await PassiveQueries.updateMaxStorableActions(pkBuilding, maxStorableActions)
            } catch (error) {
                logger.error(`PassiveQueries.updateMaxStorableActions error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.updateMaxStorableActions error : ${Utils.printErrorLog(error)}`
            }

            let passiveData
            try {
                passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
            } catch (error) {
                logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`
            }

            let nowTime = (new Date()).getTime()
            let lastTime = (new Date(passiveData.lastPassiveTime)).getTime()
            let duringTime = passiveData.fishingCoolDown * 60 * 1000
            let duringActions = Math.floor((nowTime - lastTime) / duringTime)
            lastTime += duringActions * duringTime

            let storedActions = Math.min(passiveData.storedActions + duringActions, passiveData.maxStorableActions)
            let lastPassiveTime = (new Date(lastTime)).toISOString()

            //Here in calculateStoredActions with SET there could be a bug abuse with fast sequential fishes

            try {
                await PassiveQueries.calculateStoredActions(passiveData.idPassive, storedActions, lastPassiveTime)
            } catch (error) {
                logger.error(`PassiveQueries.calculateStoredActions error : ${Utils.printErrorLog(error)}`)
                throw `PassiveQueries.calculateStoredActions error : ${Utils.printErrorLog(error)}`
            }
        }

        logger.info(`updatePassiveStatus service END`)
    }

    static async getUpgradeRequirements(address, level) {
        logger.info(`passiveService.getUpgradeRequirements START`)

        let requirements
        try {
            requirements = await PassiveQueries.getUpgradeRequirements(address, level)
        } catch (error) {
            logger.error(`PassiveQueries.getUpgradeRequirements error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getUpgradeRequirements error : ${Utils.printErrorLog(error)}`
        }
        let upgradeAllowed = true
        let requirementsArray = []
        for (let requirement of requirements) {
            if (requirement.idResourceRequirement != null) {
                if (!(requirement.isAncienAllowed && requirement.isWoodAllowed && requirement.isStoneAllowed)) {
                    upgradeAllowed = false
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
                    upgradeAllowed = false
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
        }

        logger.info(`passiveService.getUpgradeRequirements END`)
        return { upgradeAllowed: upgradeAllowed, requirementsArray: requirementsArray, requirements: requirements }
    }
}

module.exports = { PassiveService }