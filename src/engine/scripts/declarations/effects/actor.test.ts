import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game, patrol } from "xray16";

import { getManager, registerSimulator, registry } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { ENotificationDirection, NotificationManager } from "@/engine/core/managers/notifications";
import { giveItemsToActor } from "@/engine/core/utils/reward";
import { TRUE } from "@/engine/lib/constants/words";
import { GameObject, ServerObject } from "@/engine/lib/types";
import { callXrEffect, checkXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject, mockServerAlifeObject } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/reward", () => ({
  giveItemsToActor: jest.fn(),
}));

describe("actor effects declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/actor");
  });

  it("should correctly inject external methods for game", () => {
    checkXrEffect("disable_ui");
    checkXrEffect("disable_ui_only");
    checkXrEffect("enable_ui");
    checkXrEffect("disable_actor_nightvision");
    checkXrEffect("enable_actor_nightvision");
    checkXrEffect("disable_actor_torch");
    checkXrEffect("enable_actor_torch");
    checkXrEffect("run_tutorial");
    checkXrEffect("give_actor");
    checkXrEffect("remove_item");
    checkXrEffect("drop_object_item_on_point");
    checkXrEffect("relocate_item");
    checkXrEffect("activate_weapon_slot");
    checkXrEffect("save_actor_position");
    checkXrEffect("restore_actor_position");
    checkXrEffect("actor_punch");
    checkXrEffect("send_tip");
    checkXrEffect("give_task");
    checkXrEffect("set_active_task");
    checkXrEffect("kill_actor");
    checkXrEffect("make_actor_visible_to_squad");
    checkXrEffect("sleep");
    checkXrEffect("damage_actor_items_on_start");
    checkXrEffect("activate_weapon");
    checkXrEffect("give_treasure");
    checkXrEffect("get_best_detector");
    checkXrEffect("hide_best_detector");
  });
});

