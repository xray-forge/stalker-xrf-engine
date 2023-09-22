import { beforeAll, describe, it } from "@jest/globals";

import { checkXrEffect } from "@/fixtures/engine";

describe("world effects declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/world");
  });

  it("should correctly inject external methods for game", () => {
    checkXrEffect("play_sound");
    checkXrEffect("stop_sound");
    checkXrEffect("play_sound_looped");
    checkXrEffect("stop_sound_looped");
    checkXrEffect("play_sound_by_story");
    checkXrEffect("reset_sound_npc");
    checkXrEffect("barrel_explode");
    checkXrEffect("set_game_time");
    checkXrEffect("forward_game_time");
    checkXrEffect("pick_artefact_from_anomaly");
    checkXrEffect("anomaly_turn_off");
    checkXrEffect("anomaly_turn_on");
    checkXrEffect("turn_off_underpass_lamps");
    checkXrEffect("turn_off");
    checkXrEffect("turn_off_object");
    checkXrEffect("turn_on_and_force");
    checkXrEffect("turn_off_and_force");
    checkXrEffect("turn_on_object");
    checkXrEffect("turn_on");
    checkXrEffect("set_weather");
    checkXrEffect("start_surge");
    checkXrEffect("stop_surge");
    checkXrEffect("set_surge_mess_and_task");
    checkXrEffect("enable_anomaly");
    checkXrEffect("disable_anomaly");
    checkXrEffect("launch_signal_rocket");
    checkXrEffect("create_cutscene_actor_with_weapon");
    checkXrEffect("stop_sr_cutscene");
  });
});
