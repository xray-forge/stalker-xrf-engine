import { describe, expect, it } from "@jest/globals";
import { CScriptXmlInit, CUIScriptWnd } from "xray16";

import { OptionsDialog } from "@/engine/core/ui/menu/options/OptionsDialog";
import { OptionsGameplay } from "@/engine/core/ui/menu/options/OptionsGameplay";
import { MockCScriptXmlInit, MockCUIScriptWnd } from "@/fixtures/xray";

describe("OptionsVideoAdvanced", () => {
  it("should correctly create", () => {
    const gameplay: OptionsGameplay = new OptionsGameplay();

    expect(gameplay.WindowName()).toBe(OptionsGameplay.name);
  });

  it("should correctly initialize", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const options: OptionsDialog = new OptionsDialog(owner);
    const gameplay: OptionsGameplay = new OptionsGameplay();
    const xml: CScriptXmlInit = MockCScriptXmlInit.mock();

    gameplay.initialize(1, 1, xml, options);

    expect(options.preconditions.length()).toBe(12);
  });
});
