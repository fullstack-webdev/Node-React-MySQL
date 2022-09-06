const logger = require("../logging/logger");

class Validator{

    static ValidateNftId(nftId){
        if(this.isNaturalInteger(nftId)){
            nftId = parseInt(nftId);

            if(nftId >= 0 && nftId < 10000){
                return true;
            }
        }
        return false;
    }

    static isPositiveInteger(str_) {
        if (typeof str_ !== 'string' && typeof str_ !== 'number') {
          return false;
        }

        if(isNaN(str_)){
            return false;
        } 
      
        const num = Number(str_);
      
        if (Number.isInteger(num) && num > 0 && num < process.env.MAX_NUMBER_VALUE) {
          return true;
        }

        logger.debug("isPositiveInteger less or equals than 0 or greater than MAX_VALUE");
      
        return false;
    }
    
    static isBool(str_) {
        if (typeof str_ !== 'string' && typeof str_ !== 'number') {
          return false;
        }

        if(isNaN(str_)){
            return false;
        } 
      
        const num = Number(str_);
      
        if (Number.isInteger(num) && num == 0 || num == 1) {
          return true;
        }

        logger.debug("isBool in not a boolean value");
      
        return false;
    }

    static validateInput(...input){
        for(let i = 0; i < input.length; i++){
            if(input[i] == undefined || input[i] == null){
                return false;
            }
        }
    
        return true;
    }

    static validateAddress(address){
        let regex=/^0x[a-fA-F0-9]{40}$/;
        return regex.test(address);
    }

    static validateProfileCityName(cityName){
        let regex=/^[a-zA-Z0-9\-_.]{1,16}$/;
        return regex.test(cityName);
    }

    static validateName(cityName){
        let regex=/^[a-zA-Z\s]{1,200}$/;
        return regex.test(cityName);
    }

    static getIpAddress(req){
        var ipaddress = (req.headers['x-forwarded-for'] || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress || 
        req.connection.socket.remoteAddress);
    
        ipaddress = ipaddress !=undefined && ipaddress != null ? ipaddress.split(",")[0] : "no-ip";
    
        return ipaddress;
    }
    
    static validateType(type){
        if(this.isPositiveInteger(type)){
            type = parseInt(type);

            if(type >= 1 && type <= 4){
                return true;
            }
        }
        return false;
    }

    static ValidatePositiveFloat(str_){
        if (typeof str_ !== 'string' && typeof str_ !== 'number') {
            return false;
        }

        if(isNaN(str_)){
            return false;
        }

        const num = parseFloat(str_);

        if(num <= 0 || num > process.env.MAX_NUMBER_VALUE){
            logger.debug("isPositiveFloat less or equals than 0 or greater than MAX_VALUE");
            
            return false;
        }

        return true;
    }

    static isNaturalInteger(str_) {
        if (typeof str_ !== 'string' && typeof str_ !== 'number') {
          return false;
        }

        if(isNaN(str_)){
            return false;
        } 
      
        const num = Number(str_);
      
        if (Number.isInteger(num) && num >= 0 && num < process.env.MAX_NUMBER_VALUE) {
            

          return true;
        }
        logger.debug("isNaturalInteger less than 0 or greater than MAX_VALUE: ", num);
        return false;
    }

    static ValidateFishermanID(id){
        if (!isNaturalInteger(id)) return false;

        if(id < 0 || id >= process.env.FISHERMAN_SUPPLY){
            logger.debug("ValidateFishermanID less than 0 or greater than FISHERMAN_SUPPLY");
            return false;
        }

        return true;
    }

    static ValidateInventoryType(inventoryType){
        let elements = ['tool','recipe','item','resource'];
        if(!elements.includes(inventoryType))
            return false;
        else return true;
    }

    static ValidateTicketType(ticketType){
        let elements = ['free','paid'];
        if(!elements.includes(ticketType))
            return false;
        else return true;
    }

    static isPositiveFloatWithLessThanTwoDecimals(str_){
        logger.debug("isPositiveFloatWithLessThanTwoDecimals start");

        if (typeof str_ !== 'string' && typeof str_ !== 'number') {
            return false;
        }

        if(isNaN(str_)){
            return false;
        }    

        const num = parseFloat(str_);

        if(num < 0.01 || num > process.env.MAX_NUMBER_VALUE){
            logger.debug("isPositiveFloat less than 0.01 or greater than MAX_VALUE");
            
            return false;
        }

        let numString = String(str_);

        logger.debug(`numString ${numString}`);


        numString = numString.split(".");

        if(numString.length > 1){
            if(numString[1].length > 2){
                logger.debug("isPositiveFloat has more than 2 decimals");
    
                return false;
            }
        }
        

        logger.debug("isPositiveFloatWithLessThanTwoDecimals end");

        return true;
    }

    static ValidateStatus(newStatus){
        if(newStatus == false || newStatus == true)
            return true;
        
        return false;
    }

    static ValidatePosition(position){
        if(this.isNaturalInteger(position)){
            position = parseInt(position);

            if(position > 0 && position <= 8)
                return true;
        }
        return false;
    }
}

module.exports=Validator;