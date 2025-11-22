# r.zadd("online_users", {user_id: time.time()}) heartbeat client update his presence
# online_count = r.zcount("online_users", time.time() - 60, "+inf") fetch count from redis
# from celery import Celery
# import redis
# import time

# app = Celery("tasks", broker="redis://localhost:6379/0")

# @app.task
# def clean_expired_users():
#    r = redis.Redis()
#    cutoff = time.time() - 60
#    r.zremrangebyscore("online_users", 0, cutoff)
# fuck it go for celery
