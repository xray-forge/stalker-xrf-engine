import * as fs from "fs";

import { describe, expect, it, jest } from "@jest/globals";

import { createDirForConfigs } from "#/utils/fs/create_dir_for_configs";
import { NodeLogger } from "#/utils/logging";

jest.mock("fs");

describe("create_dir_for_configs util", () => {
  it("should correctly call fs methods to create dir", () => {
    const mockLog: NodeLogger = { debug: jest.fn() } as unknown as NodeLogger;

    createDirForConfigs(
      [
        ["from1", "base/to1/something1"],
        ["from2", "base/to2/something2"],
      ],
      mockLog
    );

    expect(fs.existsSync).toHaveBeenCalledTimes(2);
    expect(fs.existsSync).toHaveBeenNthCalledWith(1, "base/to1");
    expect(fs.existsSync).toHaveBeenNthCalledWith(2, "base/to2");

    expect(mockLog.debug).toHaveBeenCalledTimes(2);
    expect(fs.mkdirSync).toHaveBeenCalledTimes(2);
    expect(fs.mkdirSync).toHaveBeenNthCalledWith(1, "base/to1", expect.objectContaining({ recursive: true }));
    expect(fs.mkdirSync).toHaveBeenNthCalledWith(2, "base/to2", expect.objectContaining({ recursive: true }));
  });
});
