import { describe, expect, it } from "@jest/globals";
import { CScriptXmlInit, CUIScriptWnd } from "xray16";

import { Options } from "@/engine/core/ui/menu/options/Options";
import { OptionsVideo } from "@/engine/core/ui/menu/options/OptionsVideo";
import { MockCScriptXmlInit, MockCUIScriptWnd } from "@/fixtures/xray";

describe("OptionsVideo", () => {
  it("should correctly create", () => {
    const video: OptionsVideo = new OptionsVideo();

    expect(video.WindowName()).toBe(OptionsVideo.name);
  });

  it("should correctly initialize", () => {
    const owner: CUIScriptWnd = MockCUIScriptWnd.mock();
    const options: Options = new Options(owner);
    const advanced: OptionsVideo = new OptionsVideo();
    const xml: CScriptXmlInit = MockCScriptXmlInit.mock();

    advanced.initialize(1, 1, xml, options);

    expect(options.preconditions.length()).toBe(12);
  });
});
