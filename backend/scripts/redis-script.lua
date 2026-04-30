#!lua name=raviolib

local function incrby_xx_ex(keys, args)

  local key = keys[1]
  if redis.call('EXISTS', key) == 0 then return -1 end
  local current_count = redis.call('INCRBY', key, args[1])
  redis.call('EXPIRE', key, args[2])
  return current_count
end

redis.register_function('rav_incrby', incrby_xx_ex)