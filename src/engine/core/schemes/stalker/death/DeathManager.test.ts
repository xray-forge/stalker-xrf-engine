import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { parseConditionsList, pickSectionFromCondList } from "@/engine/core/ini";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death/death_types";
import { DeathManager } from "@/engine/core/schemes/stalker/death/DeathManager";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/ini/ini_config");

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

    setSchemeState(objectState, EScheme.DEATH, state);

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

    setSchemeState(objectState, EScheme.DEATH, state);
    state.info = parseConditionsList("test-1");
    state.info2 = parseConditionsList("test-2");
    manager.onDeath(object, killer);

    expect(state.killerId).toBe(killer.id());
    expect(pickSectionFromCondList).toHaveBeenCalledTimes(2);
    expect(pickSectionFromCondList).toHaveBeenCalledWith(registry.actor, object, state.info);
    expect(pickSectionFromCondList).toHaveBeenCalledWith(registry.actor, object, state.info2);
  });
});
