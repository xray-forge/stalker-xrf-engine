import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { AnyCallable, AnyCallablesModule, FALSE, getExtern, TRUE } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import {
  MockAlifeHumanStalker,
  MockAlifeObject,
  MockAlifeSimulator,
  MockGameObject,
  MockIniFile,
  MockPatrol,
} from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { misc } from "@/engine/constants/items/misc";
import {
  IRegistryObjectState,
  registerObject,
  registerSimulator,
  registerStoryLink,
  registry,
  SYSTEM_INI,
} from "@/engine/core/database";
import { getSimulationTerrainDescriptorById } from "@/engine/core/managers/simulation/utils";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { ISchemeMobCombatState } from "@/engine/core/schemes/monster/mob_combat";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/stalker/combat_ignore";
import { getSchemeState, setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import {
  callXrEffect,
  mockRegisteredActor,
  mockSchemeState,
  MockSmartTerrain,
  MockSquad,
  resetRegistry,
} from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => {
  const actual = jest.requireActual<Record<string, unknown>>("@/engine/core/schemes/runtime/scheme_switch");

  return { ...actual, trySwitchToAnotherSection: jest.fn() };
});

beforeAll(() => {
  require("@/engine/declarations/effects/object");
});

beforeAll(() => {
  require("@/engine/declarations/effects/object");
});

beforeEach(() => {
  resetRegistry();
  jest.mocked(trySwitchToAnotherSection).mockReset();
});

describe("anim_obj_forward", () => {
  it("should correctly play forward animation", () => {
    const firstDoor = { startAnimation: jest.fn(), stopAnimation: jest.fn() };
    const secondDoor = { startAnimation: jest.fn(), stopAnimation: jest.fn() };

    registry.doors.set("first-door", firstDoor as never);
    registry.doors.set("second-door", secondDoor as never);

    callXrEffect("anim_obj_forward", MockGameObject.mockActor(), MockGameObject.mock(), "first-door", "second-door");

    expect(firstDoor.startAnimation).toHaveBeenCalledWith(true);
    expect(secondDoor.startAnimation).toHaveBeenCalledWith(true);
  });
});

describe("anim_obj_backward", () => {
  it("should correctly play backward animation", () => {
    const firstDoor = { startAnimation: jest.fn(), stopAnimation: jest.fn() };
    const secondDoor = { startAnimation: jest.fn(), stopAnimation: jest.fn() };

    registry.doors.set("first-door", firstDoor as never);
    registry.doors.set("second-door", secondDoor as never);

    callXrEffect("anim_obj_backward", MockGameObject.mockActor(), MockGameObject.mock(), "first-door", "second-door");

    expect(firstDoor.startAnimation).toHaveBeenCalledWith(false);
    expect(secondDoor.startAnimation).toHaveBeenCalledWith(false);
  });
});

describe("anim_obj_stop", () => {
  it("should correctly stop animation", () => {
    const firstDoor = { startAnimation: jest.fn(), stopAnimation: jest.fn() };
    const secondDoor = { startAnimation: jest.fn(), stopAnimation: jest.fn() };

    registry.doors.set("first-door", firstDoor as never);
    registry.doors.set("second-door", secondDoor as never);

    callXrEffect("anim_obj_stop", MockGameObject.mockActor(), MockGameObject.mock(), "first-door", "second-door");

    expect(firstDoor.stopAnimation).toHaveBeenCalledTimes(1);
    expect(secondDoor.stopAnimation).toHaveBeenCalledTimes(1);
  });
});

describe("hit_obj", () => {
  it("should hit object based on parameters", () => {
    const source: GameObject = MockGameObject.mock();
    const target: GameObject = MockGameObject.mock();

    registerObject(target);
    registerStoryLink(target.id(), "target");

    callXrEffect("hit_obj", MockGameObject.mockActor(), source, "target", "bone", 0.25, 10, null);

    expect(target.hit).toHaveBeenCalledWith(
      expect.objectContaining({ boneName: "bone", draftsman: source, impulse: 10, power: 0.25 })
    );
  });
});

describe("hit_npc_from_actor", () => {
  it("should hit object from actor", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const target: GameObject = MockGameObject.mock();

    callXrEffect("hit_npc_from_actor", actor, target);

    expect(target.hit).toHaveBeenCalledWith(
      expect.objectContaining({ boneName: "bip01_spine", draftsman: actor, impulse: 0.001, power: 0.001 })
    );
  });

  it("should hit the story object when one is named", () => {
    const target: GameObject = MockGameObject.mock();

    registerObject(target);
    registerStoryLink(target.id(), "hit-target-sid");

    callXrEffect("hit_npc_from_actor", MockGameObject.mockActor(), MockGameObject.mock(), "hit-target-sid");

    expect(target.hit).toHaveBeenCalledTimes(1);
  });
});

