import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  loadExtensionsState,
  saveExtensionsState,
  syncExtensionsState,
} from "@/engine/core/utils/extensions/extensions_state";
import { IExtensionsDescriptor } from "@/engine/core/utils/extensions/extensions_types";
import { TName } from "@/engine/lib/types";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockIoFile } from "@/fixtures/lua";

describe("extensions_order utils", () => {
  const mockExtension = (name: TName) => ({ name, module: {} }) as IExtensionsDescriptor;

  beforeEach(() => {
    resetFunctionMock(io.open);
  });

  it("saveDynamicGameSave should correctly create dynamic file saves", () => {
    const file: MockIoFile = new MockIoFile("test", "wb");

    jest.spyOn(io, "open").mockImplementation(() => $multi(file.asMock()));

    saveExtensionsState($fromArray([mockExtension("a"), mockExtension("b"), mockExtension("c")]));

    expect(lfs.mkdir).toHaveBeenCalledWith("$game_saves$\\");
    expect(io.open).toHaveBeenCalledWith("$game_saves$\\extensions_order.scopo", "wb");
    expect(file.write).toHaveBeenCalledWith(JSON.stringify({ 1: { name: "a" }, 2: { name: "b" }, 3: { name: "c" } }));

    expect(file.content).toBe(JSON.stringify({ 1: { name: "a" }, 2: { name: "b" }, 3: { name: "c" } }));

    file.isOpen = false;
    saveExtensionsState($fromArray([mockExtension("b"), mockExtension("c")]));

    expect(file.write).toHaveBeenCalledTimes(1);
    expect(file.content).toBe(JSON.stringify({ 1: { name: "a" }, 2: { name: "b" }, 3: { name: "c" } }));
  });

  it("loadDynamicGameSave should correctly load dynamic file saves", () => {
    const file: MockIoFile = new MockIoFile("test", "wb");

    file.content = JSON.stringify({ a: 1, b: 33 });

    jest.spyOn(io, "open").mockImplementation(() => $multi(file.asMock()));

    expect(loadExtensionsState()).toEqual({ a: 1, b: 33 });

    expect(marshal.decode).toHaveBeenCalledWith(file.content);
    expect(io.open).toHaveBeenCalledWith("$game_saves$\\extensions_order.scopo", "rb");

    file.content = "";
    expect(loadExtensionsState()).toEqualLuaArrays([]);

    file.content = null;
    expect(loadExtensionsState()).toEqualLuaArrays([]);

    file.content = "{}";
    file.isOpen = false;
    expect(loadExtensionsState()).toEqualLuaArrays([]);
  });

  it("syncExtensionsOrder should correctly apply sorting order", () => {
    const first: IExtensionsDescriptor = { name: "first" } as IExtensionsDescriptor;
    const second: IExtensionsDescriptor = { name: "second" } as IExtensionsDescriptor;
    const third: IExtensionsDescriptor = { name: "third" } as IExtensionsDescriptor;
    const fourth: IExtensionsDescriptor = { name: "fourth" } as IExtensionsDescriptor;

    const another: IExtensionsDescriptor = { name: "another" } as IExtensionsDescriptor;
    const abc: IExtensionsDescriptor = { name: "abc" } as IExtensionsDescriptor;
    const def: IExtensionsDescriptor = { name: "def" } as IExtensionsDescriptor;

    expect(syncExtensionsState($fromArray([first, second, third, fourth]), new LuaTable())).toEqualLuaArrays([
      first,
      fourth,
      second,
      third,
    ]);

    expect(
      syncExtensionsState($fromArray([first, second, third, fourth]), $fromArray([fourth, third, second, first]))
    ).toEqualLuaArrays([fourth, third, second, first]);

    expect(
      syncExtensionsState($fromArray([first, second, third, fourth]), $fromArray([second, another, fourth]))
    ).toEqualLuaArrays([second, fourth, first, third]);

    expect(syncExtensionsState($fromArray([first, second]), $fromArray([abc, def, second]))).toEqualLuaArrays([
      second,
      first,
    ]);
  });
});
