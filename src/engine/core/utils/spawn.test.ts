import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registerActor, registerSimulator, registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import {
  getInventoryNameForItemSection,
  releaseObject,
  spawnAmmoForObject,
  spawnCreatureNearActor,
  spawnItemsForObject,
  spawnItemsForObjectFromList,
  spawnObject,
  spawnObjectInObject,
  spawnSquadInSmart,
} from "@/engine/core/utils/spawn";
import { createEmptyVector } from "@/engine/core/utils/vector";
import {
  AlifeSimulator,
  GameObject,
  ServerActorObject,
  ServerGroupObject,
  ServerHumanObject,
  ServerSmartZoneObject,
  TSection,
} from "@/engine/lib/types";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";
import {
  MockAlifeSimulator,
  MockGameObject,
  mockServerAlifeCreatureActor,
  mockServerAlifeObject,
} from "@/fixtures/xray";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

describe("spawning utils", () => {
  beforeEach(() => {
    resetRegistry();
    MockAlifeSimulator.reset();
    registerSimulator();
  });

  it("spawnItemsForObject should correctly spawn items and ammo", () => {
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

  it("spawnAmmoForObject should correctly spawn ammo for an object", () => {
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

  it("spawnItemsForObjectFromList should spawn desired count of random items from list", () => {
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

  it("getInventoryNameForItemSection should correctly search for translation", () => {
    expect(getInventoryNameForItemSection("wpn_not_existing")).toBe("translated_wpn_not_existing");
    expect(getInventoryNameForItemSection("wpn_ak74")).toBe("translated_AK-74");
  });

  it("spawnSquadInSmart should correctly spawn squad in smart terrain", () => {
    expect(() => spawnSquadInSmart(null, null)).toThrow();
    expect(() => spawnSquadInSmart("abc", null)).toThrow();
    expect(() => spawnSquadInSmart(null, "abc")).toThrow();
    expect(() => spawnSquadInSmart("abc", "abc")).toThrow();
    expect(() => spawnSquadInSmart("squad", "some_terrain")).toThrow();

    const simulationManager: SimulationBoardManager = SimulationBoardManager.getInstance();
    const smartTerrain: ServerSmartZoneObject = MockSmartTerrain.mock();
    const squad: Squad = MockSquad.mock();

    mockRegisteredActor();

    jest.spyOn(simulationManager, "enterSmartTerrain").mockImplementation(() => {});
    jest.spyOn(simulationManager, "createSquad").mockImplementation(() => squad);
    jest.spyOn(simulationManager, "setupObjectSquadAndGroup").mockImplementation(() => {});

    simulationManager.registerSmartTerrain(smartTerrain as SmartTerrain);

    squad.addMember("test", MockVector.mock(1, 1, 1), 1, 2);
    squad.addMember("test", MockVector.mock(2, 2, 2), 1, 2);

    const createdSquad: ServerGroupObject = spawnSquadInSmart("squad", smartTerrain.name());

    expect(createdSquad).toBe(squad);
    expect(squad.update).toHaveBeenCalled();
    expect(simulationManager.createSquad).toHaveBeenCalledWith(smartTerrain, "squad");
    expect(simulationManager.enterSmartTerrain).toHaveBeenCalledWith(squad, smartTerrain.id);
    expect(simulationManager.setupObjectSquadAndGroup).toHaveBeenCalledTimes(2);
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

  it("spawnObjectInObject should correctly create objects", () => {
    expect(() => spawnObjectInObject("test", 55)).toThrow();

    mockServerAlifeObject({ id: 55 });
    spawnObjectInObject("test", 55);

    expect(registry.simulator.create).toHaveBeenLastCalledWith("test", createEmptyVector(), 0, 0, 55);

    expect(() => spawnObjectInObject(null, 55)).toThrow();
    expect(() => spawnObjectInObject("test", null)).toThrow();
    expect(() => spawnObjectInObject(null, null)).toThrow();
  });

  it("releaseObject should release object", () => {
    const actor: ServerActorObject = mockServerAlifeCreatureActor();

    releaseObject(255);
    expect(registry.simulator.release).not.toHaveBeenCalled();

    releaseObject(actor.id);
    expect(registry.simulator.release).toHaveBeenCalledWith(actor, true);
  });

  it("spawnCreatureNearActor should create objects", () => {
    const actor: GameObject = MockGameObject.mockActor();

    registerActor(actor);

    spawnCreatureNearActor("test_section", 33);

    expect(registry.simulator.create).toHaveBeenCalledWith("test_section", { x: 33.25, y: 33.25, z: 33.25 }, 255, 512);
  });
});
