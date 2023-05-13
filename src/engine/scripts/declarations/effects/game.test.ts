import { describe, expect, it } from "@jest/globals";

import { AnyObject, TName } from "@/engine/lib/types";

describe("'game' effects declaration", () => {
  const checkBinding = (name: TName, container: AnyObject = global) => {
    expect(container["xr_effects"][name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/effects/game");

    checkBinding("inc_counter");
    checkBinding("dec_counter");
    checkBinding("set_counter");
    checkBinding("game_disconnect");
    checkBinding("game_credits");
    checkBinding("game_over");
    checkBinding("after_credits");
    checkBinding("before_credits");
    checkBinding("on_tutor_gameover_stop");
    checkBinding("on_tutor_gameover_quickload");
    checkBinding("stop_tutorial");
    checkBinding("scenario_autosave");
    checkBinding("mech_discount");
    checkBinding("upgrade_hint");
    checkBinding("add_cs_text");
    checkBinding("del_cs_text");
  });
});
