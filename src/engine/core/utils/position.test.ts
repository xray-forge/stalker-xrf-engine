import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game_graph } from "xray16";

import { registerSimulator, registerZone, registry } from "@/engine/core/database";
import {
  areObjectsOnSameLevel,
  getDistanceBetween,
  getDistanceBetweenSqr,
  getObjectPositioning,
  getObjectSmartTerrain,
  getServerDistanceBetween,
  isActorInNoWeaponZone,
  isDistanceBetweenObjectsGreaterOrEqual,
  isDistanceBetweenObjectsLessOrEqual,
  isObjectInActorFrustum,
  isObjectInSilenceZone,
  isObjectInSmartTerrain,
  isObjectInZone,
  isObjectOnLevel,
  sendToNearestAccessibleVertex,
  teleportActorWithEffects,
} from "@/engine/core/utils/position";
import { MAX_U32 } from "@/engine/lib/constants/memory";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { GameObject, ServerHumanObject, ServerObject, ServerSmartZoneObject, Vector } from "@/engine/lib/types";
import { mockRegisteredActor } from "@/fixtures/engine";
import {
  MockAlifeHumanStalker,
  MockGameObject,
  mockServerAlifeObject,
  mockServerAlifeSmartZone,
} from "@/fixtures/xray";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

describe("isObjectInSmartTerrain util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should check object inside smart terrain", () => {
    const smartTerrain = mockServerAlifeSmartZone({ name: <T extends string>() => "test-smart" as T });
    const { actorGameObject } = mockRegisteredActor({}, { m_smart_terrain_id: smartTerrain.id });

    expect(isObjectInSmartTerrain(actorGameObject, "test-smart")).toBe(true);
    expect(isObjectInSmartTerrain(actorGameObject, "test-smart-another")).toBe(false);
    expect(isObjectInSmartTerrain(actorGameObject, "another")).toBe(false);
  });
});

describe("isObjectInZone util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should check object inside", () => {
    const object: GameObject = MockGameObject.mock();
    const zone: GameObject = MockGameObject.mock();

    expect(isObjectInZone(object, zone)).toBe(false);
    expect(zone.inside).toHaveBeenCalledWith(object.position());
    expect(isObjectInZone(null, null)).toBe(false);
    expect(isObjectInZone(object, null)).toBe(false);
    expect(isObjectInZone(null, zone)).toBe(false);
  });
});

describe("isObjectInSilenceZone util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should check if object is in silence zone", () => {
    const object: GameObject = MockGameObject.mock();
    const zone: GameObject = MockGameObject.mock({ inside: () => true });

    expect(isObjectInSilenceZone(object)).toBe(false);

    registerZone(zone);
    registry.silenceZones.set(zone.id(), zone.name());

    expect(isObjectInSilenceZone(object)).toBe(true);

    jest.spyOn(zone, "inside").mockImplementation(() => false);

    expect(isObjectInSilenceZone(object)).toBe(false);
  });
});

describe("isObjectOnLevel util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should check object on level", () => {
    const object: ServerObject = mockServerAlifeObject();

    expect(isObjectOnLevel(null, "zaton")).toBe(false);
    expect(isObjectOnLevel(object, "pripyat")).toBe(true);

    expect(game_graph().vertex(object.m_game_vertex_id).level_id()).toBe(5120);
    expect(registry.simulator.level_name).toHaveBeenCalledWith(5120);
  });
});

describe("areObjectsOnSameLevel util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should check objects on level", () => {
    expect(areObjectsOnSameLevel(mockServerAlifeObject(), mockServerAlifeObject())).toBe(true);
    expect(areObjectsOnSameLevel(mockServerAlifeObject(), mockServerAlifeObject({ m_game_vertex_id: 990 }))).toBe(
      false
    );
    expect(
      areObjectsOnSameLevel(
        mockServerAlifeObject({ m_game_vertex_id: 990 }),
        mockServerAlifeObject({ m_game_vertex_id: 990 })
      )
    ).toBe(true);
  });
});

describe("isDistanceBetweenObjectsGreaterOrEqual util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly check", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 150);
    expect(isDistanceBetweenObjectsGreaterOrEqual(first, second, 100)).toBe(true);

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 25);
    expect(isDistanceBetweenObjectsGreaterOrEqual(first, second, 55)).toBe(false);

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 1000);
    expect(isDistanceBetweenObjectsGreaterOrEqual(first, second, 1000)).toBe(true);
  });
});

describe("isDistanceBetweenObjectsLessOrEqual util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly check", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 150);
    expect(isDistanceBetweenObjectsLessOrEqual(first, second, 100)).toBe(false);

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 25);
    expect(isDistanceBetweenObjectsLessOrEqual(first, second, 55)).toBe(true);

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 1000);
    expect(isDistanceBetweenObjectsLessOrEqual(first, second, 1000)).toBe(true);
  });
});

describe("getDistanceBetween util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("getServerDistanceBetween should correctly get distance for offline objects", () => {
    const first: ServerObject = mockServerAlifeObject({ m_game_vertex_id: 500 });

    jest.spyOn(game_graph().vertex(500).game_point(), "distance_to").mockImplementation(() => 600);
    expect(getServerDistanceBetween(first, mockServerAlifeObject())).toBe(600);

    const second: ServerObject = mockServerAlifeObject({ m_game_vertex_id: 501 });

    jest.spyOn(game_graph().vertex(501).game_point(), "distance_to").mockImplementation(() => 255);
    expect(getServerDistanceBetween(second, mockServerAlifeObject())).toBe(255);
  });

  it("should correctly get distance for game objects", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    expect(getDistanceBetween(first, second)).toBe(20);

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 600);
    expect(getDistanceBetween(first, second)).toBe(600);
  });
});

