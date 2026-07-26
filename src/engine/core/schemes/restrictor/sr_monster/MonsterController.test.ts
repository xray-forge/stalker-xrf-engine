import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { cond, game, move, patrol, sound_object } from "xray16";
import { ESoundObjectType, GameObject, ServerMonsterAbstractObject, SoundObject, Vector } from "xray16/alias";
import { AnyObject, TTimestamp } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import { MockGameObject, MockSoundObject, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { getManager, registerObject, registry } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { MonsterController } from "@/engine/core/schemes/restrictor/sr_monster/MonsterController";
import { ISchemeMonsterState } from "@/engine/core/schemes/restrictor/sr_monster/sr_monster_types";
import {
  scriptCaptureMonster,
  scriptCommandMonster,
  scriptReleaseMonster,
  trySwitchToAnotherSection,
} from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime", () => ({
  scriptCaptureMonster: jest.fn(),
  scriptCommandMonster: jest.fn(),
  scriptReleaseMonster: jest.fn(),
  trySwitchToAnotherSection: jest.fn(() => false),
}));

function createMonsterState(base: Partial<ISchemeMonsterState> = {}): ISchemeMonsterState {
  return mockSchemeState<ISchemeMonsterState>(EScheme.SR_MONSTER, {
    delay: 0,
    idle: 1000,
    idleEnd: 0,
    monster: null,
    path: new patrol("test-wp"),
    pathTable: $fromArray(["test-wp"]),
    soundObject: "monster_sound",
    soundSlideVel: 1000,
    ...base,
  });
}

/**
 * Create monster controller over restrictor object with the actor placed inside or outside of it.
 */
function createController(
  state: ISchemeMonsterState,
  isActorInside: boolean = true
): { controller: MonsterController; object: GameObject } {
  mockRegisteredActor({ position: MockVector.create(0, 0, 0) });

  const object: GameObject = MockGameObject.mock();

  jest.spyOn(object, "inside").mockImplementation(() => isActorInside);
  registerObject(object);

  return { controller: new MonsterController(object, state), object };
}

