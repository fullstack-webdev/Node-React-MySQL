const logger = require('../logging/logger');
const {DelegateQueries} = require('../queries/delegateQueries');

async function isDelegated(req, res, next) {
    let idDelegate = req.body.idDelegate;
    let address = req.locals.address;

    if(idDelegate == null || idDelegate == undefined){
        next();
        return;
    } 

    let delegation
    try{
        delegation = await DelegateQueries.getDelegateByIdDelegateAndDeputy(idDelegate, address)
    }catch(error){
        console.warn(error)
        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(delegation.length == 0 || !delegation[0].isAllowed){
        console.warn("delegation: ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    req.locals.address = delegation[0].owner;
    next();
    return;

}

async function isDelegatedClaim(req, res, next) {
    let idDelegate = req.body.idDelegate;
    let address = req.locals.address;

    if(idDelegate == null || idDelegate == undefined){
        next();
        return;
    } 

    let delegation
    try{
        delegation = await DelegateQueries.getDelegateByIdDelegateAndDeputy(idDelegate, address)
    }catch(error){
        console.warn(error)
        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(delegation.length == 0 || !delegation[0].isAllowed){
        console.warn("delegation: ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(!delegation[0].claim){
        console.warn("claim ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    req.locals.address = delegation[0].owner;
    next();
    return;

}

async function isDelegatedUpgrade(req, res, next) {
    let idDelegate = req.body.idDelegate;
    let address = req.locals.address;

    if(idDelegate == null || idDelegate == undefined){
        next();
        return;
    } 

    let delegation
    try{
        delegation = await DelegateQueries.getDelegateByIdDelegateAndDeputy(idDelegate, address)
    }catch(error){
        console.warn(error)
        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(delegation.length == 0 || !delegation[0].isAllowed){
        console.warn("delegation: ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(!delegation[0].upgrade){
        console.warn("claim ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    req.locals.address = delegation[0].owner;
    next();
    return;

}

async function isDelegatedMarketplace(req, res, next) {
    let idDelegate = req.body.idDelegate;
    let address = req.locals.address;

    if(idDelegate == null || idDelegate == undefined){
        next();
        return;
    } 

    let delegation
    try{
        delegation = await DelegateQueries.getDelegateByIdDelegateAndDeputy(idDelegate, address)
    }catch(error){
        console.warn(error)
        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(delegation.length == 0 || !delegation[0].isAllowed){
        console.warn("delegation: ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(!delegation[0].marketplace){
        console.warn("not delegated ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    req.locals.address = delegation[0].owner;
    next();
    return;

}

async function isDelegatedShop(req, res, next) {
    let idDelegate = req.body.idDelegate;
    let address = req.locals.address;

    if(idDelegate == null || idDelegate == undefined){
        next();
        return;
    } 

    let delegation
    try{
        delegation = await DelegateQueries.getDelegateByIdDelegateAndDeputy(idDelegate, address)
    }catch(error){
        console.warn(error)
        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(delegation.length == 0 || !delegation[0].isAllowed){
        console.warn("delegation: ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(!delegation[0].shop){
        console.warn("shop ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    req.locals.address = delegation[0].owner;
    next();
    return;

}

async function isDelegatedTransfer(req, res, next) {
    let idDelegate = req.body.idDelegate;
    let address = req.locals.address;

    if(idDelegate == null || idDelegate == undefined){
        next();
        return;
    } 

    let delegation
    try{
        delegation = await DelegateQueries.getDelegateByIdDelegateAndDeputy(idDelegate, address)
    }catch(error){
        console.warn(error)
        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(delegation.length == 0 || !delegation[0].isAllowed){
        console.warn("delegation: ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(!delegation[0].transfer){
        console.warn("transfer ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    req.locals.address = delegation[0].owner;
    next();
    return;

}

async function isDelegatedInventory(req, res, next) {
    let idDelegate = req.body.idDelegate;
    let address = req.locals.address;

    if(idDelegate == null || idDelegate == undefined){
        next();
        return;
    } 

    let delegation
    try{
        delegation = await DelegateQueries.getDelegateByIdDelegateAndDeputy(idDelegate, address)
    }catch(error){
        console.warn(error)
        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(delegation.length == 0 || !delegation[0].isAllowed){
        console.warn("delegation: ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(!delegation[0].inventory){
        console.warn("inventory ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    req.locals.address = delegation[0].owner;
    next();
    return;

}

async function isDelegatedFisherman(req, res, next) {
    let idDelegate = req.body.idDelegate;
    let address = req.locals.address;

    if(idDelegate == null || idDelegate == undefined){
        next();
        return;
    } 

    let delegation
    try{
        delegation = await DelegateQueries.getDelegateByIdDelegateAndDeputy(idDelegate, address)
    }catch(error){
        console.warn(error)
        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(delegation.length == 0 || !delegation[0].isAllowed){
        console.warn("delegation: ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(!delegation[0].fisherman){
        console.warn("inventory ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    req.locals.address = delegation[0].owner;
    next();
    return;

}

async function isDelegatedProfile(req, res, next) {
    let idDelegate = req.query.idDelegate;
    let address = req.locals.address;

    if(idDelegate == null || idDelegate === 'null' || idDelegate == undefined){
        next();
        return;
    } 

    let delegation
    try{
        delegation = await DelegateQueries.getDelegateByIdDelegateAndDeputy(idDelegate, address)
    }catch(error){
        console.warn(error)
        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(delegation.length == 0 || !delegation[0].isAllowed){
        console.warn("delegation: ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    if(!delegation[0].profile){
        console.warn("profile ", delegation)

        return res
        .status(401)
        .json({
            success: false
        })
    }

    req.locals.address = delegation[0].owner;
    next();
    return;

}

module.exports = {
    isDelegated,
    isDelegatedClaim,
    isDelegatedUpgrade,
    isDelegatedMarketplace,
    isDelegatedShop,
    isDelegatedTransfer,
    isDelegatedInventory,
    isDelegatedProfile,
    isDelegatedFisherman
}