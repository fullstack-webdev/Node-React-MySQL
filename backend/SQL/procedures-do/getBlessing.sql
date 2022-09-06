DROP PROCEDURE IF EXISTS getBlessing;
DELIMITER $$

CREATE PROCEDURE getBlessing()
BEGIN   
	
   
   
	DECLARE blessing_onGoing_status VARCHAR(15) DEFAULT 
    (SELECT status 
		FROM blessings 
		WHERE address = player
        AND (status='running' OR  status='done') 
	);
    
	DECLARE blessing_onGoing_EndingTime DATETIME(6) DEFAULT 
    (SELECT blessingEndingTime 
		FROM blessings 
		WHERE address = player
        AND (status='running' OR  status='done') 
	);
    


	DECLARE exit handler for sqlexception
		BEGIN
		ROLLBACK;
	END;

	DECLARE exit handler for sqlwarning
		BEGIN
		ROLLBACK;
	END;
    
    
   
   START TRANSACTION;
	
    /*IF THE ADDRESS HAS AT LEAST ON BLESSING RUNNING OR DONE*/
	IF blessing_onGoing_status = 'running' THEN 
		/*CHECK IF THE BLESSING ENDING_TIME IS OVERDUE*/
        IF current_timestamp > blessing_onGoing_EndingTime THEN 
			UPDATE blessings
			SET status = 'done'
			WHERE address = player AND status = 'running';
        END IF;
	END IF;
    
	/*RETURN THE BLESSING DATA*/
	SELECT * FROM blessings
	WHERE address = player
    AND (status='running' OR  status='done');
        
   COMMIT;
    
END$$

DELIMITER ;