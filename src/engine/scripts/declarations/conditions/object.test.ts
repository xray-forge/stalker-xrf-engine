import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CHelicopter, clsid } from "xray16";

import {
  IRegistryObjectState,
  registerObject,
  registerSimulator,
  registerStoryLink,
  registerZone,
} from "@/engine/core/database";
import {
  EJobPathType,
  EJobType,
  IObjectJobState,
  ISmartTerrainJobDescriptor,
  SmartTerrain,
} from "@/engine/core/objects/smart_terrain";
import { isDeimosPhaseActive } from "@/engine/core/schemes/restrictor/sr_deimos";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { isPlayingSound } from "@/engine/core/utils/sound";
import {
  EScheme,
  ESchemeType,
  GameObject,
  ServerCreatureObject,
  ServerHumanObject,
  ServerMonsterBaseObject,
} from "@/engine/lib/types";
import {
  callXrCondition,
  checkXrCondition,
  mockRegisteredActor,
  mockSchemeState,
  MockSmartTerrain,
  resetRegistry,
} from "@/fixtures/engine";
import { replaceFunctionMock, replaceFunctionMockOnce, resetFunctionMock } from "@/fixtures/jest";
import {
  MockAlifeHumanStalker,
  MockAlifeMonsterBase,
  MockCHelicopter,
  MockGameObject,
  MockMonsterHitInfo,
} from "@/fixtures/xray";

