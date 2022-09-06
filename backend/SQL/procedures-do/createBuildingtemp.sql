DROP PROCEDURE IF EXISTS createBuildingtemp;
DELIMITER $$

CREATE PROCEDURE createBuildingtemp()
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
        
	
    INSERT INTO buildingtemp (address, type, quantity, saleTime, status) 
        SELECT 
            address, 1 as type, quantity, current_timestamp, 1 as status
        FROM 
            item_instance as i_in
        WHERE 
            i_in.quantity > 0
        AND
            idItem = 1001

    UNION 

        SELECT 
            address, 2 as type, quantity, current_timestamp, 1 as status
        FROM 
            item_instance as i_in
        WHERE 
            i_in.quantity > 0
        AND
            idItem = 1002

    UNION 

        SELECT 
            address, 3 as type, quantity, current_timestamp, 1 as status
        FROM 
            item_instance as i_in
        WHERE 
            i_in.quantity > 0
        AND
            idItem = 1003

    UNION 
        SELECT 
            address, 4 as type, quantity, current_timestamp, 1 as status
        FROM 
            item_instance as i_in
        WHERE 
            i_in.quantity > 0
        AND
            idItem = 3010

    UNION 
        SELECT 
            address, 1000 as type, quantity, current_timestamp, 1 as status
        FROM 
            item_instance as i_in
        WHERE 
            i_in.quantity > 0
        AND
            idItem = 1004
    ;

    UPDATE
        item_instance
    SET 
        quantity = 0
    WHERE 
        quantity > 0
    AND
        (
            idItem = 1001
        OR 	idItem = 1002
        OR 	idItem = 1003
        OR 	idItem = 3010
        OR  idItem = 1004
        )
    ;

    
   COMMIT;
   
    

END$$

DELIMITER ;

