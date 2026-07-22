
--name: by_id
--args: user_id::uuid
select ua.*
from user_account as ua
where ua.id = $1

--name: by_username
--args: username::text
select ua.*
from user_account as ua
where ua.username  = $1

--name: by_id_with_pref
--args: user_id::uuid
select ua.*, up as preference
from user_account ua join user_preference up on ua.id = up.user_id
where ua.id = $1

--name: by_username_with_pref
--args: username::text
select ua.*, up as preference
from user_account ua join user_preference up on ua.id = up.user_id
where ua.username = $1


--name: by_username_with_friendship
--args: current_user::uuid, friend_username::text
select ua as user, f as friendship
from user_account ua left outer join friendship f
on least(f.sender_id, f.receiver_id) = least($1, ua.id) and greatest(f.sender_id, f.receiver_id) = greatest($1, ua.id)
where ua.username = $2

--name: search
--args: user_search::text, limit::number
select ua.id, ua.username 
from user_account ua
where ua.username ^@ $1
order by ua.username
limit $2