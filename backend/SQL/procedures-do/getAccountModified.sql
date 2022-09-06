DROP PROCEDURE IF EXISTS getAccountModified;
DELIMITER $$

CREATE PROCEDURE getAccountModified(player varchar(45))
BEGIN   

	DECLARE landInstance INT DEFAULT (SELECT idLandInstance  
				FROM land_guest
				left join land_contract on land_guest.idContract = land_contract.idContract 
				WHERE land_guest.address = player
                AND land_contract.endingTime > current_timestamp);
			
	declare bonus INT default if (landInstance is not null , (select
																bonus 
																from land left join land_instance on land.idLand = land_instance.idLand 
																where idLandInstance = landInstance), 0);
																
	declare land_type varchar(150) default if (landInstance is not null,(select type from land left join land_instance on land.idLand = land_instance.idLand 
																where idLandInstance = landInstance) , 0);
	declare boostedType INT;

	declare lc DATETIME(6);
	
	declare dropQT FLOAT;
																
	declare fee INT default if ((select type from land_guest where address = player) <> 'free', (select fee 
																from land_contract left join land_guest  on land_contract.idContract  = land_guest.idContract  
																where idLandInstance = landInstance and contractStatus = 'active'), 0);												
	
	
	DECLARE bld_upgradedId INT DEFAULT (SELECT id 
				FROM buildings 
				WHERE upgradeStatus = 1
				AND endingTime < current_timestamp
				AND address = player);

	/*Calcolo experience if upgrade started after reset*/
	DECLARE upgradeTime INT DEFAULT (SELECT upgradeTime 
							FROM buildings as b
							LEFT JOIN upgrade u
								ON (b.level) + 1 = u.level AND b.type = u.type
							WHERE b.id = bld_upgradedId);
							
							
	DECLARE bld_typeInit INT DEFAULT (SELECT type 
		FROM buildings
		WHERE stake = 1
		AND upgradeStatus = 1
		AND endingTime < current_timestamp
		AND address = player);
        
	DECLARE bld_type INT DEFAULT IF(bld_typeInit IS NOT NULL, bld_typeInit, 0);
    
	DECLARE bld_upgradedDropInit FLOAT DEFAULT (SELECT (dropQuantity/3600) * upgradeTime
								FROM buildings 
								WHERE stake = 1
								AND upgradeStatus = 1
								AND endingTime < current_timestamp
								AND address = player);
                                
	DECLARE bld_upgradedDrop FLOAT DEFAULT IF(bld_upgradedDropInit IS NOT NULL, bld_upgradedDropInit, 0);
                                
    DECLARE bld_upgradedNewCapacityInit INT DEFAULT (SELECT u.newCapacity 
			FROM buildings as b
            LEFT JOIN upgrade as u
            ON (b.level) + 1 = u.level AND b.type = u.type
            WHERE upgradeStatus = 1
            AND endingTime < current_timestamp
            AND address = player);
		
	DECLARE bld_upgradedNewCapacity INT DEFAULT IF(bld_upgradedNewCapacityInit IS NOT NULL, bld_upgradedNewCapacityInit, 0);
            
    DECLARE bld_upgradedNewDropQuantityInit FLOAT DEFAULT (SELECT u.newDropQuantity
			FROM buildings as b
            LEFT JOIN upgrade as u
            ON (b.level) + 1 = u.level AND b.type = u.type
            WHERE upgradeStatus = 1
            AND endingTime < current_timestamp
            AND address = player);
	
    DECLARE bld_upgradedNewDropQuantity FLOAT DEFAULT IF(bld_upgradedNewDropQuantityInit IS NOT NULL, bld_upgradedNewDropQuantityInit, 0);
    
    declare bonusProduction FLOAT;
            
	
			
	DECLARE upgradeStartingTime DATETIME(6) DEFAULT (SELECT DATE_SUB(endingTime, INTERVAL upgradeTime SECOND) 
													FROM buildings as b
                                                    WHERE b.id = bld_upgradedId);
	
	DECLARE LEADERBOARDRESET DATETIME(6) DEFAULT '2022-07-13 14:00:00.000000';
	
    DECLARE baseUriReveal varchar(150) default 'https://ancient-society.s3.eu-central-1.amazonaws.com/reveal/';
    DECLARE baseUriSprite varchar(150) default 'https://ancient-society.s3.eu-central-1.amazonaws.com/sprite/';
   
	DECLARE exit handler for sqlexception
		BEGIN
		ROLLBACK;
	END;

	DECLARE exit handler for sqlwarning
		BEGIN
		ROLLBACK;
	END;
   
	set boostedType = case when land_type = 'forest' then 2
						when land_type = 'mountain' then 3
						else null
					end;
	set dropQt = (select dropQuantity  from buildings where stake = 1 and address = player and type = boostedType);

	set lc = (select lastClaim  from buildings where type = boostedType and stake = 1 and address = player );

	/* ENSURE NULL */
    set bonus = coalesce(bonus, 0);
    set fee = coalesce(fee, 0);
    set lc = coalesce(lc, current_timestamp);
    set dropQt = coalesce(dropQt, 0);
    
   START TRANSACTION;
  
  
	
        
	IF bld_upgradedId IS NOT NULL THEN
    
		IF LEADERBOARDRESET < upgradeStartingTime THEN 
		
			UPDATE leaderboard
				SET experience = IF(experience IS NULL, 0, experience) + 
				IF(bld_type = 1, 4, IF(bld_type = 2, 1, IF(bld_type = 3, 3, 0))) * bld_upgradedDrop
				WHERE address = player;
		END IF;
    
		UPDATE buildings
			SET upgradeFirstLogin = true,
			upgradeStatus = false, 
			level = level + 1,
			capacity = bld_upgradedNewCapacity, 
			dropQuantity = bld_upgradedNewDropQuantity, 
			lastClaim = endingTime,
			lastClaimAction = IF(endingTime > LEADERBOARDRESET, endingTime, lastClaimAction)

			WHERE id = bld_upgradedId
			AND upgradeStatus = true;
            
	END IF;
        
	/*NEEDED TO UPDATE BOOSTED BUILDINGS */
	if landInstance is not null then 
		UPDATE buildings
		SET `stored` = IF(
			(`stored` + ((dropQuantity+(dropQuantity*bonus/100)-((dropQuantity*bonus/100)*fee/100))/3600) * timestampdiff(second, lastClaim, current_timestamp)) > capacity, 
			capacity, 
			(`stored` + ((dropQuantity+(dropQuantity*bonus/100)-((dropQuantity*bonus/100)*fee/100))/3600) * timestampdiff(second, lastClaim, current_timestamp))
		),
		lastClaim = current_timestamp()
		WHERE stake = 1
		AND upgradeStatus = 0
		AND type = boostedType
		AND address = player;
		
		
		
	else
		
		UPDATE buildings
		SET `stored` = IF(
			(`stored` + (dropQuantity/3600) * timestampdiff(second, lastClaim, current_timestamp)) > capacity, 
			capacity, 
			(`stored` + (dropQuantity/3600) * timestampdiff(second, lastClaim, current_timestamp))
		),
		lastClaim = current_timestamp()
		WHERE stake = 1
		AND upgradeStatus = 0
		AND type <> 4
		AND address = player;
		
	
	end if;
	/*NEEDED TO UPDATE NOT BOOSTED BUILDINGS */
	if landInstance is not null then 
		
		UPDATE buildings
		SET `stored` = IF(
			(`stored` + (dropQuantity/3600) * timestampdiff(second, lastClaim, current_timestamp)) > capacity, 
			capacity, 
			(`stored` + (dropQuantity/3600) * timestampdiff(second, lastClaim, current_timestamp))
		),
		lastClaim = current_timestamp()
		WHERE stake = 1
		AND upgradeStatus = 0
		AND type <> 4
		and type <> boostedType
		AND address = player;
	end if ;
	/*NEEDED TO UPDATE LAND OWNER'S STORAGE */
	if landInstance is not null then 
		
		UPDATE land_instance 
		SET storage = storage + ((((dropQt*bonus/100)*fee/100)/3600) * timestampdiff(second, lc, current_timestamp))  
			where idLandInstance = landInstance;
	end if;
        
	SELECT b.id, b.type, b.level, b.name, b.description, b.stake,
		b.capacity, b.dropQuantity, b.dropInterval, b.address, b.idBuilding, b.moreInfo,
		b.upgradeStatus, b.endingTime, b.upgradeFirstLogin, b.stored,
		b.lastClaim, b.bundle, b.position, b.cursed, b.idToolInstance,

		u.ancien, u.wood, u.stone, u.level as upgradeLevel, u.newCapacity,
		u.newDropQuantity, u.upgradeTime, u.newDescription, u.newMoreInfo,

		 concat(concat(concat(concat(concat(
		concat(baseUriReveal, LOWER(REPLACE(b.name, ' ', '')) )
		, '/'), b.level),'-'), IF(i.idSkin IS NULL, 1, i.idSkin)), IF(NOT b.bundle, '.jpg','-bundle.jpg')) as imageURL,
		 
		concat(concat(concat(concat(concat(
		concat(baseUriReveal, LOWER(REPLACE(b.name, ' ', '')) )
		, '/'), u.level),'-'), IF(i.idSkin IS NULL, 1, i.idSkin)), IF(NOT b.bundle, '.jpg','-bundle.jpg')) as upgradeImage,


		concat(baseUriSprite, IF(b.upgradeStatus, 'upgrade/spriteUpgrade.webp', 
		concat(concat(concat( LOWER(REPLACE(b.name, ' ', '')), '/'), b.level), '.webp')  )) as imageSprite


		FROM buildings as b
		LEFT JOIN upgrade u
			ON (b.level) + 1 = u.level AND b.type = u.type
		LEFT JOIN inventario as i
			ON b.id = i.idBuilding

		WHERE address = player;
        
   COMMIT;
   
    

END$$

DELIMITER ;
