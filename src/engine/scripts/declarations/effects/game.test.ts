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

describe("game effects implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/game");
  });

  it.todo("inc_counter should correctly increment portable store count");

  it.todo("dec_counter should correctly decrement portable store count");

  it.todo("set_counter should correctly set portable store count");

  it.todo("game_disconnect should correctly disconnect from game");

  it.todo("game_credits should correctly show game credits");

  it.todo("game_over should correctly trigger game over");

  it.todo("after_credits should show menu after credits");

  it.todo("before_credits should hide menu before credits");

  it.todo("on_tutor_gameover_stop should handle game over scenario stop");

  it.todo("on_tutor_gameover_quickload should handle quick load on game over");

  it.todo("stop_tutorial should handle stop tutorial");

  it.todo("scenario_autosave should create autosaves");

  it.todo("mech_discount should update mechanic discounts");

  it.todo("upgrade_hint should update mechanic hints");

  it.todo("add_cs_text should show custom screen text");

  it.todo("del_cs_text should remove custom screen text");
});
