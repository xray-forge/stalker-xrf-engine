import { describe, expect, it, jest } from "@jest/globals";
import { get_hud, level } from "xray16";

import { registerActor, registry } from "@/engine/core/database";
import { setUiVisibility } from "@/engine/core/utils/ui/ui_generic";
import { GameHud } from "@/engine/lib/types";
import { mockActorClientGameObject } from "@/fixtures/xray";

describe("'ui' utils", () => {
  it("'setUiVisibility' should correctly toggle visibility", () => {
    const hud: GameHud = get_hud();

    registerActor(mockActorClientGameObject());

    setUiVisibility(true);

    expect(level.show_indicators).toHaveBeenCalled();
    expect(registry.actor.disable_hit_marks).toHaveBeenCalledWith(false);
    expect(hud.show_messages).toHaveBeenCalledWith();

    registerActor(mockActorClientGameObject({ is_talking: jest.fn(() => true) }));

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
