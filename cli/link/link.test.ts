import * as fsp from "fs/promises";

import { beforeAll, describe, expect, it, jest } from "@jest/globals";

import { ILinkCommandParameters, linkFolders } from "#/link/link";
import { getGamePaths } from "#/utils/fs/get_game_paths";

import { replaceFunctionMock } from "@/fixtures/jest";

jest.mock("fs/promises");
jest.mock("#/utils/fs/get_game_paths");

jest.mock("#/globals/paths", () => ({
  TARGET_GAME_LINK_DIR: "game-path",
  TARGET_LOGS_LINK_DIR: "logs-path",
  TARGET_GAME_DATA_DIR: "target-gamedata-path",
}));

describe("unlinkFolders util", () => {
  beforeAll(() => {
    replaceFunctionMock(getGamePaths, async () => ({
      gamedata: "gamedata-path",
      root: "root-path",
      logs: "logs-path",
    }));
  });

  it("should correctly link folders with force flag", async () => {
    jest.spyOn(fsp, "readlink").mockImplementation(async (target) => target as string);
    jest.spyOn(fsp, "access").mockImplementation(async () => void 0);
    jest.spyOn(fsp, "readlink").mockImplementation(async () => "test-link");

    const parameters: ILinkCommandParameters = { force: true };

    await linkFolders(parameters);

    expect(fsp.rm).toHaveBeenCalledTimes(3);
    expect(fsp.rm).toHaveBeenCalledWith("game-path", { recursive: true });
    expect(fsp.rm).toHaveBeenCalledWith("gamedata-path", { recursive: true });
    expect(fsp.rm).toHaveBeenCalledWith("logs-path", { recursive: true });

    expect(fsp.symlink).toHaveBeenCalledTimes(3);
    expect(fsp.symlink).toHaveBeenCalledWith("root-path", "game-path", "junction");
    expect(fsp.symlink).toHaveBeenCalledWith("root-path", "game-path", "junction");
    expect(fsp.symlink).toHaveBeenCalledWith("logs-path", "logs-path", "junction");
  });

  it("should correctly link folders without force flag", async () => {
    jest.spyOn(fsp, "readlink").mockImplementation(async (target) => target as string);
    jest.spyOn(fsp, "access").mockImplementation(() => Promise.reject());
    jest.spyOn(fsp, "readlink").mockImplementation(async () => "test-link");

    const parameters: ILinkCommandParameters = {};

    await linkFolders(parameters);

    expect(fsp.rm).toHaveBeenCalledTimes(0);

    expect(fsp.symlink).toHaveBeenCalledTimes(3);
    expect(fsp.symlink).toHaveBeenCalledWith("root-path", "game-path", "junction");
    expect(fsp.symlink).toHaveBeenCalledWith("root-path", "game-path", "junction");
    expect(fsp.symlink).toHaveBeenCalledWith("logs-path", "logs-path", "junction");
  });

  it("should skip link folders without force flag", async () => {
    jest.spyOn(fsp, "readlink").mockImplementation(async (target) => target as string);
    jest.spyOn(fsp, "access").mockImplementation(async () => void 0);
    jest.spyOn(fsp, "readlink").mockImplementation(async () => "test-link");

    const parameters: ILinkCommandParameters = {};

    await linkFolders(parameters);

    expect(fsp.rm).toHaveBeenCalledTimes(0);
    expect(fsp.symlink).toHaveBeenCalledTimes(0);
  });

  it("should gracefully stop on error", async () => {
    jest.spyOn(fsp, "readlink").mockImplementation(async (target) => target as string);
    jest.spyOn(fsp, "access").mockImplementation(() => Promise.reject());
    jest.spyOn(fsp, "readlink").mockImplementation(async () => "test-link");
    jest.spyOn(fsp, "symlink").mockImplementationOnce(() => Promise.reject(new Error("Test.")));

    const parameters: ILinkCommandParameters = {};

    await expect(linkFolders(parameters)).resolves.not.toThrow();

    expect(fsp.rm).toHaveBeenCalledTimes(0);
    expect(fsp.symlink).toHaveBeenCalledTimes(1);
  });
});
