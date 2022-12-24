import { Optional } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/time");

/**
 * todo;
 */
export function isInTimeInterval(hoursFirst: number, hoursSecond: number): boolean {
  const gameHours: number = level.get_time_hours();

  if (hoursFirst >= hoursSecond) {
    return gameHours < hoursSecond || gameHours >= hoursFirst;
  } else {
    return gameHours < hoursSecond && gameHours >= hoursFirst;
  }
}

/**
 * todo;
 */
export function waitGame(timeToWait: Optional<number> = null): void {
  verify_if_thread_is_running();

  if (timeToWait === null) {
    coroutine.yield();
  } else {
    const time_to_stop = game.time() + timeToWait;

    while (game.time() <= time_to_stop) {
      coroutine.yield();
    }
  }
}

/**
 * todo;
 */
export function wait(timeToWait: Optional<number> = null): void {
  verify_if_thread_is_running();

  if (timeToWait === null) {
    coroutine.yield();
  } else {
    const time_to_stop = time_global() + timeToWait;

    while (time_global() <= time_to_stop) {
      coroutine.yield();
    }
  }
}
