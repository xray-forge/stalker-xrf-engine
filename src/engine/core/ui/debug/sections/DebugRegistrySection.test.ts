import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ServerObject } from "xray16/alias";
import { MockAlifeSimulator, MockCUIScriptWnd, MockCUIWindow } from "xray16/mocks";

import { registry } from "@/engine/core/database";
import { DebugRegistrySection } from "@/engine/core/ui/debug/sections/DebugRegistrySection";
import { resetRegistry } from "@/fixtures/engine";

/**
 * Controls are assigned by the base constructor before subclass field declarations are defined, so initialization
 * has to be repeated to observe the resulting UI state.
 */
function createSection(): DebugRegistrySection {
  const section: DebugRegistrySection = new DebugRegistrySection(MockCUIScriptWnd.mock(), "test-name");

  section.initializeControls();
  section.initializeCallBacks();
  section.initializeState();

  return section;
}

/**
 * Register a server object so the registry list has content to render.
 */
function addServerObject(id: number, online: boolean): void {
  MockAlifeSimulator.addToRegistry({
    clsid: () => 1,
    id,
    name: () => `object_${id}`,
    online,
    section_name: () => "test_section",
  } as never);
}

describe("DebugRegistrySection", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const debugSection: DebugRegistrySection = new DebugRegistrySection(MockCUIScriptWnd.mock(), "test-name");

    expect((debugSection as unknown as MockCUIWindow).windowName).toBe("test-name");
    expect(debugSection.filterIsOnline).toBe(true);
  });

  it("should not render registry list without simulator", () => {
    const section: DebugRegistrySection = createSection();

    expect(section.uiRegistryFilterOnline.SetCheck).toHaveBeenCalledWith(true);
    expect(section.uiRegistryList.AddTextItem).not.toHaveBeenCalled();
    expect(section.uiRegistryCountLabel.SetText).not.toHaveBeenCalled();
  });

  it("should render only online objects by default", () => {
    addServerObject(6001, true);
    addServerObject(6002, false);
    registry.simulator = MockAlifeSimulator.getInstance();

    const section: DebugRegistrySection = createSection();
    const online: Array<ServerObject> = Object.values(MockAlifeSimulator.registry).filter(
      (it) => (it as unknown as { online: boolean }).online
    ) as unknown as Array<ServerObject>;

    expect(section.uiRegistryList.Clear).toHaveBeenCalled();
    expect(section.uiRegistryList.AddTextItem).toHaveBeenCalledTimes(online.length);
    expect(section.uiRegistryCountLabel.SetText).toHaveBeenCalledWith(`Total: ${online.length}`);
    expect(section.uiRegistryList.AddTextItem).toHaveBeenCalledWith("#6001# - 1 - online - object_6001 - test_section");
  });

  it("should render offline objects when filter is disabled", () => {
    addServerObject(6001, true);
    addServerObject(6002, false);
    registry.simulator = MockAlifeSimulator.getInstance();

    const section: DebugRegistrySection = createSection();

    jest.spyOn(section.uiRegistryFilterOnline, "GetCheck").mockImplementation(() => false);
    jest.mocked(section.uiRegistryList.AddTextItem).mockClear();

    section.onToggleFilterOnline();

    expect(section.filterIsOnline).toBe(false);
    expect(section.uiRegistryList.AddTextItem).toHaveBeenCalledWith(
      "#6002# - 1 - offline - object_6002 - test_section"
    );
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
