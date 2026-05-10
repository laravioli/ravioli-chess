#!lua name=raviolib

local function notif_incrby(keys, args)
  local hash = keys[1]

  if redis.call("EXISTS", hash) == 0 then 
    return false
  end

  local incr = tonumber(args[1])
  local counter = redis.call("HGET", hash, "counter")

  if counter then
    redis.call("HINCRBY", hash, "counter", incr)
  else
    redis.call("HINCRBY", hash, "update", incr)
  end
  return true
end

local function notif_get(keys, args)
  local hash = keys[1]
  local counter = redis.call("HGET", hash, "counter")
  local result = nil
  
  if counter then
    -- Return as string for the Python driver
    result = tostring(counter)
  else
    if redis.call("HEXISTS", hash, "update") == 0 then
          redis.call("HSET", hash, "update", 0)
    end
    -- Redis will return a Null Bulk Reply, Python gets None
  end

  local ex = tonumber(args[1])
  redis.call("EXPIRE", hash , ex)
  return result 
end

local function notif_set(keys, args)
  local hash = keys[1]
  local update = tonumber(redis.call('HGET', hash, "update")) or 0
  local new_val = tonumber(args[1]) + update

  redis.call('HSET', hash, "counter", new_val)
  redis.call('HDEL', hash, "update")

  local ex = tonumber(args[2])
  redis.call('EXPIRE', hash, ex)
  return tostring(new_val)
end

redis.register_function('notif_incrby', notif_incrby)
redis.register_function('notif_get', notif_get)
redis.register_function('notif_set', notif_set)