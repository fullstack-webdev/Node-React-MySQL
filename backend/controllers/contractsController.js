const mysql = require('../config/databaseConfig');

const ContractsModel = require('../models/contractsModel');
const UserModel = require('../models/userModel');
const VoucherModel = require('../models/voucherModel');
const BuildingsModel = require('../models/buildingsModel');



const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const fs = require('fs');
const buildingAbi = require('../ABI/building-abi.json');
const fishermanAbi = require('../ABI/fisherman-abi.json');
const wfishermanAbi = require('../ABI/wancientfisherman-abi.json');
const bundleAbi = require('../ABI/bundle-abi.json');
const resourceAbi = require('../ABI/resources-abi.json');
const stakerAbi = require('../ABI/staker-abi.json');
const logger = require('../logging/logger');
const Sanitizer = require('../utils/sanitizer');
const { Utils } = require("../utils/utils");
const Validator = require('../utils/validator');

const {VoucherService} = require('../services/voucherService');

let sanitizer = new Sanitizer();

const options = {
    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 2000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
};

//ONLY READ

const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.CHAINSTACK_MAINNET_ENDPOINT_1, options));
// const web3 = new Web3(process.env.GETBLOCK_MAINNET);

// const web3 = new Web3(new Web3.providers.WebsocketProvider("wss://ws-nd-173-158-986.p2pify.com/23cb66d5ca54ebf7e97e851382244fe1"));
// const web3 = new Web3(new Web3.providers.WebsocketProvider("wss://ws-nd-173-158-986.p2pify.com/23cb66d5ca54ebf7e97e851382244fe1"));
// const web3 = new Web3("https://mainnet.infura.io/v3/45eb0e4b59274a35afc5493241b5faf9");
// const web3 = new Web3("https://speedy-nodes-nyc.moralis.io/f4442bbaf6347b5b4eea00e5/polygon/mainnet/archive");

// var myStonemine = new web3.eth.Contract(buildingAbi, process.env.STONEMINE_ADDRESS);
// var myFisherman = new web3.eth.Contract(fishermanAbi, process.env.FISHERMAN_ADDRESS);
// var myWFisherman = new web3.eth.Contract(wfishermanAbi, process.env.WFISHERMAN_ADDRESS);
// // var myAncien = new web3.eth.Contract(resourceAbi, process.env.ANCIEN_ADDRESS);
// var myAncien = new web3.eth.Contract(resourceAbi, process.env.ANCIEN_ADDRESS);

const MAX_FISHERMAN_PRIVATE = 5;
const SIGNING_DOMAIN_NAME_LAND = "AncientStakerLand";

let whitelist = new ContractsModel.WhitelistService();

