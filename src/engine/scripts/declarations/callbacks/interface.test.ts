import { beforeAll, describe, expect, it, jest } from "@jest/globals";

import { LoadScreenManager } from "@/engine/core/managers/interface/LoadScreenManager";
import { getExtern } from "@/engine/core/utils/binding";
import { AnyCallablesModule } from "@/engine/lib/types";
import { checkBinding } from "@/fixtures/engine";

describe("'interface' external callbacks", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/callbacks/interface");
  });

  it("should correctly inject external methods for game", () => {
    checkBinding("ui_wpn_params");
    checkBinding("pda");
    checkBinding("actor_menu_inventory");
    checkBinding("actor_menu");
    checkBinding("inventory_upgrades");
    checkBinding("loadscreen");
  });

  it("should correctly get tips from manager", () => {
    const loadScreenManager: LoadScreenManager = LoadScreenManager.getInstance();

    jest.spyOn(loadScreenManager, "getRandomMultiplayerTipIndex");
    jest.spyOn(loadScreenManager, "getRandomTipIndex");

    expect(typeof getExtern<AnyCallablesModule>("loadscreen").get_tip_number()).toBe("number");
    expect(typeof getExtern<AnyCallablesModule>("loadscreen").get_mp_tip_number()).toBe("number");

    expect(loadScreenManager.getRandomTipIndex).toHaveBeenCalledTimes(1);
    expect(loadScreenManager.getRandomMultiplayerTipIndex).toHaveBeenCalledTimes(1);
  });
});
