import { game, time_global, verify_if_thread_is_running } from "xray16";

import { Optional, TDuration, TTimestamp } from "@/engine/lib/types";

/**
 * Lock scripts execution based on game time.
 */
export function waitGame(timeToWait: Optional<TDuration> = null): void {
  verify_if_thread_is_running();

  if (timeToWait === null) {
    coroutine.yield();
  } else {
    const timeToStop: TTimestamp = game.time() + timeToWait;

    while (game.time() <= timeToStop) {
      coroutine.yield();
    }
  }
}

/**
 * Lock scripts execution based on real time.
 */
export function wait(timeToWait: Optional<TDuration> = null): void {
  verify_if_thread_is_running();

  if (timeToWait === null) {
    coroutine.yield();
  } else {
    const timeToStop: TTimestamp = time_global() + timeToWait;

    while (time_global() <= timeToStop) {
      coroutine.yield();
    }
  }
}
