const logger = require('../../logging/logger');

const UserQueries = require('../../queries/userQueries');
const { ItemQueries } = require('../../queries/inventory/itemQueries');

class RecipeHelper{
    static async buildResourceRequirements(resourceRequirements, requirements, address){
        let user;
        let resourceRequirement = resourceRequirements[0];

        try{
            user = await UserQueries.getUser(address);
        }catch(error){
            logger.error(`Error in ItemQueries.getItemInstanceByAddress: ${Utils.printErrorLog(error)}`);
            return;
        }

        user = user[0];

        if(resourceRequirement.ancien != null && resourceRequirement.ancien > 0){
            let requireObject = {};

            if(user.ancien >= resourceRequirement.ancien){
                requireObject.isAllowed = true;
            }else{
                requireObject.isAllowed = false;
            }

            requireObject.name = 'ancien';
            requireObject.image = process.env.ANCIEN_IMAGE;
            requireObject.quantityItem = resourceRequirement.ancien;

            requirements.push(requireObject);

        }

        if(resourceRequirement.wood != null && resourceRequirement.wood > 0){
            let requireObject = {};

            if(user.wood >= resourceRequirement.wood){
                requireObject.isAllowed = true;
            }else{
                requireObject.isAllowed = false;
            }

            requireObject.name = 'wood';
            requireObject.image = process.env.WOOD_IMAGE;
            requireObject.quantityItem = resourceRequirement.wood;

            requirements.push(requireObject);

        }

        if(resourceRequirement.stone != null && resourceRequirement.stone > 0){
            let requireObject = {};

            if(user.stone >= resourceRequirement.stone){
                requireObject.isAllowed = true;
            }else{
                requireObject.isAllowed = false;
            }

            requireObject.name = 'stone';
            requireObject.image = process.env.STONE_IMAGE;
            requireObject.quantityItem = resourceRequirement.stone;

            requirements.push(requireObject);

        }


        return;
    }

    static buildResourceRequirementsV2(recipe, requirements){
        if(recipe.requiredAncien != null && recipe.requiredAncien > 0){
            let requireObject = {};

            requireObject.isAllowed = recipe.isAllowed;
        
            requireObject.name = 'ancien';
            requireObject.image = process.env.ANCIEN_IMAGE;
            requireObject.quantity = recipe.requiredAncien;

            requirements.push(requireObject);
        }

        if(recipe.requiredWood != null && recipe.requiredWood > 0){
            let requireObject = {};

            requireObject.isAllowed = recipe.isAllowed;

            requireObject.name = 'wood';
            requireObject.image = process.env.WOOD_IMAGE;
            requireObject.quantity = recipe.requiredWood;

            requirements.push(requireObject);
        }

        if(recipe.requiredStone != null && recipe.requiredStone > 0){
            let requireObject = {};

            requireObject.isAllowed = recipe.isAllowed;

            requireObject.name = 'stone';
            requireObject.image = process.env.STONE_IMAGE;
            requireObject.quantity = recipe.requiredStone;

            requirements.push(requireObject);
        }
        return;
    }

    static async buildItemRequirements(itemRequirements, requirements, address){
        let items_instance;

        try{
            items_instance = await ItemQueries.getItemInstanceByAddress(address);
        }catch(error){
            logger.error(`Error in ItemQueries.getItemInstanceByAddress: ${Utils.printErrorLog(error)}`);
            return;
        }
        
        for(let itemRequirement of itemRequirements){
            let requireObject = {};

            let item_instance = items_instance.filter( item => item.idItem == itemRequirement.idItem);

            if(item_instance == null || item_instance == undefined || item_instance.length == 0){
                requireObject.isAllowed = false; 
            }else if(item_instance[0].quantity < itemRequirement.quantityItem){
                requireObject.isAllowed = false; 
            }else if(item_instance[0].quantity >= itemRequirement.quantityItem){
                requireObject.isAllowed = true; 
            }

            requireObject.name = itemRequirement.name;
            requireObject.image = itemRequirement.image;
            requireObject.quantityItem = itemRequirement.quantityItem;
            console.log("")
            requirements.push(requireObject);
            
        }
        
        return;
    }

    static async buildItemRequirementsV2(recipeGrouped, requirements){

        for(let recipe of recipeGrouped){
            let requireObject = {};

            
            requireObject.isAllowed = recipe.isItemAllowed; 

            requireObject.name = recipe.requiredItemName;
            requireObject.image = recipe.requiredItemImage;
            requireObject.quantity = recipe.requiredItemQuantity;

            requirements.push(requireObject);
        }
        
        return;
    }

    static checkRequirements(requirements){
        for(let req of requirements){
            if(!req.isAllowed){
                return false;
            }
        }
        return true;
    }
}
module.exports = {RecipeHelper}