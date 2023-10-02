import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { ISchemePhysicalHitState } from "@/engine/core/schemes/physical/ph_hit/ph_hit_types";
import { PhysicalHitManager } from "@/engine/core/schemes/physical/ph_hit/PhysicalHitManager";
import { SchemePhysicalHit } from "@/engine/core/schemes/physical/ph_hit/SchemePhysicalHit";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemePhysicalHit", () => {
  it("should correctly activate with defaults", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "ph_hit@test": {
        bone: "test_bone",
        dir_path: "test_path",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemePhysicalHit);

    const state: ISchemePhysicalHitState = SchemePhysicalHit.activate(object, ini, EScheme.PH_HIT, "ph_hit@test");

    expect(state.logic).toEqualLuaTables({});
    expect(state.power).toBe(0);
    expect(state.impulse).toBe(1000);
    expect(state.bone).toBe("test_bone");
    expect(state.dirPath).toBe("test_path");

    assertSchemeSubscribedToManager(state, PhysicalHitManager);
  });

  it("should correctly activate with custom data", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "ph_hit@test": {
        on_info: "{+test} first, second",
        power: 5,
        impulse: 466,
        bone: "test_bone2",
        dir_path: "test_path2",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemePhysicalHit);

    const state: ISchemePhysicalHitState = SchemePhysicalHit.activate(object, ini, EScheme.PH_HIT, "ph_hit@test");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "ph_hit@test"));
    expect(state.power).toBe(5);
    expect(state.impulse).toBe(466);
    expect(state.bone).toBe("test_bone2");
    expect(state.dirPath).toBe("test_path2");

    assertSchemeSubscribedToManager(state, PhysicalHitManager);
  });

  it("should correctly fail with no bone/path", () => {
    const object: ClientObject = mockClientGameObject();

    registerObject(object);
    loadSchemeImplementation(SchemePhysicalHit);

    expect(() => {
      SchemePhysicalHit.activate(
        object,
        mockIniFile("test.ltx", {
          "ph_hit@test": {},
        }),
        EScheme.PH_HIT,
        "ph_hit@test"
      );
    }).toThrow();

    expect(() => {
      SchemePhysicalHit.activate(
        object,
        mockIniFile("test.ltx", {
          "ph_hit@test": {
            dir_path: "test_path",
          },
        }),
        EScheme.PH_HIT,
        "ph_hit@test"
      );
    }).toThrow();

    expect(() => {
      SchemePhysicalHit.activate(
        object,
        mockIniFile("test.ltx", {
          "ph_hit@test": {
            bone: "test_bone",
          },
        }),
        EScheme.PH_HIT,
        "ph_hit@test"
      );
    }).toThrow();
  });
});
