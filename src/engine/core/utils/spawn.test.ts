import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerActor, registerSimulator, registry } from "@/engine/core/database";
import { getSimulationTerrainAssignedSquadsCount } from "@/engine/core/managers/simulation/utils";
import { getObjectPositioning } from "@/engine/core/utils/position";
import {
  releaseObject,
  spawnAmmoAtPosition,
  spawnAmmoForObject,
  spawnCreatureNearActor,
  spawnItemsAtPosition,
  spawnItemsForObject,
  spawnItemsForObjectFromList,
  spawnObject,
  spawnObjectInObject,
  spawnSquadInSmart,
} from "@/engine/core/utils/spawn";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { MAX_ALIFE_ID } from "@/engine/lib/constants/memory";
import {
  AlifeSimulator,
  GameObject,
  ServerActorObject,
  ServerHumanObject,
  ServerSmartZoneObject,
  TSection,
} from "@/engine/lib/types";
import { mockRegisteredActor, MockSmartTerrain, resetRegistry } from "@/fixtures/engine";
import { MockAlifeCreatureActor, MockAlifeObject, MockGameObject } from "@/fixtures/xray";

describe("spawnItemsForObject util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly spawn items and ammo", () => {
    const object: GameObject = MockGameObject.mock();
    const simulator: AlifeSimulator = registry.simulator;

    expect(spawnItemsForObject(object, "item_test", 0)).toBe(0);
    expect(spawnItemsForObject(object, "item_test", -10)).toBe(0);
    expect(spawnItemsForObject(object, "item_test", 5, 0)).toBe(0);
    expect(spawnItemsForObject(object, "item_test", 5, -1)).toBe(0);

    expect(spawnItemsForObject(object, "item_test", 2)).toBe(2);
    expect(simulator.create).toHaveBeenCalledTimes(2);
    expect(simulator.create).toHaveBeenNthCalledWith(
      1,
      "item_test",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
    expect(simulator.create).toHaveBeenNthCalledWith(
      2,
      "item_test",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );

    expect(spawnItemsForObject(object, "ammo_5.45x39_ap", 2)).toBe(2);
    expect(simulator.create).toHaveBeenCalledTimes(2);
    expect(simulator.create_ammo).toHaveBeenCalledTimes(1);
    expect(simulator.create_ammo).toHaveBeenCalledWith(
      "ammo_5.45x39_ap",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id(),
      2
    );
  });
});

describe("spawnAmmoForObject util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly spawn ammo for an object", () => {
    const object: GameObject = MockGameObject.mock();
    const simulator: AlifeSimulator = registry.simulator;

    expect(spawnAmmoForObject(object, "ammo_5.45x39_ap", 0)).toBe(0);
    expect(spawnAmmoForObject(object, "ammo_5.45x39_ap", -10)).toBe(0);
    expect(spawnAmmoForObject(object, "ammo_5.45x39_ap", 5, 0)).toBe(0);
    expect(spawnAmmoForObject(object, "ammo_5.45x39_ap", 5, -1)).toBe(0);

    expect(spawnAmmoForObject(object, "ammo_5.45x39_ap", 45)).toBe(45);
    expect(simulator.create_ammo).toHaveBeenCalledTimes(2);
    expect(simulator.create_ammo).toHaveBeenNthCalledWith(
      1,
      "ammo_5.45x39_ap",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id(),
      30
    );
    expect(simulator.create_ammo).toHaveBeenNthCalledWith(
      2,
      "ammo_5.45x39_ap",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id(),
      15
    );
  });
});

describe("spawnItemsAtPosition util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly spawn items and ammo", () => {
    const object: GameObject = MockGameObject.mock();
    const simulator: AlifeSimulator = registry.simulator;

    const [, gvid, lvid, position] = getObjectPositioning(object);

    expect(spawnItemsAtPosition("item_test", gvid, lvid, position, 0)).toBe(0);
    expect(spawnItemsAtPosition("item_test", gvid, lvid, position, -10)).toBe(0);
    expect(spawnItemsAtPosition("item_test", gvid, lvid, position, 5, 0)).toBe(0);
    expect(spawnItemsAtPosition("item_test", gvid, lvid, position, 5, -1)).toBe(0);

    expect(spawnItemsAtPosition("item_test", gvid, lvid, position, 2)).toBe(2);
    expect(simulator.create).toHaveBeenCalledTimes(2);
    expect(simulator.create).toHaveBeenNthCalledWith(
      1,
      "item_test",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      MAX_ALIFE_ID
    );
    expect(simulator.create).toHaveBeenNthCalledWith(
      2,
      "item_test",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      MAX_ALIFE_ID
    );

    expect(spawnItemsAtPosition("ammo_5.45x39_ap", gvid, lvid, position, 2)).toBe(2);
    expect(simulator.create).toHaveBeenCalledTimes(2);
    expect(simulator.create_ammo).toHaveBeenCalledTimes(1);
    expect(simulator.create_ammo).toHaveBeenCalledWith(
      "ammo_5.45x39_ap",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      MAX_ALIFE_ID,
      2
    );
  });
});

