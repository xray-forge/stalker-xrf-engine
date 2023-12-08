import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager } from "@/engine/core/database";
import { actorConfig } from "@/engine/core/managers/actor/ActorConfig";
import { ActorInventoryMenuManager } from "@/engine/core/managers/actor/ActorInventoryMenuManager";
import { AnyCallable, Console, EActorMenuMode } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockConsole } from "@/fixtures/xray";

describe("ActorInventoryMenuManager class", () => {
  beforeEach(() => {
    resetRegistry();

    MockConsole.reset();

    actorConfig.ACTOR_MENU_MODE = EActorMenuMode.UNDEFINED;
  });

  it("should correctly initialize", () => {
    const console: Console = MockConsole.getInstanceMock();
    const actorInventoryMenuManager: ActorInventoryMenuManager = getManager(ActorInventoryMenuManager);

    expect(actorConfig.ACTOR_MENU_MODE).toBe(EActorMenuMode.UNDEFINED);

    // Quick slots init.
    expect(console.execute).toHaveBeenCalledTimes(4);
    expect((console.execute as jest.MockedFunction<AnyCallable>).mock.calls).toEqual([
      ["slot_0 qi_1"],
      ["slot_1 qi_2"],
      ["slot_2 qi_3"],
      ["slot_3 qi_4"],
    ]);
  });

  it("should correctly change and check active mode", () => {
    const actorInventoryMenuManager: ActorInventoryMenuManager = getManager(ActorInventoryMenuManager);

    expect(actorConfig.ACTOR_MENU_MODE).toBe(EActorMenuMode.UNDEFINED);
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

  it.todo("should correctly handle open actor menu event");

  it.todo("should correctly handle close actor menu event");
});
