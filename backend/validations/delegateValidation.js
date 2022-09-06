const logger = require("../logging/logger")
const Validator = require("../utils/validator")

class DelegateValidation {
    static getDelegationDataValidation(req) {
        let address = req.locals.address
        let idDelegate = req.body.idDelegate

        if ( !Validator.validateInput(address, idDelegate) ) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idDelegate: ${JSON.stringify(idDelegate)}`)
            return {
                success: false,
                error: {
                    errorMessage: 'Input null or undefined'
                }
            }
        }
        if ( !Validator.validateAddress(address) ) {
            return {
                success: false,
                error: {
                    errorMessage: 'Invalid wallet address'
                }
            }
        }
        if ( !Validator.isPositiveInteger(idDelegate) ) {
            return {
                success: false,
                error: {
                    errorMessage: 'idDelegate is not an integer > 0'
                }
            }
        }

        return {
            success: true
        }
    }
    static updateDelegateValidation(req) {
        let address = req.locals.address
        let delegate = req.body.delegate

        if ( !Validator.validateInput(address, delegate) ) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, delegate: ${JSON.stringify(delegate)}`)
            return {
                success: false,
                error: {
                    errorMessage: 'Input null or undefined'
                }
            }
        }
        if ( !Validator.validateInput(delegate.id, delegate.deputy, delegate.isAllowed, delegate.delegations) ) {
            logger.warn(`Warn in validateInput (Input null or undefined), delegate: ${JSON.stringify(delegate)}`)
            return {
                success: false,
                error: {
                    errorMessage: 'Input null or undefined'
                }
            }
        }
        if ( !Validator.validateInput(delegate.delegations.claim, delegate.delegations.upgrade, delegate.delegations.marketplace, delegate.delegations.shop, delegate.delegations.transfer, delegate.delegations.profile, delegate.delegations.inventory, delegate.delegations.fisherman) ) {
            logger.warn(`Warn in validateInput (Input null or undefined), delegate: ${JSON.stringify(delegate)}`)
            return {
                success: false,
                error: {
                    errorMessage: 'Input null or undefined'
                }
            }
        }

        if ( !Validator.validateAddress(address) ) {
            return {
                success: false,
                error: {
                    errorMessage: 'Invalid wallet address'
                }
            }
        }
        
        if ( !Validator.validateAddress(delegate.deputy) ) {
            return {
                success: false,
                error: {
                    errorMessage: 'Invalid wallet address'
                }
            }
        }

        if ( !Validator.isPositiveInteger(delegate.id) ) {
            return {
                success: false,
                error: {
                    errorMessage: 'idDelegate is not an integer > 0'
                }
            }
        }

        return {
            success: true
        }
    }

    static deleteDelegateValidation(req) {
        let address = req.locals.address
        let idDelegate = req.body.idDelegate
        let deputy = req.body.deputy

        if ( !Validator.validateInput(address, idDelegate, deputy) ) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, idDelegate: ${idDelegate}, deputy: ${deputy}`)
            return {
                success: false,
                error: {
                    errorMessage: 'Input null or undefined'
                }
            }
        }

        if ( !Validator.validateAddress(address) ) {
            return {
                success: false,
                error: {
                    errorMessage: 'Invalid wallet address'
                }
            }
        }
        
        if ( !Validator.validateAddress(deputy) ) {
            return {
                success: false,
                error: {
                    errorMessage: 'Invalid wallet address'
                }
            }
        }

        if ( !Validator.isPositiveInteger(idDelegate) ) {
            return {
                success: false,
                error: {
                    errorMessage: 'idDelegate is not an integer > 0'
                }
            }
        }

        return {
            success: true
        }
    }

    static addDelegateValidation(req) {
        let address = req.locals.address
        let deputy = req.body.deputy

        if ( !Validator.validateInput(address, deputy) ) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, deputy: ${deputy}`)
            return {
                success: false,
                error: {
                    errorMessage: 'Input null or undefined'
                }
            }
        }

        if ( !Validator.validateAddress(address) ) {
            return {
                success: false,
                error: {
                    errorMessage: 'Invalid wallet address'
                }
            }
        }

        if ( !Validator.validateAddress(deputy) ) {
            return {
                success: false,
                error: {
                    errorMessage: 'Invalid wallet address'
                }
            }
        }

        return {
            success: true
        }
    }

    static getDelegatesValidation(req) {
        let address = req.locals.address

        if ( !Validator.validateInput(address) ) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`)
            return {
                success: false,
                error: {
                    errorMessage: 'Input null or undefined'
                }
            }
        }

        if ( !Validator.validateAddress(address) ) {
            return {
                success: false,
                error: {
                    errorMessage: 'Invalid wallet address'
                }
            }
        }

        return {
            success: true
        }
    }

    static getDelegatedCitiesValidation(req) {
        let address = req.locals.address

        if ( !Validator.validateInput(address) ) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}`)
            return {
                success: false,
                error: {
                    errorMessage: 'Input null or undefined'
                }
            }
        }

        if ( !Validator.validateAddress(address) ) {
            return {
                success: false,
                error: {
                    errorMessage: 'Invalid wallet address'
                }
            }
        }

        return {
            success: true
        }
    }
}

module.exports = { DelegateValidation }