import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game_graph } from "xray16";

import { registerSimulator, registry } from "@/engine/core/database";
import {
  areObjectsOnSameLevel,
  getDistanceBetween,
  getDistanceBetweenSqr,
  getServerDistanceBetween,
  isDistanceBetweenObjectsGreaterOrEqual,
  isDistanceBetweenObjectsLessOrEqual,
  isGameVertexFromLevel,
  isObjectInActorFrustum,
  isObjectInSmartTerrain,
  isObjectInZone,
  isObjectOnLevel,
  sendToNearestAccessibleVertex,
  teleportActorWithEffects,
} from "@/engine/core/utils/object/object_location";
import { MAX_U32 } from "@/engine/lib/constants/memory";
import { ClientObject, ServerObject, Vector } from "@/engine/lib/types";
import { mockRegisteredActor } from "@/fixtures/engine";
import {
  mockActorClientGameObject,
  mockClientGameObject,
  mockServerAlifeObject,
  mockServerAlifeSmartZone,
} from "@/fixtures/xray";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

describe("object location utils", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("isObjectInSmartTerrain check object inside smart terrain", () => {
    const smartTerrain = mockServerAlifeSmartZone({ name: <T extends string>() => "test-smart" as T });
    const { actorClientObject } = mockRegisteredActor({}, { m_smart_terrain_id: smartTerrain.id });

    expect(isObjectInSmartTerrain(actorClientObject, "test-smart")).toBe(true);
    expect(isObjectInSmartTerrain(actorClientObject, "test-smart-another")).toBe(false);
    expect(isObjectInSmartTerrain(actorClientObject, "another")).toBe(false);
  });

  it("isObjectInZone check object inside", () => {
    const object: ClientObject = mockClientGameObject();
    const zone: ClientObject = mockClientGameObject();

    expect(isObjectInZone(object, zone)).toBe(false);
    expect(zone.inside).toHaveBeenCalledWith(object.position());
    expect(isObjectInZone(null, null)).toBe(false);
    expect(isObjectInZone(object, null)).toBe(false);
    expect(isObjectInZone(null, zone)).toBe(false);
  });

  it("isObjectOnLevel check object on level", () => {
    const object: ServerObject = mockServerAlifeObject();

    expect(isObjectOnLevel(null, "zaton")).toBe(false);
    expect(isObjectOnLevel(object, "pripyat")).toBe(true);

    expect(game_graph().vertex(object.m_game_vertex_id).level_id()).toBe(5120);
    expect(registry.simulator.level_name).toHaveBeenCalledWith(5120);
  });

  it("areObjectsOnSameLevel check objects on level", () => {
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

  it("isDistanceBetweenObjectsGreaterOrEqual should correctly check", () => {
    const first: ClientObject = mockClientGameObject();
    const second: ClientObject = mockClientGameObject();

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 150);
    expect(isDistanceBetweenObjectsGreaterOrEqual(first, second, 100)).toBe(true);

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 25);
    expect(isDistanceBetweenObjectsGreaterOrEqual(first, second, 55)).toBe(false);

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 1000);
    expect(isDistanceBetweenObjectsGreaterOrEqual(first, second, 1000)).toBe(true);
  });

  it("isDistanceBetweenObjectsLessOrEqual should correctly check", () => {
    const first: ClientObject = mockClientGameObject();
    const second: ClientObject = mockClientGameObject();

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 150);
    expect(isDistanceBetweenObjectsLessOrEqual(first, second, 100)).toBe(false);

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 25);
    expect(isDistanceBetweenObjectsLessOrEqual(first, second, 55)).toBe(true);

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 1000);
    expect(isDistanceBetweenObjectsLessOrEqual(first, second, 1000)).toBe(true);
  });

  it("getServerDistanceBetween should correctly get distance for offline objects", () => {
    const first: ServerObject = mockServerAlifeObject({ m_game_vertex_id: 500 });

    jest.spyOn(game_graph().vertex(500).game_point(), "distance_to").mockImplementation(() => 600);
    expect(getServerDistanceBetween(first, mockServerAlifeObject())).toBe(600);

    const second: ServerObject = mockServerAlifeObject({ m_game_vertex_id: 501 });

    jest.spyOn(game_graph().vertex(501).game_point(), "distance_to").mockImplementation(() => 255);
    expect(getServerDistanceBetween(second, mockServerAlifeObject())).toBe(255);
  });

  it("getDistanceBetween should correctly get distance for offline objects", () => {
    const first: ClientObject = mockClientGameObject();
    const second: ClientObject = mockClientGameObject();

    expect(getDistanceBetween(first, second)).toBe(20);

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 600);
    expect(getDistanceBetween(first, second)).toBe(600);
  });

  it("getDistanceBetweenSqr should correctly get distance for offline objects", () => {
    const first: ClientObject = mockClientGameObject();
    const second: ClientObject = mockClientGameObject();

    expect(getDistanceBetweenSqr(first, second)).toBe(400);

    jest.spyOn(first.position(), "distance_to_sqr").mockImplementation(() => 1600);
    expect(getDistanceBetweenSqr(first, second)).toBe(1600);
  });

  it("sendToNearestAccessibleVertex should correctly send object to nearest accesible vertex", () => {
    const first: ClientObject = mockClientGameObject();

    expect(sendToNearestAccessibleVertex(first, 150)).toBe(150);
    expect(first.accessible).toHaveBeenCalled();
    expect(first.set_dest_level_vertex_id).toHaveBeenCalledWith(150);

    const second: ClientObject = mockClientGameObject({
      accessible: jest.fn(() => false),
      accessible_nearest: jest.fn(() => 14325),
    });

    expect(sendToNearestAccessibleVertex(second, 150)).toBe(14325);
    expect(second.accessible).toHaveBeenCalled();
    expect(second.accessible_nearest).toHaveBeenCalledWith({ x: 15, y: 14, z: 16 }, { x: 0, y: 0, z: 0 });
    expect(second.set_dest_level_vertex_id).toHaveBeenCalledWith(14325);

    const third: ClientObject = mockClientGameObject({
      level_vertex_id: jest.fn(() => 1442),
    });

    expect(sendToNearestAccessibleVertex(third, MAX_U32)).toBe(1442);
    expect(sendToNearestAccessibleVertex(third, MAX_U32 + 10)).toBe(1442);
    expect(sendToNearestAccessibleVertex(third, MAX_U32 * 2)).toBe(1442);
  });

  it("teleportActorWithEffects should correctly teleport actor", () => {
    const actor: ClientObject = mockActorClientGameObject();
    const destination: Vector = MockVector.mock(15, 14, 16);
    const direction: Vector = MockVector.mock(3, 5, 4);

    teleportActorWithEffects(actor, destination, direction);

    expect(actor.set_actor_position).toHaveBeenCalledWith(destination);
    expect(actor.set_actor_direction).toHaveBeenCalledWith(-direction.getH());
  });

  it("isGameVertexFromLevel should correctly check level name", () => {
    expect(isGameVertexFromLevel("pripyat", 50)).toBe(true);
    expect(isGameVertexFromLevel("zaton", 51)).toBe(false);
  });

  it("isObjectInActorFrustum should correctly check whether object is in actor frustum", () => {
    const object: ClientObject = mockClientGameObject();

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
