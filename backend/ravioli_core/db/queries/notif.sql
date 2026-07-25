--name: get_notifications
SELECT n.*,uas.username AS sender
FROM notification n 
JOIN user_account uas ON n.sender_id = uas.id
WHERE n.receiver_id = $1
ORDER BY n.created_at DESC

--name: unread_count
SELECT count(*) AS unread_count
FROM notification n
WHERE n.receiver_id = $1
AND n.read = false

--name: mark_all_read
UPDATE notification n
SET "read" = true
WHERE n.receiver_id = $1 AND n."read" = false

--name: delete_all
DELETE FROM notification n
WHERE n.receiver_id = $1