describe("make_enemy", () => {
  it("should make object enemy to actor", () => {
    const source: GameObject = MockGameObject.mock();
    const target: GameObject = MockGameObject.mock();

    registerObject(source);
    registerStoryLink(source.id(), "source");

    callXrEffect("make_enemy", MockGameObject.mockActor(), target, "source");

    expect(target.hit).toHaveBeenCalledWith(
      expect.objectContaining({ boneName: "bip01_spine", draftsman: source, impulse: 0.03, power: 0.03 })
    );
  });

  it("should hit the explicitly named target instead of the speaker", () => {
    const from: GameObject = MockGameObject.mock();
    const to: GameObject = MockGameObject.mock();

    registerObject(from);
    registerObject(to);
    registerStoryLink(from.id(), "enemy-from-sid");
    registerStoryLink(to.id(), "enemy-to-sid");

    callXrEffect("make_enemy", MockGameObject.mockActor(), MockGameObject.mock(), "enemy-from-sid", "enemy-to-sid");

    expect(to.hit).toHaveBeenCalledTimes(1);
  });
});

describe("sniper_fire_mode", () => {
  it("should set object as sniper", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("sniper_fire_mode", MockGameObject.mockActor(), object, TRUE);
    expect(object.sniper_fire_mode).toHaveBeenCalledWith(true);

    callXrEffect("sniper_fire_mode", MockGameObject.mockActor(), object, FALSE);
    expect(object.sniper_fire_mode).toHaveBeenCalledWith(false);
  });
});

describe("kill_npc", () => {
  it("should kill an alive object only", () => {
    const alive: GameObject = MockGameObject.mock({ alive: true });
    const dead: GameObject = MockGameObject.mock({ alive: false });

    callXrEffect("kill_npc", MockGameObject.mockActor(), alive);
    callXrEffect("kill_npc", MockGameObject.mockActor(), dead);

    expect(alive.kill).toHaveBeenCalledWith(alive);
    expect(dead.kill).not.toHaveBeenCalled();
  });
});

describe("remove_npc", () => {
  it("should remove the server object linked by story id", () => {
    const serverObject = MockAlifeObject.create();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(serverObject);
    registerStoryLink(serverObject.id, "target");

    callXrEffect("remove_npc", MockGameObject.mockActor(), MockGameObject.mock(), "target");

    expect(registry.simulator.release).toHaveBeenCalledWith(serverObject, true);
  });

  it("should do nothing without a story id or for an unknown one", () => {
    registerSimulator();

    callXrEffect("remove_npc", MockGameObject.mockActor(), MockGameObject.mock());
    callXrEffect("remove_npc", MockGameObject.mockActor(), MockGameObject.mock(), "missing-npc");

    expect(registry.simulator.release).not.toHaveBeenCalled();
  });
});

describe("clear_abuse", () => {
  it("should clear abuse state", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const abuseController = { clearAbuse: jest.fn() };

    setSchemeState(state, EScheme.ABUSE, { abuseController } as unknown as ISchemeAbuseState);

    callXrEffect("clear_abuse", MockGameObject.mockActor(), object);

    expect(abuseController.clearAbuse).toHaveBeenCalledTimes(1);
  });
});

