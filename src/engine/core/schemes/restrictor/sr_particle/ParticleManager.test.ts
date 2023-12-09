import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";

import { ParticleManager } from "@/engine/core/schemes/restrictor/sr_particle/ParticleManager";
import {
  EParticleBehaviour,
  ISchemeParticleState,
} from "@/engine/core/schemes/restrictor/sr_particle/sr_particale_types";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

describe("ParticleManager class", () => {
  beforeEach(() => {
    jest.spyOn(Date, "now").mockImplementation(() => 10_000);
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeParticleState = mockSchemeState(EScheme.SR_PARTICLE);
    const manager: ParticleManager = new ParticleManager(object, state);

    expect(manager.isStarted).toBe(false);
    expect(manager.isFirstPlayed).toBe(false);
    expect(manager.updatedAt).toBe(0);
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

    expect(manager.updatedAt).toBe(0);
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

    expect(manager.updatedAt).toBe(0);
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

  it.todo("should correctly deactivate");

  it.todo("should correctly update in mode 1");

  it.todo("should correctly update in mode 2");

  it.todo("should correctly check end state in mode 1");

  it.todo("should correctly check end state in mode 2");
});
