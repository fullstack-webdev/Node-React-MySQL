const jwt = require('jsonwebtoken');
const authHelper = require('../helpers/authHelper');
const logger = require('../logging/logger');
const Validator = require("../utils/validator");

const { DelegateQueries } = require('../queries/delegateQueries')

const isLoggedProfileMiddleware = (req, res, next) => {
    logger.debug(`isLoggedProfileMiddleware START`);
    logger.debug(`ipAddress:${Validator.getIpAddress(req)}`);
    let cookies = req.cookies;
    let address = req.query.address;

    if(cookies == null || cookies == undefined  || address == null || address == undefined ){
        logger.warn(`Bad request,invalid address: ${address},or invalid cookies :${cookies}`);
        return res.status(401).json({
            success: false,
            error: {errorMessage: 'req middleware is null'}
        })
    }
    if(!Validator.validateAddress(address) ){
        logger.warn(`Bad request,invalid address: ${address}`);
        return res.status(401).json({
            success: false,
            error: {errorMessage: 'not a valid address'}
        })
    }
    logger.info(`isLoggedProfileMiddleware address: ${address}`);
    logger.info(`isLoggedProfileMiddleware request, cookies :${cookies}, address:${address}`);

    let now = new Date().getTime();
    let jwtTokenResponse = authHelper.findJwt(cookies, address, res);

    logger.debug(`jwtToken: ${JSON.stringify(jwtTokenResponse)}`);

    if(jwtTokenResponse == undefined || jwtTokenResponse == null){
        logger.warn(`jwt token undefined`);
        return res
        .status(401)
        .json({
            success: false,
            data: {
                messageToSign: process.env.SECRET_KEY_TO_SIGN
            }
        });
    }

    let cookieAddressName = jwtTokenResponse.cookieAddressName;
    let jwtToken = jwtTokenResponse.jwt;


    jwt.verify(jwtToken, process.env.SECRET_KEY_NEW_JWT, (err, token) => {
        // console.log('1- TOKEN: ', token)
        if(err){
            //check if was used the old key
            jwt.verify(jwtToken, process.env.SECRET_KEY_OLD_JWT, (err, token) => {
                //token expired or compromised
                // console.log('2- TOKEN: ', token)

                if(err) return res
                .status(401)
                .json({
                    success: false,
                    data: {
                        messageToSign: process.env.SECRET_KEY_TO_SIGN
                    }
                });

                if(cookieAddressName != token.address){
                    logger.warn(`Cookie manipulated`);
                    return res
                    .status(401)
                    .cookie(cookieAddressName, "", {
                        httpOnly: true,
                        expires: new Date(now - 3600 * 2400 * 1000)//24h * 1000 milliseconds
                    })
                    .json({
                        success: false,
                        error:{
                            errorMessage: "Cookie manipulated"
                        }
                    });
                }

                req.locals = {
                    address: token.address,
                    idDelegate: req.query.idDelegate
                };
                next();
            });

        }else{

            if(cookieAddressName != token.address){
                logger.warn(`Cookie manipulated`);
                return res
                .status(401)
                .cookie(cookieAddressName, "", {
                    httpOnly: true,
                    expires: new Date(now - 3600 * 2400 * 1000)//24h * 1000 milliseconds
                })
                .json({
                    success: false,
                    error:{
                        errorMessage: "Cookie manipulated"
                    }
                });
            }

            req.locals = {
                address: token.address,
                idDelegate: req.query.idDelegate
            };
            logger.debug(`isLoggedProfileMiddleware END`);

            next();
        }
    });
}

const isDelegatedMiddleware = async (req, res, next) => {
    let address = req.locals.address;
    let idDelegate = req.locals.idDelegate;
    let checkDelegate;

    if(!Validator.validateInput(idDelegate)){
        next();
    }

    try {
        checkDelegate = await DelegateQueries.checkDelegate(address, idDelegate)
    } catch ( error ) {
        logger.error(`DelegateQueries.checkDelegate: ${JSON.stringify({error}, Object.getOwnPropertyNames(error))}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }

    if(!checkDelegate || checkDelegate.length == 0){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        })
    }

    req.locals.address = checkDelegate[0].owner;

    next();

}

module.exports = {
    isLoggedProfileMiddleware,
    isDelegatedMiddleware
}