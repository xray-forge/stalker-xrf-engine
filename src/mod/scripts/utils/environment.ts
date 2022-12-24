export function isLua51(): boolean {
  return _VERSION !== null && string.find(_VERSION, "Lua 5.1", 1, true) !== null;
}
