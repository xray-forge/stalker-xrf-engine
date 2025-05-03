import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { collectLog } from "#/build/steps/collect_log";
import { TARGET_DIR } from "#/globals";
import { NodeLogger } from "#/utils/logging";

jest.mock("node:fs");
jest.mock("node:fs/promises");

describe("collectLog build step", () => {
  const logDestination: string = path.resolve(TARGET_DIR, "xrf_build.log");

  beforeEach(() => {
    NodeLogger.LOG_FILE_BUFFER = [];
  });

  it("should correctly handle when log exists", async () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => true);

    NodeLogger.LOG_FILE_BUFFER = ["first-line\n", "second-line\n"];

    await collectLog();

    expect(fs.existsSync).toHaveBeenCalledWith(logDestination);
    expect(fsp.unlink).toHaveBeenCalledWith(logDestination);
    expect(fsp.writeFile).toHaveBeenCalledWith(logDestination, "first-line\nsecond-line\n");
  });

  it("should correctly handle when log does not exist", async () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => false);

    await collectLog();

    expect(fs.existsSync).toHaveBeenCalledWith(logDestination);
    expect(fsp.unlink).not.toHaveBeenCalled();
    expect(fsp.writeFile).toHaveBeenCalledWith(logDestination, "");
  });
});
