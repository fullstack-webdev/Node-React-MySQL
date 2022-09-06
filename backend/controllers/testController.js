const mysql = require('../config/databaseConfig');
const logger = require('../logging/logger');
const Sanitizer = require('../utils/sanitizer');
const Validator = require('../utils/validator');

let sanitizer = new Sanitizer();


async function testGetInventory(req, res){
    logger.info(`testGetInventory START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    let address = req.query.address;
    let response;

    if(!sanitizer.sanitizeAddress(address)){
        logger.warn(`Bad request,invalid address: ${address}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {errorMessage: 'not a valid address'}
        })
    }

    // console.log("Sto gestendo la testGetInventory", address);

    try {
        response = await auxTestGetInventory("0x123");
    } catch (error) {
        logger.error(`Error in auxTestGetInventory:${error}`);
        return res
        .json({
            success: false,
            error: error
        });
        
    }
    logger.debug(`response auxTestGetInventory: ${response} `);
    // console.log("Response testGetInventory", response);
    logger.info(`testGetInventory END`);

    res.json(response);
    
}

async function auxTestGetInventory(address){
    logger.info(`auxTestGetInventory START `);
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM utente WHERE address = ?";

        mysql.query(sql, address, (err, rows) =>{
            if(err) return reject(new Error(err.message));

            if(rows == undefined){
                logger.error(`query error: ${err}`);
                return reject({
                    message: "undefined"
                });
            }else{
                logger.info(`auxTestGetInventory END`);
                return resolve(JSON.parse(JSON.stringify(rows))[0]);
            }
        });
    });
    
}

const testFunction = (req, res, next) => {
    req.locals.address = "prova"
    console.log(req.locals);
    next();
}

async function testGetUser(req, res){
    console.log("req entrato");
    let address = '123';
    try{
        let response = await getUser(address);
        logger.debug(response);
        return res.json({ response: "ok"});
    }catch(err){
        logger.error(err);
        return res.json({ response: "ko"});
    }
    
}

async function getUser(address){
    logger.info(`getUser START `);
    return new Promise((resolve, reject) => {
        let sql = "SELECT ancie FROM utente WHERE address = ?";

        mysql.query(sql, address, (err, rows) => {
            if(err) reject(err);
            if(rows == undefined){
                logger.error(`query error: ${err}`);
                return reject({
                    message: "undefined"
                });
            }else{
                logger.info(`getUser END`);
                return resolve(JSON.parse(JSON.stringify(rows)));
            }
           
        });
    });
}

module.exports = {
    testGetInventory,
    testFunction,
    testGetUser
};

// GetShop (API)    
// response = []
 
// nfts
// for (elem of catalog){
//     newElem = {};
//     newElem.id = elem.id;
//     newElem.id = elem.id;
//     newElem.id = elem.id;
//     newElem.id = elem.id;
//     newElem.id = elem.id;
 
//     price = {}
//     price.ancien = elem.ancienCost
//     price.ancien = elem.ancienCost
//     price.ancien = elem.ancienCost
 
//     newElem.price = price;
 
//     newElem.requirements = await checkRequirements(elem, nfts);
 
//     newElem.supply = checkSupply(elem);
 
//     response.push(elem);
 
// }
 
// function checkRequirements(elem, nfts){
//     requirements = {};
//     if(elem.thRequire > 0){
//         resultCheck = check(nfts, type, elem.thRequire);
 
//         requirements.th = {
//             level: elem.thRequire,
//             isAllowed: resultCheck
//         }
//     }
 
//     if(elem.ljRequire > 0){
//         resultCheck = check(nfts, type, elem.ljRequire);
 
//         requirements.lj = {
//             level: elem.ljRequire,
//             isAllowed: resultCheck
//         }
//     }
 
//     if(elem.smRequire > 0){
//         resultCheck = check(nfts, type, elem.smRequire);
 
//         requirements.sm = {
//             level: elem.smRequire,
//             isAllowed: resultCheck
//         }
//     }
// }
 
// checkSupply(elem){
//     supply = {};
//     if(elem.category == 1){
//         result = await getCountFromLands(elem.id)
//         counter = result[0].counter;
//         let max_land_type = retrieveMaxValueGivenIdCatalog(elem.id);
 
//         if(counter >= max_land_type){
//             supply.isAllowed = false
//         }else{
//             supply.isAllowed = false
//         }
 
//         supply.total = max_land_type;
//         supply.available = counter;
 
//     }
//     return supply;
 
//     // if(elem.category == 3){
//     //     result = await getCountFromBuildings(elem.id)
//     // }
// }
 
// retrieveMaxValueGivenIdCatalog(id){
//     switch(id){
//         case 1: 
//             return MAX_FOREST_COMMON;
 
//         case 4:
//             return MAX_MOUNTAIN_COMMON;
 
//         default: 
//             return 0;
//     }
// }
 
// { 
//     "id": 3, 
//     "name": 'Lottery Ticket', 
//     "description": 'Ancient Lands Lottery Ticket', 
//     "image": 'https://image.shutterstock.com/image-vector/ui-image-placeholder-wireframes-apps-260nw-1037719204.jpg', 
//     "category": 1 ('lands'), 
//     "price": { 
//         "ancien": 10, 
//         "stone": 2, 
//         "wood": 10 
//     }, 
//     "requirements": { 
//         "th": {"level": 6, "isAllowed": true},  
//         "sm": {"level": 10, "isAllowed": true}    
//     }, 
//     "available": true, //sposttot dentro supply
//     "supply": { 
//         "available": 2, 
//         "total": 10,
//         "isAllowed": true
//     } 
// }
 
// catalog, lands
 
 
 
// SELECT count(*) as counter FROM lands(tab. category) where idCatalog = id
 
// id address, type, rarity, idLand, idCatalog;