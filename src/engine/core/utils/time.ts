import {
  game,
  level,
  time_global,
  TXR_net_processor,
  verify_if_thread_is_running,
  XR_CTime,
  XR_net_packet,
} from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { MAX_U8 } from "@/engine/lib/constants/memory";
import { Optional, TDuration, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Check whether current time interval is between desired values.
 */
export function isInTimeInterval(fromHours: TTimestamp, toHouds: TTimestamp): boolean {
  const gameHours: TTimestamp = level.get_time_hours();

  if (fromHours >= toHouds) {
    return gameHours < toHouds || gameHours >= fromHours;
  } else {
    return gameHours < toHouds && gameHours >= fromHours;
  }
}

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

/**
 * todo;
 */
export function writeTimeToPacket(packet: XR_net_packet, time: Optional<XR_CTime>): void {
  if (time === null) {
    return packet.w_u8(MAX_U8);
  }

  const [Y, M, D, h, m, s, ms] = time.get(0, 0, 0, 0, 0, 0, 0);

  packet.w_u8(Y - 2000);
  packet.w_u8(M);
  packet.w_u8(D);
  packet.w_u8(h);
  packet.w_u8(m);
  packet.w_u8(s);
  packet.w_u16(ms);
}

/**
 * todo;
 */
export function readTimeFromPacket(reader: TXR_net_processor): Optional<XR_CTime> {
  const Y: number = reader.r_u8();

  if (Y === MAX_U8 || Y === 0) {
    return null;
  }

  const time: XR_CTime = game.CTime();

  const M: number = reader.r_u8();
  const D: number = reader.r_u8();
  const h: number = reader.r_u8();
  const m: number = reader.r_u8();
  const s: number = reader.r_u8();
  const ms: number = reader.r_u16();

  time.set(Y + 2000, M, D, h, m, s, ms);

  return time;
}
