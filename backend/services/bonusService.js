const { add } = require('winston');
const logger = require('../logging/logger');
const random = require('random');
const { Utils } = require("../utils/utils");

const { BonusQueries } = require(`../queries/bonusQueries`);

class BonusService {
    static async getToolInfo(idToolInstance) {
        logger.info(`BonusService.getToolInfo START`)

        let toolInfo;
        try {
            toolInfo = await BonusQueries.getToolInfoByIdToolInstance(idToolInstance);
        } catch (error) {
            logger.error(`Error in BonusQueries getToolInfoByIdToolInstance: ${Utils.printErrorLog(error)}`)
            throw error
        }

        let toolResponse = {};
        toolResponse = BonusService.buildToolResponse(toolInfo);
        logger.debug(`response toolsResponse : ${JSON.stringify(toolResponse)} `);

        logger.info(`BonusService.getToolInfo END`)

        return toolResponse
    }

    static buildToolResponse(tools) {
        let toolObject = {};
        let bonusesArray = [];
        let prefix = 0; let suffix = 0; let implicit = 0;
        let prefixElev = 0; let suffixElev = 0;

        for (let j = 0; j < tools.length; j++) {
            let bonusesObject = {};

            toolObject.idToolInstance = tools[j].idToolInstance;
            toolObject.name = tools[j].toolName;
            toolObject.description = tools[j].toolDesc;
            toolObject.image = tools[j].toolImage;
            toolObject.type = tools[j].toolType;
            toolObject.level = tools[j].toolLevel;

            //IF TOOL HAS BONUS SAVE BONUS INFOS
            if (tools[j].idBonus != null) {

                if (tools[j].bonusType == 'PREFIX') {
                    prefix = prefix + 1;
                    if(tools[j].bonusTier == process.env.MAX_PREFIX_TIER){
                        prefixElev = prefixElev + 1;
                    }

                } else if (tools[j].bonusType == 'SUFFIX') {
                    suffix = suffix + 1;
                    if(tools[j].bonusTier == process.env.MAX_SUFFIX_TIER){
                        suffixElev = suffixElev + 1;
                    }

                } else if (tools[j].bonusType == 'IMPLICIT') {
                    implicit = implicit + 1;

                }

                bonusesObject.type = tools[j].bonusType;
                bonusesObject.idBonus = tools[j].idBonus;
                bonusesObject.idBonusCode = tools[j].idBonusCode;
                bonusesObject.name = tools[j].bonusName;
                bonusesObject.description = tools[j].bonusDesc;
                bonusesObject.tier = tools[j].bonusTier;
                if (tools[j].percentageBoost == null) {
                    bonusesObject.flat = tools[j].flatBoost;
                } else if (tools[j].flatBoost == null) {
                    bonusesObject.percentage = tools[j].percentageBoost;
                }

                bonusesArray.push(bonusesObject);
            }
        }

        toolObject.bonuses = bonusesArray;

        let isEnchantable = {};
        let isRollable = {};
        let isElevatable = {};

        //SET isEnchantable
        isEnchantable = BonusService.setIsEnchantable(prefix, suffix, implicit);
        toolObject.isEnchantable = isEnchantable;

        //SET isRollable
        isRollable = BonusService.setIsRollable(prefix, suffix, implicit);
        toolObject.isRollable = isRollable;

        //SET isElevatable
        isElevatable = BonusService.setIsElevatable(prefix, suffix, prefixElev, suffixElev);
        toolObject.isElevatable = isElevatable;

        logger.debug(`response toolObject : ${JSON.stringify(toolObject)} `);
        return toolObject;
    }

