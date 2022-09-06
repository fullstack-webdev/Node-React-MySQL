DELIMITER ;;
CREATE TRIGGER upgrade_tool_idx
before INSERT
ON upgrade_tool_history FOR EACH row

begin

declare newIdx int;

select ifnull(idx, 0) 
from upgrade_tool_history
where upgradeTime <> new.upgradeTime
order by upgradeTime desc 
limit 1
into newIdx;

set new.idx = if(newIdx is null, 0, newIdx + 1) ;

end ;;
DELIMITER ;