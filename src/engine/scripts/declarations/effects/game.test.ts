import { beforeAll, describe, it } from "@jest/globals";

import { checkXrEffect } from "@/fixtures/engine";

describe("game effects declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/game");
  });

  it("should correctly inject external methods for game", () => {
    checkXrEffect("inc_counter");
    checkXrEffect("dec_counter");
    checkXrEffect("set_counter");
    checkXrEffect("game_disconnect");
    checkXrEffect("game_credits");
    checkXrEffect("game_over");
    checkXrEffect("after_credits");
    checkXrEffect("before_credits");
    checkXrEffect("on_tutor_gameover_stop");
    checkXrEffect("on_tutor_gameover_quickload");
    checkXrEffect("stop_tutorial");
    checkXrEffect("scenario_autosave");
    checkXrEffect("mech_discount");
    checkXrEffect("upgrade_hint");
    checkXrEffect("add_cs_text");
    checkXrEffect("del_cs_text");
  });
});
