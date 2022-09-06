const logger = require("../logging/logger");
const { Blockchain } = require("../utils/blockchain");
const { ProfileHelper } = require("../helpers/profileHelper");
const ProfileQueries = require("../queries/profileQueries");
const { Utils } = require("../utils/utils");
const { FishermanQueries } = require("../queries/fishermanQueries");
class ProfileService {
  constructor() {}

  static async getEmblemsStatus(address, emblems, emblemEquipped) {
    // console.log('getEmblemsStatus')
    let response = [];
    let balanceIsEnough;

    for (let emblem of emblems) {
      // console.log('emblem [MAP]: ', emblem)
      // console.log('emblemResponse [MAP]: ', response)

      //EMBLEM IS EQUIPPED
      if (emblem.idEmblem == emblemEquipped) {
        response.push("equipped");
        continue;
      }

      //EMBLEM IS AVAILABLE FOR ALL (contract is not defined)
      if (!emblem.contract) {
        response.push("available");
        continue;
      }

      //[STAKING] CHECK IF BALANCE IS ENOUGH
      if (emblem.contractStaking) {
        try {
          balanceIsEnough = await ProfileHelper.getBalanceStaking(
            emblem.network,
            emblem.stakingInfo,
            address,
            emblem.contractStaking,
            emblem.balanceMin
          );
        } catch (err) {
          console.log("Error ProfileHelper.getBalanceStaking: ", err);
        }
      }

      //[NOT AVAILABLE FOR EVERYONE, NO STAKING] CHECK IF BALANCE IS ENOUGH
      if (emblem.contract && !emblem.contractStaking) {
        try {
          balanceIsEnough = await Blockchain.balanceIsEnough(
            emblem.network,
            address,
            emblem.contract,
            emblem.balanceMin
          );
        } catch (err) {
          logger.error("Error Blockchain.balanceIsEnough: ", err);
        }
      }

      //EMBLEM IS AVAILABLE
      if (balanceIsEnough) {
        response.push("available");
      }

      //EMBLEM IS NOT AVAILABLE
      else {
        response.push("locked");
      }
    }

    return response;
  }

  static async checkAndSetEmblem(address, idEmblem) {
    //VARS
    let emblem;
    let emblemEquipped;
    let balanceIsEnough;
    let sqlSetResponse;

    //EMBLEM IS NULL
    if (idEmblem == -1) return true;

    //CHECK IF THE idEmblem EXISTS
    try {
      emblem = await ProfileQueries.getEmblem(idEmblem);
    } catch (error) {
      logger.error(
        `Error in verifyEmblemBeforeSet getEmblem: ${Utils.printErrorLog(
          error
        )}`
      );
      return res.json({
        success: false,
        error: {
          errorMessage: "Emblem doesn't exist",
          errorCode: error.code,
        },
      });
    }
    logger.debug(
      `[GET_EMBLEM] verifyEmblemBeforeSet getEmblem: ${JSON.stringify(emblem)}`
    );

    //CHECK IF EMBLEM IS VALID
    if (emblem) {
      emblem = emblem[0];
    } else {
      return false;
    }

    //GET emblemEquipped
    try {
      emblemEquipped = await ProfileQueries.getEmblemEquipped(address);
    } catch (error) {
      logger.error(
        `Error in verifyEmblemBeforeSet getEmblemEquipped: ${Utils.printErrorLog(
          error
        )}`
      );
      return res.json({
        success: false,
        error: {
          errorMessage: "Error #2193-8021",
          errorCode: error.code,
        },
      });
    }
    logger.debug(
      `verifyEmblemBeforeSet getEmblemEquipped response:${JSON.stringify(
        emblemEquipped
      )}`
    );

    //CHECK IF AN EMBLEM IS EQUIPPED
    if (emblemEquipped.length) {
      emblemEquipped = emblemEquipped[0].idEmblem;
    } else {
      emblemEquipped = -1;
    }

    //EMBLEM IS ALREADY EQUIPPED
    if (idEmblem == emblemEquipped) return true;

    //[STAKING] CHECK IF BALANCE IS ENOUGH
    if (emblem.contractStaking) {
      // console.log('[CONTRACT_STAKING] Checking if balance is enough!')
      try {
        balanceIsEnough = await ProfileHelper.getBalanceStaking(
          emblem.network,
          emblem.stakingInfo,
          address,
          emblem.contractStaking,
          emblem.balanceMin
        );
      } catch (err) {
        console.log("Error ProfileHelper.getBalanceStaking: ", err);
      }
    }

    //[NOT AVAILABLE FOR EVERYONE, NO STAKING] CHECK IF BALANCE IS ENOUGH
    if (emblem.contract && !emblem.contractStaking) {
      // console.log('[CONTRACT] Checking if balance is enough!')
      try {
        balanceIsEnough = await Blockchain.balanceIsEnough(
          emblem.network,
          address,
          emblem.contract,
          emblem.balanceMin
        );
      } catch (err) {
        console.log("Error Blockchain.balanceIsEnough: ", err);
      }
    }

    //EMBLEM IS AVAILABLE FOR ALL
    if (!emblem.contract) balanceIsEnough = true;

    //IF BALANCE IS NOT ENOUGH -> NOT ALLOWED
    if (!balanceIsEnough) return false;

    //UPDATE PROFILE.idEmblem
    try {
      sqlSetResponse = await ProfileQueries.updateProfileEmblem(
        address,
        idEmblem
      );
    } catch (error) {
      logger.error(
        `Error in verifyEmblemBeforeSet updateProfileEmblem: ${Utils.printErrorLog(
          error
        )}`
      );
      return res.json({
        success: false,
        error: {
          errorMessage: "Set Emblem error",
          errorCode: error.code,
        },
      });
    }
    logger.debug(
      `ProfileService updateProfileEmblem response:${JSON.stringify(
        sqlSetResponse
      )}`
    );

    //IF THE NEW idEmblem IS SETTED -> RETURN TRUE
    if (sqlSetResponse) return true;
  }