    static buildToolsResponse(idTools, tools) {
        let toolsArray = [];

        for (let i = 0; i < idTools.length; i++) {
            let toolObject = {};
            let bonusesArray = [];
            let prefix = 0; let suffix = 0; let implicit = 0;
            let prefixElev = 0; let suffixElev = 0;

            for (let j = 0; j < tools.length; j++) {
                let bonusesObject = {};

                if (idTools[i].idToolInstance == tools[j].idToolInstance) {

                    toolObject.idToolInstance = tools[j].idToolInstance;
                    toolObject.name = tools[j].toolName;
                    toolObject.description = tools[j].toolDesc;
                    toolObject.image = tools[j].toolImage;
                    toolObject.type = tools[j].toolType;
                    toolObject.level = tools[j].toolLevel;

                    //IF TOOL HAS BONUS SAVE BONUS INFOS
                    if (tools[j].idBonus != null) {

                        if (tools[j].bonusType == 'PREFIX') {
                            prefix = prefix + 1;
                            if(tools[j].bonusTier == process.env.MAX_PREFIX_TIER){
                                prefixElev = prefixElev + 1;
                            }

                        } else if (tools[j].bonusType == 'SUFFIX') {
                            suffix = suffix + 1;
                            if(tools[j].bonusTier == process.env.MAX_SUFFIX_TIER){
                                suffixElev = suffixElev + 1;
                            }

                        } else if (tools[j].bonusType == 'IMPLICIT') {
                            implicit = implicit + 1;

                        }

                        bonusesObject.type = tools[j].bonusType;
                        bonusesObject.idBonus = tools[j].idBonus;
                        bonusesObject.idBonusCode = tools[j].idBonusCode;
                        bonusesObject.name = tools[j].bonusName;
                        bonusesObject.description = tools[j].bonusDesc;
                        bonusesObject.tier = tools[j].bonusTier;
                        if (tools[j].percentageBoost == null) {
                            bonusesObject.flat = tools[j].flatBoost;
                        } else if (tools[j].flatBoost == null) {
                            bonusesObject.percentage = tools[j].percentageBoost;
                        }
                    }

                    bonusesArray.push(bonusesObject);
                }
            }

            toolObject.bonuses = bonusesArray;

            let isEnchantable = {};
            let isRollable = {};
            let isElevatable = {};

            logger.debug(`response prefixElev : ${JSON.stringify(prefixElev)}, suffixElev: ${JSON.stringify(suffixElev)}`);

            //SET isEnchantable
            isEnchantable = BonusService.setIsEnchantable(prefix, suffix, implicit);
            toolObject.isEnchantable = isEnchantable;

            //SET isRollable
            isRollable = BonusService.setIsRollable(prefix, suffix, implicit);
            toolObject.isRollable = isRollable;

            //SET isElevatable
            isElevatable = BonusService.setIsElevatable(prefix, suffix, prefixElev, suffixElev);
            toolObject.isElevatable = isElevatable;


            toolsArray.push(toolObject);

        }
        //logger.debug(`response toolsArray : ${JSON.stringify(toolsArray)} `);
        return toolsArray;

    }

    static buildConsumablesResponse(consumables) {
        let consumablesArray = [];

        for (let i = 0; i < consumables.length; i++) {
            let consumableObject = {};

            consumableObject.idItemConsumableBonus = consumables[i].idItemConsumableBonus;
            consumableObject.quantity = consumables[i].quantity;
            consumableObject.name = consumables[i].name;
            consumableObject.description = consumables[i].description;
            consumableObject.image = consumables[i].image;
            consumableObject.type = consumables[i].type;
            consumableObject.effectOn = consumables[i].effectOn;

            consumablesArray.push(consumableObject);
        }

        //logger.debug(`response consumablesArray : ${JSON.stringify(consumablesArray)} `);
        return consumablesArray;
    }

    static buildRerollBonusesResponse(implicit, prefix, suffix) {

        let newBonuses = [];

        for (let bonus of implicit) {
            let BonusObject = {};

            BonusObject.idBonusCode = bonus.idBonusCode;
            BonusObject.idBonus = bonus.idBonus;
            BonusObject.type = bonus.type;
            BonusObject.name = bonus.name;
            BonusObject.description = bonus.description;
            BonusObject.tier = bonus.tier;

            if (bonus.flatBoost == null) {
                BonusObject.percentage = bonus.percentageBoost;
            } else {
                BonusObject.flat = bonus.flatBoost;
            }
            newBonuses.push(BonusObject);
        }

        for (let bonus of prefix) {
            let BonusObject = {};

            BonusObject.idBonusCode = bonus.idBonusCode;
            BonusObject.idBonus = bonus.idBonus;
            BonusObject.type = bonus.type;
            BonusObject.name = bonus.name;
            BonusObject.description = bonus.description;
            BonusObject.tier = bonus.tier;

            if (bonus.flatBoost == null) {
                BonusObject.percentage = bonus.percentageBoost;
            } else {
                BonusObject.flat = bonus.flatBoost;
            }
            newBonuses.push(BonusObject);
        }

        for (let bonus of suffix) {
            let BonusObject = {};

            BonusObject.idBonusCode = bonus.idBonusCode;
            BonusObject.idBonus = bonus.idBonus;
            BonusObject.type = bonus.type;
            BonusObject.name = bonus.name;
            BonusObject.description = bonus.description;
            BonusObject.tier = bonus.tier;

            if (bonus.flatBoost == null) {
                BonusObject.percentage = bonus.percentageBoost;
            } else {
                BonusObject.flat = bonus.flatBoost;
            }
            newBonuses.push(BonusObject);
        }

        return newBonuses;
    }

