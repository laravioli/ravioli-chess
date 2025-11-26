from urllib.parse import parse_qsl
from django.core.signing import BadSignature
from raviolichess.profile.models import Profile
from raviolichess.profile.serializers import ProfileSerializer

PIECE_VARS = {
    "---white-pawn": "wP",
    "---black-pawn": "bP",
    "---white-knight": "wN",
    "---black-knight": "bN",
    "---white-bishop": "wB",
    "---black-bishop": "bB",
    "---white-rook": "wR",
    "---black-rook": "bR",
    "---white-queen": "wQ",
    "---black-queen": "bQ",
    "---white-king": "wK",
    "---black-king": "bK",
}


def base_context(request):
    """compute global context"""
    if request.user.is_authenticated:
        profile = request.user.profile.to_dict()
    else:
        # anon profile based on a signed cookie
        profile = Profile.default_profile()
        try:
            cookie = request.get_signed_cookie("anon", False)
        except BadSignature:
            request.delete_cookie("anon")
            cookie = False
        if cookie:
            data = dict(parse_qsl(cookie))
            serializer = ProfileSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            profile.update(serializer.validated_data)

    return {
        "profile": profile,
        "pieces": PIECE_VARS,
    }
