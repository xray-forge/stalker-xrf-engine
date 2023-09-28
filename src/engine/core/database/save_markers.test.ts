import { describe, expect, it, jest } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import { closeLoadMarker, closeSaveMarker, openLoadMarker, openSaveMarker } from "@/engine/core/database/save_markers";
import { MAX_I32 } from "@/engine/lib/constants/memory";
import { EPacketDataType, mockNetPacket, MockNetProcessor } from "@/fixtures/xray";

describe("save_markers databse module", () => {
  it("should correctly create save markers", () => {
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    openSaveMarker(mockNetPacket(netProcessor), "test-1");

    expect(registry.saveMarkers.get("test-1")).toBe(0);

    jest.spyOn(netProcessor, "w_tell").mockImplementation(() => 100);
    openSaveMarker(mockNetPacket(netProcessor), "test-2");
    expect(registry.saveMarkers.get("test-2")).toBe(100);

    jest.spyOn(netProcessor, "w_tell").mockImplementation(() => MAX_I32);
    expect(() => openSaveMarker(mockNetPacket(netProcessor), "test-3")).toThrow();

    jest.spyOn(netProcessor, "w_tell").mockImplementation(() => 10);
    expect(closeSaveMarker(mockNetPacket(netProcessor), "test-1")).toBe(10);
    expect(netProcessor.writeDataOrder).toEqual([EPacketDataType.U16]);
    expect(netProcessor.dataList).toEqual([10]);

    jest.spyOn(netProcessor, "w_tell").mockImplementation(() => 150);
    expect(closeSaveMarker(mockNetPacket(netProcessor), "test-2")).toBe(50);
    expect(netProcessor.writeDataOrder).toEqual([EPacketDataType.U16, EPacketDataType.U16]);
    expect(netProcessor.dataList).toEqual([10, 50]);

    expect(() => closeSaveMarker(mockNetPacket(netProcessor), "test-3")).toThrow();
  });

  it("should correctly create load markers", () => {
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    netProcessor.w_u16(10);
    netProcessor.w_u16(50);

    expect(netProcessor.dataList).toEqual([10, 50]);

    openLoadMarker(mockNetPacket(netProcessor), "test-4");
    expect(registry.saveMarkers.get("test-4")).toBe(0);

    jest.spyOn(netProcessor, "r_tell").mockImplementation(() => 100);
    openLoadMarker(mockNetPacket(netProcessor), "test-5");
    expect(registry.saveMarkers.get("test-5")).toBe(100);

    jest.spyOn(netProcessor, "r_tell").mockImplementation(() => 10);
    expect(closeLoadMarker(mockNetPacket(netProcessor), "test-4")).toBe(10);
    expect(netProcessor.readDataOrder).toEqual([EPacketDataType.U16]);
    expect(netProcessor.dataList).toEqual([50]);

    jest.spyOn(netProcessor, "r_tell").mockImplementation(() => 150);
    expect(closeLoadMarker(mockNetPacket(netProcessor), "test-5")).toBe(50);
    expect(netProcessor.readDataOrder).toEqual([EPacketDataType.U16, EPacketDataType.U16]);
    expect(netProcessor.dataList).toEqual([]);
  });

  it("should correctly warn when size limits are reached", () => {
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    // First breakpoint with warn, no error.
    jest.spyOn(netProcessor, "w_tell").mockImplementationOnce(() => 0);
    openSaveMarker(mockNetPacket(netProcessor), "test-size");

    jest.spyOn(netProcessor, "w_tell").mockImplementationOnce(() => 9_000);
    closeSaveMarker(mockNetPacket(netProcessor), "test-size");

    // Second breakpoint with warn, no error.
    jest.spyOn(netProcessor, "w_tell").mockImplementationOnce(() => 0);
    openSaveMarker(mockNetPacket(netProcessor), "test-size");

    jest.spyOn(netProcessor, "w_tell").mockImplementationOnce(() => 11_000);
    closeSaveMarker(mockNetPacket(netProcessor), "test-size");
  });
});
