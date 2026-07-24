--name: unread_count
SELECT count(*) AS unread_count
FROM notification n
WHERE n.receiver_id = $1
AND n.read = false