jest.mock("@/engine/core/schemes/restrictor/sr_deimos");
jest.mock("@/engine/core/utils/planner");
jest.mock("@/engine/core/utils/sound");

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
    checkXrCondition("health_le");
    checkXrCondition("heli_health_le");
    checkXrCondition("story_obj_in_zone_by_name");
    checkXrCondition("npc_in_zone");
    checkXrCondition("heli_see_npc");
    checkXrCondition("hitted_by");
    checkXrCondition("hitted_on_bone");
    checkXrCondition("best_pistol");
    checkXrCondition("deadly_hit");
    checkXrCondition("killed_by");
    checkXrCondition("is_alive_all");
    checkXrCondition("is_alive_one");
    checkXrCondition("is_alive");
    checkXrCondition("is_dead");
    checkXrCondition("story_object_exist");
    checkXrCondition("npc_has_item");
    checkXrCondition("has_enemy");
    checkXrCondition("has_actor_enemy");
    checkXrCondition("see_enemy");
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
    registerSimulator();
    resetFunctionMock(isDeimosPhaseActive);
  });

  it("is_monster_snork should check object", () => {
    expect(
      callXrCondition("is_monster_snork", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.snork_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_snork", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });

  it("is_monster_dog should check object", () => {
    expect(
      callXrCondition("is_monster_dog", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.dog_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_dog", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });

  it("is_monster_psy_dog should check object", () => {
    expect(
      callXrCondition("is_monster_psy_dog", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.psy_dog_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_psy_dog", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });

  it("is_monster_polter should check object", () => {
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

  it("is_monster_tushkano should check object", () => {
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

  it("is_monster_burer should check object", () => {
    expect(
      callXrCondition("is_monster_burer", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.burer_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_burer", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });

  it("is_monster_controller should check object", () => {
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

  it("is_monster_flesh should check object", () => {
    expect(
      callXrCondition("is_monster_flesh", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.flesh_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_flesh", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });

  it("is_monster_boar should check object", () => {
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

  it("check_enemy_name should check object name", () => {
    const object: GameObject = MockGameObject.mock();
    const enemy: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    jest.spyOn(enemy, "name").mockImplementation(() => "some-name");

    expect(callXrCondition("check_enemy_name", MockGameObject.mockActor(), object, "test")).toBe(false);

    jest.spyOn(enemy, "name").mockImplementation(() => "test-123");

    expect(callXrCondition("check_enemy_name", MockGameObject.mockActor(), object, "test")).toBe(false);
    expect(callXrCondition("check_enemy_name", MockGameObject.mockActor(), object, "123")).toBe(false);
    expect(callXrCondition("check_enemy_name", MockGameObject.mockActor(), object, "abc", "efg", "test")).toBe(false);

    state.enemy = enemy;
    state.enemyId = enemy.id();

    expect(callXrCondition("check_enemy_name", MockGameObject.mockActor(), object, "test")).toBe(true);
    expect(callXrCondition("check_enemy_name", MockGameObject.mockActor(), object, "123")).toBe(true);
    expect(callXrCondition("check_enemy_name", MockGameObject.mockActor(), object, "abc", "efg", "test")).toBe(true);

    jest.spyOn(enemy, "alive").mockImplementation(() => false);

    expect(callXrCondition("check_enemy_name", MockGameObject.mockActor(), object, "test")).toBe(false);
  });

  it("see_npc should check if object see another object", () => {
    const object: GameObject = MockGameObject.mock();
    const another: GameObject = MockGameObject.mock();

    jest.spyOn(object, "see").mockImplementation(() => false);
    expect(callXrCondition("see_npc", MockGameObject.mockActor(), object, "test-sid")).toBe(false);

    jest.spyOn(object, "see").mockImplementation(() => true);
    expect(callXrCondition("see_npc", MockGameObject.mockActor(), object, "test-sid")).toBe(false);

    registerStoryLink(another.id(), "test-sid");

    jest.spyOn(object, "see").mockImplementation(() => true);
    expect(callXrCondition("see_npc", MockGameObject.mockActor(), object, "test-sid")).toBe(true);

    jest.spyOn(object, "see").mockImplementation(() => false);
    expect(callXrCondition("see_npc", MockGameObject.mockActor(), object, "test-sid")).toBe(false);
  });

  it("is_wounded should check if object is wounded", () => {
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMockOnce(isObjectWounded, () => true);
    expect(callXrCondition("is_wounded", MockGameObject.mockActor(), object)).toBe(true);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());

    replaceFunctionMockOnce(isObjectWounded, () => false);
    expect(callXrCondition("is_wounded", MockGameObject.mockActor(), object)).toBe(false);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());
  });

  it("distance_to_obj_on_job_le should check object job distance", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const object: GameObject = MockGameObject.mock();
    const working: ServerCreatureObject = MockAlifeHumanStalker.mock();

    MockAlifeHumanStalker.mock({ id: object.id() }).m_smart_terrain_id = terrain.id;

    expect(callXrCondition("distance_to_obj_on_job_le", MockGameObject.mockActor(), object, "test", 100)).toBe(false);

    terrain.objectJobDescriptors = $fromArray<IObjectJobState>([
      {
        object: working,
        job: {
          section: "test-job",
        } as ISmartTerrainJobDescriptor,
      } as IObjectJobState,
    ]);

    expect(
      callXrCondition("distance_to_obj_on_job_le", MockGameObject.mockActor(), object, "test-not-existing", 100)
    ).toBe(false);

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 100 * 100);

    expect(callXrCondition("distance_to_obj_on_job_le", MockGameObject.mockActor(), object, "test-job", 100)).toBe(
      true
    );
    expect(object.position().distance_to_sqr).toHaveBeenCalledWith(working.position);

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 101 * 101);

    expect(callXrCondition("distance_to_obj_on_job_le", MockGameObject.mockActor(), object, "test-job", 100)).toBe(
      false
    );
  });

  it("is_obj_on_job should check if object is on job", () => {
    const object: GameObject = MockGameObject.mock();
    const terrain: SmartTerrain = MockSmartTerrain.mockRegistered("test-smart-terrain");

    expect(callXrCondition("is_obj_on_job", MockGameObject.mockActor(), object, "test-job")).toBe(false);
    expect(callXrCondition("is_obj_on_job", MockGameObject.mockActor(), object, "test-job", "test-smart-terrain")).toBe(
      false
    );

    terrain.objectJobDescriptors.set(1, {
      isMonster: false,
      object: MockAlifeHumanStalker.mock({ id: object.id() }),
      desiredJob: "",
      jobPriority: 0,
      jobId: 0,
      job: {
        section: "test-job",
        type: EJobType.ANIMPOINT,
        pathType: EJobPathType.POINT,
        priority: 100,
      },
      isBegun: false,
      schemeType: ESchemeType.STALKER,
    });

    expect(callXrCondition("is_obj_on_job", MockGameObject.mockActor(), object, "test-job", "test-smart-terrain")).toBe(
      true
    );
  });

  it("obj_in_zone should check if object is in zone", () => {
    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    registerStoryLink(first.id, "first-sid");
    registerStoryLink(second.id, "second-sid");

    const zone: GameObject = MockGameObject.mock();

    jest.spyOn(zone, "inside").mockImplementation((position) => position === second.position);

    expect(callXrCondition("obj_in_zone", MockGameObject.mockActor(), zone)).toBe(false);
    expect(callXrCondition("obj_in_zone", MockGameObject.mockActor(), zone, "first-sid")).toBe(false);
    expect(callXrCondition("obj_in_zone", MockGameObject.mockActor(), zone, "first-sid", "second-sid")).toBe(true);
    expect(callXrCondition("obj_in_zone", MockGameObject.mockActor(), zone, "second-sid")).toBe(true);
  });

  it("health_le should check object health", () => {
    const object: GameObject = MockGameObject.mock();

    object.health = 0.5;

    expect(callXrCondition("health_le", MockGameObject.mockActor(), object, 0.49)).toBe(false);
    expect(callXrCondition("health_le", MockGameObject.mockActor(), object, 0.5)).toBe(false);
    expect(callXrCondition("health_le", MockGameObject.mockActor(), object, 0.51)).toBe(true);
  });

  it("heli_health_le should check heli health", () => {
    const object: GameObject = MockGameObject.mock();
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    helicopter.SetfHealth(0.5);

    expect(callXrCondition("heli_health_le", MockGameObject.mockActor(), object, 0.49)).toBe(false);
    expect(callXrCondition("heli_health_le", MockGameObject.mockActor(), object, 0.5)).toBe(false);
    expect(callXrCondition("heli_health_le", MockGameObject.mockActor(), object, 0.51)).toBe(true);
  });

  it("story_obj_in_zone_by_name should check object zone", () => {
    const object: GameObject = MockGameObject.mock();
    const zone: GameObject = MockGameObject.mock();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock({ id: object.id() });

    jest.spyOn(zone, "name").mockImplementation(() => "zone-name");
    jest.spyOn(zone, "inside").mockImplementation((position) => position === serverObject.position);

    expect(
      callXrCondition(
        "story_obj_in_zone_by_name",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-sid",
        "zone-name"
      )
    ).toBe(false);

    registerStoryLink(object.id(), "test-sid");
    registerZone(zone);

    expect(
      callXrCondition(
        "story_obj_in_zone_by_name",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-sid",
        "zone-name"
      )
    ).toBe(true);
  });

  it("npc_in_zone should check object zone", () => {
    const object: GameObject = MockGameObject.mock();
    const zone: GameObject = MockGameObject.mock();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock({ id: object.id() });

    jest.spyOn(zone, "name").mockImplementation(() => "zone-name");
    jest.spyOn(zone, "inside").mockImplementation((position) => position === object.position());

    registerObject(object);
    registerZone(zone);

    expect(callXrCondition("npc_in_zone", MockGameObject.mockActor(), object, "zone-name")).toBe(true);
    expect(callXrCondition("npc_in_zone", MockGameObject.mockActor(), object, "zone-name-random")).toBe(false);

    expect(
      callXrCondition("npc_in_zone", MockGameObject.mockActor(), serverObject as unknown as GameObject, "zone-name")
    ).toBe(true);
    expect(
      callXrCondition(
        "npc_in_zone",
        MockGameObject.mockActor(),
        serverObject as unknown as GameObject,
        "zone-name-random"
      )
    ).toBe(true);

    const serverOnlyObject: ServerHumanObject = MockAlifeHumanStalker.mock();

    jest.spyOn(zone, "inside").mockImplementation((position) => position === serverOnlyObject.position);

    expect(
      callXrCondition("npc_in_zone", MockGameObject.mockActor(), serverOnlyObject as unknown as GameObject, "zone-name")
    ).toBe(true);
  });

  it("heli_see_npc should check if heli see object", () => {
    const object: GameObject = MockGameObject.mock();
    const another: GameObject = MockGameObject.mock();
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    expect(callXrCondition("heli_see_npc", MockGameObject.mockActor(), object)).toBe(false);
    expect(callXrCondition("heli_see_npc", MockGameObject.mockActor(), object, "test-sid")).toBe(false);

    registerStoryLink(another.id(), "test-sid");

    expect(callXrCondition("heli_see_npc", MockGameObject.mockActor(), object, "test-sid")).toBe(false);

    jest.spyOn(helicopter, "isVisible").mockImplementation((object) => object === another);

    expect(callXrCondition("heli_see_npc", MockGameObject.mockActor(), object, "test-sid")).toBe(true);
  });

  it("hitted_by should check object hit state", () => {
    const object: GameObject = MockGameObject.mock();
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    const state: IRegistryObjectState = registerObject(object);

    registerObject(first);
    registerObject(second);

    registerStoryLink(first.id(), "first-sid");
    registerStoryLink(second.id(), "second-sid");

    expect(callXrCondition("hitted_by", MockGameObject.mockActor(), object, "first-sid", "another-sid")).toBe(false);

    const schemeState: ISchemeHitState = mockSchemeState(EScheme.HIT);

    state[EScheme.HIT] = schemeState;

    expect(callXrCondition("hitted_by", MockGameObject.mockActor(), object, "first-sid", "second-sid")).toBe(false);

    schemeState.who = second.id();

    expect(callXrCondition("hitted_by", MockGameObject.mockActor(), object, "first-sid", "another-sid")).toBe(false);
    expect(callXrCondition("hitted_by", MockGameObject.mockActor(), object, "second-sid", "another-sid")).toBe(true);
    expect(callXrCondition("hitted_by", MockGameObject.mockActor(), object, "first-sid", "second-sid")).toBe(true);
  });

  it("hitted_on_bone should check object hit bone", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeHitState = mockSchemeState(EScheme.HIT);

    expect(callXrCondition("hitted_on_bone", MockGameObject.mockActor(), object, "bone-a", "bone-b")).toBe(false);

    state[EScheme.HIT] = schemeState;

    expect(callXrCondition("hitted_on_bone", MockGameObject.mockActor(), object, "bone-a", "bone-b")).toBe(false);

    jest.spyOn(object, "get_bone_id").mockImplementation((name) => (name === "bone-b" ? 2 : -1));

    schemeState.boneIndex = 2;

    expect(callXrCondition("hitted_on_bone", MockGameObject.mockActor(), object, "bone-a")).toBe(false);
    expect(callXrCondition("hitted_on_bone", MockGameObject.mockActor(), object, "bone-b")).toBe(true);
    expect(callXrCondition("hitted_on_bone", MockGameObject.mockActor(), object, "bone-a", "bone-b")).toBe(true);
  });

  it("best_pistol should check object has pistol", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "item_in_slot").mockImplementation(() => MockGameObject.mock());
    expect(callXrCondition("best_pistol", MockGameObject.mockActor(), object)).toBe(true);
    expect(object.item_in_slot).toHaveBeenCalledWith(1);

    jest.spyOn(object, "item_in_slot").mockImplementation(() => null);
    expect(callXrCondition("best_pistol", MockGameObject.mockActor(), object)).toBe(false);
  });

  it("deadly_hit should check if hit is deadly", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeHitState = mockSchemeState(EScheme.HIT);

    expect(callXrCondition("deadly_hit", MockGameObject.mockActor(), object)).toBe(false);

    state[EScheme.HIT] = schemeState;

    expect(callXrCondition("deadly_hit", MockGameObject.mockActor(), object)).toBe(false);

    schemeState.isDeadlyHit = true;

    expect(callXrCondition("deadly_hit", MockGameObject.mockActor(), object)).toBe(true);
  });

  it("killed_by should check object killed by", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeDeathState = mockSchemeState(EScheme.DEATH);

    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    registerStoryLink(first.id(), "first-sid");
    registerStoryLink(second.id(), "second-sid");

    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object)).toBe(false);
    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object, "first-sid", "second-sid")).toBe(false);

    state[EScheme.DEATH] = schemeState;

    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object, "first-sid", "second-sid")).toBe(false);

    schemeState.killerId = second.id();

    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object, "first-sid")).toBe(false);
    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object, "second-sid")).toBe(true);
    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object, "first-sid", "second-sid")).toBe(true);
  });

  it("is_alive_all should check if objects are alive", () => {
    expect(callXrCondition("is_alive_all", MockGameObject.mockActor(), MockGameObject.mock())).toBe(true);
    expect(callXrCondition("is_alive_all", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(false);

    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerMonsterBaseObject = MockAlifeMonsterBase.mock();

    registerStoryLink(first.id, "first-sid");
    registerStoryLink(second.id, "second-sid");

    expect(callXrCondition("is_alive_all", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(false);
    expect(callXrCondition("is_alive_all", MockGameObject.mockActor(), MockGameObject.mock(), "first-sid")).toBe(true);
    expect(callXrCondition("is_alive_all", MockGameObject.mockActor(), MockGameObject.mock(), "second-sid")).toBe(
      false
    );
    expect(
      callXrCondition("is_alive_all", MockGameObject.mockActor(), MockGameObject.mock(), "first-sid", "second-sid")
    ).toBe(false);
  });

  it("is_alive_one should check if one of objects is alive", () => {
    expect(callXrCondition("is_alive_one", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);
    expect(callXrCondition("is_alive_one", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(false);

    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerMonsterBaseObject = MockAlifeMonsterBase.mock();

    registerStoryLink(first.id, "first-sid");
    registerStoryLink(second.id, "second-sid");

    expect(callXrCondition("is_alive_one", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(false);
    expect(callXrCondition("is_alive_one", MockGameObject.mockActor(), MockGameObject.mock(), "first-sid")).toBe(true);
    expect(callXrCondition("is_alive_one", MockGameObject.mockActor(), MockGameObject.mock(), "second-sid")).toBe(
      false
    );
    expect(
      callXrCondition("is_alive_one", MockGameObject.mockActor(), MockGameObject.mock(), "first-sid", "second-sid")
    ).toBe(true);
  });

  it("is_alive should check if stalker is alive", () => {
    const first: GameObject = MockGameObject.mock();
    const firstServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: first.id() });
    const second: GameObject = MockGameObject.mock();
    const secondServer: ServerMonsterBaseObject = MockAlifeMonsterBase.mock({ id: second.id() });

    registerStoryLink(first.id(), "first-sid");
    registerStoryLink(second.id(), "second-sid");

    expect(callXrCondition("is_alive", MockGameObject.mockActor(), first, "first-sid")).toBe(true);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), first, "second-sid")).toBe(false);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), first)).toBe(true);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), firstServer as unknown as GameObject)).toBe(true);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), second, "first-sid")).toBe(true);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), second, "second-sid")).toBe(false);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), second)).toBe(false);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), secondServer as unknown as GameObject)).toBe(false);

    jest.spyOn(firstServer, "alive").mockImplementation(() => false);

    expect(callXrCondition("is_alive", MockGameObject.mockActor(), first)).toBe(false);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), firstServer as unknown as GameObject)).toBe(false);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), first, "first-sid")).toBe(false);
  });

  it("is_dead should check if object is dead", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("is_dead", MockGameObject.mockActor(), object, "test-sid")).toBe(true);

    registerStoryLink(object.id(), "test-sid");

    expect(callXrCondition("is_dead", MockGameObject.mockActor(), object, "test-sid")).toBe(false);

    jest.spyOn(object, "alive").mockImplementation(() => false);

    expect(callXrCondition("is_dead", MockGameObject.mockActor(), object, "test-sid")).toBe(true);
  });

  it("story_object_exist should check if object exist", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("story_object_exist", MockGameObject.mockActor(), object, "test-sid")).toBe(false);

    registerStoryLink(object.id(), "test-sid");

    expect(callXrCondition("story_object_exist", MockGameObject.mockActor(), object, "test-sid")).toBe(true);
  });

  it("npc_has_item should check if object has item", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("npc_has_item", MockGameObject.mockActor(), object, "test-section")).toBe(false);

    jest.spyOn(object, "object").mockImplementation(() => MockGameObject.mock());

    expect(callXrCondition("npc_has_item", MockGameObject.mockActor(), object, "test-section")).toBe(true);
    expect(object.object).toHaveBeenCalledWith("test-section");
  });

  it("has_enemy should check if object has enemy", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("has_enemy", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());

    expect(callXrCondition("has_enemy", MockGameObject.mockActor(), object)).toBe(true);
    expect(object.best_enemy).toHaveBeenCalled();
  });

  it("has_actor_enemy should check if object has actor as enemy", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("has_actor_enemy", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());
    expect(callXrCondition("has_actor_enemy", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mockActor());
    expect(callXrCondition("has_actor_enemy", MockGameObject.mockActor(), object)).toBe(true);
  });

  it("see_enemy should check if object see enemy", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "see").mockImplementation(() => true);
    expect(callXrCondition("see_enemy", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());
    expect(callXrCondition("see_enemy", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "see").mockImplementation(() => false);
    expect(callXrCondition("see_enemy", MockGameObject.mockActor(), object)).toBe(false);
  });

  it("mob_has_enemy should check if object has enemy", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "get_enemy").mockImplementation(() => MockGameObject.mock());
    expect(callXrCondition("mob_has_enemy", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "get_enemy").mockImplementation(() => null);
    expect(callXrCondition("mob_has_enemy", MockGameObject.mockActor(), object)).toBe(false);
  });

  it("mob_was_hit should check if object was hit", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "get_monster_hit_info").mockImplementation(() => MockMonsterHitInfo.mock(null, 0, null));
    expect(callXrCondition("mob_was_hit", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "get_monster_hit_info").mockImplementation(() => MockMonsterHitInfo.mock(null, 0));
    expect(callXrCondition("mob_was_hit", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "get_monster_hit_info").mockImplementation(() => MockMonsterHitInfo.mock());
    expect(callXrCondition("mob_was_hit", MockGameObject.mockActor(), object)).toBe(true);
  });

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

  it("in_dest_smart_cover should check if object is in smart cover", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "in_smart_cover").mockImplementation(() => true);
    expect(callXrCondition("in_dest_smart_cover", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "in_smart_cover").mockImplementation(() => false);
    expect(callXrCondition("in_dest_smart_cover", MockGameObject.mockActor(), object)).toBe(false);
  });

  it.todo("dist_to_story_obj_ge should check distance");

  it.todo("has_enemy_in_current_loopholes_fov should check enemies in loophole");

  it("npc_talking should check if object is talking", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "is_talking").mockImplementation(() => true);
    expect(callXrCondition("npc_talking", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "is_talking").mockImplementation(() => false);
    expect(callXrCondition("npc_talking", MockGameObject.mockActor(), object)).toBe(false);
  });

  it("see_actor should check if object is alive and see actor", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "alive").mockImplementation(() => true);
    jest.spyOn(object, "see").mockImplementation(() => true);

    expect(callXrCondition("see_actor", actor, object)).toBe(true);
    expect(object.alive).toHaveBeenCalled();
    expect(object.see).toHaveBeenCalledWith(actor);

    jest.spyOn(object, "alive").mockImplementation(() => true);
    jest.spyOn(object, "see").mockImplementation(() => false);

    expect(callXrCondition("see_actor", actor, object)).toBe(false);

    jest.spyOn(object, "alive").mockImplementation(() => false);
    jest.spyOn(object, "see").mockImplementation(() => true);

    expect(callXrCondition("see_actor", actor, object)).toBe(false);
  });

  it("object_exist should check if object exists", () => {
    expect(callXrCondition("object_exist", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(false);

    registerStoryLink(MockGameObject.mock().id(), "test-sid");
    expect(callXrCondition("object_exist", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(true);
  });

  it.todo("squad_curr_action should check squad action");

  it.todo("check_enemy_smart should check enemy smart terrain");

  it("polter_ignore_actor should check if poltergeist ignores actor", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "poltergeist_get_actor_ignore").mockImplementation(() => true);
    expect(callXrCondition("polter_ignore_actor", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "poltergeist_get_actor_ignore").mockImplementation(() => false);
    expect(callXrCondition("polter_ignore_actor", MockGameObject.mockActor(), object)).toBe(false);
  });

  it("burer_gravi_attack should check burer gravi attack", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "burer_get_force_gravi_attack").mockImplementation(() => true);
    expect(callXrCondition("burer_gravi_attack", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "burer_get_force_gravi_attack").mockImplementation(() => false);
    expect(callXrCondition("burer_gravi_attack", MockGameObject.mockActor(), object)).toBe(false);
  });

  it("burer_anti_aim should check burer anti aim", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "burer_get_force_anti_aim").mockImplementation(() => true);
    expect(callXrCondition("burer_anti_aim", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "burer_get_force_anti_aim").mockImplementation(() => false);
    expect(callXrCondition("burer_anti_aim", MockGameObject.mockActor(), object)).toBe(false);
  });

  it("is_playing_sound should check if object is playing sound", () => {
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMockOnce(isPlayingSound, () => true);
    expect(callXrCondition("is_playing_sound", MockGameObject.mockActor(), object)).toBe(true);

    replaceFunctionMockOnce(isPlayingSound, () => false);
    expect(callXrCondition("is_playing_sound", MockGameObject.mockActor(), object)).toBe(false);
  });

  it("is_door_blocked_by_npc should check if door is blocked by npc", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "is_door_blocked_by_npc").mockImplementation(() => true);
    expect(callXrCondition("is_door_blocked_by_npc", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "is_door_blocked_by_npc").mockImplementation(() => false);
    expect(callXrCondition("is_door_blocked_by_npc", MockGameObject.mockActor(), object)).toBe(false);
  });

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
