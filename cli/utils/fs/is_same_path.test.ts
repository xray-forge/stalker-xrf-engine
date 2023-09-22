import * as os from "os";

import { describe, expect, it, jest } from "@jest/globals";

import { isSamePath } from "#/utils/fs/is_same_path";

jest.mock("os");

describe("is_same_path utils", () => {
  it("should correctly check for win32", () => {
    jest.spyOn(os, "platform").mockImplementation(() => "win32");

    expect(isSamePath("test1", "test2")).toBe(false);
    expect(isSamePath("test", "test")).toBe(true);
    expect(isSamePath("TEst", "test")).toBe(true);
    expect(isSamePath("TEst", "teST")).toBe(true);
  });

  it("should correctly check for unix", () => {
    jest.spyOn(os, "platform").mockImplementation(() => "linux");

    expect(isSamePath("test1", "test2")).toBe(false);
    expect(isSamePath("test", "test")).toBe(true);
    expect(isSamePath("TEst", "test")).toBe(false);
    expect(isSamePath("TEst", "teST")).toBe(false);
  });
});
