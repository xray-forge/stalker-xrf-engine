import {
  CTime,
  editor,
  game,
  level,
  time_global,
  verify_if_thread_is_running,
  XR_CTime,
  XR_net_packet,
  XR_reader,
} from "xray16";

import { MAX_UNSIGNED_8_BIT } from "@/engine/lib/constants/memory";
import { Optional } from "@/engine/lib/types";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

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
 * todo;
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
 * todo;
 */
export function readCTimeFromPacket(reader: XR_reader | XR_net_packet): Optional<XR_CTime> {
  const Y = reader.r_u8();

  if (Y === MAX_UNSIGNED_8_BIT) {
    return null;
  }

  if (Y !== 0) {
    const time: XR_CTime = game.CTime();

    const M: number = reader.r_u8();
    const D: number = reader.r_u8();
    const h: number = reader.r_u8();
    const m: number = reader.r_u8();
    const s: number = reader.r_u8();
    const ms: number = reader.r_u16();

    time.set(Y + 2000, M, D, h, m, s, ms);

    return time;
  } else {
    return null;
  }
}
