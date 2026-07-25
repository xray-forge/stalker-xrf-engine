import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { CoverPoint, EGameObjectPath, GameObject } from "xray16/alias";
import { Nillable } from "xray16/lib";
import { MockGameObject, MockPropertyStorage, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { EStalkerState } from "@/engine/core/animation/types";
import { getManager } from "@/engine/core/database";
import { setStalkerState } from "@/engine/core/database/stalker";
import { parseConditionsList } from "@/engine/core/ini";
import { simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
import { SoundManager } from "@/engine/core/managers/sounds";
import { ISchemeCoverState } from "@/engine/core/schemes/stalker/cover";
import { ActionCover } from "@/engine/core/schemes/stalker/cover/actions/ActionCover";
import { EScheme } from "@/engine/core/schemes/types";
import { mockRegisteredActor, mockSchemeState, MockSmartTerrain, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/database/stalker");

function setupAction(soundIdle: Nillable<string>): { action: ActionCover; object: GameObject } {
  const object: GameObject = MockGameObject.mock();
  const state: ISchemeCoverState = mockSchemeState<ISchemeCoverState>(EScheme.COVER, {
    soundIdle: soundIdle as string,
    animationConditionList: parseConditionsList("cover_hide"),
    radiusMin: 3,
    radiusMax: 5,
  });
  const action: ActionCover = new ActionCover(state);

  action.setup(object, MockPropertyStorage.mock());
  action.coverVertexId = 5;
  action.coverPosition = MockVector.mock(0, 0, 0);

  return { action, object };
}

describe("ActionCover", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
    resetFunctionMock(setStalkerState);
  });

  it("should play the idle sound while moving to cover", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const { action, object } = setupAction("cover_idle_snd");

    jest.spyOn(soundManager, "play").mockImplementation(jest.fn(() => null));

    // Far from cover => moving branch; idle sound must still be attempted.
    jest.spyOn(action.coverPosition, "distance_to_sqr").mockImplementation(() => 100);
    action.execute();

    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "cover_idle_snd");
  });

  it("should play the idle sound when sitting in cover", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const { action, object } = setupAction("cover_idle_snd");

    jest.spyOn(soundManager, "play").mockImplementation(jest.fn(() => null));

    // Reached cover => reached branch; idle sound is played here too.
    jest.spyOn(action.coverPosition, "distance_to_sqr").mockImplementation(() => 0.1);
    action.execute();

    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "cover_idle_snd");
  });

  it("should not play any sound when sound_idle is not configured", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const { action } = setupAction(null);

    jest.spyOn(soundManager, "play").mockImplementation(jest.fn(() => null));

    jest.spyOn(action.coverPosition, "distance_to_sqr").mockImplementation(() => 100);
    action.execute();

    expect(soundManager.play).not.toHaveBeenCalled();
  });

  it("should assault towards cover while it is not reached", () => {
    const { action, object } = setupAction(null);

    jest.spyOn(action.coverPosition, "distance_to_sqr").mockImplementation(() => 100);
    action.execute();

    expect(object.set_dest_level_vertex_id).toHaveBeenCalledWith(action.coverVertexId);
    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.ASSAULT);
  });

  it("should play configured animation once cover is reached", () => {
    const { action, object } = setupAction(null);

    action.enemyRandomPosition = MockVector.create(3, 0, 4);

    jest.spyOn(action.coverPosition, "distance_to_sqr").mockImplementation(() => 0.1);
    action.execute();

    expect(object.set_dest_level_vertex_id).not.toHaveBeenCalled();
    expect(setStalkerState).toHaveBeenCalledWith(object, "cover_hide", null, null, {
      lookPosition: action.enemyRandomPosition,
    });
  });

  it("should move to the best available cover on activation", () => {
    const { action, object } = setupAction(null);
    const cover: CoverPoint = {
      level_vertex_id: () => 700,
      position: () => MockVector.create(4, 0, 5),
    } as unknown as CoverPoint;

    simulationConfig.TERRAINS.set("test-smart", MockSmartTerrain.mock("test-smart"));
    action.state.smartTerrainName = "test-smart";

    jest.spyOn(object, "best_cover").mockImplementation(() => cover);
    replaceFunctionMock(level.vertex_in_direction, () => 500);

    action.activate();

    expect(action.state.signals).toEqualLuaTables({});
    expect(action.coverVertexId).toBe(700);
    expect(action.coverPosition).toEqual(MockVector.create(4, 0, 5));
    expect(action.enemyRandomPosition).toEqual(MockVector.create(15, 14, 16));
    expect(object.set_path_type).toHaveBeenCalledWith(EGameObjectPath.LEVEL_PATH);
    expect(object.set_dest_level_vertex_id).toHaveBeenCalledWith(700);
    expect(object.set_desired_direction).toHaveBeenCalledTimes(1);
    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.ASSAULT);
  });

  it("should fall back to the direction vertex when no cover is found", () => {
    const { action, object } = setupAction(null);

    simulationConfig.TERRAINS.set("test-smart", MockSmartTerrain.mock("test-smart"));
    action.state.smartTerrainName = "test-smart";

    jest.spyOn(object, "best_cover").mockImplementation(() => null as unknown as CoverPoint);
    replaceFunctionMock(level.vertex_in_direction, () => 500);

    action.activate();

    // Cover search retries with growing distance from 2 up to 4 inclusive.
    expect(object.best_cover).toHaveBeenCalledTimes(3);
    expect(action.coverVertexId).toBe(500);
    expect(action.coverPosition).toEqual(MockVector.create(15, 14, 16));
  });

  it("should pick the nearest accessible position when cover is not accessible", () => {
    const { action, object } = setupAction(null);

    simulationConfig.TERRAINS.set("test-smart", MockSmartTerrain.mock("test-smart"));
    action.state.smartTerrainName = "test-smart";

    jest.spyOn(object, "best_cover").mockImplementation(() => null as unknown as CoverPoint);
    jest.spyOn(object, "accessible").mockImplementation(() => false);
    jest.spyOn(object, "accessible_nearest").mockImplementation(() => $multi(900, MockVector.create(9, 0, 9)));

    action.activate();

    expect(action.coverVertexId).toBe(900);
    expect(action.coverPosition).toEqual(MockVector.create(9, 0, 9));
  });

  it("should keep current direction when cover matches the random position", () => {
    const { action, object } = setupAction(null);

    simulationConfig.TERRAINS.set("test-smart", MockSmartTerrain.mock("test-smart"));
    action.state.smartTerrainName = "test-smart";

    // Cover at the exact random position produces a zero direction vector, which must not be applied.
    jest.spyOn(object, "best_cover").mockImplementation(() => null as unknown as CoverPoint);

    action.activate();

    expect(object.set_desired_direction).not.toHaveBeenCalled();
  });
});
