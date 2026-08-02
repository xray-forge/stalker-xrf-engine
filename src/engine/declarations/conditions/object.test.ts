import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CHelicopter, clsid } from "xray16";
import { GameObject, ServerCreatureObject, ServerHumanObject, ServerMonsterBaseObject } from "xray16/alias";
import { ACTOR_ID, AnyObject, LuaArray, TName } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import {
  MockAlifeHumanStalker,
  MockAlifeMonsterBase,
  MockAlifeSimulator,
  MockCHelicopter,
  MockGameObject,
  MockMonsterHitInfo,
} from "xray16/mocks";
import { replaceFunctionMock, replaceFunctionMockOnce, resetFunctionMock } from "xray16/testing/utils";

import {
  getManager,
  IRegistryObjectState,
  registerObject,
  registerSimulator,
  registerStoryLink,
  registerZone,
} from "@/engine/core/database";
import { getSimulationTerrainDescriptorById } from "@/engine/core/managers/simulation/utils";
import { UpgradesManager } from "@/engine/core/managers/upgrades";
import {
  EJobPathType,
  EJobType,
  IObjectJobState,
  ISmartTerrainJobDescriptor,
  SmartTerrain,
} from "@/engine/core/objects/smart_terrain";
import { ESquadActionType } from "@/engine/core/objects/squad";
import { SquadReachTargetAction, SquadStayOnTargetAction } from "@/engine/core/objects/squad/action";
import { isDeimosPhaseActive } from "@/engine/core/schemes/restrictor/sr_deimos";
import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint";
import { AnimpointController } from "@/engine/core/schemes/stalker/animpoint/AnimpointController";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { isPlayingSound } from "@/engine/core/utils/sound";
import {
  callXrCondition,
  mockRegisteredActor,
  mockSchemeState,
  MockSmartTerrain,
  MockSquad,
  resetRegistry,
} from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/restrictor/sr_deimos");
jest.mock("@/engine/core/utils/planner");
jest.mock("@/engine/core/utils/sound");

beforeAll(() => {
  require("@/engine/declarations/conditions/object");
});

beforeEach(() => {
  resetRegistry();
  registerSimulator();
  resetFunctionMock(isDeimosPhaseActive);
});

