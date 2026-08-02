import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { spawnObjectInObject } from "@/engine/core/utils/spawn";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/zat_b202_spawn_random_loot");
});

jest.mock("@/engine/core/utils/spawn");

beforeEach(() => {
  resetRegistry();
});

describe("zat_b202_spawn_random_loot", () => {
  it("should select weighted loot groups without selecting a group twice", () => {
    const random = jest.spyOn(math, "random");

    random
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(3)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(4)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(5)
      .mockReturnValueOnce(1);

    callXrEffect("zat_b202_spawn_random_loot", MockGameObject.mockActor(), MockGameObject.mock());

    expect(spawnObjectInObject).toHaveBeenCalledTimes(19);
    expect(spawnObjectInObject).toHaveBeenNthCalledWith(1, "bandage", null);
    expect(spawnObjectInObject).toHaveBeenNthCalledWith(19, "ammo_9x39_ap", null);

    random.mockRestore();
  });
});