describe("disable_combat_handler", () => {
  it("should disable every registered combat handler", () => {
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

  it("should do nothing when neither combat scheme is present", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(() => callXrEffect("disable_combat_handler", MockGameObject.mockActor(), object)).not.toThrow();
  });
});

describe("disable_combat_ignore_handler", () => {
  it("should disable combat ignore state", () => {
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

  it("should do nothing when the combat ignore scheme is absent", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(() => callXrEffect("disable_combat_ignore_handler", MockGameObject.mockActor(), object)).not.toThrow();
  });
});

describe("spawn_object", () => {
  it("should create an object at the requested patrol point", () => {
    const object: GameObject = MockGameObject.mock();

    registerSimulator();
    MockPatrol.setup({
      "spawn-path": {
        points: [{ flag: 0, gvid: 44, lvid: 25, name: "spawn-point", position: object.position() as any }],
      },
    });

    callXrEffect("spawn_object", MockGameObject.mockActor(), object, "test-object", "spawn-path", 0, 90);

    expect(registry.simulator.create).toHaveBeenCalledWith("test-object", object.position(), 25, 44);
  });
});

describe("spawn_object_in", () => {
  it("should spawn objects in the server inventory of the story target", () => {
    const serverObject = MockAlifeObject.create();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(serverObject);
    registerStoryLink(serverObject.id, "target");

    callXrEffect("spawn_object_in", MockGameObject.mockActor(), MockGameObject.mock(), "test-item", "target");

    expect(registry.simulator.create).toHaveBeenCalledWith("test-item", expect.anything(), 0, 0, serverObject.id);
  });
});

describe("spawn_corpse", () => {
  it("should create and immediately kill a creature at the requested patrol point", () => {
    const object: GameObject = MockGameObject.mock();
    const corpse = MockAlifeHumanStalker.mock({ id: 501 });

    registerSimulator();
    MockPatrol.setup({
      "corpse-path": {
        points: [{ flag: 0, gvid: 55, lvid: 35, name: "corpse-point", position: object.position() as any }],
      },
    });
    jest.spyOn(corpse, "kill");
    jest.spyOn(registry.simulator, "create").mockImplementationOnce(() => corpse);

    callXrEffect("spawn_corpse", MockGameObject.mockActor(), object, "test_stalker", "corpse-path", 0);

    expect(registry.simulator.create).toHaveBeenCalledWith("test_stalker", object.position(), 35, 55);
    expect(corpse.kill).toHaveBeenCalledTimes(1);
  });

  it("should reject a missing section, a missing path, and an unknown path", () => {
    const object: GameObject = MockGameObject.mock();

    registerSimulator();

    expect(() => callXrEffect("spawn_corpse", MockGameObject.mockActor(), object)).toThrow();
    expect(() => callXrEffect("spawn_corpse", MockGameObject.mockActor(), object, "stalker_section")).toThrow();
    expect(() =>
      callXrEffect("spawn_corpse", MockGameObject.mockActor(), object, "stalker_section", "missing-path")
    ).toThrow();
  });

  it("should spawn at the requested patrol index", () => {
    const object: GameObject = MockGameObject.mock();
    const corpse: ServerHumanObject = MockAlifeHumanStalker.mock({ id: 601 });

    registerSimulator();
    MockPatrol.setup({
      "corpse-path": {
        points: [
          { flag: 0, gvid: 1, lvid: 2, name: "first", position: object.position() as never },
          { flag: 0, gvid: 3, lvid: 4, name: "second", position: object.position() as never },
        ],
      },
    });
    jest.spyOn(registry.simulator, "create").mockImplementation(() => corpse);
    jest.spyOn(corpse, "kill");

    callXrEffect("spawn_corpse", MockGameObject.mockActor(), object, "stalker_section", "corpse-path", 1);

    expect(corpse.kill).toHaveBeenCalledTimes(1);
  });
});

describe("destroy_object", () => {
  it("should release linked objects and reject incomplete target descriptors", () => {
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

  it("should resolve target descriptors supplied with a third parameter", () => {
    const object: GameObject = MockGameObject.mock();
    const targetObject = MockAlifeObject.create();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(targetObject);
    registerStoryLink(targetObject.id, "target");

    // Target type has to come from the first parameter, not from the tuple itself.
    callXrEffect("destroy_object", MockGameObject.mockActor(), object, "story", "target", "extra");

    expect(registry.simulator.release).toHaveBeenCalledWith(targetObject, true);
  });
});

describe("create_squad", () => {
  it("should create a configured squad in the requested smart terrain", () => {
    registerSimulator();
    mockRegisteredActor();

    const terrain = MockSmartTerrain.mock("test-terrain");

    (SYSTEM_INI as unknown as MockIniFile).data.test_spawn_squad = {
      faction: "stalker",
      npc: "test_stalker",
    };

    const squad: MockSquad = MockSquad.mock({ section: "test_spawn_squad" });

    terrain.on_before_register();
    terrain.on_register();
    jest.spyOn(registry.simulator, "create").mockReturnValue(squad);
    jest.spyOn(squad, "addMember").mockImplementation(jest.fn(() => null as never));

    callXrEffect("create_squad", MockGameObject.mockActor(), MockGameObject.mock(), "test_spawn_squad", "test-terrain");

    expect(registry.simulator.create).toHaveBeenCalledWith(
      "test_spawn_squad",
      terrain.position,
      terrain.m_level_vertex_id,
      terrain.m_game_vertex_id
    );
    expect(squad.addMember).toHaveBeenCalledWith(
      "test_stalker",
      terrain.position,
      terrain.m_level_vertex_id,
      terrain.m_game_vertex_id
    );
    expect(squad.assignedTerrainId).toBe(terrain.id);
  });
});

/**
 * Register a simulator, an actor, a terrain and a story-linked squad ready for `create_squad_member`.
 */
function mockCreateSquadMemberSetup(): { squad: MockSquad; member: ServerHumanObject; terrain: MockSmartTerrain } {
  registerSimulator();
  mockRegisteredActor();

  const terrain: MockSmartTerrain = MockSmartTerrain.mock("test-terrain") as MockSmartTerrain;
  const squad: MockSquad = MockSquad.mock();
  const commander: ServerHumanObject = MockAlifeHumanStalker.mock();
  const member: ServerHumanObject = MockAlifeHumanStalker.mock();

  terrain.on_before_register();
  terrain.on_register();
  squad.assignedTerrainId = terrain.id;
  squad.mockAddMember(commander);
  MockAlifeSimulator.addToRegistry(squad);
  MockAlifeSimulator.addToRegistry(commander);
  registerStoryLink(squad.id, "test-squad");
  jest.spyOn(squad, "commander_id").mockReturnValue(commander.id);
  jest.spyOn(squad, "addMember").mockReturnValue(member);
  jest.spyOn(squad, "assignMemberToTerrain");
  jest.spyOn(squad, "update");

  return { member, squad, terrain };
}

describe("create_squad_member", () => {
  it("should add and assign a member at the squad commander position", () => {
    registerSimulator();
    mockRegisteredActor();

    const terrain = MockSmartTerrain.mock("test-terrain");
    const squad: MockSquad = MockSquad.mock();
    const commander: ServerHumanObject = MockAlifeHumanStalker.mock();
    const member: ServerHumanObject = MockAlifeHumanStalker.mock();

    terrain.on_before_register();
    terrain.on_register();
    squad.assignedTerrainId = terrain.id;
    squad.mockAddMember(commander);
    MockAlifeSimulator.addToRegistry(squad);
    MockAlifeSimulator.addToRegistry(commander);
    registerStoryLink(squad.id, "test-squad");
    jest.spyOn(squad, "commander_id").mockReturnValue(commander.id);
    jest.spyOn(squad, "addMember").mockReturnValue(member);
    jest.spyOn(squad, "assignMemberToTerrain");
    jest.spyOn(squad, "update").mockImplementation(jest.fn());

    callXrEffect("create_squad_member", MockGameObject.mockActor(), MockGameObject.mock(), "test_member", "test-squad");

    expect(squad.addMember).toHaveBeenCalledWith(
      "test_member",
      commander.position,
      commander.m_level_vertex_id,
      commander.m_game_vertex_id
    );
    expect(squad.assignMemberToTerrain).toHaveBeenCalledWith(member.id, terrain, null);
    expect(squad.update).toHaveBeenCalledTimes(1);
  });

  it("should reject a missing squad identifier", () => {
    expect(() =>
      callXrEffect("create_squad_member", MockGameObject.mockActor(), MockGameObject.mock(), "test_member")
    ).toThrow("Wrong squad identificator [NIL] in 'create_squad_member' function");
  });

  it("should spawn at an explicitly named patrol point", () => {
    const { squad, member } = mockCreateSquadMemberSetup();

    MockPatrol.setup({
      "member-point": {
        points: [{ flag: 0, gvid: 11, lvid: 22, name: "point", position: MockGameObject.mock().position() as never }],
      },
    });

    callXrEffect(
      "create_squad_member",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "test_member",
      "test-squad",
      "member-point"
    );

    expect(squad.addMember).toHaveBeenCalledWith("test_member", expect.anything(), 22, 11);
    expect(squad.assignMemberToTerrain).toHaveBeenCalledWith(member.id, expect.anything(), null);
  });

  // The `simulation_point` variant that reads `spawn_point` out of system.ini is not covered here: forcing that
  // read requires stubbing the shared `SYSTEM_INI` singleton, which leaks into every later test in this file.
  it("should fall back to the terrain spawn point when the squad configures none", () => {
    const { squad, terrain } = mockCreateSquadMemberSetup();

    MockPatrol.setup({
      "terrain-point": {
        points: [{ flag: 0, gvid: 55, lvid: 66, name: "point", position: MockGameObject.mock().position() as never }],
      },
    });
    terrain.spawnPointName = "terrain-point";

    callXrEffect(
      "create_squad_member",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "test_member",
      "test-squad",
      "simulation_point"
    );

    expect(squad.addMember).toHaveBeenCalledWith("test_member", expect.anything(), 66, 55);
  });
});

describe("remove_squad", () => {
  it("should release every squad member from simulation", () => {
    const squad: MockSquad = MockSquad.mock();
    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(squad);
    MockAlifeSimulator.addToRegistry(first);
    MockAlifeSimulator.addToRegistry(second);
    squad.mockAddMember(first);
    squad.mockAddMember(second);
    registerStoryLink(squad.id, "test-squad");

    callXrEffect("remove_squad", MockGameObject.mockActor(), MockGameObject.mock(), "test-squad");

    expect(registry.simulator.release).toHaveBeenNthCalledWith(1, first, true);
    expect(registry.simulator.release).toHaveBeenNthCalledWith(2, second, true);
    expect(squad.npc_count()).toBe(0);
  });

  it("should reject a missing squad and an unknown story id", () => {
    registerSimulator();

    expect(() => callXrEffect("remove_squad", MockGameObject.mockActor(), MockGameObject.mock())).toThrow();
    expect(() =>
      callXrEffect("remove_squad", MockGameObject.mockActor(), MockGameObject.mock(), "missing-squad")
    ).toThrow();
  });
});

describe("kill_squad", () => {
  it("should kill both online and offline squad members", () => {
    const squad: MockSquad = MockSquad.mock();
    const onlineMember: ServerHumanObject = MockAlifeHumanStalker.mock();
    const offlineMember: ServerHumanObject = MockAlifeHumanStalker.mock();
    const onlineObject: GameObject = MockGameObject.mock({ id: onlineMember.id });

    registerSimulator();
    MockAlifeSimulator.addToRegistry(squad);
    MockAlifeSimulator.addToRegistry(offlineMember);
    squad.mockAddMember(onlineMember);
    squad.mockAddMember(offlineMember);
    registerObject(onlineObject);
    registerStoryLink(squad.id, "test-squad");
    jest.spyOn(offlineMember, "kill");

    callXrEffect("kill_squad", MockGameObject.mockActor(), MockGameObject.mock(), "test-squad");

    expect(onlineObject.kill).toHaveBeenCalledWith(onlineObject);
    expect(offlineMember.kill).toHaveBeenCalledTimes(1);
  });
});

describe("heal_squad", () => {
  it("should restore health for every online squad member", () => {
    const squad: MockSquad = MockSquad.mock();
    const onlineMember: ServerHumanObject = MockAlifeHumanStalker.mock();
    const offlineMember: ServerHumanObject = MockAlifeHumanStalker.mock();
    const onlineObject: GameObject = MockGameObject.mock({ id: onlineMember.id, health: 0.2 });

    registerSimulator();
    MockAlifeSimulator.addToRegistry(squad);
    squad.mockAddMember(onlineMember);
    squad.mockAddMember(offlineMember);
    registerObject(onlineObject);
    registerStoryLink(squad.id, "test-squad");

    callXrEffect("heal_squad", MockGameObject.mockActor(), MockGameObject.mock(), "test-squad", 100);

    expect(onlineObject.health).toBe(1);
  });

  it("should reject a missing squad identifier and ignore an unknown squad", () => {
    expect(() => callXrEffect("heal_squad", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Wrong squad identifier 'nil' in heal_squad effect"
    );

    expect(() =>
      callXrEffect("heal_squad", MockGameObject.mockActor(), MockGameObject.mock(), "missing-squad")
    ).not.toThrow();
  });
});

describe("clear_smart_terrain", () => {
  it("should retain story-bound squads when requested", () => {
    registerSimulator();
    mockRegisteredActor();

    const terrain = MockSmartTerrain.mockRegistered("test-terrain");
    const removable: MockSquad = MockSquad.mock();
    const retained: MockSquad = MockSquad.mock();
    const removableMember: ServerHumanObject = MockAlifeHumanStalker.mock();
    const retainedMember: ServerHumanObject = MockAlifeHumanStalker.mock();
    const descriptor = getSimulationTerrainDescriptorById(terrain.id)!;

    for (const object of [removable, retained, removableMember, retainedMember]) {
      MockAlifeSimulator.addToRegistry(object);
    }

    removable.mockAddMember(removableMember);
    retained.mockAddMember(retainedMember);
    removable.assignedTerrainId = terrain.id;
    retained.assignedTerrainId = terrain.id;
    descriptor.assignedSquads.set(removable.id, removable);
    descriptor.assignedSquads.set(retained.id, retained);
    registerStoryLink(retained.id, "story-squad");

    callXrEffect("clear_smart_terrain", MockGameObject.mockActor(), MockGameObject.mock(), "test-terrain", FALSE);

    expect(registry.simulator.release).toHaveBeenCalledWith(removableMember, true);
    expect(registry.simulator.release).not.toHaveBeenCalledWith(retainedMember, true);
  });
});

describe("update_npc_logic", () => {
  it("should update every resolved stalker planner and state controller", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const stateController = { update: jest.fn() };

    registerStoryLink(object.id(), "stalker");
    state.stateController = stateController as never;
    jest.spyOn(object.motivation_action_manager(), "update");

    getExtern<AnyCallablesModule>("xr_effects").update_npc_logic(
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      $fromArray(["stalker", "unknown"])
    );

    expect(object.motivation_action_manager().update).toHaveBeenCalledTimes(3);
    expect(stateController.update).toHaveBeenCalledTimes(7);
  });
});

describe("update_obj_logic", () => {
  it("should re-evaluate the active scheme of every resolved story object", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const activeState = mockSchemeState<ISchemeCombatState>(EScheme.COMBAT);

    state.activeScheme = EScheme.COMBAT;
    setSchemeState(state, EScheme.COMBAT, activeState);
    registerStoryLink(object.id(), "target");

    getExtern<AnyCallablesModule>("xr_effects").update_obj_logic(
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      $fromArray(["target", "missing"])
    );

    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(1);
    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(object, activeState);
  });

  it("should skip story ids that resolve to nothing", () => {
    expect(() =>
      callXrEffect("update_obj_logic", MockGameObject.mockActor(), MockGameObject.mock(), "missing-logic-object")
    ).not.toThrow();
  });
});

describe("hit_npc", () => {
  it("should correctly hit objects", () => {
    const object: GameObject = MockGameObject.mock();
    const hitter: GameObject = MockGameObject.mock();

    registerObject(hitter);
    registerStoryLink(hitter.id(), "hitter");

    callXrEffect("hit_npc", MockGameObject.mockActor(), object, "hitter", null, "bone", 0.25, 10, FALSE);

    expect(object.hit).toHaveBeenCalledWith(
      expect.objectContaining({ boneName: "bone", draftsman: object, impulse: 10, power: 0.25 })
    );
  });

  it("should do nothing when the named hitter does not exist", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("hit_npc", MockGameObject.mockActor(), object, "missing-hitter", "bone", "1", 1, 1);

    expect(object.hit).not.toHaveBeenCalled();
  });

  it("should swap the draftsman and direction when reversed", () => {
    const object: GameObject = MockGameObject.mock();
    const hitter: GameObject = MockGameObject.mock();

    registerObject(hitter);
    registerStoryLink(hitter.id(), "hitter-sid");

    callXrEffect("hit_npc", MockGameObject.mockActor(), object, "hitter-sid", "bone", "1", 1, 1, TRUE);

    expect(object.hit).toHaveBeenCalledTimes(1);
  });

  it("should hit from a patrol point for the self variant in both directions", () => {
    const object: GameObject = MockGameObject.mock();

    MockPatrol.setup({
      "hit-path": {
        points: [{ flag: 0, gvid: 1, lvid: 2, name: "point", position: object.position() as never }],
      },
    });

    callXrEffect("hit_npc", MockGameObject.mockActor(), object, "self", "hit-path", "bone", 1, 1);
    callXrEffect("hit_npc", MockGameObject.mockActor(), object, "self", "hit-path", "bone", 1, 1, TRUE);

    expect(object.hit).toHaveBeenCalledTimes(2);
  });
});

describe("restore_health", () => {
  it("should correctly restore health of object", () => {
    const object: GameObject = MockGameObject.mock({ health: 0.2 });

    callXrEffect("restore_health", MockGameObject.mockActor(), object);

    expect(object.health).toBe(1);
  });
});

describe("force_obj", () => {
  it("should set supplied and default upward force values for a story object", () => {
    const target: GameObject = MockGameObject.mock();

    registerObject(target);
    registerStoryLink(target.id(), "target");

    callXrEffect("force_obj", MockGameObject.mockActor(), MockGameObject.mock(), "target");
    callXrEffect("force_obj", MockGameObject.mockActor(), MockGameObject.mock(), "target", 42, 500);

    expect(target.set_const_force).toHaveBeenNthCalledWith(1, expect.anything(), 20, 100);
    expect(target.set_const_force).toHaveBeenNthCalledWith(2, expect.anything(), 42, 500);
  });
});

describe("burer_force_gravi_attack", () => {
  it("should force burrer attack", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "burer_set_force_gravi_attack").mockImplementation(jest.fn());

    callXrEffect("burer_force_gravi_attack", MockGameObject.mockActor(), object);

    expect(object.burer_set_force_gravi_attack).toHaveBeenCalledTimes(1);
    expect(object.burer_set_force_gravi_attack).toHaveBeenCalledWith(true);
  });
});

