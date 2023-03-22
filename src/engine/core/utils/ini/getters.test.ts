import { describe, expect, it } from "@jest/globals";

import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
import { mockIniFile } from "@/fixtures/xray/mocks/IniFile.mock";

describe("'getters' utils for ini file", () => {
  it("'readIniString' utils should correctly get data from ini files", () => {
    const iniFile = mockIniFile("example.ltx", {
      section1: {
        a: "a1",
        b: "b2",
      },
    });

    expect(readIniString(iniFile, "section1", "a", true)).toBe("a1");
    expect(readIniString(iniFile, "section1", "b", true)).toBe("b2");

    expect(readIniString(iniFile, "section1", "c", false)).toBeNull();
    expect(readIniString(iniFile, "section1", "c", false, null, "def")).toBe("def");
    expect(() => readIniString(iniFile, "section1", "c", true)).toThrow();

    expect(() => readIniString(iniFile, "section2", "a", true)).toThrow();
    expect(() => readIniString(iniFile, "section2", "a", false)).not.toThrow();
  });

  it("'readIniNumber' utils should correctly get data from ini files", () => {
    const iniFile = mockIniFile("example.ltx", {
      section1: {
        a: 1,
        b: 2,
      },
    });

    expect(readIniNumber(iniFile, "section1", "a", true)).toBe(1);
    expect(readIniNumber(iniFile, "section1", "b", true)).toBe(2);

    expect(readIniNumber(iniFile, "section1", "c", false)).toBeNull();
    expect(readIniNumber(iniFile, "section1", "c", false, 3)).toBe(3);
  });

  it("'readIniBoolean' utils should correctly get data from ini files", () => {
    const iniFile = mockIniFile("example.ltx", {
      section1: {
        a: true,
        b: false,
      },
    });

    expect(readIniBoolean(iniFile, "section1", "a", true)).toBe(true);
    expect(readIniBoolean(iniFile, "section1", "b", true)).toBe(false);
    expect(readIniBoolean(iniFile, "section1", "c", false)).toBe(false);
    expect(readIniBoolean(iniFile, "section1", "c", false, true)).toBe(true);

    expect(() => readIniBoolean(iniFile, "section2", "a", true)).toThrow();
    expect(() => readIniBoolean(iniFile, "section2", "a", false)).not.toThrow();
  });
});
