DROP PROCEDURE IF EXISTS resetLeaderboard;
DELIMITER $$

CREATE PROCEDURE resetLeaderboard()
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
   
   
	/*finire e fixare*/
                            
	UPDATE buildings 
    SET lastClaimStored = 0,
	lastClaimAction = '2022-07-14 14:00:00.000000';
    
    UPDATE leaderboard 
    SET experience = 0, 
    experienceFisherman = 0;
    
   COMMIT;
    
END$$

DELIMITER ;