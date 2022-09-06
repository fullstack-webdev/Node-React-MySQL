const logger = require('../../logging/logger');

const { RecipeQueries } = require('../../queries/inventory/recipeQueries');

const { RecipeHelper } = require('../../helpers/inventory/recipeHelper');
const { Utils } = require("../../utils/utils");

class RecipeService{
    constructor() {}

    static async getRequirements(address, idRecipe){
        let requirements = [];
        let resourceRequirements;
        let itemRequirements;

        try{
            resourceRequirements = await RecipeQueries.getRecipeResourceRequirementsByIdRecipe(idRecipe)
        } catch (error){ 
            logger.error(`Error in RecipeQueries.getRecipeResourceRequirementsByIdRecipe: ${Utils.printErrorLog(error)}`);
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
        }

        // requirements = RecipeHelper.buildResourceRequirements(resourceRequirements, requirements);
        //TODO test sideEffect on requirements
        if(resourceRequirements.length > 0){
            await RecipeHelper.buildResourceRequirements(resourceRequirements, requirements, address);
            logger.debug(`RecipeHelper.buildResourceRequirements response, requirements: ${JSON.stringify(requirements)}`);
        }
        

        try{
            itemRequirements = await RecipeQueries.getRecipeItemRequirementsByIdRecipe(idRecipe)
        } catch (error){ 
            logger.error(`Error in RecipeQueries.getRecipeItemRequirementsByIdRecipe: ${Utils.printErrorLog(error)}`);
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
        }

        // requirements = RecipeHelper.buildItemRequirements(itemRequirements, requirements);
        //TODO test sideEffect on requirements
        if(itemRequirements.length > 0){
            await RecipeHelper.buildItemRequirements(itemRequirements, requirements, address);
            logger.debug(`RecipeHelper.buildItemRequirements response, requirements: ${JSON.stringify(requirements)}`);
        }
        


        return requirements;
    }

    static async getRequirementsV2(recipeGrouped){
        let requirements = [];
        let resourceRequirements;
        let itemRequirements;

        // requirements = RecipeHelper.buildResourceRequirements(resourceRequirements, requirements);
        //TODO test sideEffect on requirements
    
        RecipeHelper.buildResourceRequirementsV2(recipeGrouped[0], requirements);
        logger.debug(`RecipeHelper.buildResourceRequirements response, requirements: ${JSON.stringify(requirements)}`);
        
        

       

        // requirements = RecipeHelper.buildItemRequirements(itemRequirements, requirements);
        //TODO test sideEffect on requirements
        RecipeHelper.buildItemRequirementsV2(recipeGrouped, requirements);
        logger.debug(`RecipeHelper.buildItemRequirements response, requirements: ${JSON.stringify(requirements)}`);
        
        


        return requirements;
    }

    static async getConsumables(){
        let consumables;

        return consumables;
    }
}

module.exports = { RecipeService }