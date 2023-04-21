import { describe, expect, it } from "@jest/globals";
import { XR_game_object } from "xray16";

import { registerObject } from "@/engine/core/database/objects";
import {
  EPortableStoreType,
  getPortableStoreValue,
  isValidPortableStoreValue,
  loadPortableStore,
  savePortableStore,
  setPortableStoreValue,
} from "@/engine/core/database/portable_store";
import {
  EPacketDataType,
  mockClientGameObject,
  mockNetPacket,
  MockNetProcessor,
  mockNetProcessor,
} from "@/fixtures/xray";

describe("'portable_store' functionality", () => {
  it("should correctly validate value type", () => {
    expect(isValidPortableStoreValue(1)).toBeTruthy();
    expect(isValidPortableStoreValue(0)).toBeTruthy();
    expect(isValidPortableStoreValue(true)).toBeTruthy();
    expect(isValidPortableStoreValue(false)).toBeTruthy();
    expect(isValidPortableStoreValue("")).toBeTruthy();
    expect(isValidPortableStoreValue("abc")).toBeTruthy();
    expect(isValidPortableStoreValue("abc-def-g")).toBeTruthy();
    expect(isValidPortableStoreValue(null)).toBeTruthy();

    expect(isValidPortableStoreValue([])).toBeFalsy();
    expect(isValidPortableStoreValue({})).toBeFalsy();
    expect(isValidPortableStoreValue(new LuaTable())).toBeFalsy();
    expect(isValidPortableStoreValue(undefined)).toBeFalsy();
  });

  it("should correctly set and get values by key", () => {
    const object: XR_game_object = mockClientGameObject();

    registerObject(object);

    // Numbers.
    expect(getPortableStoreValue(object, "some_key")).toBeNull();

    setPortableStoreValue(object, "some_key", 1000);
    expect(getPortableStoreValue(object, "some_key")).toBe(1000);

    setPortableStoreValue(object, "some_key", null);
    expect(getPortableStoreValue(object, "some_key")).toBeNull();

    // Boolean.
    expect(getPortableStoreValue(object, "another")).toBeNull();

    setPortableStoreValue(object, "another", true);
    expect(getPortableStoreValue(object, "another")).toBe(true);

    setPortableStoreValue(object, "another", null);
    expect(getPortableStoreValue(object, "another")).toBeNull();

    // String.
    expect(getPortableStoreValue(object, "string")).toBeNull();

    setPortableStoreValue(object, "string", "example");
    expect(getPortableStoreValue(object, "string")).toBe("example");

    setPortableStoreValue(object, "string", null);
    expect(getPortableStoreValue(object, "string")).toBeNull();
  });

  it("should correctly save and load values", () => {
    const object: XR_game_object = mockClientGameObject();

    registerObject(object);

    setPortableStoreValue(object, "number_test", 1000);
    setPortableStoreValue(object, "boolean_test", true);
    setPortableStoreValue(object, "string_test", "example");

    const netProcessor: MockNetProcessor = new MockNetProcessor();

    savePortableStore(object, mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.U32,
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.BOOLEAN,
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.STRING,
    ]);
    expect(netProcessor.dataList).toEqual([
      3,
      "number_test",
      EPortableStoreType.NUMBER,
      1000,
      "boolean_test",
      EPortableStoreType.BOOLEAN,
      true,
      "string_test",
      EPortableStoreType.STRING,
      "example",
    ]);

    const nextObject: XR_game_object = mockClientGameObject();

    registerObject(nextObject);

    loadPortableStore(nextObject, mockNetProcessor(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toEqual([]);

    expect(getPortableStoreValue(object, "number_test")).toBe(1000);
    expect(getPortableStoreValue(object, "boolean_test")).toBe(true);
    expect(getPortableStoreValue(object, "string_test")).toBe("example");
  });
});
