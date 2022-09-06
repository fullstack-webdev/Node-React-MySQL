const logger = require('../../logging/logger');

const UserQueries = require('../../queries/userQueries');
const { ItemQueries } = require('../../queries/inventory/itemQueries');

class ToolHelper{
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

    static buildResourceRequirementsV2(tool, requirements){
        if(tool.requiredAncien != null && tool.requiredAncien > 0){
            let requireObject = {};

            requireObject.isAllowed = tool.isAncienAllowed;
        
            requireObject.name = 'ancien';
            requireObject.image = process.env.ANCIEN_IMAGE;
            requireObject.quantity = tool.requiredAncien;

            requirements.push(requireObject);
        }

        if(tool.requiredWood != null && tool.requiredWood > 0){
            let requireObject = {};

            requireObject.isAllowed = tool.isWoodAllowed;

            requireObject.name = 'wood';
            requireObject.image = process.env.WOOD_IMAGE;
            requireObject.quantity = tool.requiredWood;

            requirements.push(requireObject);
        }

        if(tool.requiredStone != null && tool.requiredStone > 0){
            let requireObject = {};

            requireObject.isAllowed = tool.isStoneAllowed;

            requireObject.name = 'stone';
            requireObject.image = process.env.STONE_IMAGE;
            requireObject.quantity = tool.requiredStone;

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

    static async buildItemRequirementsV2(toolGrouped, requirements){

        for(let tool of toolGrouped){
            let requireObject = {};

            
            requireObject.isAllowed = tool.isItemAllowed; 

            requireObject.name = tool.requiredItemName;
            requireObject.image = tool.requiredItemImage;
            requireObject.quantity = tool.requiredItemQuantity;

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
module.exports = {ToolHelper}