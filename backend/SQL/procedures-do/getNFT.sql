DROP PROCEDURE IF EXISTS getNFT;
DELIMITER $$

CREATE PROCEDURE getNFT(player varchar(45), idBld int(11), bldType int(11))
BEGIN   
	DECLARE bld_upgradedId INT DEFAULT (SELECT id 
			FROM buildings 
            WHERE upgradeStatus = 1
            AND endingTime < current_timestamp
            AND address = player
            AND idBuilding  = idBld
            AND type = bldType);
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
    
    
            
	
			
	DECLARE upgradeStartingTime DATETIME(6) DEFAULT (SELECT DATE_SUB(endingTime, INTERVAL upgradeTime SECOND) 
													FROM buildings as b
                                                    WHERE b.id = bld_upgradedId);
	
	DECLARE LEADERBOARDRESET DATETIME(6) DEFAULT '2022-06-29 14:40:00.000000';
	
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
			lastClaim = endingTime

			WHERE id = bld_upgradedId
			AND upgradeStatus = true
			;
	END IF;
        
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
		AND address = player
        AND idBuilding  = idBld
        AND type = bldType;
        
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

		WHERE address = player
		AND address = player
        AND b.idBuilding  = idBld
        AND b.type = bldType;
        
   COMMIT;
   
    
END$$

DELIMITER ;
