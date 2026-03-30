from core.ipc.structs import TaggedMsg

type Payload = str | int


class FriendRequest(TaggedMsg, tag="notif_friend_request"):
    data: Payload
