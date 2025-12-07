# a Lobby instance represent the room before
# the game start
# lifetime -> a user wants to play -> create a lobby
# the lobby is full -> game start
# it is tied to a websocket consumer.
# it means -> a refresh clear the lobby
# so either the lobby is full or either the websocket is closed
# i need to handle timing issue -> maybe the user refresh is page, while the second user enter
# ok , maybe i need to move the lobby in game server
# so it would determine the affinity
# state user IN -> good until that game start 
# if the game start 
class Lobby:
    pass
