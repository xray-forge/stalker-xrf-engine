import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { ParticleController } from "@/engine/core/schemes/restrictor/sr_particle/ParticleController";
import {
  EParticleBehaviour,
  IParticleDescriptor,
  ISchemeParticleState,
} from "@/engine/core/schemes/restrictor/sr_particle/sr_particale_types";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({ trySwitchToAnotherSection: jest.fn() }));

describe("ParticleController", () => {
  beforeEach(() => {
    jest.spyOn(Date, "now").mockImplementation(() => 10_000);
    resetFunctionMock(trySwitchToAnotherSection);
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const controller: ParticleController = new ParticleController(object, state);

    expect(controller.isStarted).toBe(false);
    expect(controller.isFirstPlayed).toBe(false);
    expect(controller.nextUpdateAt).toBe(0);
    expect(controller.particles).toEqualLuaTables({});
    expect(controller.path).toBeNull();
  });

  it("should correctly activate in simple mode", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const controller: ParticleController = new ParticleController(object, state);

    state.mode = EParticleBehaviour.SIMPLE;
    state.path = "simple_path";
    state.name = "simple_name";

    controller.activate();

    expect(controller.nextUpdateAt).toBe(0);
    expect(controller.isStarted).toBe(false);
    expect(controller.isFirstPlayed).toBe(false);
    expect(controller.path).toBeNull();
    expect(state.signals).toEqualLuaTables({});
    expect(controller.particles.length()).toBe(1);
    expect(controller.particles.get(1)).toEqual({
      particle: expect.objectContaining({ name: "simple_name" }),
      sound: null,
      delay: 0,
      time: 10_000,
      played: false,
    });
  });

  it("should correctly activate in complex mode", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const controller: ParticleController = new ParticleController(object, state);

    state.mode = EParticleBehaviour.COMPLEX;
    state.path = "test-wp";
    state.name = "simple_name";

    controller.activate();

    expect(controller.nextUpdateAt).toBe(0);
    expect(controller.isStarted).toBe(false);
    expect(controller.isFirstPlayed).toBe(false);
    expect(controller.path).toBeInstanceOf(patrol);
    expect(state.signals).toEqualLuaTables({});
    expect(controller.particles.length()).toBe(3);
    expect(controller.particles.get(1)).toEqual({
      particle: expect.objectContaining({ name: "simple_name" }),
      sound: null,
      delay: 0,
      time: 10_000,
      played: false,
    });
    expect(controller.particles.get(2)).toEqual({
      particle: expect.objectContaining({ name: "simple_name" }),

      sound: null,
      delay: 2_000,
      time: 10_000,
      played: false,
    });
    expect(controller.particles.get(3)).toEqual({
      particle: expect.objectContaining({ name: "simple_name" }),

      sound: null,
      delay: 3_000,
      time: 10_000,
      played: false,
    });
  });

  it("should correctly deactivate", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const controller: ParticleController = new ParticleController(object, state);

    state.mode = EParticleBehaviour.COMPLEX;
    state.path = "test-wp";
    state.name = "simple_name";

    controller.activate();

    const particles = [];

    for (const [, descriptor] of controller.particles) {
      particles.push(descriptor.particle);
      jest.spyOn(descriptor.particle, "playing").mockImplementation(() => true);
    }

    controller.update();
    controller.deactivate();

    expect(controller.particles.length()).toBe(3);
    expect(particles).toHaveLength(3);
    particles.forEach((particle) => expect(particle.stop).toHaveBeenCalledTimes(1));
  });

  it("should correctly update based on mode / started state", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const controller: ParticleController = new ParticleController(object, state);

    state.mode = EParticleBehaviour.COMPLEX;
    state.path = "test-wp";
    state.name = "simple_name";

    controller.activate();
    controller.update();

    expect(controller.isStarted).toBe(true);

    jest.spyOn(controller, "updateSimple").mockImplementation(jest.fn());
    jest.spyOn(controller, "updateComplex").mockImplementation(jest.fn());
    jest.spyOn(controller, "isEnded").mockImplementation(jest.fn(() => false));

    controller.update();

    // Timed throttle.
    expect(controller.nextUpdateAt).toBe(10_050);
    expect(controller.updateComplex).toHaveBeenCalledTimes(0);
    expect(controller.updateComplex).toHaveBeenCalledTimes(0);

    controller.nextUpdateAt = 0;
    controller.update();

    expect(controller.updateSimple).toHaveBeenCalledTimes(0);
    expect(controller.updateComplex).toHaveBeenCalledTimes(1);
    expect(controller.isEnded).toHaveBeenCalledTimes(1);
    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(1);
    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(controller.object, controller.state);

    controller.nextUpdateAt = 0;
    controller.state.mode = EParticleBehaviour.SIMPLE;
    controller.update();

    expect(controller.updateSimple).toHaveBeenCalledTimes(1);
    expect(controller.updateComplex).toHaveBeenCalledTimes(1);
    expect(controller.isEnded).toHaveBeenCalledTimes(2);
    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(2);
    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(controller.object, controller.state);
  });

  it("should correctly update in simple mode without loop", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const controller: ParticleController = new ParticleController(object, state);

    state.mode = EParticleBehaviour.SIMPLE;
    state.path = "simple_path";
    state.name = "simple_name";
    state.looped = false;

    controller.activate();
    controller.update();

    const descriptor: IParticleDescriptor = controller.particles.get(1);

    controller.nextUpdateAt = 0;
    controller.update();

    expect(controller.isFirstPlayed).toBe(true);
    expect(descriptor.played).toBe(true);
    expect(descriptor.particle.load_path).toHaveBeenCalledWith("simple_path");
    expect(descriptor.particle.start_path).toHaveBeenCalledWith(false);
    expect(descriptor.particle.play).toHaveBeenCalledTimes(1);
    expect(descriptor.particle.playing()).toBe(true);

    controller.updateSimple();
    expect(descriptor.particle.play).toHaveBeenCalledTimes(1);

    descriptor.particle.stop();

    controller.updateSimple();
    expect(descriptor.particle.play).toHaveBeenCalledTimes(1);
  });

  it("should correctly update in simple mode with loop", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const controller: ParticleController = new ParticleController(object, state);

    state.mode = EParticleBehaviour.SIMPLE;
    state.path = "simple_path";
    state.name = "simple_name";
    state.looped = true;

    controller.activate();
    controller.update();

    const descriptor: IParticleDescriptor = controller.particles.get(1);

    controller.nextUpdateAt = 0;
    controller.update();

    expect(controller.isFirstPlayed).toBe(true);
    expect(descriptor.played).toBe(true);
    expect(descriptor.particle.load_path).toHaveBeenCalledWith("simple_path");
    expect(descriptor.particle.start_path).toHaveBeenCalledWith(true);
    expect(descriptor.particle.play).toHaveBeenCalledTimes(1);
    expect(descriptor.particle.playing()).toBe(true);

    controller.updateSimple();
    expect(descriptor.particle.play).toHaveBeenCalledTimes(1);

    descriptor.particle.stop();

    controller.updateSimple();
    expect(descriptor.particle.play).toHaveBeenCalledTimes(2);
  });

  it("should correctly update in complex mode without loop", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const controller: ParticleController = new ParticleController(object, state);

    state.mode = EParticleBehaviour.COMPLEX;
    state.path = "test-wp";
    state.name = "simple_name";
    state.looped = false;

    expect(controller.isEnded()).toBe(false);

    controller.activate();
    controller.update();

    jest.spyOn(Date, "now").mockImplementation(() => 20_000);

    controller.nextUpdateAt = 0;
    controller.update();

    expect(controller.isFirstPlayed).toBe(true);

    for (const [index, descriptor] of controller.particles) {
      expect(descriptor.particle.play_at_pos).toHaveBeenCalledWith(controller.path?.point(index - 1));
      expect(descriptor.particle.playing()).toBe(true);

      descriptor.particle.stop();
    }

    jest.spyOn(Date, "now").mockImplementation(() => 30_000);

    controller.nextUpdateAt = 0;
    controller.update();

    for (const [, descriptor] of controller.particles) {
      expect(descriptor.particle.play_at_pos).toHaveBeenCalledTimes(1);
    }
  });

  it("should correctly update in complex mode with loop", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const controller: ParticleController = new ParticleController(object, state);

    state.mode = EParticleBehaviour.COMPLEX;
    state.path = "test-wp";
    state.name = "simple_name";
    state.looped = true;

    expect(controller.isEnded()).toBe(false);

    controller.activate();
    controller.update();

    jest.spyOn(Date, "now").mockImplementation(() => 20_000);

    controller.nextUpdateAt = 0;
    controller.update();

    expect(controller.isFirstPlayed).toBe(true);

    for (const [index, descriptor] of controller.particles) {
      expect(descriptor.particle.play_at_pos).toHaveBeenCalledWith(controller.path?.point(index - 1));
      expect(descriptor.particle.playing()).toBe(true);

      descriptor.particle.stop();
    }

    jest.spyOn(Date, "now").mockImplementation(() => 30_000);

    controller.nextUpdateAt = 0;
    controller.update();

    for (const [, descriptor] of controller.particles) {
      expect(descriptor.particle.play_at_pos).toHaveBeenCalledTimes(2);
    }
  });

  it("should correctly check ended state", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const controller: ParticleController = new ParticleController(object, state);

    state.mode = EParticleBehaviour.COMPLEX;
    state.path = "test-wp";
    state.name = "simple_name";

    expect(controller.isEnded()).toBe(false);

    controller.activate();

    jest.spyOn(Date, "now").mockImplementation(() => 10_050);

    controller.update();

    controller.nextUpdateAt = 0;
    controller.update();

    expect(controller.isEnded()).toBe(false);
    expect(controller.isFirstPlayed).toBe(true);
    expect(controller.state.signals?.length()).toBe(0);

    for (const [, descriptor] of controller.particles) {
      descriptor.particle.stop();
    }

    expect(controller.isEnded()).toBe(true);
    expect(controller.state.signals?.length()).toBe(1);
    expect(controller.state.signals?.get("particle_end")).toBe(true);

    controller.state.looped = true;
    expect(controller.isEnded()).toBe(false);
  });
});
