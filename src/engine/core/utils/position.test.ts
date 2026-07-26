import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game_graph, level, patrol } from "xray16";
import {
  ESoundObjectType,
  GameObject,
  ServerHumanObject,
  ServerObject,
  ServerSmartZoneObject,
  Vector,
} from "xray16/alias";
import { MAX_LEVEL_VERTEX_ID, MAX_U32, ZERO_VECTOR } from "xray16/lib";
import {
  MockAlifeHumanStalker,
  MockAlifeObject,
  MockAlifeSmartZone,
  MockGameObject,
  MockSoundObject,
  MockVector,
} from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { registerObject, registerSimulator, registerStoryLink, registerZone, registry } from "@/engine/core/database";
import {
  areObjectsOnSameLevel,
  getGameLevelName,
  getGameVertexLevelId,
  getObjectTerrain,
  getServerDistanceBetween,
  isActorInNoWeaponZone,
  isObjectInActorFrustum,
  isObjectInSilenceZone,
  isObjectInSmartTerrain,
  isObjectOnLevel,
  resetPositionCache,
  sendToNearestAccessibleVertex,
  teleportActorNearPosition,
  teleportActorToPatrol,
  teleportActorToStoryObject,
  teleportActorWithEffects,
} from "@/engine/core/utils/position";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
  MockSoundObject.resetRegistry();
  resetPositionCache();
});

describe("isObjectInSmartTerrain", () => {
  it("should check object inside smart terrain", () => {
    const terrain: ServerSmartZoneObject = MockAlifeSmartZone.mock({ name: "test-smart" });
    const { actorGameObject, actorServerObject } = mockRegisteredActor();

    actorServerObject.m_smart_terrain_id = terrain.id;

    expect(isObjectInSmartTerrain(actorGameObject, "test-smart")).toBe(true);
    expect(isObjectInSmartTerrain(actorGameObject, "test-smart-another")).toBe(false);
    expect(isObjectInSmartTerrain(actorGameObject, "another")).toBe(false);
  });
});

describe("isObjectInSilenceZone", () => {
  it("should check if object is in silence zone", () => {
    const object: GameObject = MockGameObject.mock();
    const zone: GameObject = MockGameObject.mock();

    jest.spyOn(zone, "inside").mockImplementation(() => true);

    expect(isObjectInSilenceZone(object)).toBe(false);

    registerZone(zone);
    registry.silenceZones.set(zone.id(), zone.name());

    expect(isObjectInSilenceZone(object)).toBe(true);

    jest.spyOn(zone, "inside").mockImplementation(() => false);

    expect(isObjectInSilenceZone(object)).toBe(false);
  });
});

describe("isObjectOnLevel", () => {
  it("should check object on level", () => {
    const first: ServerObject = MockAlifeObject.mock({ gameVertexId: 350 });
    const second: ServerObject = MockAlifeObject.mock({ gameVertexId: 152 });

    expect(isObjectOnLevel(null, "zaton")).toBe(false);
    expect(isObjectOnLevel(first, "pripyat")).toBe(true);

    expect(game_graph().vertex(first.m_game_vertex_id).level_id()).toBe(3);
    expect(registry.simulator.level_name).toHaveBeenCalledWith(3);

    expect(isObjectOnLevel(second, "zaton")).toBe(true);
    expect(isObjectOnLevel(second, "pripyat")).toBe(false);

    expect(game_graph().vertex(second.m_game_vertex_id).level_id()).toBe(1);
    expect(registry.simulator.level_name).toHaveBeenCalledWith(1);
  });
});

describe("areObjectsOnSameLevel", () => {
  it("should check objects on level", () => {
    expect(areObjectsOnSameLevel(MockAlifeObject.mock(), MockAlifeObject.mock())).toBe(true);
    expect(areObjectsOnSameLevel(MockAlifeObject.mock(), MockAlifeObject.mock({ gameVertexId: 330 }))).toBe(false);
    expect(
      areObjectsOnSameLevel(MockAlifeObject.mock({ gameVertexId: 200 }), MockAlifeObject.mock({ gameVertexId: 200 }))
    ).toBe(true);
  });
});

