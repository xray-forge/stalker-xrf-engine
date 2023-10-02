import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { ISchemeMobWalkerState } from "@/engine/core/schemes/monster/mob_walker/mob_walker_types";
import { MobWalkerManager } from "@/engine/core/schemes/monster/mob_walker/MobWalkerManager";
import { SchemeMobWalker } from "@/engine/core/schemes/monster/mob_walker/SchemeMobWalker";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeMobWalker", () => {
  it("should correctly activate with defaults", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "mob_walker@test": {
        path_walk: "test_walk",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMobWalker);

    const state: ISchemeMobWalkerState = SchemeMobWalker.activate(
      object,
      ini,
      EScheme.MOB_WALKER,
      "mob_walker@test",
      "test_smart"
    );

    expect(state.logic).toEqualLuaTables({});
    expect(state.state).toBeNull();
    expect(state.noReset).toBe(false);
    expect(state.pathWalk).toBe("test_smart_test_walk");
    expect(state.pathLook).toBeNull();
    expect(state.pathWalkInfo).toBeNull();
    expect(state.pathLookInfo).toBeNull();

    assertSchemeSubscribedToManager(state, MobWalkerManager);
  });

  it("should correctly activate with provided values", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "mob_walker@test": {
        on_info: "{+test} first, second",
        state: "nvis",
        path_walk: "test_walk",
        path_look: "test_look",
        no_reset: true,
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMobWalker);

    const state: ISchemeMobWalkerState = SchemeMobWalker.activate(
      object,
      ini,
      EScheme.MOB_WALKER,
      "mob_walker@test",
      "test_smart"
    );

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "mob_walker@test"));
    expect(state.state).toBe("nvis");
    expect(state.noReset).toBe(true);
    expect(state.pathWalk).toBe("test_smart_test_walk");
    expect(state.pathLook).toBe("test_smart_test_look");
    expect(state.pathWalkInfo).toBeNull();
    expect(state.pathLookInfo).toBeNull();

    assertSchemeSubscribedToManager(state, MobWalkerManager);
  });

  it("should correctly fail on same look and walk path", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "mob_walker@test": {
        path_walk: "test_walk",
        path_look: "test_walk",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMobWalker);

    expect(() => SchemeMobWalker.activate(object, ini, EScheme.MOB_WALKER, "mob_walker@test", "test_smart")).toThrow();
  });
});
