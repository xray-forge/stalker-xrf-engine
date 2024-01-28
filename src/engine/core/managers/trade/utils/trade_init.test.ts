import { describe, expect, it } from "@jest/globals";

import { tradeConfig } from "@/engine/core/managers/trade/TradeConfig";
import { readObjectTradeIniPath } from "@/engine/core/managers/trade/utils/trade_init";
import { IniFile } from "@/engine/lib/types";
import { MockIniFile } from "@/fixtures/xray";

describe("trade_init utils", () => {
  it("readObjectTradeIniPath should correctly read object ini", () => {
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      logic_default: {
        trade: tradeConfig.DEFAULT_TRADE_LTX_PATH,
      },
      logic_custom: {
        trade: "custom.ltx",
      },
      logic: {},
    });

    expect(readObjectTradeIniPath(ini, "")).toBe(tradeConfig.DEFAULT_TRADE_LTX_PATH);
    expect(readObjectTradeIniPath(ini, "test")).toBe(tradeConfig.DEFAULT_TRADE_LTX_PATH);
    expect(readObjectTradeIniPath(ini, "logic")).toBe(tradeConfig.DEFAULT_TRADE_LTX_PATH);
    expect(readObjectTradeIniPath(ini, "logic_default")).toBe(tradeConfig.DEFAULT_TRADE_LTX_PATH);
    expect(readObjectTradeIniPath(ini, "logic_custom")).toBe("custom.ltx");
  });
});
