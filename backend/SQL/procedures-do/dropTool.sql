DROP PROCEDURE IF EXISTS dropTool;
DELIMITER $$

CREATE PROCEDURE dropTool(player_ VARCHAR(45), toolLevel_ INT, toolQuantity_ INT)
BEGIN   

    DECLARE _i INT DEFAULT 0; 
    DECLARE _idTool INT DEFAULT 
    (
        SELECT idTool 
        FROM tool_level 
        WHERE idToolLevel = toolLevel_
    ); 
    DECLARE _durabilityTool INT DEFAULT 
    (
        SELECT durabilityTotal
        FROM tool_level
        WHERE idToolLevel = toolLevel_
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

        WHILE (_i < toolQuantity_) DO

            INSERT INTO tool_instance 
                (idToolLevel, idTool, durability, address, equipped) 
            VALUES 
                (toolLevel_, _idTool, _durabilityTool, player_, 0);

            SET _i = _i + 1;

        END WHILE;
    
   COMMIT;

END$$

DELIMITER ;

