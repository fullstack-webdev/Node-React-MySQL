DROP PROCEDURE IF EXISTS getAccountCity;
DELIMITER $$

CREATE PROCEDURE getAccountCity(player varchar(45))
BEGIN
		
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
	
        
	SELECT b.id, b.type, b.level, b.name, b.description, b.stake,
		b.address, b.idBuilding, b.moreInfo,b.level,
		b.upgradeStatus, b.bundle, b.position, b.cursed,

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

		WHERE address = player and stake = 1;
        
   COMMIT;
   
    

END$$

DELIMITER ;