    static buildElevateBonusesResponse(upgradeInfo, downgradeInfo) {
        let newBonuses = [];
        let upBonusObject = {};
        let downBonusObject = {};
        //upgraded bonus
        upBonusObject.idBonusCode = upgradeInfo.idBonusCode;
        upBonusObject.idBonus = upgradeInfo.idBonus;
        upBonusObject.type = upgradeInfo.type;
        upBonusObject.name = upgradeInfo.name;
        upBonusObject.description = upgradeInfo.description;
        upBonusObject.tier = upgradeInfo.tier;

        if (upgradeInfo.flatBoost == null) {
            upBonusObject.percentage = upgradeInfo.percentageBoost;
        } else {
            upBonusObject.flat = upgradeInfo.flatBoost;
        }
        newBonuses.push(upBonusObject);

        //downgrade bonus
        if (downgradeInfo != null) {
            downBonusObject.idBonusCode = downgradeInfo.idBonusCode;
            downBonusObject.idBonus = downgradeInfo.idBonus;
            downBonusObject.type = downgradeInfo.type;
            downBonusObject.name = downgradeInfo.name;
            downBonusObject.description = downgradeInfo.description;
            downBonusObject.tier = downgradeInfo.tier;

            if (downgradeInfo.flatBoost == null) {
                downBonusObject.percentage = downgradeInfo.percentageBoost;
            } else {
                downBonusObject.flat = downgradeInfo.flatBoost;
            }
            newBonuses.push(downBonusObject);
        }

        return newBonuses;
    }

    static buildEnchantToolResponse(bonusInfo) {
        let bonusObject = {};

        //new added bonus
        bonusObject.idBonusCode = bonusInfo.idBonusCode;
        bonusObject.idBonus = bonusInfo.idBonus;
        bonusObject.type = bonusInfo.type;
        bonusObject.name = bonusInfo.name;
        bonusObject.description = bonusInfo.description;
        bonusObject.tier = bonusInfo.tier;

        if (bonusInfo.flatBoost == null) {
            bonusObject.percentage = bonusInfo.percentageBoost;
        } else {
            bonusObject.flat = bonusInfo.flatBoost;
        }
        return bonusObject;
    }

    static getBonusInfoForIdToolInstance(toolInfo, effectOn) {
        let idBonusArray = [];
        let maxTier;

        //retrieve maxTier value
        if (effectOn == 'SUFFIX') {
            maxTier = process.env.MAX_SUFFIX_TIER;
        } else if (effectOn == 'PREFIX') {
            maxTier = process.env.MAX_PREFIX_TIER;
        }

        //save relevant info about tool's bonuses in idBonusArray
        for (let i = 0; i < toolInfo.length; i++) {
            let tool = toolInfo[i];

            if (tool.bonusType == effectOn) {
                let idBonus = {}

                idBonus.idBonusCode = tool.idBonusCode;
                idBonus.idBonusInstance = tool.idBonusInstance;
                idBonus.id = tool.idBonus;
                idBonus.tier = tool.bonusTier;

                if (tool.bonusTier == maxTier) {
                    idBonus.isMax = true;
                    idBonus.isMin = false;

                } else if (tool.bonusTier == 1) {
                    idBonus.isMax = false;
                    idBonus.isMin = true;

                } else {
                    idBonus.isMax = false;
                    idBonus.isMin = false;

                }
                idBonusArray.push(idBonus);
            }
        }
        return idBonusArray;
    }


