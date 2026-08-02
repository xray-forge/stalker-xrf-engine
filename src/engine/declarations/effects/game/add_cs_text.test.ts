import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { CUILines, get_hud } from "xray16";
import { GameHud } from "xray16/alias";
import { Nillable } from "xray16/lib";
import { MockGameObject, MockStaticDrawableWrapper } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/game/add_cs_text");
});

describe("add_cs_text", () => {
  it("should show custom screen text", () => {
    const hud: GameHud = get_hud();

    callXrEffect("add_cs_text", MockGameObject.mockActor(), MockGameObject.mock());

    expect(hud.RemoveCustomStatic).not.toHaveBeenCalled();
    expect(hud.AddCustomStatic).not.toHaveBeenCalled();

    jest
      .spyOn(hud, "GetCustomStatic")
      .mockImplementationOnce(() => MockStaticDrawableWrapper.mock("text_on_screen_center"));

    callXrEffect("add_cs_text", MockGameObject.mockActor(), MockGameObject.mock(), "custom_label");

    expect(hud.RemoveCustomStatic).toHaveBeenCalledWith("text_on_screen_center");
    expect(hud.AddCustomStatic).toHaveBeenCalledTimes(1);
    expect(hud.AddCustomStatic).toHaveBeenCalledWith("text_on_screen_center", true);

    const textControl: Nillable<CUILines> = hud
      .GetCustomStatic("text_on_screen_center")
      ?.wnd()
      .TextControl() as Nillable<CUILines>;

    expect(textControl?.SetText).toHaveBeenCalledTimes(1);
    expect(textControl?.SetText).toHaveBeenCalledWith("translated_custom_label");
  });
});