describe("burer_force_anti_aim", () => {
  it("should force attack reset", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "set_force_anti_aim").mockImplementation(jest.fn());

    callXrEffect("burer_force_anti_aim", MockGameObject.mockActor(), object);

    expect(object.set_force_anti_aim).toHaveBeenCalledTimes(1);
    expect(object.set_force_anti_aim).toHaveBeenCalledWith(true);
  });
});

describe("give_items", () => {
  it("should spawn every requested item in the linked object inventory", () => {
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
});

describe("give_item", () => {
  it("should give an item to the linked server object", () => {
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
});

describe("disable_memory_object", () => {
  it("should disable memory for the current best enemy", () => {
    const object: GameObject = MockGameObject.mock();
    const enemy: GameObject = MockGameObject.mock();

    jest.spyOn(object, "best_enemy").mockReturnValue(enemy);

    callXrEffect("disable_memory_object", MockGameObject.mockActor(), object);

    jest.spyOn(object, "best_enemy").mockReturnValue(null);

    callXrEffect("disable_memory_object", MockGameObject.mockActor(), object);

    expect(object.enable_memory_object).toHaveBeenCalledWith(enemy, false);
    expect(object.enable_memory_object).toHaveBeenCalledTimes(1);
  });
});

describe("set_force_sleep_animation", () => {
  it("should force sleep animation", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("set_force_sleep_animation", MockGameObject.mockActor(), object, 5000);

    expect(object.force_stand_sleep_animation).toHaveBeenCalledWith(5000);
  });
});

describe("release_force_sleep_animation", () => {
  it("should stop forced sleep animation", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "release_stand_sleep_animation").mockImplementation(jest.fn());

    callXrEffect("release_force_sleep_animation", MockGameObject.mockActor(), object);

    expect(object.release_stand_sleep_animation).toHaveBeenCalledTimes(1);
  });
});

describe("set_visual_memory_enabled", () => {
  it("should toggle visual memory for valid boolean values", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("set_visual_memory_enabled", MockGameObject.mockActor(), object, 1);
    callXrEffect("set_visual_memory_enabled", MockGameObject.mockActor(), object, 0);

    expect(object.set_visual_memory_enabled).toHaveBeenCalledWith(true);
    expect(object.set_visual_memory_enabled).toHaveBeenCalledWith(false);
  });

  it("should ignore values outside the supported range", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("set_visual_memory_enabled", MockGameObject.mockActor(), object, 2);
    callXrEffect("set_visual_memory_enabled", MockGameObject.mockActor(), object, -1);

    expect(object.set_visual_memory_enabled).not.toHaveBeenCalled();
  });
});

