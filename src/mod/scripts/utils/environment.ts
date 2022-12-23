export function isLua51(): boolean {
  return _VERSION !== null && lua_string.find(_VERSION, "Lua 5.1", 1, true) !== null;
}
