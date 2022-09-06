const logger = require('../logging/logger');

class InventoryHelper{
    static recipeQuantityCheck(userRecipe,quantity){
        userRecipe = userRecipe[0];

        if(userRecipe.quantity < quantity)
            return false;
        return true;
    }
    static itemQuantityCheck(userItem,quantity){
        userItem = userItem[0];
        
        if(userItem.quantity < quantity)
            return false;
        return true;
    }

    static groupBy(collection, key){
        const groupedResult =  collection.reduce((previous,current)=>{
     
        if(!previous[current[key]]){
          previous[current[key]] = [];
         }
     
        previous[current[key]].push(current);
               return previous;
        }, {}); // tried to figure this out, help!!!!!
          return groupedResult
      }
}

module.exports = {InventoryHelper};