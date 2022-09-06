const logger = require('../../logging/logger')

class DelegateInterface{
    constructor() {}
    static buildGetDelegationData(delgationRows) {
        logger.debug('buildGetDelegationData interface start')
        let row = delgationRows[0];
        let delegations = []
        delegations.push({type: 'claim', allowed: row.claim == 1 ? true : false})
        delegations.push({type: 'upgrade', allowed: row.upgrade == 1 ? true : false})
        delegations.push({type: 'marketplace', allowed: row.marketplace == 1 ? true : false})
        delegations.push({type: 'shop', allowed: row.shop == 1 ? true : false})
        delegations.push({type: 'transfer', allowed: row.transfer == 1 ? true : false})
        delegations.push({type: 'profile', allowed: row.profile == 1 ? true : false})
        delegations.push({type: 'fisherman', allowed: row.fisherman == 1 ? true : false})
        delegations.push({type: 'inventory', allowed: row.inventory == 1 ? true : false})
        logger.debug('buildGetDelegationData interface end')
        return delegations
    }

    static buildGetDelegates(delegatesRows) {
        logger.debug('buildGetDelegates interface start')

        let delegates
        delegates = delegatesRows.map((row) => ({
                id: row.idDelegate,
                deputy: row.deputy,
                disDeputy: row.disDeputy,
                isAllowed: row.isAllowed == 1 ? true : false,
                delegations: {
                    claim: row.claim == 1 ? true : false,
                    upgrade: row.upgrade == 1 ? true : false,
                    marketplace: row.marketplace == 1 ? true : false,
                    shop: row.shop == 1 ? true : false,
                    transfer: row.transfer == 1 ? true : false,
                    profile: row.profile == 1 ? true : false,
                    fisherman: row.fisherman == 1 ? true : false,
                    inventory: row.inventory == 1 ? true : false
                }
            })
        )
            
        logger.debug('buildGetDelegates interface end')
        return delegates
    }

    static buildGetDelegatedCities(delegatedCitiesRows) {
        logger.debug('buildGetDelegatedCities interface start')

        let delegatedCities
        delegatedCities = delegatedCitiesRows.map((row) => {
            let delegations = []
            delegations.push({type: 'claim', allowed: row.claim == 1 ? true : false})
            delegations.push({type: 'upgrade', allowed: row.upgrade == 1 ? true : false})
            delegations.push({type: 'marketplace', allowed: row.marketplace == 1 ? true : false})
            delegations.push({type: 'shop', allowed: row.shop == 1 ? true : false})
            delegations.push({type: 'transfer', allowed: row.transfer == 1 ? true : false})
            delegations.push({type: 'profile', allowed: row.profile == 1 ? true : false})
            delegations.push({type: 'fisherman', allowed: row.fisherman == 1 ? true : false})
            delegations.push({type: 'inventory', allowed: row.inventory == 1 ? true : false})
            return {
                id: row.idDelegate,
                owner: row.owner,
                disOwner: row.disOwner,
                imageOwner: row.image,
                isAllowed: row.isAllowed == 1 ? true : false,
                delegations: delegations
            }}
        )
            
        logger.debug('buildGetDelegatedCities interface end')
        return delegatedCities
    }
}

module.exports = { DelegateInterface }