  static async getNFTsAvailableForAirdrop(address) {
    let chainsAvailableForAirdropsFromDB = [];
    let chainsAvailableForAirdrops = [];
    let NFTsOwned = {};
    let NFTOwned;
    let airdropsAvailable;
    let matches = [];

    //GET CHAINS AVAILABLE FOR AIRDROPS
    try {
      chainsAvailableForAirdropsFromDB =
        await ProfileQueries.getChainsAvailableForAirdrops(address);
    } catch {}
    if (chainsAvailableForAirdropsFromDB.length == 0) return false;
    //TRANSFORM THE OBJECTS TO STRINGS
    chainsAvailableForAirdropsFromDB.map((chain) => {
      chainsAvailableForAirdrops.push(chain.chain);
    });

    //GET ALL THE NFTs THE ADDRESS OWNED IN CHAINS AVAILABLE FOR AIRDROPS
    for (let chain of chainsAvailableForAirdrops) {
      try {
        NFTOwned = await Blockchain.getNFTs(address, chain);
      } catch (err) {
        console.log(
          "Error in getNFTsAvailableForAirdrop.chainsAvailableForAirdrops: ",
          err
        );
      }
      NFTsOwned[chain] = NFTOwned;
    }
    if (NFTsOwned.length == 0) return false;

    //GET ALL THE COLLECTIONS AVAILABLE FOR AIRDROPS
    try {
      airdropsAvailable = await ProfileQueries.getAirdropsAvailable(address);
    } catch {}
    if (airdropsAvailable.length == 0) return false;

    //GET MATCHES BETWEEN COLLECTIONS AVAILABLE FOR AIRDROPS AND NFTS OWNED
    chainsAvailableForAirdrops.forEach((chain) => {
      //GET NFTS IN A SPECIFIC CHAIN
      NFTsOwned[chain].forEach((NFT) => {
        console.log("NFT.token_address: ", NFT.token_address);

        //GET MATCHES
        airdropsAvailable
          .filter(
            (airdropAvailable) =>
              airdropAvailable.address.toLowerCase() ==
                NFT.token_address.toLowerCase() &&
              airdropAvailable.chain == chain
          )
          .forEach((match) => {
            matches.push({
              addressNFT: match.address,
              idNFT: NFT.token_id,
              address,
              idItem: match.idItem,
              quantity: match.quantity,
              chain,
            });
          });
      });
    });

    console.log("matches: ", matches);

    return matches;
  }

