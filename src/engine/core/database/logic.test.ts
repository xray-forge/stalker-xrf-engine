import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { time_global } from "xray16";

import { loadObjectLogic, saveObjectLogic } from "@/engine/core/database/logic";
import { registerObject, resetObject } from "@/engine/core/database/objects";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database/portable_store";
import { IRegistryObjectState } from "@/engine/core/database/types";
import { IBaseSchemeState } from "@/engine/core/schemes";
import { ClientObject, EScheme } from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/utils/function_mock";
import { EPacketDataType, mockClientGameObject, mockNetPacket, MockNetProcessor } from "@/fixtures/xray";
import { MockCTime } from "@/fixtures/xray/mocks/CTime.mock";

describe("'logic' database module", () => {
  beforeAll(() => {
    replaceFunctionMock(time_global, () => 5_000);
  });

  it("should correctly load and save scheme activation info when set state", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    const cb = jest.fn();
    const actions = new LuaTable();
    const time = MockCTime.mock(2015, 5, 4, 12, 25, 30, 200);

    actions.set({ save: cb }, true);

    state[EScheme.COMBAT] = {
      actions,
    } as IBaseSchemeState;

    state.job_ini = "test.ltx";
    state.ini_filename = "test2.ltx";
    state.section_logic = "section_ex";
    state.active_section = "active_sect_ex";
    state.gulag_name = "gulag_name_ex";
    state.active_scheme = EScheme.COMBAT;
    state.activation_time = 15_000;
    state.activation_game_time = time;

    setPortableStoreValue(object, "test-key-1", "test-val");
    setPortableStoreValue(object, "test-key-2", 255);

    saveObjectLogic(object, mockNetPacket(netProcessor));

    expect(cb).toHaveBeenCalled();

    expect(netProcessor.dataList).toEqual([
      "test.ltx",
      "test2.ltx",
      "section_ex",
      "active_sect_ex",
      "gulag_name_ex",
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
    expect(netProcessor.writeDataOrder).toEqual([
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

    loadObjectLogic(object, mockNetPacket(netProcessor));

    expect(netProcessor.dataList).toEqual([]);
    expect(netProcessor.readDataOrder).toEqual([
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

    expect(nextState.job_ini).toBe("test.ltx");
    expect(nextState.loaded_ini_filename).toBe("test2.ltx");
    expect(nextState.loaded_section_logic).toBe("section_ex");
    expect(nextState.loaded_active_section).toBe("active_sect_ex");
    expect(nextState.loaded_gulag_name).toBe("gulag_name_ex");
    expect(nextState.activation_time).toBe(15_000);
    expect(nextState.activation_game_time.toString()).toBe(time.toString());

    expect(getPortableStoreValue(object, "test-key-1")).toBe("test-val");
    expect(getPortableStoreValue(object, "test-key-2")).toBe(255);
  });
});