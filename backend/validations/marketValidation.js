const logger = require("../logging/logger");
const Validator = require("../utils/validator");

class MarketValidation{

    static getMarketValidation(req){

        let address = req.locals.address;
        let page = req.body.page;
        let type = req.body.type;

        if(!Validator.validateInput(address, page)){
            return {
                success: false,
                error: {
                    errorMessage: "input null or undefined"
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

        if(!Validator.isPositiveInteger(page)){
            return {
                success: false,
                error: {
                    errorMessage: `Not a valid page`
                }
            }
        }

        return {
            success: true
        }

    }


}

module.exports = {MarketValidation}