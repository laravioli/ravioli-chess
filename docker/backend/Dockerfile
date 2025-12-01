FROM python:3.12.3-slim-bullseye AS base

WORKDIR /usr/local/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

FROM base AS backend-dev
EXPOSE 8000
COPY requirements.txt ./
RUN --mount=type=cache,target=/root/.cache/pip \
pip install -r requirements.txt

RUN mkdir -p /usr/local/client/dist
COPY manage.py ./

ENTRYPOINT ["uvicorn"]
CMD ["raviolichess.asgi:app", "--reload", "--host", "backend", "--port", "8000","--ws","websockets-sansio"]