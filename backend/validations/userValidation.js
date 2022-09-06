const logger = require("../logging/logger");
const Validator = require("../utils/validator");

class UserValidation{
    static directTransferValidation(req){
        let addressSender =  req.locals.address;
        let addressReceiver = req.body.receiver;
        let type = req.body.type;
        let quantity = req.body.quantity;

        if(!Validator.validateInput(addressSender, addressReceiver, type, quantity)){
            return {
                success: false,
                error: {
                    errorMessage: "inpunt null or undefined"
                }
            }
        }

        if(!Validator.validateAddress(addressSender)){
            return {
                success: false,
                error: {
                    errorMessage: `Sender is not an address`
                }
            }
        }

        if(!Validator.validateAddress(addressReceiver)){
            return {
                success: false,
                error: {
                    errorMessage: `Receiver is not an address`
                }
            }
        }

        if(!Validator.validateType(type)){
            return {
                success: false,
                error: {
                    errorMessage: `Type is not valid`
                }
            }
        }

        if(!Validator.isPositiveInteger(quantity)){
            return {
                success: false,
                error: {
                    errorMessage: `Quantity is not valid`
                }
            }
        }
        
        return {
            success: true
        }

    }

    static isSignedValidation(req){
        let address =  req.body.address;
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
                    errorMessage: `Address is not valid`
                }
            }
        }
        return {
            success: true
        }
    }
}

module.exports = UserValidation;