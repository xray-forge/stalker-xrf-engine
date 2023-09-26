import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { ISchemeMobJumpState } from "@/engine/core/schemes/monster/mob_jump/ISchemeMobJumpState";
import { SchemeMobJump } from "@/engine/core/schemes/monster/mob_jump/SchemeMobJump";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

describe("SchemeMobJump", () => {
  it("should correctly activate scheme with default values", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "mob_jump@test": {
        on_signal: "on_signal = anim_end | remark@kovalski_arch_2_answer",
        offset: "0,0,0",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMobJump);

    const state: ISchemeMobJumpState = SchemeMobJump.activate(
      object,
      ini,
      EScheme.MOB_JUMP,
      "mob_jump@test",
      "test_smart"
    );

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "mob_jump@test"));
    expect(state.phJumpFactor).toBe(1.8);
    expect(state.jumpPathName).toBeNull();
    expect(state.offset).toEqualLuaTables(ZERO_VECTOR);
  });

  it("should correctly activate scheme with custom values", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "mob_jump@test": {
        on_signal: "on_signal = anim_end | remark@kovalski_arch_2_answer",
        path_jump: "test_jump",
        ph_jump_factor: 15,
        offset: "1,2,3",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMobJump);

    const state: ISchemeMobJumpState = SchemeMobJump.activate(
      object,
      ini,
      EScheme.MOB_JUMP,
      "mob_jump@test",
      "test_smart"
    );

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "mob_jump@test"));
    expect(state.phJumpFactor).toBe(15);
    expect(state.jumpPathName).toBe("test_smart_test_jump");
    expect(state.offset).toEqualLuaTables(MockVector.mock(1, 2, 3));
  });

  it("should correctly throw if no on_signal supplied", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {});

    registerObject(object);
    loadSchemeImplementation(SchemeMobJump);

    expect(() => SchemeMobJump.activate(object, ini, EScheme.MOB_JUMP, "mob_jump@test", "test_smart")).toThrow();
  });
});
