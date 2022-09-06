const logger = require("../logging/logger");
const Validator = require("../utils/validator");

class FishermanValidation{
    static burnPassiveLureValidation(req) {
        let address = req.locals.address;
        let burnLureCount = req.body.burnLureCount;

        if(!Validator.validateInput(address, burnLureCount)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, burnLureCount: ${burnLureCount}`);
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

        if(!Validator.isNaturalInteger(burnLureCount)){
            return {
                success: false,
                error: {
                    errorMessage: `burnLureCount is not a natural integer`
                }
            }
        }

        return {
            success: true
        }
    }
    static unEquipRodValidator(req) {
        let address = req.locals.address;
        let idToolInstance = req.body.idToolInstance;

        if(!Validator.validateInput(address, idToolInstance)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`);
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

        if(!Validator.isNaturalInteger(idToolInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idToolInstance is not a natural integer`
                }
            }
        }

        return {
            success: true
        }
    }

    static getFishermanValidation(req){
        let address = req.locals.address
        if(!Validator.validateInput(address)){
            return {
                success: false,
                error: {
                    errorMessage: "input null or undefined"
                }
            }
        }
        if(!Validator.validateAddress(address)){
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }
        return {
            success: true
        }
    }

    static changeRodValidator(req){
        let address = req.locals.address;
        let idToolInstance = req.body.idToolInstance;

        if(!Validator.validateInput(address, idToolInstance)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`);
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

        if(!Validator.isNaturalInteger(idToolInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idToolInstance is not a natural integer`
                }
            }
        }

        // if(!Validator.validateType(type)){
        //     return {
        //         success: false,
        //         error: {
        //             errorMessage: `type is not a type`
        //         }
        //     }
        // }

        return {
            success: true
        }
    }

    static passiveFishValidation(req){
        let address = req.locals.address;
        let idSea = req.body.idSea;
        let consumableIds = req.body.consumableIds
        let actionNumber = req.body.actionNumber

        if(!Validator.validateInput(address, idSea, consumableIds, actionNumber)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idSea: ${idSea}, consumableIds: ${JSON.stringify(consumableIds)}, actionNumber: ${actionNumber}`);
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

        if(!Validator.isPositiveInteger(idSea)){
            return{
                success: false,
                error: {
                    errorMessage : "idSea is not a positive integer"
                }
            }
        }
        

        if(!Validator.isPositiveInteger(actionNumber)){
            return{
                success: false,
                error: {
                    errorMessage : "actionNumber is not a positive integer"
                }
            }
        }

        return {
            success: true
        }
    }

    static fishValidation(req){
        let address = req.locals.address;
        let idSea = req.body.idSea;
        let consumableIds = req.body.consumableIds

        if(!Validator.validateInput(address, idSea, consumableIds)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idSea: ${idSea}, consumableIds: ${JSON.stringify(consumableIds)}`);
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

        if(!Validator.isPositiveInteger(idSea)){
            return{
                success: false,
                error: {
                    errorMessage : "idSea is not a positive integer"
                }
            }
        }

        return {
            success: true
        }
    }

    static upgradeRodValidation(req) {
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

    static repairRodValidation(req) {
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
}

module.exports = {FishermanValidation}