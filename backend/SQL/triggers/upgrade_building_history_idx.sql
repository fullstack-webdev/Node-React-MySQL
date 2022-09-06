DELIMITER ;;
CREATE TRIGGER upgrade_building_idx
before INSERT
ON upgrade_building_history FOR EACH row

begin

declare newIdx int;

select ifnull(idx, 0) 
from upgrade_building_history
where upgradeStartTime <> new.upgradeStartTime
order by upgradeStartTime desc 
limit 1
into newIdx;

set new.idx = if(newIdx is null, 0, newIdx + 1) ;

end ;;
DELIMITER ;