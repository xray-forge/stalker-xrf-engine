import { describe, expect, it } from "@jest/globals";
import { CScriptXmlInit } from "xray16";
import { MockCScriptXmlInit } from "xray16/mocks";

import { OptionsSound } from "@/engine/core/ui/menu/options/OptionsSound";

describe("OptionsSound", () => {
  it("should correctly create", () => {
    const sound: OptionsSound = new OptionsSound();

    expect(sound.WindowName()).toBe(OptionsSound.name);
  });

  it("should correctly initialize", () => {
    const sound: OptionsSound = new OptionsSound();
    const xml: CScriptXmlInit = MockCScriptXmlInit.mock();

    sound.initialize(1, 1, xml);
  });
});
