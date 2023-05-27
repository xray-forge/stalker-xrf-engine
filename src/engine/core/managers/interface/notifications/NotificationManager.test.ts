import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { disposeManager, initializeManager, registerActor, registerStoryLink, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers";
import { ETaskState } from "@/engine/core/managers/interaction/tasks";
import {
  ENotificationDirection,
  ENotificationType,
  ETreasureState,
  IItemRelocatedNotification,
  IMoneyRelocatedNotification,
  ISoundNotification,
  ITaskUpdatedNotification,
  ITipNotification,
  ITreasureNotification,
  NotificationManager,
} from "@/engine/core/managers/interface";
import { AbstractPlayableSound } from "@/engine/core/objects/sounds/playable_sounds/AbstractPlayableSound";
import { ActorSound } from "@/engine/core/objects/sounds/playable_sounds/ActorSound";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { scriptSounds } from "@/engine/lib/constants/sound/script_sounds";
import { textures } from "@/engine/lib/constants/textures";
import { GameTask } from "@/engine/lib/types";
import { resetFunctionMock } from "@/fixtures/utils/function_mock";
import { mockClientGameObject } from "@/fixtures/xray";
import { mockServerAlifeCreatureActor } from "@/fixtures/xray/mocks/objects";
import { MockAlifeSimulator } from "@/fixtures/xray/mocks/objects/AlifeSimulator.mock";
import { mockCGameTask } from "@/fixtures/xray/mocks/objects/task";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

describe("NotificationManager class", () => {
  beforeEach(() => {
    registerActor(mockClientGameObject());
    initializeManager(NotificationManager);
  });

  afterEach(() => {
    disposeManager(NotificationManager);
  });

  it("should correctly initialize", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();

    initializeManager(NotificationManager);

    expect(eventsManager.getSubscribersCount()).toBe(2);

    disposeManager(NotificationManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly handle generic call method with events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const notificationManager: NotificationManager = NotificationManager.getInstance();

    notificationManager.sendItemRelocatedNotification = jest.fn();
    notificationManager.sendMoneyRelocatedNotification = jest.fn();
    notificationManager.sendTipNotification = jest.fn();
    notificationManager.sendSoundNotification = jest.fn();
    notificationManager.sendTreasureNotification = jest.fn();
    notificationManager.sendTaskNotification = jest.fn();

    expect(() => eventsManager.emitEvent(EGameEvent.NOTIFICATION)).toThrow();
    expect(() => eventsManager.emitEvent(EGameEvent.NOTIFICATION, {})).toThrow();
    expect(() => eventsManager.emitEvent(EGameEvent.NOTIFICATION, { type: "random" })).toThrow();
    expect(() => eventsManager.emitEvent(EGameEvent.NOTIFICATION, { type: ENotificationType.TIP })).not.toThrow();

    const task: GameTask = mockCGameTask();

    eventsManager.emitEvent<ITaskUpdatedNotification>(EGameEvent.NOTIFICATION, {
      type: ENotificationType.TASK,
      state: ETaskState.UPDATED,
      task: task,
    });
    expect(notificationManager.sendTaskNotification).toHaveBeenCalledWith(ETaskState.UPDATED, task);

    eventsManager.emitEvent<IMoneyRelocatedNotification>(EGameEvent.NOTIFICATION, {
      type: ENotificationType.MONEY,
      amount: 255,
      direction: ENotificationDirection.OUT,
    });
    expect(notificationManager.sendMoneyRelocatedNotification).toHaveBeenCalledWith(ENotificationDirection.OUT, 255);

    eventsManager.emitEvent<IItemRelocatedNotification>(EGameEvent.NOTIFICATION, {
      type: ENotificationType.ITEM,
      itemSection: "test",
      direction: ENotificationDirection.IN,
      amount: 10,
    });
    expect(notificationManager.sendItemRelocatedNotification).toHaveBeenCalledWith(
      ENotificationDirection.IN,
      "test",
      10
    );

    eventsManager.emitEvent<ITreasureNotification>(EGameEvent.NOTIFICATION, {
      type: ENotificationType.TREASURE,
      state: ETreasureState.FOUND_TREASURE,
    });
    expect(notificationManager.sendTreasureNotification).toHaveBeenCalledWith(ETreasureState.FOUND_TREASURE);

    eventsManager.emitEvent<ISoundNotification>(EGameEvent.NOTIFICATION, {
      type: ENotificationType.SOUND,
      faction: "faction",
      object: registry.actor,
      point: "test_point",
      soundPath: "test_path",
      delay: 10,
      soundCaption: "caption",
    });
    expect(notificationManager.sendSoundNotification).toHaveBeenCalledWith(
      registry.actor,
      "faction",
      "test_point",
      "test_path",
      "caption",
      10
    );

    eventsManager.emitEvent<ITipNotification>(EGameEvent.NOTIFICATION, {
      type: ENotificationType.TIP,
      caption: "caption",
      delay: 500,
      sender: registry.actor,
      showtime: 128,
      senderId: "sid",
    });
    expect(notificationManager.sendTipNotification).toHaveBeenCalledWith("caption", registry.actor, 500, 128, "sid");
  });

  it("should correctly send money relocation notifications", () => {
    const notificationManager: NotificationManager = NotificationManager.getInstance();

    notificationManager.onSendGenericNotification = jest.fn();

    notificationManager.sendMoneyRelocatedNotification(ENotificationDirection.IN, 2000);
    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledWith(
      true,
      "translated_general_in_money",
      "2000",
      textures.ui_inGame2_Dengi_polucheni,
      0,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION
    );

    resetFunctionMock(notificationManager.onSendGenericNotification);

    notificationManager.sendMoneyRelocatedNotification(ENotificationDirection.OUT, 128);
    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledWith(
      true,
      "translated_general_out_money",
      "128",
      textures.ui_inGame2_Dengi_otdani,
      0,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION
    );
  });

  it("should correctly send item relocation notifications", () => {
    const notificationManager: NotificationManager = NotificationManager.getInstance();

    notificationManager.onSendGenericNotification = jest.fn();

    notificationManager.sendItemRelocatedNotification(ENotificationDirection.IN, "detector_advanced", 25);
    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledWith(
      true,
      "translated_general_in_item",
      "translated_st_detector2 x25",
      textures.ui_inGame2_Predmet_poluchen,
      0,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION
    );

    resetFunctionMock(notificationManager.onSendGenericNotification);

    notificationManager.sendItemRelocatedNotification(ENotificationDirection.OUT, "detector_advanced");
    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledWith(
      true,
      "translated_general_out_item",
      "translated_st_detector2",
      textures.ui_inGame2_Predmet_otdan,
      0,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION
    );
  });

  it("should correctly send treasures notifications", () => {
    const notificationManager: NotificationManager = NotificationManager.getInstance();

    notificationManager.onSendGenericNotification = jest.fn();

    notificationManager.sendTreasureNotification(ETreasureState.NEW_TREASURE_COORDINATES);
    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledWith(
      true,
      "translated_st_found_new_treasure",
      "",
      textures.ui_inGame2_Polucheni_koordinaty_taynika,
      0,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION
    );

    resetFunctionMock(notificationManager.onSendGenericNotification);

    notificationManager.sendTreasureNotification(ETreasureState.FOUND_TREASURE);
    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledWith(
      true,
      "translated_st_got_treasure",
      "",
      textures.ui_inGame2_Polucheni_koordinaty_taynika,
      0,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION
    );

    resetFunctionMock(notificationManager.onSendGenericNotification);

    notificationManager.sendTreasureNotification(ETreasureState.LOOTED_TREASURE_COORDINATES);
    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledWith(
      true,
      "translated_st_found_old_treasure",
      "",
      textures.ui_inGame2_Polucheni_koordinaty_taynika,
      0,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION
    );
  });

  it("should correctly send surge notifications", () => {
    const notificationManager: NotificationManager = NotificationManager.getInstance();
    const eventsManager: EventsManager = EventsManager.getInstance();

    notificationManager.onPlayPdaNotificationSound = jest.fn();
    notificationManager.onSendGenericNotification = jest.fn();

    eventsManager.emitEvent(EGameEvent.SURGE_SKIPPED);
    eventsManager.emitEvent(EGameEvent.SURGE_SKIPPED, false);

    expect(notificationManager.onPlayPdaNotificationSound).toHaveBeenCalledTimes(0);
    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledTimes(0);

    eventsManager.emitEvent(EGameEvent.SURGE_SKIPPED, true);

    expect(notificationManager.onPlayPdaNotificationSound).toHaveBeenCalledTimes(1);
    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledWith(
      false,
      "translated_st_tip",
      "translated_st_surge_while_asleep",
      "ui_inGame2_V_zone_nedavno_proshel_vibros",
      0,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION,
      0
    );

    eventsManager.emitEvent(EGameEvent.SURGE_SKIPPED, true);

    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledTimes(2);
    expect(notificationManager.onPlayPdaNotificationSound).toHaveBeenCalledTimes(2);
  });

  it("should correctly send task notifications", () => {
    const notificationManager: NotificationManager = NotificationManager.getInstance();

    notificationManager.onPlayPdaNotificationSound = jest.fn();
    notificationManager.onSendGenericNotification = jest.fn();
    notificationManager.sendTaskNotification(ETaskState.NEW, mockCGameTask());

    expect(notificationManager.onPlayPdaNotificationSound).toHaveBeenCalledTimes(1);
    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledWith(
      true,
      "translated_general_new_task",
      "translated_test_title.",
      "test_icon",
      0,
      NotificationManager.QUEST_NOTIFICATION_SHOW_DURATION
    );

    notificationManager.onPlayPdaNotificationSound = jest.fn();
    notificationManager.onSendGenericNotification = jest.fn();
    notificationManager.sendTaskNotification(ETaskState.UPDATED, mockCGameTask({ title: "example", iconName: "icon" }));

    expect(notificationManager.onPlayPdaNotificationSound).toHaveBeenCalledTimes(1);
    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledWith(
      true,
      "translated_general_update_task",
      "translated_example.",
      "icon",
      0,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION
    );
  });

  it("should correctly send generic tips", () => {
    const notificationManager: NotificationManager = NotificationManager.getInstance();

    notificationManager.onPlayPdaNotificationSound = jest.fn();
    notificationManager.onSendGenericNotification = jest.fn();
    notificationManager.sendTipNotification("test_simple");

    expect(notificationManager.onPlayPdaNotificationSound).toHaveBeenCalledTimes(1);
    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledWith(
      false,
      "translated_st_tip",
      "translated_test_simple",
      textures.ui_iconsTotal_grouping,
      0,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION,
      0
    );

    notificationManager.onPlayPdaNotificationSound = jest.fn();
    notificationManager.onSendGenericNotification = jest.fn();
    notificationManager.sendTipNotification("test_simple", "ui_inGame2_PD_storonnik_ravnovesiya", 200, 555, "test");

    expect(notificationManager.onPlayPdaNotificationSound).toHaveBeenCalledTimes(1);
    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledWith(
      false,
      "translated_st_tip",
      "translated_test_simple",
      "ui_inGame2_PD_storonnik_ravnovesiya",
      200,
      555,
      0
    );

    registerStoryLink(registry.actor.id(), "test-sid");

    MockAlifeSimulator.addToRegistry(
      mockServerAlifeCreatureActor({ id: registry.actor.id(), online: true, alive: () => true })
    );

    notificationManager.onPlayPdaNotificationSound = jest.fn();
    notificationManager.onSendGenericNotification = jest.fn();
    notificationManager.sendTipNotification("another", registry.actor, 1024, 50, "test-sid");

    expect(notificationManager.onPlayPdaNotificationSound).toHaveBeenCalledTimes(1);
    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledWith(
      false,
      "translated_st_tip",
      "translated_another",
      "test_character_icon",
      1024,
      50,
      0
    );

    // No sending for not alive objects.
    MockAlifeSimulator.addToRegistry(
      mockServerAlifeCreatureActor({ id: registry.actor.id(), online: true, alive: () => false })
    );

    notificationManager.onPlayPdaNotificationSound = jest.fn();
    notificationManager.onSendGenericNotification = jest.fn();
    notificationManager.sendTipNotification("another", registry.actor, 1024, 50, "test-sid");

    expect(notificationManager.onPlayPdaNotificationSound).toHaveBeenCalledTimes(0);
    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledTimes(0);

    // No sending for heavy wounded objects.
    MockAlifeSimulator.addToRegistry(
      mockServerAlifeCreatureActor({ id: registry.actor.id(), online: true, alive: () => true })
    );

    registry.objects.get(registry.actor.id()).wounded = {
      woundManager: {
        woundState: "heavy",
      },
    } as ISchemeWoundedState;

    notificationManager.sendTipNotification("another", registry.actor, 1024, 50, "test-sid");

    expect(notificationManager.onPlayPdaNotificationSound).toHaveBeenCalledTimes(0);
    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledTimes(0);
  });

  it("should correctly send sound notifications", () => {
    const notificationManager: NotificationManager = NotificationManager.getInstance();

    notificationManager.onPlayPdaNotificationSound = jest.fn();
    notificationManager.onSendGenericNotification = jest.fn();
    notificationManager.sendSoundNotification(
      null,
      "test",
      "test_point",
      "characters_voice\\human_02\\military\\attack"
    );

    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledWith(
      false,
      "translated_st_tip translated_test. translated_test_point:",
      "translated_military_attack",
      "ui_iconsTotal_grouping",
      1000,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION,
      1
    );

    notificationManager.onSendGenericNotification = jest.fn();
    notificationManager.sendSoundNotification(registry.actor, "test", "test_point", "test_path", "test_caption", 500);

    expect(notificationManager.onSendGenericNotification).toHaveBeenCalledWith(
      false,
      "translated_st_tip translated_test. translated_test_point:",
      "translated_test_caption",
      "ui_iconsTotal_grouping",
      1500,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION,
      1
    );

    expect(notificationManager.onPlayPdaNotificationSound).toHaveBeenCalledTimes(0);
  });

  it("should correctly play PDA notification sounds", () => {
    const notificationManager: NotificationManager = NotificationManager.getInstance();

    expect(registry.sounds.themes.get(scriptSounds.pda_task)).toBeNull();

    notificationManager.onPlayPdaNotificationSound();

    const notificationSound: AbstractPlayableSound = registry.sounds.themes.get(scriptSounds.pda_task);

    expect(notificationSound).toBeDefined();
    expect(notificationSound).toBeInstanceOf(ActorSound);
    expect((notificationSound as ActorSound).soundObject?.play_at_pos).toHaveBeenCalledTimes(1);
    expect((notificationSound as ActorSound).soundObject?.play_at_pos).toHaveBeenCalledWith(
      registry.actor,
      MockVector.create(),
      0,
      undefined
    );
  });

  it("should correctly send flexible notifications based on config and dialog state", () => {
    const notificationManager: NotificationManager = NotificationManager.getInstance();

    // Flexible + not talking.
    registry.actor.is_talking = jest.fn(() => false);

    notificationManager.onSendGenericNotification(true, "test-title", "test-text", "test-icon", 10, 2000, 3);

    expect(registry.actor.give_game_news).toHaveBeenCalledWith("test-title", "test-text", "test-icon", 10, 2000, 3);
    expect(registry.actor.give_talk_message2).toHaveBeenCalledTimes(0);

    resetFunctionMock(registry.actor.give_game_news);

    // Flexible + talking.
    registry.actor.is_talking = jest.fn(() => true);

    notificationManager.onSendGenericNotification(true, "test-title", "test-text", "test-icon", 10, 2000, 3);

    expect(registry.actor.give_game_news).toHaveBeenCalledTimes(0);
    expect(registry.actor.give_talk_message2).toHaveBeenCalledWith(
      "test-title",
      "test-text",
      "test-icon",
      "iconed_answer_item"
    );

    resetFunctionMock(registry.actor.give_talk_message2);

    // Not flexible + talking.
    registry.actor.is_talking = jest.fn(() => true);

    notificationManager.onSendGenericNotification(false, "test-title", "test-text", "test-icon", 10, 2000, 3);

    expect(registry.actor.give_game_news).toHaveBeenCalledWith("test-title", "test-text", "test-icon", 10, 2000, 3);
    expect(registry.actor.give_talk_message2).toHaveBeenCalledTimes(0);

    resetFunctionMock(registry.actor.give_game_news);
  });
});
