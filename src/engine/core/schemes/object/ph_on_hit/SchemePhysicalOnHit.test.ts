import { describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemePhysicalOnHitState } from "@/engine/core/schemes/object/ph_on_hit/ISchemePhysicalOnHitState";
import { PhysicalOnHitManager } from "@/engine/core/schemes/object/ph_on_hit/PhysicalOnHitManager";
import { SchemePhysicalOnHit } from "@/engine/core/schemes/object/ph_on_hit/SchemePhysicalOnHit";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemePhysicalOnHit", () => {
  it("should correctly activate", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "ph_on_hit@test": {
        on_info: "{+test} first, second",
      },
    });
    const state: IRegistryObjectState = registerObject(object);

    loadSchemeImplementation(SchemePhysicalOnHit);

    SchemePhysicalOnHit.activate(object, ini, EScheme.PH_ON_HIT, "ph_on_hit@test");

    const schemeState: ISchemePhysicalOnHitState = state[EScheme.PH_ON_HIT] as ISchemePhysicalOnHitState;

    expect(schemeState.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "ph_on_hit@test")!);
    expect(schemeState.action).toBeInstanceOf(PhysicalOnHitManager);
  });

  it("should correctly disable", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "ph_on_hit@test": {
        on_info: "{+test} first, second",
      },
    });
    const state: IRegistryObjectState = registerObject(object);

    loadSchemeImplementation(SchemePhysicalOnHit);

    expect(() => SchemePhysicalOnHit.disable(object, EScheme.PH_ON_HIT)).not.toThrow();

    SchemePhysicalOnHit.activate(object, ini, EScheme.PH_ON_HIT, "ph_on_hit@test");

    const schemeState: ISchemePhysicalOnHitState = state[EScheme.PH_ON_HIT] as ISchemePhysicalOnHitState;

    expect(schemeState.action).toBeInstanceOf(PhysicalOnHitManager);

    SchemePhysicalOnHit.disable(object, EScheme.PH_ON_HIT);
    expect(schemeState.actions).toEqualLuaTables({});
  });
});
