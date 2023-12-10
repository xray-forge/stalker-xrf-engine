import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";

import { ParticleManager } from "@/engine/core/schemes/restrictor/sr_particle/ParticleManager";
import {
  EParticleBehaviour,
  IParticleDescriptor,
  ISchemeParticleState,
} from "@/engine/core/schemes/restrictor/sr_particle/sr_particale_types";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/scheme/scheme_switch", () => ({ trySwitchToAnotherSection: jest.fn() }));

describe("ParticleManager class", () => {
  beforeEach(() => {
    jest.spyOn(Date, "now").mockImplementation(() => 10_000);
    resetFunctionMock(trySwitchToAnotherSection);
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const manager: ParticleManager = new ParticleManager(object, state);

    expect(manager.isStarted).toBe(false);
    expect(manager.isFirstPlayed).toBe(false);
    expect(manager.nextUpdateAt).toBe(0);
    expect(manager.particles).toEqualLuaTables({});
    expect(manager.path).toBeNull();
  });

  it("should correctly activate in simple mode", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const manager: ParticleManager = new ParticleManager(object, state);

    state.mode = EParticleBehaviour.SIMPLE;
    state.path = "simple_path";
    state.name = "simple_name";

    manager.activate();

    expect(manager.nextUpdateAt).toBe(0);
    expect(manager.isStarted).toBe(false);
    expect(manager.isFirstPlayed).toBe(false);
    expect(manager.path).toBeNull();
    expect(state.signals).toEqualLuaTables({});
    expect(manager.particles.length()).toBe(1);
    expect(manager.particles.get(1)).toEqual({
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
    const manager: ParticleManager = new ParticleManager(object, state);

    state.mode = EParticleBehaviour.COMPLEX;
    state.path = "test-wp";
    state.name = "simple_name";

    manager.activate();

    expect(manager.nextUpdateAt).toBe(0);
    expect(manager.isStarted).toBe(false);
    expect(manager.isFirstPlayed).toBe(false);
    expect(manager.path).toBeInstanceOf(patrol);
    expect(state.signals).toEqualLuaTables({});
    expect(manager.particles.length()).toBe(3);
    expect(manager.particles.get(1)).toEqual({
      particle: expect.objectContaining({ name: "simple_name" }),
      sound: null,
      delay: 0,
      time: 10_000,
      played: false,
    });
    expect(manager.particles.get(2)).toEqual({
      particle: expect.objectContaining({ name: "simple_name" }),

      sound: null,
      delay: 2_000,
      time: 10_000,
      played: false,
    });
    expect(manager.particles.get(3)).toEqual({
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
    const manager: ParticleManager = new ParticleManager(object, state);

    state.mode = EParticleBehaviour.COMPLEX;
    state.path = "test-wp";
    state.name = "simple_name";

    manager.activate();

    const particles = [];

    for (const [, descriptor] of manager.particles) {
      particles.push(descriptor.particle);
      jest.spyOn(descriptor.particle, "playing").mockImplementation(() => true);
    }

    manager.update();
    manager.deactivate();

    expect(manager.particles.length()).toBe(3);
    expect(particles).toHaveLength(3);
    particles.forEach((particle) => expect(particle.stop).toHaveBeenCalledTimes(1));
  });

  it("should correctly update based on mode / started state", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const manager: ParticleManager = new ParticleManager(object, state);

    state.mode = EParticleBehaviour.COMPLEX;
    state.path = "test-wp";
    state.name = "simple_name";

    manager.activate();
    manager.update();

    expect(manager.isStarted).toBe(true);

    jest.spyOn(manager, "updateSimple").mockImplementation(jest.fn());
    jest.spyOn(manager, "updateComplex").mockImplementation(jest.fn());
    jest.spyOn(manager, "isEnded").mockImplementation(jest.fn(() => false));

    manager.update();

    // Timed throttle.
    expect(manager.nextUpdateAt).toBe(10_050);
    expect(manager.updateComplex).toHaveBeenCalledTimes(0);
    expect(manager.updateComplex).toHaveBeenCalledTimes(0);

    manager.nextUpdateAt = 0;
    manager.update();

    expect(manager.updateSimple).toHaveBeenCalledTimes(0);
    expect(manager.updateComplex).toHaveBeenCalledTimes(1);
    expect(manager.isEnded).toHaveBeenCalledTimes(1);
    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(1);
    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(manager.object, manager.state);

    manager.nextUpdateAt = 0;
    manager.state.mode = EParticleBehaviour.SIMPLE;
    manager.update();

    expect(manager.updateSimple).toHaveBeenCalledTimes(1);
    expect(manager.updateComplex).toHaveBeenCalledTimes(1);
    expect(manager.isEnded).toHaveBeenCalledTimes(2);
    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(2);
    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(manager.object, manager.state);
  });

  it("should correctly update in simple mode without loop", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const manager: ParticleManager = new ParticleManager(object, state);

    state.mode = EParticleBehaviour.SIMPLE;
    state.path = "simple_path";
    state.name = "simple_name";
    state.looped = false;

    manager.activate();
    manager.update();

    const descriptor: IParticleDescriptor = manager.particles.get(1);

    manager.nextUpdateAt = 0;
    manager.update();

    expect(manager.isFirstPlayed).toBe(true);
    expect(descriptor.played).toBe(true);
    expect(descriptor.particle.load_path).toHaveBeenCalledWith("simple_path");
    expect(descriptor.particle.start_path).toHaveBeenCalledWith(false);
    expect(descriptor.particle.play).toHaveBeenCalledTimes(1);
    expect(descriptor.particle.playing()).toBe(true);

    manager.updateSimple();
    expect(descriptor.particle.play).toHaveBeenCalledTimes(1);

    descriptor.particle.stop();

    manager.updateSimple();
    expect(descriptor.particle.play).toHaveBeenCalledTimes(1);
  });

  it("should correctly update in simple mode with loop", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const manager: ParticleManager = new ParticleManager(object, state);

    state.mode = EParticleBehaviour.SIMPLE;
    state.path = "simple_path";
    state.name = "simple_name";
    state.looped = true;

    manager.activate();
    manager.update();

    const descriptor: IParticleDescriptor = manager.particles.get(1);

    manager.nextUpdateAt = 0;
    manager.update();

    expect(manager.isFirstPlayed).toBe(true);
    expect(descriptor.played).toBe(true);
    expect(descriptor.particle.load_path).toHaveBeenCalledWith("simple_path");
    expect(descriptor.particle.start_path).toHaveBeenCalledWith(true);
    expect(descriptor.particle.play).toHaveBeenCalledTimes(1);
    expect(descriptor.particle.playing()).toBe(true);

    manager.updateSimple();
    expect(descriptor.particle.play).toHaveBeenCalledTimes(1);

    descriptor.particle.stop();

    manager.updateSimple();
    expect(descriptor.particle.play).toHaveBeenCalledTimes(2);
  });

  it("should correctly update in complex mode without loop", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const manager: ParticleManager = new ParticleManager(object, state);

    state.mode = EParticleBehaviour.COMPLEX;
    state.path = "test-wp";
    state.name = "simple_name";
    state.looped = false;

    expect(manager.isEnded()).toBe(false);

    manager.activate();
    manager.update();

    jest.spyOn(Date, "now").mockImplementation(() => 20_000);

    manager.nextUpdateAt = 0;
    manager.update();

    expect(manager.isFirstPlayed).toBe(true);

    for (const [index, descriptor] of manager.particles) {
      expect(descriptor.particle.play_at_pos).toHaveBeenCalledWith(manager.path?.point(index - 1));
      expect(descriptor.particle.playing()).toBe(true);

      descriptor.particle.stop();
    }

    jest.spyOn(Date, "now").mockImplementation(() => 30_000);

    manager.nextUpdateAt = 0;
    manager.update();

    for (const [, descriptor] of manager.particles) {
      expect(descriptor.particle.play_at_pos).toHaveBeenCalledTimes(1);
    }
  });

  it("should correctly update in complex mode with loop", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const manager: ParticleManager = new ParticleManager(object, state);

    state.mode = EParticleBehaviour.COMPLEX;
    state.path = "test-wp";
    state.name = "simple_name";
    state.looped = true;

    expect(manager.isEnded()).toBe(false);

    manager.activate();
    manager.update();

    jest.spyOn(Date, "now").mockImplementation(() => 20_000);

    manager.nextUpdateAt = 0;
    manager.update();

    expect(manager.isFirstPlayed).toBe(true);

    for (const [index, descriptor] of manager.particles) {
      expect(descriptor.particle.play_at_pos).toHaveBeenCalledWith(manager.path?.point(index - 1));
      expect(descriptor.particle.playing()).toBe(true);

      descriptor.particle.stop();
    }

    jest.spyOn(Date, "now").mockImplementation(() => 30_000);

    manager.nextUpdateAt = 0;
    manager.update();

    for (const [, descriptor] of manager.particles) {
      expect(descriptor.particle.play_at_pos).toHaveBeenCalledTimes(2);
    }
  });

  it("should correctly check ended state", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const manager: ParticleManager = new ParticleManager(object, state);

    state.mode = EParticleBehaviour.COMPLEX;
    state.path = "test-wp";
    state.name = "simple_name";

    expect(manager.isEnded()).toBe(false);

    manager.activate();
    manager.update();

    manager.nextUpdateAt = 0;
    manager.update();

    expect(manager.isEnded()).toBe(false);
    expect(manager.isFirstPlayed).toBe(true);
    expect(manager.state.signals?.length()).toBe(0);

    for (const [, descriptor] of manager.particles) {
      descriptor.particle.stop();
    }

    expect(manager.isEnded()).toBe(true);
    expect(manager.state.signals?.length()).toBe(1);
    expect(manager.state.signals?.get("particle_end")).toBe(true);

    manager.state.looped = true;
    expect(manager.isEnded()).toBe(false);
  });
});
