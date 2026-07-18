import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyCallable, FALSE, TRUE } from "xray16/lib";
import { MockAlifeObject, MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import {
  IRegistryObjectState,
  registerObject,
  registerSimulator,
  registerStoryLink,
  registry,
} from "@/engine/core/database";
import { ISchemeMobCombatState } from "@/engine/core/schemes/monster/mob_combat";
import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/stalker/combat_ignore";
import { getSchemeState, setSchemeState } from "@/engine/core/schemes/state";
import { misc } from "@/engine/lib/constants/items/misc";
import { EScheme } from "@/engine/lib/types";
import { callXrEffect, checkXrEffect, mockSchemeState, resetRegistry } from "@/fixtures/engine";

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

  it("anim_obj_forward should correctly play forward animation", () => {
    const firstDoor = { startAnimation: jest.fn(), stopAnimation: jest.fn() };
    const secondDoor = { startAnimation: jest.fn(), stopAnimation: jest.fn() };

    registry.doors.set("first-door", firstDoor as never);
    registry.doors.set("second-door", secondDoor as never);

    callXrEffect("anim_obj_forward", MockGameObject.mockActor(), MockGameObject.mock(), "first-door", "second-door");

    expect(firstDoor.startAnimation).toHaveBeenCalledWith(true);
    expect(secondDoor.startAnimation).toHaveBeenCalledWith(true);
  });

  it("anim_obj_backward should correctly play backward animation", () => {
    const firstDoor = { startAnimation: jest.fn(), stopAnimation: jest.fn() };
    const secondDoor = { startAnimation: jest.fn(), stopAnimation: jest.fn() };

    registry.doors.set("first-door", firstDoor as never);
    registry.doors.set("second-door", secondDoor as never);

    callXrEffect("anim_obj_backward", MockGameObject.mockActor(), MockGameObject.mock(), "first-door", "second-door");

    expect(firstDoor.startAnimation).toHaveBeenCalledWith(false);
    expect(secondDoor.startAnimation).toHaveBeenCalledWith(false);
  });

  it("anim_obj_stop should correctly stop animation", () => {
    const firstDoor = { startAnimation: jest.fn(), stopAnimation: jest.fn() };
    const secondDoor = { startAnimation: jest.fn(), stopAnimation: jest.fn() };

    registry.doors.set("first-door", firstDoor as never);
    registry.doors.set("second-door", secondDoor as never);

    callXrEffect("anim_obj_stop", MockGameObject.mockActor(), MockGameObject.mock(), "first-door", "second-door");

    expect(firstDoor.stopAnimation).toHaveBeenCalledTimes(1);
    expect(secondDoor.stopAnimation).toHaveBeenCalledTimes(1);
  });

  it("hit_obj should hit object based on parameters", () => {
    const source: GameObject = MockGameObject.mock();
    const target: GameObject = MockGameObject.mock();

    registerObject(target);
    registerStoryLink(target.id(), "target");

    callXrEffect("hit_obj", MockGameObject.mockActor(), source, "target", "bone", 0.25, 10, null);

    expect(target.hit).toHaveBeenCalledWith(
      expect.objectContaining({ boneName: "bone", draftsman: source, impulse: 10, power: 0.25 })
    );
  });

  it("hit_npc_from_actor should hit object from actor", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const target: GameObject = MockGameObject.mock();

    callXrEffect("hit_npc_from_actor", actor, target);

    expect(target.hit).toHaveBeenCalledWith(
      expect.objectContaining({ boneName: "bip01_spine", draftsman: actor, impulse: 0.001, power: 0.001 })
    );
  });

  it("make_enemy should make object enemy to actor", () => {
    const source: GameObject = MockGameObject.mock();
    const target: GameObject = MockGameObject.mock();

    registerObject(source);
    registerStoryLink(source.id(), "source");

    callXrEffect("make_enemy", MockGameObject.mockActor(), target, "source");

    expect(target.hit).toHaveBeenCalledWith(
      expect.objectContaining({ boneName: "bip01_spine", draftsman: source, impulse: 0.03, power: 0.03 })
    );
  });

  it("sniper_fire_mode should set object as sniper", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("sniper_fire_mode", MockGameObject.mockActor(), object, TRUE);
    expect(object.sniper_fire_mode).toHaveBeenCalledWith(true);

    callXrEffect("sniper_fire_mode", MockGameObject.mockActor(), object, FALSE);
    expect(object.sniper_fire_mode).toHaveBeenCalledWith(false);
  });

  it("kill_npc should kill an alive object only", () => {
    const alive: GameObject = MockGameObject.mock({ alive: true });
    const dead: GameObject = MockGameObject.mock({ alive: false });

    callXrEffect("kill_npc", MockGameObject.mockActor(), alive);
    callXrEffect("kill_npc", MockGameObject.mockActor(), dead);

    expect(alive.kill).toHaveBeenCalledWith(alive);
    expect(dead.kill).not.toHaveBeenCalled();
  });

  it("remove_npc should remove the server object linked by story id", () => {
    const serverObject = MockAlifeObject.create();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(serverObject);
    registerStoryLink(serverObject.id, "target");

    callXrEffect("remove_npc", MockGameObject.mockActor(), MockGameObject.mock(), "target");

    expect(registry.simulator.release).toHaveBeenCalledWith(serverObject, true);
  });

  it("clear_abuse should clear abuse state", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const abuseManager = { clearAbuse: jest.fn() };

    setSchemeState(state, EScheme.ABUSE, { abuseManager } as unknown as ISchemeAbuseState);

    callXrEffect("clear_abuse", MockGameObject.mockActor(), object);

    expect(abuseManager.clearAbuse).toHaveBeenCalledTimes(1);
  });

  it("disable_combat_handler should disable every registered combat handler", () => {
    const object: GameObject = MockGameObject.mock();
    const state = registerObject(object);

    setSchemeState(state, EScheme.COMBAT, mockSchemeState<ISchemeCombatState>(EScheme.COMBAT, { enabled: true }));
    setSchemeState(
      state,
      EScheme.MOB_COMBAT,
      mockSchemeState<ISchemeMobCombatState>(EScheme.MOB_COMBAT, { enabled: true })
    );

    callXrEffect("disable_combat_handler", MockGameObject.mockActor(), object);

    expect(getSchemeState(state, EScheme.COMBAT)?.enabled).toBe(false);
    expect(getSchemeState(state, EScheme.MOB_COMBAT)?.enabled).toBe(false);
  });

  it("disable_combat_ignore_handler should disable combat ignore state", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    setSchemeState(
      state,
      EScheme.COMBAT_IGNORE,
      mockSchemeState<ISchemeCombatIgnoreState>(EScheme.COMBAT_IGNORE, { enabled: true })
    );

    callXrEffect("disable_combat_ignore_handler", MockGameObject.mockActor(), object);

    expect(getSchemeState(state, EScheme.COMBAT_IGNORE)?.enabled).toBe(false);
  });

  it.todo("spawn_object should spawn objects");

  it("spawn_object_in should spawn objects in the server inventory of the story target", () => {
    const serverObject = MockAlifeObject.create();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(serverObject);
    registerStoryLink(serverObject.id, "target");

    callXrEffect("spawn_object_in", MockGameObject.mockActor(), MockGameObject.mock(), "test-item", "target");

    expect(registry.simulator.create).toHaveBeenCalledWith("test-item", expect.anything(), 0, 0, serverObject.id);
  });

  it.todo("spawn_corpse should spawn corpses");

  it("destroy_object should release linked objects and reject incomplete target descriptors", () => {
    const object: GameObject = MockGameObject.mock();
    const serverObject = MockAlifeObject.create({ id: object.id() });
    const targetObject = MockAlifeObject.create();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(serverObject);
    MockAlifeSimulator.addToRegistry(targetObject);
    registerStoryLink(targetObject.id, "target");

    callXrEffect("destroy_object", MockGameObject.mockActor(), object);

    expect(() => callXrEffect("destroy_object", MockGameObject.mockActor(), object, "story")).toThrow(
      "Wrong parameters in destroy_object function."
    );

    callXrEffect("destroy_object", MockGameObject.mockActor(), object, "story", "target");

    expect(registry.simulator.release).toHaveBeenCalledWith(serverObject, true);
    expect(registry.simulator.release).toHaveBeenCalledWith(targetObject, true);
  });

  it.todo("create_squad should correctly create squads");

  it.todo("create_squad_member should correctly create squad members");

  it.todo("remove_squad should correctly remove squads");

  it.todo("kill_squad should correctly kill squads");

  it.todo("heal_squad should correctly heal squads");

  it.todo("clear_smart_terrain should correctly clear smart terrains");

  it.todo("update_npc_logic should correctly update npc logics");

  it.todo("update_obj_logic should correctly update object logics");

  it("hit_npc should correctly hit objects", () => {
    const object: GameObject = MockGameObject.mock();
    const hitter: GameObject = MockGameObject.mock();

    registerObject(hitter);
    registerStoryLink(hitter.id(), "hitter");

    callXrEffect("hit_npc", MockGameObject.mockActor(), object, "hitter", null, "bone", 0.25, 10, FALSE);

    expect(object.hit).toHaveBeenCalledWith(
      expect.objectContaining({ boneName: "bone", draftsman: object, impulse: 10, power: 0.25 })
    );
  });

  it("restore_health should correctly restore health of object", () => {
    const object: GameObject = MockGameObject.mock({ health: 0.2 });

    callXrEffect("restore_health", MockGameObject.mockActor(), object);

    expect(object.health).toBe(1);
  });

  it("force_obj should set supplied and default upward force values for a story object", () => {
    const target: GameObject = MockGameObject.mock();

    registerObject(target);
    registerStoryLink(target.id(), "target");

    callXrEffect("force_obj", MockGameObject.mockActor(), MockGameObject.mock(), "target");
    callXrEffect("force_obj", MockGameObject.mockActor(), MockGameObject.mock(), "target", 42, 500);

    expect(target.set_const_force).toHaveBeenNthCalledWith(1, expect.anything(), 20, 100);
    expect(target.set_const_force).toHaveBeenNthCalledWith(2, expect.anything(), 42, 500);
  });

  it("burer_force_gravi_attack should force burrer attack", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "burer_set_force_gravi_attack").mockImplementation(jest.fn());

    callXrEffect("burer_force_gravi_attack", MockGameObject.mockActor(), object);

    expect(object.burer_set_force_gravi_attack).toHaveBeenCalledTimes(1);
    expect(object.burer_set_force_gravi_attack).toHaveBeenCalledWith(true);
  });

  it("burer_force_anti_aim should force attack reset", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "set_force_anti_aim").mockImplementation(jest.fn());

    callXrEffect("burer_force_anti_aim", MockGameObject.mockActor(), object);

    expect(object.set_force_anti_aim).toHaveBeenCalledTimes(1);
    expect(object.set_force_anti_aim).toHaveBeenCalledWith(true);
  });

  it("give_items should spawn every requested item in the linked object inventory", () => {
    const object: GameObject = MockGameObject.mock();

    registerSimulator();

    callXrEffect("give_items", MockGameObject.mockActor(), object, "item-a", "item-b");

    expect(registry.simulator.create).toHaveBeenCalledTimes(2);
    expect(registry.simulator.create).toHaveBeenNthCalledWith(
      1,
      "item-a",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
    expect(registry.simulator.create).toHaveBeenNthCalledWith(
      2,
      "item-b",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
  });

  it("give_item should give an item to the linked server object", () => {
    const object: GameObject = MockGameObject.mock();
    const serverObject = MockAlifeObject.create({ id: object.id() });

    registerSimulator();
    MockAlifeSimulator.addToRegistry(serverObject);

    callXrEffect("give_item", MockGameObject.mockActor(), object, "test-item");

    expect(registry.simulator.create).toHaveBeenCalledWith(
      "test-item",
      serverObject.position,
      serverObject.m_level_vertex_id,
      serverObject.m_game_vertex_id,
      serverObject.id
    );
  });

  it("disable_memory_object should disable memory for the current best enemy", () => {
    const object: GameObject = MockGameObject.mock();
    const enemy: GameObject = MockGameObject.mock();

    jest.spyOn(object, "best_enemy").mockReturnValue(enemy);

    callXrEffect("disable_memory_object", MockGameObject.mockActor(), object);

    jest.spyOn(object, "best_enemy").mockReturnValue(null);

    callXrEffect("disable_memory_object", MockGameObject.mockActor(), object);

    expect(object.enable_memory_object).toHaveBeenCalledWith(enemy, false);
    expect(object.enable_memory_object).toHaveBeenCalledTimes(1);
  });

  it("set_force_sleep_animation should force sleep animation", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("set_force_sleep_animation", MockGameObject.mockActor(), object, 5000);

    expect(object.force_stand_sleep_animation).toHaveBeenCalledWith(5000);
  });

  it("release_force_sleep_animation should stop forced sleep animation", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "release_stand_sleep_animation").mockImplementation(jest.fn());

    callXrEffect("release_force_sleep_animation", MockGameObject.mockActor(), object);

    expect(object.release_stand_sleep_animation).toHaveBeenCalledTimes(1);
  });

  it("set_visual_memory_enabled should toggle visual memory for valid boolean values", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("set_visual_memory_enabled", MockGameObject.mockActor(), object, 1);
    callXrEffect("set_visual_memory_enabled", MockGameObject.mockActor(), object, 0);

    expect(object.set_visual_memory_enabled).toHaveBeenCalledWith(true);
    expect(object.set_visual_memory_enabled).toHaveBeenCalledWith(false);
  });

  it("set_monster_animation should set animations for monsters", () => {
    const object: GameObject = MockGameObject.mock();

    expect(() => callXrEffect("set_monster_animation", MockGameObject.mockActor(), object)).toThrow(
      "Wrong parameters in function 'set_monster_animation'"
    );

    callXrEffect("set_monster_animation", MockGameObject.mockActor(), object, "test-animation");

    expect(object.set_override_animation).toHaveBeenCalledWith("test-animation");
  });

  it("clear_monster_animation should clear animations for monsters", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "clear_override_animation").mockImplementation(jest.fn());

    callXrEffect("clear_monster_animation", MockGameObject.mockActor(), object);

    expect(object.clear_override_animation).toHaveBeenCalledTimes(1);
  });

  it.todo("switch_to_desired_job should switch objects to desired jobs");

  it("spawn_item_to_npc should spawn an item in the object inventory", () => {
    const object: GameObject = MockGameObject.mock();

    registerSimulator();

    callXrEffect("spawn_item_to_npc", MockGameObject.mockActor(), object, "test-item");
    callXrEffect("spawn_item_to_npc", MockGameObject.mockActor(), object);

    expect(registry.simulator.create).toHaveBeenCalledTimes(1);
    expect(registry.simulator.create).toHaveBeenCalledWith(
      "test-item",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
  });

  it("give_money_to_npc should give money for objects", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("give_money_to_npc", MockGameObject.mockActor(), object, 500);
    callXrEffect("give_money_to_npc", MockGameObject.mockActor(), object);

    expect(object.give_money).toHaveBeenCalledWith(500);
    expect(object.give_money).toHaveBeenCalledTimes(1);
  });

  it("seize_money_to_npc should get money from objects", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("seize_money_to_npc", MockGameObject.mockActor(), object, 500);
    callXrEffect("seize_money_to_npc", MockGameObject.mockActor(), object);

    expect(object.give_money).toHaveBeenCalledWith(-500);
    expect(object.give_money).toHaveBeenCalledTimes(1);
  });

  it("heli_start_flame should start flame", () => {
    const object: GameObject = MockGameObject.mockHelicopter();

    callXrEffect("heli_start_flame", MockGameObject.mockActor(), object);

    expect(object.get_helicopter().StartFlame).toHaveBeenCalledTimes(1);
  });

  it("heli_die should kill heli and remove it from the active helicopter list", () => {
    const object: GameObject = MockGameObject.mockHelicopter();

    registry.helicopter.storage.set(object.id(), object);

    callXrEffect("heli_die", MockGameObject.mockActor(), object);

    expect(object.get_helicopter().Die).toHaveBeenCalledTimes(1);
    expect(registry.helicopter.storage.has(object.id())).toBe(false);
  });

  it("set_bloodsucker_state should switch bloodsuckers", () => {
    const object: GameObject = MockGameObject.mock();

    expect(() => callXrEffect("set_bloodsucker_state", MockGameObject.mockActor(), object)).toThrow(
      "Wrong parameters in function 'set_bloodsucker_state'"
    );

    callXrEffect("set_bloodsucker_state", MockGameObject.mockActor(), object, "1");
    callXrEffect("set_bloodsucker_state", MockGameObject.mockActor(), object, "default");

    expect(object.force_visibility_state).toHaveBeenNthCalledWith(1, 1);
    expect(object.force_visibility_state).toHaveBeenNthCalledWith(2, -1);
  });

  it("clear_box should release every item contained in the story inventory box", () => {
    const box: GameObject = MockGameObject.mock();
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const firstServer = MockAlifeObject.create({ id: first.id() });
    const secondServer = MockAlifeObject.create({ id: second.id() });

    registerSimulator();

    MockAlifeSimulator.addToRegistry(firstServer);
    MockAlifeSimulator.addToRegistry(secondServer);

    registerObject(box);
    registerStoryLink(box.id(), "test-box");

    replaceFunctionMock(box.iterate_inventory_box, (callback: AnyCallable) => {
      callback(box, first);
      callback(box, second);
    });

    callXrEffect("clear_box", MockGameObject.mockActor(), MockGameObject.mock(), "test-box");

    expect(registry.simulator.release).toHaveBeenCalledTimes(2);
    expect(registry.simulator.release).toHaveBeenNthCalledWith(1, firstServer, true);
    expect(registry.simulator.release).toHaveBeenNthCalledWith(2, secondServer, true);
  });

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
    const torch: GameObject = MockGameObject.mock({ section: misc.device_torch });
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
