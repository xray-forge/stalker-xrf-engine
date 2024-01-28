import { describe, expect, it, jest } from "@jest/globals";
import { get_hud, level } from "xray16";

import { registerActor, registry } from "@/engine/core/database";
import { setUiVisibility } from "@/engine/core/utils/ui/ui_ingame";
import { GameHud, GameObject } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("setUiVisibility util", () => {
  it("should correctly toggle visibility", () => {
    const hud: GameHud = get_hud();

    registerActor(MockGameObject.mockActor());

    setUiVisibility(true);

    expect(level.show_indicators).toHaveBeenCalled();
    expect(registry.actor.disable_hit_marks).toHaveBeenCalledWith(false);
    expect(hud.show_messages).toHaveBeenCalledWith();

    const actor: GameObject = MockGameObject.mockActor();

    jest.spyOn(actor, "is_talking").mockImplementation(() => true);

    registerActor(actor);

    setUiVisibility(false);

    expect(registry.actor.is_talking).toHaveBeenCalled();
    expect(registry.actor.stop_talk).toHaveBeenCalled();
    expect(level.hide_indicators_safe).toHaveBeenCalled();
    expect(hud.HideActorMenu).toHaveBeenCalled();
    expect(hud.HidePdaMenu).toHaveBeenCalled();
    expect(hud.hide_messages).toHaveBeenCalled();
    expect(registry.actor.disable_hit_marks).toHaveBeenCalledWith(true);
  });
});
