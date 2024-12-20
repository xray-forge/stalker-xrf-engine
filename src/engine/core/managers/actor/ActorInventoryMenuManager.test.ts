import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager } from "@/engine/core/database";
import { actorConfig } from "@/engine/core/managers/actor/ActorConfig";
import { ActorInventoryMenuManager } from "@/engine/core/managers/actor/ActorInventoryMenuManager";
import { AnyCallable, Console, EActorMenuMode, EActorMenuType } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockConsole, MockGameObject } from "@/fixtures/xray";

describe("ActorInventoryMenuManager", () => {
  beforeEach(() => {
    resetRegistry();

    MockConsole.reset();

    actorConfig.ACTOR_MENU_MODE = EActorMenuMode.UNDEFINED;
  });

  it("should correctly initialize", () => {
    const console: Console = MockConsole.getInstanceMock();
    const manager: ActorInventoryMenuManager = getManager(ActorInventoryMenuManager);

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

  it("should correctly set and check active mode", () => {
    const manager: ActorInventoryMenuManager = getManager(ActorInventoryMenuManager);

    expect(actorConfig.ACTOR_MENU_MODE).toBe(EActorMenuMode.UNDEFINED);
    expect(manager.isActiveMode(EActorMenuMode.UNDEFINED)).toBe(true);
    expect(manager.isActiveMode(EActorMenuMode.TALK_DIALOG)).toBe(false);

    manager.setActiveMode(EActorMenuMode.INVENTORY);
    expect(manager.isActiveMode(EActorMenuMode.UNDEFINED)).toBe(false);
    expect(manager.isActiveMode(EActorMenuMode.INVENTORY)).toBe(true);

    manager.setActiveMode(EActorMenuMode.UNDEFINED);
    expect(manager.isActiveMode(EActorMenuMode.UNDEFINED)).toBe(true);
    expect(manager.isActiveMode(EActorMenuMode.INVENTORY)).toBe(false);

    manager.setActiveMode(EActorMenuMode.TALK_DIALOG_SHOW);
    expect(manager.isActiveMode(EActorMenuMode.UNDEFINED)).toBe(false);
    expect(manager.isActiveMode(EActorMenuMode.TALK_DIALOG)).toBe(true);

    manager.setActiveMode(EActorMenuMode.TALK_DIALOG_HIDE);
    expect(manager.isActiveMode(EActorMenuMode.UNDEFINED)).toBe(true);
    expect(manager.isActiveMode(EActorMenuMode.TALK_DIALOG)).toBe(false);
  });

  it("should correctly open actor menu", () => {
    const manager: ActorInventoryMenuManager = getManager(ActorInventoryMenuManager);

    jest.spyOn(manager, "onWindowOpen").mockImplementation(jest.fn());

    manager.openActorMenu(EActorMenuMode.INVENTORY);

    expect(actorConfig.ACTOR_MENU_MODE).toBe(EActorMenuMode.INVENTORY);
    expect(manager.onWindowOpen).toHaveBeenCalledWith(EActorMenuMode.INVENTORY);

    manager.openActorMenu(EActorMenuMode.TALK_DIALOG_SHOW);

    expect(actorConfig.ACTOR_MENU_MODE).toBe(EActorMenuMode.TALK_DIALOG);
    expect(manager.onWindowOpen).toHaveBeenCalledWith(EActorMenuMode.TALK_DIALOG_SHOW);
  });

  it("should correctly close actor menu", () => {
    const manager: ActorInventoryMenuManager = getManager(ActorInventoryMenuManager);

    jest.spyOn(manager, "onWindowClosed").mockImplementation(jest.fn());

    actorConfig.ACTOR_MENU_MODE = EActorMenuMode.DEAD_BODY_SEARCH;
    manager.closeActorMenu();

    expect(actorConfig.ACTOR_MENU_MODE).toBe(EActorMenuMode.UNDEFINED);
    expect(manager.onWindowClosed).toHaveBeenCalledWith(EActorMenuMode.DEAD_BODY_SEARCH);

    actorConfig.ACTOR_MENU_MODE = EActorMenuMode.TALK_DIALOG_HIDE;
    manager.closeActorMenu();

    expect(actorConfig.ACTOR_MENU_MODE).toBe(EActorMenuMode.UNDEFINED);
    expect(manager.onWindowClosed).toHaveBeenCalledWith(EActorMenuMode.TALK_DIALOG);
  });

  it("should correctly handle item focus receive event", () => {
    expect(() => {
      getManager(ActorInventoryMenuManager).onItemFocusReceived(MockGameObject.mock());
    }).not.toThrow();
  });

  it("should correctly handle item focus lost event", () => {
    expect(() => {
      getManager(ActorInventoryMenuManager).onItemFocusLost(MockGameObject.mock());
    }).not.toThrow();
  });

  it("should correctly handle drop item event", () => {
    expect(() => {
      getManager(ActorInventoryMenuManager).onItemDropped(
        MockGameObject.mock(),
        MockGameObject.mock(),
        EActorMenuType.ACTOR_BAG,
        EActorMenuType.ACTOR_BELT
      );
    }).not.toThrow();
  });

  it("should correctly handle open actor menu event", () => {
    expect(() => {
      getManager(ActorInventoryMenuManager).onWindowOpen(EActorMenuMode.TALK_DIALOG);
    }).not.toThrow();
  });

  it("should correctly handle close actor menu event", () => {
    expect(() => {
      getManager(ActorInventoryMenuManager).onWindowClosed(EActorMenuMode.TALK_DIALOG);
    }).not.toThrow();
  });
});
