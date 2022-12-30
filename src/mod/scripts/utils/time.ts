import { level, game, time_global, verify_if_thread_is_running, XR_net_packet, XR_CTime, CTime, editor } from "xray16";

import { MAX_UNSIGNED_8_BIT } from "@/mod/globals/memory";
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

// todo: Investigate this hack.
const CTime_0: Optional<XR_CTime> = editor() ? null : game.CTime();

/**
 *
 */
export function writeCTimeToPacket(packet: XR_net_packet, time: Optional<XR_CTime>): void {
  if (time === null) {
    packet.w_u8(-1);

    return;
  }

  if (CTime === null || time !== CTime_0) {
    const [Y, M, D, h, m, s, ms] = time.get(0, 0, 0, 0, 0, 0, 0);

    packet.w_u8(Y - 2000);
    packet.w_u8(M);
    packet.w_u8(D);
    packet.w_u8(h);
    packet.w_u8(m);
    packet.w_u8(s);
    packet.w_u16(ms);
  } else {
    packet.w_u8(0);
  }
}

/**
 *
 */
export function readCTimeFromPacket(packet: XR_net_packet): Optional<XR_CTime> {
  const Y = packet.r_u8();

  if (Y === MAX_UNSIGNED_8_BIT) {
    return null;
  }

  if (Y !== 0) {
    const time: XR_CTime = new CTime();

    const M: number = packet.r_u8();
    const D: number = packet.r_u8();
    const h: number = packet.r_u8();
    const m: number = packet.r_u8();
    const s: number = packet.r_u8();
    const ms: number = packet.r_u16();

    time.set(Y + 2000, M, D, h, m, s, ms);

    return time;
  } else {
    return null;
  }
}
