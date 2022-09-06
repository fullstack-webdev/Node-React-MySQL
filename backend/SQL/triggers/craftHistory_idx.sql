DELIMITER ;;
CREATE TRIGGER idx
before INSERT
ON craft_history FOR EACH row

begin

declare newIdx int;

select ifnull(idx, 0) 
from craft_history
where craftTime <> new.craftTime
order by craftTime desc 
limit 1
into newIdx;

set new.idx = if(newIdx is null, 0, newIdx + 1) ;

end ;;
DELIMITER ;