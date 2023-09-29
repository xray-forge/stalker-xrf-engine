import { describe, expect, it } from "@jest/globals";
import { CScriptXmlInit, CUIScriptWnd } from "xray16";

import { OptionsSound } from "@/engine/core/ui/menu/options/OptionsSound";
import { MockCScriptXmlInit, MockCUIScriptWnd } from "@/fixtures/xray";

describe("OptionsSound", () => {
  it("should correctly create", () => {
    const sound: OptionsSound = new OptionsSound();

    expect(sound.WindowName()).toBe(OptionsSound.name);
  });

  it("should correctly initialize", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const sound: OptionsSound = new OptionsSound();
    const xml: CScriptXmlInit = MockCScriptXmlInit.mock();

    sound.initialize(1, 1, xml);
  });
});
