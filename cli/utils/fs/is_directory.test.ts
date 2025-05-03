import * as fs from "node:fs";
import * as fsp from "node:fs/promises";

import { describe, expect, it, jest } from "@jest/globals";

import { isDirectory } from "#/utils/fs/is_directory";

jest.mock("node:fs/promises");

describe("is_directory util", () => {
  it("should correctly check", async () => {
    jest.spyOn(fsp, "lstat").mockImplementation(async () => ({ isDirectory: () => true }) as fs.Stats);
    expect(await isDirectory("test")).toBe(true);

    jest.spyOn(fsp, "lstat").mockImplementation(async () => ({ isDirectory: () => false }) as fs.Stats);
    expect(await isDirectory("test")).toBe(false);
  });
});
