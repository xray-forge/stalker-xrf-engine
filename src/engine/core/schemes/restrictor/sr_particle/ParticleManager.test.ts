import { describe, expect, it } from "@jest/globals";

import { ParticleManager } from "@/engine/core/schemes/restrictor/sr_particle/ParticleManager";
import { ISchemeParticleState } from "@/engine/core/schemes/restrictor/sr_particle/sr_particale_types";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

describe("ParticleManager class", () => {
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

  it.todo("should correctly activate in mode 1");

  it.todo("should correctly activate in mode 2");

  it.todo("should correctly update in mode 1");

  it.todo("should correctly update in mode 2");

  it.todo("should correctly check end state in mode 1");

  it.todo("should correctly check end state in mode 2");
});
