#!lua name=raviolib

local function notif_incrby(keys, args)
  for i=1,#keys do
    local hash = keys[i]
    if redis.call("EXISTS", hash) == 1 then
      local counter = redis.call("HGET", hash, "counter")
      local incr = tonumber(args[i])
      if counter then
          redis.call("HSET", hash, "counter", math.max(0, tonumber(counter)+incr))
      elseif args[i] > 0 then
        redis.call("HINCRBY", hash, "temporary", incr)
      end
    end
  end
end

local function notif_get(keys, args)
  local hash = keys[1]
  local counter = redis.call("HGET", hash, "counter")
  local result = nil

  if counter then
    result = tostring(counter)
  else
    --set update to acc increment values
    redis.call("HSETNX", hash, "temporary", 0)
  end
  redis.call("EXPIRE", hash , tonumber(args[1]))
  return result
end

local function notif_set(keys, args)
  -- called only during get_or_set
  -- otherwise write use notif_incrby or invalidation
  local hash = keys[1]
  local update = redis.call('HGET', hash, "temporary")

  if update then
    -- first set win
    redis.call('HSETNX', hash, "counter", tonumber(args[1]) + tonumber(update))
    redis.call('HDEL', hash, "temporary")
  end
end

redis.register_function('notif_incrby', notif_incrby)
redis.register_function('notif_get', notif_get)
redis.register_function('notif_set', notif_set)