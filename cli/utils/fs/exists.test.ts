import * as fsp from "fs/promises";

import { describe, expect, it, jest } from "@jest/globals";

import { exists } from "#/utils/fs/exists";

jest.mock("fs/promises");

describe("exists util", () => {
  it("should correctly call exists method to confirm existing", async () => {
    jest.spyOn(fsp, "access").mockImplementation(() => Promise.resolve());

    expect(await exists("test1")).toBe(true);
  });

  it("should correctly call exists method to confirm not existing", async () => {
    jest.spyOn(fsp, "access").mockImplementation(() => Promise.reject());

    expect(await exists("test1")).toBe(false);
  });
});
