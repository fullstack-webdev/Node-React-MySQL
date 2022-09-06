const logger = require("../logging/logger");
const Validator = require("../utils/validator");


class ProfileValidation{
    static setProfileValidation(req){
        let address = req.locals.address;
        let cityName = req.body.cityName;
        let mimetypeError = req.locals.mimetypeError;
        let idEmblem = req.body.idEmblem;

        if(!Validator.validateInput(address)){
            return {
                success: false,
                error: {
                    errorMessage: "inpunt null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            return {
                success: false,
                error: {
                    errorMessage: `Not an address`
                }
            }
        }

        if(Validator.validateInput(cityName)){
            if(!Validator.validateProfileCityName(cityName)){
                logger.warn(`Warn in setProfileValidation, calidateProfileName: ${cityName}`);
                return {
                    success: false,
                    error: {
                        errorMessage: `cityName does not respect standard`
                    }
                }
            }
        }

        if(Validator.validateInput(mimetypeError)){
            logger.warn(`Warn in setProfileValidation, mimetypeError: ${mimetypeError}`);
            return {
                success: false,
                error: {
                    errorMessage: `Image type not supported`
                }
            }
            
        }

        if(Validator.validateInput(idEmblem)){
            if(!Validator.isNaturalInteger(idEmblem) && idEmblem != -1){
                logger.warn(`Warn in setProfileValidation, validateIdEmblem: ${idEmblem}`);
                return {
                    success: false,
                    error: {
                        errorMessage: `idEmblem does not respect standard`
                    }
                }
            }
        }

        return {
            success: true
        }
    }

    static getProfileValidation(req){
        let address = req.locals.address;
        if(!Validator.validateInput(address)){
            return {
                success: false,
                error: {
                    errorMessage: "inpunt null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            return {
                success: false,
                error: {
                    errorMessage: `Not an address`
                }
            }
        }

        return {
            success: true
        }
    }
}

module.exports = ProfileValidation