describe("set_monster_animation", () => {
  it("should set animations for monsters", () => {
    const object: GameObject = MockGameObject.mock();

    expect(() => callXrEffect("set_monster_animation", MockGameObject.mockActor(), object)).toThrow(
      "Wrong parameters in function 'set_monster_animation'"
    );

    callXrEffect("set_monster_animation", MockGameObject.mockActor(), object, "test-animation");

    expect(object.set_override_animation).toHaveBeenCalledWith("test-animation");
  });
});

describe("clear_monster_animation", () => {
  it("should clear animations for monsters", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "clear_override_animation").mockImplementation(jest.fn());

    callXrEffect("clear_monster_animation", MockGameObject.mockActor(), object);

    expect(object.clear_override_animation).toHaveBeenCalledTimes(1);
  });
});

describe("switch_to_desired_job", () => {
  it("should exchange the object with the holder of its desired smart-terrain job", () => {
    const terrain: SmartTerrain = new SmartTerrain("test_smart");
    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();
    const object: GameObject = MockGameObject.mock({ id: first.id });

    registerSimulator();
    mockRegisteredActor();
    terrain.ini = terrain.spawn_ini() as MockIniFile;
    jest.spyOn(terrain, "name").mockReturnValue("test_smart");
    (terrain as unknown as { m_game_vertex_id: number }).m_game_vertex_id = 512;
    (first as unknown as { m_game_vertex_id: number }).m_game_vertex_id = 512;
    (second as unknown as { m_game_vertex_id: number }).m_game_vertex_id = 512;
    MockAlifeSimulator.addToRegistry(terrain);
    MockAlifeSimulator.addToRegistry(first);
    MockAlifeSimulator.addToRegistry(second);
    terrain.on_register();
    terrain.register_npc(first);
    terrain.register_npc(second);

    const firstJob = terrain.objectJobDescriptors.get(first.id).job!.section;
    const secondJob = terrain.objectJobDescriptors.get(second.id).job!.section;

    terrain.objectJobDescriptors.get(first.id).desiredJob = secondJob;

    callXrEffect("switch_to_desired_job", MockGameObject.mockActor(), object);

    expect(terrain.objectByJobSection.get(secondJob)).toBe(first.id);
    expect(terrain.objectByJobSection.get(firstJob)).toBe(second.id);
  });
});

