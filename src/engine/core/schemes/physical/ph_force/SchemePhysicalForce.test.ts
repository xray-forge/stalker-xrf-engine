import { beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject, IniFile } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { registerObject } from "@/engine/core/database";
import { getConfigSwitchConditions } from "@/engine/core/ini";
import { ISchemePhysicalForceState } from "@/engine/core/schemes/physical/ph_force/ph_force_types";
import { PhysicalForceController } from "@/engine/core/schemes/physical/ph_force/PhysicalForceController";
import { SchemePhysicalForce } from "@/engine/core/schemes/physical/ph_force/SchemePhysicalForce";
import { loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { assertSchemeSubscribedToController, patrols, resetRegistry } from "@/fixtures/engine";

describe("SchemePhysicalForce", () => {
  beforeEach(() => {
    resetRegistry();
    loadSchemeImplementation(SchemePhysicalForce);
  });

  it("should correctly activate with data", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "ph_force@test": {
        on_info: "{+test} first, second",
        force: 100,
        time: 2000,
        delay: 500,
        point: "test-wp",
        point_index: 1,
      },
    });

    registerObject(object);

    const state: ISchemePhysicalForceState = SchemePhysicalForce.activate(
      object,
      ini,
      EScheme.PH_FORCE,
      "ph_force@test"
    );

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "ph_force@test"));
    expect(state.force).toBe(100);
    expect(state.time).toBe(2000);
    expect(state.delay).toBe(500);
    expect(state.point).toEqual(patrols["test-wp"].points[1].position);

    assertSchemeSubscribedToController(state, PhysicalForceController);
  });

  it("should correctly activate with defaults for delay and point index", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "ph_force@test": {
        force: 50,
        time: 1000,
        point: "test-wp",
      },
    });

    registerObject(object);

    const state: ISchemePhysicalForceState = SchemePhysicalForce.activate(
      object,
      ini,
      EScheme.PH_FORCE,
      "ph_force@test"
    );

    expect(state.delay).toBe(0);
    expect(state.point).toEqual(patrols["test-wp"].points[0].position);
  });

  it("should fail on invalid force", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "ph_force@test": {
        force: 0,
        time: 1000,
        point: "test-wp",
      },
    });

    registerObject(object);

    expect(() => SchemePhysicalForce.activate(object, ini, EScheme.PH_FORCE, "ph_force@test")).toThrow(
      "PH_FORCE : invalid force !"
    );
  });

  it("should fail on invalid time", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "ph_force@test": {
        force: 100,
        time: 0,
        point: "test-wp",
      },
    });

    registerObject(object);

    expect(() => SchemePhysicalForce.activate(object, ini, EScheme.PH_FORCE, "ph_force@test")).toThrow(
      "PH_FORCE : invalid time !"
    );
  });

  it("should fail on invalid waypoint name", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "ph_force@test": {
        force: 100,
        time: 1000,
        point: "",
      },
    });

    registerObject(object);

    expect(() => SchemePhysicalForce.activate(object, ini, EScheme.PH_FORCE, "ph_force@test")).toThrow(
      "PH_FORCE : invalid waypoint name !"
    );
  });

  it("should fail on out of bounds waypoint index", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "ph_force@test": {
        force: 100,
        time: 1000,
        point: "test-wp",
        point_index: 10,
      },
    });

    registerObject(object);

    expect(() => SchemePhysicalForce.activate(object, ini, EScheme.PH_FORCE, "ph_force@test")).toThrow(
      "PH_FORCE : invalid waypoint index"
    );
  });
});
