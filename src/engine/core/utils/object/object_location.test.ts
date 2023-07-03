import { describe, expect, it, jest } from "@jest/globals";
import { alife, game_graph } from "xray16";

import {
  areObjectsOnSameLevel,
  getServerDistanceBetween,
  isDistanceBetweenObjectsGreaterOrEqual,
  isDistanceBetweenObjectsLessOrEqual,
  isObjectInSmartTerrain,
  isObjectInZone,
  isObjectOnLevel,
} from "@/engine/core/utils/object/object_location";
import { ClientObject, ServerObject } from "@/engine/lib/types";
import { mockRegisteredActor } from "@/fixtures/engine";
import { mockClientGameObject, mockServerAlifeObject, mockServerAlifeSmartZone } from "@/fixtures/xray";

describe("object location utils", () => {
  it("'isObjectInSmartTerrain' check object inside smart terrain", () => {
    const smartTerrain = mockServerAlifeSmartZone({ name: <T extends string>() => "test-smart" as T });
    const { actorClientObject } = mockRegisteredActor({}, { m_smart_terrain_id: smartTerrain.id });

    expect(isObjectInSmartTerrain(actorClientObject, "test-smart")).toBe(true);
    expect(isObjectInSmartTerrain(actorClientObject, "test-smart-another")).toBe(false);
    expect(isObjectInSmartTerrain(actorClientObject, "another")).toBe(false);
  });

  it("'isObjectInZone' check object inside", () => {
    const object: ClientObject = mockClientGameObject();
    const zone: ClientObject = mockClientGameObject();

    expect(isObjectInZone(object, zone)).toBe(false);
    expect(zone.inside).toHaveBeenCalledWith(object.position());
    expect(isObjectInZone(null, null)).toBe(false);
    expect(isObjectInZone(object, null)).toBe(false);
    expect(isObjectInZone(null, zone)).toBe(false);
  });

  it("'isObjectOnLevel' check object on level", () => {
    const object: ServerObject = mockServerAlifeObject();

    expect(isObjectOnLevel(null, "zaton")).toBe(false);
    expect(isObjectOnLevel(object, "pripyat")).toBe(true);

    expect(game_graph().vertex(object.m_game_vertex_id).level_id()).toBe(10);
    expect(alife().level_name).toHaveBeenCalledWith(10);
  });

  it("'areObjectsOnSameLevel' check objects on level", () => {
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

  it("'isDistanceBetweenObjectsGreaterOrEqual' should correctly check", () => {
    const first: ClientObject = mockClientGameObject();
    const second: ClientObject = mockClientGameObject();

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 150);
    expect(isDistanceBetweenObjectsGreaterOrEqual(first, second, 100)).toBe(true);

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 25);
    expect(isDistanceBetweenObjectsGreaterOrEqual(first, second, 55)).toBe(false);

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 1000);
    expect(isDistanceBetweenObjectsGreaterOrEqual(first, second, 1000)).toBe(true);
  });

  it("'isDistanceBetweenObjectsLessOrEqual' should correctly check", () => {
    const first: ClientObject = mockClientGameObject();
    const second: ClientObject = mockClientGameObject();

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 150);
    expect(isDistanceBetweenObjectsLessOrEqual(first, second, 100)).toBe(false);

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 25);
    expect(isDistanceBetweenObjectsLessOrEqual(first, second, 55)).toBe(true);

    jest.spyOn(first.position(), "distance_to").mockImplementation(() => 1000);
    expect(isDistanceBetweenObjectsLessOrEqual(first, second, 1000)).toBe(true);
  });

  it("'getServerDistanceBetween' should correctly get distance for offline objects", () => {
    const first: ServerObject = mockServerAlifeObject({ m_game_vertex_id: 500 });

    jest.spyOn(game_graph().vertex(500).game_point(), "distance_to").mockImplementation(() => 600);
    expect(getServerDistanceBetween(first, mockServerAlifeObject())).toBe(600);

    const second: ServerObject = mockServerAlifeObject({ m_game_vertex_id: 501 });

    jest.spyOn(game_graph().vertex(501).game_point(), "distance_to").mockImplementation(() => 255);
    expect(getServerDistanceBetween(second, mockServerAlifeObject())).toBe(255);
  });
});
