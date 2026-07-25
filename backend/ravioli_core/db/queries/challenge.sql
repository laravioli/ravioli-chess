--name: list
--param: user_id: UUID
SELECT ch.challenge_id, ch.status, ch.color_choice, ch.color, ch.initial_fen, ch.pub_date, ch.time_control, ub AS sender, ub2 AS receiver
FROM challenge ch LEFT OUTER JOIN user_base ub ON ch.sender_id = ub.id LEFT OUTER JOIN user_base ub2 ON ch.receiver_id = ub2.id
WHERE ch.sender_id = $1 OR ch.receiver_id = $1
ORDER BY ch.pub_date DESC

--name: create
INSERT INTO challenge (challenge_id, sender_id, receiver_id, color_choice, color, time_control)
VALUES ($1,$2,$3,$4,$5,$6)