import { describe, expect, it } from "@jest/globals";

import { SYSTEM_INI } from "@/engine/core/database";
import { overrideSystemIni, unlockSystemIniOverriding } from "@/engine/core/utils/ini";
import { IniFile } from "@/engine/lib/types";
import { MockIniFile } from "@/fixtures/xray";

describe("unlockSystemIniOverriding util", () => {
  it("should allow overriding of system ini", () => {
    unlockSystemIniOverriding();

    expect(SYSTEM_INI.set_readonly).toHaveBeenCalledWith(false);
    expect(SYSTEM_INI.set_override_names).toHaveBeenCalledWith(true);
    expect(SYSTEM_INI.save_at_end).toHaveBeenCalledWith(false);
  });
});

describe("overrideSystemIni util", () => {
  it("should correctly override sections for system ini", () => {
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      first: {
        a: 1,
        b: 2,
      },
      second: {
        c: "string",
        d: false,
      },
    });

    overrideSystemIni(ini);

    expect(SYSTEM_INI.w_string).toHaveBeenCalledTimes(4);
    expect(SYSTEM_INI.w_string).toHaveBeenCalledWith("first", "a", 1);
    expect(SYSTEM_INI.w_string).toHaveBeenCalledWith("first", "b", 2);
    expect(SYSTEM_INI.w_string).toHaveBeenCalledWith("second", "c", "string");
    expect(SYSTEM_INI.w_string).toHaveBeenCalledWith("second", "d", false);
  });
});
