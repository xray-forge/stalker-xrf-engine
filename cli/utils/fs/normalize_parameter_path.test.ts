import * as path from "path";

import { describe, expect, it } from "@jest/globals";

import { normalizeParameterPath } from "#/utils/fs/nornamize_parameter_path";

describe("normalize_parameter_path utils", () => {
  const sep: string = path.sep;

  it("should correctly normalize with separator", () => {
    expect(normalizeParameterPath("test1")).toBe("test1");
    expect(normalizeParameterPath("..\\test1")).toBe(`..${sep}test1`);
    expect(normalizeParameterPath(".\\test1")).toBe(`.${sep}test1`);
  });
});
