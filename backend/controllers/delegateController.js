const logger = require('../logging/logger')
const Validator = require('../utils/validator')
const { Utils } = require('../utils/utils')

const { DelegateValidation } = require('../validations/delegateValidation')
const { DelegateService } = require('../services/delegateService')

async function addDelegate(req, res) {
    logger.info(`addDelegate START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    logger.debug(`ipAddress:${Validator.getIpAddress(req)}`)

    // VALIDATE INPUT
    let validation
    validation = DelegateValidation.addDelegateValidation(req)
    if ( !validation.success ) {
        return res
        .status(401)
        .json(validation)
    }

    let address = req.locals.address
    let deputy = req.body.deputy

    // ADD THE DELEGATE
    let response
    try {
        response = await DelegateService.addDelegate(address, deputy)
    } catch ( error ) {
        logger.error(`Error in DelegateService.addDelegate: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }

    logger.info(`addDelegate response: ${JSON.stringify(response)}`)
    logger.info(`addDelegate END`)

    return res
    .status(200)
    .json({
        ...response
    })
}

async function getDelegates(req, res) {
    logger.info(`getDelegates START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    logger.debug(`ipAddress:${Validator.getIpAddress(req)}`)
 
    // VALIDATE INPUT
    let validation
    validation = DelegateValidation.getDelegatesValidation(req)
    if ( !validation.success ) {
        return res
        .status(401)
        .json(validation)
    }
   
    let address = req.locals.address

    // GET THE DELEGATES
    let delegates
    try {
        delegates = await DelegateService.getDelegates(address)
    } catch ( error ) {
        logger.error(`Error in DelegateService.getDelegates: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }

    logger.info(`getDelegates response: ${JSON.stringify({success: true, data: delegates})}`)
    logger.info(`getDelegates END`)

    return res
    .status(200)
    .json({
        success: true,
        data: delegates
    })
}

async function deleteDelegate(req, res) {
    logger.info(`deleteDelegate START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    logger.debug(`ipAddress:${Validator.getIpAddress(req)}`)
 
    // VALIDATE INPUT
    let validation
    validation = DelegateValidation.deleteDelegateValidation(req)
    if ( !validation.success ) {
        return res
        .status(401)
        .json(validation)
    }
   
    let address = req.locals.address
    let idDelegate = req.body.idDelegate
    let deputy = req.body.deputy


    // DELETE THE DELEGATE
    let response
    try {
        response = await DelegateService.deleteDelegate(address, idDelegate, deputy)
    } catch ( error ) {
        logger.error(`Error in DelegateService.deleteDelegate: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }

    logger.info(`deleteDelegate response: ${JSON.stringify(response)}`)
    logger.info(`deleteDelegate END`)

    return res
    .status(200)
    .json({
        ...response
    })
}


async function updateDelegate(req, res){
    logger.info(`updateDelegate START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    logger.debug(`ipAddress:${Validator.getIpAddress(req)}`)
 
    // VALIDATE INPUT
    let validation
    validation = DelegateValidation.updateDelegateValidation(req)
    if ( !validation.success ) {
        return res
        .status(401)
        .json(validation)
    }
   
    let address = req.locals.address
    let delegate = req.body.delegate

    // UPDATE THE DELEGATE
    let response
    try {
        response = await DelegateService.updateDelegate(address, delegate)
    } catch ( error ) {
        logger.error(`Error in DelegateService.updateDelegate: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }

    logger.info(`updateDelegate response: ${JSON.stringify(response)}`)
    logger.info(`updateDelegate END`)

    return res
    .status(200)
    .json({
        ...response
    })
}

async function getDelegationData(req, res) {
    logger.info(`getDelegationData START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    logger.debug(`ipAddress:${Validator.getIpAddress(req)}`)
 
    // VALIDATE INPUT
    let validation
    validation = DelegateValidation.getDelegationDataValidation(req)
    if ( !validation.success ) {
        return res
        .status(401)
        .json(validation)
    }
   
    let address = req.locals.address
    let idDelegate = req.body.idDelegate;

    // GET THE DELEGATED CITIES
    let delegationData
    try {
        delegationData = await DelegateService.getDelegationData(address, idDelegate)
    } catch ( error ) {
        logger.error(`Error in DelegateService.getDelegationData: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }

    logger.info(`getDelegationData response: ${JSON.stringify({success: true, data: delegationData})}`)
    logger.info(`getDelegationData END`)

    return res
    .status(200)
    .json({
        success: true,
        data: delegationData
    })
}

async function getDelegatedCities(req, res){
    logger.info(`getDelegatedCities START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`)
    logger.debug(`ipAddress:${Validator.getIpAddress(req)}`)
 
    // VALIDATE INPUT
    let validation
    validation = DelegateValidation.getDelegatedCitiesValidation(req)
    if ( !validation.success ) {
        return res
        .status(401)
        .json(validation)
    }
   
    let address = req.locals.address

    // GET THE DELEGATED CITIES
    let delegatedCities
    try {
        delegatedCities = await DelegateService.getDelegatedCities(address)
    } catch ( error ) {
        logger.error(`Error in DelegateService.getDelegatedCities: ${Utils.printErrorLog(error)}`)
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }

    logger.info(`getDelegatedCities response: ${JSON.stringify({success: true, data: delegatedCities})}`)
    logger.info(`getDelegatedCities END`)

    return res
    .status(200)
    .json({
        success: true,
        data: delegatedCities
    })
}

module.exports = { addDelegate, getDelegates, deleteDelegate, updateDelegate, getDelegatedCities, getDelegationData }