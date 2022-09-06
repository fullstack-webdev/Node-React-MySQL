const axios = require('axios')
const {InventoryModel} = require('../models/userModel');

class UserHelper{
    static async  validateHuman(token) {
        let secret = process.env.RECAPTCHA_SECRET_KEY;

        let url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`

        console.log('url: ', url)

        let data;

        await axios.post(url)
        .then(response => {
            data = response;
        })
        .catch(error => {
            console.log('error: ', error)
        })

        return data.data ? data.data.success : false;
      }

    static transferQuantityChecker(quantity, type, userResources){
        switch (type) {
            case 1:
                if(quantity > userResources.ancien)
                return false;
                break;
            case 2:
                if(quantity > userResources.wood)
                return false;
                break;
            case 3:
                if(quantity > userResources.stone)
                return false;
                break;
            default:
                console.log(`type error in transferQuantityChecker: ${type}`);
                return false;
            
        }
        return true;
    }
    static accountChecker(rawAccount){
        if(rawAccount.length ==  1)
            return true;
        return false;
    }

    static buildResourcesResponse(rows){
        let response;
        if(rows.ancien != undefined && rows.wood != undefined && rows.stone != undefined)
            response = new InventoryModel(true, rows.ancien, rows.wood, rows.stone);
        else{
            response = new InventoryModel(false);
        }
        return response;
    }

    static getResourceGivenType(resources, type){
        switch(type){
            case 1: {
                return resources.ancien;
            }

            case 2: {
                return resources.wood;
            }

            case 3: {
                return resources.stone;
            }

            default: {
                return null;
            }
        }
    }

    static getResourceType(type){
        switch(type){
            case 1: {
                return "ancien";
            }

            case 2: {
                return "wood";
            }

            case 3: {
                return "stone";
            }

            default: {
                return null;
            }
        }
    }
}
module.exports = {UserHelper};