describe("getDistanceBetweenSqr utils", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("getDistanceBetweenSqr should correctly get distance for offline objects", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    expect(getDistanceBetweenSqr(first, second)).toBe(400);

    jest.spyOn(first.position(), "distance_to_sqr").mockImplementation(() => 1600);
    expect(getDistanceBetweenSqr(first, second)).toBe(1600);
  });
});

describe("sendToNearestAccessibleVertex utils", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly send object to nearest accesible vertex", () => {
    const first: GameObject = MockGameObject.mock();

    expect(sendToNearestAccessibleVertex(first, 150)).toBe(150);
    expect(first.accessible).toHaveBeenCalled();
    expect(first.set_dest_level_vertex_id).toHaveBeenCalledWith(150);

    const second: GameObject = MockGameObject.mock({
      accessible: jest.fn(() => false),
      accessible_nearest: jest.fn(() => $multi(14325, ZERO_VECTOR)),
    });

    expect(sendToNearestAccessibleVertex(second, 150)).toBe(14325);
    expect(second.accessible).toHaveBeenCalled();
    expect(second.accessible_nearest).toHaveBeenCalledWith({ x: 15, y: 14, z: 16 }, { x: 0, y: 0, z: 0 });
    expect(second.set_dest_level_vertex_id).toHaveBeenCalledWith(14325);

    const third: GameObject = MockGameObject.mock({
      level_vertex_id: jest.fn(() => 1442),
    });

    expect(sendToNearestAccessibleVertex(third, MAX_U32)).toBe(1442);
    expect(sendToNearestAccessibleVertex(third, MAX_U32 + 10)).toBe(1442);
    expect(sendToNearestAccessibleVertex(third, MAX_U32 * 2)).toBe(1442);
  });
});

describe("teleportActorWithEffects util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly teleport actor", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const destination: Vector = MockVector.mock(15, 14, 16);
    const direction: Vector = MockVector.mock(3, 5, 4);

    teleportActorWithEffects(actor, destination, direction);

    expect(actor.set_actor_position).toHaveBeenCalledWith(destination);
    expect(actor.set_actor_direction).toHaveBeenCalledWith(-direction.getH());
  });
});

describe("position utils", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("isObjectInActorFrustum should correctly check whether object is in actor frustum", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "position").mockImplementation(() => MockVector.mock(0.6, 0, 0.6));
    expect(isObjectInActorFrustum(object)).toBe(true);

    jest.spyOn(object, "position").mockImplementation(() => MockVector.mock(0.5, 0, 0.9));
    expect(isObjectInActorFrustum(object)).toBe(true);

    jest.spyOn(object, "position").mockImplementation(() => MockVector.mock(0.5, 1, 0.9));
    expect(isObjectInActorFrustum(object)).toBe(false);

    jest.spyOn(object, "position").mockImplementation(() => MockVector.mock(0.4, 0, 0.9));
    expect(isObjectInActorFrustum(object)).toBe(false);

    jest.spyOn(object, "position").mockImplementation(() => MockVector.mock(-0.6, 0, -0.6));
    expect(isObjectInActorFrustum(object)).toBe(false);

    jest.spyOn(object, "position").mockImplementation(() => MockVector.mock(0, 0, 0));
    expect(isObjectInActorFrustum(object)).toBe(false);
  });
});

describe("getObjectSmartTerrain util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly get smart terrain of an object", () => {
    expect(getObjectSmartTerrain(MockGameObject.mock())).toBeNull();
    expect(getObjectSmartTerrain(MockAlifeHumanStalker.mock())).toBeNull();

    const smartTerrainObject: ServerSmartZoneObject = mockServerAlifeSmartZone();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock();
    const gameObject: GameObject = MockGameObject.mock({ idOverride: serverObject.id });

    serverObject.m_smart_terrain_id = smartTerrainObject.id;

    expect(getObjectSmartTerrain(gameObject)).toBe(smartTerrainObject);
    expect(getObjectSmartTerrain(serverObject)).toBe(smartTerrainObject);

    serverObject.m_smart_terrain_id = 99_999;

    expect(getObjectSmartTerrain(gameObject)).toBeNull();
    expect(getObjectSmartTerrain(serverObject)).toBeNull();
  });
});

describe("getObjectPositioning util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly get positioning", () => {
    const gameObject: GameObject = MockGameObject.mock();

    expect(getObjectPositioning(gameObject)).toEqual([
      gameObject.id(),
      512,
      255,
      {
        x: 0.25,
        y: 0.25,
        z: 0.25,
      },
    ]);

    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock();

    expect(getObjectPositioning(serverObject)).toEqual([
      serverObject.id,
      512,
      255,
      {
        x: 0,
        y: 0,
        z: 0,
      },
    ]);
  });
});

describe("isActorInNoWeaponZone util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly check if actor is in no weapon zone", () => {
    const zone: GameObject = MockGameObject.mock();

    expect(isActorInNoWeaponZone()).toBe(false);

    registry.noWeaponZones.set(zone.id(), true);
    expect(isActorInNoWeaponZone()).toBe(true);

    registry.noWeaponZones.set(zone.id(), false);
    expect(isActorInNoWeaponZone()).toBe(false);
  });
});
