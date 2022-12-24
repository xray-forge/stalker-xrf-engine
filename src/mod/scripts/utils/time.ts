import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/time");

/**
 * todo;
 */
export function isInTimeInterval(first: number, second: number): boolean {
  const gameHours: number = level.get_time_hours();

  if (first >= second) {
    return gameHours < second || gameHours >= first;
  } else {
    return gameHours < second || gameHours >= first;
  }
}
