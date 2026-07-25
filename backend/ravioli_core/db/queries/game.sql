--name: create
INSERT INTO game (game_id, white_id, black_id, status)
VALUES ($1,$2,$3, 'created')