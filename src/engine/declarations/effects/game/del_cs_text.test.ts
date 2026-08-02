import { beforeAll, describe, expect, it } from "@jest/globals";
import { get_hud, StaticDrawableWrapper } from "xray16";
import { GameHud } from "xray16/alias";
import { Nillable } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/game/del_cs_text");
  require("@/engine/declarations/effects/game/add_cs_text");
});

describe("del_cs_text", () => {
  it("should remove custom screen text", () => {
    callXrEffect("del_cs_text", MockGameObject.mockActor(), MockGameObject.mock());

    const hud: GameHud = get_hud();
    const csText: Nillable<StaticDrawableWrapper> = hud.GetCustomStatic("text_on_screen_center");

    expect(csText).toBeNull();

    callXrEffect("del_cs_text", MockGameObject.mockActor(), MockGameObject.mock());
    callXrEffect("add_cs_text", MockGameObject.mockActor(), MockGameObject.mock(), "custom");

    const newCsText: Nillable<StaticDrawableWrapper> = hud.GetCustomStatic("text_on_screen_center");

    expect(newCsText).not.toBeNull();

    callXrEffect("del_cs_text", MockGameObject.mockActor(), MockGameObject.mock());

    expect(hud.GetCustomStatic("text_on_screen_center")).toBeNull();
    expect(hud.RemoveCustomStatic).toHaveBeenCalledWith("text_on_screen_center");
  });
});
