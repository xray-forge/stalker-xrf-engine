import { describe, expect, it, jest } from "@jest/globals";

import { loadObjectFromFile, loadTextFromFile, saveObjectToFile, saveTextToFile } from "@/engine/core/utils/fs/fs_io";
import { AnyObject } from "@/engine/lib/types";
import { MockIoFile } from "@/fixtures/lua";

describe("saveTextToFile util", () => {
  it("should correctly save data", () => {
    const file: MockIoFile = new MockIoFile("test", "wb");

    jest.spyOn(io, "open").mockImplementation(() => $multi(file.asMock()));

    saveTextToFile("base", "example.scopx", "abcdefg");

    expect(lfs.mkdir).toHaveBeenCalledWith("base");
    expect(io.open).toHaveBeenCalledWith("base\\example.scopx", "wb");
    expect(file.write).toHaveBeenCalledWith("abcdefg");
    expect(file.close).toHaveBeenCalledTimes(1);

    expect(file.content).toBe("abcdefg");

    file.isOpen = false;
    saveTextToFile("base\\", "example2.scopx", "aab");

    expect(lfs.mkdir).toHaveBeenCalledWith("base\\");
    expect(io.open).toHaveBeenCalledWith("base\\example2.scopx", "wb");
    expect(file.write).toHaveBeenCalledTimes(1);
    expect(file.content).toBe("abcdefg");
    expect(file.close).toHaveBeenCalledTimes(1);
  });
});

describe("saveObjectToFile util", () => {
  it("should correctly save data", () => {
    const file: MockIoFile = new MockIoFile("test", "wb");

    jest.spyOn(io, "open").mockImplementation(() => $multi(file.asMock()));

    const data: AnyObject = { a: 1, b: 2, c: 3 };

    saveObjectToFile("base\\", "example.scopx", data);

    expect(marshal.encode).toHaveBeenCalledWith(data);
    expect(lfs.mkdir).toHaveBeenCalledWith("base\\");
    expect(io.open).toHaveBeenCalledWith("base\\example.scopx", "wb");
    expect(file.write).toHaveBeenCalledWith(JSON.stringify(data));
    expect(file.close).toHaveBeenCalledTimes(1);

    expect(file.content).toBe(JSON.stringify({ a: 1, b: 2, c: 3 }));

    file.isOpen = false;
    saveObjectToFile("base", "example.scopx", { a: 1000 });

    expect(lfs.mkdir).toHaveBeenCalledWith("base");
    expect(io.open).toHaveBeenCalledWith("base\\example.scopx", "wb");
    expect(file.write).toHaveBeenCalledTimes(1);
    expect(file.content).toBe(JSON.stringify({ a: 1, b: 2, c: 3 }));
    expect(file.close).toHaveBeenCalledTimes(1);
  });
});

describe("loadTextFromFile util", () => {
  it("should correctly load data from files", () => {
    const file: MockIoFile = new MockIoFile("test", "wb");

    file.content = "aabbccdd";

    jest.spyOn(io, "open").mockImplementation(() => $multi(file.asMock()));

    expect(loadTextFromFile("F:\\\\parent\\\\example.scopx")).toBe("aabbccdd");

    expect(io.open).toHaveBeenCalledWith("F:\\\\parent\\\\example.scopx", "rb");
    expect(file.read).toHaveBeenCalledTimes(1);
    expect(file.close).toHaveBeenCalledTimes(1);

    file.content = "";
    expect(loadTextFromFile("F:\\\\parent\\\\example.scopx")).toBeNull();

    file.content = null;
    expect(loadTextFromFile("F:\\\\parent\\\\example.scopx")).toBeNull();

    file.content = "{}";
    file.isOpen = false;
    expect(loadTextFromFile("F:\\\\parent\\\\example.scopx")).toBeNull();
  });
});

describe("loadObjectFromFile util", () => {
  it("should correctly load data from files", () => {
    const file: MockIoFile = new MockIoFile("test", "wb");

    file.content = JSON.stringify({ a: 1, b: 33 });

    jest.spyOn(io, "open").mockImplementation(() => $multi(file.asMock()));

    expect(loadObjectFromFile("F:\\\\parent\\\\example.scopx")).toEqual({ a: 1, b: 33 });

    expect(marshal.decode).toHaveBeenCalledWith(file.content);
    expect(io.open).toHaveBeenCalledWith("F:\\\\parent\\\\example.scopx", "rb");
    expect(file.read).toHaveBeenCalledTimes(1);
    expect(file.close).toHaveBeenCalledTimes(1);

    file.content = "";
    expect(loadObjectFromFile("F:\\\\parent\\\\example.scopx")).toBeNull();

    file.content = null;
    expect(loadObjectFromFile("F:\\\\parent\\\\example.scopx")).toBeNull();

    file.content = "{}";
    file.isOpen = false;
    expect(loadObjectFromFile("F:\\\\parent\\\\example.scopx")).toBeNull();
  });
});