describe("getGameVertexLevelId", () => {
  it("should memoize level id lookups per game vertex", () => {
    const vertexSpy = jest.spyOn(game_graph(), "vertex");

    expect(getGameVertexLevelId(350)).toBe(3);

    const crossings: number = vertexSpy.mock.calls.length;

    // Memo hit - no additional graph crossings.
    expect(getGameVertexLevelId(350)).toBe(3);
    expect(vertexSpy.mock.calls).toHaveLength(crossings);
  });
});

describe("getGameLevelName", () => {
  it("should memoize level name lookups per level id", () => {
    expect(getGameLevelName(3)).toBe("pripyat");

    const crossings: number = (registry.simulator.level_name as unknown as jest.Mock).mock.calls.length;

    // Memo hit - no additional simulator crossings.
    expect(getGameLevelName(3)).toBe("pripyat");
    expect((registry.simulator.level_name as unknown as jest.Mock).mock.calls).toHaveLength(crossings);
  });
});

describe("getServerDistanceBetween", () => {
  it("should memoize distances by symmetric vertex pair until reset", () => {
    const first: ServerObject = MockAlifeObject.mock({ gameVertexId: 100 });
    const second: ServerObject = MockAlifeObject.mock({ gameVertexId: 101 });

    MockVector.DEFAULT_DISTANCE = 20;

    expect(getServerDistanceBetween(first, second)).toBe(20);

    // Underlying changes are invisible while memoized, key is symmetric.
    MockVector.DEFAULT_DISTANCE = 50;

    expect(getServerDistanceBetween(first, second)).toBe(20);
    expect(getServerDistanceBetween(second, first)).toBe(20);

    resetPositionCache();

    expect(getServerDistanceBetween(first, second)).toBe(50);
  });
});

describe("sendToNearestAccessibleVertex", () => {
  it("should correctly send object to nearest accesible vertex", () => {
    const first: GameObject = MockGameObject.mock();

    expect(sendToNearestAccessibleVertex(first, 150)).toBe(150);
    expect(first.accessible).toHaveBeenCalled();
    expect(first.set_dest_level_vertex_id).toHaveBeenCalledWith(150);

    const second: GameObject = MockGameObject.mock();

    jest.spyOn(second, "accessible").mockImplementation(() => false);
    jest.spyOn(second, "accessible_nearest").mockImplementation(() => $multi(14325, ZERO_VECTOR));

    expect(sendToNearestAccessibleVertex(second, 150)).toBe(14325);
    expect(second.accessible).toHaveBeenCalled();
    expect(second.accessible_nearest).toHaveBeenCalledWith({ x: 15, y: 14, z: 16 }, { x: 0, y: 0, z: 0 });
    expect(second.set_dest_level_vertex_id).toHaveBeenCalledWith(14325);

    const third: GameObject = MockGameObject.mock();

    jest.spyOn(third, "level_vertex_id").mockImplementation(() => 1442);

    expect(sendToNearestAccessibleVertex(third, MAX_U32)).toBe(1442);
    expect(sendToNearestAccessibleVertex(third, MAX_U32 + 10)).toBe(1442);
    expect(sendToNearestAccessibleVertex(third, MAX_U32 * 2)).toBe(1442);
  });
});

