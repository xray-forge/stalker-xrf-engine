import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { SignalLightBinder } from "@/engine/core/binders/physic/SignalLightBinder";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import {
  isImmuneToSurgeSquad,
  isSurgeEnabledOnLevel,
  launchSurgeSignalRockets,
} from "@/engine/core/managers/surge/utils/surge_generic";
import { Squad } from "@/engine/core/objects/squad";
import { communities } from "@/engine/lib/constants/communities";
import { TName } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { MockLuaTable } from "@/fixtures/lua";
import { MockGameObject } from "@/fixtures/xray";

describe("launchSurgeSignalRockets util", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
  });

  it("should correctly launch rockets", () => {
    const first: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());
    const second: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());

    first.reinit();
    second.reinit();

    jest.spyOn(first, "startFly");
    jest.spyOn(second, "startFly");

    expect(first.isFlying()).toBe(false);
    expect(second.isFlying()).toBe(false);

    launchSurgeSignalRockets();

    expect(first.isFlying()).toBe(true);
    expect(second.isFlying()).toBe(true);

    expect(first.startFly).toHaveBeenCalledTimes(1);
    expect(first.startFly).toHaveBeenCalledTimes(1);

    launchSurgeSignalRockets();

    expect(first.startFly).toHaveBeenCalledTimes(1);
    expect(first.startFly).toHaveBeenCalledTimes(1);
  });
});

describe("isSurgeEnabledOnLevel util", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
  });

  it("should correctly check if surge is enabled for level", () => {
    surgeConfig.SURGE_DISABLED_LEVELS = MockLuaTable.mockFromObject<TName, boolean>({
      labx8: true,
      jupiter_underground: true,
    });

    expect(isSurgeEnabledOnLevel("zaton")).toBe(true);
    expect(isSurgeEnabledOnLevel("jupiter")).toBe(true);
    expect(isSurgeEnabledOnLevel("labx8")).toBe(false);
    expect(isSurgeEnabledOnLevel("jupiter_underground")).toBe(false);
  });
});

describe("isImmuneToSurgeObject util", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
  });

  it("should correctly check that objects are immune to surge", () => {
    surgeConfig.IMMUNE_SQUAD_COMMUNITIES = MockLuaTable.mockFromObject<TName, boolean>({
      [communities.monster_predatory_day]: true,
      [communities.monster_predatory_night]: true,
      [communities.monster_vegetarian]: true,
      [communities.monster_zombied_day]: true,
      [communities.monster_zombied_night]: true,
      [communities.monster_special]: true,
      [communities.monster]: true,
      [communities.zombied]: true,
    });

    expect(isImmuneToSurgeSquad({ faction: "monster_predatory_day" } as unknown as Squad)).toBe(true);
    expect(isImmuneToSurgeSquad({ faction: "monster_vegetarian" } as unknown as Squad)).toBe(true);
    expect(isImmuneToSurgeSquad({ faction: "monster_special" } as unknown as Squad)).toBe(true);
    expect(isImmuneToSurgeSquad({ faction: "monster" } as unknown as Squad)).toBe(true);
    expect(isImmuneToSurgeSquad({ faction: "zombied" } as unknown as Squad)).toBe(true);
    expect(isImmuneToSurgeSquad({ faction: "monster_zombied_day" } as unknown as Squad)).toBe(true);
    expect(isImmuneToSurgeSquad({ faction: "stalker" } as unknown as Squad)).toBe(false);
    expect(isImmuneToSurgeSquad({ faction: "bandit" } as unknown as Squad)).toBe(false);
    expect(isImmuneToSurgeSquad({ faction: "monolith" } as unknown as Squad)).toBe(false);
    expect(isImmuneToSurgeSquad({ faction: "army" } as unknown as Squad)).toBe(false);
  });
});
