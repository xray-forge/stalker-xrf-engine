import { describe, expect, it } from "@jest/globals";

import { AnyObject, TName } from "@/engine/lib/types";

describe("'actor' effects declaration", () => {
  const checkBinding = (name: TName, container: AnyObject = global) => {
    expect(container["xr_effects"][name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/effects/actor");

    checkBinding("disable_ui");
    checkBinding("disable_ui_only");
    checkBinding("enable_ui");
    checkBinding("run_cam_effector");
    checkBinding("stop_cam_effector");
    checkBinding("disable_actor_nightvision");
    checkBinding("enable_actor_nightvision");
    checkBinding("disable_actor_torch");
    checkBinding("enable_actor_torch");
    checkBinding("run_cam_effector_global");
    checkBinding("cam_effector_callback");
    checkBinding("run_postprocess");
    checkBinding("stop_postprocess");
    checkBinding("run_tutorial");
    checkBinding("give_actor");
    checkBinding("remove_item");
    checkBinding("drop_object_item_on_point");
    checkBinding("relocate_item");
    checkBinding("activate_weapon_slot");
    checkBinding("save_actor_position");
    checkBinding("restore_actor_position");
    checkBinding("actor_punch");
    checkBinding("send_tip");
    checkBinding("give_task");
    checkBinding("set_active_task");
    checkBinding("kill_actor");
    checkBinding("make_actor_visible_to_squad");
    checkBinding("sleep");
    checkBinding("damage_actor_items_on_start");
    checkBinding("activate_weapon");
    checkBinding("give_treasure");
    checkBinding("get_best_detector");
    checkBinding("hide_best_detector");
    checkBinding("set_torch_state");
  });
});
