import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { HitManager } from "@/engine/core/schemes/stalker/hit/HitManager";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit/ISchemeHitState";
import { SchemeHit } from "@/engine/core/schemes/stalker/hit/SchemeHit";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { assertSchemeNotToBeSubscribed, assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeHit", () => {
  it("should correctly activate with defaults", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "hit@test": {
        on_info: "{+test} first, second",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeHit);

    const state: ISchemeHitState = SchemeHit.activate(object, ini, EScheme.HIT, "hit@test");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "hit@test"));
    expect(state.action).toBeInstanceOf(HitManager);
    assertSchemeSubscribedToManager(state, HitManager);
  });

  it("should correctly deactivate", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "hit@test": {},
    });

    registerObject(object);
    loadSchemeImplementation(SchemeHit);

    const state: ISchemeHitState = SchemeHit.activate(object, ini, EScheme.HIT, "hit@test");

    SchemeHit.disable(object, EScheme.HIT);

    assertSchemeNotToBeSubscribed(state);

    const another: ClientObject = mockClientGameObject();

    registerObject(another);

    expect(() => SchemeHit.disable(another, EScheme.HIT)).not.toThrow();
    expect(() => SchemeHit.disable(object, EScheme.HIT)).not.toThrow();
  });

  it("should correctly throw if activate not existing", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "hit@test": {},
    });

    registerObject(object);
    loadSchemeImplementation(SchemeHit);

    expect(() => SchemeHit.activate(object, ini, EScheme.HIT, "hit@test2")).toThrow();
  });
});