describe("spawn_item_to_npc", () => {
  it("should spawn an item in the object inventory", () => {
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
});

describe("give_money_to_npc", () => {
  it("should give money for objects", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("give_money_to_npc", MockGameObject.mockActor(), object, 500);
    callXrEffect("give_money_to_npc", MockGameObject.mockActor(), object);

    expect(object.give_money).toHaveBeenCalledWith(500);
    expect(object.give_money).toHaveBeenCalledTimes(1);
  });
});

describe("seize_money_to_npc", () => {
  it("should get money from objects", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("seize_money_to_npc", MockGameObject.mockActor(), object, 500);
    callXrEffect("seize_money_to_npc", MockGameObject.mockActor(), object);

    expect(object.give_money).toHaveBeenCalledWith(-500);
    expect(object.give_money).toHaveBeenCalledTimes(1);
  });
});

describe("heli_start_flame", () => {
  it("should start flame", () => {
    const object: GameObject = MockGameObject.mockHelicopter();

    callXrEffect("heli_start_flame", MockGameObject.mockActor(), object);

    expect(object.get_helicopter().StartFlame).toHaveBeenCalledTimes(1);
  });
});

describe("heli_die", () => {
  it("should kill heli and remove it from the active helicopter list", () => {
    const object: GameObject = MockGameObject.mockHelicopter();

    registry.helicopter.storage.set(object.id(), object);

    callXrEffect("heli_die", MockGameObject.mockActor(), object);

    expect(object.get_helicopter().Die).toHaveBeenCalledTimes(1);
    expect(registry.helicopter.storage.has(object.id())).toBe(false);
  });
});

