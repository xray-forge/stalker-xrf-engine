import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";

import { registerZone } from "@/engine/core/database";
import { isDeimosPhaseActive } from "@/engine/core/schemes/restrictor/sr_deimos";
import { GameObject } from "@/engine/lib/types";
import { callXrCondition, checkXrCondition, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock, resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/schemes/restrictor/sr_deimos");

describe("object conditions declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/object");
  });

  it("should correctly inject external methods for game", () => {
    checkXrCondition("is_monster_snork");
    checkXrCondition("is_monster_dog");
    checkXrCondition("is_monster_psy_dog");
    checkXrCondition("is_monster_polter");
    checkXrCondition("is_monster_tushkano");
    checkXrCondition("is_monster_burer");
    checkXrCondition("is_monster_controller");
    checkXrCondition("is_monster_flesh");
    checkXrCondition("is_monster_boar");
    checkXrCondition("fighting_dist_ge");
    checkXrCondition("fighting_dist_le");
    checkXrCondition("enemy_in_zone");
    checkXrCondition("check_npc_name");
    checkXrCondition("check_enemy_name");
    checkXrCondition("see_npc");
    checkXrCondition("is_wounded");
    checkXrCondition("distance_to_obj_on_job_le");
    checkXrCondition("is_obj_on_job");
    checkXrCondition("obj_in_zone");
    checkXrCondition("one_obj_in_zone");
    checkXrCondition("health_le");
    checkXrCondition("heli_health_le");
    checkXrCondition("story_obj_in_zone_by_name");
    checkXrCondition("npc_in_zone");
    checkXrCondition("heli_see_npc");
    checkXrCondition("enemy_group");
    checkXrCondition("hitted_by");
    checkXrCondition("hitted_on_bone");
    checkXrCondition("best_pistol");
    checkXrCondition("deadly_hit");
    checkXrCondition("killed_by");
    checkXrCondition("is_alive_all");
    checkXrCondition("is_alive_one");
    checkXrCondition("is_alive");
    checkXrCondition("is_dead_all");
    checkXrCondition("is_dead_one");
    checkXrCondition("is_dead");
    checkXrCondition("story_object_exist");
    checkXrCondition("npc_has_item");
    checkXrCondition("has_enemy");
    checkXrCondition("has_actor_enemy");
    checkXrCondition("see_enemy");
    checkXrCondition("heavy_wounded");
    checkXrCondition("mob_has_enemy");
    checkXrCondition("mob_was_hit");
    checkXrCondition("squad_in_zone");
    checkXrCondition("squad_has_enemy");
    checkXrCondition("squad_in_zone_all");
    checkXrCondition("squads_in_zone_b41");
    checkXrCondition("target_squad_name");
    checkXrCondition("target_smart_name");
    checkXrCondition("squad_exist");
    checkXrCondition("is_squad_commander");
    checkXrCondition("squad_npc_count_ge");
    checkXrCondition("quest_npc_enemy_actor");
    checkXrCondition("distance_to_obj_ge");
    checkXrCondition("distance_to_obj_le");
    checkXrCondition("active_item");
    checkXrCondition("check_bloodsucker_state");
    checkXrCondition("in_dest_smart_cover");
    checkXrCondition("dist_to_story_obj_ge");
    checkXrCondition("has_enemy_in_current_loopholes_fov");
    checkXrCondition("npc_talking");
    checkXrCondition("see_actor");
    checkXrCondition("object_exist");
    checkXrCondition("squad_curr_action");
    checkXrCondition("check_enemy_smart");
    checkXrCondition("polter_ignore_actor");
    checkXrCondition("burer_gravi_attack");
    checkXrCondition("burer_anti_aim");
    checkXrCondition("is_playing_sound");
    checkXrCondition("is_door_blocked_by_npc");
    checkXrCondition("check_deimos_phase");
    checkXrCondition("animpoint_reached");
    checkXrCondition("upgrade_hint_kardan");
  });
});

