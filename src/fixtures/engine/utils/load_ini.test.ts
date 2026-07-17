import { describe, expect, it, jest } from "@jest/globals";

import { loadInGameTestIni } from "@/fixtures/engine/utils/load_ini";
import { readInGameTestLtx } from "@/fixtures/engine/utils/read_ltx";

jest.mock("@/fixtures/engine/utils/read_ltx");

describe("loadInGameTestIni", () => {
  it("should load a self-contained LTX file", async () => {
    jest.mocked(readInGameTestLtx).mockResolvedValue("[test]\nvalue = expected");

    const ini = await loadInGameTestIni("test.ltx");

    expect(ini.section_exist("test")).toBe(true);
    expect(ini.r_string("test", "value")).toBe("expected");
  });

  it("should reject included LTX files", async () => {
    jest.mocked(readInGameTestLtx).mockResolvedValue('#include "shared.ltx"');

    await expect(loadInGameTestIni("test.ltx")).rejects.toThrow("#include is not supported");
  });

  it("should reject inherited LTX sections", async () => {
    jest.mocked(readInGameTestLtx).mockResolvedValue("[child]:parent");

    await expect(loadInGameTestIni("test.ltx")).rejects.toThrow("section inheritance is not supported");
  });
});
