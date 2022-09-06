const logger = require('../logging/logger');

const findJwt = (cookies, address, res) => {
    logger.info(`findJwt START`);
    let response = {};
    
    for(let cookie in cookies){
        
        let jwtSplitted = (cookie != null && cookie != undefined) ? cookie.toString().split("_") : "";
        logger.debug('jwtSplitted: ', jwtSplitted[1]);
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

module.exports = {
    findJwt
}