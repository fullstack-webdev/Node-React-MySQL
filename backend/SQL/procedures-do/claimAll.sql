DROP PROCEDURE IF EXISTS claimAll;
DELIMITER $$

CREATE PROCEDURE claimAll()
BEGIN   
	
   
   
	DECLARE exit handler for sqlexception
		BEGIN
		ROLLBACK;
	END;

	DECLARE exit handler for sqlwarning
		BEGIN
		ROLLBACK;
	END;
   
   START TRANSACTION;
	
	UPDATE utente AS u
	SET ancien = ancien + CONVERT((SELECT SUM(`stored`)
							FROM buildings as b1
							WHERE b1.address = u.address
							AND b1.type = 1),DECIMAL(14,2)),
							
	wood = wood + CONVERT((SELECT SUM(`stored`)
							FROM buildings as b1
							WHERE u.address = b1.address
							AND b1.type = 2), DECIMAL(14,2)),
							
	stone = stone + CONVERT((SELECT SUM(`stored`)
							FROM buildings as b1
							WHERE u.address = b1.address
							AND b1.type = 3), DECIMAL(14,2));
                            
	UPDATE buildings 
    SET `stored` = 0;
    
    UPDATE leaderboard 
    SET experience = 0, 
    experienceFisherman = 0;
    
   COMMIT;
   
    

END$$

DELIMITER ;