  static async NFTsNotUsedYetForAirdrop(NFTsAvailableForAirdrop) {
    let NFTsUsedForAirdrop;
    let NFTsUsedForAirdropFormatted = {};

    let NFTsCheckedForAirdrop = [];

    //GET ALL THE ALREADY USED COLLECTION AND RELATIVE NFTs_IDs
    try {
      NFTsUsedForAirdrop = await ProfileQueries.getNFTsUsedForAirdrop();
    } catch (err) {
      console.log("Error in NFTsUsedForAirdrop: ", err);
    }

    //CREATE AN OBJECT WITH THE NFTs ALREADY USED FOR AN AIRDROP
    NFTsUsedForAirdrop.forEach((NFT) => {
      //It's a new chain
      NFTsUsedForAirdropFormatted[NFT.chain]
        ? true
        : (NFTsUsedForAirdropFormatted[NFT.chain] = {});
      //It's a new Contract Address
      NFTsUsedForAirdropFormatted[NFT.chain][NFT.addressCollection]
        ? true
        : (NFTsUsedForAirdropFormatted[NFT.chain][NFT.addressCollection] = {});
      //Push "true" in chain.addressContract.nftID
      NFTsUsedForAirdropFormatted[NFT.chain][NFT.addressCollection][
        NFT.idNFT
      ] = true;
    });

    //EXTRACT ALL THE NOT USED NFTS THAT CAN CLAIM AN AIRDROP
    NFTsAvailableForAirdrop.forEach((NFT) => {
      if (
        !NFTsUsedForAirdropFormatted ||
        !NFTsUsedForAirdropFormatted[NFT.chain] ||
        !NFTsUsedForAirdropFormatted[NFT.chain][NFT.addressNFT] ||
        !NFTsUsedForAirdropFormatted[NFT.chain][NFT.addressNFT][NFT.idNFT]
      )
        NFTsCheckedForAirdrop.push(NFT);
    });

    return NFTsCheckedForAirdrop;
  }

  static async setAirdropHistory(NFTsNotUsedYetForAirdrop) {
    let query = `
        INSERT INTO airdrop_history 
        (addressOwner, addressCollection, idNFT, idItem, quantity, chain) 
        VALUES `;

    //BUILD THE QUERY
    NFTsNotUsedYetForAirdrop.forEach((NFT, i) => {
      if (i != 0) query += `, `;

      query += `(
                '${NFT.address}', 
                '${NFT.addressNFT}', 
                '${NFT.idNFT}', 
                ${NFT.idItem},
                ${NFT.quantity},
                '${NFT.chain}'
            ) `;
    });

    let response;
    try {
      response = await ProfileQueries.setAirdropHistory(query);
      console.log("Response in ProfileQueries.setAirdropHistory:", response);
    } catch (err) {
      console.log("Error in ProfileQueries.setAirdropHistory:", err);
      throw err;
    }

    if (!response) return false;
    if (response?.affectedRows == 0) return false;

    return response.affectedRows;
  }

  static async airdropItems(NFTsNotUsedYetForAirdrop) {
    let address = NFTsNotUsedYetForAirdrop[0]?.address;

    //BUILD AN OBJECT WITH ITEM,QUANTITY FOR EACH ITEM
    let itemsToDrop = {};
    NFTsNotUsedYetForAirdrop.forEach((NFT) => {
      if (!itemsToDrop[NFT.idItem]) itemsToDrop[NFT.idItem] = 0;
      itemsToDrop[NFT.idItem] += NFT.quantity;
    });

    //DROP THE ITEMS
    let idItem, quantity;
    for (let key in itemsToDrop) {
      idItem = key;
      quantity = itemsToDrop[key];

      //CHECK IF USER HAS THE ITEM
      let op;
      try {
        op = await FishermanQueries.checkIfUserHasItem(address, idItem);
        logger.debug(
          `FishermanQueries.checkIfUserHasItem response : ${JSON.stringify(op)}`
        );
      } catch (error) {
        logger.error(
          `FishermanQueries.checkIfUserHasItem error : ${Utils.printErrorLog(
            error
          )}`
        );
        throw error;
      }
      //IF THE USER DOESN'T HAVE THE ITEM
      if (op.length == 0) {
        //CREATE THE ITEM
        let create;
        try {
          create =
            await FishermanQueries.createItemInstanceByAddressIdItemQuantity(
              address,
              idItem,
              quantity
            );
          logger.debug(
            `FishermanQueries.createItemInstanceByAddressIdItemQuantity response : ${JSON.stringify(
              create
            )}`
          );
        } catch (error) {
          logger.error(
            `FishermanQueries.createItemInstanceByAddressIdItemQuantity error : ${Utils.printErrorLog(
              error
            )}`
          );
          throw error;
        }
        //IF THE USER ALREADY HAS THE ITEM
      } else {
        let update;
        try {
          update = await FishermanQueries.updateItemInstanceByIdItemInstance(
            op[0].idItemInstance,
            quantity
          );
          logger.debug(
            `FishermanQueries.updateItemInstanceByIdItemInstance response : ${JSON.stringify(
              update
            )}`
          );
        } catch (error) {
          logger.error(
            `FishermanQueries.updateItemInstanceByIdItemInstance error : ${Utils.printErrorLog(
              error
            )}`
          );
          throw error;
        }
      }
    }
  }

