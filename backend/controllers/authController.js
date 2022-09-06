const jwt = require('jsonwebtoken');
const Web3 = require('web3');
const crypto = require('crypto');
const schedule= require('node-schedule');
const mysql = require('../config/databaseConfig');

const logger = require('../logging/logger');

const UserModel = require('../models/userModel');

const buildingAbi = require('../ABI/building-abi.json');
const Sanitizer = require('../utils/sanitizer');
const AuthValidation = require('../validations/authValidation');
const Validator = require('../utils/validator')
let sanitizer = new Sanitizer();


const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.CHAINSTACK_MAINNET_ENDPOINT));



const changeKeys = schedule.scheduleJob('0 0 0 * * *', () => {
    // let newJwtKey = crypto.randomBytes(64).toString('hex');
    // let newMessageToSign = crypto.randomBytes(64).toString('hex');

    let newJwtKey = crypto.randomBytes(64).toString('hex');
    let newMessageToSign = getRandomInt(1000000, 1000000000);

    process.env['SECRET_KEY_OLD_JWT'] = process.env['SECRET_KEY_NEW_JWT'];
    process.env['SECRET_KEY_NEW_JWT'] = newJwtKey;
    process.env['SECRET_KEY_TO_SIGN'] = process.env.WELCOME_MESSAGE + " " + newMessageToSign;
});

const findJwt = (cookies, address, res) => {
    logger.info(`findJwt START `);
    let response = {};
    if(address == null || address == undefined){

        logger.warn(`Bad request, input void or undefined, address: ${address}`);

        return res.status(401).json({
            success: false,
            error: {errorMessage: 'req is null'}
        })
    }
    //to sanitize cookie
    if(!sanitizer.sanitizeAddress(address)){
        logger.warn(`Bad request,invalid address: ${address}`);
        return res.status(401).json({
            success: false,
            error: {errorMessage: 'not a valid address'}
        })
    }
    
    for(let cookie in cookies){
        
        let jwtSplitted = (cookie != null && cookie != undefined) ? cookie.toString().split("_") : "";
        logger.debug(`jwtSplitted: ${jwtSplitted[1]}`);
        if(jwtSplitted.length > 1 && jwtSplitted[1].toLowerCase() == address.toString().toLowerCase()){
            response.cookieAddressName = jwtSplitted[1];
            response.jwt = cookies[cookie];
            response.cookieToRemove = cookie;

            logger.info(`findJwt END`);
            return response;
        }
    }

    return null;
}

