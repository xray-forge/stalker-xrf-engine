import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game_graph, patrol } from "xray16";
import {
  ESoundObjectType,
  GameObject,
  ServerHumanObject,
  ServerObject,
  ServerSmartZoneObject,
  Vector,
} from "xray16/alias";
import { MAX_U32, ZERO_VECTOR } from "xray16/lib";
import {
  MockAlifeHumanStalker,
  MockAlifeObject,
  MockAlifeSmartZone,
  MockGameObject,
  MockSoundObject,
  MockVector,
} from "xray16/mocks";

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

describe("teleportActorToStoryObject", () => {
  it("should move the actor to the server position of the story object", () => {
    const { actorGameObject } = mockRegisteredActor();
    const target: ServerHumanObject = MockAlifeHumanStalker.mock();

    registerStoryLink(target.id, "test-sid");

    teleportActorToStoryObject("test-sid");

    expect(actorGameObject.set_actor_position).toHaveBeenCalledWith(target.position);
  });

  it("should resolve the target even when it is not online", () => {
    const { actorGameObject } = mockRegisteredActor();
    const target: ServerHumanObject = MockAlifeHumanStalker.mock();

    registerStoryLink(target.id, "test-sid-offline");

    // No `registerObject` call, so there is no online game object for this id.
    expect(registry.objects.get(target.id)).toBeNull();

    teleportActorToStoryObject("test-sid-offline");

    expect(actorGameObject.set_actor_position).toHaveBeenCalledWith(target.position);
  });

  it("should abort for an unregistered story id", () => {
    mockRegisteredActor();

    expect(() => teleportActorToStoryObject("not-existing-sid")).toThrow(
      "Cannot teleport, no object with story id 'not-existing-sid' is registered."
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
