import { describe, expect, it } from "@jest/globals";
import { game, level } from "xray16";

import {
  gameTimeToString,
  globalTimeToString,
  isInTimeInterval,
  readTimeFromPacket,
  toTimeDigit,
  writeTimeToPacket,
} from "@/engine/core/utils/game/game_time";
import { MAX_I32, MAX_U8, MIN_I32 } from "@/engine/lib/constants/memory";
import { Optional, Time } from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockCTime } from "@/fixtures/xray/mocks/CTime.mock";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("time utils", () => {
  it("writeTimeToPacket and readTimeFromPacket should correctly save and load", () => {
    const netProcessor: MockNetProcessor = new MockNetProcessor();
    const timeToWrite: Time = game.get_game_time();

    timeToWrite.set(2012, 6, 12, 3, 6, 12, 500);

    expect(timeToWrite.toString()).toBe("y:2012, m:6, d:12, h:3, min:6, sec:12, ms:500");

    writeTimeToPacket(mockNetPacket(netProcessor), timeToWrite);

    expect(netProcessor.dataList).toEqual([12, 6, 12, 3, 6, 12, 500]);
    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U16,
    ]);

    const timeToRead: Optional<Time> = readTimeFromPacket(mockNetProcessor(netProcessor));

    expect(timeToRead).not.toBeNull();
    expect(timeToRead?.toString()).toBe("y:2012, m:6, d:12, h:3, min:6, sec:12, ms:500");

    expect(netProcessor.dataList).toEqual([]);
    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
  });

  it("writeTimeToPacket and readTimeFromPacket should handle nulls", () => {
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    writeTimeToPacket(mockNetPacket(netProcessor), null);

    expect(netProcessor.dataList).toEqual([MAX_U8]);
    expect(netProcessor.writeDataOrder).toEqual([EPacketDataType.U8]);

    expect(readTimeFromPacket(mockNetProcessor(netProcessor))).toBeNull();

    expect(netProcessor.dataList).toEqual([]);
    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
  });

  it("toTimeDigit should correctly convert time digits", () => {
    expect(toTimeDigit(0)).toBe("00");
    expect(toTimeDigit(1)).toBe("01");
    expect(toTimeDigit(9)).toBe("09");
    expect(toTimeDigit(10)).toBe("10");
    expect(toTimeDigit(16)).toBe("16");
    expect(toTimeDigit(20)).toBe("20");
  });

  it("gameTimeToString should correctly stringify game time", () => {
    expect(gameTimeToString(MockCTime.mock(2015, 2, 15, 12, 45, 30, 250))).toBe("12:45 02/15/2015");
    expect(gameTimeToString(MockCTime.mock(2004, 11, 1, 4, 5, 2, 20))).toBe("04:05 11/01/2004");
  });

  it("globalTimeToString should correctly stringify global time", () => {
    expect(globalTimeToString(3_600_000 * 3 + 4 * 60_000 + 5 * 1000)).toBe("3:04:05");
    expect(globalTimeToString(3_600_000 * 11 + 25 * 60_000 + 16 * 1000)).toBe("11:25:16");
  });

  it("isInTimeInterval should correctly check time intervals", () => {
    replaceFunctionMock(level.get_time_hours, () => 12);

    expect(isInTimeInterval(MIN_I32, 0)).toBeFalsy();
    expect(isInTimeInterval(0, 4)).toBeFalsy();
    expect(isInTimeInterval(4, 8)).toBeFalsy();
    expect(isInTimeInterval(8, 12)).toBeFalsy();
    expect(isInTimeInterval(12, 16)).toBeTruthy();
    expect(isInTimeInterval(16, 20)).toBeFalsy();
    expect(isInTimeInterval(20, 24)).toBeFalsy();
    expect(isInTimeInterval(24, MAX_I32)).toBeFalsy();
    expect(isInTimeInterval(24, 2)).toBeFalsy();
    expect(isInTimeInterval(22, 14)).toBeTruthy();
    expect(isInTimeInterval(20, 14)).toBeTruthy();

    expect(isInTimeInterval(12, 12)).toBeTruthy();
    expect(isInTimeInterval(11.5, 12.5)).toBeTruthy();
    expect(isInTimeInterval(MIN_I32, MAX_I32)).toBeTruthy();

    replaceFunctionMock(level.get_time_hours, () => 4);
    expect(isInTimeInterval(4, 4)).toBeTruthy();
    expect(isInTimeInterval(3.5, 4.5)).toBeTruthy();
    expect(isInTimeInterval(0, 4)).toBeFalsy();
    expect(isInTimeInterval(4, 5)).toBeTruthy();
  });
});