describe("teleportActorWithEffects", () => {
  beforeEach(() => {});

  it("should correctly teleport actor", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const destination: Vector = MockVector.mock(15, 14, 16);
    const direction: Vector = MockVector.mock(3, 5, 4);

    teleportActorWithEffects(actor, destination, direction);

    expect(actor.set_actor_position).toHaveBeenCalledWith(destination);
    expect(actor.set_actor_direction).toHaveBeenCalledWith(-direction.getH());

    expect(MockSoundObject.SOUND_OBJECT_REGISTRY).toHaveLength(1);
    expect(MockSoundObject.SOUND_OBJECT_REGISTRY[0].path).toBe("affects\\tinnitus3a");
    expect(MockSoundObject.SOUND_OBJECT_REGISTRY[0].play_no_feedback).toHaveBeenCalledWith(
      actor,
      ESoundObjectType.S2D,
      0,
      ZERO_VECTOR,
      1.0
    );
  });
});

describe("teleportActorToPatrol", () => {
  it("should move the actor to the first point of the patrol path", () => {
    const { actorGameObject } = mockRegisteredActor();

    teleportActorToPatrol("test-wp");

    expect(actorGameObject.set_actor_position).toHaveBeenCalledWith(new patrol("test-wp").point(0));
    expect(actorGameObject.set_actor_direction).toHaveBeenCalledTimes(0);
  });

  it("should turn the actor towards the look path when one is supplied", () => {
    const { actorGameObject } = mockRegisteredActor();

    teleportActorToPatrol("test-wp-2", "test-wp-3");

    expect(actorGameObject.set_actor_position).toHaveBeenCalledWith(new patrol("test-wp-2").point(0));
    expect(actorGameObject.set_actor_direction).toHaveBeenCalledWith(expect.closeTo(-1.5707));
  });

  it("should mark no weapon zones the actor arrived inside as active", () => {
    mockRegisteredActor();

    const noWeaponZone: GameObject = MockGameObject.mock();

    registerObject(noWeaponZone);
    jest.spyOn(noWeaponZone, "inside").mockImplementation(() => true);
    registry.noWeaponZones.set(noWeaponZone.id(), false);

    teleportActorToPatrol("test-wp");

    expect(registry.noWeaponZones.get(noWeaponZone.id())).toBe(true);
  });

  it("should leave no weapon zones the actor is outside of alone", () => {
    mockRegisteredActor();

    const noWeaponZone: GameObject = MockGameObject.mock();

    registerObject(noWeaponZone);
    jest.spyOn(noWeaponZone, "inside").mockImplementation(() => false);
    registry.noWeaponZones.set(noWeaponZone.id(), false);

    teleportActorToPatrol("test-wp");

    expect(registry.noWeaponZones.get(noWeaponZone.id())).toBe(false);
  });
});

describe("teleportActorNearPosition", () => {
  beforeEach(() => {
    resetFunctionMock(level.vertex_id);
    resetFunctionMock(level.vertex_position);
  });

  it("should arrive at the resolved vertex and face the position when it is close", () => {
    const { actorGameObject } = mockRegisteredActor();
    const target: Vector = MockVector.mock(10, 0, 10);
    const arrival: Vector = MockVector.mock(6, 0, 8);

    MockVector.DEFAULT_DISTANCE = 4;
    replaceFunctionMock(level.vertex_id, () => 42);
    replaceFunctionMock(level.vertex_position, () => arrival);

    expect(teleportActorNearPosition(target)).toBe(true);

    // Never `accessible_nearest`: it casts to CCustomMonster, which the actor is not.
    expect(actorGameObject.accessible_nearest).not.toHaveBeenCalled();
    expect(level.vertex_id).toHaveBeenCalledWith(target);
    expect(level.vertex_position).toHaveBeenCalledWith(42);
    expect(actorGameObject.set_actor_position).toHaveBeenCalledWith(arrival);
    expect(actorGameObject.set_actor_direction).toHaveBeenCalledWith(-MockVector.mock(4, 0, 2).getH());

    // The supplied position must survive: `sub` mutates whatever it is called on.
    expect(target).toEqual(MockVector.mock(10, 0, 10));
  });

  it("should use the position itself when the resolved vertex is far away", () => {
    const { actorGameObject } = mockRegisteredActor();
    const target: Vector = MockVector.mock(10, 0, 10);

    // What an off graph position produces: a valid looking id pointing somewhere unrelated.
    MockVector.DEFAULT_DISTANCE = 400;
    replaceFunctionMock(level.vertex_id, () => 42);
    replaceFunctionMock(level.vertex_position, () => MockVector.mock(900, 0, 900));

    expect(teleportActorNearPosition(target)).toBe(false);

    expect(actorGameObject.set_actor_position).toHaveBeenCalledWith(target);
    expect(actorGameObject.set_actor_direction).not.toHaveBeenCalled();
  });

  it("should use the position itself when no vertex resolves at all", () => {
    const { actorGameObject } = mockRegisteredActor();
    const target: Vector = MockVector.mock(1, 0, 1);

    replaceFunctionMock(level.vertex_id, () => MAX_LEVEL_VERTEX_ID);

    expect(teleportActorNearPosition(target)).toBe(false);

    expect(level.vertex_position).not.toHaveBeenCalled();
    expect(actorGameObject.set_actor_position).toHaveBeenCalledWith(target);
  });
});

