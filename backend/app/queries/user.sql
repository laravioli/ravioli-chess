
--name: get_user
select ua.* 
from user_account as ua
where ua.id = $1