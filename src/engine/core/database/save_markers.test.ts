import { describe, expect, it, jest } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";
import { closeLoadMarker, closeSaveMarker, openLoadMarker, openSaveMarker } from "@/engine/core/database/save_markers";
import { MAX_I32 } from "@/engine/lib/constants/memory";
import { EPacketDataType, MockNetProcessor } from "@/fixtures/xray";

describe("save_markers database module", () => {
  it("should correctly create save markers", () => {
    const processor: MockNetProcessor = new MockNetProcessor();

    openSaveMarker(processor.asNetPacket(), "test-1");

    expect(registry.saveMarkers.get("test-1")).toBe(0);

    jest.spyOn(processor, "w_tell").mockImplementation(() => 100);
    openSaveMarker(processor.asNetPacket(), "test-2");
    expect(registry.saveMarkers.get("test-2")).toBe(100);

    jest.spyOn(processor, "w_tell").mockImplementation(() => MAX_I32);
    expect(() => openSaveMarker(processor.asNetPacket(), "test-3")).toThrow();

    jest.spyOn(processor, "w_tell").mockImplementation(() => 10);
    expect(closeSaveMarker(processor.asNetPacket(), "test-1")).toBe(10);
    expect(processor.writeDataOrder).toEqual([EPacketDataType.U16]);
    expect(processor.dataList).toEqual([10]);

    jest.spyOn(processor, "w_tell").mockImplementation(() => 150);
    expect(closeSaveMarker(processor.asNetPacket(), "test-2")).toBe(50);
    expect(processor.writeDataOrder).toEqual([EPacketDataType.U16, EPacketDataType.U16]);
    expect(processor.dataList).toEqual([10, 50]);

    expect(() => closeSaveMarker(processor.asNetPacket(), "test-3")).toThrow();
  });

  it("should correctly create load markers", () => {
    const processor: MockNetProcessor = new MockNetProcessor();

    processor.w_u16(10);
    processor.w_u16(50);

    expect(processor.dataList).toEqual([10, 50]);

    openLoadMarker(processor.asNetPacket(), "test-4");
    expect(registry.saveMarkers.get("test-4")).toBe(0);

    jest.spyOn(processor, "r_tell").mockImplementation(() => 100);
    openLoadMarker(processor.asNetPacket(), "test-5");
    expect(registry.saveMarkers.get("test-5")).toBe(100);

    jest.spyOn(processor, "r_tell").mockImplementation(() => 10);
    expect(closeLoadMarker(processor.asNetPacket(), "test-4")).toBe(10);
    expect(processor.readDataOrder).toEqual([EPacketDataType.U16]);
    expect(processor.dataList).toEqual([50]);

    jest.spyOn(processor, "r_tell").mockImplementation(() => 150);
    expect(closeLoadMarker(processor.asNetPacket(), "test-5")).toBe(50);
    expect(processor.readDataOrder).toEqual([EPacketDataType.U16, EPacketDataType.U16]);
    expect(processor.dataList).toEqual([]);
  });

  it("should correctly warn when size limits are reached", () => {
    const processor: MockNetProcessor = new MockNetProcessor();

    // First breakpoint with warn, no error.
    jest.spyOn(processor, "w_tell").mockImplementationOnce(() => 0);
    openSaveMarker(processor.asNetPacket(), "test-size");

    jest.spyOn(processor, "w_tell").mockImplementationOnce(() => 9_000);
    closeSaveMarker(processor.asNetPacket(), "test-size");

    // Second breakpoint with warn, no error.
    jest.spyOn(processor, "w_tell").mockImplementationOnce(() => 0);
    openSaveMarker(processor.asNetPacket(), "test-size");

    jest.spyOn(processor, "w_tell").mockImplementationOnce(() => 11_000);
    closeSaveMarker(processor.asNetPacket(), "test-size");
  });
});