describe("object conditions implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/object");
  });

  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(isDeimosPhaseActive);
  });

  it("is_monster_snork should check object class", () => {
    expect(
      callXrCondition("is_monster_snork", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.snork_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_snork", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });

  it("is_monster_dog should check object class", () => {
    expect(
      callXrCondition("is_monster_dog", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.dog_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_dog", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });

  it("is_monster_psy_dog should check object class", () => {
    expect(
      callXrCondition("is_monster_psy_dog", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.psy_dog_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_psy_dog", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });

  it("is_monster_polter should check object class", () => {
    expect(
      callXrCondition(
        "is_monster_polter",
        MockGameObject.mockActor(),
        MockGameObject.mockWithClassId(clsid.poltergeist_s)
      )
    ).toBe(true);
    expect(
      callXrCondition("is_monster_polter", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });

  it("is_monster_tushkano should check object class", () => {
    expect(
      callXrCondition(
        "is_monster_tushkano",
        MockGameObject.mockActor(),
        MockGameObject.mockWithClassId(clsid.tushkano_s)
      )
    ).toBe(true);
    expect(
      callXrCondition("is_monster_tushkano", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });

  it("is_monster_burer should check object class", () => {
    expect(
      callXrCondition("is_monster_burer", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.burer_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_burer", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });

  it("is_monster_controller should check object class", () => {
    expect(
      callXrCondition(
        "is_monster_controller",
        MockGameObject.mockActor(),
        MockGameObject.mockWithClassId(clsid.controller_s)
      )
    ).toBe(true);
    expect(
      callXrCondition(
        "is_monster_controller",
        MockGameObject.mockActor(),
        MockGameObject.mockWithClassId(clsid.zombie_s)
      )
    ).toBe(false);
  });

  it("is_monster_flesh should check object class", () => {
    expect(
      callXrCondition("is_monster_flesh", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.flesh_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_flesh", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });

  it("is_monster_boar should check object class", () => {
    expect(
      callXrCondition("is_monster_boar", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.boar_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_boar", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });

  it("fighting_dist_ge should check distance", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 10 * 10);
    expect(callXrCondition("fighting_dist_ge", actor, object, 10)).toBe(true);

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 5 * 5);
    expect(callXrCondition("fighting_dist_ge", actor, object, 10)).toBe(false);

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 15 * 15);
    expect(callXrCondition("fighting_dist_ge", actor, object, 10)).toBe(true);
  });

  it("fighting_dist_le should check distance", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 10 * 10);
    expect(callXrCondition("fighting_dist_le", actor, object, 10)).toBe(true);

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 5 * 5);
    expect(callXrCondition("fighting_dist_le", actor, object, 10)).toBe(true);

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 15 * 15);
    expect(callXrCondition("fighting_dist_le", actor, object, 10)).toBe(false);
  });

  it("enemy_in_zone should check enemy state", () => {
    const { actorGameObject } = mockRegisteredActor();
    const zone: GameObject = MockGameObject.mock();

    registerZone(zone);

    expect(() => callXrCondition("enemy_in_zone", actorGameObject, MockGameObject.mock())).toThrow(
      "Unexpected zone name 'nil' in enemy_in_zone xr condition."
    );

    jest.spyOn(zone, "inside").mockImplementation(() => true);

    expect(callXrCondition("enemy_in_zone", actorGameObject, MockGameObject.mock(), zone.name())).toBe(true);

    jest.spyOn(zone, "inside").mockImplementation(() => false);

    expect(callXrCondition("enemy_in_zone", actorGameObject, MockGameObject.mock(), zone.name())).toBe(false);
  });

  it("check_npc_name should check object name", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "name").mockImplementation(() => "some-name");

    expect(callXrCondition("check_npc_name", MockGameObject.mockActor(), object, "test")).toBe(false);

    jest.spyOn(object, "name").mockImplementation(() => "test-123");

    expect(callXrCondition("check_npc_name", MockGameObject.mockActor(), object, "test")).toBe(true);
    expect(callXrCondition("check_npc_name", MockGameObject.mockActor(), object, "123")).toBe(true);
    expect(callXrCondition("check_npc_name", MockGameObject.mockActor(), object, "abc", "efg", "test")).toBe(true);
  });

  it.todo("see_npc should check if object see another object");

  it.todo("is_wounded should check if object is wounded");

  it.todo("distance_to_obj_on_job_le should check object job distance");

  it.todo("is_obj_on_job should check if object is on job");

  it.todo("obj_in_zone should check if object is in zone");

  it.todo("one_obj_in_zone should check if object is in zone");

  it.todo("health_le should check object health");

  it.todo("heli_health_le should check heli health");

  it.todo("story_obj_in_zone_by_name should check object zone");

  it.todo("npc_in_zone should check object zone");

  it.todo("heli_see_npc should check if heli see object");

  it.todo("enemy_group should check group");

  it.todo("hitted_by should check object hit state");

  it.todo("hitted_on_bone should check object hit bone");

  it.todo("best_pistol should check object has pistol");

  it.todo("deadly_hit should check if hit is deadly");

  it.todo("killed_by should check object killed by");

  it.todo("is_alive_all should check if objects are alive");

  it.todo("is_alive_one should check if one of objects is alive");

  it.todo("is_alive should check if stalker is alive");

  it.todo("is_dead_all should check if objects are dead");

  it.todo("is_dead_one should check if at least one of objects is dead");

  it.todo("is_dead should check if object is dead");

  it.todo("story_object_exist should check if object exist");

  it.todo("npc_has_item should check if object has item");

  it.todo("has_enemy should check if object has enemy");

  it.todo("has_actor_enemy should check if object has actor as enemy");

  it.todo("see_enemy should check if object see enemy");

  it.todo("heavy_wounded should check if object is heavily wounded");

  it.todo("mob_has_enemy should check if object has enemy");

  it.todo("mob_was_hit should check if object was hit");

  it.todo("squad_in_zone should check if squad is in zone");

  it.todo("squad_has_enemy should check if squad has enemy");

  it.todo("squad_in_zone_all should check if squad members are in zone");

  it.todo("squads_in_zone_b41 should check if squad members are in zone b41");

  it.todo("target_smart_name should check object name");

  it.todo("squad_exist should check if squad exists");

  it.todo("is_squad_commander should check if object commands squad");

  it.todo("squad_npc_count_ge should check squad objects count");

  it.todo("quest_npc_enemy_actor should check if object is enemy with actor");

  it.todo("distance_to_obj_ge should check distance");

  it.todo("distance_to_obj_le should check distance");

  it.todo("active_item should check object active item");

  it.todo("check_bloodsucker_state should check bloodsucker state");

  it.todo("in_dest_smart_cover should check if object is in smart cover");

  it.todo("dist_to_story_obj_ge should check distance");

  it.todo("has_enemy_in_current_loopholes_fov should check enemies in loophole");

  it.todo("npc_talking should check if object is talking");

  it.todo("see_actor should check if object is alive and see actor");

  it.todo("object_exist should check if object exists");

  it.todo("squad_curr_action should check squad action");

  it.todo("check_enemy_smart should check enemy smart terrain");

  it.todo("polter_ignore_actor should check if poltergeist ignores actor");

  it.todo("burer_gravi_attack should check burer gravi attack");

  it.todo("burer_anti_aim should check burer anti aim");

  it.todo("is_playing_sound should check if object is playing sound");

  it.todo("is_door_blocked_by_npc should check if door is blocked by npc");

  it("check_deimos_phase should check deimos phase", () => {
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMock(isDeimosPhaseActive, () => false);

    expect(callXrCondition("check_deimos_phase", MockGameObject.mockActor(), object)).toBe(false);
    expect(isDeimosPhaseActive).toHaveBeenCalledTimes(0);

    expect(callXrCondition("check_deimos_phase", MockGameObject.mockActor(), object, "disable_bound")).toBe(false);
    expect(isDeimosPhaseActive).toHaveBeenCalledTimes(0);

    expect(
      callXrCondition("check_deimos_phase", MockGameObject.mockActor(), object, "disable_bound", "increasing")
    ).toBe(false);
    expect(isDeimosPhaseActive).toHaveBeenCalledTimes(1);
    expect(isDeimosPhaseActive).toHaveBeenCalledWith(object, "disable_bound", true);

    replaceFunctionMock(isDeimosPhaseActive, () => true);

    expect(callXrCondition("check_deimos_phase", MockGameObject.mockActor(), object, "lower_bound", "decreasing")).toBe(
      true
    );
    expect(isDeimosPhaseActive).toHaveBeenCalledTimes(2);
    expect(isDeimosPhaseActive).toHaveBeenCalledWith(object, "lower_bound", false);
  });

  it.todo("animpoint_reached should check if animpoint is reached");

  it.todo("upgrade_hint_kardan should check upgrade hints");
});
