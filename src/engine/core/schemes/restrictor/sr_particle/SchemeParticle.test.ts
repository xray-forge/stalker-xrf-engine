import { describe, expect, it } from "@jest/globals";
import { GameObject, IniFile } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { registerObject } from "@/engine/core/database";
import { ParticleManager } from "@/engine/core/schemes/restrictor/sr_particle/ParticleManager";
import { SchemeParticle } from "@/engine/core/schemes/restrictor/sr_particle/SchemeParticle";
import { ISchemeParticleState } from "@/engine/core/schemes/restrictor/sr_particle/sr_particale_types";
import { loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { EScheme } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";

describe("SchemeParticle", () => {
  it("should correctly fail with no data", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);
    loadSchemeImplementation(SchemeParticle);

    expect(() => {
      SchemeParticle.activate(
        object,
        MockIniFile.mock("test.ltx", {
          "sr_particle@test": {
            name: "test-name-0",
            path: "test-path-0",
            mode: 3,
          },
        }),
        EScheme.SR_PARTICLE,
        "sr_particle@test"
      );
    }).toThrow("Scheme sr_particle: invalid mode in configuration.");
  });

  it("should correctly activate with defaults", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_particle@test": {
        name: "test-particle-1",
        path: "test-path-1",
        mode: 1,
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeParticle);

    const state: ISchemeParticleState = SchemeParticle.activate(object, ini, EScheme.SR_PARTICLE, "sr_particle@test");

    expect(state.logic).toEqualLuaTables({});
    expect(state.name).toBe("test-particle-1");
    expect(state.path).toBe("test-path-1");
    expect(state.mode).toBe(1);

    assertSchemeSubscribedToManager(state, ParticleManager);
  });

  it("should correctly activate with provided values", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_particle@test": {
        on_info: "{+test} first, second",
        name: "test-particle-2",
        path: "test-path-2",
        mode: 2,
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeParticle);

    const state: ISchemeParticleState = SchemeParticle.activate(object, ini, EScheme.SR_PARTICLE, "sr_particle@test");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "sr_particle@test"));
    expect(state.name).toBe("test-particle-2");
    expect(state.path).toBe("test-path-2");
    expect(state.mode).toBe(2);

    assertSchemeSubscribedToManager(state, ParticleManager);
  });
});
