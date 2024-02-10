import { Stats } from "fs";
import * as fsp from "fs/promises";

import { describe, expect, it, jest } from "@jest/globals";

import { isSymlink } from "#/utils/fs/is_symlink";

jest.mock("fs/promises");

describe("isSymlink", () => {
  it("should correctly check cases with exception", async () => {
    jest.spyOn(fsp, "lstat").mockImplementation(() => Promise.reject("Test error."));

    expect(await isSymlink("test-a")).toBe(false);
    expect(fsp.lstat).toHaveBeenCalledWith("test-a");
  });

  it("should correctly check cases with existing descriptor", async () => {
    jest.spyOn(fsp, "lstat").mockImplementation(() => Promise.resolve({ isSymbolicLink: () => false } as Stats));

    expect(await isSymlink("test-b")).toBe(false);
    expect(fsp.lstat).toHaveBeenCalledWith("test-b");

    jest.spyOn(fsp, "lstat").mockImplementation(() => Promise.resolve({ isSymbolicLink: () => true } as Stats));

    expect(await isSymlink("test-c")).toBe(true);
    expect(fsp.lstat).toHaveBeenCalledWith("test-c");
  });
});
