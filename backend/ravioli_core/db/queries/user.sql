
--name: by_id
--param: user_id: UUID
SELECT ua.*
FROM user_account AS ua
WHERE ua.id = $1

--name: by_username
--param: username: str
SELECT ua.*
FROM user_account AS ua
WHERE ua.username  = $1

--name: by_id_full
--param: user_id: UUID
SELECT ua.*, up AS preference
FROM user_account ua join user_preference up ON ua.id = up.user_id
WHERE ua.id = $1

--name: by_username_full
--param: username: str
SELECT ua.*, up AS preference
FROM user_account ua join user_preference up ON ua.id = up.user_id
WHERE ua.username = $1


--name: by_username_profile
--param: user_id: UUID
--param: username: str
SELECT ua AS user, f AS friendship
FROM user_account ua LEFT OUTER JOIN friendship f
ON least(f.sender_id, f.receiver_id) = least($1, ua.id) 
AND greatest(f.sender_id, f.receiver_id) = greatest($1, ua.id)
WHERE ua.username = $2

--name: search
--param: search_query: str
--param: limit: int
SELECT ua.id, ua.username
FROM user_account ua
WHERE ua.username ^@ $1
ORDER BY ua.username
LIMIT $2

--name: insert
INSERT INTO user_account (username, email, hashed_password)
VALUES ($1,$2,$3)
RETURNING id

--name: insert_admin
INSERT INTO user_account (username, email, hashed_password, is_staff)
VALUES ($1,$2,$3,true)
RETURNING id

--name: delete
DELETE FROM user_account
WHERE user_account.id = $1