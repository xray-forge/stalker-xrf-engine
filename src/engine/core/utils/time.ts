import { CTime, game, level } from "xray16";

import { wait } from "@/engine/core/utils/game/game_wait";
import { MAX_U8 } from "@/engine/lib/constants/memory";
import { NetPacket, NetProcessor, Optional, Time, TRate, TTimestamp } from "@/engine/lib/types";

/**
 * Add part of time digit to a data string.
 *
 * @param digit - number convert
 * @returns concatenated time string
 */
export function toTimeDigit(digit: number): string {
  return digit > 9 ? tostring(digit) : "0" + digit;
}

/**
 * @param time - time to stringify
 * @returns stringified time string
 */
export function gameTimeToString(time: Time): string {
  const [y, m, d, h, min] = time.get(0, 0, 0, 0, 0, 0, 0);

  return string.format(
    "%s:%s %s/%s/%s",
    toTimeDigit(h),
    toTimeDigit(min),
    toTimeDigit(m),
    toTimeDigit(d),
    toTimeDigit(y)
  );
}

/**
 * @param time - time duration in millis
 * @returns hh:mm:ss formatted time
 */
export function globalTimeToString(time: number): string {
  const hours: number = math.floor(time / 3_600_000);
  const minutes: number = math.floor(time / 60_000 - hours * 60);
  const seconds: number = math.floor(time / 1_000 - hours * 3_600 - minutes * 60);

  return string.format("%s:%s:%s", tostring(hours), toTimeDigit(minutes), toTimeDigit(seconds));
}

/**
 * Check whether current time interval is between desired values.
 *
 * @param fromHours - lower time bound
 * @param toHours - upper time bound
 * @returns whether current game time is in provided time bounds
 */
export function isInTimeInterval(fromHours: TTimestamp, toHours: TTimestamp): boolean {
  const gameHours: TTimestamp = level.get_time_hours();

  if (fromHours >= toHours) {
    return gameHours < toHours || gameHours >= fromHours;
  } else {
    return gameHours < toHours && gameHours >= fromHours;
  }
}

/**
 * Set current time in level.
 * Creates idle state with multiplied time factor.
 *
 * @param hour - desired day hour
 * @param min - desired day min
 * @param sec - desired day sec
 */
export function setCurrentTime(hour: number, min: number, sec: number): void {
  const currentTimeFactor: TRate = level.get_time_factor();
  const currentGameTime: TTimestamp = game.time();

  let currentDay: number = math.floor(currentGameTime / 86_400_000);
  const currentTime: number = currentGameTime - currentDay * 86_400_000;
  let newTime: number = (sec + min * 60 + hour * 3_600) * 1000;

  // Wait for next day to match expected time.
  if (currentTime > newTime) {
    currentDay += 1;
  }

  newTime = newTime + currentDay * 86_400_000;

  level.set_time_factor(10_000);

  while (game.time() < newTime) {
    wait();
  }

  level.set_time_factor(currentTimeFactor);
}

/**
 * Save time object into net packet.
 *
 * @param packet - target packet to write data
 * @param time - time object to write
 */
export function writeTimeToPacket(packet: NetPacket, time: Optional<Time> = null): void {
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
 * Read time object from net packet.
 *
 * @param reader - target packet to read data
 * @returns time object or null
 */
export function readTimeFromPacket(reader: NetProcessor): Optional<Time> {
  const Y: number = reader.r_u8();

  if (Y === MAX_U8 || Y === 0) {
    return null;
  }

  const time: Time = game.CTime();

  const M: number = reader.r_u8();
  const D: number = reader.r_u8();
  const h: number = reader.r_u8();
  const m: number = reader.r_u8();
  const s: number = reader.r_u8();
  const ms: number = reader.r_u16();

  time.set(Y + 2000, M, D, h, m, s, ms);

  return time;
}

/**
 * @param time - object to serialize
 * @returns serialized time string
 */
export function serializeTime(time: CTime): string {
  const [Y, M, D, h, m, s, ms] = time.get(0, 0, 0, 0, 0, 0, 0);

  return marshal.encode([Y, M, D, h, m, s, ms]);
}

/**
 * @param data - serialized time
 * @returns deserialized object
 */
export function deserializeTime(data: string): CTime {
  const time: CTime = game.CTime();
  const [Y, M, D, h, m, s, ms] = marshal.decode<Array<number>>(data);

  time.set(Y, M, D, h, m, s, ms);

  return time;
}
