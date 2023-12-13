import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";

import { registerStoryLink } from "@/engine/core/database";
import { misc } from "@/engine/lib/constants/items/misc";
import { FALSE, TRUE } from "@/engine/lib/constants/words";
import { GameObject } from "@/engine/lib/types";
import { callXrEffect, checkXrEffect, resetRegistry } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

describe("object effects declaration", () => {
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
    checkXrEffect("clear_abuse");
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
    checkXrEffect("set_torch_state");
  });
});

describe("object effects implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/object");
  });

  beforeEach(() => {
    resetRegistry();
  });

  it.todo("anim_obj_forward should correctly play forward animation");

  it.todo("anim_obj_backward should correctly play backward animation");

  it.todo("anim_obj_backward should correctly stop animation");

  it.todo("hit_obj should hit object based on parameters");

  it.todo("hit_npc_from_actor should hit object from actor");

  it.todo("make_enemy should make object enemy to actor");

  it.todo("sniper_fire_mode should set object as sniper");

  it.todo("kill_npc should kill object");

  it.todo("remove_npc should remove object");

  it.todo("clear_abuse should clear abuse state");

  it.todo("disable_combat_handler should stop actor from participating in combat");

  it.todo("disable_combat_ignore_handler should disable combat ignore state");

  it.todo("spawn_object should spawn objects");

  it.todo("spawn_object_in should spawn objects in other objects");

  it.todo("spawn_corpse should spawn corpses");

  it.todo("destroy_object should destroy objects");

  it.todo("create_squad should correctly create squads");

  it.todo("create_squad_member should correctly create squad members");

  it.todo("remove_squad should correctly remove squads");

  it.todo("kill_squad should correctly kill squads");

  it.todo("heal_squad should correctly heal squads");

  it.todo("clear_smart_terrain should correctly clear smart terrains");

  it.todo("update_npc_logic should correctly update npc logics");

  it.todo("update_obj_logic should correctly update object logics");

  it.todo("hit_npc should correctly hit objects");

  it.todo("restore_health should correctly restore health of object");

  it.todo("force_obj should set const force for objects");

  it.todo("burer_force_gravi_attack should force burrer attack");

  it.todo("burer_force_anti_aim should force attack reset");

  it.todo("give_items should give items for object");

  it.todo("give_item should give item for object");

  it.todo("disable_memory_object should disable memory object");

  it.todo("set_force_sleep_animation should force sleep animation");

  it.todo("release_force_sleep_animation should stop forced sleep animation");

  it.todo("set_visual_memory_enabled should enable visual memory");

  it.todo("set_monster_animation should set animations for monsters");

  it.todo("clear_monster_animation should clear animations for monsters");

  it.todo("switch_to_desired_job should switch objects to desired jobs");

  it.todo("spawn_item_to_npc should spawn items for objects");

  it.todo("give_money_to_npc should give money for objects");

  it.todo("seize_money_to_npc should get money from objects");

  it.todo("heli_start_flame should start flame");

  it.todo("heli_die should kill heli");

  it.todo("set_bloodsucker_state should switch bloodsuckers");

  it.todo("clear_box should clear boxes");

  it("polter_actor_ignore should force poltergeist to ignore actor", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("polter_actor_ignore", MockGameObject.mockActor(), object, TRUE);
    expect(object.poltergeist_set_actor_ignore).toHaveBeenCalledTimes(1);
    expect(object.poltergeist_set_actor_ignore).toHaveBeenCalledWith(true);

    callXrEffect("polter_actor_ignore", MockGameObject.mockActor(), object, FALSE);
    expect(object.poltergeist_set_actor_ignore).toHaveBeenCalledTimes(2);
    expect(object.poltergeist_set_actor_ignore).toHaveBeenCalledWith(false);
  });

  it("set_torch_state should switch actor torch state", () => {
    const torch: GameObject = MockGameObject.mock({ section: <T>() => misc.device_torch as T });
    const object: GameObject = MockGameObject.mock({ inventory: [[misc.device_torch, torch]] });

    registerStoryLink(object.id(), "test-sid");

    expect(() => callXrEffect("set_torch_state", MockGameObject.mockActor(), object, "test-sid")).toThrow(
      "Not enough parameters in 'set_torch_state' function effect."
    );

    callXrEffect("set_torch_state", MockGameObject.mockActor(), object, "test-sid", "on");
    expect(torch.enable_attachable_item).toHaveBeenCalledTimes(1);
    expect(torch.enable_attachable_item).toHaveBeenCalledWith(true);

    callXrEffect("set_torch_state", MockGameObject.mockActor(), object, "test-sid", "off");
    expect(torch.enable_attachable_item).toHaveBeenCalledTimes(2);
    expect(torch.enable_attachable_item).toHaveBeenCalledWith(false);
  });
});