describe("spawnAmmoAtPosition util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly spawn ammo for an object", () => {
    const object: GameObject = MockGameObject.mock();
    const simulator: AlifeSimulator = registry.simulator;

    const [, gvid, lvid, position] = getObjectPositioning(object);

    expect(spawnAmmoAtPosition("ammo_5.45x39_ap", gvid, lvid, position, 0)).toBe(0);
    expect(spawnAmmoAtPosition("ammo_5.45x39_ap", gvid, lvid, position, -10)).toBe(0);
    expect(spawnAmmoAtPosition("ammo_5.45x39_ap", gvid, lvid, position, 5, 0)).toBe(0);
    expect(spawnAmmoAtPosition("ammo_5.45x39_ap", gvid, lvid, position, 5, -1)).toBe(0);

    expect(spawnAmmoAtPosition("ammo_5.45x39_ap", gvid, lvid, position, 45)).toBe(45);
    expect(simulator.create_ammo).toHaveBeenCalledTimes(2);
    expect(simulator.create_ammo).toHaveBeenNthCalledWith(
      1,
      "ammo_5.45x39_ap",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      MAX_ALIFE_ID,
      30
    );
    expect(simulator.create_ammo).toHaveBeenNthCalledWith(
      2,
      "ammo_5.45x39_ap",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      MAX_ALIFE_ID,
      15
    );
  });
});

describe("spawnItemsForObjectFromList util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should spawn desired count of random items from list", () => {
    const object: GameObject = MockGameObject.mock();
    const simulator: AlifeSimulator = registry.simulator;

    spawnItemsForObjectFromList(object, $fromArray<TSection>([]), 3);
    spawnItemsForObjectFromList(object, $fromArray<TSection>(["test"]), 0);
    spawnItemsForObjectFromList(object, $fromArray<TSection>(["test"]), -10);

    expect(simulator.create).toHaveBeenCalledTimes(0);
    expect(simulator.create_ammo).toHaveBeenCalledTimes(0);

    spawnItemsForObjectFromList(object, $fromArray<TSection>(["example", "example", "example"]), 2);

    expect(simulator.create).toHaveBeenCalledTimes(2);
    expect(simulator.create).toHaveBeenNthCalledWith(
      1,
      "example",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
    expect(simulator.create).toHaveBeenNthCalledWith(
      2,
      "example",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
  });
});

describe("spawnSquadInSmart util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly spawn squad in smart terrain", () => {
    expect(() => spawnSquadInSmart(null, null)).toThrow();
    expect(() => spawnSquadInSmart("abc", null)).toThrow();
    expect(() => spawnSquadInSmart(null, "abc")).toThrow();
    expect(() => spawnSquadInSmart("abc", "abc")).toThrow();
    expect(() => spawnSquadInSmart("squad", "some_terrain")).toThrow();

    const terrain: ServerSmartZoneObject = MockSmartTerrain.mock();

    mockRegisteredActor();

    terrain.on_before_register();
    terrain.on_register();

    spawnSquadInSmart("simulation_stalker_squad", terrain.name());

    expect(getSimulationTerrainAssignedSquadsCount(terrain.id)).toBe(1);
  });
});

describe("spawnObject util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("spawnObject should correctly spawn objects", () => {
    expect(() => spawnObject("spawn_sect", "test", 1, 25)).toThrow();
    expect(() => spawnObject(null, "test", 1, 25)).toThrow();
    expect(() => spawnObject("test", null)).toThrow();
    expect(() => spawnObject(null, null)).toThrow();

    const object: ServerHumanObject = spawnObject("stalker", "test-wp", 1, 55);

    expect(registry.simulator.create).toHaveBeenLastCalledWith(
      "stalker",
      object.position,
      object.m_level_vertex_id,
      object.m_game_vertex_id
    );
    expect(object.o_torso).toHaveBeenCalledTimes(1);
  });
});

describe("spawnObjectInObject util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly create objects", () => {
    expect(() => spawnObjectInObject("test", 55)).toThrow();

    MockAlifeObject.mock({ id: 55 });
    spawnObjectInObject("test", 55);

    expect(registry.simulator.create).toHaveBeenLastCalledWith("test", createEmptyVector(), 0, 0, 55);

    expect(() => spawnObjectInObject(null, 55)).toThrow();
    expect(() => spawnObjectInObject("test", null)).toThrow();
    expect(() => spawnObjectInObject(null, null)).toThrow();
  });
});

describe("releaseObject util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should release object", () => {
    const actor: ServerActorObject = MockAlifeCreatureActor.mock();

    releaseObject(255);
    expect(registry.simulator.release).not.toHaveBeenCalled();

    releaseObject(actor.id);
    expect(registry.simulator.release).toHaveBeenCalledWith(actor, true);
  });
});

describe("spawnCreatureNearActor util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should create objects", () => {
    const actor: GameObject = MockGameObject.mockActor();

    registerActor(actor);

    spawnCreatureNearActor("test_section", 33);

    expect(registry.simulator.create).toHaveBeenCalledWith("test_section", { x: 33.25, y: 33.25, z: 33.25 }, 255, 512);
  });
});
