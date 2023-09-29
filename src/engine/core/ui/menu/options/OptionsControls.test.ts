import { describe, expect, it } from "@jest/globals";
import { CScriptXmlInit, CUIScriptWnd } from "xray16";

import { OptionsControls } from "@/engine/core/ui/menu/options/OptionsControls";
import { OptionsDialog } from "@/engine/core/ui/menu/options/OptionsDialog";
import { MockCScriptXmlInit, MockCUIScriptWnd } from "@/fixtures/xray";

describe("OptionsControls", () => {
  it("should correctly create", () => {
    const controls: OptionsControls = new OptionsControls();

    expect(controls.WindowName()).toBe(OptionsControls.name);
  });

  it("should correctly initialize", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const options: OptionsDialog = new OptionsDialog(owner);
    const controls: OptionsControls = new OptionsControls();
    const xml: CScriptXmlInit = MockCScriptXmlInit.mock();

    controls.initialize(1, 1, xml, options);

    expect(options.preconditions.length()).toBe(12);
  });
});
