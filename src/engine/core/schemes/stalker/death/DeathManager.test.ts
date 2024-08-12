import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death/death_types";
import { DeathManager } from "@/engine/core/schemes/stalker/death/DeathManager";
import { parseConditionsList, pickSectionFromCondList } from "@/engine/core/utils/ini";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/ini/ini_config");

describe("DeathManager", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
  });

  it("should correctly handle death event without killer", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeDeathState = mockSchemeState(EScheme.DEATH, {});
    const manager: DeathManager = new DeathManager(object, state);

    const objectState: IRegistryObjectState = registerObject(object);

    objectState[EScheme.DEATH] = state;

    manager.onDeath(object, null);

    expect(state.killerId).toBe(-1);
    expect(pickSectionFromCondList).toHaveBeenCalledTimes(0);
  });

  it("should correctly handle death event", () => {
    const object: GameObject = MockGameObject.mock();
    const killer: GameObject = MockGameObject.mock();
    const state: ISchemeDeathState = mockSchemeState(EScheme.DEATH, {});
    const manager: DeathManager = new DeathManager(object, state);

    const objectState: IRegistryObjectState = registerObject(object);

    objectState[EScheme.DEATH] = state;
    state.info = parseConditionsList("test-1");
    state.info2 = parseConditionsList("test-2");
    manager.onDeath(object, killer);

    expect(state.killerId).toBe(killer.id());
    expect(pickSectionFromCondList).toHaveBeenCalledTimes(2);
    expect(pickSectionFromCondList).toHaveBeenCalledWith(registry.actor, object, state.info);
    expect(pickSectionFromCondList).toHaveBeenCalledWith(registry.actor, object, state.info2);
  });
});
