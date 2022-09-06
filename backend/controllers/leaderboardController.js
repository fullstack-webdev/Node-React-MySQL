const logger = require("../logging/logger");
const leaderboardQueries = require(`../queries/leaderboardQueries`);
const LeaderboardModel = require("../models/leaderboardModel");
const Sanitizer = require("../utils/sanitizer");
const { Utils } = require("../utils/utils");
const Validator = require('../utils/validator');


let sanitizer= new Sanitizer();

async function getLeaderboard(req, res){
    let rawLeaderboard;
    let response;

    try {
        rawLeaderboard = await leaderboardQueries.retrieveLeaderboard();
    } catch (error) {
        logger.error(`Error in leaderboardQueries retrieveLeaderboard: ${Utils.printErrorLog(error)}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
    logger.debug(`leaderboardQueries retrieveLeaderboard response : ${JSON.stringify(rawLeaderboard)}`);

    response = LeaderboardModel.leaderboardBuilder(rawLeaderboard);

    logger.debug(`LeaderboardModel leaderboardBuilder response: ${JSON.stringify(response)}`);    
    logger.info(`getLeaderboard END`);
    return res
        .status(200)
        .json({
            success: true,
            data: {
                leaderboard:response
            }
        });
}

async function getLeaderboardCrafting(req, res){
    let rawLeaderboard;
    let response;

    try {
        rawLeaderboard = await leaderboardQueries.retrieveLeaderboardCrafting();
    } catch (error) {
        logger.error(`Error in leaderboardQueries retrieveLeaderboardNPC: ${Utils.printErrorLog(error)}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
    logger.debug(`leaderboardQueries retrieveLeaderboard response : ${JSON.stringify(rawLeaderboard)}`);

    response = LeaderboardModel.leaderboardCraftingBuilder(rawLeaderboard);

    logger.debug(`LeaderboardModel leaderboardFishermanBuilder response: ${JSON.stringify(response)}`);    
    logger.info(`getLeaderboardFisherman END`);
    return res
        .status(200)
        .json({
            success: true,
            data: {
                leaderboard:response
            }
        });
}

async function getLeaderboardFisherman(req, res){
    let rawLeaderboard;
    let response;

    try {
        rawLeaderboard = await leaderboardQueries.retrieveLeaderboard('fisherman');
    } catch (error) {
        logger.error(`Error in leaderboardQueries retrieveLeaderboard: ${Utils.printErrorLog(error)}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }
    logger.debug(`leaderboardQueries retrieveLeaderboard response : ${JSON.stringify(rawLeaderboard)}`);

    response = LeaderboardModel.leaderboardFishermanBuilder(rawLeaderboard);

    logger.debug(`LeaderboardModel leaderboardFishermanBuilder response: ${JSON.stringify(response)}`);    
    logger.info(`getLeaderboardFisherman END`);
    return res
        .status(200)
        .json({
            success: true,
            data: {
                leaderboard:response
            }
        });
}


module.exports = {getLeaderboard, getLeaderboardFisherman, getLeaderboardCrafting};