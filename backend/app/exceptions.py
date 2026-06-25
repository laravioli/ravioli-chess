from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError


class AppException(Exception):
    "Error raised during request handling"

    status = status.HTTP_400_BAD_REQUEST

    def __init__(self, detail: str = "An exception occured during request handling"):
        self.detail = detail


class DBNotFound(AppException):
    status = status.HTTP_404_NOT_FOUND


class InvalidSession(AppException):
    """Exception thrown when user session is invalid"""

    status = status.HTTP_401_UNAUTHORIZED


class InvalidCredentials(AppException):
    status = status.HTTP_401_UNAUTHORIZED


def add_exception_handler(app: FastAPI):
    def exc_handler(request: Request, exc: Any):  # noqa: ARG001
        return JSONResponse({"detail": exc.detail}, status_code=exc.status)

    def exc_integrity_error(request: Request, exc: Any):  # noqa: ARG001
        return JSONResponse({"detail": exc.detail}, status_code=status.HTTP_409_CONFLICT)

    app.add_exception_handler(AppException, exc_handler)
    app.add_exception_handler(IntegrityError, exc_integrity_error)
