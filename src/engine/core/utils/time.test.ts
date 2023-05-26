import { describe, expect, it } from "@jest/globals";
import { CTime, game, level } from "xray16";

import { isInTimeInterval, readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/time";
import { MAX_I32, MAX_U8, MIN_I32 } from "@/engine/lib/constants/memory";
import { Optional } from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/utils/function_mock";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("'time' utils", () => {
  it("'writeTimeToPacket' and 'readTimeFromPacket' should correctly save and load", () => {
    const netProcessor: MockNetProcessor = new MockNetProcessor();
    const timeToWrite: CTime = game.get_game_time();

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

    const timeToRead: Optional<CTime> = readTimeFromPacket(mockNetProcessor(netProcessor));

    expect(timeToRead).not.toBeNull();
    expect(timeToRead?.toString()).toBe("y:2012, m:6, d:12, h:3, min:6, sec:12, ms:500");

    expect(netProcessor.dataList).toEqual([]);
    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
  });

  it("'writeTimeToPacket' and 'readTimeFromPacket' should handle nulls", () => {
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    writeTimeToPacket(mockNetPacket(netProcessor), null);

    expect(netProcessor.dataList).toEqual([MAX_U8]);
    expect(netProcessor.writeDataOrder).toEqual([EPacketDataType.U8]);

    expect(readTimeFromPacket(mockNetProcessor(netProcessor))).toBeNull();

    expect(netProcessor.dataList).toEqual([]);
    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
  });

  it("'isInTimeInterval' should correctly check time intervals", () => {
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