    static randomizeElevate(idBonusArray) {
        let upgradeThisBonus, downgradeThisBonus;
        let upgradeArray = []; let downgradeArray = []; let response = {};


        for (let i = 0; i < idBonusArray.length; i++) {
            //downgradeArray contains all downgradable bonuses (no min tier)
            //upgradeArray contains all upgradable bonuses (no max tier)
            if (idBonusArray[i].isMax == true) {
                downgradeArray.push(idBonusArray[i]);

            } else if (idBonusArray[i].isMin == true) {
                upgradeArray.push(idBonusArray[i]);

            } else if (idBonusArray[i].isMax == false && idBonusArray[i].isMin == false) {
                downgradeArray.push(idBonusArray[i]);
                upgradeArray.push(idBonusArray[i]);
            }
        }
        logger.debug(`upgradeArray: ${JSON.stringify(upgradeArray)}, downgradeArray: ${JSON.stringify(downgradeArray)}`);

        if (upgradeArray.length == 0) {
            return -1;
        }

        if (upgradeArray.length > 0) {

            //If there's only one element in downgradeArray downgrade it,
            //take it out of upgradeArray, then get random bonus for upgrade
            if (downgradeArray.length == 1) {
                downgradeThisBonus = downgradeArray[0];
                let index = upgradeArray.indexOf(downgradeThisBonus);

                if (index != -1) {
                    upgradeArray.splice(index, 1);
                    logger.debug(`upgradeArray: ${JSON.stringify(upgradeArray)}`);
                }
                index = random.int(0, upgradeArray.length - 1);
                upgradeThisBonus = upgradeArray[index];
            } else {
                let index = random.int(0, upgradeArray.length - 1);
                upgradeThisBonus = upgradeArray[index];

                index = downgradeArray.indexOf(upgradeThisBonus);
                logger.debug(`index: ${JSON.stringify(index)}`);

                //If chosen bonus is in the array take it out of downgradeArray,
                //then get random bonus for downgrade
                if (index != -1) {
                    downgradeArray.splice(index, 1);
                    logger.debug(`downgradeArray: ${JSON.stringify(downgradeArray)}`);
                }
                index = random.int(0, downgradeArray.length - 1);
                downgradeThisBonus = downgradeArray[index];
            }
        }
        response.upgrade = upgradeThisBonus;
        response.downgrade = downgradeThisBonus;
        logger.debug(`randomizeElevate response: ${JSON.stringify(response)}`);
        return response;
    }

    static randomizeEnchant(bonusArray) {
        let total = 0

        for (let bonus of bonusArray) {
            total += bonus.chance;
        }

        let randomize = (random.int(0, 99) * total) / 100;

        for (let bonus of bonusArray) {
            if (randomize < bonus.chance) {
                return bonus;
            }

            randomize -= bonus.chance;
        }
    }

    static randomizeReroll(bonusArray, implicit, prefix, suffix) {
        let totalI = 0; let totalP = 0; let totalS = 0;
        let bonusArrayI = []; let bonusArrayP = []; let bonusArrayS = [];
        let rerollArrayI = []; let rerollArrayP = []; let rerollArrayS = [];

        for (let bonus of bonusArray) {
            if (bonus.type == "IMPLICIT") {
                totalI += bonus.chance;
                bonusArrayI.push(bonus);

            } else if (bonus.type == "PREFIX") {
                totalP += bonus.chance;
                bonusArrayP.push(bonus);

            } else if (bonus.type == "SUFFIX") {
                totalS += bonus.chance;
                bonusArrayS.push(bonus);
            }
        }
        // logger.debug(`bonusArrayI response: ${JSON.stringify(bonusArrayI)}`);
        // logger.debug(`bonusArrayP response: ${JSON.stringify(bonusArrayP)}`);
        // logger.debug(`bonusArrayS response: ${JSON.stringify(bonusArrayS)}`);

        //randomize implicit
        for (implicit; implicit > 0; implicit--) {
            for (let bonus of bonusArrayI) {
                let randomize = (random.int(0, 99) * totalI) / 100;

                if (randomize < bonus.chance) {
                    bonusArrayI = bonusArrayI.filter(i => i.idBonusCode != bonus.idBonusCode);
                    rerollArrayI.push(bonus);
                    break;
                }

                totalI -= bonus.chance;

            }

        }
        //randomize prefix
        for (prefix; prefix > 0; prefix--) {
            for (let bonus of bonusArrayP) {
                let randomize = (random.int(0, 99) * totalP) / 100;

                if (randomize < bonus.chance) {
                    bonusArrayP = bonusArrayP.filter(i => i.idBonusCode != bonus.idBonusCode);
                    rerollArrayP.push(bonus);
                    break;
                }

                totalP -= bonus.chance;

            }

        }
        //randomize suffix
        for (suffix; suffix > 0; suffix--) {
            for (let bonus of bonusArrayS) {
                let randomize = (random.int(0, 99) * totalS) / 100;

                if (randomize < bonus.chance) {
                    bonusArrayS = bonusArrayS.filter(i => i.idBonusCode != bonus.idBonusCode);
                    rerollArrayS.push(bonus);
                    break;
                }

                totalS -= bonus.chance;

            }
        }

        let reroll = [rerollArrayI, rerollArrayP, rerollArrayS];

        return reroll;
    }

