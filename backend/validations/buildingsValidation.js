const { MAX_LEVELS } = require("../config/buildingLevel");
const logger = require("../logging/logger");
const Validator = require("../utils/validator");

class BuildingsValidation {
    static doPrestigeValidation(req) {
        let address = req.locals.address;
        let buildingType = req.body.buildingType;
        let level = req.body.level;

        if (!Validator.validateInput(address, buildingType, level)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, buildingType: ${buildingType}, level: ${level}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Wallet is not an address`
                }
            }
        }

        if (!Validator.isNaturalInteger(buildingType)) {
            return {
                success: false,
                error: {
                    errorMessage: `buildingType is not a natural integer`
                }
            }
        }

        if (!Validator.isNaturalInteger(level)) {
            return {
                success: false,
                error: {
                    errorMessage: `level is not a natural integer`
                }
            }
        }

        if (MAX_LEVELS.prestige[buildingType] == undefined || MAX_LEVELS[buildingType] == undefined || level < MAX_LEVELS.prestige[buildingType] || level > MAX_LEVELS[buildingType]) {
            return {
                success: false,
                error: {
                    errorMessage: `buildingType or level is not valid value`
                }
            }
        }

        return {
            success: true
        }
    }
    static getPrestigeDataValidation(req) {
        let address = req.locals.address;
        let buildingType = req.body.buildingType;
        let level = req.body.level;

        if (!Validator.validateInput(address, buildingType, level)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, buildingType: ${buildingType}, level: ${level}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Wallet is not an address`
                }
            }
        }

        if (!Validator.isNaturalInteger(buildingType)) {
            return {
                success: false,
                error: {
                    errorMessage: `buildingType is not a natural integer`
                }
            }
        }

        if (!Validator.isNaturalInteger(level)) {
            return {
                success: false,
                error: {
                    errorMessage: `level is not a natural integer`
                }
            }
        }

        if (MAX_LEVELS.prestige[buildingType] == undefined || MAX_LEVELS[buildingType] == undefined || level < MAX_LEVELS.prestige[buildingType] || level > MAX_LEVELS[buildingType]) {
            return {
                success: false,
                error: {
                    errorMessage: `buildingType or level is not valid value`
                }
            }
        }

        return {
            success: true
        }
    }
    static getNFTUpgradeRequirementsValidation(req) {
        let address = req.locals.address
        let buildingType = req.body.buildingType
        let buildingLevel = req.body.buildingLevel

        if (!Validator.validateInput(address, buildingType, buildingLevel)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, buildingType: ${buildingType}, buildingLevel: ${buildingLevel}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Wallet is not an address`
                }
            }
        }

        if (!Validator.isNaturalInteger(buildingType)) {
            return {
                success: false,
                error: {
                    errorMessage: `buildingType is not a natural integer`
                }
            }
        }

        if (!Validator.isNaturalInteger(buildingLevel)) {
            return {
                success: false,
                error: {
                    errorMessage: `buildingLevel is not a natural integer`
                }
            }
        }

        return {
            success: true
        }
    }

    static upgradePassiveValidation(req) {
        let address = req.locals.address
        let pkBuilding = req.body.pkBuilding
        let buildingType = req.body.buildingType

        if (!Validator.validateInput(address, pkBuilding, buildingType)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, pkBuilding: ${pkBuilding}, buildingType: ${buildingType}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Wallet is not an address`
                }
            }
        }

        if (!Validator.isNaturalInteger(pkBuilding)) {
            return {
                success: false,
                error: {
                    errorMessage: `pkBuilding is not a natural integer`
                }
            }
        }

        if (!Validator.isNaturalInteger(buildingType)) {
            return {
                success: false,
                error: {
                    errorMessage: `buildingType is not a natural integer`
                }
            }
        }

        return {
            success: true
        }
    }

    static setPassiveOnValidation(req) {
        let address = req.locals.address
        let pkBuilding = req.body.pkBuilding
        let buildingType = req.body.buildingType

        if (!Validator.validateInput(address, pkBuilding, buildingType)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, pkBuilding: ${pkBuilding}, buildingType: ${buildingType}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Wallet is not an address`
                }
            }
        }

        if (!Validator.isNaturalInteger(pkBuilding)) {
            return {
                success: false,
                error: {
                    errorMessage: `pkBuilding is not a natural integer`
                }
            }
        }

        if (!Validator.isNaturalInteger(buildingType)) {
            return {
                success: false,
                error: {
                    errorMessage: `buildingType is not a natural integer`
                }
            }
        }

        return {
            success: true
        }
    }

    static setPassiveOffValidation(req) {
        let address = req.locals.address
        let pkBuilding = req.body.pkBuilding
        let buildingType = req.body.buildingType

        if (!Validator.validateInput(address, pkBuilding, buildingType)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, pkBuilding: ${pkBuilding}, buildingType: ${buildingType}`)
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Wallet is not an address`
                }
            }
        }

        if (!Validator.isNaturalInteger(pkBuilding)) {
            return {
                success: false,
                error: {
                    errorMessage: `pkBuilding is not a natural integer`
                }
            }
        }

        if (!Validator.isNaturalInteger(buildingType)) {
            return {
                success: false,
                error: {
                    errorMessage: `buildingType is not a natural integer`
                }
            }
        }

        return {
            success: true
        }
    }

    static getAccountDataValidation(req) {
        let address = req.locals.address
        if (!Validator.validateInput(address)) {
            return {
                success: false,
                error: {
                    errorMessage: "input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }
        return {
            success: true
        }
    }

    static isCursedValidation(req) {
        let nftId = req.body.id;
        let type = req.body.type;

        console.log("input: ", nftId, type)

        if (!Validator.validateInput(nftId, type)) {
            logger.warn(`Warn in validateInput (Input null or undefined), nftId: ${nftId}, type: ${type}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.ValidateNftId(nftId)) {
            return {
                success: false,
                error: {
                    errorMessage: `id is not valid`
                }
            }
        }

        if (!Validator.validateType(type)) {
            return {
                success: false,
                error: {
                    errorMessage: `type is not valid`
                }
            }
        }

        return {
            success: true
        }



    }

    static upgradeNFTValidation(req) {
        let address = req.locals.address;
        let nftId = req.body.nftId;
        let type = req.body.type;
        let consumableIds = req.body.consumableIds;

        logger.debug(`input: address = ${address}, nftId = ${nftId},type = ${type}, consumables in input = ${consumableIds}`);

        if (!Validator.validateInput(address, nftId, type)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, nftId: ${nftId}, type: ${type}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (Validator.validateInput(consumableIds)) {
            if (!Array.isArray(consumableIds)) {
                return {
                    success: false,
                    error: {
                        errorMessage: `Not a valid array consumableIds`
                    }
                }
            }
            for (let i = 0; i < consumableIds.length; i++) {
                if (!Validator.isPositiveInteger(consumableIds[i])) {
                    return {
                        success: false,
                        error: {
                            errorMessage: `Not a valid consumableId`
                        }
                    }
                }
            }
        }


        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if (!Validator.ValidateNftId(nftId)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid id`
                }
            }
        }

        if (!Validator.validateType(type)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid type`
                }
            }
        }

        return {
            success: true
        }

    }

    static upgradeDoneValidation(req) {
        let address = req.locals.address;
        let nftId = req.body.nftId;
        let type = req.body.type;


        if (!Validator.validateInput(address, nftId, type)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, nftId: ${nftId}, type: ${type}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if (!Validator.ValidateNftId(nftId)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid id`
                }
            }
        }

        if (!Validator.validateType(type)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid type`
                }
            }
        }

        return {
            success: true
        }
    }

    static isStakeValidation(req) {
        let address = req.locals.address;
        let nftId = req.body.id;
        let type = req.body.type;
        let newStatus = req.body.newStatus;


        if (!Validator.validateInput(address, nftId, type, newStatus)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, nftId: ${nftId}, type: ${type}, newStatus: ${newStatus}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if (!Validator.ValidateNftId(nftId)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid id`
                }
            }
        }

        if (!Validator.validateType(type)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid type`
                }
            }
        }

        if (!Validator.ValidateStatus(newStatus)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid status`
                }
            }
        }

        return {
            success: true
        }
    }

    static setPositionValidation(req) {
        let address = req.locals.address;
        let nftId = req.body.id;
        let type = req.body.type;
        let position = req.body.position;


        if (!Validator.validateInput(address, nftId, type, position)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, nftId: ${nftId}, type: ${type}, position: ${position}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if (!Validator.ValidateNftId(nftId)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid id`
                }
            }
        }

        if (!Validator.validateType(type)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid type`
                }
            }
        }

        if (!Validator.ValidatePosition(position)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid position`
                }
            }
        }

        return {
            success: true
        }
    }

    static claimValidation(req) {
        let address = req.locals.address;
        let nftId = req.body.nftId;
        let type = req.body.type;


        if (!Validator.validateInput(address, nftId, type)) {
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, nftId: ${nftId}, type: ${type}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if (!Validator.validateAddress(address)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if (!Validator.ValidateNftId(nftId)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid id`
                }
            }
        }

        if (!Validator.validateType(type)) {
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid type`
                }
            }
        }

        return {
            success: true
        }
    }

    static getNFTValidation(req){
        let address = req.locals.address;
        let nftId = req.body.nftId;
        let type = req.body.type;
        
        logger.debug(`input: address = ${address}, nftId = ${nftId},type = ${type}`);

        if(!Validator.validateInput(address, nftId, type)){
            logger.warn(`Warn in validateInput (Input null or undefined), address: ${address}, nftId: ${nftId}, type: ${type}`);
            return {
                success: false,
                error: {
                    errorMessage: "Input null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(address)){
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid address`
                }
            }
        }

        if(!Validator.ValidateNftId(nftId)){
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid id`
                }
            }
        }

        if(!Validator.validateType(type)){
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid type`
                }
            }
        }

        return {
            success: true
        }

    }

}

module.exports = { BuildingsValidation }