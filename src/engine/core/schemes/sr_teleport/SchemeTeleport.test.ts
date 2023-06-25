import { describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { ISchemeTeleportState } from "@/engine/core/schemes/sr_teleport/ISchemeTeleportState";
import { SchemeTeleport } from "@/engine/core/schemes/sr_teleport/SchemeTeleport";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme/setup";
import { ClientObject, EScheme, ESchemeType, IniFile } from "@/engine/lib/types";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeTeleport functionality", () => {
  it("should be correctly defined", () => {
    expect(SchemeTeleport.SCHEME_SECTION).toBe("sr_teleport");
    expect(SchemeTeleport.SCHEME_SECTION).toBe(EScheme.SR_TELEPORT);
    expect(SchemeTeleport.SCHEME_TYPE).toBe(ESchemeType.RESTRICTOR);
  });

  it("should correctly activate scheme", () => {
    const object: ClientObject = mockClientGameObject();
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

    SchemeTeleport.activate(object, ini, SchemeTeleport.SCHEME_SECTION, "sr_teleport@test");

    const state: IRegistryObjectState = registry.objects.get(object.id());
    const schemeState: ISchemeTeleportState = state[EScheme.SR_TELEPORT] as ISchemeTeleportState;

    expect(schemeState.ini).toBe(ini);
    expect(schemeState.scheme).toBe("sr_teleport");
    expect(schemeState.section).toBe("sr_teleport@test");
    expect(schemeState.logic?.length()).toBe(0);
    expect(schemeState.actions?.length()).toBe(1);

    expect(schemeState.timeout).toBe(500);
    expect(schemeState.maxTotalProbability).toBe(2);
    expect(schemeState.points.length()).toBe(3);
    expect(schemeState.points).toEqualLuaArrays([
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
