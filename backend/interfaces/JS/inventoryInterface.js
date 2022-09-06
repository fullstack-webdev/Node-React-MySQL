const logger = require('../../logging/logger');

class InventoryInterface{
    constructor() {}

    static async getInventoryBuildResponse(items, tools, recipes){
        return {
            items, 
            tools, 
            recipes
        }
    }
}

module.exports = {InventoryInterface}