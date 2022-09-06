const logger = require("../logging/logger");
const Validator = require("../utils/validator");

class BonusValidation{
    static getEnchantingTableValidation(req) {
        let address = req.locals.address;

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
                    errorMessage: `Wallet is not an address`
                }
            }
        }

        return {
            success: true
        }
        
    }

    static elevateBonusValidation(req) {
        let address = req.locals.address;
        let idToolInstance = req.body.idToolInstance;
        let idItemConsumableBonus = req.body.idItemConsumableBonus;

        if(!Validator.validateInput(address, idToolInstance, idItemConsumableBonus)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idToolInstance: ${idToolInstance}, idItemConsumableBonus: ${idItemConsumableBonus}`)
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

        if(!Validator.isPositiveInteger(idToolInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idToolInstance is not an integer > 0`
                }
            }
        }

        if(!Validator.isPositiveInteger(idItemConsumableBonus)){
            return {
                success: false,
                error: {
                    errorMessage: `idItemConsumableBonus is not an integer > 0`
                }
            }
        }

        return {
            success: true
        }
        
    }

    static enchantToolValidation(req) {
        let address = req.locals.address;
        let idToolInstance = req.body.idToolInstance;
        let idItemConsumableBonus = req.body.idItemConsumableBonus;

        if(!Validator.validateInput(address, idToolInstance, idItemConsumableBonus)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idToolInstance: ${idToolInstance}, idItemConsumableBonus: ${idItemConsumableBonus}`)
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

        if(!Validator.isPositiveInteger(idToolInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idToolInstance is not an integer > 0`
                }
            }
        }

        if(!Validator.isPositiveInteger(idItemConsumableBonus)){
            return {
                success: false,
                error: {
                    errorMessage: `idItemConsumableBonus is not an integer > 0`
                }
            }
        }

        return {
            success: true
        }
        
    }

    static rerollBonusValidation(req) {
        let address = req.locals.address;
        let idToolInstance = req.body.idToolInstance;
        let idItemConsumableBonus = req.body.idItemConsumableBonus;

        if(!Validator.validateInput(address, idToolInstance, idItemConsumableBonus)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idToolInstance: ${idToolInstance}, idItemConsumableBonus: ${idItemConsumableBonus}`)
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

        if(!Validator.isPositiveInteger(idToolInstance)){
            return {
                success: false,
                error: {
                    errorMessage: `idToolInstance is not an integer > 0`
                }
            }
        }

        if(!Validator.isPositiveInteger(idItemConsumableBonus)){
            return {
                success: false,
                error: {
                    errorMessage: `idItemConsumableBonus is not an integer > 0`
                }
            }
        }

        return {
            success: true
        }
        
    }
}

module.exports = {BonusValidation}