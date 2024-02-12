import { describe, expect, it } from "@jest/globals";

import { addRandomUpgrade, addRandomUpgrades } from "@/engine/core/managers/upgrades";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { GameObject } from "@/engine/lib/types";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

describe("addRandomUpgrade util", () => {
  it(" should correctly add random upgrade", () => {
    const first: GameObject = MockGameObject.mock();

    addRandomUpgrade(first);
    expect(first.add_upgrade).not.toHaveBeenCalled();

    const second: GameObject = MockGameObject.mock({ section: weapons.wpn_ak74u });

    addRandomUpgrade(second);
    expect(second.add_upgrade).toHaveBeenCalledTimes(1);

    addRandomUpgrade(second);
    expect(second.add_upgrade).toHaveBeenCalledTimes(2);

    const third: GameObject = MockGameObject.mock({ section: weapons.wpn_ak74u });

    addRandomUpgrades(third, Infinity);

    resetFunctionMock(third.add_upgrade);

    addRandomUpgrade(third);
    addRandomUpgrade(third);
    addRandomUpgrade(third);

    expect(third.add_upgrade).toHaveBeenCalledTimes(0);
  });
});

describe("addRandomUpgrades util", () => {
  it("should correctly add random upgrades", () => {
    const first: GameObject = MockGameObject.mock();

    addRandomUpgrades(first, 0);
    expect(first.add_upgrade).not.toHaveBeenCalled();

    const second: GameObject = MockGameObject.mock({ section: weapons.wpn_ak74u });

    addRandomUpgrades(second, 0);
    expect(second.add_upgrade).not.toHaveBeenCalled();

    addRandomUpgrades(second, 100);
    expect(second.add_upgrade).toHaveBeenCalledTimes(18);

    addRandomUpgrades(second, Infinity);
    expect(second.add_upgrade).toHaveBeenCalledTimes(18);
  });
});