describe("set_bloodsucker_state", () => {
  it("should switch bloodsuckers", () => {
    const object: GameObject = MockGameObject.mock();

    expect(() => callXrEffect("set_bloodsucker_state", MockGameObject.mockActor(), object)).toThrow(
      "Wrong parameters in function 'set_bloodsucker_state'"
    );

    callXrEffect("set_bloodsucker_state", MockGameObject.mockActor(), object, "1");
    callXrEffect("set_bloodsucker_state", MockGameObject.mockActor(), object, "default");

    expect(object.force_visibility_state).toHaveBeenNthCalledWith(1, 1);
    expect(object.force_visibility_state).toHaveBeenNthCalledWith(2, -1);
  });

  it("should resolve the target from the story id and take the state from the second parameter", () => {
    const target: GameObject = MockGameObject.mock();

    registerObject(target);
    registerStoryLink(target.id(), "bloodsucker-sid");

    callXrEffect("set_bloodsucker_state", MockGameObject.mockActor(), MockGameObject.mock(), "bloodsucker-sid", "1");
    expect(target.force_visibility_state).toHaveBeenCalledWith(1);

    callXrEffect(
      "set_bloodsucker_state",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "bloodsucker-sid",
      "default"
    );
    expect(target.force_visibility_state).toHaveBeenCalledWith(-1);
  });

  it("should do nothing when neither the speaker nor the story id resolves an object", () => {
    expect(() =>
      callXrEffect("set_bloodsucker_state", MockGameObject.mockActor(), null as unknown as GameObject, "missing", "1")
    ).not.toThrow();
  });
});

describe("clear_box", () => {
  it("should release every item contained in the story inventory box", () => {
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
});

describe("polter_actor_ignore", () => {
  it("should force poltergeist to ignore actor", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("polter_actor_ignore", MockGameObject.mockActor(), object, TRUE);

    expect(object.poltergeist_set_actor_ignore).toHaveBeenCalledTimes(1);
    expect(object.poltergeist_set_actor_ignore).toHaveBeenCalledWith(true);

    callXrEffect("polter_actor_ignore", MockGameObject.mockActor(), object, FALSE);

    expect(object.poltergeist_set_actor_ignore).toHaveBeenCalledTimes(2);
    expect(object.poltergeist_set_actor_ignore).toHaveBeenCalledWith(false);
  });
});

describe("set_torch_state", () => {
  it("should switch actor torch state", () => {
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

  it("should do nothing when the story object carries no torch", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);
    registerStoryLink(object.id(), "torchless-sid");

    expect(() =>
      callXrEffect("set_torch_state", MockGameObject.mockActor(), MockGameObject.mock(), "torchless-sid", "on")
    ).not.toThrow();
  });
});
