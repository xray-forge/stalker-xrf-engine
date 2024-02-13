import { describe, expect, it, jest } from "@jest/globals";

import { ILinkCommandParameters, linkFolders } from "#/link/link";
import { relinkFolders } from "#/link/relink";
import { unlinkFolders } from "#/link/unlink";

import { replaceFunctionMockOnce } from "@/fixtures/jest";

jest.mock("#/link/link");
jest.mock("#/link/unlink");

describe("relinkFolders util", () => {
  it("should correctly relink existing files", async () => {
    const parameters: ILinkCommandParameters = {};

    await relinkFolders(parameters);

    expect(unlinkFolders).toHaveBeenCalledTimes(1);
    expect(linkFolders).toHaveBeenCalledTimes(1);
    expect(linkFolders).toHaveBeenCalledWith(parameters);
  });

  it("should gracefully handle errors", async () => {
    replaceFunctionMockOnce(unlinkFolders, async () => Promise.reject(new Error("Test.")));

    const parameters: ILinkCommandParameters = {};

    await expect(relinkFolders(parameters)).resolves.not.toThrow();
  });
});
