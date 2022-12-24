import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/ram");

export function collectLuaGarbage(): void {
  collectgarbage("collect");
}

export function getLuaMemoryUsed(): number {
  return collectgarbage("count");
}
