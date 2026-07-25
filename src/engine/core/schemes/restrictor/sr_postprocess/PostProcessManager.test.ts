import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { hit, noise, time_global } from "xray16";
import { GameObject, Hit } from "xray16/alias";
import { AnyObject, TTimestamp, ZERO_VECTOR } from "xray16/lib";
import { MockGameObject, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { PostProcessEffector } from "@/engine/core/schemes/restrictor/sr_postprocess/PostProcessEffector";
import { PostProcessManager } from "@/engine/core/schemes/restrictor/sr_postprocess/PostProcessManager";
import { ISchemePostProcessState } from "@/engine/core/schemes/restrictor/sr_postprocess/sr_postprocess_types";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({
  trySwitchToAnotherSection: jest.fn(() => false),
}));

const NOW: TTimestamp = 100_000;

function createPostProcessState(base: Partial<ISchemePostProcessState> = {}): ISchemePostProcessState {
  return mockSchemeState<ISchemePostProcessState>(EScheme.SR_POSTPROCESS, {
    hitIntensity: 2,
    intensity: 1,
    intensitySpeed: 10,
    ...base,
  });
}

/**
 * Create post process manager over restrictor object with the actor placed inside or outside of it.
 */
function createManager(
  state: ISchemePostProcessState,
  isActorInside: boolean = true
): { actor: GameObject; manager: PostProcessManager; object: GameObject } {
  const { actorGameObject } = mockRegisteredActor({ position: MockVector.create(0, 0, 0) });
  const object: GameObject = MockGameObject.mock();

  jest.spyOn(object, "inside").mockImplementation(() => isActorInside);

  return { actor: actorGameObject, manager: new PostProcessManager(object, state), object };
}

describe("PostProcessManager", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(trySwitchToAnotherSection);
    resetFunctionMock(time_global);
    replaceFunctionMock(trySwitchToAnotherSection, () => false);
    replaceFunctionMock(time_global, () => NOW);
  });

  it("should correctly activate with positive intensity", () => {
    const { manager, object } = createManager(createPostProcessState());

    manager.activate();

    expect(manager.isActorInside).toBe(false);
    expect(manager.grayAmplitude).toBe(1);
    expect(manager.effTime).toBe(0);
    expect(manager.hitTime).toBe(0);
    expect(manager.intensity).toBe(0);
    expect(manager.intensityBase).toBe(1);
    expect(manager.hitPower).toBe(0);
    expect(manager.intensityInertion).toBe(10);
    expect(manager.gray).toBe(1);
    expect(manager.noise).toBeInstanceOf(noise);
    expect(manager.postProcessEffector).toBeInstanceOf(PostProcessEffector);
    expect((manager.postProcessEffector as unknown as AnyObject).type).toBe(object.id() + 2000);
  });

  it("should correctly activate with negative intensity", () => {
    const { manager } = createManager(createPostProcessState({ intensity: -1 }));

    manager.activate();

    expect(manager.intensityBase).toBe(-1);
    expect(manager.intensityInertion).toBe(-10);
  });

  it("should not support deactivation", () => {
    const { manager } = createManager(createPostProcessState());

    manager.activate();

    expect(() => manager.deactivate()).toThrow("Called not expected method, not implemented originally");
  });

  it("should skip update when switching to another section", () => {
    const { manager } = createManager(createPostProcessState());

    manager.activate();
    replaceFunctionMock(trySwitchToAnotherSection, () => true);

    manager.update(1000);

    expect(manager.intensity).toBe(0);
  });

  it("should ramp intensity up to base while actor is inside", () => {
    const { manager } = createManager(createPostProcessState({ intensity: 1, intensitySpeed: 10 }), true);

    manager.activate();

    manager.update(50);

    expect(manager.isActorInside).toBe(true);
    expect(manager.intensity).toBeCloseTo(0.5);

    manager.update(1000);

    expect(manager.intensity).toBe(1);
  });

  it("should ramp intensity down to base while actor is inside with negative base", () => {
    const { manager } = createManager(createPostProcessState({ intensity: -1, intensitySpeed: 10 }), true);

    manager.activate();

    manager.update(50);

    expect(manager.intensity).toBeCloseTo(-0.5);

    manager.update(1000);

    expect(manager.intensity).toBe(-1);
  });

  it("should ramp positive intensity back to zero once actor leaves", () => {
    const { manager } = createManager(createPostProcessState({ intensity: 1, intensitySpeed: 10 }), false);

    manager.activate();
    manager.intensity = 1;

    manager.update(50);

    expect(manager.isActorInside).toBe(false);
    expect(manager.intensity).toBeCloseTo(0.5);

    manager.update(1000);

    expect(manager.intensity).toBe(0);
  });

  it("should ramp negative intensity back to zero once actor leaves", () => {
    const { manager } = createManager(createPostProcessState({ intensity: -1, intensitySpeed: 10 }), false);

    manager.activate();
    manager.intensity = -1;

    manager.update(50);

    expect(manager.intensity).toBeCloseTo(-0.5);

    manager.update(1000);

    expect(manager.intensity).toBe(0);
  });

  it("should apply effector parameters based on intensity", () => {
    const { manager } = createManager(createPostProcessState({ intensity: 1, intensitySpeed: 10 }), true);

    manager.activate();
    manager.update(1000);

    expect(manager.postProcessEffector.params.color_base).toBe(manager.baseColor);
    expect(manager.postProcessEffector.params.color_gray.r).toBe(manager.grayColor.r + 1);
    expect(manager.postProcessEffector.params.color_gray.g).toBe(manager.grayColor.g + 1);
    expect(manager.postProcessEffector.params.color_gray.b).toBe(manager.grayColor.b + 1);
    expect(manager.postProcessEffector.params.gray).toBe(1);
    expect(manager.postProcessEffector.params.noise.intensity).toBe(manager.noiseVar.intensity);
    expect(manager.postProcessEffector.params.noise.grain).toBe(manager.noiseVar.grain);
    expect(manager.postProcessEffector.params.noise.fps).toBe(manager.noiseVar.fps);
  });

  it("should reset hit power when actor is outside", () => {
    const { manager, actor } = createManager(createPostProcessState(), false);

    manager.activate();
    manager.hitPower = 10;

    manager.updateHit(1000);

    expect(manager.hitPower).toBe(0);
    expect(actor.hit).not.toHaveBeenCalled();
  });

  it("should accumulate hit power and hit actor once per second", () => {
    const { manager, actor } = createManager(createPostProcessState({ hitIntensity: 2 }), true);

    manager.activate();
    manager.isActorInside = true;
    manager.hitTime = NOW;

    manager.updateHit(500);

    expect(manager.hitPower).toBe(1);
    expect(actor.hit).not.toHaveBeenCalled();

    manager.hitTime = NOW - 1000;
    manager.updateHit(500);

    expect(manager.hitPower).toBe(2);
    expect(manager.hitTime).toBe(NOW);
    expect(actor.hit).toHaveBeenCalledTimes(2);

    // Both hits reuse the same hit instance, so the recorded call carries the last assigned type.
    const actorHit: Hit = jest.mocked(actor.hit).mock.calls[0][0];

    expect(actorHit).toBe(jest.mocked(actor.hit).mock.calls[1][0]);
    expect(actorHit.power).toBe(2);
    expect(actorHit.impulse).toBe(0);
    expect(actorHit.direction).toBe(ZERO_VECTOR);
    expect(actorHit.draftsman).toBe(actor);
    expect(actorHit.type).toBe(hit.shock);
  });
});
