import { CTime, game, level } from "xray16";
import { NetPacket, NetProcessor, Time } from "xray16/alias";

import { wait } from "@/engine/core/utils/game/game_wait";
import { MAX_U8 } from "@/engine/lib/constants/memory";
import { Nillable, TLabel, TRate, TTimestamp } from "@/engine/lib/types";

/**
 * Add part of time digit to a data string.
 *
 * @param digit - Number convert.
 * @returns Concatenated time string.
 */
export function toTimeDigit(digit: number): string {
  return digit > 9 ? tostring(digit) : "0" + digit;
}

/**
 * @param time - Time to stringify.
 * @returns Stringified time string.
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
 * Transform hour to weather period section label.
 *
 * Example: 6 -> "06:00:00".
 *
 * @param hours - Hours to transform.
 * @returns Section for provided hour period.
 */
export function hoursToWeatherPeriod(hours: TTimestamp): TLabel {
  return hours < 10 ? `0${hours}:00:00` : `${hours}:00:00`;
}

/**
 * @param time - Time duration in millis.
 * @returns Hh:mm:ss formatted time.
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
 * @param fromHours - Lower time bound.
 * @param toHours - Upper time bound.
 * @returns Whether current game time is in provided time bounds.
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
 * @param hour - Desired day hour.
 * @param min - Desired day min.
 * @param sec - Desired day sec.
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
 * @param packet - Target packet to write data.
 * @param time - Time object to write.
 */
export function writeTimeToPacket(packet: NetPacket, time: Nillable<Time> = null): void {
  if (!time) {
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
 * @param reader - Target packet to read data.
 * @returns Time object or null.
 */
export function readTimeFromPacket(reader: NetProcessor): Nillable<Time> {
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
 * @param time - Object to serialize.
 * @returns Serialized time string.
 */
export function serializeTime(time: CTime): string {
  const [Y, M, D, h, m, s, ms] = time.get(0, 0, 0, 0, 0, 0, 0);

  return marshal.encode([Y, M, D, h, m, s, ms]);
}

/**
 * @param data - Serialized time.
 * @returns Deserialized object.
 */
export function deserializeTime(data: string): CTime {
  const time: CTime = game.CTime();
  const [Y, M, D, h, m, s, ms] = marshal.decode<Array<number>>(data);

  time.set(Y, M, D, h, m, s, ms);

  return time;
}
