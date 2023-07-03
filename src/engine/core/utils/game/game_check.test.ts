import { describe, expect, it } from "@jest/globals";
import { alife } from "xray16";

import { isGameStarted } from "@/engine/core/utils/game/game_check";
import { replaceFunctionMock } from "@/fixtures/utils";
import { mockAlifeSimulator } from "@/fixtures/xray";

describe("game_check utils", () => {
  it("'isGameStarted' should check alife", () => {
    replaceFunctionMock(alife, () => null);
    expect(isGameStarted()).toBe(false);

    replaceFunctionMock(alife, mockAlifeSimulator);
    expect(isGameStarted()).toBe(true);
  });
});
