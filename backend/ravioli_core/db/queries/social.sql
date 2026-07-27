--name: create_request
--param: sender_id: UUID
--param: receiver_id: UUID
WITH new_friendship AS (
    INSERT INTO friendship (sender_id, receiver_id, status)
    VALUES ($1,$2,'pending')
    RETURNING sender_id, receiver_id, id
)
INSERT INTO notification (sender_id, receiver_id, friendship_id, type)
SELECT sender_id, receiver_id, id, 'friend_request' FROM new_friendship

--name: accept_request
--param: sender_id: UUID
--param: receiver_id: UUID
WITH accepted_friendship AS (
    UPDATE friendship f
    SET status = 'accepted'
    WHERE f.sender_id = $1 AND f.receiver_id = $2 AND f.status = 'pending'
    RETURNING f.receiver_id, f.sender_id, f.id
), cleanup AS (
    DELETE FROM notification n
    USING accepted_friendship af
    WHERE n.friendship_id = af.id AND n.type ='friend_request'
)
INSERT INTO notification (sender_id, receiver_id, friendship_id, type)
SELECT receiver_id, sender_id, id, 'friend_request_accepted' FROM accepted_friendship

--name: delete_request
--param: sender_id: UUID
--param: receiver_id: UUID
DELETE FROM friendship f
WHERE f.sender_id = $1 AND f.receiver_id = $2 and f.status ='pending'
RETURNING f.id

--name: list_friendship
--param: user_id: UUID
--param: status: FriendshipStatus
SELECT ua.id, ua.username, uf.last_update, uf.direction
FROM user_account ua
JOIN (
    SELECT friendship.receiver_id AS friend_id, friendship.last_update AS last_update, 'outgoing' AS direction
    FROM friendship
    WHERE friendship.sender_id = $1 AND friendship.status = $2
        UNION ALL
    SELECT friendship.sender_id AS friend_id, friendship.last_update AS last_update, 'incoming' AS direction
    FROM friendship
    WHERE friendship.receiver_id = $1 AND friendship.status = $2) AS uf
ON ua.id = uf.friend_id
ORDER BY uf.last_update DESC

--name: delete_friend
--param: current_user_id: UUID
--param: target_id: UUID
DELETE FROM friendship f
WHERE f.status = 'accepted'
AND least(f.sender_id, f.receiver_id) = least($1::uuid, $2::uuid) 
AND greatest(f.sender_id, f.receiver_id) = greatest($1::uuid, $2::uuid)
RETURNING f.id