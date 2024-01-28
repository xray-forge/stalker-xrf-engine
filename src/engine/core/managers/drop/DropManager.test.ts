import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { disposeManager, getManager } from "@/engine/core/database";
import { DROP_MANAGER_CONFIG_LTX } from "@/engine/core/managers/drop/DropConfig";
import { DropManager } from "@/engine/core/managers/drop/DropManager";
import { createCorpseReleaseItems, readIniDropCountByLevel } from "@/engine/core/managers/drop/utils";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { GameObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/managers/drop/utils");

describe("DropManager", () => {
  beforeEach(() => {
    resetRegistry();

    resetFunctionMock(readIniDropCountByLevel);
    resetFunctionMock(createCorpseReleaseItems);
  });

  it("should correctly initialize and destroy", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    expect(readIniDropCountByLevel).not.toHaveBeenCalled();
    expect(eventsManager.getSubscribersCount()).toBe(0);

    getManager(DropManager);

    expect(eventsManager.getSubscribersCount()).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.STALKER_DEATH)).toBe(1);

    expect(readIniDropCountByLevel).toHaveBeenCalledTimes(1);
    expect(readIniDropCountByLevel).toHaveBeenCalledWith(DROP_MANAGER_CONFIG_LTX);

    disposeManager(DropManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly handle force items spawn", () => {
    const manager: DropManager = getManager(DropManager);
    const object: GameObject = MockGameObject.mock();

    manager.forceCorpseReleaseItemsSpawn(object);

    expect(createCorpseReleaseItems).toHaveBeenCalledTimes(1);
    expect(createCorpseReleaseItems).toHaveBeenLastCalledWith(object);
  });

  it("should correctly handle object death", () => {
    const manager: DropManager = getManager(DropManager);
    const object: GameObject = MockGameObject.mock();

    manager.onStalkerDeath(object);

    expect(createCorpseReleaseItems).toHaveBeenCalledTimes(1);
    expect(createCorpseReleaseItems).toHaveBeenLastCalledWith(object);
  });
});
