import { beforeEach, describe, expect, it } from "@jest/globals";

import { DebugRegistrySection } from "@/engine/core/ui/debug/sections/DebugRegistrySection";
import { resetRegistry } from "@/fixtures/engine";
import { MockCUIScriptWnd, MockCUIWindow } from "@/fixtures/xray";

describe("DebugRegistrySection class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const debugSection: DebugRegistrySection = new DebugRegistrySection(MockCUIScriptWnd.mock(), "test-name");

    expect((debugSection as unknown as MockCUIWindow).windowName).toBe("test-name");
    expect(debugSection.filterIsOnline).toBe(true);
  });

  it("should safely log general report", () => {
    const section: DebugRegistrySection = new DebugRegistrySection(MockCUIScriptWnd.mock(), "test-name");

    expect(() => section.onPrintGeneralReport()).not.toThrow();
  });

  it("should safely handle selected object change", () => {
    const section: DebugRegistrySection = new DebugRegistrySection(MockCUIScriptWnd.mock(), "test-name");

    expect(() => section.onSelectedObjectChange()).not.toThrow();
  });
});
