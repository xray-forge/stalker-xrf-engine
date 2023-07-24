import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registry } from "@/engine/core/database";
import { ActorInventoryMenuManager } from "@/engine/core/managers/interface/ActorInventoryMenuManager";
import { AnyCallable, EActorMenuMode } from "@/engine/lib/types";
import { gameConsole } from "@/fixtures/xray/mocks/console.mock";

describe("ActorInventoryMenuManager class", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
  });

  it("should correctly initialize", () => {
    const actorInventoryMenuManager: ActorInventoryMenuManager = ActorInventoryMenuManager.getInstance();

    expect(actorInventoryMenuManager.activeMode).toBe(EActorMenuMode.UNDEFINED);

    // Quick slots init.
    expect(gameConsole.execute).toHaveBeenCalledTimes(4);
    expect((gameConsole.execute as jest.MockedFunction<AnyCallable>).mock.calls).toEqual([
      ["slot_0 qi_1"],
      ["slot_1 qi_2"],
      ["slot_2 qi_3"],
      ["slot_3 qi_4"],
    ]);
  });

  it("should correctly change and check active mode", () => {
    const actorInventoryMenuManager: ActorInventoryMenuManager = ActorInventoryMenuManager.getInstance();

    expect(actorInventoryMenuManager.activeMode).toBe(EActorMenuMode.UNDEFINED);
    expect(actorInventoryMenuManager.isActiveMode(EActorMenuMode.UNDEFINED)).toBe(true);
    expect(actorInventoryMenuManager.isActiveMode(EActorMenuMode.TALK_DIALOG)).toBe(false);

    actorInventoryMenuManager.setActiveMode(EActorMenuMode.INVENTORY);
    expect(actorInventoryMenuManager.isActiveMode(EActorMenuMode.UNDEFINED)).toBe(false);
    expect(actorInventoryMenuManager.isActiveMode(EActorMenuMode.INVENTORY)).toBe(true);

    actorInventoryMenuManager.setActiveMode(EActorMenuMode.UNDEFINED);
    expect(actorInventoryMenuManager.isActiveMode(EActorMenuMode.UNDEFINED)).toBe(true);
    expect(actorInventoryMenuManager.isActiveMode(EActorMenuMode.INVENTORY)).toBe(false);

    actorInventoryMenuManager.setActiveMode(EActorMenuMode.TALK_DIALOG_SHOW);
    expect(actorInventoryMenuManager.isActiveMode(EActorMenuMode.UNDEFINED)).toBe(false);
    expect(actorInventoryMenuManager.isActiveMode(EActorMenuMode.TALK_DIALOG)).toBe(true);

    actorInventoryMenuManager.setActiveMode(EActorMenuMode.TALK_DIALOG_HIDE);
    expect(actorInventoryMenuManager.isActiveMode(EActorMenuMode.UNDEFINED)).toBe(true);
    expect(actorInventoryMenuManager.isActiveMode(EActorMenuMode.TALK_DIALOG)).toBe(false);
  });
});
