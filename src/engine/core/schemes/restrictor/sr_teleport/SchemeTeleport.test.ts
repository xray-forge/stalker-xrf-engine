import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { SchemeTeleport } from "@/engine/core/schemes/restrictor/sr_teleport/SchemeTeleport";
import { ISchemeTeleportState } from "@/engine/core/schemes/restrictor/sr_teleport/sr_teleport_types";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme/scheme_setup";
import { EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { MockGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeTeleport functionality", () => {
  it("should be correctly defined", () => {
    expect(SchemeTeleport.SCHEME_SECTION).toBe("sr_teleport");
    expect(SchemeTeleport.SCHEME_SECTION).toBe(EScheme.SR_TELEPORT);
    expect(SchemeTeleport.SCHEME_TYPE).toBe(ESchemeType.RESTRICTOR);
  });

  it("should correctly activate scheme", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "sr_teleport@test": {
        timeout: 500,
        point1: "ap",
        look1: "al",
        prob1: 1,
        point2: "bp",
        look2: "bl",
        prob2: 0.5,
        point3: "cp",
        look3: "cl",
        prob3: 0.5,
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeTeleport);

    const state: ISchemeTeleportState = SchemeTeleport.activate(
      object,
      ini,
      SchemeTeleport.SCHEME_SECTION,
      "sr_teleport@test"
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("sr_teleport");
    expect(state.section).toBe("sr_teleport@test");
    expect(state.logic?.length()).toBe(0);
    expect(state.actions?.length()).toBe(1);

    expect(state.timeout).toBe(500);
    expect(state.maxTotalProbability).toBe(2);
    expect(state.points.length()).toBe(3);
    expect(state.points).toEqualLuaArrays([
      {
        look: "al",
        point: "ap",
        probability: 1,
      },
      {
        look: "bl",
        point: "bp",
        probability: 0.5,
      },
      {
        look: "cl",
        point: "cp",
        probability: 0.5,
      },
    ]);
  });
});