  static async getBlessing(address) {
    let blessingResponse = {
      blessingOnGoing: false,
      blessingEndingTime: false,
      blessingDone: false,
    }

    let getBlessing;
    try {
      getBlessing = await ProfileQueries.getBlessing(address);
    } catch (err) {
      throw err;
    }
    //BLESSING NOT ACTIVE
    if (getBlessing.length == 0 || getBlessing[0].length == 0) {
      blessingResponse.blessingOnGoing = false
      return blessingResponse
    };

    //CHECK FOR STATUS
    if (getBlessing[0][0].status == 'running' ) {
      blessingResponse.blessingOnGoing = true
      blessingResponse.blessingEndingTime = getBlessing[0][0].blessingEndingTime
    };
    if (getBlessing[0][0].status == 'done' ) {
      blessingResponse.blessingOnGoing = true
      blessingResponse.blessingDone = true
      blessingResponse.blessingEndingTime = getBlessing[0][0].blessingEndingTime
    };

    return blessingResponse;
  }

  static async getBlessingRewardID(liquidity){
    let getAllBlessingRewards
    try {
      getAllBlessingRewards = await ProfileQueries.getAllBlessingRewards();
    } catch (err) {
      throw err;
    }

    let idBlessingsRewards;
    getAllBlessingRewards?.forEach(reward => {
      if(liquidity >= reward.minLiquidity && liquidity < reward.maxLiquidity){
        idBlessingsRewards = reward.idBlessingsRewards;
        return;
      } 
    })

    return idBlessingsRewards;
  }

  static async dropItem(address, idItem, quantity){
      //CHECK IF USER HAS THE ITEM
      let op;
      try {
        op = await FishermanQueries.checkIfUserHasItem(address, idItem);
        logger.debug(
          `FishermanQueries.checkIfUserHasItem response : ${JSON.stringify(op)}`
        );
      } catch (error) {
        logger.error(
          `FishermanQueries.checkIfUserHasItem error : ${Utils.printErrorLog(
            error
          )}`
        );
        throw error;
      }
      //IF THE USER DOESN'T HAVE THE ITEM
      if (op.length == 0) {
        //CREATE THE ITEM
        let create;
        try {
          create =
            await FishermanQueries.createItemInstanceByAddressIdItemQuantity(
              address,
              idItem,
              quantity
            );
          logger.debug(
            `FishermanQueries.createItemInstanceByAddressIdItemQuantity response : ${JSON.stringify(
              create
            )}`
          );
        } catch (error) {
          logger.error(
            `FishermanQueries.createItemInstanceByAddressIdItemQuantity error : ${Utils.printErrorLog(
              error
            )}`
          );
          throw error;
        }
        //IF THE USER ALREADY HAS THE ITEM
      } else {
        let update;
        try {
          update = await FishermanQueries.updateItemInstanceByIdItemInstance(
            op[0].idItemInstance,
            quantity
          );
          logger.debug(
            `FishermanQueries.updateItemInstanceByIdItemInstance response : ${JSON.stringify(
              update
            )}`
          );
        } catch (error) {
          logger.error(
            `FishermanQueries.updateItemInstanceByIdItemInstance error : ${Utils.printErrorLog(
              error
            )}`
          );
          throw error;
        }
      }

      return true
  }

}

module.exports = { ProfileService };
