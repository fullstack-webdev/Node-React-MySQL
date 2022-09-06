const logger = require("../logging/logger")
const Validator = require("../utils/validator")
class InventoryValidation{
    static getInventoryListValidation(req) {
        let address = req.locals.address
        if(!Validator.validateInput(address)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if(!Validator.validateAddress(address)){
            return {
                success: false,
                error: {
                    errorMessage: 'Wallet address is invalid.'
                }
            }
        }
        return {
            success: true
        }
    }
    static getInventoryInstanceDataValidation(req) {
        let address = req.locals.address
        let idInventoryInstance = req.body.idInventoryInstance
        let inventoryType = req.body.inventoryType
        if(!Validator.validateInput(address, idInventoryInstance, inventoryType)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idInventoryInstance: ${idInventoryInstance}, inventoryType: ${inventoryType}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if(!Validator.validateAddress(address)){
            return {
                success: false,
                error: {
                    errorMessage: 'Wallet address is invalid.'
                }
            }
        }
        if(!Validator.isPositiveInteger(idInventoryInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idInventoryInstance is not an integer > 0`
                }
            }
        }
        return {
            success: true
        }
    }
    static sendItemValidation(req){
        let addressSender =  req.locals.address;
        let addressReceiver = req.body.receiver;
        let idItemInstance = req.body.idItemInstance;
        let quantity = req.body.quantity;
        if(!Validator.validateInput(addressSender,addressReceiver,idItemInstance,quantity)){
            logger.warn(`Warn in validateInput (Input null or undefined), addressSender: ${addressSender} ,addressReceiver ${addressReceiver},idItemInstance ${idItemInstance},quantity ${quantity}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if(!Validator.validateAddress(addressSender)){
            return {
                success: false,
                error: {
                    errorMessage: `Sender wallet address is invalid.`
                }
            }
        }
        if(!Validator.validateAddress(addressReceiver)){
            return {
                success: false,
                error: {
                    errorMessage: `Receiver wallet address is invalid.`
                }
            }
        }
        if(!Validator.isPositiveInteger(idItemInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idItemInstance is not an integer > 0`
                }
            }
        }
        if(!Validator.isPositiveInteger(quantity)){
            return {
                success: false,
                error: {
                    errorMessage: `quantity is not an integer > 0`
                }
            }
        }
        return {
            success: true
        }
    }
    static sendToolValidation(req){
        let addressSender =  req.locals.address;
        let addressReceiver = req.body.receiver;
        let idToolInstance = req.body.idToolInstance;
        let quantity = req.body.quantity;
        if(!Validator.validateInput(addressSender,addressReceiver,idToolInstance,quantity)){
            logger.warn(`Warn in validateInput (Input null or undefined), addressSender: ${addressSender} ,addressReceiver ${addressReceiver},idItemInstance ${idItemInstance},quantity ${quantity}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if(!Validator.validateAddress(addressSender)){
            return {
                success: false,
                error: {
                    errorMessage: `Sender wallet address is invalid.`
                }
            }
        }
        if(!Validator.validateAddress(addressReceiver)){
            return {
                success: false,
                error: {
                    errorMessage: `Receiver wallet address is invalid.`
                }
            }
        }
        if(!Validator.isPositiveInteger(idToolInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idToolInstance is not an integer > 0`
                }
            }
        }
        if(!Validator.isPositiveInteger(quantity)){
            return {
                success: false,
                error: {
                    errorMessage: `quantity is not an integer > 0`
                }
            }
        }
        return {
            success: true
        }
    }
    static repairToolValidation (req) {
        let address = req.locals.address;
        let idToolInstance = req.body.idToolInstance
        let consumableIds = req.body.consumableIds
        if(!Validator.validateInput(address, idToolInstance, consumableIds)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idToolInstance: ${idToolInstance}, consumableIds: ${JSON.stringify(consumableIds)}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if(!Validator.validateAddress(address)){
            return {
                success: false,
                error: {
                    errorMessage: `Wallet address is invalid.`
                }
            }
        }
        if(!Validator.isPositiveInteger(idToolInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idToolInstance is not an integer > 0`
                }
            }
        }
        /* for (let consumableId of consumableIds) {
            if(!Validator.isPositiveInteger(consumableId)){
                return {
                    success: false,
                    error: {
                        errorMessage: `consumableId is not an integer > 0`
                    }
                }
            }
        } */
        return {
            success: true
        }
    }
    static openChestValidation (req) {
        let address = req.locals.address;
        let idItemInstance = req.body.idItemInstance
        let openCount = req.body.openCount

        if(!Validator.validateInput(address, idItemInstance, openCount)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idToolInstance: ${idToolInstance}, openCount: ${openCount}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if(!Validator.validateAddress(address)){
            return {
                success: false,
                error: {
                    errorMessage: `Wallet address is invalid.`
                }
            }
        }
        if(!Validator.isPositiveInteger(idItemInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idItemInstance is not an integer > 0`
                }
            }
        }
        if(!Validator.isPositiveInteger(openCount)){
            return {
                success: false,
                error: {
                    errorMessage: `openCount is not an integer > 0`
                }
            }
        }
        return {
            success: true
        }
    }
    static upgradeToolValidation (req) {
        let address = req.locals.address;
        let idToolInstance = req.body.idToolInstance
        let consumableIds = req.body.consumableIds
        if(!Validator.validateInput(address, idToolInstance, consumableIds)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idToolInstance: ${idToolInstance}, consumableIds: ${JSON.stringify(consumableIds)}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if(!Validator.validateAddress(address)){
            return {
                success: false,
                error: {
                    errorMessage: `Wallet address is invalid.`
                }
            }
        }
        if(!Validator.isPositiveInteger(idToolInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idToolInstance is not an integer > 0`
                }
            }
        }
        /* for (let consumableId of consumableIds) {
            if(!Validator.isPositiveInteger(consumableId)){
                return {
                    success: false,
                    error: {
                        errorMessage: `consumableId is not an integer > 0`
                    }
                }
            }
        } */
        return {
            success: true
        }
    }
    static craftValidation(req){
        let address = req.locals.address;
        let idRecipeInstance = req.body.idRecipeInstance;
        let burnToolIds = req.body.burnToolIds
        let consumableIds = req.body.consumableIds
        let craftCount = req.body.craftCount

        if(!Validator.validateInput(address, idRecipeInstance, burnToolIds, consumableIds, craftCount)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idRecipeInstance: ${idRecipeInstance}, burnToolIds: ${JSON.stringify(burnToolIds)}, consumableIds: ${JSON.stringify(consumableIds)}, craftCount: ${craftCount}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if(!Validator.validateAddress(address)){
            return {
                success: false,
                error: {
                    errorMessage: `Wallet address is invalid.`
                }
            }
        }
        if(!Validator.isPositiveInteger(idRecipeInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idRecipeInstance is not an integer > 0`
                }
            }
        }
        for (let burnToolId of burnToolIds) {
            if(!Validator.isPositiveInteger(burnToolId)){
                return {
                    success: false,
                    error: {
                        errorMessage: `burnToolId is not an integer > 0`
                    }
                }
            }
        }
        if(!Validator.isPositiveInteger(craftCount)){
            return {
                success: false,
                error: {
                    errorMessage: `craftCount is not an integer > 0`
                }
            }
        }
        return {
            success: true
        }
    }
    static sendRecipeValidation(req){
        let addressSender =  req.locals.address;
        let addressReceiver = req.body.receiver;
        let idRecipeInstance = req.body.idRecipeInstance;
        let quantity = req.body.quantity;
        if(!Validator.validateInput(addressSender,addressReceiver,idRecipeInstance,quantity)){
            logger.warn(`Warn in validateInput (Input null or undefined), addressSender: ${addressSender} ,addressReceiver ${addressReceiver},idRecipeInstance ${idRecipeInstance},quantity ${quantity}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if(!Validator.validateAddress(addressSender)){
            return {
                success: false,
                error: {
                    errorMessage: `Sender wallet address is invalid.`
                }
            }
        }
        if(!Validator.validateAddress(addressReceiver)){
            return {
                success: false,
                error: {
                    errorMessage: `Receiver wallet address is invalid.`
                }
            }
        }
        if(!Validator.isPositiveInteger(idRecipeInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idRecipeInstance is not an integer > 0`
                }
            }
        }
        if(!Validator.isPositiveInteger(quantity)){
            return {
                success: false,
                error: {
                    errorMessage: `quantity is not an integer > 0`
                }
            }
        }
        return {
            success: true
        }
    }
    static sellInventoryValidation(req) {
        return {
            success: true
        }
    }

    static craftNpcValidation(req){
        let address = req.locals.address;
        let idRecipe = req.body.idRecipe;
        let burnToolIds = req.body.burnToolIds;
        let consumableIds = req.body.consumableIds;
        let craftCount = req.body.craftCount;

        if(!Validator.validateInput(address, idRecipe, burnToolIds, consumableIds, craftCount)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idRecipeInstance: ${idRecipe}, burnToolIds: ${JSON.stringify(burnToolIds)}, consumableIds: ${JSON.stringify(consumableIds)}, craftCount: ${craftCount}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            return {
                success: false,
                error: {
                    errorMessage: `Wallet is not an address`
                }
            }
        }
        if(!Validator.isNaturalInteger(idRecipe)){
            return {
                success: false,
                error: {
                    errorMessage: `idRecipe is not a natural integer`
                }
            }
        }
        for (let burnToolId of burnToolIds) {
            if(!Validator.isPositiveInteger(burnToolId)){
                return {
                    success: false,
                    error: {
                        errorMessage: `burnToolId is not an integer > 0`
                    }
                }
            }
        }
        if(!Validator.isPositiveInteger(craftCount)){
            return {
                success: false,
                error: {
                    errorMessage: `craftCount is not an integer > 0`
                }
            }
        }
        return {
            success: true
        }

    }

    static getRecipeNPCInstanceValidation(req) {
        let address = req.locals.address
        let idRecipe = req.body.idRecipe
        if(!Validator.validateInput(address,idRecipe)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idRecipe:${idRecipe}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if(!Validator.validateAddress(address)){
            return {
                success: false,
                error: {
                    errorMessage: 'Wallet address is invalid.'
                }
            }
        }

        if(!Validator.isPositiveInteger(idRecipe)){
            return {
                success: false,
                error: {
                    errorMessage: `idInventoryInstance is not an integer > 0`
                }
            }
        }
        return {
            success: true
        }
    }

    static getRecipeGemInstanceValidation(req) {
        let address = req.locals.address
        let idRecipe = req.body.idRecipe
        if(!Validator.validateInput(address,idRecipe)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idRecipe:${idRecipe}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }
        if(!Validator.validateAddress(address)){
            return {
                success: false,
                error: {
                    errorMessage: 'Wallet address is invalid.'
                }
            }
        }

        if(!Validator.isPositiveInteger(idRecipe)){
            return {
                success: false,
                error: {
                    errorMessage: `idInventoryInstance is not an integer > 0`
                }
            }
        }
        return {
            success: true
        }
    }

    static craftGemValidation(req){
        let address = req.locals.address;
        let idRecipe = req.body.idRecipe;
        let burnToolIds = req.body.burnToolIds;
        let consumableIds = req.body.consumableIds;
        let craftCount = req.body.craftCount;

        if(!Validator.validateInput(address, idRecipe, burnToolIds, consumableIds, craftCount)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idRecipeInstance: ${idRecipe}, burnToolIds: ${JSON.stringify(burnToolIds)}, consumableIds: ${JSON.stringify(consumableIds)}, craftCount: ${craftCount}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            return {
                success: false,
                error: {
                    errorMessage: `Wallet is not an address`
                }
            }
        }
        if(!Validator.isNaturalInteger(idRecipe)){
            return {
                success: false,
                error: {
                    errorMessage: `idRecipe is not a natural integer`
                }
            }
        }
        for (let burnToolId of burnToolIds) {
            if(!Validator.isPositiveInteger(burnToolId)){
                return {
                    success: false,
                    error: {
                        errorMessage: `burnToolId is not an integer > 0`
                    }
                }
            }
        }
        if(!Validator.isPositiveInteger(craftCount)){
            return {
                success: false,
                error: {
                    errorMessage: `craftCount is not an integer > 0`
                }
            }
        }
        return {
            success: true
        }

    }
    
}

module.exports = {InventoryValidation}