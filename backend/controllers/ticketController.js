const UserModel = require('../models/userModel');
const TicketModel = require("../models/ticketModel");
const mysql = require('../config/databaseConfig');

const Sanitizer = require('../utils/sanitizer');
const logger = require("../logging/logger");
const Validator = require('../utils/validator')
const { Utils } = require("../utils/utils");

let ticketService = new TicketModel.TicketService();

let sanitizer = new Sanitizer();

async function getTickets(req, res){
    logger.info(`getTicket START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);



    let address = req.locals.address;
    let tickets;
    let nextDraws;
    let response;

    

    if(!sanitizer.validateInput(address)){
        logger.warn(`getShop address undefined`);
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Bad request: address null or undefined"
            }
        });
    }

    if(!sanitizer.sanitizeAddress(address)){
        return res
        .status(401)
        .json({
            success: false,
            error: {
                errorMessage: "Not an address"
            }
        })
    }

    logger.info(`getTickets address: ${address}`);                                      

    try {
        response = await ticketService.getTicketsByAddress(address);
    } catch (error) {
        logger.error(`Error in ticketService getTicketsByAddress: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }

    logger.debug(`ticketService getTicketsByAddress response : ${JSON.stringify(response)}`);

    tickets = ticketService.ticketBuilder(response);

    logger.debug(`ticketService ticketBuilder: ${JSON.stringify(tickets)}`);

    try {
        response = await ticketService.getNextDraws();
    } catch (error) {
        logger.error(`Error in ticketService getDraws: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: {
                errorMessage: error
            }
        });
    }

    logger.debug(`ticketService getDraws response :${JSON.stringify(response)}`);

    nextDraws = ticketService.drawsBuilder(response);

    return res
    .json({
        success:true,
        data:{
            tickets,
            nextDraws
        }
    })




    
}

module.exports = {getTickets}