import { beforeAll, describe, it } from "@jest/globals";

import { checkXrEffect } from "@/fixtures/engine";

describe("'actor' effects declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/actor");
  });

  it("should correctly inject external methods for game", () => {
    checkXrEffect("disable_ui");
    checkXrEffect("disable_ui_only");
    checkXrEffect("enable_ui");
    checkXrEffect("run_cam_effector");
    checkXrEffect("stop_cam_effector");
    checkXrEffect("disable_actor_nightvision");
    checkXrEffect("enable_actor_nightvision");
    checkXrEffect("disable_actor_torch");
    checkXrEffect("enable_actor_torch");
    checkXrEffect("run_cam_effector_global");
    checkXrEffect("cam_effector_callback");
    checkXrEffect("run_postprocess");
    checkXrEffect("stop_postprocess");
    checkXrEffect("run_tutorial");
    checkXrEffect("give_actor");
    checkXrEffect("remove_item");
    checkXrEffect("drop_object_item_on_point");
    checkXrEffect("relocate_item");
    checkXrEffect("activate_weapon_slot");
    checkXrEffect("save_actor_position");
    checkXrEffect("restore_actor_position");
    checkXrEffect("actor_punch");
    checkXrEffect("send_tip");
    checkXrEffect("give_task");
    checkXrEffect("set_active_task");
    checkXrEffect("kill_actor");
    checkXrEffect("make_actor_visible_to_squad");
    checkXrEffect("sleep");
    checkXrEffect("damage_actor_items_on_start");
    checkXrEffect("activate_weapon");
    checkXrEffect("give_treasure");
    checkXrEffect("get_best_detector");
    checkXrEffect("hide_best_detector");
    checkXrEffect("set_torch_state");
  });
});
