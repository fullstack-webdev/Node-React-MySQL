const logger = require('../logging/logger');
const { FishermanQueries } = require('../queries/fishermanQueries');
const { ItemQueries } = require('../queries/inventory/itemQueries');
const { InventoryQueries } = require('../queries/inventoryQueries');
const { Utils } = require("../utils/utils");
const random = require('random');
const { PassiveQueries } = require('../queries/passiveQueries');
const { UserQueries } = require('../queries/userQueries');

class FishermanService {
    constructor() { }

    static async verifyOwnConsumablesFisherman(address, consumableIds) {
        let checkCons;
        for (let consumable of consumableIds) {
            try {
                checkCons = await FishermanQueries.verifyOwnConsumablesFisherman(address, consumable)
            } catch (error) {
                logger.error(`FishermanQueries.verifyOwnConsumablesFisherman error : ${Utils.printErrorLog(error)}`)
                throw `FishermanQueries.verifyOwnConsumablesFisherman error : ${Utils.printErrorLog(error)}`
            }

            if (!checkCons || checkCons.length == 0 || checkCons[0].quantity == 0) {
                throw `You not own this consumable`
            }
        }

    }

    static async checkDurabilityByIdRodInstance(rodIdInstance) {
        let checkRes
        try {
            checkRes = await FishermanQueries.checkDurability(rodIdInstance, 10)
            logger.debug(`FishermanQueries.checkDurability response : ${JSON.stringify(checkRes)}`)
        } catch (error) {
            logger.error(`FishermanQueries.checkDurability error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        return checkRes.length == 0 ? false : true
    }

    static async updatePassiveFishingTable(address, idSea, fishedItems, fishedRecipes, fishedFishes, idFisherman, rodIdToolLevel, rodIdInstance, idPassiveFishing, actionNumber, quantityItem, quantityRecipe, coolDown) {
        let fishedFishesDrop = [...fishedFishes];
        console.log("FISHEDFISHESDROP ", fishedFishesDrop)
        console.log("fishedRecipes ", fishedRecipes)
        console.log("fishedItems ", fishedItems)

        let create
        let j = 0;
        let k = 0;
        for (var i = 0; i < fishedItems.length; ++i) {
            let fishDrop = fishedFishesDrop[i] ? fishedFishesDrop[i].idSeaFish : null;

            try {
                create = await FishermanQueries.createPassiveFishing(1, address, idSea, fishedItems[i].idItem, fishedItems[i].quantity, idFisherman, rodIdToolLevel, rodIdInstance, idPassiveFishing, actionNumber, quantityItem[j].before, quantityItem[j].after, coolDown, fishDrop, 1)
                if (fishedFishesDrop?.length > 0) fishedFishesDrop.splice(0, 1)

                logger.debug(`FishermanQueries.createPassiveFishing response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`FishermanQueries.createPassiveFishing error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            j++;
        }
        for (var i = 0; i < fishedRecipes.length; ++i) {
            let fishDrop = fishedFishesDrop[i] ? fishedFishesDrop[i].idSeaFish : null;

            try {
                create = await FishermanQueries.createPassiveFishing(2, address, idSea, fishedRecipes[i].idRecipe, fishedRecipes[i].quantity, idFisherman, rodIdToolLevel, rodIdInstance, idPassiveFishing, actionNumber, quantityRecipe[k].before, quantityRecipe[k].after, coolDown, fishDrop, 1)
                if (fishedFishesDrop?.length > 0) fishedFishesDrop.splice(0, 1)

                logger.debug(`FishermanQueries.createPassiveFishing response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`FishermanQueries.createPassiveFishing error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            k++;
        }
        for (var i = 0; i < fishedFishesDrop.length; ++i) {
            try {
                create = await FishermanQueries.createPassiveFishing(4, address, idSea, fishedFishesDrop[i].idSeaFish, 1, idFisherman, rodIdToolLevel, rodIdInstance, idPassiveFishing, actionNumber, null, null, coolDown, fishedFishesDrop[i].idSeaFish, 1)
                logger.debug(`FishermanQueries.createPassiveFishing response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`FishermanQueries.createPassiveFishing error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }
        // if ( fishedItems.length == 0 && fishedRecipes.length == 0 ) {
        //     try {
        //         create = await FishermanQueries.createPassiveFishing(3, address, idSea, null, null, idFisherman, rodIdToolLevel, rodIdInstance, idPassiveFishing, actionNumber, null, null, coolDown)
        //         logger.debug(`FishermanQueries.createPassiveFishing response : ${JSON.stringify(create)}`)
        //     } catch(error){
        //         logger.error(`FishermanQueries.createPassiveFishing error : ${Utils.printErrorLog(error)}`)
        //         throw(error)
        //     }
        // }

        let fishingEndingTime
        try {
            fishingEndingTime = await FishermanQueries.getFishingEndingTime(address, idSea, idFisherman, rodIdInstance)
            logger.debug(`FishermanQueries.getFishingEndingTime response : ${JSON.stringify(fishingEndingTime)}`)
        } catch (error) {
            logger.error(`FishermanQueries.getFishingEndingTime error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if (fishingEndingTime.length == 0) {
            throw ('No draw for fishing')
        }
        return fishingEndingTime[0].time
    }

    static async updateFishingTable(address, idSea, fishedItems, fishedRecipes, fishedFishes, idFisherman, rodIdToolLevel, rodIdInstance, consumableIds, reduceCoolDown, noCoolDown, quantityItem, quantityRecipe, quantityFish) {
        let fishedFishesDrop = [...fishedFishes];
        console.log("FISHEDFISHESDROP ", fishedFishesDrop)
        console.log("fishedRecipes ", fishedRecipes)
        console.log("fishedItems ", fishedItems)

        let create
        for (var i = 0; i < fishedItems.length; ++i) {
            let fishDrop = fishedFishesDrop[i] ? fishedFishesDrop[i].idSeaFish : null;

            try {
                create = await FishermanQueries.createFishing(1, address, idSea, fishedItems[i].idItem, fishedItems[i].quantity, idFisherman, rodIdToolLevel, rodIdInstance, consumableIds[0], consumableIds[1], reduceCoolDown, noCoolDown, quantityItem[i].before, quantityItem[i].after, fishDrop, quantityFish)
                if (fishedFishesDrop?.length > 0) fishedFishesDrop.splice(0, 1)

                logger.debug(`FishermanQueries.createFishing response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`FishermanQueries.createFishing error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }
        for (var i = 0; i < fishedRecipes.length; ++i) {
            let fishDrop = fishedFishesDrop[i] ? fishedFishesDrop[i].idSeaFish : null;

            try {
                create = await FishermanQueries.createFishing(2, address, idSea, fishedRecipes[i].idRecipe, fishedRecipes[i].quantity, idFisherman, rodIdToolLevel, rodIdInstance, consumableIds[0], consumableIds[1], reduceCoolDown, noCoolDown, quantityRecipe[i].before, quantityRecipe[i].after, fishDrop, quantityFish)
                if (fishedFishesDrop?.length > 0) fishedFishesDrop.splice(0, 1)

                logger.debug(`FishermanQueries.createFishing response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`FishermanQueries.createFishing error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }
        for (var i = 0; i < fishedFishesDrop.length; ++i) {
            try {
                create = await FishermanQueries.createFishing(4, address, idSea, fishedFishesDrop[i].idSeaFish, quantityFish, idFisherman, rodIdToolLevel, rodIdInstance, consumableIds[0], consumableIds[1], reduceCoolDown, noCoolDown)
                logger.debug(`FishermanQueries.createFishing response : ${JSON.stringify(create)}`)
            } catch (error) {
                logger.error(`FishermanQueries.createFishing error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }
        // if ( fishedItems.length == 0 && fishedRecipes.length == 0 ) {
        //     try {
        //         create = await FishermanQueries.createFishing(3, address, idSea, null, null, idFisherman, rodIdToolLevel, rodIdInstance, consumableIds[0], consumableIds[1], reduceCoolDown)
        //         logger.debug(`FishermanQueries.createFishing response : ${JSON.stringify(create)}`)
        //     } catch(error){
        //         logger.error(`FishermanQueries.createFishing error : ${Utils.printErrorLog(error)}`)
        //         throw(error)
        //     }
        // }
        let fishingEndingTime
        try {
            fishingEndingTime = await FishermanQueries.getFishingEndingTime(address, idSea, idFisherman, rodIdInstance)
            logger.debug(`FishermanQueries.getFishingEndingTime response : ${JSON.stringify(fishingEndingTime)}`)
        } catch (error) {
            logger.error(`FishermanQueries.getFishingEndingTime error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if (fishingEndingTime.length == 0) {
            throw ('No draw for fishing')
        }
        return fishingEndingTime[0].time
    }
    static async addExpToAddress(address, fishedExp) {
        let insertUserExp;
        try {
            insertUserExp = await FishermanQueries.createExpByAddress(address, fishedExp)
            logger.debug(`FishermanQueries.createExpByAddress response : ${JSON.stringify(insertUserExp)}`)
        } catch (error) {
            logger.error(`FishermanQueries.createExpByAddress error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }

        if (insertUserExp.insertId == 0) {
            let update
            try {
                update = await FishermanQueries.updateExpByAddress(address, fishedExp)
                logger.debug(`FishermanQueries.updateExpByAddress response : ${JSON.stringify(update)}`)
            } catch (error) {
                logger.error(`FishermanQueries.updateExpByAddress error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }

        return true
    }
    static async addFishedItemsToAddress(address, fishedItems) {
        let quantityItem = [];
        for (var i = 0; i < fishedItems.length; ++i) {
            let result
            try {
                result = await FishermanQueries.checkIfUserHasItem(address, fishedItems[i].idItem)
                logger.debug(`FishermanQueries.checkIfUserHasItem response : ${JSON.stringify(result)}`)
            } catch (error) {
                logger.error(`FishermanQueries.checkIfUserHasItem error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            let quantityInstance = {};

            if (result.length == 0) {
                quantityInstance.before = 0
            } else {
                quantityInstance.before = result[0].quantity;
            }
            quantityInstance.after = quantityInstance.before + fishedItems[i].quantity;
            quantityItem.push(quantityInstance);


            if (result.length == 0) {
                let create
                try {
                    create = await FishermanQueries.createItemInstanceByAddressIdItemQuantity(address, fishedItems[i].idItem, fishedItems[i].quantity)
                    logger.debug(`FishermanQueries.createItemInstanceByAddressIdItemQuantity response : ${JSON.stringify(create)}`)
                } catch (error) {
                    logger.error(`FishermanQueries.createItemInstanceByAddressIdItemQuantity error : ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
            } else {
                let update
                try {
                    update = await FishermanQueries.updateItemInstanceByIdItemInstance(result[0].idItemInstance, fishedItems[i].quantity)
                    logger.debug(`FishermanQueries.updateItemInstanceByIdItemInstance response : ${JSON.stringify(update)}`)
                } catch (error) {
                    logger.error(`FishermanQueries.updateItemInstanceByIdItemInstance error : ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
            }

        }

        return quantityItem
    }
    static async addFishedRecipesToAddress(address, fishedRecipes) {
        let quantityRecipe = [];
        for (var i = 0; i < fishedRecipes.length; ++i) {
            let result
            try {
                result = await FishermanQueries.checkIfUserHasRecipe(address, fishedRecipes[i].idRecipe)
                logger.debug(`FishermanQueries.checkIfUserHasRecipe response : ${JSON.stringify(result)}`)
            } catch (error) {
                logger.error(`FishermanQueries.checkIfUserHasRecipe error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            let quantityInstance = {}

            if (result.length == 0) {
                quantityInstance.before = 0
            } else {
                quantityInstance.before = result[0].quantity;
            }
            quantityInstance.after = quantityInstance.before + fishedRecipes[i].quantity;
            quantityRecipe.push(quantityInstance);

            if (result.length == 0) {
                let create
                try {
                    create = await FishermanQueries.createRecipeInstanceByAddressIdRecipeQuantity(address, fishedRecipes[i].idRecipe, fishedRecipes[i].quantity)
                    logger.debug(`FishermanQueries.createRecipeInstanceByAddressIdRecipeQuantity response : ${JSON.stringify(create)}`)
                } catch (error) {
                    logger.error(`FishermanQueries.createRecipeInstanceByAddressIdRecipeQuantity error : ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
            } else {
                let update
                try {
                    update = await FishermanQueries.updateRecipeInstanceByIdRecipeInstance(result[0].idRecipeInstance, fishedRecipes[i].quantity)
                    logger.debug(`FishermanQueries.updateRecipeInstanceByIdRecipeInstance response : ${JSON.stringify(update)}`)
                } catch (error) {
                    logger.error(`FishermanQueries.updateRecipeInstanceByIdRecipeInstance error : ${Utils.printErrorLog(error)}`)
                    throw (error)
                }
            }
        }

        return quantityRecipe
    }
    static async fish(address, idSea, consumableIds, allBonus) {
        let fishChance
        let randomNumber;
        let baseNumber;
        let percent;
        let response = { items: [], recipes: [], fishes: [], experience: 0 }

        if (!(consumableIds[0] == null && consumableIds[1] == null)) {
            let consumableRequirements
            try {
                consumableRequirements = await FishermanQueries.getConsumableRequirements(address, consumableIds)
                logger.debug(`FishermanQueries.getConsumableRequirements response : ${JSON.stringify(consumableRequirements)}`)
            } catch (error) {
                logger.error(`FishermanQueries.getConsumableRequirements error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            if (consumableRequirements.length == 0) {
                throw ('No requirement for consumables.')
            }

            let legalConsumables = {}
            let consumableAllowed = true
            for (let requirement of consumableRequirements) {
                legalConsumables[requirement.idItemConsumable] = true
                if (!requirement.isItemAllowed) {
                    consumableAllowed = false
                }
            }
            if (!consumableAllowed) {
                throw ('Not enough cost to use consumable.')
            }
            if ((consumableIds[0] != null && legalConsumables[consumableIds[0]] == undefined) || (consumableIds[1] != null && legalConsumables[consumableIds[1]] == undefined)) {
                throw ('User\'s forcing the API')
            }
            for (let requirement of consumableRequirements) {
                if (requirement.idItemInstance == null || requirement.idItemInstance == undefined) continue

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
        // reduce special items
        let isAlwaysSea
        try {
            isAlwaysSea = await FishermanQueries.isAlwaysSea(idSea)
            logger.debug(`FishermanQueries.isAlwaysSea response : ${JSON.stringify(isAlwaysSea)}`)
        } catch (error) {
            logger.error(`FishermanQueries.isAlwaysSea error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if (!isAlwaysSea) {
            let specialRequirements
            try {
                specialRequirements = await FishermanQueries.getSpecialRequirements(address, idSea)
                logger.debug(`FishermanQueries.getSpecialRequirements response : ${JSON.stringify(specialRequirements)}`)
            } catch (error) {
                logger.error(`FishermanQueries.getSpecialRequirements error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
            let specialRequirement = specialRequirements[0]
            if (!specialRequirement.hasInstance) {
                throw ('User is forcing API without the special requirements for the special sea')
            }

            if (specialRequirement.burn) {

                let allowBurn = true;
                let noTicketSpecial = allBonus.find(x => x['bonusCode'] === 'NO_TICKET_SPECIAL');
                if (noTicketSpecial != undefined) {
                    logger.debug(`bonus found ${JSON.stringify(noTicketSpecial)}`)
                    if (random.int(0, 99) < noTicketSpecial.percentageBoost) {
                        allowBurn = false;
                    }
                }

                if (allowBurn) {
                    if (specialRequirement.type == 'item') {
                        try {
                            await ItemQueries.subItemByIdItemInstance(specialRequirement.idInventoryInstance, specialRequirement.quantity)
                        } catch (error) {
                            logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`)
                            throw error
                        }
                        let remainQuantity
                        try {
                            remainQuantity = await ItemQueries.getQuantityByIdItemInstance(specialRequirement.idInventoryInstance)
                        } catch (error) {
                            logger.error(`Error in ItemQueries.getQuantityByIdItemInstance: ${Utils.printErrorLog(error)}`)
                            throw error
                        }
                        if (remainQuantity[0].quantity == 0) {
                            try {
                                await ItemQueries.removeItemInstance(specialRequirement.idInventoryInstance)
                            } catch (error) {
                                logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`)
                                throw error
                            }
                        }
                    } else if (specialRequirement.type == 'tool') {
                        try {
                            await InventoryQueries.removeToolInstance(specialRequirement.idInventoryInstance)
                        } catch (error) {
                            logger.error(`Error in InventoryQueries.removeToolInstance: ${Utils.printErrorLog(error)}`)
                            throw error
                        }
                    }
                }
            }
        }

        try {
            fishChance = await FishermanQueries.getFishChance(idSea)
            logger.debug(`FishermanQueries.getFishChance response : ${JSON.stringify(fishChance)}`)
        } catch (error) {
            logger.error(`FishermanQueries.getFishChance error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        if (fishChance.length == 0) {
            throw ('No sea with the idSea')
        }

        let fishedItems = [], fishableItems
        percent = random.float(0, 100);

        if (percent <= fishChance[0].chanceItem) {
            try {
                fishableItems = await FishermanQueries.fishableItems(idSea)
                logger.debug(`FishermanQueries.fishableItems response : ${JSON.stringify(fishedItems)}`)
            } catch (error) {
                logger.error(`FishermanQueries.fishableItems error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            randomNumber = random.float(0, 100);
            baseNumber = 0;

            for (let fishableItem of fishableItems) {
                baseNumber += fishableItem.itemProbability;
                if (baseNumber >= randomNumber) {
                    fishedItems.push(fishableItem);
                    break;
                }
            }

            let extraLootBonus = allBonus.find(x => x['bonusCode'] === 'EXTRA_LOOT');

            if (extraLootBonus != undefined) {
                logger.debug(`bonus found ${JSON.stringify(extraLootBonus)}`)
                if ((randomNumber = random.int(0, 99)) < extraLootBonus.percentageBoost) {
                    baseNumber = 0
                    for (let fishableItem of fishableItems) {
                        baseNumber += fishableItem.itemProbability;
                        if (baseNumber >= randomNumber) {
                            fishedItems.push(fishableItem);
                            break;
                        }
                    }
                }
            }
        }



        let chancePlus = false
        if (consumableIds[0] == 4 || consumableIds[1] == 4) {
            chancePlus = true
        }

        //DONT UNCOMMENT BUG PLUS IS TOO BIG
        // if ( chancePlus ) {
        //     fishChance[0].chanceRecipe += 10
        // }
        let fishedRecipes = [], fishableRecipes
        percent = random.float(0, 100);




        if (percent <= fishChance[0].chanceRecipe) {
            try {
                fishableRecipes = await FishermanQueries.fishableRecipes(idSea)
                logger.debug(`FishermanQueries.fishableRecipes response : ${JSON.stringify(fishedRecipes)}`)
            } catch (error) {
                logger.error(`FishermanQueries.fishableRecipes error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }

            randomNumber = random.float(0, 100);
            baseNumber = 0;

            for (let fishableRecipe of fishableRecipes) {
                baseNumber += fishableRecipe.recipeProbability;

                if (baseNumber >= randomNumber) {
                    fishedRecipes.push(fishableRecipe);
                    break;
                }
            }

            let extraRecipeBonus = allBonus.find(x => x['bonusCode'] === 'EXTRA_RECIPE');

            if (extraRecipeBonus != undefined) {
                logger.debug(`bonus found ${JSON.stringify(extraRecipeBonus)}`)
                if ((randomNumber = random.int(0, 99)) < extraRecipeBonus.percentageBoost) {
                    baseNumber = 0
                    for (let fishableRecipe of fishableRecipes) {
                        baseNumber += fishableRecipe.recipeProbability;

                        if (baseNumber >= randomNumber) {
                            fishedRecipes.push(fishableRecipe);
                            break;
                        }
                    }
                }
            }
        }

        let noFishDoubleLoot = false
        let noFishDoubleLootBonus = allBonus.find(x => x['bonusCode'] === 'LOOT_FOR_FISH');

        if (noFishDoubleLootBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(noFishDoubleLootBonus)}`)
            if (random.int(0, 99) < noFishDoubleLootBonus.percentageBoost) {
                noFishDoubleLoot = true
            }
        }


        let fishedExp = [], fishableFishes
        try {
            fishableFishes = await FishermanQueries.fishableFishes(idSea)
            logger.debug(`FishermanQueries.fishExp response : ${JSON.stringify(fishableFishes)}`)
        } catch (error) {
            logger.error(`FishermanQueries.fishExp error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        randomNumber = random.float(0, 100);
        baseNumber = 0;

        for (let fishableFish of fishableFishes) {
            baseNumber += fishableFish.probability;

            if (baseNumber >= randomNumber) {
                fishedExp.push(fishableFish);
                break;
            }
        }

        let extraFishBonus = allBonus.find(x => x['bonusCode'] === 'EXTRA_FISH');
        if (extraFishBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(extraFishBonus)}`)
            if (random.int(0, 99) < extraFishBonus.percentageBoost) {
                baseNumber = 0;

                for (let fishableFish of fishableFishes) {
                    baseNumber += fishableFish.probability;

                    if (baseNumber >= randomNumber) {
                        fishedExp.push(fishableFish);
                        break;
                    }
                }
            }
        }


        let doubleDrop = false, doubleLootDur = false

        let doubleBonus = allBonus.find(x => x['bonusCode'] === 'LOOT_FOR_DURABILITY');
        if (doubleBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(doubleBonus)}`);
            if (random.int(0, 99) < doubleBonus.percentageBoost) {
                doubleLootDur = true
            }
        }
        response.doubleLootDur = doubleLootDur;

        if (consumableIds[0] == 5 || consumableIds[1] == 5) {
            doubleDrop = true
        }


        for (var i = 0; i < fishedItems.length; ++i) {

            response.items.push(
                {
                    idItem: fishedItems[i].idItem,
                    quantity: (doubleDrop ? 2 : 1) * (doubleLootDur ? 2 : 1) * (noFishDoubleLoot ? 2 : 1) * Math.max(Math.min(fishedItems[i].maxDrop, parseInt(this.exp_func(fishedItems[i].alpha, fishedItems[i].beta, random.int(1, 100)))), 1),
                    name: fishedItems[i].name,
                    image: fishedItems[i].image,
                    rarity: fishedItems[i].rarity
                }
            )

        }
        for (var i = 0; i < fishedRecipes.length; ++i) {

            response.recipes.push(
                {
                    idRecipe: fishedRecipes[i].idRecipe,
                    quantity: (doubleDrop ? 2 : 1) * Math.max(Math.min(fishedRecipes[i].maxDrop, parseInt(this.exp_func(fishedRecipes[i].alpha, fishedRecipes[i].beta, random.int(1, 100)))), 1),
                    name: fishedRecipes[i].name,
                    image: fishedRecipes[i].image,
                    rarity: fishedRecipes[i].rarity
                }
            )

        }

        let tripleFish = false
        let fishForLootBonus = allBonus.find(x => x['bonusCode'] === 'FISH_FOR_LOOT');

        if (fishForLootBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(fishForLootBonus)}`)
            if (random.int(0, 99) < fishForLootBonus.percentageBoost) {
                tripleFish = true
            }
        }

        for (var i = 0; i < fishedExp.length; ++i) {
            fishedExp[i].experience = (doubleDrop ? 2 : 1) * (tripleFish ? 3 : 1) * fishedExp[i].experience
            response.fishes.push(fishedExp[i])
            response.experience += fishedExp[i].experience
        }

        let upStoneBonus = allBonus.find(x => x['bonusCode'] === 'EXTRA_UP_STONE');
        if (upStoneBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(upStoneBonus)}`)
            if (random.int(0, 99) < upStoneBonus.percentageBoost) {
                for (let item of response.items) {
                    if (item.name == "Upgrade Stone") {
                        item.quantity += 1
                    }
                }
            }
        }

        let sandBonus = allBonus.find(x => x['bonusCode'] === 'BOOST_SAND');
        if (sandBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(sandBonus)}`)
            if (random.int(0, 99) < sandBonus.percentageBoost) {
                for (let item of response.items) {
                    if (item.name == "Sand") {
                        item.quantity += Math.floor((item.quantity) / 4)
                    }
                }
            }
        }



        let doubleSandBonus = allBonus.find(x => x['bonusCode'] === 'DOUBLE_SAND');

        if (doubleSandBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(doubleSandBonus)}`)
            if (random.int(0, 99) < doubleSandBonus.percentageBoost) {
                for (let item of response.items) {
                    if (item.name == "Sand") {
                        item.quantity += item.quantity
                    }
                }
            }
        }

        let coralBonus = allBonus.find(x => x['bonusCode'] === 'BOOST_CORAL');
        if (coralBonus != undefined) {
            logger.debug(`bonus found ${JSON.stringify(coralBonus)}`)
            if (random.int(0, 99) < coralBonus.percentageBoost) {
                for (let item of response.items) {
                    if (item.name == "Coral") {
                        item.quantity += Math.floor((item.quantity) / 4)
                    }
                }
            }
        }

        //DROP BONUSES WITH IDITEM
        for (let bonus of allBonus) {

            if (bonus.idItem != null) {
                logger.debug(`bonus found ${JSON.stringify(bonus)}`);
                if (random.int(0, 99) < bonus.percentageBoost) {
                    let drop;
                    try {
                        drop = await ItemQueries.getItemGivenIdItem(bonus.idItem);
                        logger.debug(`ItemQueries.getItemGivenIdItem response : ${JSON.stringify(drop)}`)
                    } catch (error) {
                        logger.error(`ItemQueries.getItemGivenIdItem error : ${Utils.printErrorLog(error)}`)
                        throw (error)
                    }
                    drop = drop[0]
                    response.items.push(
                        {
                            idItem: drop.idItem,
                            quantity: 1,
                            name: drop.name,
                            image: drop.image,
                            rarity: drop.rarity
                        }
                    )
                }
            }
        }

        /*
        let seaChestBonus =  allBonus.find( x=> x['bonusCode'] === 'DROP_SEA_CHEST');
        if(seaChestBonus != undefined){
            logger.debug(`bonus found ${JSON.stringify(seaChestBonus)}`)
            if(random.int(0,99)<seaChestBonus.percentageBoost){
                let seaChest
                try {
                    seaChest = await ItemQueries.getItemGivenName("Sea Chest")
                    logger.debug(`ItemQueries.getItemGivenName response : ${JSON.stringify(seaChest)}`)
                }catch(error){
                    logger.error(`ItemQueries.getItemGivenName error : ${Utils.printErrorLog(error)}`)
                    throw(error)
                }
                seaChest = seaChest[0]
                response.items.push(
                    {
                        idItem: seaChest.idItem,
                        quantity: 1,
                        name: seaChest.name,
                        image: seaChest.image,
                        rarity: seaChest.rarity
                    }
                )
            }
        }

        let engChestBonus =  allBonus.find( x=> x['bonusCode'] === 'DROP_ENGINEER_CHEST');
        if(engChestBonus != undefined){
            logger.debug(`bonus found ${JSON.stringify(engChestBonus)}`)
            if(random.int(0,99)<engChestBonus.percentageBoost){
                let seaChest
                try {
                    seaChest = await ItemQueries.getItemGivenName("Engineer Chest")
                    logger.debug(`ItemQueries.getItemGivenName response : ${JSON.stringify(seaChest)}`)
                }catch(error){
                    logger.error(`ItemQueries.getItemGivenName error : ${Utils.printErrorLog(error)}`)
                    throw(error)
                }
                seaChest = seaChest[0]
                response.items.push(
                    {
                        idItem: seaChest.idItem,
                        quantity: 1,
                        name: seaChest.name,
                        image: seaChest.image,
                        rarity: seaChest.rarity
                    }
                )
            }
        }
        */

        if (tripleFish) {
            response.items = [];
        }
        if (noFishDoubleLoot) {
            response.fishes = []
            response.experience = 0
        }

        //logger.debug(`fishedExp:${JSON.stringify(fishedExp)}`)
        return response
    }
    static exp_func(alpha, beta, x) {
        let result = alpha * (Math.exp(beta * x))
        console.log('[INPUT] exp_func: ', alpha, beta, x)
        console.log('[OUTPUT] exp_func: ', result)
        return result
    }

    static async getFishermanBuilder(address) {
        return new Promise(async (resolve, reject) => {
            logger.debug(`getFishermanBuilder start`);
            let responseQueryTool, responseQueryFisherman, responseQuery1, responseQuery2, responseQuery3, fishingFisherman;
            let result, response, fishingRod;
            let rods = [], seas = [];
            let rodEndingTime;
            let fishermanEndingTime;
            let fishermanIsFishing = false;

            try {
                response = await FishermanQueries.UpdateFishingStatus();
                logger.debug(`FishermanQueries.UpdateFishingStatus response : ${JSON.stringify(response)}`);
            } catch (error) {
                logger.error(`FishermanQueries.UpdateFishingStatus error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }

            try {
                responseQueryTool = await FishermanQueries.getTool(address);
                logger.debug(`FishermanQueries.getTool response : ${JSON.stringify(responseQueryTool)}`);
            } catch (error) {
                logger.error(`FishermanQueries.getTool error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }



            try {
                responseQueryFisherman = await FishermanQueries.getQueryFisherman(address);
                logger.debug(`FishermanQueries.getQueryFisherman response : ${JSON.stringify(responseQueryFisherman)}`);
            } catch (error) {
                logger.error(`FishermanQueries.getQueryFisherman error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }

            if (responseQueryFisherman.length == 1) {
                try {

                    fishingFisherman = await FishermanQueries.getFishingGivenIdBuilding(responseQueryFisherman[0].id);
                    logger.debug(`FishermanQueries.getFishingGivenIdBuilding response : ${JSON.stringify(fishingFisherman)}`);
                } catch (error) {
                    logger.error(`FishermanQueries.getFishingGivenIdBuilding error : ${Utils.printErrorLog(error)}`);
                    return reject(error);
                }
            }

            try {
                responseQuery1 = await FishermanQueries.getQuerySea();
                logger.debug(`FishermanQueries.getQuerySea response : ${JSON.stringify(responseQuery1)}`);
            } catch (error) {
                logger.error(`FishermanQueries.getQuerySea error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }

            try {
                responseQuery2 = await FishermanQueries.getQueryEquippedTool(address);
                logger.debug(`FishermanQueries.getQueryEquippedTool response : ${JSON.stringify(responseQuery2)}`);
            } catch (error) {
                logger.error(`FishermanQueries.getQueryEquippedTool error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }



            try {
                responseQuery3 = await FishermanQueries.getQuerySeaItem();
                logger.debug(`FishermanQueries.getQuerySeaItem response : ${JSON.stringify(responseQuery3)}`);
            } catch (error) {
                logger.error(`FishermanQueries.getQuerySeaItem error : ${Utils.printErrorLog(error)}`);
                return reject(error);
            }





            for (let i = 0; i < responseQueryTool.length; i++) {
                console.log("ENTRATO 1")
                let rodObject = {
                    id: responseQueryTool[i].idToolInstance,
                    name: responseQueryTool[i].name,
                    level: responseQueryTool[i].level,
                    rarity: responseQueryTool[i].rarity,
                    durability: responseQueryTool[i].durability,
                    image: responseQueryTool[i].image
                };

                try {
                    logger.debug(`stampa debug ${JSON.stringify(responseQueryTool[i])}`);
                    fishingRod = await FishermanQueries.getFishingRodGivenidRod(responseQueryTool[i].idToolInstance);
                    logger.debug(`FishermanQueries.getFishingRodGivenidRod response : ${JSON.stringify(fishingRod)}`);
                } catch (error) {
                    logger.error(`FishermanQueries.getFishingRodGivenidRod error : ${Utils.printErrorLog(error)}`);
                    return reject(error);
                }

                if (fishingRod.length != 0) {
                    rodObject.isFishing = true;
                    // rodObject.fishingEndingTime = fishingRod[0].fishingEndingTime;

                    if (responseQueryTool[i].equipped) {
                        rodEndingTime = fishingRod[0].fishingEndingTime;
                    }

                } else {
                    rodObject.isFishing = false;
                }

                if (responseQueryTool[i].equipped) {
                    rodObject.status = 'equipped';
                }
                else {
                    if (responseQueryTool[i].rarity == 1) {
                        rodObject.status = 'available';
                    } else if (responseQueryTool[i].rarity == 2) {
                        rodObject.status = responseQueryFisherman[0].level >= 4 ? 'available' : 'not-available';
                    } else if (responseQueryTool[i].rarity == 3) {
                        rodObject.status = responseQueryFisherman[0].level >= 7 ? 'available' : 'not-available';
                    }
                }
                rods.push(rodObject);
            }


            for (let i = 0; i < responseQuery1.length; i++) {
                console.log("ENTRATO 2")

                let seaObject = {
                    id: responseQuery1[i].idSea,
                    title: responseQuery1[i].name,
                    description: responseQuery1[i].description,
                    rarityRequired: responseQuery1[i].rarityRequired,

                    isAllowed: (responseQuery2.length > 0 && responseQuery2[0].rarity >= responseQuery1[i].rarityRequired) ? true : false
                };

                if (!seaObject.isAllowed) {
                    seaObject.messageNotAllowed = responseQuery2.length == 0 ? "The fisherman needs a fishing rod" : "The equipped rod's rarity is too low";
                }
                else if (responseQueryFisherman.length != 1) {
                    seaObject.isAllowed = false;
                    seaObject.messageNotAllowed = "The user needs a staked fisherman"
                }
                else if (responseQueryFisherman[0].upgradeStatus == 1) {
                    seaObject.isAllowed = false;
                    seaObject.messageNotAllowed = "The fisherman must finish its upgrade"
                }
                else if (fishingFisherman.length > 0) {
                    seaObject.isAllowed = false;
                    seaObject.messageNotAllowed = "The fisherman must finish the current fishing session";
                    fishermanIsFishing = true;
                    fishermanEndingTime = fishingFisherman[0].fishingEndingTime;
                }


                seaObject.drop = responseQuery3.filter(item => item.idSea == responseQuery1[i].idSea);
                seas.push(seaObject);
            }
            result = {
                rods, seas, fishermanIsFishing, fishermanEndingTime, rodEndingTime
            };
            logger.debug(`getFishermanBuilder end`);
            return resolve(result);

        });
    }

    static async changeRodBuilder(idRodInstance, address) {
        let equippedRod, response, fishingRod, rodEndingTime;


        try {
            response = await FishermanQueries.UpdateFishingStatus();
            logger.debug(`FishermanQueries.UpdateFishingStatus response : ${JSON.stringify(response)}`);
        } catch (error) {
            logger.error(`FishermanQueries.UpdateFishingStatus error : ${Utils.printErrorLog(error)}`);
            throw (error);
        }
        try {
            equippedRod = await FishermanQueries.getQueryEquippedTool(address);
            logger.debug(`FishermanQueries.getQueryEquippedTool response : ${JSON.stringify(equippedRod)}`);
        } catch (error) {
            logger.error(`FishermanQueries.getQueryEquippedTool error : ${Utils.printErrorLog(error)}`);
            throw (error);
        }

        let rodObject = {
            id: equippedRod[0].idToolInstance,
            name: equippedRod[0].name,
            level: equippedRod[0].level,
            rarity: equippedRod[0].rarity,
            durability: equippedRod[0].durability,
        };

        try {
            fishingRod = await FishermanQueries.getFishingRodGivenidRod(equippedRod[0].idToolInstance);
            logger.debug(`FishermanQueries.getFishingRodGivenidRod response : ${JSON.stringify(fishingRod)}`);
        } catch (error) {
            logger.error(`FishermanQueries.getFishingRodGivenidRod error : ${Utils.printErrorLog(error)}`);
            throw (error);
        }

        if (fishingRod.length != 0) {
            rodObject.isFishing = true;
            rodObject.rodEndingTime = fishingRod[0].fishingEndingTime;

        } else {
            rodObject.isFishing = false;
        }

        if (equippedRod[0].equipped) {
            rodObject.status = 'equipped';
        }
        else {
            if (equippedRod[0].rarity == 1) {
                rodObject.status = 'available';
            } else if (equippedRod[0].rarity == 2) {
                rodObject.status = responseQueryFisherman[0].level >= 4 ? 'available' : 'not-available';
            } else if (equippedRod[0].rarity == 3) {
                rodObject.status = responseQueryFisherman[0].level >= 7 ? 'available' : 'not-available';
            }
        }

        return rodObject;
    }

    static async checkRarityByRodSea(address, rodIdInstance, idSea) {
        let rodRarity, seaRarity

        try {
            rodRarity = await FishermanQueries.getToolRarityGivenIdToolInstance(address, rodIdInstance)
            logger.debug(`FishermanQueries.getToolRarityGivenIdToolInstance response : ${JSON.stringify(rodRarity)}`)
        } catch (error) {
            logger.error(`FishermanQueries.getToolRarityGivenIdToolInstance error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }

        try {
            seaRarity = await FishermanQueries.getRarityGivenIdSea(idSea)
            logger.debug(`FishermanQueries.getRarityGivenIdSea response : ${JSON.stringify(seaRarity)}`)
        } catch (error) {
            logger.error(`FishermanQueries.getRarityGivenIdSea error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }

        if (rodRarity.length == 0) {
            return {
                pass: false,
                error: 'You haven\'t got that rod'
            }
        } else if (seaRarity.length == 0) {
            return {
                pass: false,
                error: 'There is no sea with that idSea'
            }
        } else if (rodRarity[0].rarity < seaRarity[0].rarityRequired) {
            return {
                pass: false,
                error: 'Rod\' rarity is lower than Sea\'s required rarity'
            }
        } else {
            return {
                pass: true
            }
        }
    }

    static async getSeasWithFishermanAllowance(address) {

        try {
            await FishermanQueries.UpdateFishingStatus()
        } catch (error) {
            logger.error(`FishermanQueries.UpdateFishingStatus error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }

        let checkFisherman
        try {
            checkFisherman = await FishermanQueries.checkFisherman(address)
        } catch (error) {
            logger.error(`Error in FishermanQueries.checkFisherman: ${Utils.printErrorLog(error)}`);
            throw error
        }

        let seaMessageNotAllowed = ''
        if (checkFisherman.length == 0) {
            seaMessageNotAllowed = 'The user needs a fisherman to fish'
        } else if (!checkFisherman[0].stake) {
            seaMessageNotAllowed = 'The user needs a staked fisherman'
        } else if (checkFisherman[0].upgradeStatus) {
            seaMessageNotAllowed = 'The fisherman must finish its upgrade'
        } else if (!checkFisherman[0].hasToolInstance) {
            seaMessageNotAllowed = 'Rarity required rod hasn\'t been equipped'
        } else if (checkFisherman[0].nowFishing) {
            seaMessageNotAllowed = 'The fisherman must finish the current fishing session'
        }
        if (!checkFisherman[0].hasToolInstance) {
            try {
                await FishermanQueries.removeEquippedTool(checkFisherman[0].idFisherman)
            } catch (error) {
                logger.error(`FishermanQueries.removeEquippedTool error : ${Utils.printErrorLog(error)}`)
                throw (error)
            }
        }
        let seaAllowed = true
        if (seaMessageNotAllowed != '') {
            seaAllowed = false
        }

        let fishermanResponse = { seas: [], checkFisherman: checkFisherman }

        let seas
        try {
            seas = await FishermanQueries.getSeas()
        } catch (error) {
            logger.error(`FishermanQueries.getSeas error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        let specialSeas
        try {
            specialSeas = await FishermanQueries.getAllowedSpecialSeas(address)
        } catch (error) {
            logger.error(`FishermanQueries.getAllowedSpecialSeas error : ${Utils.printErrorLog(error)}`)
            throw (error)
        }
        // console.log(seas, specialSeas)
        let specialSeaObj = {}
        for (let specialSea of specialSeas) {
            specialSeaObj[specialSea.id] = specialSea
        }
        let idSea = -1, seaObject
        for (var i = 0; i < seas.length; ++i) {
            if (!seas[i].always && specialSeaObj[seas[i].id] == undefined) {
                continue
            }
            if (seas[i].id != idSea && i != 0) {
                idSea = seas[i].id
                fishermanResponse.seas.push(seaObject)
                seaObject = {
                    id: seas[i].id,
                    always: seas[i].always,
                    specialInfo: specialSeaObj[seas[i].id],
                    title: seas[i].title,
                    description: seas[i].description,
                    rarityRequired: seas[i].rarityRequired,
                    isAllowed: checkFisherman.length > 0 && checkFisherman[0].rarity >= seas[i].rarityRequired && seaAllowed ? true : false,
                    messageNotAllowed: seaMessageNotAllowed,
                    drop: [{
                        name: seas[i].itemName,
                        image: seas[i].itemImage,
                        description: seas[i].itemDescription,
                        rarity: seas[i].itemRarity
                    }]
                }
            } else if (i == 0) {
                idSea = seas[i].id
                seaObject = {
                    id: seas[i].id,
                    always: seas[i].always,
                    specialInfo: specialSeaObj[seas[i].id],
                    title: seas[i].title,
                    description: seas[i].description,
                    rarityRequired: seas[i].rarityRequired,
                    isAllowed: checkFisherman.length > 0 && checkFisherman[0].rarity >= seas[i].rarityRequired && seaAllowed ? true : false,
                    messageNotAllowed: seaMessageNotAllowed,
                    drop: [{
                        name: seas[i].itemName,
                        image: seas[i].itemImage,
                        description: seas[i].itemDescription,
                        rarity: seas[i].itemRarity
                    }]
                }
            } else {
                seaObject.drop.push({
                    name: seas[i].itemName,
                    image: seas[i].itemImage,
                    description: seas[i].itemDescription,
                    rarity: seas[i].itemRarity
                })
            }
        }
        if (seas.length != 0) {
            fishermanResponse.seas.push(seaObject)
        }

        return fishermanResponse
    }

    static async burnPassiveLure(address, pkBuilding, burnLureCount) {
        let passiveData
        try {
            passiveData = await PassiveQueries.getPassiveDataFromPkBuilding(pkBuilding)
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveDataFromPkBuilding error : ${Utils.printErrorLog(error)}`
        }

        let response = {}

        // get full constant data for passiveFishing
        let idPassiveFishingLureItem
        try {
            idPassiveFishingLureItem = await PassiveQueries.getPassiveConstant('idPassiveFishingLureItem')
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
        }
        let actionCountPerFishingLure
        try {
            actionCountPerFishingLure = await PassiveQueries.getPassiveConstant('actionCountPerFishingLure')
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
        }
        let ancienCostPerEachFishingAction
        try {
            ancienCostPerEachFishingAction = await PassiveQueries.getPassiveConstant('ancienCostPerEachFishingAction')
        } catch (error) {
            logger.error(`PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getPassiveConstant error : ${Utils.printErrorLog(error)}`
        }

        // get lureItemInstance data
        let lureData
        try {
            lureData = await PassiveQueries.getItemInstanceData(address, idPassiveFishingLureItem)
        } catch (error) {
            logger.error(`PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.getItemInstanceData error : ${Utils.printErrorLog(error)}`
        }
        if (lureData == undefined || lureData.quantity < burnLureCount) {
            response.done = false
            response.message = 'You haven\'t got enough lures.'
            return response
        }
        lureData.quantity -= burnLureCount

        // sub passive lure item from idItemInstance
        try {
            await ItemQueries.subItemByIdItemInstance(lureData.idItemInstance, burnLureCount)
        } catch (error) {
            logger.error(`Error in ItemQueries.subItemByIdItemInstance: ${Utils.printErrorLog(error)}`);
            throw error
        }
        let remainQuantity
        try {
            remainQuantity = await ItemQueries.getQuantityByIdItemInstance(lureData.idItemInstance)
        } catch (error) {
            logger.error(`Error in ItemQueries.getQuantityByIdItemInstance: ${Utils.printErrorLog(error)}`);
            throw error
        }
        if (remainQuantity[0].quantity == 0) {
            try {
                await ItemQueries.removeItemInstance(lureData.idItemInstance)
            } catch (error) {
                logger.error(`Error in ItemQueries.removeItemInstance: ${Utils.printErrorLog(error)}`);
                throw error
            }
        }

        let burntActions = Math.min(passiveData.burntActions + actionCountPerFishingLure * burnLureCount, passiveData.maxStorableActions)
        // update burntActions
        try {
            await PassiveQueries.calculateBurntActions(passiveData.idPassive, burntActions)
        } catch (error) {
            logger.error(`PassiveQueries.calculateBurntActions error : ${Utils.printErrorLog(error)}`)
            throw `PassiveQueries.calculateBurntActions error : ${Utils.printErrorLog(error)}`
        }

        // check max performable ActionCount
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

        let maxPerformableActions = Math.min(Math.floor(ancien / ancienCostPerEachFishingAction), passiveData.storedActions, burntActions, Math.floor(rodDurability / 10))

        response.done = true
        response.message = 'Successfully done.'
        response.passiveInfo = {
            maxPerformableActions: maxPerformableActions,
            lureData: lureData,
            burntActions: burntActions,
        }

        return response
    }
}

module.exports = { FishermanService }