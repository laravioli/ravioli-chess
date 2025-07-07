FROM python:3.12.3-slim-bullseye AS base

WORKDIR /usr/local/app
RUN mkdir -p /usr/client/dist
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

FROM base AS backend-dev
EXPOSE 8000
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

ENTRYPOINT ["python3"] 
CMD ["manage.py", "runserver", "0.0.0.0:8000"]