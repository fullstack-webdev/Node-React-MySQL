const logger = require('../logging/logger');
const { ItemQueries } = require('../queries/inventory/itemQueries');
const { RecipeQueries } = require('../queries/inventory/recipeQueries');
const { ToolQueries } = require('../queries/inventory/toolQueries');

class MarketHelper{

    static changeStatusForBuyer(listing, address){
        for(let i = 0; i < listing.length; i++){
            if(listing[i].buyer == address){
                listing[i].status = 4;
            }
        }
        return listing;
    }

    static async isSellable(id, inventoryType){
        let response;
        switch(inventoryType){

            case 'item':
                try{
                    response = await ItemQueries.getMenuByIdItemInstance(id);
                }catch(error){
                    logger.error(`Error in ItemQueries.getMenuByIdItemInstance: ${Utils.printErrorLog(error)}`);
                    throw error;
                }

                if(response.sell) return true;
                return false;

            case 'tool':
                try{
                    response = await ToolQueries.getMenuByIdToolInstance(id);
                }catch(error){
                    logger.error(`Error in ToolQueries.getMenuByIdToolInstance: ${Utils.printErrorLog(error)}`);
                    throw error;
                }

                if(response.sell) return true;
                return false;

            case 'recipe':
                try{
                    response = await RecipeQueries.getMenuByIdRecipeInstance(id);
                }catch(error){
                    logger.error(`Error in RecipeQueries.getMenuByIdRecipeInstance: ${Utils.printErrorLog(error)}`);
                    throw error;
                }

                if(response.sell) return true;
                return false;

            default:
                return false;
        }
    }

}

module.exports = {MarketHelper};