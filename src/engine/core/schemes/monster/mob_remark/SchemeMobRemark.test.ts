import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { ISchemeMobRemarkState } from "@/engine/core/schemes/monster/mob_remark/mob_remark_types";
import { MobRemarkManager } from "@/engine/core/schemes/monster/mob_remark/MobRemarkManager";
import { SchemeMobRemark } from "@/engine/core/schemes/monster/mob_remark/SchemeMobRemark";
import { getConfigSwitchConditions, parseConditionsList } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeMobRemark", () => {
  it("should correctly activate with defaults", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "mob_remark@test": {},
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMobRemark);

    const state: ISchemeMobRemarkState = SchemeMobRemark.activate(object, ini, EScheme.MOB_REMARK, "mob_remark@test");

    expect(state.logic).toEqualLuaTables({});
    expect(state.state).toBeNull();
    expect(state.dialogCondition).toBeNull();
    expect(state.noReset).toBe(true);
    expect(state.anim).toBeNull();
    expect(state.animationMovement).toBe(false);
    expect(state.animationHead).toBeNull();
    expect(state.tip).toBeNull();
    expect(state.snd).toBeNull();
    expect(state.time).toBeNull();

    assertSchemeSubscribedToManager(state, MobRemarkManager);
  });

  it("should correctly activate with overrides", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "mob_remark@test": {
        on_info: "{+test} first, second",
        state: "invis",
        dialog_cond: "{+test} first, second",
        anim: "test_anim",
        anim_movement: true,
        anim_head: "test_anim_head",
        tip: "test_tip",
        snd: "test_snd",
        time: "test_time",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMobRemark);

    const state: ISchemeMobRemarkState = SchemeMobRemark.activate(object, ini, EScheme.MOB_REMARK, "mob_remark@test");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "mob_remark@test"));
    expect(state.state).toBe("invis");

    expect(state.noReset).toBe(true);
    expect(state.anim).toBe("test_anim");
    expect(state.animationMovement).toBe(true);
    expect(state.animationHead).toBe("test_anim_head");
    expect(state.tip).toBe("test_tip");
    expect(state.snd).toBe("test_snd");
    expect(state.time).toBe("test_time");
    expect(state.dialogCondition).toEqualLuaTables({
      name: "dialog_cond",
      condlist: parseConditionsList("{+test} first, second"),
      objectId: null,
      p1: null,
      p2: null,
    });

    assertSchemeSubscribedToManager(state, MobRemarkManager);
  });
});
