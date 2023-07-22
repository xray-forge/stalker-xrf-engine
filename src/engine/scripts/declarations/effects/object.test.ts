import { beforeAll, describe, it } from "@jest/globals";

import { checkXrEffect } from "@/fixtures/engine";

describe("'object' effects declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/object");
  });

  it("should correctly inject external methods for game", () => {
    checkXrEffect("anim_obj_forward");
    checkXrEffect("anim_obj_backward");
    checkXrEffect("anim_obj_stop");
    checkXrEffect("hit_obj");
    checkXrEffect("hit_npc_from_actor");
    checkXrEffect("make_enemy");
    checkXrEffect("sniper_fire_mode");
    checkXrEffect("kill_npc");
    checkXrEffect("remove_npc");
    checkXrEffect("clearAbuse");
    checkXrEffect("disable_combat_handler");
    checkXrEffect("disable_combat_ignore_handler");
    checkXrEffect("spawn_object");
    checkXrEffect("spawn_corpse");
    checkXrEffect("destroy_object");
    checkXrEffect("create_squad");
    checkXrEffect("create_squad_member");
    checkXrEffect("remove_squad");
    checkXrEffect("kill_squad");
    checkXrEffect("heal_squad");
    checkXrEffect("clear_smart_terrain");
    checkXrEffect("update_npc_logic");
    checkXrEffect("update_obj_logic");
    checkXrEffect("hit_npc");
    checkXrEffect("restore_health");
    checkXrEffect("force_obj");
    checkXrEffect("burer_force_gravi_attack");
    checkXrEffect("burer_force_anti_aim");
    checkXrEffect("spawn_object_in");
    checkXrEffect("give_items");
    checkXrEffect("give_item");
    checkXrEffect("disable_memory_object");
    checkXrEffect("set_force_sleep_animation");
    checkXrEffect("release_force_sleep_animation");
    checkXrEffect("set_visual_memory_enabled");
    checkXrEffect("set_monster_animation");
    checkXrEffect("clear_monster_animation");
    checkXrEffect("switch_to_desired_job");
    checkXrEffect("spawn_item_to_npc");
    checkXrEffect("give_money_to_npc");
    checkXrEffect("seize_money_to_npc");
    checkXrEffect("heli_start_flame");
    checkXrEffect("heli_die");
    checkXrEffect("set_bloodsucker_state");
    checkXrEffect("clear_box");
    checkXrEffect("polter_actor_ignore");
  });
});
