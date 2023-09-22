import * as fs from "fs";
import * as fsp from "fs/promises";

import { describe, expect, it, jest } from "@jest/globals";

import { isDirectory } from "#/utils";

jest.mock("fs/promises");

describe("is_directory utils", () => {
  it("should correctly check", async () => {
    jest.spyOn(fsp, "lstat").mockImplementation(async () => ({ isDirectory: () => true }) as fs.Stats);
    expect(await isDirectory("test")).toBe(true);

    jest.spyOn(fsp, "lstat").mockImplementation(async () => ({ isDirectory: () => false }) as fs.Stats);
    expect(await isDirectory("test")).toBe(false);
  });
});
