import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { UpgradesManager } from "@/engine/core/managers/upgrades";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/game/mech_discount");
});

beforeEach(() => {
  resetRegistry();
});

describe("mech_discount", () => {
  it("should update mechanic discounts", () => {
    const manager: UpgradesManager = getManager(UpgradesManager);

    jest.spyOn(manager, "setCurrentPriceDiscount").mockImplementation(jest.fn());

    callXrEffect("mech_discount", MockGameObject.mockActor(), MockGameObject.mock());

    expect(manager.setCurrentPriceDiscount).not.toHaveBeenCalled();

    callXrEffect("mech_discount", MockGameObject.mockActor(), MockGameObject.mock(), "not-number");

    expect(manager.setCurrentPriceDiscount).not.toHaveBeenCalled();

    callXrEffect("mech_discount", MockGameObject.mockActor(), MockGameObject.mock(), "15");

    expect(manager.setCurrentPriceDiscount).toHaveBeenCalledTimes(1);
    expect(manager.setCurrentPriceDiscount).toHaveBeenCalledWith(15);

    callXrEffect("mech_discount", MockGameObject.mockActor(), MockGameObject.mock(), 25);

    expect(manager.setCurrentPriceDiscount).toHaveBeenCalledTimes(2);
    expect(manager.setCurrentPriceDiscount).toHaveBeenCalledWith(25);
  });
});
