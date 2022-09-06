const Validator = require("../utils/validator");

class ShopValidation{
    static shopHistoryValidation(req){

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
                    errorMessage: `Not a valid address`
                }
            }
        }

        return {
            success: true
        }
    }


}

module.exports = {ShopValidation}