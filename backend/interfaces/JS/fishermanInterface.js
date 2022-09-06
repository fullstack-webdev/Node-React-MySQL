const logger = require('../../logging/logger');

class FishermanInterface{
    constructor() {}

    static async getFishermanBuildResponse(seas, rods){
        return {
            seas: seas,
            rods: rods
        }
    }
}

module.exports = {FishermanInterface}