async function isWhitelisted(req, res){
	logger.info(`isWhitelisted START `);
	logger.debug(`ipAddress:${sanitizer.getIpAddress(req)}`);
    let address = req.body.address;

	// let isPrivateOneMint;
	// let isPublicMint;
	// let fishermanAvailable;

	// try{
	// 	isPrivateOneMint = await myFisherman.methods.isPrivateOneMint().call();
	// 	isPublicMint = myFisherman.methods.isPublicMint().call();
	// }catch(error){
	// 	logger.error(`Error in isWhitelisted, isPrivateOneMint or isPublicMint failed: ${Utils.printErrorLog(error)}`);
	// }
	

	// let numberOfMintFm;


    if(address == undefined || address == null){
		logger.warn(`Bad request,invalid address: ${address}`);
        return res
        .status(401)
        .json({
            success: false,
            error: {errorMessage: 'req is null'}
        })
    }

	// if(!sanitizer.sanitizeAddress(address) || !sanitizer.sanitizeType(nftType) || !sanitizer.sanitizeNftId(nftId)){
    //     logger.warn(`Bad request,invalid address: ${address}, or type: ${nftType}, or nftId: ${nftId}`);
    //     return res
	// 	.status(401)
	// 	.json({
    //         success: false,
    //         error: {errorMessage: 'not a valid address'}
    //     })
    // }

	if(!sanitizer.sanitizeAddress(address)){
        logger.warn(`Bad request,invalid address: ${address}, or type: ${nftType}, or nftId: ${nftId}`);
        return res
		.status(401)
		.json({
            success: false,
            error: {errorMessage: 'not a valid address'}
        })
    }

	// if(!web3.utils.isAddress(address)){
	// 	return res
    //     .status(401)
    //     .json({
    //         success: false,
    //         error: {errorMessage: 'not an address'}
    //     });
	// }

	logger.info(`isWhitelisted address: ${address}`);
    // logger.info(`isWhitelisted request, address: ${address}`);
	

    //vanno cambiate le configs della chain a cui si collega web3
    // const contract = new web3.eth.Contract(abiTownhall, "CONTRACT_ADDRESS");


	// try{
	// 	isPrivateOneMint = await myContractTh.methods.isPrivateOneMint().call();
	// 	isPrivateTwoMint = await myContractTh.methods.isPrivateTwoMint().call();
	// 	isPublicMint = await myContractTh.methods.isPublicMint().call();
	// }catch(err){
	// 	console.log("ERRORE CHIAMANDO CONTRACT TH PER isPrivateMint: ", err);
	// }

	// if( !(isPrivateOneMint) ){
	// 	return res
    // 	.json({
	// 		success: false,
	// 		error:{
	// 			errorCode: 0,  //0 min closed 1  no whitelist 2 whitelist but no mint available
	// 			errorMessage: "Mints are closed"
	// 		}
	// 	});
	// }

	if(!whitelist.isVerified(address)){
		return res
    	.json({
			success: false,
			error:{
				errorCode: 1,  //0 min closed 1  no whitelist 2 whitelist but no mint available
				errorMessage: "Address not whitelisted"
			}
		});
	}

	//bigNumberHandling

    // if(numberOfMintTh > 0 || numberOfMintLj > 0 || numberOfMintSm > 0){
    //     return res
	// 	.json({
	// 		success: false,
	// 		data:{  //if error.errorCode == 2
	// 			townhall: numberOfMintTh === 0 ? true : false,
	// 			lumberjack: numberOfMintLj === 0 ? true : false,
	// 			stonemine: numberOfMintSm === 0 ? true : false
	// 		},
	// 		error:{
	// 			errorCode: 2,  //0 min closed 1  no whitelist 2 whitelist but no mint available
	// 			errorMessage: "Address has already minted"
	// 		}
	// 	});
    // }
	logger.info(`isWhitelisted response:${
		JSON.stringify({
			merkleProof: whitelist.generateMerkleProof(address),
			info: "User whitelisted"
		})
	}`);
	logger.info(`isWhitelisted END`);
	return res
	.status(200)
	.json({
		success: true,
		data:{
			merkleProof: whitelist.generateMerkleProof(address),
			info: "User whitelisted"
		}
	});

}

