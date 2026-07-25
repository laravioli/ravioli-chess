--name: chess_positions
SELECT cp.eco, cp.name, cp.fen
FROM chess_position cp
ORDER BY cp.eco