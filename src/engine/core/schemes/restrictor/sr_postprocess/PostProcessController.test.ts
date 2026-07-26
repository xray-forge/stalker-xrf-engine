import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { hit, noise, time_global } from "xray16";
import { GameObject, Hit } from "xray16/alias";
import { AnyObject, TTimestamp, ZERO_VECTOR } from "xray16/lib";
import { MockGameObject, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { PostProcessController } from "@/engine/core/schemes/restrictor/sr_postprocess/PostProcessController";
import { PostProcessEffector } from "@/engine/core/schemes/restrictor/sr_postprocess/PostProcessEffector";
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
 * Create post process controller over restrictor object with the actor placed inside or outside of it.
 */
function createController(
  state: ISchemePostProcessState,
  isActorInside: boolean = true
): { actor: GameObject; controller: PostProcessController; object: GameObject } {
  const { actorGameObject } = mockRegisteredActor({ position: MockVector.create(0, 0, 0) });
  const object: GameObject = MockGameObject.mock();

  jest.spyOn(object, "inside").mockImplementation(() => isActorInside);

  return { actor: actorGameObject, controller: new PostProcessController(object, state), object };
}

describe("PostProcessController", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(trySwitchToAnotherSection);
    resetFunctionMock(time_global);
    replaceFunctionMock(trySwitchToAnotherSection, () => false);
    replaceFunctionMock(time_global, () => NOW);
  });

  it("should correctly activate with positive intensity", () => {
    const { controller, object } = createController(createPostProcessState());

    controller.activate();

    expect(controller.isActorInside).toBe(false);
    expect(controller.grayAmplitude).toBe(1);
    expect(controller.effTime).toBe(0);
    expect(controller.hitTime).toBe(0);
    expect(controller.intensity).toBe(0);
    expect(controller.intensityBase).toBe(1);
    expect(controller.hitPower).toBe(0);
    expect(controller.intensityInertion).toBe(10);
    expect(controller.gray).toBe(1);
    expect(controller.noise).toBeInstanceOf(noise);
    expect(controller.postProcessEffector).toBeInstanceOf(PostProcessEffector);
    expect((controller.postProcessEffector as unknown as AnyObject).type).toBe(object.id() + 2000);
  });

  it("should correctly activate with negative intensity", () => {
    const { controller } = createController(createPostProcessState({ intensity: -1 }));

    controller.activate();

    expect(controller.intensityBase).toBe(-1);
    expect(controller.intensityInertion).toBe(-10);
  });

  it("should not support deactivation", () => {
    const { controller } = createController(createPostProcessState());

    controller.activate();

    expect(() => controller.deactivate()).toThrow("Called not expected method, not implemented originally");
  });

  it("should skip update when switching to another section", () => {
    const { controller } = createController(createPostProcessState());

    controller.activate();
    replaceFunctionMock(trySwitchToAnotherSection, () => true);

    controller.update(1000);

    expect(controller.intensity).toBe(0);
  });

  it("should ramp intensity up to base while actor is inside", () => {
    const { controller } = createController(createPostProcessState({ intensity: 1, intensitySpeed: 10 }), true);

    controller.activate();

    controller.update(50);

    expect(controller.isActorInside).toBe(true);
    expect(controller.intensity).toBeCloseTo(0.5);

    controller.update(1000);

    expect(controller.intensity).toBe(1);
  });

  it("should ramp intensity down to base while actor is inside with negative base", () => {
    const { controller } = createController(createPostProcessState({ intensity: -1, intensitySpeed: 10 }), true);

    controller.activate();

    controller.update(50);

    expect(controller.intensity).toBeCloseTo(-0.5);

    controller.update(1000);

    expect(controller.intensity).toBe(-1);
  });

  it("should ramp positive intensity back to zero once actor leaves", () => {
    const { controller } = createController(createPostProcessState({ intensity: 1, intensitySpeed: 10 }), false);

    controller.activate();
    controller.intensity = 1;

    controller.update(50);

    expect(controller.isActorInside).toBe(false);
    expect(controller.intensity).toBeCloseTo(0.5);

    controller.update(1000);

    expect(controller.intensity).toBe(0);
  });

  it("should ramp negative intensity back to zero once actor leaves", () => {
    const { controller } = createController(createPostProcessState({ intensity: -1, intensitySpeed: 10 }), false);

    controller.activate();
    controller.intensity = -1;

    controller.update(50);

    expect(controller.intensity).toBeCloseTo(-0.5);

    controller.update(1000);

    expect(controller.intensity).toBe(0);
  });

  it("should apply effector parameters based on intensity", () => {
    const { controller } = createController(createPostProcessState({ intensity: 1, intensitySpeed: 10 }), true);

    controller.activate();
    controller.update(1000);

    expect(controller.postProcessEffector.params.color_base).toBe(controller.baseColor);
    expect(controller.postProcessEffector.params.color_gray.r).toBe(controller.grayColor.r + 1);
    expect(controller.postProcessEffector.params.color_gray.g).toBe(controller.grayColor.g + 1);
    expect(controller.postProcessEffector.params.color_gray.b).toBe(controller.grayColor.b + 1);
    expect(controller.postProcessEffector.params.gray).toBe(1);
    expect(controller.postProcessEffector.params.noise.intensity).toBe(controller.noiseVar.intensity);
    expect(controller.postProcessEffector.params.noise.grain).toBe(controller.noiseVar.grain);
    expect(controller.postProcessEffector.params.noise.fps).toBe(controller.noiseVar.fps);
  });

  it("should reset hit power when actor is outside", () => {
    const { controller, actor } = createController(createPostProcessState(), false);

    controller.activate();
    controller.hitPower = 10;

    controller.updateHit(1000);

    expect(controller.hitPower).toBe(0);
    expect(actor.hit).not.toHaveBeenCalled();
  });

  it("should accumulate hit power and hit actor once per second", () => {
    const { controller, actor } = createController(createPostProcessState({ hitIntensity: 2 }), true);

    controller.activate();
    controller.isActorInside = true;
    controller.hitTime = NOW;

    controller.updateHit(500);

    expect(controller.hitPower).toBe(1);
    expect(actor.hit).not.toHaveBeenCalled();

    controller.hitTime = NOW - 1000;
    controller.updateHit(500);

    expect(controller.hitPower).toBe(2);
    expect(controller.hitTime).toBe(NOW);
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
