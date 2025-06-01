FROM python:3.12.3-slim-bullseye AS base

WORKDIR /usr/local/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

FROM base AS backend-dev
EXPOSE 8000
RUN --mount=type=cache,target=/usr/local/share/.cache/pip \
    --mount=type=bind,source=requirements.txt,target=requirements.txt \
    python -m pip install -r requirements.txt
ENTRYPOINT ["python3"] 
CMD ["manage.py", "runserver", "0.0.0.0:8000"]