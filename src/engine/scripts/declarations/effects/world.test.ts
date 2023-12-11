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

describe("world effects implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/world");
  });

  it.todo("play_sound should force play sounds");

  it.todo("stop_sound should stop sounds");

  it.todo("play_sound_looped should play looped sounds");

  it.todo("stop_sound_looped should stop looped sounds");

  it.todo("play_sound_by_story should play sound by story id");

  it.todo("reset_sound_npc should reset sound");

  it.todo("barrel_explode should explode objects");

  it.todo("set_game_time should change game time");

  it.todo("forward_game_time should forward game time");

  it.todo("pick_artefact_from_anomaly should pick artefacts from anomalies");

  it.todo("anomaly_turn_off should turn off anomalies");

  it.todo("anomaly_turn_on should turn on anomalies");

  it.todo("turn_off_underpass_lamps should turn off underpass lamps");

  it.todo("turn_off should turn off lamps");

  it.todo("turn_off_object should turn off lamps");

  it.todo("turn_on_and_force should turn on lamps and set force");

  it.todo("turn_off_and_force should turn off lamps and set force");

  it.todo("turn_on_object should turn on lamps");

  it.todo("turn_on should turn on lamps");

  it.todo("set_weather should change weather");

  it.todo("start_surge should start surge");

  it.todo("stop_surge should stop surge");

  it.todo("set_surge_mess_and_task should set surge message and task");

  it.todo("enable_anomaly should enable anomalies");

  it.todo("disable_anomaly should disable anomalies");

  it.todo("launch_signal_rocket should launch signal rockets");

  it.todo("create_cutscene_actor_with_weapon should create cutscenes");

  it.todo("stop_sr_cutscene should stop cutscenes");
});