describe("teleportActorToStoryObject", () => {
  beforeEach(() => {
    resetFunctionMock(level.vertex_id);
    resetFunctionMock(level.vertex_in_direction);
    resetFunctionMock(level.vertex_position);

    // Offline targets derive their start vertex from their position, so every case needs a valid one.
    replaceFunctionMock(level.vertex_id, () => 300);
  });

  it("should arrive at a vertex stepped away from the target and face it", () => {
    const { actorGameObject } = mockRegisteredActor();
    const target: ServerHumanObject = MockAlifeHumanStalker.mock({ gameVertexId: 152 });
    const arrival: Vector = MockVector.mock(10, 0, 10);

    registerStoryLink(target.id, "test-sid");
    replaceFunctionMock(level.vertex_in_direction, () => 500);
    replaceFunctionMock(level.vertex_position, () => arrival);

    teleportActorToStoryObject("test-sid");

    // Offline, the start vertex is derived from the position rather than read off the server object.
    expect(level.vertex_id).toHaveBeenCalledWith(target.position);
    expect(level.vertex_in_direction).toHaveBeenCalledWith(300, expect.anything(), 5);
    expect(level.vertex_position).toHaveBeenCalledWith(500);
    expect(actorGameObject.set_actor_position).toHaveBeenCalledWith(arrival);
    expect(actorGameObject.set_actor_direction).toHaveBeenCalledWith(-target.position.sub(arrival).getH());
  });

  it("should shrink the step until the graph allows it", () => {
    mockRegisteredActor();

    const target: ServerHumanObject = MockAlifeHumanStalker.mock({ gameVertexId: 152 });
    const attempts: Array<number> = [];

    registerStoryLink(target.id, "test-sid");
    replaceFunctionMock(level.vertex_id, () => 300);
    replaceFunctionMock(level.vertex_position, () => MockVector.mock(1, 0, 1));

    // Indoors the engine refuses to travel far and hands back the vertex it started from.
    replaceFunctionMock(level.vertex_in_direction, (vertexId: number, _: Vector, distance: number) => {
      attempts.push(distance);

      return distance > 4 ? vertexId : 900;
    });

    teleportActorToStoryObject("test-sid", null, 16);

    expect(attempts).toEqual([16, 8, 4]);
    expect(level.vertex_position).toHaveBeenCalledWith(900);
  });

  it("should settle for the target vertex when even the smallest step does not fit", () => {
    mockRegisteredActor();

    const target: ServerHumanObject = MockAlifeHumanStalker.mock({ gameVertexId: 152 });

    registerStoryLink(target.id, "test-sid");
    replaceFunctionMock(level.vertex_id, () => 300);
    replaceFunctionMock(level.vertex_position, () => MockVector.mock(1, 0, 1));
    replaceFunctionMock(level.vertex_in_direction, (vertexId: number) => vertexId);

    teleportActorToStoryObject("test-sid", null, 8);

    expect(level.vertex_position).toHaveBeenCalledWith(300);
  });

  it("should default to the target's own facing when it is online", () => {
    mockRegisteredActor();

    const target: ServerHumanObject = MockAlifeHumanStalker.mock({ gameVertexId: 152 });
    const facing: Vector = MockVector.mock(0, 0, 1);
    const online: GameObject = MockGameObject.mock({ id: target.id, levelVertexId: 777 });

    jest.spyOn(online, "direction").mockImplementation(() => facing);
    registerObject(online);
    registerStoryLink(target.id, "test-sid");
    replaceFunctionMock(level.vertex_in_direction, () => 500);
    replaceFunctionMock(level.vertex_position, () => MockVector.mock(1, 0, 1));

    teleportActorToStoryObject("test-sid");

    // Online, both the start vertex and the direction come from the game object, not the server one.
    expect(level.vertex_in_direction).toHaveBeenCalledWith(777, facing, 5);
  });

  it("should step towards the actor when the target is offline", () => {
    const { actorGameObject } = mockRegisteredActor();
    const target: ServerHumanObject = MockAlifeHumanStalker.mock({ gameVertexId: 152 });

    target.position = MockVector.mock(10, 0, 10);
    jest.spyOn(actorGameObject, "position").mockImplementation(() => MockVector.mock(4, 0, 6));

    registerStoryLink(target.id, "test-sid");
    replaceFunctionMock(level.vertex_in_direction, () => 500);
    replaceFunctionMock(level.vertex_position, () => MockVector.mock(1, 0, 1));

    teleportActorToStoryObject("test-sid");

    expect(level.vertex_in_direction).toHaveBeenCalledWith(300, MockVector.mock(-6, 0, -4), 5);
  });

  it("should not mutate the target position while turning the actor to face it", () => {
    mockRegisteredActor();

    const target: ServerHumanObject = MockAlifeHumanStalker.mock({ gameVertexId: 152 });

    target.position = MockVector.mock(10, 0, 10);

    registerStoryLink(target.id, "test-sid");
    replaceFunctionMock(level.vertex_in_direction, () => 500);
    replaceFunctionMock(level.vertex_position, () => MockVector.mock(1, 0, 1));

    teleportActorToStoryObject("test-sid");

    // `sub` mutates its receiver, so a missing copy would leave the target sitting on a delta vector.
    expect(target.position).toEqual(MockVector.mock(10, 0, 10));
  });

  it("should prefer a supplied direction over the target's facing", () => {
    mockRegisteredActor();

    const target: ServerHumanObject = MockAlifeHumanStalker.mock({ gameVertexId: 152 });
    const facing: Vector = MockVector.mock(0, 0, 1);
    const supplied: Vector = MockVector.mock(-1, 0, 0);
    const online: GameObject = MockGameObject.mock({ id: target.id, levelVertexId: 777 });

    jest.spyOn(online, "direction").mockImplementation(() => facing);
    registerObject(online);
    registerStoryLink(target.id, "test-sid");
    replaceFunctionMock(level.vertex_in_direction, () => 500);
    replaceFunctionMock(level.vertex_position, () => MockVector.mock(1, 0, 1));

    teleportActorToStoryObject("test-sid", supplied, 5);

    expect(level.vertex_in_direction).toHaveBeenCalledWith(777, supplied, 5);
    expect(online.direction).not.toHaveBeenCalled();
  });

  it("should respect a supplied distance", () => {
    mockRegisteredActor();

    const target: ServerHumanObject = MockAlifeHumanStalker.mock({ gameVertexId: 152 });

    registerStoryLink(target.id, "test-sid");
    replaceFunctionMock(level.vertex_in_direction, () => 500);
    replaceFunctionMock(level.vertex_position, () => MockVector.mock(1, 0, 1));

    teleportActorToStoryObject("test-sid", null, 12);

    expect(level.vertex_in_direction).toHaveBeenCalledWith(300, expect.anything(), 12);
  });

  it("should fall back to the target vertex when no vertex is reachable in that direction", () => {
    mockRegisteredActor();

    const target: ServerHumanObject = MockAlifeHumanStalker.mock({ gameVertexId: 152 });

    registerStoryLink(target.id, "test-sid");
    replaceFunctionMock(level.vertex_in_direction, () => MAX_LEVEL_VERTEX_ID);
    replaceFunctionMock(level.vertex_position, () => MockVector.mock(1, 0, 1));

    teleportActorToStoryObject("test-sid");

    expect(level.vertex_position).toHaveBeenCalledWith(300);
  });

  it("should abort for an unregistered story id", () => {
    mockRegisteredActor();

    expect(() => teleportActorToStoryObject("not-existing-sid")).toThrow(
      "Cannot teleport, no object with story id 'not-existing-sid' is registered."
    );
  });

  it("should abort for a target outside the loaded level", () => {
    mockRegisteredActor();

    const target: ServerHumanObject = MockAlifeHumanStalker.mock({ gameVertexId: 152 });

    registerStoryLink(target.id, "test-sid");
    jest.spyOn(game_graph().vertex(target.m_game_vertex_id), "level_id").mockImplementation(() => 5_555);

    expect(() => teleportActorToStoryObject("test-sid")).toThrow(
      "Cannot teleport to 'test-sid', it is not on the loaded level."
    );
  });
});

