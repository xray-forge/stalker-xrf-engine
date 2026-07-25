import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CUI3tButton, CUIScriptWnd, CUIScrollView, CUIWindow, DIK_keys, ui_events } from "xray16";
import { MockCUIScriptWnd } from "xray16/mocks";

import { EDebugSection } from "@/engine/core/ui/debug/debug_types";
import { DebugDialog } from "@/engine/core/ui/debug/DebugDialog";
import { resetRegistry } from "@/fixtures/engine";

describe("DebugDialog", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize controls", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const dialog: DebugDialog = new DebugDialog(owner);

    expect(dialog.owner).toBe(owner);
    expect(dialog.SetWndRect).toHaveBeenCalledTimes(1);
    expect(dialog.Enable).toHaveBeenCalledWith(true);
    expect(dialog.uiScrollList).toBeInstanceOf(CUIScrollView);
    expect(dialog.uiCancelButton).toBeInstanceOf(CUI3tButton);
    expect(dialog.Register).toHaveBeenCalledWith(dialog.uiCancelButton, "cancel_button");
  });

  it("should register a switcher for every debug section", () => {
    const dialog: DebugDialog = new DebugDialog(MockCUIScriptWnd.mock());
    const sections: Array<string> = Object.values(EDebugSection);
    const registered: Array<string> = jest.mocked(dialog.Register).mock.calls.map(([, id]) => id as string);

    sections.forEach((it) => expect(registered).toContain("section_" + it));

    expect(jest.mocked(dialog.uiScrollList.AddWindow).mock.calls).toHaveLength(sections.length);
  });

  it("should create a component for every mapped section", () => {
    const dialog: DebugDialog = new DebugDialog(MockCUIScriptWnd.mock());

    expect(dialog.sectionsList.length()).toBeGreaterThan(0);
    expect(dialog.AttachChild).toHaveBeenCalledTimes(dialog.sectionsList.length());
  });

  it("should show only the selected section", () => {
    const dialog: DebugDialog = new DebugDialog(MockCUIScriptWnd.mock());

    const shown: Array<[string, boolean]> = [];

    for (const [section, component] of dialog.sectionsList) {
      jest.spyOn(component as CUIWindow, "Show").mockImplementation((isVisible: boolean) => {
        shown.push([section, isVisible]);
      });
    }

    dialog.onSectionSwitchClicked(EDebugSection.OBJECT);

    expect(shown).toContainEqual([EDebugSection.OBJECT, true]);
    expect(shown.filter(([, isVisible]) => isVisible)).toHaveLength(1);
    expect(shown).toHaveLength(dialog.sectionsList.length());
  });

  it("should return to the owner window on cancel", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const dialog: DebugDialog = new DebugDialog(owner);

    jest.spyOn(owner, "Show");

    dialog.onCancelButtonAction();

    expect(owner.ShowDialog).toHaveBeenCalledWith(true);
    expect(owner.Show).toHaveBeenCalledWith(true);
    expect(dialog.HideDialog).toHaveBeenCalledTimes(1);
  });

  it("should close on escape key press only", () => {
    const dialog: DebugDialog = new DebugDialog(MockCUIScriptWnd.mock());

    jest.spyOn(dialog, "onCancelButtonAction").mockImplementation(jest.fn());

    dialog.OnKeyboard(DIK_keys.DIK_A, ui_events.WINDOW_KEY_PRESSED);
    expect(dialog.onCancelButtonAction).not.toHaveBeenCalled();

    dialog.OnKeyboard(DIK_keys.DIK_ESCAPE, ui_events.WINDOW_KEY_RELEASED);
    expect(dialog.onCancelButtonAction).not.toHaveBeenCalled();

    dialog.OnKeyboard(DIK_keys.DIK_ESCAPE, ui_events.WINDOW_KEY_PRESSED);
    expect(dialog.onCancelButtonAction).toHaveBeenCalledTimes(1);
  });
});
