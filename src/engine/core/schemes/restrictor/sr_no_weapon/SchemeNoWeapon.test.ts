import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { NoWeaponManager } from "@/engine/core/schemes/restrictor/sr_no_weapon/NoWeaponManager";
import { SchemeNoWeapon } from "@/engine/core/schemes/restrictor/sr_no_weapon/SchemeNoWeapon";
import { ISchemeNoWeaponState } from "@/engine/core/schemes/restrictor/sr_no_weapon/sr_no_weapon_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("SchemeNoWeapon class", () => {
  it("should be correctly defined", () => {
    expect(SchemeNoWeapon.SCHEME_SECTION).toBe("sr_no_weapon");
    expect(SchemeNoWeapon.SCHEME_SECTION).toBe(EScheme.SR_NO_WEAPON);
    expect(SchemeNoWeapon.SCHEME_TYPE).toBe(ESchemeType.RESTRICTOR);
  });

  it("should correctly activate scheme with defaults", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_no_weapon@test": {
        on_info: "{=actor_in_zone(zat_b42_warning_space_restrictor)} sr_another@1",
        on_info1: "{=actor_in_zone(zat_b42_warning_space_restrictor)} sr_another@2",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeNoWeapon);

    const state: ISchemeNoWeaponState = SchemeNoWeapon.activate(
      object,
      ini,
      SchemeNoWeapon.SCHEME_SECTION,
      `${SchemeNoWeapon.SCHEME_SECTION}@test`
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("sr_no_weapon");
    expect(state.section).toBe("sr_no_weapon@test");
    expect(state.logic?.length()).toBe(2);
    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "sr_no_weapon@test"));
    expect(state.actions?.length()).toBe(1);

    assertSchemeSubscribedToManager(state, NoWeaponManager);
  });
});