    static async updateReroll(checkTool, randomize){
        let updateImplicit = [];
        let updatePrefix = [];
        let updateSuffix = [];

        for(let row of checkTool){
            if(row.type != null && row.type == "IMPLICIT"){
                updateImplicit.push(row);
            }
            if(row.type != null && row.type == "PREFIX"){
                updatePrefix.push(row);
            }
            if(row.type != null && row.type == "SUFFIX"){
                updateSuffix.push(row);
            }
        }
        logger.debug(`updateImplicit: ${JSON.stringify(updateImplicit)}, updatePrefix: ${JSON.stringify(updatePrefix)}, updateSuffix: ${JSON.stringify(updateSuffix)}`);

        let randomImplicit = randomize[0];
        let randomPrefix = randomize[1];
        let randomSuffix = randomize[2];

        for (let i = 0; i < randomImplicit.length; i++) {
            if(updateImplicit.length != 0){
                try {
                    await BonusQueries.updateBonusInstance(updateImplicit[i].idBonusInstance, randomImplicit[i].idBonus);
                } catch (error) {
                    logger.error(`Error in BonusQueries updateBonusInstance: ${Utils.printErrorLog(error)}`)
                    return res
                        .status(401)
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }
            }
        }

        for (let i = 0; i < randomPrefix.length; i++) {
            if(updatePrefix.length != 0){
                try {
                    await BonusQueries.updateBonusInstance(updatePrefix[i].idBonusInstance, randomPrefix[i].idBonus);
                } catch (error) {
                    logger.error(`Error in BonusQueries updateBonusInstance: ${Utils.printErrorLog(error)}`)
                    return res
                        .status(401)
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }
            }
        }

        for (let i = 0; i < randomSuffix.length; i++) {
            if(updateSuffix.length != 0){
                try {
                    await BonusQueries.updateBonusInstance(updateSuffix[i].idBonusInstance, randomSuffix[i].idBonus);
                } catch (error) {
                    logger.error(`Error in BonusQueries updateBonusInstance: ${Utils.printErrorLog(error)}`)
                    return res
                        .status(401)
                        .json({
                            success: false,
                            error: {
                                errorMessage: error
                            }
                        })
                }
            }
        }

    }


    static setEffectOn(effectOn, booleanValues) {
        if (booleanValues.prefix == false) {
            let i = effectOn.indexOf("PREFIX");
            if (i != -1) {
                effectOn.splice(i, 1);
            }
        }
        if (booleanValues.suffix == false) {
            let i = effectOn.indexOf("SUFFIX");
            if (i != -1) {
                effectOn.splice(i, 1);
            }
        }
        if (booleanValues.implicit == false) {
            let i = effectOn.indexOf("IMPLICIT");
            if (i != -1) {
                effectOn.splice(i, 1);
            }
        }

        return effectOn;
    }


    //the output of setIsEnchantable function is
    // isEnchantable: {
    //     prefix: true/false,
    //     suffix: true/false,
    //     implicit: true/false
    // }

    static setIsEnchantable(prefix, suffix, implicit) {
        let isEnchantable = {};

        if (process.env.MAX_PREFIX_BONUS > prefix) {
            isEnchantable.prefix = true;
        } else {
            isEnchantable.prefix = false;
        }

        if (process.env.MAX_SUFFIX_BONUS > suffix) {
            isEnchantable.suffix = true;
        } else {
            isEnchantable.suffix = false;
        }

        if (process.env.MAX_IMPLICIT_BONUS > implicit) {
            isEnchantable.implicit = true;
        } else {
            isEnchantable.implicit = false;
        }

        return isEnchantable;
    }


    //the output of setIsRollable function is
    // isRollable: {
    //     prefix: true/false,
    //     suffix: true/false,
    //     implicit: true/false
    // }

    static setIsRollable(prefix, suffix, implicit) {
        let isRollable = {};

        if (prefix <= process.env.MAX_PREFIX_BONUS && prefix != 0) {
            isRollable.prefix = true;
        } else {
            isRollable.prefix = false;
        }

        if (suffix <= process.env.MAX_SUFFIX_BONUS && suffix != 0) {
            isRollable.suffix = true;
        } else {
            isRollable.suffix = false;
        }

        if (implicit <= process.env.MAX_IMPLICIT_BONUS && implicit != 0) {
            isRollable.implicit = true;
        } else {
            isRollable.implicit = false;
        }

        return isRollable;
    }

    static setIsElevatable(prefix, suffix, prefixElev, suffixElev) {
        let isElevatable = {};

        if ((prefix >= 2) && (prefixElev < process.env.MAX_PREFIX_BONUS)) {
            isElevatable.prefix = true;
        } else {
            isElevatable.prefix = false;
        }

        if ((suffix >= 2) && (suffixElev < process.env.MAX_SUFFIX_BONUS)) {
            isElevatable.suffix = true;
        } else {
            isElevatable.suffix = false;
        }



        return isElevatable;
    }

}


module.exports = { BonusService }