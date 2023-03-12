import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

export function collectLuaGarbage(): void {
  collectgarbage("collect");
}

export function getLuaMemoryUsed(): number {
  return collectgarbage("count");
}
