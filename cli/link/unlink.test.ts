import * as fsp from "fs/promises";

import { beforeAll, describe, expect, it, jest } from "@jest/globals";

import { unlinkFolders } from "#/link/unlink";
import { getGamePaths } from "#/utils/fs/get_game_paths";

import { replaceFunctionMock } from "@/fixtures/jest";

jest.mock("fs/promises");
jest.mock("#/utils/fs/get_game_paths");

jest.mock("#/globals/paths", () => ({
  TARGET_GAME_LINK_DIR: "game-path",
  TARGET_LOGS_LINK_DIR: "logs-path",
}));

describe("unlinkFolders util", () => {
  beforeAll(() => {
    replaceFunctionMock(getGamePaths, async () => ({ gamedata: "gamedata-path" }));
  });

  it("should correctly unlink existing files", async () => {
    jest.spyOn(fsp, "readlink").mockImplementation(async (target) => target as string);

    await unlinkFolders();

    expect(fsp.unlink).toHaveBeenCalledTimes(3);
    expect(fsp.unlink).toHaveBeenCalledWith("gamedata-path");
    expect(fsp.unlink).toHaveBeenCalledWith("logs-path");
    expect(fsp.unlink).toHaveBeenCalledWith("game-path");
  });

  it("should correctly unlink existing files", async () => {
    jest.spyOn(fsp, "readlink").mockImplementation(() => Promise.reject("Test."));

    await unlinkFolders();

    expect(fsp.unlink).toHaveBeenCalledTimes(0);
  });

  it("should gracefully handle unlink errors", async () => {
    jest.spyOn(fsp, "readlink").mockImplementation(async (target) => target as string);
    jest.spyOn(fsp, "unlink").mockImplementation(() => Promise.reject(new Error("Test.")));

    await expect(unlinkFolders()).resolves.not.toThrow();
    expect(fsp.unlink).toHaveBeenCalledTimes(1);
  });
});
