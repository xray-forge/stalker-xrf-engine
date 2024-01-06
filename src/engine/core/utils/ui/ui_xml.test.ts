import { describe, expect, it } from "@jest/globals";
import { CScriptXmlInit } from "xray16";

import { resolveXmlFile, resolveXmlFormPath } from "@/engine/core/utils/ui/ui_xml";
import { roots } from "@/engine/lib/constants/roots";
import { MockFileSystem } from "@/fixtures/xray/mocks/fs/FileSystem.mock";

describe("resolveXmlFile util", () => {
  it("should correctly parse provided path", () => {
    expect(resolveXmlFile("test.xml").ParseFile).toHaveBeenCalledWith("test.xml");

    const example: CScriptXmlInit = new CScriptXmlInit();

    expect(resolveXmlFile("another.xml", example)).toBe(example);
    expect(example.ParseFile).toHaveBeenCalledWith("another.xml");
  });

  it("should correctly parse provided path when enabling support of wide screen", () => {
    expect(resolveXmlFile("test.xml").ParseFile).toHaveBeenCalledWith("test.xml");

    MockFileSystem.getInstance().setMock(roots.gameConfig, "ui\\another_with_wide.xml", true);
    MockFileSystem.getInstance().setMock(roots.gameConfig, "ui\\another_with_wide.16.xml", true);

    const example: CScriptXmlInit = new CScriptXmlInit();

    expect(resolveXmlFile("another_with_wide.xml", example, false)).toBe(example);
    expect(example.ParseFile).toHaveBeenCalledWith("another_with_wide.xml");

    expect(resolveXmlFile("another_with_wide.xml", example, true)).toBe(example);
    expect(example.ParseFile).toHaveBeenCalledWith("another_with_wide.16.xml");
  });
});

describe("resolveXmlFormPath util", () => {
  it("should fail on non-windows paths", () => {
    expect(() => resolveXmlFormPath("a/b/c.xml")).toThrow();
    expect(() => resolveXmlFormPath("a/c.xml")).toThrow();
    expect(() => resolveXmlFormPath("/another.xml")).toThrow();
    expect(() => resolveXmlFormPath("another.xml")).not.toThrow();
    expect(() => resolveXmlFormPath("a\\b\\another.xml")).not.toThrow();
    expect(() => resolveXmlFormPath("\\another.xml")).not.toThrow();
  });

  it("should normalize path", () => {
    expect(resolveXmlFormPath("a")).toBe("a.xml");
    expect(resolveXmlFormPath("a.xml")).toBe("a.xml");
    expect(resolveXmlFormPath("a\\b")).toBe("a\\b.xml");
    expect(resolveXmlFormPath("a\\b.xml")).toBe("a\\b.xml");

    MockFileSystem.getInstance().setMock(roots.gameConfig, "ui\\a\\b.16.xml", true);
    MockFileSystem.getInstance().setMock(roots.gameConfig, "ui\\a\\c.16.xml", false);

    expect(resolveXmlFormPath("a", true)).toBe("a.xml");
    expect(resolveXmlFormPath("a\\b", true)).toBe("a\\b.16.xml");
    expect(resolveXmlFormPath("a\\b.xml", true)).toBe("a\\b.16.xml");
    expect(resolveXmlFormPath("a\\c.xml", true)).toBe("a\\c.xml");
  });
});
