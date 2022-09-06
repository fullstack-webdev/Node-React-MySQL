class ShopBuildingHelper{
    
    checkBuildingCursedRequired(nfts,type,require){
        for (let nft of nfts){
            if (nft.type==type && nft.level>=require && !nft.cursed){           
                return {
                    success: true,
                    nftId: nft.id
                };                 
            }
        }
        return {success: false};
    }   

    buildCursedRequirements(shopItem, nfts){
        console.log("entrato buildCursedRequirements");
        let resultCheck;
        let requirements = [];
        if(shopItem.thRequire > 0){
            resultCheck = this.checkBuildingCursedRequired(nfts, 1, shopItem.thRequire);
    
            requirements.push({
                type: 1,
                level: shopItem.thRequire,
                isAllowed: resultCheck.success,
                nftId: resultCheck.success ? resultCheck.nftId : null
            })
        }
    
        if(shopItem.ljRequire > 0){
            resultCheck = this.checkBuildingCursedRequired(nfts, 2, shopItem.ljRequire);
    
            requirements.push({
                type: 2,
                level: shopItem.ljRequire,
                isAllowed: resultCheck.success,
                nftId: resultCheck.success ? resultCheck.nftId : null
            })
        }
    
        if(shopItem.smRequire > 0){
            resultCheck = this.checkBuildingCursedRequired(nfts, 3, shopItem.smRequire);
    
            requirements.push({
                type: 3,
                level: shopItem.smRequire,
                isAllowed: resultCheck.success,
                nftId: resultCheck.success ? resultCheck.nftId : null
            })
        }
        return requirements;
    }

}

module.exports = ShopBuildingHelper
