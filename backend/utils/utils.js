// const logger = require("../logging/logger");

class Utils{
    constructor(){}

    static printErrorLog(error){
        // console.log("printErrorLog: ", error);
        if(typeof error == 'string') return error;

        let newObj = {};
        let objProp = Object.getOwnPropertyNames(error);

        for(let prop of objProp){
            newObj[prop] = error[prop];
        }

        let result = JSON.stringify(JSON.parse(JSON.stringify(newObj)));
        return result
    }

}

module.exports = {
    Utils
}