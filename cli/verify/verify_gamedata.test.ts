import * as cp from "node:child_process";

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { replaceFunctionMock } from "xray16/testing/utils";

import { TARGET_GAME_DATA_DIR, XRF_UTILS_PATH } from "#/globals";
import { verifyGamedata } from "#/verify/verify_gamedata";

jest.mock("node:child_process");

describe("verifyGamedata", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    replaceFunctionMock(cp.execFileSync, () => Buffer.from(""));
  });

  it("should verify assembled gamedata", async () => {
    await verifyGamedata();

    expect(cp.execFileSync).toHaveBeenCalledWith(XRF_UTILS_PATH, ["verify-gamedata", TARGET_GAME_DATA_DIR], {
      stdio: "inherit",
    });
  });

  it("should enable verbose validator output", async () => {
    await verifyGamedata({ verbose: true });

    expect(cp.execFileSync).toHaveBeenCalledWith(XRF_UTILS_PATH, ["verify-gamedata", TARGET_GAME_DATA_DIR, "-v"], {
      stdio: "inherit",
    });
  });

  it("should propagate validator failures", async () => {
    replaceFunctionMock(cp.execFileSync, () => {
      throw new Error("verification failed");
    });

    await expect(verifyGamedata()).rejects.toThrow("verification failed");
  });
});
