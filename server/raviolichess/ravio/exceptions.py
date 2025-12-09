class GameStop(Exception):
    """
    Raised when a game actor wants to stop and close down its application instance.
    """

    pass


class TooManyRetryException(Exception):
    """exception to throw on function wrapped by retry decorator"""
