const logger = require('../logging/logger');
const Sanitizer = require('../utils/sanitizer');
const {s3Config,multerS3Config,upload}= require(`../config/s3Config`);
const multer = require(`multer`);
const ProfileQueries = require('../queries/profileQueries');
const profileValidation = require("../validations/profileValidation");
const { ProfileService } = require('../services/profileService');
const { ProfileInterface } = require('../interfaces/JS/profileInterface');
const { Utils } = require("../utils/utils");
const Validator = require('../utils/validator');


let sanitizer = new Sanitizer();

async function setProfile(req, res){
    logger.info(`setProfile START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    console.log('req.body: ', req.body)
    console.log('req.locals: ', req.locals)


    //VALIDATE DATA IN INPUT
    let validation;
    validation = profileValidation.setProfileValidation(req);
    if(!validation.success){
        return res
        .status(401)
        .json(validation);
    }



    //VARS
    let response;
    let sqlResponse;

    //VARS FROM API
    let address = req.locals.address;
    let imageName = req.locals.imageName;
    let cityName = req.body.cityName;
    let idEmblem = req.body.idEmblem;

    //VARS [IMAGE]
    let imageNameSplitted = imageName != undefined && imageName != null ? imageName.split('.') : [];
    let extension = imageNameSplitted.length > 0 ? imageNameSplitted[imageNameSplitted.length - 1] : 'null';
    let imgUrl;
    if(process.env.NODE_ENV.trim() == 'production'){
        imgUrl = `https://ancient-society.s3.eu-central-1.amazonaws.com/profile/${address}.${extension}`;
    }else{
        imgUrl = `https://provaletturaimage.s3.eu-central-1.amazonaws.com/testing/${address}.${extension}`;
    }
    


    //LOG
    logger.info(`setProfile request, address: ${address}, imageName: ${imageName}, cityName: ${cityName}, emblem: ${idEmblem}`);



    //GET PROFILE DATA
    try {
        sqlResponse = await ProfileQueries.getProfile(address);
    }catch(error){
        logger.error(`Error in setProfileController updateProfilePicture: ${Utils.printErrorLog(error)}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
    logger.debug(`setProfileController.getProfile response:${JSON.stringify(sqlResponse)}`);
    


    //CHECK IF PROFILE IS NOT SIGNED
    if(sqlResponse.length == 0){
        try {
            sqlResponse = await ProfileQueries.createProfile(address);
        } catch (error) {
            logger.error(`Error in setProfileController createProfilePicture: ${Utils.printErrorLog(error)}`);
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
        }
        logger.debug(`setProfileController createProfilePicture response:${JSON.stringify(sqlResponse)}`);
    }

    

    //CHECK image IS VALID
    if(sanitizer.validateInput(imageName)){
        try {
            sqlResponse = await ProfileQueries.updateProfilePicture(address, imgUrl);
        } catch (error) {
            logger.error(`Error in setProfileController updateProfilePicture: ${Utils.printErrorLog(error)}`);
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: error
                }
            });
        }
        logger.debug(`setProfileController updateProfilePicture response:${JSON.stringify(sqlResponse)}`);
    }else{
        imgUrl = false
    }
    


    //CHECK cityName IS VALID
    if(sanitizer.validateInput(cityName)){
        try {
            sqlResponse = await ProfileQueries.updateProfileCityName(address, cityName);
        } catch (error) {
            logger.error(`Error in setProfileController updateProfileCityName: ${Utils.printErrorLog(error)}`);
            return res
            .json({
                success: false,
                error: {
                    errorMessage: 'City Name already exists',
                    errorCode: error.code
                }
            });
        }
        logger.debug(`setProfileController updateProfileCityName response:${JSON.stringify(sqlResponse)}`);
    }


    //CHECK idEmblem IS VALID
    if(sanitizer.validateInput(idEmblem)){
        try {
            sqlResponse = await ProfileService.checkAndSetEmblem(address, idEmblem)
        } catch (error) {
            logger.error(`Error in setProfileController checkAndSetEmblem: ${Utils.printErrorLog(error)}`);
            return res
            .json({
                success: false,
                error: {
                    errorMessage: 'Error: emblem is not available',
                    errorCode: error.code
                }
            });
        }
        logger.debug(`setProfileController checkAndSetEmblem response:${JSON.stringify(sqlResponse)}`);
    }
    //CHECK IF EMBLEM IS LOCKED/NOT VALID
    if(!sqlResponse){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: 'Error: emblem not allowed',
            }
        });
    }
    

    //LOGS
    logger.info(`setProfile response:${JSON.stringify(sqlResponse)}`);
    logger.info("setProfile END");



    //BUILD RESPONSE
    try {
        response = await ProfileInterface.setProfileBuildResponse(imgUrl, idEmblem);
    } catch (error) {
        logger.error(`Error in getProfileController setProfileBuildResponse: ${Utils.printErrorLog(error)}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
    console.log('ProfileInterface.setProfileBuildResponse [RES]', response)
    logger.debug(`getProfileController getEmblems setProfileBuildResponse : ${JSON.stringify(response)}`);



    //RETURN RESPONSE
    logger.info("setProfileBuildResponse END");
    return res
    .status(200)
    .json({
        success: true,
        data:  response 
    });
}

async function getProfile(req,res){
    logger.info(`getProfile START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    
    let validation;

    validation = profileValidation.getProfileValidation(req);
    if(!validation.success){
        return res
        .status(401)
        .json(validation);
    }

    let address = req.locals.address;
    let response;



    console.log("address: ", address)

    try {
        response = await ProfileQueries.getProfile(address);
    } catch (error) {
        logger.error(`Error in getProfileController getProfile: ${Utils.printErrorLog(error)}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
    
    logger.debug(`getProfileController getProfile response : ${JSON.stringify(response)}`);

    if(response.length == 0){
        logger.info("getProfile END");
        return res
        .status(200)
        .json({
            success: true,
            data: {
                profile: {}
            }
        });
    }


    let announcement;
    try {
        announcement = await ProfileQueries.getAnnouncement();
    } catch (error) {
        logger.error(`Error in getProfileController getProfile: ${Utils.printErrorLog(error)}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }


    logger.info("getProfile END");
    return res
        .status(200)
        .json({
            success: true,
            data: {
                profile: {
                    image: response[0].image,
                    cityName: response[0].cityName,
                    idEmblem: response[0].idEmblem,
                },
                announcement: announcement[0]
            }
        });
}

async function getEmblems(req,res){
    logger.info(`getEmblems START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);

    
    let validation;

    validation = profileValidation.getProfileValidation(req);
    if(!validation.success){
        return res
        .status(401)
        .json(validation);
    }

    let address = req.locals.address;
    let response;
    let emblems;
    let emblemsStatus;
    


    //RETRIEVE ALL EMBLEMS
    try {
        emblems = await ProfileQueries.getEmblems(address);
    } catch (error) {
        logger.error(`Error in getProfileController getEmblems: ${Utils.printErrorLog(error)}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
    logger.debug(`getProfileController getEmblems response : ${JSON.stringify(emblems)}`);



    //CHECK IF EMBLEMS IS NOT EMPTY
    if(emblems.length == 0){
        logger.info("getEmblems END");
        return res
        .status(200)
        .json({
            success: true,
            data: {
                emblems: {}
            }
        });
    }



    //GET EMBLEM EQUIPPED
    try {
        emblemEquipped = await ProfileQueries.getEmblemEquipped(address);
    } catch (error) {
        logger.error(`Error in getProfileController getEmblemEquipped: ${Utils.printErrorLog(error)}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
    logger.debug(`getProfileController getEmblemEquipped response : ${JSON.stringify(emblemEquipped)}`);
    


    //CHECK IF AN EMBLEM IS EQUIPPED
    if (emblemEquipped.length) {
        emblemEquipped = emblemEquipped[0].idEmblem
    } else {
        emblemEquipped = -1
    }



    //GET STATUS FOR EACH EMBLEM
    try {
        emblemsStatus = await ProfileService.getEmblemsStatus(address, emblems, emblemEquipped);
    } catch (error) {
        logger.error(`Error in getProfileController getEmblemsStatus: ${Utils.printErrorLog(error)}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
    logger.debug(`getProfileController getEmblems getEmblemsStatus : ${JSON.stringify(emblemsStatus)}`);



    //BUILD RESPONSE
    try {
        response = await ProfileInterface.getEmblemsBuildResponse(emblems, emblemsStatus);
    } catch (error) {
        logger.error(`
Error in getProfileController getEmblemsBuildResponse: ${Utils.printErrorLog(error)}`
);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
    // console.log('ProfileInterface.getEmblemsBuildResponse [RES]', response)
    logger.debug(`getProfileController getEmblems getEmblemsBuildResponse : ${JSON.stringify(response)}`);
    


    //RETURN RESPONSE
    logger.info("getEmblems END");
    return res
        .status(200)
        .json({
            success: true,
            data: { 
                emblems: response 
            }
        });
}

async function checkForAirdrop(req,res){
    //VALIDATION
    let validation;
    validation = profileValidation.getProfileValidation(req);
    if(!validation.success){
        return res
        .status(401)
        .json(validation);
    }
    //VARS
    let address = req.locals.address; 
    let NFTsAvailableForAirdrop;
    let NFTsNotUsedYetForAirdrop;
    let setAirdropHistory;



    //CHECK IF AN ADDRESS HAS NFTs AVAILABLE FOR AN AIRDROP => GET MATCHES
    try{
        NFTsAvailableForAirdrop = await ProfileService.getNFTsAvailableForAirdrop(address)
    } catch(err){
        console.log('Error in NFTsAvailableForAirdrop: ', err);
        return res
        .status(200)
        .json({
            success: false
        });
    }
    //NOT AVAILABLE FOR AIRDROP
    if(!NFTsAvailableForAirdrop || NFTsAvailableForAirdrop.length == 0) 
        return res
        .status(200)
        .json({
            success: false,
            errorCode: '054322'
        });



    //GET NOT ALREADY USED NFTs 
    try{
        NFTsNotUsedYetForAirdrop = await ProfileService.NFTsNotUsedYetForAirdrop(NFTsAvailableForAirdrop)
    } catch(err){
        console.log('Error in NFTsNotUsedYetForAirdrop: ', err)
        return res
        .status(200)
        .json({
            success: false
        });
    }
    if(NFTsNotUsedYetForAirdrop.length == 0) 
        return res
        .status(200)
        .json({
            success: false,
            errorCode: '32561'
        });
    

    //FLAG THE NFT_ID AS USED; RETURN FALSE(IF ERROR) OR AFFECTED ROWS  
    try{
        setAirdropHistory = await ProfileService.setAirdropHistory(NFTsNotUsedYetForAirdrop)
    } catch(err){
        // console.log('Error in setAirdropHistory: ', err)
        return res
        .status(200)
        .json({
            success: false,
            errorCode: '42561'
        });
    }
    //CHECK IF IT'S FALSE OR AFFECTED ROWS == AIRDROPS TO DO
    if(!setAirdropHistory || setAirdropHistory != NFTsNotUsedYetForAirdrop.length) 
        return res
        .status(200)
        .json({
            success: false,
            errorMessage: ''
        });



    //DROP THE ITEMS
    try{
        setAirdropHistory = await ProfileService.airdropItems(NFTsNotUsedYetForAirdrop)
    } catch(err){
        console.log('Error in airdropItems: ', err)
        return res
        .status(200)
        .json({
            success: false
        });
    }

    

    //THE ADDRESS GOT AN AIRDROP
    return res
        .status(200)
        .json({
            success: true,
            data: NFTsNotUsedYetForAirdrop //TO REMOVE
        });
}

async function getBlessing(req, res) {
    //VALIDATION
    let validation;
    validation = profileValidation.getProfileValidation(req);
    if(!validation.success){
        return res
        .status(401)
        .json(validation);
    }
    //ADDRESS
    let address = req.locals.address;



    //GET LIQUIDITY OF ADDRESS
    let getLiquidity;
    let liquidity;
    try {
        getLiquidity = await ProfileQueries.getLiquidity(address)
    } catch (error) {
      return res.json({
        success: false,
        error: {
            errorCode: 15431,
            errorMessage: error,
        },
      });
    }
    if(getLiquidity.length == 0) liquidity = 0
    if(getLiquidity[0]?.liquidity) liquidity = getLiquidity[0].liquidity



    //GET ACTIVE BLESSING OF ADDRESS
    let blessing;
    try {
        blessing = await ProfileService.getBlessing(address)
    } catch (error) {
      return res.json({
        success: false,
        error: {
            errorCode: 25431,
            errorMessage: error,
        },
      });
    }
  


    return res.json({
      success: true,
      liquidity,
      blessing,
    });
}

async function askForBlessing(req, res) {
    //VALIDATION
    let validation;
    validation = profileValidation.getProfileValidation(req);
    if(!validation.success){
        return res
        .status(401)
        .json(validation);
    }
    //ADDRESS
    let address = req.locals.address;



    //CHECK THERE ARE NO ACTIVE BLESSING
    let blessingOnGoing;
    try {
        blessingOnGoing = await ProfileQueries.getAllBlessingsOnGoing(address)
    } catch (error) {
      return res.json({
        success: false,
        error: {
            errorCode: 10431,
            errorMessage: error,
        },
      });
    }
    if(blessingOnGoing.length > 0) 
        return res.json({
            success: false,
            error: {
                errorCode: 20431,
                errorMessage: 'Blessing still on going',
            }
        });



    //CHECK IF THERE IS LIQUIDITY PROVIDED
    let getLiquidity;
    let liquidity;
    try {
        getLiquidity = await ProfileQueries.getLiquidity(address)
    } catch (error) {
      return res.json({
        success: false,
        error: {
            errorCode: 30431,
            errorMessage: error,
        },
      });
    }
    if(getLiquidity.length == 0 || getLiquidity[0].liquidity == 0) 
        return res.json({
            success: false,
            error: {
                errorCode: 40431,
                errorMessage: 'No liquidity provided',
            }
        });
    liquidity = getLiquidity[0].liquidity;



    //GET THE REWARD ID
    let getBlessingRewardID
    try {
        getBlessingRewardID = await ProfileService.getBlessingRewardID(liquidity)
    } catch (error) {
      return res.json({
        success: false,
        error: {
            errorCode: 50431,
            errorMessage: error,
        },
      });
    }



    //CREATE NEW BLESSING
    let newBlessing;
    try {
        newBlessing = await ProfileQueries.setNewBlessing(address, liquidity, 3, getBlessingRewardID)
    } catch (error) {
      return res.json({
        success: false,
        error: {
            errorCode: 60431,
            errorMessage: error,
        },
      });
    }


    return res.json({
      success: true,
    });
}

async function claimBlessing(req, res) {
    //VALIDATION
    let validation;
    validation = profileValidation.getProfileValidation(req);
    if(!validation.success){
        return res
        .status(401)
        .json(validation);
    }
    //ADDRESS
    let address = req.locals.address;



    //CHECK THE BLESSING IS READY (Now > EndingTime)
    let blessingDone;
    try {
        blessingDone = await ProfileQueries.getAllBlessingsOnGoing(address)
    } catch (error) {
      return res.json({
        success: false,
        error: {
            errorCode: 10479,
            errorMessage: error,
        },
      });
    }
    if(blessingDone.length == 0) 
        return res.json({
            success: false,
            error: {
                errorCode: 20479,
                errorMessage: 'Blessing not exists',
            }
        });
    if(blessingDone[0].status != 'done') 
        return res.json({
            success: false,
            error: {
                errorCode: 30479,
                errorMessage: 'Blessing not done',
            }
        });
  


    //GET THE REWARD
    let getBlessingReward;
    let idItem, quantity, name;
    try {
        getBlessingReward = await ProfileQueries.getBlessingReward(address)
    } catch (error) {
      return res.json({
        success: false,
        error: {
            errorCode: 40479,
            errorMessage: error,
        },
      });
    }
    if(getBlessingReward.length == 0) 
        return res.json({
            success: false,
            error: {
                errorCode: 50479,
                errorMessage: 'Error in reward',
            }
        });
    if(getBlessingReward[0].liquidityRemoved == 1) 
        return res.json({
            success: false,
            error: {
                errorCode: 60479,
                errorMessage: 'Liquidity removed',
            }
        });
    if(getBlessingReward[0].status != 'done') 
        return res.json({
            success: false,
            error: {
                errorCode: 70479,
                errorMessage: 'Not done',
            }
        });
    idItem = getBlessingReward[0].idItem;
    image = getBlessingReward[0].image;
    quantity = getBlessingReward[0].quantity;
    name = getBlessingReward[0].name;
    

    //SET THE REWARD STATUS AS "rewarded"
    try {
        getBlessingReward = await ProfileQueries.setBlessingStatus(address, 'done', 'rewarded')
    } catch (error) {
      return res.json({
        success: false,
        error: {
            errorCode: 80479,
            errorMessage: error,
        },
      });
    }
    if(getBlessingReward.affectedRows != 1)
        return res.json({
            success: false,
            error: {
                errorCode: 90479,
                errorMessage: error,
            },
        });



    //DROP THE REWARD
    let dropItem;
    try {
        dropItem = await ProfileService.dropItem(address, idItem, quantity)
    } catch (error) {
      return res.json({
        success: false,
        error: {
            errorCode: 100479,
            errorMessage: error,
        },
      });
    }
    if(!dropItem)
        return res.json({
            success: false,
            error: {
                errorCode: 110479,
                errorMessage: error,
            },
        });


    //RETURN NAME AND QUANTITY OF THE DROP
    return res.json({
      success: true,
      itemDrop:{
        image,
        name,
        quantity
      }
    });
}

module.exports = {
    setProfile, 
    getProfile, 
    getEmblems, 
    checkForAirdrop, 
    getBlessing, 
    askForBlessing, 
    claimBlessing
};
