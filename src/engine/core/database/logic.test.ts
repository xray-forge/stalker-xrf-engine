import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { time_global } from "xray16";

import { IBaseSchemeState, IRegistryObjectState } from "@/engine/core/database/database_types";
import { loadObjectLogic, saveObjectLogic } from "@/engine/core/database/logic";
import { registerObject, resetObject } from "@/engine/core/database/objects";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database/portable_store";
import { EScheme, GameObject } from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/jest";
import { EPacketDataType, MockGameObject, MockNetProcessor } from "@/fixtures/xray";
import { MockCTime } from "@/fixtures/xray/mocks/CTime.mock";

describe("logic database module", () => {
  beforeAll(() => {
    replaceFunctionMock(time_global, () => 5_000);
  });

  it("should correctly load and save scheme activation info when set state", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const processor: MockNetProcessor = new MockNetProcessor();

    const cb = jest.fn();
    const actions = new LuaTable();
    const time = MockCTime.mock(2015, 5, 4, 12, 25, 30, 200);

    actions.set({ save: cb }, true);

    state[EScheme.COMBAT] = {
      actions,
    } as IBaseSchemeState;

    state.jobIni = "test.ltx";
    state.iniFilename = "test2.ltx";
    state.sectionLogic = "section_ex";
    state.activeSection = "active_sect_ex";
    state.smartTerrainName = "smart_terrain_name_ex";
    state.activeScheme = EScheme.COMBAT;
    state.activationTime = 15_000;
    state.activationGameTime = time;

    setPortableStoreValue(object.id(), "test-key-1", "test-val");
    setPortableStoreValue(object.id(), "test-key-2", 255);

    saveObjectLogic(object, processor.asNetPacket());

    expect(cb).toHaveBeenCalled();

    expect(processor.dataList).toEqual([
      "test.ltx",
      "test2.ltx",
      "section_ex",
      "active_sect_ex",
      "smart_terrain_name_ex",
      10000,
      15,
      5,
      4,
      12,
      25,
      30,
      200,
      2,
      "test-key-1",
      1,
      "test-val",
      "test-key-2",
      0,
      255,
      20,
    ]);
    expect(processor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.I32,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.U32,
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.F32,
      EPacketDataType.U16,
    ]);

    const nextState: IRegistryObjectState = resetObject(object);

    loadObjectLogic(object, processor.asNetPacket());

    expect(processor.dataList).toEqual([]);
    expect(processor.readDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.I32,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.U32,
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.F32,
      EPacketDataType.U16,
    ]);

    expect(nextState.jobIni).toBe("test.ltx");
    expect(nextState.loadedIniFilename).toBe("test2.ltx");
    expect(nextState.loadedSectionLogic).toBe("section_ex");
    expect(nextState.loadedActiveSection).toBe("active_sect_ex");
    expect(nextState.loadedSmartTerrainName).toBe("smart_terrain_name_ex");
    expect(nextState.activationTime).toBe(15_000);
    expect(nextState.activationGameTime.toString()).toBe(time.toString());

    expect(getPortableStoreValue(object.id(), "test-key-1")).toBe("test-val");
    expect(getPortableStoreValue(object.id(), "test-key-2")).toBe(255);
  });
});
