import { describe, expect, it } from "@jest/globals";
import { CUIScriptWnd } from "xray16";

import { Options } from "@/engine/core/ui/menu/options/Options";
import { MockCUIScriptWnd } from "@/fixtures/xray";

describe("Options", () => {
  it("should correctly create window", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const options: Options = new Options(owner);

    expect(options.WindowName()).toBe(Options.name);
  });

  it.todo("should correctly initialize");

  it.todo("should correctly handle key bindings");

  it.todo("should correctly save options");

  it.todo("should correctly change presets");

  it.todo("should correctly change tabs");
});
