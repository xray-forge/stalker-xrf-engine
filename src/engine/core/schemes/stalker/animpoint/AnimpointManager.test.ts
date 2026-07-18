import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { GameObject, Vector } from "xray16/alias";
import { $fromArray } from "xray16/macros";
import { MockGameObject, MockVector } from "xray16/mocks";

import { CampManager, EObjectCampActivity } from "@/engine/core/ai/camp";
import {
  animpoint_predicates,
  animpointPredicateAlways,
} from "@/engine/core/animation/predicates/animpoint_predicates";
import { EStalkerState } from "@/engine/core/animation/types";
import { registerObject, registerSmartCover, registry } from "@/engine/core/database";
import { SmartCover } from "@/engine/core/objects/smart_cover";
import {
  IAnimpointActionDescriptor,
  ISchemeAnimpointState,
} from "@/engine/core/schemes/stalker/animpoint/animpoint_types";
import { AnimpointManager } from "@/engine/core/schemes/stalker/animpoint/AnimpointManager";
import { EScheme } from "@/engine/lib/types";
import { mockSchemeState, MockSmartCover, resetRegistry } from "@/fixtures/engine";

describe("AnimpointManager", () => {
  beforeEach(() => {
    resetRegistry();

    // todo: Update xrf sdk.
    const mathMock = math as unknown as {
      atan2(x: number, y: number): number;
      deg(radians: number): number;
    };

    mathMock.atan2 = Math.atan2;
    mathMock.deg = (radians: number): number => (radians * 180) / Math.PI;
  });

  it("should activate from a clean state and stop a stale camp activity", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeAnimpointState = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      coverName: "test_cover",
      useCamp: true,
    });
    const manager: AnimpointManager = new AnimpointManager(object, state);

    jest.spyOn(manager, "calculatePosition").mockImplementation(jest.fn());
    jest.spyOn(manager, "stop").mockImplementation(jest.fn());

    manager.activate(object);

    expect(state.signals).toEqualLuaTables({});
    expect(manager.calculatePosition).toHaveBeenCalledTimes(1);
    expect(manager.stop).not.toHaveBeenCalled();

    manager.isStarted = true;
    manager.activate(object);

    expect(manager.stop).toHaveBeenCalledTimes(1);
  });

  it("should select available non-camp and camp animations", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeAnimpointState = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      useCamp: false,
      availableAnimations: $fromArray<EStalkerState>([EStalkerState.SIT, EStalkerState.WALK]),
    });
    const manager: AnimpointManager = new AnimpointManager(object, state);

    manager.update();

    expect([EStalkerState.SIT, EStalkerState.WALK]).toContain(manager.currentAction);

    state.useCamp = true;
    state.description = EStalkerState.ANIMPOINT_SIT_NORMAL;
    state.availableAnimations = null;
    state.approvedActions = $fromArray<IAnimpointActionDescriptor>([
      { name: EStalkerState.ANIMPOINT_SIT_NORMAL, predicate: animpointPredicateAlways },
    ]);
    manager.campManager = {
      getObjectActivity: jest.fn(() => $multi(EObjectCampActivity.IDLE, false)),
    } as unknown as CampManager;

    manager.update();

    expect(manager.currentAction).toBe(EStalkerState.ANIMPOINT_SIT_NORMAL);
    expect(state.actionNameBase).toBe(EStalkerState.ANIMPOINT_SIT_NORMAL);
  });

  it("should calculate smart-cover position and detect when it is reached", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeAnimpointState = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      coverName: "test_cover",
      availableAnimations: $fromArray<EStalkerState>([EStalkerState.ANIMPOINT_STAY_WALL]),
      reachDistanceSqr: 1,
    });
    const manager: AnimpointManager = new AnimpointManager(object, state);
    const cover: SmartCover = MockSmartCover.mock("test_cover");
    const position: Vector = MockVector.mock(10, 20, 30);
    const vertexPosition: Vector = MockVector.mock(11, 20, 31);

    expect(manager.isPositionReached()).toBe(false);

    cover.position = position;
    cover.angle = MockVector.mock(0, 0, 0);

    jest.spyOn(cover, "description").mockImplementation(() => EStalkerState.ANIMPOINT_STAY_WALL);
    jest.spyOn(level, "vertex_id").mockImplementation(() => 25);
    jest.spyOn(level, "vertex_position").mockImplementation(() => vertexPosition);

    registerSmartCover(cover);
    manager.calculatePosition();

    expect(manager.position).toBe(position);
    expect(manager.positionLevelVertexId).toBe(25);
    expect(manager.vertexPosition).toBe(vertexPosition);
    expect(manager.smartCoverDirection).not.toBeNull();
    expect(manager.lookPosition).not.toBeNull();
    expect(state.description).toBe(EStalkerState.ANIMPOINT_STAY_WALL);
    expect(manager.availableActions).toBe(animpoint_predicates.get(EStalkerState.ANIMPOINT_STAY_WALL));
    expect(state.approvedActions).toEqualLuaArrays([]);
    expect(manager.getAnimationParameters()).toEqual([manager.position, manager.smartCoverDirection]);

    registerObject(object);
    manager.vertexPosition = object.position();
    manager.smartCoverDirection = object.direction();

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 0);

    expect(manager.isPositionReached()).toBe(true);

    manager.currentAction = EStalkerState.SIT;

    expect(manager.isPositionReached()).toBe(true);
  });

  it("should fill approved actions from configured animations or matching predicates", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeAnimpointState = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      availableAnimations: $fromArray<EStalkerState>([EStalkerState.SIT, EStalkerState.WALK]),
      approvedActions: new LuaTable(),
    });
    const manager: AnimpointManager = new AnimpointManager(object, state);

    manager.fillPossibleAnimationActions();

    expect(state.approvedActions).toEqualLuaArrays([
      { name: EStalkerState.SIT, predicate: animpointPredicateAlways },
      { name: EStalkerState.WALK, predicate: animpointPredicateAlways },
    ]);

    const allowed: IAnimpointActionDescriptor = {
      name: EStalkerState.SNEAK,
      predicate: jest.fn(() => true),
    };
    const rejected: IAnimpointActionDescriptor = {
      name: EStalkerState.PATROL,
      predicate: jest.fn(() => false),
    };

    state.availableAnimations = null;
    state.approvedActions = new LuaTable();
    manager.availableActions = $fromArray([allowed, rejected]);

    manager.fillPossibleAnimationActions();

    expect(state.approvedActions).toEqualLuaArrays([allowed]);
    expect(allowed.predicate).toHaveBeenCalledWith(object, false);
    expect(rejected.predicate).toHaveBeenCalledWith(object, false);
  });

  it("should start and stop standalone or camp animpoint activities", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeAnimpointState = mockSchemeState<ISchemeAnimpointState>(EScheme.ANIMPOINT, {
      coverName: "test_cover",
      useCamp: false,
      approvedActions: $fromArray<IAnimpointActionDescriptor>([
        { name: EStalkerState.SIT, predicate: animpointPredicateAlways },
      ]),
    });
    const manager: AnimpointManager = new AnimpointManager(object, state);

    manager.start();

    expect(manager.isStarted).toBe(true);
    expect(manager.coverName).toBe("test_cover");
    expect(manager.currentAction).toBe(EStalkerState.SIT);

    manager.stop();

    expect(manager.isStarted).toBe(false);
    expect(manager.currentAction).toBeNull();

    const campObject: GameObject = MockGameObject.mock();
    const campManager = {
      object: campObject,
      registerObject: jest.fn(),
      unregisterObject: jest.fn(),
    } as unknown as CampManager;

    state.useCamp = true;
    manager.position = MockVector.mock(1, 2, 3);

    registry.camps.set(campObject.id(), campManager);
    jest.spyOn(campObject, "inside").mockImplementation(() => true);

    manager.start();

    expect(manager.campManager).toBe(campManager);
    expect(campManager.registerObject).toHaveBeenCalledWith(object.id());

    manager.stop();

    expect(campManager.unregisterObject).toHaveBeenCalledWith(object.id());
  });
});
