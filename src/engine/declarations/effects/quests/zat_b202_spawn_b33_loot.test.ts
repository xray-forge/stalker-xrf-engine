import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerStoryLink } from "@/engine/core/database";
import { spawnObjectInObject } from "@/engine/core/utils/spawn";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/zat_b202_spawn_b33_loot");
});

jest.mock("@/engine/core/utils/spawn");

beforeEach(() => {
  resetRegistry();
});

describe("zat_b202_spawn_b33_loot", () => {
  it("should create every unclaimed reward in its target containers", () => {
    const stalkerBox: GameObject = MockGameObject.mock();
    const treasureBox: GameObject = MockGameObject.mock();

    registerStoryLink(stalkerBox.id(), "jup_b202_stalker_snag");
    registerStoryLink(treasureBox.id(), "jup_b202_snag_treasure");

    callXrEffect("zat_b202_spawn_b33_loot", MockGameObject.mockActor(), MockGameObject.mock());

    expect(spawnObjectInObject).toHaveBeenCalledWith("wpn_fort_snag", stalkerBox.id());
    expect(spawnObjectInObject).toHaveBeenCalledWith("af_soul", treasureBox.id());
    expect(spawnObjectInObject).toHaveBeenCalledWith("helm_hardhat_snag", treasureBox.id());
  });
});
