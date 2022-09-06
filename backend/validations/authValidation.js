const Validator = require("../utils/validator");

class AuthValidation{
    static   clearCookiesValidation(req){
        let cookies = req.cookies;
        if(!Validator.validateInput(cookies)){
            return {
                success: false,
                error: {
                    errorMessage: "inpunt null or undefined"
                }
            }
        }

        return {
            success: true
        }
    }
}

module.exports = AuthValidation