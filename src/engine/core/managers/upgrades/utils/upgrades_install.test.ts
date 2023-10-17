import { describe, expect, it } from "@jest/globals";

import { addRandomUpgrade, addRandomUpgrades } from "@/engine/core/managers/upgrades";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { ClientObject } from "@/engine/lib/types";
import { resetFunctionMock } from "@/fixtures/jest";
import { mockClientGameObject } from "@/fixtures/xray";

describe("upgrades_install utils", () => {
  it("addRandomUpgrade should correctly add random upgrade", () => {
    const first: ClientObject = mockClientGameObject();

    addRandomUpgrade(first);
    expect(first.add_upgrade).not.toHaveBeenCalled();

    const second: ClientObject = mockClientGameObject({ section: <T>() => weapons.wpn_ak74u as T });

    addRandomUpgrade(second);
    expect(second.add_upgrade).toHaveBeenCalledTimes(1);

    addRandomUpgrade(second);
    expect(second.add_upgrade).toHaveBeenCalledTimes(2);

    const third: ClientObject = mockClientGameObject({ section: <T>() => weapons.wpn_ak74u as T });

    addRandomUpgrades(third, Infinity);

    resetFunctionMock(third.add_upgrade);

    addRandomUpgrade(third);
    addRandomUpgrade(third);
    addRandomUpgrade(third);

    expect(third.add_upgrade).toHaveBeenCalledTimes(0);
  });

  it("addRandomUpgrade should correctly add random upgrades", () => {
    const first: ClientObject = mockClientGameObject();

    addRandomUpgrades(first, 0);
    expect(first.add_upgrade).not.toHaveBeenCalled();

    const second: ClientObject = mockClientGameObject({ section: <T>() => weapons.wpn_ak74u as T });

    addRandomUpgrades(second, 0);
    expect(second.add_upgrade).not.toHaveBeenCalled();

    addRandomUpgrades(second, 100);
    expect(second.add_upgrade).toHaveBeenCalledTimes(18);

    addRandomUpgrades(second, Infinity);
    expect(second.add_upgrade).toHaveBeenCalledTimes(18);
  });
});
