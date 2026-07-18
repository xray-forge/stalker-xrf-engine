import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";
import { GameObject } from "xray16/alias";
import { TName } from "xray16/lib";
import { $fromObject } from "xray16/macros";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { NotificationManager } from "@/engine/core/managers/notifications";
import { ISchemeMobRemarkState } from "@/engine/core/schemes/monster/mob_remark/mob_remark_types";
import { MobRemarkManager } from "@/engine/core/schemes/monster/mob_remark/MobRemarkManager";
import { EScheme } from "@/engine/core/schemes/types";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { EMonsterState } from "@/engine/lib/constants/monsters";
import { mockBaseSchemeLogic, mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("MobRemarkManager", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock({ clsid: clsid.bloodsucker_s });
    const state: ISchemeMobRemarkState = mockSchemeState<ISchemeMobRemarkState>(EScheme.MOB_REMARK, {
      signals: $fromObject<TName, boolean>({ a: true }),
      state: EMonsterState.INVISIBLE,
      anim: "example1, example2",
      time: "255, 0",
      animationMovement: true,
    });
    const manager: MobRemarkManager = new MobRemarkManager(object, state);

    manager.activate();

    expect(state.signals).toEqualLuaTables({});
    expect(manager.isTipSent).toBe(false);
    expect(manager.isActionEndSignalled).toBe(false);

    expect(object.disable_talk).toHaveBeenCalledTimes(1);
    expect(object.set_invisible).toHaveBeenCalledWith(true);
    expect(object.script).toHaveBeenCalledWith(true, "xrf");
    expect(object.command).toHaveBeenCalledTimes(2);
  });

  it("should correctly update", () => {
    const object: GameObject = MockGameObject.mock({ clsid: clsid.bloodsucker_s });
    const state: ISchemeMobRemarkState = mockSchemeState<ISchemeMobRemarkState>(EScheme.MOB_REMARK, {
      signals: $fromObject<TName, boolean>({ a: true }),
      state: EMonsterState.INVISIBLE,
      anim: "example1, example2",
      time: "255, 0",
      tip: "test_tip",
      dialogCondition: mockBaseSchemeLogic({
        condlist: parseConditionsList("true"),
      }),
      animationMovement: true,
    });
    const manager: MobRemarkManager = new MobRemarkManager(object, state);
    const notificationManager: NotificationManager = getManager(NotificationManager);

    jest.spyOn(object, "get_script").mockImplementation(() => true);
    jest.spyOn(notificationManager, "sendTipNotification").mockImplementation(jest.fn());

    manager.activate();
    manager.update();

    expect(manager.isTipSent).toBe(true);
    expect(manager.isActionEndSignalled).toBe(true);
    expect(state.signals).toEqualLuaTables({ action_end: true });
    expect(object.enable_talk).toHaveBeenCalledTimes(1);
    expect(notificationManager.sendTipNotification).toHaveBeenCalledWith("test_tip");
  });
});
