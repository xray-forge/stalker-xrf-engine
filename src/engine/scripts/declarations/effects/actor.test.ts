import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game } from "xray16";

import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { giveItemsToActor } from "@/engine/core/utils/reward";
import { TRUE } from "@/engine/lib/constants/words";
import { callXrEffect, checkXrEffect, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

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
    checkXrEffect("set_torch_state");
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
});
