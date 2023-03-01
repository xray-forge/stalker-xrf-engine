local LuaLogger = require("scripts.utils.logging").LuaLogger
local create_ts_class_instance = require("lualib_bundle").__TS__New
local log = create_ts_class_instance(LuaLogger, "global");

-- ---------------------------------------------------------------------------------------------------------------------
-- With TS we are using mostly locals to prevent scope pollution
-- If explicit global declaration is needed, we can use this utility function and declare something as global from TS
-- ---------------------------------------------------------------------------------------------------------------------
_G.declare_global = function (key, value)
  local matches = string.gmatch(key, "[^.]+")
  local target = _G
  local target_key = matches()

  for match in matches do
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
