--name: list
--param: user_id: UUID
SELECT *
FROM challenge ch
WHERE ch.sender_id = $1 OR ch.receiver_id = $1
ORDER BY ch.pub_date DESC

--name: create
INSERT INTO challenge (challenge_id, sender_id, receiver_id, color_choice, color, time_control)
VALUES ($1,$2,$3,$4,$5,$6)