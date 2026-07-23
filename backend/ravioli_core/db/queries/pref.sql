--name: insert
INSERT INTO user_preference (board,pieceset,user_id)
VALUES ($1,$2,$3)