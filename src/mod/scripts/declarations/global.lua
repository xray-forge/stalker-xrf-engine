local LuaLogger = require("scripts.utils.logging").LuaLogger
local create_ts_class_instance = require("lualib_bundle").__TS__New
local log = create_ts_class_instance(LuaLogger, "global");

-- ---------------------------------------------------------------------------------------------------------------------
-- Extern provided key/value pair to global scope (lua _g)
-- ---------------------------------------------------------------------------------------------------------------------
_G.extern = function (key, value)
  local matches = string.gmatch(key, "[^.]+")
  local target = _G
  local target_key = matches()

  for match in matches do
    if (target[target_key] == nil) then
      target[target_key] = target
    end

    target = target[target_key]
    target_key = match;
    end

  target[target_key] = value
end

-- ---------------------------------------------------------------------------------------------------------------------
-- Get LUA globals from TS
-- ---------------------------------------------------------------------------------------------------------------------
_G.get_global = function(key)
  local matches = string.gmatch(key, "[^.]+")
  local value = _G[matches()];

  for match in matches do
    value = value[match]
  end

  return value;
end
