DROP PROCEDURE IF EXISTS rewardLeaderboardFisherman;
DELIMITER $$

CREATE PROCEDURE rewardLeaderboardFisherman(
    itemNormal int,
    quantityMaxNormal int,
    quantityMiddleNormal int,
    quantitySmallNormal int
)

BEGIN
   
	DECLARE exit handler for sqlexception
		BEGIN
		ROLLBACK;
	END;
   
   START TRANSACTION;
	
       
        
        INSERT IGNORE INTO item_instance
			(address, idItem, quantity)
		SELECT address, itemNormal as idItem, 0 as quantity
		FROM leaderboard
		ORDER BY experienceFisherman DESC
        LIMIT 50;
        
        
        /* NORMAL DROP TO THE FIRST*/
        UPDATE item_instance
        SET 
			quantity = quantity + quantityMaxNormal
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experienceFisherman DESC
                        limit 10 OFFSET 0) AS temp)
		AND idItem = itemNormal;
		
        /* NORMAL DROP TO THE SECOND*/
		UPDATE item_instance
        SET 
			quantity = quantity + quantityMiddleNormal
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experienceFisherman DESC
                        limit 15 OFFSET 10) AS temp)
		AND idItem = itemNormal;
                        
		/* NORMAL DROP TO THE THIRD*/
		UPDATE item_instance
        SET 
			quantity = quantity + quantitySmallNormal
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experienceFisherman DESC
                        limit 25 OFFSET 25) AS temp)
		AND idItem = itemNormal;
        
	    COMMIT;
   
    

END$$

DELIMITER ;
