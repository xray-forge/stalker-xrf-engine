import { describe, expect, it } from "@jest/globals";
import { CScriptXmlInit, CUIScriptWnd } from "xray16";

import { OptionsDialog } from "@/engine/core/ui/menu/options/OptionsDialog";
import { OptionsVideoAdvanced } from "@/engine/core/ui/menu/options/OptionsVideoAdvanced";
import { MockCScriptXmlInit, MockCUIScriptWnd } from "@/fixtures/xray";

describe("OptionsVideoAdvanced", () => {
  it("should correctly create", () => {
    const advanced: OptionsVideoAdvanced = new OptionsVideoAdvanced();

    expect(advanced.WindowName()).toBe(OptionsVideoAdvanced.name);
  });

  it("should correctly initialize", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const options: OptionsDialog = new OptionsDialog(owner);
    const advanced: OptionsVideoAdvanced = new OptionsVideoAdvanced();
    const xml: CScriptXmlInit = MockCScriptXmlInit.mock();

    advanced.initialize(1, 2, xml, options);

    expect(options.preconditions.length()).toBe(23);
  });
});
