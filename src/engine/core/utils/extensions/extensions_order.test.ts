import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  loadExtensionsOrder,
  saveExtensionsOrder,
  syncExtensionsOrder,
} from "@/engine/core/utils/extensions/extensions_order";
import { IExtensionsDescriptor } from "@/engine/core/utils/extensions/extensions_types";
import { TName } from "@/engine/lib/types";
import { MockIoFile } from "@/fixtures/lua";
import { resetFunctionMock } from "@/fixtures/utils";

describe("'extensions_order' utils", () => {
  const mockExtension = (name: TName) => ({ name }) as IExtensionsDescriptor;

  beforeEach(() => {
    resetFunctionMock(io.open);
  });

  it("'saveDynamicGameSave' should correctly create dynamic file saves", () => {
    const file: MockIoFile = new MockIoFile("test", "wb");

    jest.spyOn(io, "open").mockImplementation(() => $multi(file.asMock()));

    saveExtensionsOrder($fromArray([mockExtension("a"), mockExtension("b"), mockExtension("c")]));

    expect(lfs.mkdir).toHaveBeenCalledWith("$game_saves$\\");
    expect(io.open).toHaveBeenCalledWith("$game_saves$\\extensions_order.scop", "wb");
    expect(file.write).toHaveBeenCalledWith(JSON.stringify({ 1: "a", 2: "b", 3: "c" }));

    expect(file.content).toBe(JSON.stringify({ 1: "a", 2: "b", 3: "c" }));

    file.isOpen = false;
    saveExtensionsOrder($fromArray([mockExtension("b"), mockExtension("c")]));

    expect(file.write).toHaveBeenCalledTimes(1);
    expect(file.content).toBe(JSON.stringify({ 1: "a", 2: "b", 3: "c" }));
  });

  it("'loadDynamicGameSave' should correctly load dynamic file saves", () => {
    const file: MockIoFile = new MockIoFile("test", "wb");

    file.content = JSON.stringify({ a: 1, b: 33 });

    jest.spyOn(io, "open").mockImplementation(() => $multi(file.asMock()));

    expect(loadExtensionsOrder()).toEqual({ a: 1, b: 33 });

    expect(marshal.decode).toHaveBeenCalledWith(file.content);
    expect(io.open).toHaveBeenCalledWith("$game_saves$\\extensions_order.scop", "rb");

    file.content = "";
    expect(loadExtensionsOrder()).toEqualLuaArrays([]);

    file.content = null;
    expect(loadExtensionsOrder()).toEqualLuaArrays([]);

    file.content = "{}";
    file.isOpen = false;
    expect(loadExtensionsOrder()).toEqualLuaArrays([]);
  });

  it("'syncExtensionsOrder' should correctly apply sorting order", () => {
    const first: IExtensionsDescriptor = { name: "first" } as IExtensionsDescriptor;
    const second: IExtensionsDescriptor = { name: "second" } as IExtensionsDescriptor;
    const third: IExtensionsDescriptor = { name: "third" } as IExtensionsDescriptor;
    const fourth: IExtensionsDescriptor = { name: "fourth" } as IExtensionsDescriptor;

    expect(syncExtensionsOrder($fromArray([first, second, third, fourth]), new LuaTable())).toEqualLuaArrays([
      first,
      fourth,
      second,
      third,
    ]);

    expect(
      syncExtensionsOrder(
        $fromArray([first, second, third, fourth]),
        $fromArray(["fourth", "third", "second", "first"])
      )
    ).toEqualLuaArrays([fourth, third, second, first]);

    expect(
      syncExtensionsOrder($fromArray([first, second, third, fourth]), $fromArray(["second", "another", "fourth"]))
    ).toEqualLuaArrays([second, fourth, first, third]);

    expect(syncExtensionsOrder($fromArray([first, second]), $fromArray(["abc", "def", "second"]))).toEqualLuaArrays([
      second,
      first,
    ]);
  });
});
