import { describe, expect, it } from "@jest/globals";

import { AnyObject, TName } from "@/engine/lib/types";

describe("'world' effects declaration", () => {
  const checkBinding = (name: TName, container: AnyObject = global) => {
    expect(container["xr_effects"][name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/effects/world");

    checkBinding("play_sound");
    checkBinding("stop_sound");
    checkBinding("play_sound_looped");
    checkBinding("stop_sound_looped");
    checkBinding("play_sound_by_story");
    checkBinding("reset_sound_npc");
    checkBinding("barrel_explode");
    checkBinding("set_game_time");
    checkBinding("forward_game_time");
    checkBinding("pick_artefact_from_anomaly");
    checkBinding("anomaly_turn_off");
    checkBinding("anomaly_turn_on");
    checkBinding("turn_off_underpass_lamps");
    checkBinding("turn_off");
    checkBinding("turn_off_object");
    checkBinding("turn_on_and_force");
    checkBinding("turn_off_and_force");
    checkBinding("turn_on_object");
    checkBinding("turn_on");
    checkBinding("set_weather");
    checkBinding("start_surge");
    checkBinding("stop_surge");
    checkBinding("set_surge_mess_and_task");
    checkBinding("enable_anomaly");
    checkBinding("disable_anomaly");
    checkBinding("launch_signal_rocket");
    checkBinding("create_cutscene_actor_with_weapon");
    checkBinding("stop_sr_cutscene");
  });
});