describe("MonsterController", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(scriptCaptureMonster);
    resetFunctionMock(scriptCommandMonster);
    resetFunctionMock(scriptReleaseMonster);
    resetFunctionMock(trySwitchToAnotherSection);
    replaceFunctionMock(trySwitchToAnotherSection, () => false);
  });

  it("should correctly activate", () => {
    const state: ISchemeMonsterState = createMonsterState({ idleEnd: 500 });
    const { controller } = createController(state);

    controller.activate();

    expect(controller.isActorInside).toBe(false);
    expect(controller.finalAction).toBe(false);
    expect(controller.idleState).toBe(false);
    expect(controller.pathName).toBeNull();
    expect(controller.soundObject).toBeNull();
    expect(controller.monsterObject).toBeNull();
    expect(controller.appearSound).toBeInstanceOf(sound_object);
    expect(state.idleEnd).toBe(0);
    expect(state.signals).toEqualLuaTables({});
  });

  it("should wait in idle state until idle end", () => {
    const now: TTimestamp = game.time();
    const state: ISchemeMonsterState = createMonsterState({ idleEnd: now + 1000 });
    const { controller } = createController(state);

    controller.activate();
    controller.idleState = true;
    controller.state.idleEnd = now + 1000;

    controller.update(100);

    expect(controller.idleState).toBe(true);
    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();

    controller.state.idleEnd = now - 1;
    controller.update(100);

    expect(controller.idleState).toBe(false);
    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();
  });

  it("should initialize actor inside flag on first update with monster configured", () => {
    const state: ISchemeMonsterState = createMonsterState({ monster: "boar_weak" });
    const { controller } = createController(state, true);

    controller.isActorInside = null;
    controller.update(100);

    expect(controller.isActorInside).toBe(true);
    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();
  });

  it("should reset path and slide sound while actor is inside", () => {
    const state: ISchemeMonsterState = createMonsterState();
    const { controller, object } = createController(state, true);
    const soundManager: SoundManager = getManager(SoundManager);
    const sound: SoundObject = MockSoundObject.mock("test");

    jest.spyOn(sound, "playing").mockImplementation(() => true);
    jest.spyOn(soundManager, "play").mockImplementation(() => sound);

    controller.activate();
    controller.update(1);

    expect(controller.isActorInside).toBe(true);
    expect(controller.pathName).toBe("test-wp");
    expect(controller.curPoint).toBe(0);
    expect(controller.current).toBeDefined();
    expect(controller.target).toBeDefined();
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "monster_sound");
    expect(sound.set_position).toHaveBeenCalledWith(controller.current);
    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(object, state);
  });

  it("should advance to next point when sound slide passes the target", () => {
    const state: ISchemeMonsterState = createMonsterState();
    const { controller } = createController(state, true);

    jest.spyOn(getManager(SoundManager), "play").mockImplementation(() => null);

    controller.activate();
    controller.isActorInside = true;
    controller.curPoint = 0;
    // `MockVector.distance_to` only computes real distances when one of the vectors is at the origin.
    controller.current = MockVector.create(0, 0, 0);
    controller.target = MockVector.create(1, 0, 0);
    controller.dir = MockVector.create(1, 0, 0);

    controller.update(1000);

    expect(controller.curPoint).toBe(1);
  });

  it("should keep sliding sound while target is not reached", () => {
    const state: ISchemeMonsterState = createMonsterState({ soundSlideVel: 1 });
    const { controller } = createController(state, true);

    jest.spyOn(getManager(SoundManager), "play").mockImplementation(() => null);

    controller.activate();
    controller.isActorInside = true;
    controller.curPoint = 0;
    controller.current = MockVector.create(0, 0, 0);
    controller.target = MockVector.create(1000, 0, 0);
    controller.dir = MockVector.create(1, 0, 0);

    controller.update(1);

    expect(controller.curPoint).toBe(0);
    expect(controller.current).toEqual(MockVector.create(0.001, 0, 0));
  });

  it("should not slide sound when sound is not playing", () => {
    const state: ISchemeMonsterState = createMonsterState();
    const { controller } = createController(state, true);
    const sound: SoundObject = MockSoundObject.mock("test");

    jest.spyOn(sound, "playing").mockImplementation(() => false);
    jest.spyOn(getManager(SoundManager), "play").mockImplementation(() => sound);

    controller.activate();
    controller.update(1);

    expect(sound.set_position).not.toHaveBeenCalled();
  });

  it("should capture spawned monster and command it to the final point", () => {
    const state: ISchemeMonsterState = createMonsterState({ monster: "boar_weak" });
    const { controller } = createController(state, true);
    const monsterObject: GameObject = MockGameObject.mock();

    registerObject(monsterObject);

    controller.activate();
    controller.isActorInside = true;
    controller.monster = { id: monsterObject.id() } as ServerMonsterAbstractObject;
    controller.finalAction = false;

    controller.update(100);

    expect(controller.monsterObject).toBe(monsterObject);
    expect(controller.finalAction).toBe(true);
    expect(scriptCaptureMonster).toHaveBeenCalledWith(monsterObject, true);
    expect(scriptCommandMonster).toHaveBeenCalledTimes(1);

    const [commandedObject, command, condition] = jest.mocked(scriptCommandMonster).mock.calls[0];

    expect(commandedObject).toBe(monsterObject);
    expect(command).toBeInstanceOf(move);
    expect(condition).toBeInstanceOf(cond);
  });

  it("should release monster and go idle once it reaches the final point", () => {
    const state: ISchemeMonsterState = createMonsterState({ monster: "boar_weak" });
    const { controller } = createController(state, true);
    const monsterObject: GameObject = MockGameObject.mock();
    const position: Vector = MockVector.create(4, 1, 3);

    // `MockVector.distance_to` returns a fixed distance between two non-origin vectors.
    jest.spyOn(position, "distance_to").mockImplementation(() => 0.5);
    jest.spyOn(monsterObject, "position").mockImplementation(() => position);

    registry.simulator = { release: jest.fn() } as unknown as AnyObject as typeof registry.simulator;
    registerObject(monsterObject);

    controller.activate();
    controller.monster = { id: monsterObject.id() } as ServerMonsterAbstractObject;
    controller.monsterObject = monsterObject;
    controller.finalAction = true;
    controller.pathName = "test-wp";

    controller.update(100);

    expect(scriptReleaseMonster).toHaveBeenCalledWith(monsterObject);
    expect(registry.simulator.release).toHaveBeenCalledWith({ id: monsterObject.id() }, true);
    expect(controller.monster).toBeNull();
    expect(controller.monsterObject).toBeNull();
    expect(controller.finalAction).toBe(false);
    expect(controller.idleState).toBe(true);
    expect(controller.isActorInside).toBe(false);
    expect(state.idleEnd).toBe(game.time() + state.idle);
  });

  it("should release unregistered monster without script release", () => {
    const state: ISchemeMonsterState = createMonsterState({ monster: "boar_weak" });
    const { controller } = createController(state, true);

    registry.simulator = { release: jest.fn() } as unknown as AnyObject as typeof registry.simulator;

    controller.activate();
    controller.monster = { id: 9999 } as ServerMonsterAbstractObject;
    controller.monsterObject = MockGameObject.mock();
    controller.finalAction = true;

    controller.update(100);

    expect(scriptReleaseMonster).not.toHaveBeenCalled();
    expect(registry.simulator.release).toHaveBeenCalledTimes(1);
    expect(controller.idleState).toBe(true);
  });

  it("should pick a different path from multiple options on reset", () => {
    const state: ISchemeMonsterState = createMonsterState({
      pathTable: $fromArray(["test-wp", "test-wp-2"]),
    });
    const { controller } = createController(state);

    controller.pathName = "test-wp";
    controller.resetPath();

    expect(controller.curPoint).toBe(0);
    expect(controller.pathName).toBe("test-wp-2");
    expect(state.path).toBeInstanceOf(patrol);
  });

  it("should wrap next point index at the end of path", () => {
    const state: ISchemeMonsterState = createMonsterState();
    const { controller } = createController(state);

    controller.resetPath();

    controller.curPoint = 0;
    expect(controller.getNextPoint()).toBe(1);

    controller.curPoint = state.path.count() - 1;
    expect(controller.getNextPoint()).toBe(0);
  });

  it("should spawn monster and stop sound when path wraps", () => {
    const state: ISchemeMonsterState = createMonsterState({ monster: "boar_weak", pathTable: $fromArray(["test-wp"]) });
    const { controller, object } = createController(state);
    const serverMonster: ServerMonsterAbstractObject = { id: 1 } as ServerMonsterAbstractObject;
    const sound: SoundObject = MockSoundObject.mock("test");

    registry.simulator = { create: jest.fn(() => serverMonster) } as unknown as AnyObject as typeof registry.simulator;

    controller.activate();
    controller.resetPath();
    controller.current = MockVector.create(1, 2, 3);
    controller.soundObject = sound;
    controller.curPoint = state.path.count() - 1;

    controller.setPositions();

    expect(registry.simulator.create).toHaveBeenCalledWith(
      "boar_weak",
      MockVector.create(1, 2, 3),
      object.level_vertex_id(),
      object.game_vertex_id()
    );
    expect(controller.monster).toBe(serverMonster);
    expect(controller.appearSound.play_at_pos).toHaveBeenCalledWith(
      registry.actor,
      MockVector.create(1, 2, 3),
      0,
      ESoundObjectType.S3D
    );
    expect(sound.stop).toHaveBeenCalledTimes(1);
    expect(controller.curPoint).toBe(0);
  });

  it("should not spawn a second monster when path wraps again", () => {
    const state: ISchemeMonsterState = createMonsterState({ monster: "boar_weak" });
    const { controller } = createController(state);

    registry.simulator = { create: jest.fn() } as unknown as AnyObject as typeof registry.simulator;

    controller.activate();
    controller.resetPath();
    controller.current = MockVector.create(0, 0, 0);
    controller.monster = { id: 1 } as ServerMonsterAbstractObject;
    controller.curPoint = state.path.count() - 1;

    controller.setPositions();

    expect(registry.simulator.create).not.toHaveBeenCalled();
  });
});
