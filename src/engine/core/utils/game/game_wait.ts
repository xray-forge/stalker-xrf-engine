import { game, time_global, verify_if_thread_is_running } from "xray16";
import { Nillable, TDuration, TTimestamp } from "xray16/lib";
import { $isNil } from "xray16/macros";

/**
 * Lock scripts execution based on game time.
 */
export function waitGame(timeToWait: Nillable<TDuration> = null): void {
  verify_if_thread_is_running();

  if ($isNil(timeToWait)) {
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
export function wait(timeToWait: Nillable<TDuration> = null): void {
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