const isLogged = (req, res) => {
    let cookies = req.cookies;
    let address = req.body.address;
    
    if(cookies == null || cookies == undefined  || address == null || address == undefined ){
        logger.warn(`Bad request,invalid address: ${address},or invalid cookies :${JSON.stringify(cookies)}`);
        return res.status(401).json({
            success: false,
            error: {errorMessage: 'req is null'}
        })
    }
    if(!sanitizer.sanitizeAddress(address) ){
        logger.warn(`Bad request,invalid address: ${address}`);
        return res.status(401).json({
            success: false,
            error: {errorMessage: 'not a valid address'}
        })
    }
    logger.info(`isLogged address: ${address}`);
    logger.info(`isLogged request,cookies : ${JSON.stringify(cookies)}, address: ${address}`);


    let jwtTokenResponse = findJwt(cookies, address, res)

    let now = new Date().getTime();
    logger.debug(`jwtToken:${JSON.stringify(jwtTokenResponse)}`);
    
    if(jwtTokenResponse == undefined || jwtTokenResponse == null){
        logger.debug(`jwt token undefined`);
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
    let cookieToRemove = jwtTokenResponse.cookieToRemove;

    jwt.verify(jwtToken, process.env.SECRET_KEY_NEW_JWT, (err, token) => {
        if(err){
            //check if was used the old key
            jwt.verify(jwtToken, process.env.SECRET_KEY_OLD_JWT, (err, token) => {
                //token expired or compromised
                
                if(err){
                    logger.info(`isLogged END false`);
                    return res
                    .status(401)
                    .json({
                        success: false,
                        data: {
                            messageToSign: process.env.SECRET_KEY_TO_SIGN
                        }
                    });
                }
                

                if(cookieAddressName != token.address){
                    logger.warn(`Cookie manipulated`);
                    return res
                    .status(401)
                    .cookie(cookieToRemove, "", {
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
                logger.info(`isLogged END true`);
                return res.json({
                    success: true
                });
            });

        }else{

            if(cookieAddressName != token.address){
                logger.warn(`Cookie manipulated`);
                return res
                .status(401)
                .cookie(cookieToRemove, "", {
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
            logger.info(`isLogged END true`);
            return res.json({
                success: true
            });
        }
    });
}

const isLoggedMiddleware = (req, res, next) => {
    let cookies = req.cookies;
    let address = req.body.address;
    let jwtTokenResponse = findJwt(cookies, address, res)
    
    if(cookies == null || cookies == undefined  || address == null || address == undefined ){
        logger.warn(`Bad request,invalid address: ${address},or invalid cookies :${JSON.stringify(cookies)}`);
        return res.status(401).json({
            success: false,
            error: {errorMessage: 'req middleware is null'}
        })
    }
    if(!sanitizer.sanitizeAddress(address) ){
        logger.warn(`Bad request,invalid address: ${address}`);
        return res.status(401).json({
            success: false,
            error: {errorMessage: 'not a valid address'}
        })
    }
    logger.info(`isLoggedMiddelWare address: ${address}`);
    logger.info(`isLoggedMiddelWare request, cookies :${JSON.stringify(cookies)}, address:${address}, jwtTokenResponse:${JSON.stringify(jwtTokenResponse)}`);

    let now = new Date().getTime();

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
                });2

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
                    idDelegate: req.body.idDelegate
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
                idDelegate: req.body.idDelegate
            };
            logger.debug(`isLoggedMiddleware END`);

            next();
        }
    });
}

const getKeyClear = (req, res) => {
    logger.debug(`getKeyClear END`);
    return res.json({
        success: true,
        data: {
            key: process.env.SECRET_KEY_TO_SIGN
        }
    });
}

const sendKeyHash = (req, res) => {
    let signature = req.body.keyHash;
    let address = req.body.address;
    logger.debug(`signature : ${signature}, address: ${address}`);
    //to sanitize

    if(signature == null || signature == undefined  || address == null || address == undefined ){
        logger.warn(`Bad request,invalid address:${address} or signature:${signature}`);
        return res.status(401).json({
            success: false,
            error: {errorMessage: 'req is null'}
        })
    }
    if(!sanitizer.sanitizeAddress(address)){
        logger.warn(`Bad request,invalid address: ${address}`);
        return res.status(401).json({
            success: false,
            error: {errorMessage: 'not a valid address'}
        })
    }

    
    let recoveredAddress = web3.eth.accounts.recover(process.env.SECRET_KEY_TO_SIGN, signature);

    if(recoveredAddress.toString().toLowerCase() != address.toString().toLowerCase()){
        logger.warn("indirizzi diversi");
        return res.json({
            success: false,
            info: {
                message: "Addresses not the same"
            }
        });
    }

    let jwtToken = jwt.sign({address: recoveredAddress}, process.env.SECRET_KEY_NEW_JWT, {
        expiresIn: "1d"
    });

    let now = new Date().getTime();
    logger.debug(`sendKeyHash END`);


    return res.cookie("jwtToken_" + recoveredAddress, jwtToken, {
        httpOnly: true,
        expires: new Date(now + 3600 * 2 * 1000)//2h * 1000 milliseconds
    })
    .status(200)
    .json({
        success: true,
        data: {
            jwt: true
        }
    });

}

//installare un middleware to check validità nickname

async function checkAccountSigned(req, res, next){
    logger.debug(`checkAccountSigned START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);
    let address = req.locals.address;


    if(address == null || address == undefined ){
        return res.status(400).json({
            success: false,
            error: {errorMessage: 'req checkSigned is null'}
        })
    }
    if(!sanitizer.sanitizeAddress(address)){
        logger.warn(`Bad request,invalid address: ${address}`);
        return res.status(401).json({
            success: false,
            error: {errorMessage: 'not a valid address'}
        })
    }


    try{
        let responseUser = await getUser(address);
        if(responseUser.length > 0){
            next();
        }else{
            return res
            .status(401)
            .json({
                success: false,
                error:{
                    errorCode: 1000,
                    errorMessage: "Account not found"
                }
            });
        }
    }catch(err){
        logger.error(err.message);
        return res
        .status(500)
        .json({
            success: false,
            error:{
                errorMessage: err.message
            }
        });
    }
}

async function getUser(address){
    logger.debug(`getUser START `);
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM utente WHERE address = ?";

        mysql.query(sql, address, (err, rows) => {
            if(err) reject(err);
            if(rows == undefined){
                logger.error(`query error: ${err}`);
                return reject({
                    message: "undefined"
                });
            }else{
                logger.debug(`getUser END`);
                return resolve(JSON.parse(JSON.stringify(rows)));
            }
        });
    });
}

async function clearCookies(req, res){
    let validation;

    validation = AuthValidation.clearCookiesValidation(req);
    if(!validation.success){
        return res
        .status(401)
        .json(validation);
    }

    let cookies = req.cookies;

    for (let cookie in cookies){
        res.cookie(cookie,"",{maxAge: 0});
    }
    
    logger.info(`clearCookies END `);

    return res
    .json({
        success:true
    });
    
    

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

module.exports = {
    isLogged,
    isLoggedMiddleware,
    getKeyClear,
    sendKeyHash,
    checkAccountSigned,
    getRandomInt,
    clearCookies
};