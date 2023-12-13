import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game, patrol } from "xray16";

import {
  getManager,
  registerObject,
  registerSimulator,
  registerStoryLink,
  registerZone,
  registry,
} from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { ENotificationDirection, NotificationManager } from "@/engine/core/managers/notifications";
import { SleepManager } from "@/engine/core/managers/sleep";
import { TaskManager } from "@/engine/core/managers/tasks";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { objectPunchActor } from "@/engine/core/utils/action";
import { giveItemsToActor } from "@/engine/core/utils/reward";
import { detectors } from "@/engine/lib/constants/items/detectors";
import { helmets } from "@/engine/lib/constants/items/helmets";
import { outfits } from "@/engine/lib/constants/items/outfits";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { storyNames } from "@/engine/lib/constants/story_names";
import { TRUE } from "@/engine/lib/constants/words";
import { EActiveItemSlot, GameObject, GameTask, ServerObject, Vector } from "@/engine/lib/types";
import { callXrEffect, checkXrEffect, mockRegisteredActor, MockSquad, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockAlifeHumanStalker, MockCGameTask, MockGameObject, mockServerAlifeObject } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/action");

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
    checkXrEffect("restore_actor_position");
    checkXrEffect("save_actor_position");
    checkXrEffect("actor_punch");
    checkXrEffect("send_tip");
    checkXrEffect("give_task");
    checkXrEffect("set_active_task");
    checkXrEffect("kill_actor");
    checkXrEffect("make_actor_visible_to_squad");
    checkXrEffect("sleep");
    checkXrEffect("activate_weapon");
    checkXrEffect("give_treasure");
    checkXrEffect("get_best_detector");
    checkXrEffect("hide_best_detector");
    checkXrEffect("damage_actor_items_on_start");
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
    resetFunctionMock(objectPunchActor);
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

  it("relocate_item should correctly relocate items from one object to another", () => {
    registerSimulator();

    const item: GameObject = MockGameObject.mock({ sectionOverride: weapons.wpn_svu });
    const from: GameObject = MockGameObject.mock({ inventory: [[item.section(), item]] });
    const to: GameObject = MockGameObject.mock();

    registerStoryLink(from.id(), "from-sid");
    registerStoryLink(to.id(), "to-sid");

    expect(() => callXrEffect("relocate_item", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Couldn't relocate item to not existing object 'nil' in 'relocate_item' effect."
    );

    callXrEffect("relocate_item", MockGameObject.mockActor(), MockGameObject.mock(), "unknown", "from-sid", "to-sid");

    expect(from.transfer_item).toHaveBeenCalledTimes(0);
    expect(registry.simulator.create).toHaveBeenCalledTimes(1);
    expect(registry.simulator.create).toHaveBeenCalledWith(
      "unknown",
      to.position(),
      to.level_vertex_id(),
      to.game_vertex_id(),
      to.id()
    );

    callXrEffect(
      "relocate_item",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      weapons.wpn_svu,
      "from-sid",
      "to-sid"
    );

    expect(registry.simulator.create).toHaveBeenCalledTimes(1);
    expect(from.transfer_item).toHaveBeenCalledTimes(1);
    expect(from.transfer_item).toHaveBeenCalledWith(item, to);
  });

  it("activate_weapon_slot should activate slots for actor", () => {
    const actor: GameObject = MockGameObject.mockActor();

    expect(() => callXrEffect("activate_weapon_slot", actor, MockGameObject.mock())).toThrow(
      "Expected weapon slot to be provided as parameter in effect 'activate_weapon_slot'."
    );

    callXrEffect("activate_weapon_slot", actor, MockGameObject.mock(), EActiveItemSlot.PRIMARY);

    expect(actor.activate_slot).toHaveBeenCalledTimes(1);
    expect(actor.activate_slot).toHaveBeenCalledWith(EActiveItemSlot.PRIMARY);
  });

  it("restore_actor_position should restore actor position", () => {
    const { actorGameObject } = mockRegisteredActor();

    const position: Vector = actorGameObject.position();

    expect(() => callXrEffect("restore_actor_position", actorGameObject, MockGameObject.mock())).toThrow(
      "Trying to restore actor position with effect while not saved previous one."
    );

    callXrEffect("save_actor_position", actorGameObject, MockGameObject.mock());
    callXrEffect("restore_actor_position", actorGameObject, MockGameObject.mock());

    expect(actorGameObject.set_actor_position).toHaveBeenCalledTimes(1);
    expect(actorGameObject.set_actor_position).toHaveBeenCalledWith(position);
  });

  it("save_actor_position should save actor position", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(() => callXrEffect("save_actor_position", actorGameObject, MockGameObject.mock())).not.toThrow();
  });

  it("actor_punch should punch actor by object", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("actor_punch", MockGameObject.mockActor(), object);

    expect(objectPunchActor).toHaveBeenCalledWith(object);
  });

  it("send_tip should send notifications for actor", () => {
    const manager: NotificationManager = getManager(NotificationManager);

    jest.spyOn(manager, "sendTipNotification").mockImplementation(jest.fn());

    expect(() => callXrEffect("send_tip", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Expected caption to be provided for sent_tip effect."
    );

    callXrEffect(
      "send_tip",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "test-caption",
      "test-icon",
      "test-sender"
    );

    expect(manager.sendTipNotification).toHaveBeenCalledTimes(1);
    expect(manager.sendTipNotification).toHaveBeenCalledWith("test-caption", "test-icon", 0, null, "test-sender");
  });

  it("give_task should give tasks for actor", () => {
    const manager: TaskManager = getManager(TaskManager);

    jest.spyOn(manager, "giveTask").mockImplementation(jest.fn());

    expect(() => callXrEffect("give_task", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "No task id parameter in give_task effect."
    );

    callXrEffect("give_task", MockGameObject.mockActor(), MockGameObject.mock(), "test-task-id");

    expect(manager.giveTask).toHaveBeenCalledTimes(1);
    expect(manager.giveTask).toHaveBeenCalledWith("test-task-id");
  });

  it("set_active_task should set tasks for actor", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const task: GameTask = MockCGameTask.mock();

    jest.spyOn(actor, "get_task").mockImplementation((taskId) => (taskId === "test-task" ? task : null));

    callXrEffect("set_active_task", actor, MockGameObject.mock(), "no-task");

    expect(actor.get_task).toHaveBeenCalledWith("no-task", true);
    expect(actor.set_active_task).not.toHaveBeenCalled();

    callXrEffect("set_active_task", actor, MockGameObject.mock(), "test-task");

    expect(actor.get_task).toHaveBeenCalledWith("test-task", true);
    expect(actor.set_active_task).toHaveBeenCalledTimes(1);
    expect(actor.set_active_task).toHaveBeenCalledWith(task);
  });

  it("kill_actor should kill actor", () => {
    const actor: GameObject = MockGameObject.mockActor();

    callXrEffect("kill_actor", actor, MockGameObject.mock());

    expect(actor.kill).toHaveBeenCalledTimes(1);
    expect(actor.kill).toHaveBeenCalledWith(actor);
  });

  it("make_actor_visible_to_squad should make actor visible for squad", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const squad: MockSquad = MockSquad.mock();
    const firstServer: MockAlifeHumanStalker = MockAlifeHumanStalker.create();
    const firstGame: GameObject = MockGameObject.mock({ idOverride: firstServer.id });
    const secondServer: MockAlifeHumanStalker = MockAlifeHumanStalker.create();
    const secondGame: GameObject = MockGameObject.mock({ idOverride: secondServer.id });

    registerSimulator();
    registerObject(firstGame);
    registerStoryLink(squad.id, "test-sid");

    squad.mockAddMember(firstServer);
    squad.mockAddMember(secondServer);

    expect(() => callXrEffect("make_actor_visible_to_squad", actor, MockGameObject.mock(), "not-existing")).toThrow(
      "There is no squad with story id - 'not-existing'."
    );

    callXrEffect("make_actor_visible_to_squad", actor, MockGameObject.mock(), "test-sid");

    expect(firstGame.make_object_visible_somewhen).toHaveBeenCalledWith(actor);
    expect(secondGame.make_object_visible_somewhen).toHaveBeenCalledWith(actor);
  });

  it("sleep should show sleep dialog", () => {
    mockRegisteredActor();

    const manager: SleepManager = getManager(SleepManager);

    jest.spyOn(manager, "showSleepDialog").mockImplementation(jest.fn());

    callXrEffect("sleep", MockGameObject.mockActor(), MockGameObject.mock());

    expect(manager.showSleepDialog).not.toHaveBeenCalled();

    registerZone(MockGameObject.mock({ name: () => storyNames.zat_a2_sr_sleep, inside: () => false }));
    registerZone(MockGameObject.mock({ name: () => storyNames.pri_a16_sr_sleep, inside: () => true }));

    callXrEffect("sleep", MockGameObject.mockActor(), MockGameObject.mock());

    expect(manager.showSleepDialog).toHaveBeenCalledTimes(1);
  });

  it("activate_weapon should change active actor item", () => {
    const weapon: GameObject = MockGameObject.mock({ sectionOverride: weapons.wpn_svu });
    const actor: GameObject = MockGameObject.mockActor({
      inventory: [[weapon.section(), weapon]],
    });

    expect(() => callXrEffect("activate_weapon", actor, MockGameObject.mock(), weapons.wpn_fort)).toThrow(
      "Actor has no such item to activate - 'wpn_fort'."
    );

    callXrEffect("activate_weapon", actor, MockGameObject.mock(), weapons.wpn_svu);

    expect(actor.make_item_active).toHaveBeenCalledTimes(1);
    expect(actor.make_item_active).toHaveBeenCalledWith(weapon);
  });

  it("give_treasure should give actor treasure coordinates", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);

    jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    callXrEffect("give_treasure", MockGameObject.mockActor(), MockGameObject.mock(), "first", "second", "third");

    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledTimes(3);
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledWith("first");
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledWith("second");
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledWith("third");
  });

  it("get_best_detector should force actor to select best detector", () => {
    const advancedDetector: GameObject = MockGameObject.mock({ sectionOverride: detectors.detector_advanced });
    const scientificDetector: GameObject = MockGameObject.mock({ sectionOverride: detectors.detector_scientific });
    const actor: GameObject = MockGameObject.mockActor({
      inventory: [
        [advancedDetector.section(), advancedDetector],
        [scientificDetector.section(), scientificDetector],
      ],
    });

    callXrEffect("get_best_detector", actor, MockGameObject.mock());

    expect(advancedDetector.enable_attachable_item).toHaveBeenCalledTimes(1);
    expect(advancedDetector.enable_attachable_item).toHaveBeenCalledWith(true);
    expect(scientificDetector.enable_attachable_item).toHaveBeenCalledTimes(0);
  });

  it("hide_best_detector should force actor to hide best detector", () => {
    const advancedDetector: GameObject = MockGameObject.mock({ sectionOverride: detectors.detector_advanced });
    const scientificDetector: GameObject = MockGameObject.mock({ sectionOverride: detectors.detector_scientific });
    const actor: GameObject = MockGameObject.mockActor({
      inventory: [
        [advancedDetector.section(), advancedDetector],
        [scientificDetector.section(), scientificDetector],
      ],
    });

    callXrEffect("hide_best_detector", actor, MockGameObject.mock());

    expect(advancedDetector.enable_attachable_item).toHaveBeenCalledTimes(1);
    expect(advancedDetector.enable_attachable_item).toHaveBeenCalledWith(false);
    expect(scientificDetector.enable_attachable_item).toHaveBeenCalledTimes(0);
  });

  it("damage_actor_items_on_start should correctly modify actor items on game start", () => {
    const helm: GameObject = MockGameObject.mock({ sectionOverride: helmets.helm_respirator });
    const outfit: GameObject = MockGameObject.mock({ sectionOverride: outfits.stalker_outfit });
    const pistol: GameObject = MockGameObject.mock({ sectionOverride: weapons.wpn_pm_actor });
    const rifle: GameObject = MockGameObject.mock({ sectionOverride: weapons.wpn_ak74u });

    const actor: GameObject = MockGameObject.mockActor({
      inventory: [
        [helm.section(), helm],
        [outfit.section(), outfit],
        [rifle.section(), rifle],
        [pistol.section(), pistol],
      ],
    });

    expect(() => callXrEffect("hide_best_detector", MockGameObject.mockActor(), MockGameObject.mock())).not.toThrow();

    callXrEffect("damage_actor_items_on_start", actor, MockGameObject.mock());

    expect(helm.set_condition).toHaveBeenCalledWith(0.8);
    expect(outfit.set_condition).toHaveBeenCalledWith(0.76);
    expect(pistol.set_condition).toHaveBeenCalledWith(0.9);
    expect(rifle.set_condition).toHaveBeenCalledWith(0.7);
  });
});
