DROP PROCEDURE IF EXISTS rewardLeaderboardGeneral;
DELIMITER $$

CREATE PROCEDURE rewardLeaderboardGeneral(
	itemSpecial int,
    itemNormal int, 
    quantityMaxSpecial int, 
    quantityMiddleSpecial int, 
    quantitySmallSpecial int, 
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
		SELECT address, itemSpecial as idItem, 0 as quantity
		FROM leaderboard
		ORDER BY experience DESC
        LIMIT 3;
        
        INSERT IGNORE INTO item_instance
			(address, idItem, quantity)
		SELECT address, itemNormal as idItem, 0 as quantity
		FROM leaderboard
		ORDER BY experience DESC
        LIMIT 100;
        
        /* SPECIAL DROP TO THE FIRST*/
        UPDATE item_instance
        SET 
			quantity = quantity + quantityMaxSpecial
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experience DESC
                        limit 1 OFFSET 0) AS temp)
		AND idItem = itemSpecial;
                        
		/* SPECIAL DROP TO THE SECOND*/              
		UPDATE item_instance
        SET 
			quantity = quantity + quantityMiddleSpecial
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experience DESC
                        limit 1 OFFSET 1) AS temp)
		AND idItem = itemSpecial;
		
        /* SPECIAL DROP TO THE THIRD*/
		UPDATE item_instance
        SET 
			quantity = quantity + quantitySmallSpecial
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experience DESC
                        limit 1 OFFSET 2) AS temp)
		AND idItem = itemSpecial;
		
        /* NORMAL DROP TO THE FIRST*/
        UPDATE item_instance
        SET 
			quantity = quantity + quantityMaxNormal
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experience DESC
                        limit 25 OFFSET 0) AS temp)
		AND idItem = itemNormal;
		
        /* NORMAL DROP TO THE SECOND*/
		UPDATE item_instance
        SET 
			quantity = quantity + quantityMiddleNormal
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experience DESC
                        limit 25 OFFSET 25) AS temp)
		AND idItem = itemNormal;
                        
		/* NORMAL DROP TO THE THIRD*/
		UPDATE item_instance
        SET 
			quantity = quantity + quantitySmallNormal
		WHERE
			address in (SELECT * FROM (SELECT address 
						FROM leaderboard
						ORDER BY experience DESC
                        limit 50 OFFSET 100) AS temp)
		AND idItem = itemNormal;
        
	    COMMIT;
   
    

END$$

DELIMITER ;
