import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database/objects";
import {
  destroyPortableStore,
  EPortableStoreType,
  getPortableStoreValue,
  initializePortableStore,
  isValidPortableStoreValue,
  loadPortableStore,
  resetPortableStore,
  savePortableStore,
  setPortableStoreValue,
} from "@/engine/core/database/portable_store";
import { registry } from "@/engine/core/database/registry";
import { GameObject, Optional } from "@/engine/lib/types";
import { EPacketDataType, mockGameObject, mockNetPacket, MockNetProcessor, mockNetProcessor } from "@/fixtures/xray";

describe("portable_store functionality", () => {
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

  it("should correctly initialize portable store", () => {
    const object: GameObject = mockGameObject();

    registerObject(object);

    expect(registry.objects.get(object.id()).portableStore).toBeUndefined();

    initializePortableStore(object.id());

    expect(registry.objects.get(object.id()).portableStore).toEqual(new LuaTable());

    destroyPortableStore(object.id());

    expect(registry.objects.get(object.id()).portableStore).toBeNull();

    resetPortableStore(object.id());

    expect(registry.objects.get(object.id()).portableStore).toEqual(new LuaTable());

    const previous: Optional<LuaTable<string>> = registry.objects.get(object.id()).portableStore;

    resetPortableStore(object.id());

    expect(registry.objects.get(object.id()).portableStore).toEqual(new LuaTable());
    expect(registry.objects.get(object.id()).portableStore).not.toBe(previous);
  });

  it("should correctly set and get values by key", () => {
    const object: GameObject = mockGameObject();

    registerObject(object);

    // Numbers.
    expect(getPortableStoreValue(object.id(), "some_key")).toBeNull();

    setPortableStoreValue(object.id(), "some_key", 1000);
    expect(getPortableStoreValue(object.id(), "some_key")).toBe(1000);

    setPortableStoreValue(object.id(), "some_key", null);
    expect(getPortableStoreValue(object.id(), "some_key")).toBeNull();

    // Boolean.
    expect(getPortableStoreValue(object.id(), "another")).toBeNull();

    setPortableStoreValue(object.id(), "another", true);
    expect(getPortableStoreValue(object.id(), "another")).toBe(true);

    setPortableStoreValue(object.id(), "another", null);
    expect(getPortableStoreValue(object.id(), "another")).toBeNull();

    // String.
    expect(getPortableStoreValue(object.id(), "string")).toBeNull();

    setPortableStoreValue(object.id(), "string", "example");
    expect(getPortableStoreValue(object.id(), "string")).toBe("example");

    setPortableStoreValue(object.id(), "string", null);
    expect(getPortableStoreValue(object.id(), "string")).toBeNull();

    // Unexpected.
    expect(() => setPortableStoreValue(object.id(), "key", {} as unknown as string)).toThrow(
      "Portable store received not registered type to set: 'key' - 'table'."
    );
    expect(() => setPortableStoreValue(object.id(), "key", [] as unknown as string)).toThrow(
      "Portable store received not registered type to set: 'key' - 'table'."
    );
  });

  it("should correctly save and load values", () => {
    const object: GameObject = mockGameObject();

    registerObject(object);

    setPortableStoreValue(object.id(), "number_test", 1000);
    setPortableStoreValue(object.id(), "boolean_test", true);
    setPortableStoreValue(object.id(), "string_test", "example");

    const netProcessor: MockNetProcessor = new MockNetProcessor();

    savePortableStore(object.id(), mockNetPacket(netProcessor));

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

    const nextObject: GameObject = mockGameObject();

    registerObject(nextObject);

    loadPortableStore(nextObject.id(), mockNetProcessor(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toEqual([]);

    expect(getPortableStoreValue(object.id(), "number_test")).toBe(1000);
    expect(getPortableStoreValue(object.id(), "boolean_test")).toBe(true);
    expect(getPortableStoreValue(object.id(), "string_test")).toBe("example");
  });

  it("should correctly save and load with invalid data", () => {
    const object: GameObject = mockGameObject();

    registerObject(object);

    setPortableStoreValue(object.id(), "valid", 1);
    registry.objects.get(object.id()).portableStore?.set("invalid", {});

    const netProcessor: MockNetProcessor = new MockNetProcessor();

    expect(() => savePortableStore(object.id(), mockNetPacket(netProcessor))).toThrow(
      "Portable store: not registered type tried to save 'invalid' - 'table'."
    );

    netProcessor.w_stringZ("key");
    netProcessor.w_u8(3);

    expect(() => loadPortableStore(object.id(), mockNetPacket(netProcessor))).toThrow(
      "Portable store: not registered type tried to load: 'invalid' - 'key'."
    );
  });
});
