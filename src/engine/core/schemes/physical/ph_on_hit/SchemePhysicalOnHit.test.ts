import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { ISchemePhysicalOnHitState } from "@/engine/core/schemes/physical/ph_on_hit/ph_on_hit_types";
import { PhysicalOnHitManager } from "@/engine/core/schemes/physical/ph_on_hit/PhysicalOnHitManager";
import { SchemePhysicalOnHit } from "@/engine/core/schemes/physical/ph_on_hit/SchemePhysicalOnHit";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, GameObject, IniFile } from "@/engine/lib/types";
import { mockGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemePhysicalOnHit", () => {
  it("should correctly activate", () => {
    const object: GameObject = mockGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "ph_on_hit@test": {
        on_info: "{+test} first, second",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemePhysicalOnHit);

    const state: ISchemePhysicalOnHitState = SchemePhysicalOnHit.activate(
      object,
      ini,
      EScheme.PH_ON_HIT,
      "ph_on_hit@test"
    );

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "ph_on_hit@test")!);
    expect(state.action).toBeInstanceOf(PhysicalOnHitManager);
  });

  it("should correctly disable", () => {
    const object: GameObject = mockGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "ph_on_hit@test": {
        on_info: "{+test} first, second",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemePhysicalOnHit);

    expect(() => SchemePhysicalOnHit.disable(object, EScheme.PH_ON_HIT)).not.toThrow();

    const state: ISchemePhysicalOnHitState = SchemePhysicalOnHit.activate(
      object,
      ini,
      EScheme.PH_ON_HIT,
      "ph_on_hit@test"
    );

    expect(state.action).toBeInstanceOf(PhysicalOnHitManager);

    SchemePhysicalOnHit.disable(object, EScheme.PH_ON_HIT);
    expect(state.actions).toEqualLuaTables({});
  });
});
