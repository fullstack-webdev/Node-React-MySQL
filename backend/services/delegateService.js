const logger = require('../logging/logger')

const { DelegateQueries } = require('../queries/delegateQueries')
const { DelegateInterface } = require('../interfaces/JS/delegateInterface')

class DelegateService {
    static async addDelegate(address, deputy) {
        logger.debug(`addDelegate service start`)

        let result

        // CHECK IF THE DELEGATE ALREADY EXISTS
        try {
            result = await DelegateQueries.checkIfDelegateExists(address, deputy)
            logger.debug(`DelegateQueries.checkIfDelegateExists response : ${JSON.stringify(result)}`)
        } catch (err) {
            throw (err)
        }
        if (result.length != 0) {
            return {
                success: false,
                data: {
                    message: `The delegate already exists..`
                }
            }
        }

        // CHECK IF IT IS OWN DELEGATE
        if (address == deputy) {
            return {
                success: false,
                data: {
                    message: `That's your own address. :)`
                }
            }
        }

        // CHECK IF THE DEPUTY USER EXISTS
        try {
            result = await DelegateQueries.checkIfUserExists(deputy)
            logger.debug(`DelegateQueries.checkIfUserExists response : ${JSON.stringify(result)}`)
        } catch (err) {
            throw (err)
        }
        if (result.length == 0) {
            return {
                success: false,
                data: {
                    message: `That deputy user doesn't exist..`
                }
            }
        }

        // ADD THE DELEGATE
        try {
            result = await DelegateQueries.addDelegate(address, deputy)
            logger.debug(`DelegateQueries.addDelegate response : ${JSON.stringify(result)}`)
        } catch (err) {
            throw (err)
        }

        // GET ADDED DELEGATE
        try {
            result = await DelegateQueries.getDelegate(address, deputy)
            logger.debug(`DelegateQueries.getDelegate response : ${JSON.stringify(result)}`)
        } catch (err) {
            throw (err)
        }

        // FORMAT THE RESULT
        let delegates = DelegateInterface.buildGetDelegates(result)

        logger.debug(`addDelegate service end`)
        return {
            success: true,
            data: {
                newDelegate: delegates[0],
                message: 'Successfully added!'
            }
        }
    }

    static async getDelegates(address) {
        logger.debug(`getDelegates service start`)

        // GET DELEGATES
        let delegates
        try {
            delegates = await DelegateQueries.getDelegates(address)
            logger.debug(`DelegateQueries.getDelegates response : ${JSON.stringify(delegates)}`)
        } catch (err) {
            throw (err)
        }

        // FORMAT THE RESULT
        delegates = DelegateInterface.buildGetDelegates(delegates)

        logger.debug(`getDelegates service end`)
        return delegates
    }

    static async deleteDelegate(address, idDelegate, deputy) {
        logger.debug(`deleteDelegate service start`)

        let result

        // CHECK IF THE DELEGATE MATCHES THE ADDRESS
        try {
            result = await DelegateQueries.checkDelegateByAddress(address, idDelegate, deputy)
            logger.debug(`DelegateQueries.checkDelegateByAddress response : ${JSON.stringify(result)}`)
        } catch (err) {
            throw (err)
        }
        if (result.length != 1) {
            throw ('The user forced API!')
        }

        // DELETE THE DELEGATE
        try {
            result = await DelegateQueries.deleteDelegate(idDelegate)
            logger.debug(`DelegateQueries.deleteDelegate response : ${JSON.stringify(result)}`)
        } catch (err) {
            throw (err)
        }

        logger.debug(`deleteDelegate service end`)
        return {
            success: true,
            data: {
                message: 'Successfully deleted!'
            }
        }
    }

    static async updateDelegate(address, delegate) {
        logger.debug(`updateDelegate service start`)

        let result

        // CHECK IF THE DELEGATE MATCHES THE ADDRESS
        try {
            result = await DelegateQueries.checkDelegateByAddress(address, delegate.id, delegate.deputy)
            logger.debug(`DelegateQueries.checkDelegateByAddress response : ${JSON.stringify(result)}`)
        } catch (err) {
            throw (err)
        }
        if (result.length != 1) {
            throw ('The user forced API!')
        }

        // DELETE THE DELEGATE
        try {
            result = await DelegateQueries.updateDelegate(delegate)
            logger.debug(`DelegateQueries.updateDelegate response : ${JSON.stringify(result)}`)
        } catch (err) {
            throw (err)
        }

        logger.debug(`updateDelegate service end`)
        return {
            success: true,
            data: {
                message: 'Successfully saved!'
            }
        }
    }

    static async getDelegationData(address, idDelegate) {
        logger.debug(`getDelegationData service start`)

        // GET DELEGATED CITIES
        let delegationData
        try {
            delegationData = await DelegateQueries.getDelegationData(address, idDelegate)
            logger.debug(`DelegateQueries.getDelegationData response : ${JSON.stringify(delegationData)}`)
        } catch (err) {
            throw (err)
        }

        if (delegationData.length == 0) {
            throw ('You are not the deputy of that Delegation');
        }

        // FORMAT THE RESULT
        delegationData = DelegateInterface.buildGetDelegationData(delegationData)

        logger.debug(`getDelegationData service end`)
        return delegationData
    }
    static async getDelegatedCities(address) {
        logger.debug(`getDelegatedCities service start`)

        // GET DELEGATED CITIES
        let delegatedCities
        try {
            delegatedCities = await DelegateQueries.getDelegatedCities(address)
            logger.debug(`DelegateQueries.getDelegatedCities response : ${JSON.stringify(delegatedCities)}`)
        } catch (err) {
            throw (err)
        }

        // FORMAT THE RESULT
        delegatedCities = DelegateInterface.buildGetDelegatedCities(delegatedCities)

        logger.debug(`getDelegatedCities service end`)
        return delegatedCities
    }
}

module.exports = { DelegateService }