describe("is_monster_snork", () => {
  it("should check object", () => {
    expect(
      callXrCondition("is_monster_snork", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.snork_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_snork", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });
});

describe("is_monster_dog", () => {
  it("should check object", () => {
    expect(
      callXrCondition("is_monster_dog", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.dog_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_dog", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });
});

describe("is_monster_psy_dog", () => {
  it("should check object", () => {
    expect(
      callXrCondition("is_monster_psy_dog", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.psy_dog_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_psy_dog", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });
});

describe("is_monster_polter", () => {
  it("should check object", () => {
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
});

describe("is_monster_tushkano", () => {
  it("should check object", () => {
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
});

describe("is_monster_burer", () => {
  it("should check object", () => {
    expect(
      callXrCondition("is_monster_burer", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.burer_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_burer", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });
});

describe("is_monster_controller", () => {
  it("should check object", () => {
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
});

describe("is_monster_flesh", () => {
  it("should check object", () => {
    expect(
      callXrCondition("is_monster_flesh", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.flesh_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_flesh", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });
});

describe("is_monster_boar", () => {
  it("should check object", () => {
    expect(
      callXrCondition("is_monster_boar", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.boar_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_boar", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });
});

describe("fighting_dist_ge", () => {
  it("should check distance", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 10 * 10);
    expect(callXrCondition("fighting_dist_ge", actor, object, 10)).toBe(true);

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 5 * 5);
    expect(callXrCondition("fighting_dist_ge", actor, object, 10)).toBe(false);

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 15 * 15);
    expect(callXrCondition("fighting_dist_ge", actor, object, 10)).toBe(true);
  });
});

describe("fighting_dist_le", () => {
  it("should check distance", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 10 * 10);
    expect(callXrCondition("fighting_dist_le", actor, object, 10)).toBe(true);

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 5 * 5);
    expect(callXrCondition("fighting_dist_le", actor, object, 10)).toBe(true);

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 15 * 15);
    expect(callXrCondition("fighting_dist_le", actor, object, 10)).toBe(false);
  });
});

describe("enemy_in_zone", () => {
  it("should check enemy state", () => {
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
});

describe("check_npc_name", () => {
  it("should check object name", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();
    const checkNpcName = (_G as AnyObject).xr_conditions.check_npc_name as (
      actor: GameObject,
      object: GameObject,
      params: LuaArray<TName>
    ) => boolean;

    jest.spyOn(object, "name").mockImplementation(() => "some-name");

    expect(checkNpcName(actor, object, $fromArray(["test"]))).toBe(false);

    jest.spyOn(object, "name").mockImplementation(() => "aXb");
    expect(checkNpcName(actor, object, $fromArray(["a.b"]))).toBe(false);

    jest.spyOn(object, "name").mockImplementation(() => "test-123");

    expect(checkNpcName(actor, object, $fromArray(["test"]))).toBe(true);
    expect(checkNpcName(actor, object, $fromArray(["123"]))).toBe(true);
    expect(checkNpcName(actor, object, $fromArray(["abc", "efg", "test"]))).toBe(true);
  });
});

describe("check_enemy_name", () => {
  it("should check object name", () => {
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
});

describe("see_npc", () => {
  it("should check if object see another object", () => {
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
});

describe("is_wounded", () => {
  it("should check if object is wounded", () => {
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMockOnce(isObjectWounded, () => true);
    expect(callXrCondition("is_wounded", MockGameObject.mockActor(), object)).toBe(true);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());

    replaceFunctionMockOnce(isObjectWounded, () => false);
    expect(callXrCondition("is_wounded", MockGameObject.mockActor(), object)).toBe(false);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());
  });
});

describe("is_obj_on_job", () => {
  it("should check if object is on job", () => {
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
      scanCursor: 1,
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
});

describe("obj_in_zone", () => {
  it("should check if object is in zone", () => {
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
});

describe("health_le", () => {
  it("should check object health", () => {
    const object: GameObject = MockGameObject.mock({ health: 0.5 });

    expect(callXrCondition("health_le", MockGameObject.mockActor(), object, 0.49)).toBe(false);
    expect(callXrCondition("health_le", MockGameObject.mockActor(), object, 0.5)).toBe(false);
    expect(callXrCondition("health_le", MockGameObject.mockActor(), object, 0.51)).toBe(true);
  });
});

describe("heli_health_le", () => {
  it("should check heli health", () => {
    const object: GameObject = MockGameObject.mock();
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    helicopter.SetfHealth(0.5);

    expect(callXrCondition("heli_health_le", MockGameObject.mockActor(), object, 0.49)).toBe(false);
    expect(callXrCondition("heli_health_le", MockGameObject.mockActor(), object, 0.5)).toBe(false);
    expect(callXrCondition("heli_health_le", MockGameObject.mockActor(), object, 0.51)).toBe(true);
  });
});

describe("story_obj_in_zone_by_name", () => {
  it("should check object zone", () => {
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
});

describe("npc_in_zone", () => {
  it("should check object zone", () => {
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
});

describe("heli_see_npc", () => {
  it("should check if heli see object", () => {
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
});

describe("hitted_by", () => {
  it("should check object hit state", () => {
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

    setSchemeState(state, EScheme.HIT, schemeState);

    expect(callXrCondition("hitted_by", MockGameObject.mockActor(), object, "first-sid", "second-sid")).toBe(false);

    schemeState.who = second.id();

    expect(callXrCondition("hitted_by", MockGameObject.mockActor(), object, "first-sid", "another-sid")).toBe(false);
    expect(callXrCondition("hitted_by", MockGameObject.mockActor(), object, "second-sid", "another-sid")).toBe(true);
    expect(callXrCondition("hitted_by", MockGameObject.mockActor(), object, "first-sid", "second-sid")).toBe(true);
  });
});

describe("hitted_on_bone", () => {
  it("should check object hit bone", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeHitState = mockSchemeState(EScheme.HIT);

    expect(callXrCondition("hitted_on_bone", MockGameObject.mockActor(), object, "bone-a", "bone-b")).toBe(false);

    setSchemeState(state, EScheme.HIT, schemeState);

    expect(callXrCondition("hitted_on_bone", MockGameObject.mockActor(), object, "bone-a", "bone-b")).toBe(false);

    jest.spyOn(object, "get_bone_id").mockImplementation((name) => (name === "bone-b" ? 2 : -1));

    schemeState.boneIndex = 2;

    expect(callXrCondition("hitted_on_bone", MockGameObject.mockActor(), object, "bone-a")).toBe(false);
    expect(callXrCondition("hitted_on_bone", MockGameObject.mockActor(), object, "bone-b")).toBe(true);
    expect(callXrCondition("hitted_on_bone", MockGameObject.mockActor(), object, "bone-a", "bone-b")).toBe(true);
  });
});

describe("best_pistol", () => {
  it("should check object has pistol", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "item_in_slot").mockImplementation(() => MockGameObject.mock());
    expect(callXrCondition("best_pistol", MockGameObject.mockActor(), object)).toBe(true);
    expect(object.item_in_slot).toHaveBeenCalledWith(1);

    jest.spyOn(object, "item_in_slot").mockImplementation(() => null);
    expect(callXrCondition("best_pistol", MockGameObject.mockActor(), object)).toBe(false);
  });
});

describe("deadly_hit", () => {
  it("should check if hit is deadly", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeHitState = mockSchemeState(EScheme.HIT);

    expect(callXrCondition("deadly_hit", MockGameObject.mockActor(), object)).toBe(false);

    setSchemeState(state, EScheme.HIT, schemeState);

    expect(callXrCondition("deadly_hit", MockGameObject.mockActor(), object)).toBe(false);

    schemeState.isDeadlyHit = true;

    expect(callXrCondition("deadly_hit", MockGameObject.mockActor(), object)).toBe(true);
  });
});

describe("killed_by", () => {
  it("should check object killed by", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeDeathState = mockSchemeState(EScheme.DEATH);

    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    registerStoryLink(first.id(), "first-sid");
    registerStoryLink(second.id(), "second-sid");

    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object)).toBe(false);
    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object, "first-sid", "second-sid")).toBe(false);

    setSchemeState(state, EScheme.DEATH, schemeState);

    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object, "first-sid", "second-sid")).toBe(false);

    schemeState.killerId = second.id();

    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object, "first-sid")).toBe(false);
    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object, "second-sid")).toBe(true);
    expect(callXrCondition("killed_by", MockGameObject.mockActor(), object, "first-sid", "second-sid")).toBe(true);
  });
});

describe("is_alive_all", () => {
  it("should check if objects are alive", () => {
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
});

describe("is_alive_one", () => {
  it("should check if one of objects is alive", () => {
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
});

describe("is_alive", () => {
  it("should check if stalker is alive", () => {
    const first: GameObject = MockGameObject.mock();
    const firstServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: first.id() });
    const second: GameObject = MockGameObject.mock();
    const secondServer: ServerMonsterBaseObject = MockAlifeMonsterBase.mock({ id: second.id() });

    registerStoryLink(first.id(), "first-sid");
    registerStoryLink(second.id(), "second-sid");

    expect(callXrCondition("is_alive", MockGameObject.mockActor(), MockGameObject.mock(), "unknown")).toBe(false);

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
});

describe("is_dead", () => {
  it("should check if object is dead", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("is_dead", MockGameObject.mockActor(), object, "test-sid")).toBe(true);

    registerStoryLink(object.id(), "test-sid");

    expect(callXrCondition("is_dead", MockGameObject.mockActor(), object, "test-sid")).toBe(false);

    jest.spyOn(object, "alive").mockImplementation(() => false);

    expect(callXrCondition("is_dead", MockGameObject.mockActor(), object, "test-sid")).toBe(true);
  });
});

describe("story_object_exist", () => {
  it("should check if object exist", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("story_object_exist", MockGameObject.mockActor(), object, "test-sid")).toBe(false);

    registerStoryLink(object.id(), "test-sid");

    expect(callXrCondition("story_object_exist", MockGameObject.mockActor(), object, "test-sid")).toBe(true);
  });
});

describe("npc_has_item", () => {
  it("should check if object has item", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("npc_has_item", MockGameObject.mockActor(), object, "test-section")).toBe(false);

    jest.spyOn(object, "object").mockImplementation(() => MockGameObject.mock());

    expect(callXrCondition("npc_has_item", MockGameObject.mockActor(), object, "test-section")).toBe(true);
    expect(object.object).toHaveBeenCalledWith("test-section");
  });
});

describe("has_enemy", () => {
  it("should check if object has enemy", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("has_enemy", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());

    expect(callXrCondition("has_enemy", MockGameObject.mockActor(), object)).toBe(true);
    expect(object.best_enemy).toHaveBeenCalled();
  });
});

describe("has_actor_enemy", () => {
  it("should check if object has actor as enemy", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("has_actor_enemy", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());
    expect(callXrCondition("has_actor_enemy", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mockActor());
    expect(callXrCondition("has_actor_enemy", MockGameObject.mockActor(), object)).toBe(true);
  });
});

describe("see_enemy", () => {
  it("should check if object see enemy", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "see").mockImplementation(() => true);
    expect(callXrCondition("see_enemy", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "best_enemy").mockImplementation(() => MockGameObject.mock());
    expect(callXrCondition("see_enemy", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "see").mockImplementation(() => false);
    expect(callXrCondition("see_enemy", MockGameObject.mockActor(), object)).toBe(false);
  });
});

describe("mob_has_enemy", () => {
  it("should check if object has enemy", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "get_enemy").mockImplementation(() => MockGameObject.mock());
    expect(callXrCondition("mob_has_enemy", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "get_enemy").mockImplementation(() => null);
    expect(callXrCondition("mob_has_enemy", MockGameObject.mockActor(), object)).toBe(false);
  });
});

describe("mob_was_hit", () => {
  it("should check if object was hit", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "get_monster_hit_info").mockImplementation(() => MockMonsterHitInfo.mock(null, 0, null));
    expect(callXrCondition("mob_was_hit", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "get_monster_hit_info").mockImplementation(() => MockMonsterHitInfo.mock(null, 0));
    expect(callXrCondition("mob_was_hit", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "get_monster_hit_info").mockImplementation(() => MockMonsterHitInfo.mock());
    expect(callXrCondition("mob_was_hit", MockGameObject.mockActor(), object)).toBe(true);
  });
});

describe("squad_in_zone", () => {
  it("should check if squad is in zone", () => {
    const squad: MockSquad = MockSquad.createRegistered();
    const zone: GameObject = MockGameObject.mock();

    const first: GameObject = MockGameObject.mock();
    const firstServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: first.id() });
    const second: GameObject = MockGameObject.mock();
    const secondServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: second.id() });

    registerStoryLink(squad.id, "test-sid");
    registerZone(zone);

    expect(() => callXrCondition("squad_in_zone", MockGameObject.mockActor(), zone)).toThrow(
      "Incorrect 'squad_in_zone' condition parameters: storyId 'nil', zoneName 'nil'."
    );
    expect(callXrCondition("squad_in_zone", MockGameObject.mockActor(), zone, "not-existing")).toBe(false);
    expect(callXrCondition("squad_in_zone", MockGameObject.mockActor(), zone, "test-sid")).toBe(false);

    jest.spyOn(zone, "inside").mockImplementation((position) => position === secondServer.position);

    squad.mockAddMember(firstServer);
    expect(callXrCondition("squad_in_zone", MockGameObject.mockActor(), zone, "test-sid")).toBe(false);

    squad.mockAddMember(secondServer);
    expect(callXrCondition("squad_in_zone", MockGameObject.mockActor(), zone, "test-sid")).toBe(true);

    registerObject(first);
    registerObject(second);

    jest.spyOn(zone, "inside").mockImplementation((position) => position === second.position());

    expect(callXrCondition("squad_in_zone", MockGameObject.mockActor(), zone, "test-sid", zone.name())).toBe(true);
  });
});

describe("squad_has_enemy", () => {
  it("should check if squad has enemy", () => {
    const squad: MockSquad = MockSquad.createRegistered();
    const zone: GameObject = MockGameObject.mock();

    const first: GameObject = MockGameObject.mock();
    const firstServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: first.id() });
    const second: GameObject = MockGameObject.mock();
    const secondServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: second.id() });

    registerStoryLink(squad.id, "test-sid");
    registerZone(zone);

    expect(() => callXrCondition("squad_in_zone", MockGameObject.mockActor(), zone)).toThrow(
      "Incorrect 'squad_in_zone' condition parameters: storyId 'nil', zoneName 'nil'."
    );
    expect(callXrCondition("squad_has_enemy", MockGameObject.mockActor(), zone, "not-existing")).toBe(false);
    expect(callXrCondition("squad_has_enemy", MockGameObject.mockActor(), zone, "test-sid")).toBe(false);

    jest.spyOn(second, "best_enemy").mockImplementation(() => MockGameObject.mock());

    squad.mockAddMember(firstServer);
    expect(callXrCondition("squad_has_enemy", MockGameObject.mockActor(), zone, "test-sid")).toBe(false);

    squad.mockAddMember(secondServer);
    expect(callXrCondition("squad_has_enemy", MockGameObject.mockActor(), zone, "test-sid")).toBe(true);
  });
});

describe("squad_in_zone_all", () => {
  it("should check if squad members are in zone", () => {
    const squad: MockSquad = MockSquad.createRegistered();
    const zone: GameObject = MockGameObject.mock();

    const first: GameObject = MockGameObject.mock();
    const firstServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: first.id() });
    const second: GameObject = MockGameObject.mock();
    const secondServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: second.id() });

    registerStoryLink(squad.id, "test-sid");
    registerZone(zone);

    expect(() => callXrCondition("squad_in_zone_all", MockGameObject.mockActor(), zone)).toThrow(
      "Incorrect params in 'squad_in_zone_all' condition: storyId 'nil', zoneName 'nil'"
    );
    expect(callXrCondition("squad_in_zone_all", MockGameObject.mockActor(), zone, "not-existing", "test")).toBe(false);
    expect(callXrCondition("squad_in_zone_all", MockGameObject.mockActor(), zone, "test-sid", zone.name())).toBe(true);

    jest.spyOn(zone, "inside").mockImplementation((position) => position === firstServer.position);

    squad.mockAddMember(firstServer);
    expect(callXrCondition("squad_in_zone_all", MockGameObject.mockActor(), zone, "test-sid", zone.name())).toBe(true);

    squad.mockAddMember(secondServer);
    expect(callXrCondition("squad_in_zone_all", MockGameObject.mockActor(), zone, "test-sid", zone.name())).toBe(false);

    registerObject(first);
    registerObject(second);

    jest.spyOn(zone, "inside").mockImplementation(() => true);

    expect(callXrCondition("squad_in_zone_all", MockGameObject.mockActor(), zone, "test-sid", zone.name())).toBe(true);
  });
});

describe("squads_in_zone_b41", () => {
  it("should require every assigned squad member to be inside the light zone", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mockRegistered("jup_b41");
    const squad: MockSquad = MockSquad.mock();
    const member: ServerHumanObject = MockAlifeHumanStalker.mock();
    const zone: GameObject = MockGameObject.mock({ name: "jup_b41_sr_light" });

    squad.mockAddMember(member);
    getSimulationTerrainDescriptorById(terrain.id)!.assignedSquads.set(squad.id, squad);
    registerZone(zone);
    jest.spyOn(zone, "inside").mockReturnValue(true);

    expect(callXrCondition("squads_in_zone_b41", MockGameObject.mockActor(), MockGameObject.mock())).toBe(true);

    jest.spyOn(zone, "inside").mockReturnValue(false);
    expect(callXrCondition("squads_in_zone_b41", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);
  });
});

describe("squad_exist", () => {
  it("should check if squad exists", () => {
    const object: ServerHumanObject = MockAlifeHumanStalker.mock();

    registerStoryLink(object.id, "test-story");

    expect(callXrCondition("squad_exist", MockGameObject.mockActor(), MockGameObject.mock(), "test-story")).toBe(true);
    expect(callXrCondition("squad_exist", MockGameObject.mockActor(), MockGameObject.mock(), "void")).toBe(false);

    expect(() => callXrCondition("squad_exist", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Wrong parameter storyId 'nil' in squad_exist condition."
    );
  });
});

describe("is_squad_commander", () => {
  it("should recognize the squad commander and reject other members", () => {
    const squad: MockSquad = MockSquad.mock();
    const commander: ServerHumanObject = MockAlifeHumanStalker.mock();
    const member: ServerHumanObject = MockAlifeHumanStalker.mock();
    const commanderObject: GameObject = MockGameObject.mock({ id: commander.id });
    const memberObject: GameObject = MockGameObject.mock({ id: member.id });

    registerSimulator();
    MockAlifeSimulator.addToRegistry(squad);
    MockAlifeSimulator.addToRegistry(commander);
    MockAlifeSimulator.addToRegistry(member);
    squad.mockAddMember(commander);
    squad.mockAddMember(member);
    jest.spyOn(squad, "commander_id").mockReturnValue(commander.id);

    expect(callXrCondition("is_squad_commander", MockGameObject.mockActor(), commanderObject)).toBe(true);
    expect(callXrCondition("is_squad_commander", MockGameObject.mockActor(), memberObject)).toBe(false);
  });
});

describe("squad_npc_count_ge", () => {
  it("squad_npc_count_ge should compare the resolved squad member count with the threshold", () => {
    const squad: MockSquad = MockSquad.mock();

    squad.mockAddMember(MockAlifeHumanStalker.mock());
    squad.mockAddMember(MockAlifeHumanStalker.mock());
    registerStoryLink(squad.id, "test-squad");

    expect(
      callXrCondition("squad_npc_count_ge", MockGameObject.mockActor(), MockGameObject.mock(), "test-squad", "1")
    ).toBe(true);
    expect(
      callXrCondition("squad_npc_count_ge", MockGameObject.mockActor(), MockGameObject.mock(), "test-squad", "2")
    ).toBe(false);
  });
});

describe("quest_npc_enemy_actor", () => {
  it("should recognize a hostile story stalker", () => {
    const { actorGameObject } = mockRegisteredActor();
    const stalker: GameObject = MockGameObject.mockStalker();

    registerStoryLink(stalker.id(), "test-story-stalker");
    jest.spyOn(stalker, "general_goodwill").mockReturnValue(-1000);

    expect(callXrCondition("quest_npc_enemy_actor", actorGameObject, MockGameObject.mock(), "test-story-stalker")).toBe(
      true
    );

    jest.spyOn(stalker, "general_goodwill").mockReturnValue(-999);
    expect(callXrCondition("quest_npc_enemy_actor", actorGameObject, MockGameObject.mock(), "test-story-stalker")).toBe(
      false
    );
  });
});

describe("distance_to_obj_ge", () => {
  it("should check distance", () => {
    expect(
      callXrCondition("distance_to_obj_ge", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid", 10)
    ).toBe(false);

    const { actorGameObject } = mockRegisteredActor();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock();

    registerStoryLink(serverObject.id, "test-sid");

    jest.spyOn(actorGameObject.position(), "distance_to_sqr").mockImplementation(() => 100);
    expect(
      callXrCondition("distance_to_obj_ge", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid", 10)
    ).toBe(true);

    jest.spyOn(actorGameObject.position(), "distance_to_sqr").mockImplementation(() => 99);
    expect(
      callXrCondition("distance_to_obj_ge", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid", 10)
    ).toBe(false);
  });
});

describe("distance_to_obj_le", () => {
  it("should check distance", () => {
    expect(
      callXrCondition("distance_to_obj_le", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid", 10)
    ).toBe(false);

    const { actorGameObject } = mockRegisteredActor();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock();

    registerStoryLink(serverObject.id, "test-sid");

    jest.spyOn(actorGameObject.position(), "distance_to_sqr").mockImplementation(() => 100);
    expect(
      callXrCondition("distance_to_obj_le", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid", 10)
    ).toBe(false);

    jest.spyOn(actorGameObject.position(), "distance_to_sqr").mockImplementation(() => 99);
    expect(
      callXrCondition("distance_to_obj_le", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid", 10)
    ).toBe(true);
  });
});

describe("distance_to_obj_on_job_le", () => {
  it("should check object job distance", () => {
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
});

describe("active_item", () => {
  it("should check object active item", () => {
    const { actorGameObject } = mockRegisteredActor();

    const first: GameObject = MockGameObject.mock({ section: "test-1" });
    const second: GameObject = MockGameObject.mock({ section: "test-2" });

    expect(callXrCondition("active_item", actorGameObject, MockGameObject.mock())).toBe(false);
    expect(
      callXrCondition("active_item", actorGameObject, MockGameObject.mock(), first.section(), second.section())
    ).toBe(false);

    jest.spyOn(actorGameObject, "item_in_slot").mockImplementation(() => first);

    expect(
      callXrCondition("active_item", actorGameObject, MockGameObject.mock(), first.section(), second.section())
    ).toBe(true);

    expect(callXrCondition("active_item", actorGameObject, MockGameObject.mock(), first.section())).toBe(true);
    expect(callXrCondition("active_item", actorGameObject, MockGameObject.mock(), second.section())).toBe(false);
  });
});

describe("check_bloodsucker_state", () => {
  it("should compare the resolved object visibility state", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "get_visibility_state").mockReturnValue(1);

    expect(callXrCondition("check_bloodsucker_state", MockGameObject.mockActor(), object, "1")).toBe(true);
    expect(callXrCondition("check_bloodsucker_state", MockGameObject.mockActor(), object, "0")).toBe(false);
  });
});

describe("in_dest_smart_cover", () => {
  it("should check if object is in smart cover", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "in_smart_cover").mockImplementation(() => true);
    expect(callXrCondition("in_dest_smart_cover", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "in_smart_cover").mockImplementation(() => false);
    expect(callXrCondition("in_dest_smart_cover", MockGameObject.mockActor(), object)).toBe(false);
  });
});

describe("dist_to_story_obj_ge", () => {
  it("should check distance", () => {
    const { actorGameObject } = mockRegisteredActor();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock();

    expect(callXrCondition("dist_to_story_obj_ge", actorGameObject, MockGameObject.mock(), "test-sid", 10)).toBe(true);

    registerStoryLink(serverObject.id, "test-sid");

    jest.spyOn(serverObject.position, "distance_to_sqr").mockImplementation(() => 99);
    expect(callXrCondition("dist_to_story_obj_ge", actorGameObject, MockGameObject.mock(), "test-sid", 10)).toBe(false);

    jest.spyOn(serverObject.position, "distance_to_sqr").mockImplementation(() => 101);
    expect(callXrCondition("dist_to_story_obj_ge", actorGameObject, MockGameObject.mock(), "test-sid", 10)).toBe(true);

    expect(serverObject.position.distance_to_sqr).toHaveBeenCalledWith(actorGameObject.position());
  });
});

describe("has_enemy_in_current_loopholes_fov", () => {
  it("should check enemies in loophole", () => {
    const object: GameObject = MockGameObject.mock();
    const enemy: GameObject = MockGameObject.mock();

    expect(callXrCondition("has_enemy_in_current_loopholes_fov", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "in_smart_cover").mockImplementation(() => true);
    expect(callXrCondition("has_enemy_in_current_loopholes_fov", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "best_enemy").mockImplementation(() => enemy);
    expect(callXrCondition("has_enemy_in_current_loopholes_fov", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "in_current_loophole_fov").mockImplementation((position) => position === enemy.position());
    expect(callXrCondition("has_enemy_in_current_loopholes_fov", MockGameObject.mockActor(), object)).toBe(true);
  });
});

describe("npc_talking", () => {
  it("should check if object is talking", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "is_talking").mockImplementation(() => true);
    expect(callXrCondition("npc_talking", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "is_talking").mockImplementation(() => false);
    expect(callXrCondition("npc_talking", MockGameObject.mockActor(), object)).toBe(false);
  });
});

describe("see_actor", () => {
  it("should check if object is alive and see actor", () => {
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
});

describe("object_exist", () => {
  it("should check if object exists", () => {
    expect(callXrCondition("object_exist", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(false);

    registerStoryLink(MockGameObject.mock().id(), "test-sid");
    expect(callXrCondition("object_exist", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(true);
  });
});

describe("squad_curr_action", () => {
  it("should check squad action", () => {
    const object: GameObject = MockGameObject.mock();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock({ id: object.id() });
    const squad: MockSquad = MockSquad.createRegistered();

    squad.mockAddMember(serverObject);

    expect(
      callXrCondition("squad_curr_action", MockGameObject.mockActor(), object, ESquadActionType.REACH_TARGET)
    ).toBe(false);

    squad.currentAction = new SquadReachTargetAction(squad);

    expect(
      callXrCondition("squad_curr_action", MockGameObject.mockActor(), object, ESquadActionType.REACH_TARGET)
    ).toBe(true);

    squad.currentAction = new SquadStayOnTargetAction(squad);

    expect(
      callXrCondition("squad_curr_action", MockGameObject.mockActor(), object, ESquadActionType.REACH_TARGET)
    ).toBe(false);
    expect(
      callXrCondition("squad_curr_action", MockGameObject.mockActor(), object, ESquadActionType.STAY_ON_TARGET)
    ).toBe(true);
  });
});

describe("check_enemy_smart", () => {
  it("should check enemy smart terrain", () => {
    const object: GameObject = MockGameObject.mock();
    const enemy: GameObject = MockGameObject.mock();
    const enemyServerObject: ServerHumanObject = MockAlifeHumanStalker.mock({ id: enemy.id() });
    const state: IRegistryObjectState = registerObject(object);
    const terrain: SmartTerrain = MockSmartTerrain.mock("terrain-name");

    expect(callXrCondition("check_enemy_smart", MockGameObject.mockActor(), object, terrain.name())).toBe(false);

    enemyServerObject.m_smart_terrain_id = terrain.id;
    state.enemyId = enemy.id();

    expect(callXrCondition("check_enemy_smart", MockGameObject.mockActor(), object, terrain.name())).toBe(false);

    registerObject(enemy);

    expect(callXrCondition("check_enemy_smart", MockGameObject.mockActor(), object, terrain.name())).toBe(true);
    expect(callXrCondition("check_enemy_smart", MockGameObject.mockActor(), object, "test-name")).toBe(false);

    state.enemyId = ACTOR_ID;

    expect(callXrCondition("check_enemy_smart", MockGameObject.mockActor(), object, terrain.name())).toBe(false);
  });
});

describe("polter_ignore_actor", () => {
  it("should check if poltergeist ignores actor", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "poltergeist_get_actor_ignore").mockImplementation(() => true);
    expect(callXrCondition("polter_ignore_actor", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "poltergeist_get_actor_ignore").mockImplementation(() => false);
    expect(callXrCondition("polter_ignore_actor", MockGameObject.mockActor(), object)).toBe(false);
  });
});

describe("burer_gravi_attack", () => {
  it("should check burer gravi attack", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "burer_get_force_gravi_attack").mockImplementation(() => true);
    expect(callXrCondition("burer_gravi_attack", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "burer_get_force_gravi_attack").mockImplementation(() => false);
    expect(callXrCondition("burer_gravi_attack", MockGameObject.mockActor(), object)).toBe(false);
  });
});

describe("burer_anti_aim", () => {
  it("should check burer anti aim", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "get_force_anti_aim").mockImplementation(() => true);
    expect(callXrCondition("burer_anti_aim", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "get_force_anti_aim").mockImplementation(() => false);
    expect(callXrCondition("burer_anti_aim", MockGameObject.mockActor(), object)).toBe(false);
  });
});

describe("is_playing_sound", () => {
  it("should check if object is playing sound", () => {
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMockOnce(isPlayingSound, () => true);
    expect(callXrCondition("is_playing_sound", MockGameObject.mockActor(), object)).toBe(true);

    replaceFunctionMockOnce(isPlayingSound, () => false);
    expect(callXrCondition("is_playing_sound", MockGameObject.mockActor(), object)).toBe(false);
  });
});

describe("is_door_blocked_by_npc", () => {
  it("should check if door is blocked by npc", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "is_door_blocked_by_npc").mockImplementation(() => true);
    expect(callXrCondition("is_door_blocked_by_npc", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "is_door_blocked_by_npc").mockImplementation(() => false);
    expect(callXrCondition("is_door_blocked_by_npc", MockGameObject.mockActor(), object)).toBe(false);
  });
});

describe("check_deimos_phase", () => {
  it("should check deimos phase", () => {
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
});

describe("animpoint_reached", () => {
  it("should check if animpoint is reached", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeAnimpointState = mockSchemeState(EScheme.ANIMPOINT);

    expect(callXrCondition("animpoint_reached", MockGameObject.mockActor(), object)).toBe(false);

    setSchemeState(state, EScheme.ANIMPOINT, schemeState);
    schemeState.animpointController = new AnimpointController(object, schemeState);

    jest.spyOn(schemeState.animpointController, "isPositionReached").mockImplementation(() => true);
    expect(callXrCondition("animpoint_reached", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(schemeState.animpointController, "isPositionReached").mockImplementation(() => false);
    expect(callXrCondition("animpoint_reached", MockGameObject.mockActor(), object)).toBe(false);
  });
});

describe("upgrade_hint_kardan", () => {
  it("should publish missing requirements and allow upgrades after both requirements are met", () => {
    const manager: UpgradesManager = getManager(UpgradesManager);
    const setCurrentHints = jest.spyOn(manager, "setCurrentHints");

    mockRegisteredActor();

    expect(callXrCondition("upgrade_hint_kardan", MockGameObject.mockActor(), MockGameObject.mock(), "0")).toBe(false);
    expect(setCurrentHints).toHaveBeenLastCalledWith(
      $fromArray(["st_upgr_toolkit_1", "st_upgr_toolkit_2", "st_upgr_toolkit_3", "st_upgr_vodka"])
    );

    giveInfoPortion("zat_b3_all_instruments_brought");
    giveInfoPortion("zat_b3_tech_see_produce_62");

    expect(callXrCondition("upgrade_hint_kardan", MockGameObject.mockActor(), MockGameObject.mock(), "0")).toBe(true);
    expect(setCurrentHints).toHaveBeenLastCalledWith($fromArray([]));
  });
});