describe("actor effects implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/actor");
  });

  beforeEach(() => {
    resetRegistry();

    resetFunctionMock(game.start_tutorial);
    resetFunctionMock(giveItemsToActor);
  });

  it("disable_ui should correctly call manager methods", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(manager, "disableGameUi").mockImplementation(jest.fn());

    callXrEffect("disable_ui", MockGameObject.mockActor(), MockGameObject.mock());
    expect(manager.disableGameUi).toHaveBeenCalledWith(true);

    callXrEffect("disable_ui", MockGameObject.mockActor(), MockGameObject.mock(), TRUE);
    expect(manager.disableGameUi).toHaveBeenCalledWith(false);
  });

  it("disable_ui_only should correctly call manager methods", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(manager, "disableGameUiOnly").mockImplementation(jest.fn());

    callXrEffect("disable_ui_only", MockGameObject.mockActor(), MockGameObject.mock());
    expect(manager.disableGameUiOnly).toHaveBeenCalledTimes(1);
  });

  it("enable_ui should correctly call manager methods", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(manager, "enableGameUi").mockImplementation(jest.fn());

    callXrEffect("enable_ui", MockGameObject.mockActor(), MockGameObject.mock());
    expect(manager.enableGameUi).toHaveBeenCalledWith(true);

    callXrEffect("enable_ui", MockGameObject.mockActor(), MockGameObject.mock(), TRUE);
    expect(manager.enableGameUi).toHaveBeenCalledWith(false);
  });

  it("disable_actor_nightvision should correctly call manager methods", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(manager, "disableActorNightVision").mockImplementation(jest.fn());

    callXrEffect("disable_actor_nightvision", MockGameObject.mockActor(), MockGameObject.mock());
    expect(manager.disableActorNightVision).toHaveBeenCalledTimes(1);
  });

  it("enable_actor_nightvision should correctly call manager methods", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(manager, "enableActorNightVision").mockImplementation(jest.fn());

    callXrEffect("enable_actor_nightvision", MockGameObject.mockActor(), MockGameObject.mock());
    expect(manager.enableActorNightVision).toHaveBeenCalledTimes(1);
  });

  it("disable_actor_torch should correctly call manager methods", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(manager, "disableActorTorch").mockImplementation(jest.fn());

    callXrEffect("disable_actor_torch", MockGameObject.mockActor(), MockGameObject.mock());
    expect(manager.disableActorTorch).toHaveBeenCalledTimes(1);
  });

  it("enable_actor_torch should correctly call manager methods", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(manager, "enableActorTorch").mockImplementation(jest.fn());

    callXrEffect("enable_actor_torch", MockGameObject.mockActor(), MockGameObject.mock());
    expect(manager.enableActorTorch).toHaveBeenCalledTimes(1);
  });

  it("run_tutorial should correctly run tutorials", () => {
    callXrEffect("run_tutorial", MockGameObject.mockActor(), MockGameObject.mock(), "custom_tutorial");
    expect(game.start_tutorial).toHaveBeenCalledTimes(1);
    expect(game.start_tutorial).toHaveBeenCalledWith("custom_tutorial");
  });

  it("give_actor should give actor object list of items", () => {
    callXrEffect("give_actor", MockGameObject.mockActor(), MockGameObject.mock(), "first", "second");

    expect(giveItemsToActor).toHaveBeenCalledTimes(2);
    expect(giveItemsToActor).toHaveBeenCalledWith("first");
    expect(giveItemsToActor).toHaveBeenCalledWith("second");
  });

  it("remove_item should release items from actor inventory", () => {
    const notificationManager: NotificationManager = getManager(NotificationManager);
    const item: GameObject = MockGameObject.mock({ section: <T>() => "test_section" as T });
    const serverItem: ServerObject = mockServerAlifeObject({ id: item.id() });
    const { actorGameObject } = mockRegisteredActor({ inventory: [["test_section", item]] });

    jest.spyOn(notificationManager, "sendItemRelocatedNotification").mockImplementation(jest.fn());

    registerSimulator();

    expect(() => callXrEffect("remove_item", actorGameObject, MockGameObject.mock())).toThrow(
      "Wrong parameters in function 'remove_item'."
    );
    expect(() => callXrEffect("remove_item", actorGameObject, MockGameObject.mock(), "not_existing")).toThrow(
      "Actor has no item to remove with section 'not_existing'."
    );

    callXrEffect("remove_item", actorGameObject, MockGameObject.mock(), "test_section");

    expect(registry.simulator.release).toHaveBeenCalledTimes(1);
    expect(registry.simulator.release).toHaveBeenCalledWith(serverItem, true);
    expect(notificationManager.sendItemRelocatedNotification).toHaveBeenCalledTimes(1);
    expect(notificationManager.sendItemRelocatedNotification).toHaveBeenCalledWith(
      ENotificationDirection.OUT,
      "test_section"
    );
  });

  it("drop_object_item_on_point should drop objects on points", () => {
    const item: GameObject = MockGameObject.mock({ section: <T>() => "test_section" as T });
    const { actorGameObject } = mockRegisteredActor({ inventory: [["test_section", item]] });

    expect(() => {
      callXrEffect("drop_object_item_on_point", actorGameObject, MockGameObject.mock(), "not_existing", "patrol_path");
    }).toThrow("Actor has no item to drop with section 'not_existing'.");

    callXrEffect("drop_object_item_on_point", actorGameObject, MockGameObject.mock(), "test_section", "test-wp");

    expect(actorGameObject.drop_item_and_teleport).toHaveBeenCalledTimes(1);
    expect(actorGameObject.drop_item_and_teleport).toHaveBeenCalledWith(item, new patrol("test-wp").point(0));
  });

  it.todo("relocate_item should correctly relocate items from one object to another");

  it.todo("activate_weapon_slot should activate slots for actor");

  it.todo("save_actor_position should save actor position");

  it.todo("restore_actor_position should restore actor position");

  it.todo("actor_punch should punch actor by object");

  it.todo("send_tip should send notifications for actor");

  it.todo("give_task should give tasks for actor");

  it.todo("set_active_task should set tasks for actor");

  it.todo("kill_actor should kill actor");

  it.todo("make_actor_visible_to_squad should make actor visible for squad");

  it.todo("sleep should force actor to start sleeping");

  it.todo("damage_actor_items_on_start should correctly modify actor items on game start");

  it.todo("activate_weapon should change active actor item");

  it.todo("give_treasure should give actor treasure coordinates");

  it.todo("get_best_detector should force actor to select best detector");

  it.todo("hide_best_detector should force actor to hide best detector");
});
