import { describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { tradeConfig } from "@/engine/core/managers/trade/TradeConfig";
import { isObjectTrader } from "@/engine/core/managers/trade/utils/trade_check";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("isObjectTrader util", () => {
  it("should correctly check if object trade config is customized", () => {
    expect(isObjectTrader(-1)).toBe(false);

    const object: GameObject = MockGameObject.mock();

    expect(isObjectTrader(object.id())).toBe(false);

    const state: IRegistryObjectState = registerObject(object);

    expect(isObjectTrader(object.id())).toBe(false);

    state.ini = MockIniFile.mock("test.ltx", {
      logic_default: {
        trade: tradeConfig.DEFAULT_TRADE_LTX_PATH,
      },
      logic_custom: {
        trade: "custom.ltx",
      },
      logic: {},
    });

    expect(isObjectTrader(object.id())).toBe(false);

    state.sectionLogic = "logic";
    expect(isObjectTrader(object.id())).toBe(false);

    state.sectionLogic = "logic_default";
    expect(isObjectTrader(object.id())).toBe(false);

    state.sectionLogic = "logic_custom";
    expect(isObjectTrader(object.id())).toBe(true);
  });
});