async function createVoucher(req, res){
	logger.info(`createVoucher START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);
	logger.debug(`ipAddress:${sanitizer.getIpAddress(req)}`);

	logger.debug("VOUCHER_ENABLED: ", process.env.VOUCHER_ENABLED);

	if(process.env.VOUCHER_ENABLED.trim() === 'false'){
		logger.error("VOUCHER is not enabled");
		return res
		.status(401)
		.json({
			success: false,
			error: {
				errorMessage: "Create vouchers closed"
			}
		});
	}

	let address = req.locals.address;
	let type = req.body.type;
	let quantity = req.body.quantity;

	let resources;
	let resource;
	let response;
	let newAmount;
	let createTime;
	let recordId;
	let contractInfo;

	let voucher;
	let blockNumber;
	let signResponse;
	let signature;

	let inventoryService = new UserModel.InventoryService();
	let contractService = new ContractsModel.ContractService();
	let voucherService = new VoucherModel.VoucherService();

	if(address == null || address == undefined || type == null || type == undefined || quantity == null || quantity == undefined){
		logger.error("variables are null or undefined");

		return res
		.status(401)
		.json({
			success: false,
			error: {
				errorMessage: "Bad request: one or more parameters are null or undefined"
			}
		});
	}
	if(!sanitizer.sanitizeAddress(address) || !sanitizer.sanitizeType(type) || !sanitizer.isPositiveInteger(quantity)){
        logger.warn(`Bad request,invalid address: ${address}, or type: ${type}, or quantity: ${quantity}`);
        return res.status(401).json({
            success: false,
            error: {errorMessage: 'not a valid address'}
        })
    }
	logger.info(`createVoucher address: ${address}`);
    logger.info(`createVoucher request, address: ${address}, quantity: ${quantity},type: ${type}`);
	
	quantity = parseInt(quantity);  //can mint only integer tokens
	type = parseInt(type);  //type can be only integer and tra 1 e 3
	

	try {
		resources = await inventoryService.getResources(address);
	} catch (error) {
		logger.error(`Error in inventoryService.getResources: ${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
		
	}
	logger.debug(`response getResources :${JSON.stringify(resources)}`);

	resource = inventoryService.getResourceGivenType(resources, type);
	logger.debug(`response getResourceGivenType :${JSON.stringify(resource)}`);


	if( (resource < quantity) ){

	logger.error(`Not enough balance, resource :${JSON.stringify(resource)}, quantity:${quantity}`);

		return res
		.json({
			success: false,
			error: {
				errorMessage: "Not enough balance"
			}
		});
	}

	//TEMPORANEO
	if(quantity >= process.env.MAX_VOUCHER_VALUE){
		process.env.VOUCHER_ENABLED = false;

		logger.error(`BUGGER amount over limit:${address}`);
		return res
		.status(401)
		.json({
			success: false,
			error: {
				errorMessage: "Amount over the limit"
			}
		});
	}

	try {
		response = await voucherService.getCreatedVouchersGivenAddressTypeStatus(address, type, 'created');
	} catch (error) {
		logger.error(`Error in voucherService.getCreatedVouchersGivenAddressTypeStatus:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
	}
	logger.debug(`response getCreatedVouchersGivenAddressTypeStatus: ${JSON.stringify(response)}`);
	if(response == undefined || response == null || response.length > 0){
		return res
		.json({
			success: false,
			error: {
				errorMessage: "Voucher already created and not minted"
			}
		});
	}
	logger.debug(`response getCreatedVouchersGivenAddressTypeStatus: ${JSON.stringify(response)}`);



	try {
		response = await voucherService.createVoucher('created');
	} catch (error) {
		logger.error(`Error in voucherService.createVoucher:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
		
	}
	logger.debug(`response createVoucher:${JSON.stringify(response)}`);

	//Check if response return affectedRows
	if(response.affectedRows != 1){
		return res
		.json({
			success: false,
			error: {
				errorMessage: "affectedRows not one"
			}
		});
	}


	recordId = response.insertId;

	try {
		blockNumber = await web3.eth.getBlockNumber(); 
	} catch (error) {
		logger.error(`Error in w3b.eth.getBlockNumber:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
	}
	logger.debug(`response getBlockNumber: ${JSON.stringify(blockNumber)}`);
	contractInfo = contractService.getContractInfoGivenType(type);
	logger.debug(`response getContractInfoGivenType: ${JSON.stringify(contractInfo)}`);



	try {
		signResponse = await ContractsModel.SignerHelper.getSign(contractInfo.contractAddress,
			process.env.CHAIN_ID,
			recordId,
			address,
			quantity,
			blockNumber,
			contractInfo.signing_domain_name);
	
	} catch (error) {
		logger.error(`Error in ContractsModel.SignerHelper.getSign:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
		
	}
	signature = signResponse.signature;

	logger.debug(`signature:${signature}`);
	createTime = new Date().toISOString();

	voucher = {
		id: recordId,
		address: address,
		quantity: quantity,
		type: type,
		blockNumber: blockNumber,
		createTime: createTime,
		signature: signature
	};

	logger.debug(`voucher:${JSON.stringify(voucher)}`);

	//updateVoucherCreated

	try {
		response = await voucherService.updateCreatedVoucher(voucher);
	} catch (error) {
		logger.error(`Error in voucherService.updateCreatedVoucher:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
	}
	logger.debug(`response updateCreatedVoucher:${JSON.stringify(response)}`);

	newAmount = resource - quantity;

	response = await inventoryService.setResourcesGivenType(address, type, newAmount);
	logger.debug(`newAmount:${newAmount}`);
	logger.debug(`response setResourcesGivenType:${JSON.stringify(response)}`);
	
	if(response == undefined || response == null || response.length == 0){  //Se fail cancellare voucher in DB
		//Eliminare voucher appena creato da DB

		try {
			response = await voucherService.deleteVoucher(recordId, 'deleted');
		} catch (error) {
			logger.error(`Error in voucherService.deleteVoucher:${Utils.printErrorLog(error)}`);
			return res
			.json({
				success: false,
				error: error
			});
			
		}
		if(response == undefined || response == null || response.length == 0){
			//TODO NON SO CHE FARE SE CRASHA TUTTO, NON RITORNO NULLA OVVIAMENTE
		}

		return res
		.json({
			success: false,
			error: {
				errorMessage: "Save on DB new amout failed"
			}
		});
	}
	logger.info(`createVocuher response:${
		JSON.stringify({
			id: recordId,
			quantity: quantity,
			type: type,
			blockNumber: blockNumber,
			signature: signature
		})
	}`);
	logger.info("createVoucher END");

	return res
	.status(201)
	.json({
		success: true,
		data:{
			voucher: {
				id: recordId,
				quantity: quantity,
				type: type,
				blockNumber: blockNumber,
				signature: signature
			},
			newAmount: newAmount
		}
	});

}

async function getVouchers(req, res){
	logger.info(`getVouchers START address: ${req.locals.address}, ipAddress: ${Validator.getIpAddress(req)}`);
	logger.debug(`ipAddress:${sanitizer.getIpAddress(req)}`);
	let address = req.locals.address;

	let vouchers;
	let responseVouchers = [];
	let voucherService = new VoucherModel.VoucherService();

	if(address == undefined || address == undefined){
		logger.warn(`Bad request, input void or undefined, address: ${address}`);
		return res
		.status(400)
		.json({
			success: false,
			error: {
				errorMessage: "Bad request: address is not defined or null"
			}
		});
	}

	if(!sanitizer.sanitizeAddress(address) ){
        logger.warn(`Bad request,invalid address: ${address}`);
        return res
		.status(401)
		.json({
            success: false,
            error: {errorMessage: 'not a valid address'}
        })
    }
	logger.info(`getVouchers address: ${address}`);

	try {
		vouchers = await voucherService.getVouchersGivenAddress(address);
	} catch (error) {
		logger.error(`Error in vocuherService.getVouchersGivenAddress:${Utils.printErrorLog(error)}`);
        return res
        .json({
            success: false,
            error: error
        });
	}
	logger.debug(`response getVouchersGivenAddress: ${JSON.stringify(vouchers)}`);
	if( !(vouchers.length == 0) ){
		for(let voucher of vouchers){
			responseVouchers.push({
				id: voucher.id,
				quantity: voucher.quantity,
				type: voucher.type,
				blockNumber: voucher.blockNumber,
				signature: voucher.signature
			});
		}
	}

	logger.info(`response getVouchers : ${JSON.stringify(responseVouchers)}`);
	logger.info(`getVouchers END`);
	return res
	.status(200)
	.json({
		success: true,
		data: {
			vouchers: responseVouchers
		}
	});
}

//MUST CHANGE PRIVATE_KEY_SIGNER AND STAKER_LAND_ADDRESS AND CHAIN_ID
async function createLandVoucher(req, res){
	let address = req.body.address;
	let idContract = req.body.idContract;
	let creation = req.body.creation;
	let expireTime = req.body.expireTime;
	let fee = req.body.fee;

	console.log(req.body)

	let responseVoucher;

	// ADD VALIDATION AND LOGIC TO ENSURE LANDWONER IS ALLOWED TO DESTROY/CREATE A CONTRACT
	
	try{
		responseVoucher = await VoucherService.createLandVoucher(address, idContract, creation, expireTime, fee);
	}catch(error){
		console.log(error)
		return res.json({
			success: false
		})
	}

	return res.json({
		success: true,
		data:{
			voucher: responseVoucher
		}
	})

	
}


async function testIsOpen(req, res){
	let result;
	
	return res.json({
		result
	});
}





module.exports = {isWhitelisted, testIsOpen, createVoucher, getVouchers, createLandVoucher}


//nella create vouchere sanitize quantity e is positiv integer attraverso la classe