describe("isObjectInActorFrustum", () => {
  it("should correctly check whether object is in actor frustum", () => {
    const object: GameObject = MockGameObject.mock();

    mockRegisteredActor();

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

describe("getObjectSmartTerrain", () => {
  it("should correctly get smart terrain of an object", () => {
    expect(getObjectTerrain(MockGameObject.mock())).toBeNull();
    expect(getObjectTerrain(MockAlifeHumanStalker.mock())).toBeNull();

    const terrain: ServerSmartZoneObject = MockAlifeSmartZone.mock();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock();
    const gameObject: GameObject = MockGameObject.mock({ id: serverObject.id });

    serverObject.m_smart_terrain_id = terrain.id;

    expect(getObjectTerrain(gameObject)).toBe(terrain);
    expect(getObjectTerrain(serverObject)).toBe(terrain);

    serverObject.m_smart_terrain_id = 99_999;

    expect(getObjectTerrain(gameObject)).toBeNull();
    expect(getObjectTerrain(serverObject)).toBeNull();
  });
});

describe("isActorInNoWeaponZone", () => {
  it("should correctly check if actor is in no weapon zone", () => {
    const zone: GameObject = MockGameObject.mock();

    expect(isActorInNoWeaponZone()).toBe(false);

    registry.noWeaponZones.set(zone.id(), true);
    expect(isActorInNoWeaponZone()).toBe(true);

    registry.noWeaponZones.set(zone.id(), false);
    expect(isActorInNoWeaponZone()).toBe(false);
  });
});

describe("getServerDistanceBetween", () => {
  it("should correctly get distance for offline objects", () => {
    const first: ServerObject = MockAlifeObject.mock({ gameVertexId: 500 });

    jest.spyOn(game_graph().vertex(500).game_point(), "distance_to").mockImplementation(() => 600);
    expect(getServerDistanceBetween(first, MockAlifeObject.mock())).toBe(600);

    const second: ServerObject = MockAlifeObject.mock({ gameVertexId: 501 });

    jest.spyOn(game_graph().vertex(501).game_point(), "distance_to").mockImplementation(() => 255);
    expect(getServerDistanceBetween(second, MockAlifeObject.mock())).toBe(255);
  });
});
