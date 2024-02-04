import * as fs from "fs";
import * as fsp from "fs/promises";
import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { formatLtx } from "#/format/format_ltx";
import { GAME_DATA_LTX_CONFIGS_DIR } from "#/globals";
import * as fsu from "#/utils/fs";

function readActualFile(path: string): Promise<Buffer> {
  const fsp: { readFile: (path: string) => Promise<Buffer> } = jest.requireActual("fs/promises");

  return fsp.readFile(path);
}

async function verifyFormatting(name: string, sourcePath: string, resultPath: string): Promise<void> {
  const source: Buffer = await readActualFile(sourcePath);
  const result: Buffer = await readActualFile(resultPath);

  jest.spyOn(fs, "access");
  jest.spyOn(fsu, "readDirContent").mockImplementation(async () => [name]);
  jest.spyOn(fsp, "readFile").mockImplementation(async () => source);

  await formatLtx();

  expect(fsu.readDirContent).toHaveBeenCalledWith(GAME_DATA_LTX_CONFIGS_DIR);

  expect(fsp.readFile).toHaveBeenCalledTimes(1);
  expect(fsp.readFile).toHaveBeenCalledWith(name);

  expect(fsp.writeFile).toHaveBeenCalledTimes(1);
  expect(fsp.writeFile).toHaveBeenCalledWith(name, result.toString());
}

jest.mock("fs");
jest.mock("fs/promises");
jest.mock("#/utils/fs");

describe("formatLtx util", () => {
  it("should correctly handle empty lists of configs", async () => {
    jest.spyOn(fs, "access");
    jest.spyOn(fsu, "readDirContent").mockImplementation(async () => []);

    await formatLtx();

    expect(fsu.readDirContent).toHaveBeenCalledWith(GAME_DATA_LTX_CONFIGS_DIR);

    expect(fsp.readFile).not.toHaveBeenCalled();
    expect(fsp.writeFile).not.toHaveBeenCalled();
  });

  it("should correctly handle filtering", async () => {
    jest.spyOn(fs, "access");
    jest
      .spyOn(fsu, "readDirContent")
      .mockImplementation(async () => ["first.ltx", "first.txt", "second.ltx", "third.example"]);
    jest.spyOn(fsp, "readFile").mockImplementation(async () => Buffer.from("", "utf-8"));

    await formatLtx({ filter: ["first"] });

    expect(fsu.readDirContent).toHaveBeenCalledWith(GAME_DATA_LTX_CONFIGS_DIR);

    expect(fsp.readFile).toHaveBeenCalledTimes(1);
    expect(fsp.readFile).toHaveBeenCalledWith("first.ltx");
    expect(fsp.writeFile).toHaveBeenCalledTimes(1);
    expect(fsp.writeFile).toHaveBeenCalledWith("first.ltx", "\r\n");
  });

  it("should correctly handle reading and writing without filter", async () => {
    jest.spyOn(fs, "access");
    jest
      .spyOn(fsu, "readDirContent")
      .mockImplementation(async () => ["first.ltx", "first.txt", "second.ltx", "third.example"]);
    jest.spyOn(fsp, "readFile").mockImplementation(async () => Buffer.from("", "utf-8"));

    await formatLtx();

    expect(fsu.readDirContent).toHaveBeenCalledWith(GAME_DATA_LTX_CONFIGS_DIR);

    expect(fsp.readFile).toHaveBeenCalledTimes(2);
    expect(fsp.readFile).toHaveBeenCalledWith("first.ltx");
    expect(fsp.readFile).toHaveBeenCalledWith("second.ltx");

    expect(fsp.writeFile).toHaveBeenCalledTimes(2);
    expect(fsp.writeFile).toHaveBeenCalledWith("first.ltx", "\r\n");
    expect(fsp.writeFile).toHaveBeenCalledWith("second.ltx", "\r\n");
  });
});

describe("formatLtx samples", () => {
  it("should correctly handle first sample case", async () => {
    await verifyFormatting(
      "first.ltx",
      path.resolve(__dirname, "__test__/first.source.ltx"),
      path.resolve(__dirname, "__test__/first.result.ltx")
    );
  });

  it("should correctly handle second sample case", async () => {
    await verifyFormatting(
      "second.ltx",
      path.resolve(__dirname, "__test__/second.source.ltx"),
      path.resolve(__dirname, "__test__/second.result.ltx")
    );
  });
});
