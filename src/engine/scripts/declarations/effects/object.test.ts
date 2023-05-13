import { describe, expect, it } from "@jest/globals";

import { AnyObject, TName } from "@/engine/lib/types";

describe("'object' effects declaration", () => {
  const checkBinding = (name: TName, container: AnyObject = global) => {
    expect(container["xr_effects"][name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/effects/object");

    checkBinding("anim_obj_forward");
    checkBinding("anim_obj_backward");
    checkBinding("anim_obj_stop");
    checkBinding("hit_obj");
    checkBinding("hit_npc_from_actor");
    checkBinding("make_enemy");
    checkBinding("sniper_fire_mode");
    checkBinding("kill_npc");
    checkBinding("remove_npc");
    checkBinding("clearAbuse");
    checkBinding("disable_combat_handler");
    checkBinding("disable_combat_ignore_handler");
    checkBinding("spawn_object");
    checkBinding("spawn_corpse");
    checkBinding("destroy_object");
    checkBinding("create_squad");
    checkBinding("create_squad_member");
    checkBinding("remove_squad");
    checkBinding("kill_squad");
    checkBinding("heal_squad");
    checkBinding("clear_smart_terrain");
    checkBinding("update_npc_logic");
    checkBinding("update_obj_logic");
    checkBinding("hit_npc");
    checkBinding("restore_health");
    checkBinding("force_obj");
    checkBinding("burer_force_gravi_attack");
    checkBinding("burer_force_anti_aim");
    checkBinding("spawn_object_in");
    checkBinding("give_items");
    checkBinding("give_item");
    checkBinding("disable_memory_object");
    checkBinding("set_force_sleep_animation");
    checkBinding("release_force_sleep_animation");
    checkBinding("set_visual_memory_enabled");
    checkBinding("set_monster_animation");
    checkBinding("clear_monster_animation");
    checkBinding("switch_to_desired_job");
    checkBinding("spawn_item_to_npc");
    checkBinding("give_money_to_npc");
    checkBinding("seize_money_to_npc");
    checkBinding("heli_start_flame");
    checkBinding("heli_die");
    checkBinding("set_bloodsucker_state");
    checkBinding("clear_box");
    checkBinding("polter_actor_ignore");
  });
});
