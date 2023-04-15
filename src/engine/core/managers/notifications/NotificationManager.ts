import { alife, game, XR_alife_simulator, XR_CGameTask, XR_game_object } from "xray16";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers/AbstractCoreManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import {
  notificationManagerIcons,
  TNotificationIcon,
  TNotificationIconKey,
} from "@/engine/core/managers/notifications/NotificationManagerIcons";
import {
  ENotificationDirection,
  ENotificationType,
  ETreasureState,
  IItemRelocatedNotification,
  IMoneyRelocatedNotification,
  INotification,
  ISoundNotification,
  ITaskUpdatedNotification,
  ITipNotification,
  ITreasureNotification,
} from "@/engine/core/managers/notifications/types";
import { ISmartTerrainDescriptor, SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { ETaskState } from "@/engine/core/managers/tasks/types";
import { Stalker } from "@/engine/core/objects";
import { abort, assert } from "@/engine/core/utils/assertion";
import { isHeavilyWounded } from "@/engine/core/utils/check/check";
import { isStalkerClassId } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getInventoryNameForItemSection } from "@/engine/core/utils/spawn";
import { captions, TCaption } from "@/engine/lib/constants/captions/captions";
import { scriptSounds } from "@/engine/lib/constants/sound/script_sounds";
import { textures, TTexture } from "@/engine/lib/constants/textures";
import {
  Optional,
  TCount,
  TDuration,
  TLabel,
  TName,
  TNumberId,
  TPath,
  TSection,
  TStringId,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager for processing of notifications on different game events.
 * Display information about new treasures, quests or items/money operations.
 *
 * todo: Handle notification events from app-level events without direct imports.
 */
export class NotificationManager extends AbstractCoreManager {
  public static readonly DEFAULT_NOTIFICATION_SHOW_DURATION: TDuration = 5_000;
  public static readonly QUEST_NOTIFICATION_SHOW_DURATION: TDuration = 10_000;

  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.SURGE_SKIPPED, this.onSurgeSkipped, this);
    eventsManager.registerCallback(EGameEvent.NOTIFICATION, this.sendNotification, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.SURGE_SKIPPED, this.onSurgeSkipped);
    eventsManager.unregisterCallback(EGameEvent.NOTIFICATION, this.sendNotification);
  }

  /**
   * Handle generic notification event.
   */
  public sendNotification(notification: INotification): void {
    assert(type(notification) === "table", "Expected notification event to be an object.");

    switch (notification.type) {
      case ENotificationType.ITEM: {
        const { direction, itemSection } = notification as IItemRelocatedNotification;

        return this.sendItemRelocatedNotification(direction, itemSection);
      }

      case ENotificationType.MONEY: {
        const { direction, amount } = notification as IMoneyRelocatedNotification;

        return this.sendMoneyRelocatedNotification(direction, amount);
      }

      case ENotificationType.TIP: {
        const { caption, delay, sender, showtime, senderId } = notification as ITipNotification;

        return this.sendTipNotification(caption, sender, delay, showtime, senderId);
      }

      case ENotificationType.SOUND: {
        const { object = null, faction, point, soundPath, soundCaption, delay } = notification as ISoundNotification;

        return this.sendSoundNotification(object, faction, point, soundPath, soundCaption, delay);
      }

      case ENotificationType.TREASURE: {
        const { state } = notification as ITreasureNotification;

        return this.sendTreasureNotification(state);
      }

      case ENotificationType.TASK: {
        const { state, task } = notification as ITaskUpdatedNotification;

        return this.sendTaskNotification(state, task);
      }

      default:
        abort("Expected valid event type, '%s' received for notification.", notification.type);
    }
  }

  /**
   * Send notification with information about actor money transfer.
   */
  public sendMoneyRelocatedNotification(direction: ENotificationDirection, amount: TCount): void {
    logger.info("Show relocate money message:", direction, amount, amount);

    const notificationTitle: TLabel = game.translate_string(
      direction === ENotificationDirection.IN ? captions.general_in_money : captions.general_out_money
    );
    const notificationText: TLabel = tostring(amount);
    const notificationIcon: TTexture =
      direction === ENotificationDirection.IN ? textures.ui_inGame2_Dengi_polucheni : textures.ui_inGame2_Dengi_otdani;

    this.onSendGenericNotification(
      true,
      notificationTitle,
      notificationText,
      notificationIcon,
      0,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION
    );
  }

  /**
   * Show notification in game UI or in dialog window if actor is talking.
   */
  public sendItemRelocatedNotification(
    direction: ENotificationDirection,
    itemSection: TSection,
    amount: TCount = 1
  ): void {
    logger.info("Show relocate item message:", direction, itemSection, amount);

    const notificationTitle: TLabel = game.translate_string(
      direction === ENotificationDirection.IN ? captions.general_in_item : captions.general_out_item
    );
    const notificationText: TLabel = string.format(
      "%s%s",
      getInventoryNameForItemSection(itemSection),
      amount === 1 ? "" : " x" + amount
    );
    const notificationIcon: TTexture =
      direction === ENotificationDirection.IN
        ? textures.ui_inGame2_Predmet_poluchen
        : textures.ui_inGame2_Predmet_otdan;

    this.onSendGenericNotification(
      true,
      notificationTitle,
      notificationText,
      notificationIcon,
      0,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION
    );
  }

  /**
   * Show notifications related to treasures state updates.
   */
  public sendTreasureNotification(state: ETreasureState): void {
    logger.info("Show treasure notification:", state);

    let notificationTitle: TLabel = "";

    if (state === ETreasureState.NEW_TREASURE_COORDINATES) {
      notificationTitle = game.translate_string(captions.st_found_new_treasure);
    } else if (state === ETreasureState.FOUND_TREASURE) {
      notificationTitle = game.translate_string(captions.st_got_treasure);
    } else if (state === ETreasureState.LOOTED_TREASURE_COORDINATES) {
      notificationTitle = game.translate_string(captions.st_found_old_treasure);
    }

    this.onSendGenericNotification(
      true,
      notificationTitle,
      "",
      textures.ui_inGame2_Polucheni_koordinaty_taynika,
      0,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION
    );
  }

  /**
   * Send notification about task state update.
   */
  public sendTaskNotification(newState: ETaskState, task: XR_CGameTask): void {
    logger.info("Show task notification:", newState, task.get_id(), task.get_title());

    const notificationTaskDescription: Record<ETaskState, TLabel> = {
      [ETaskState.NEW]: "general_new_task",
      [ETaskState.COMPLETED]: "general_complete_task",
      [ETaskState.FAIL]: "general_fail_task",
      [ETaskState.REVERSED]: "general_reverse_task",
      [ETaskState.UPDATED]: "general_update_task",
    };

    const notificationTitle: TLabel = game.translate_string(notificationTaskDescription[newState]);
    const notificationDescription: string = game.translate_string(task.get_title()) + ".";
    const notificationIcon: TTexture = task.get_icon_name() ?? textures.ui_iconsTotal_storyline;
    const notificationDuration: TDuration =
      newState === "updated"
        ? NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION
        : NotificationManager.QUEST_NOTIFICATION_SHOW_DURATION;

    this.onPlayPdaNotificationSound();
    this.onSendGenericNotification(
      true,
      notificationTitle,
      notificationDescription,
      notificationIcon,
      0,
      notificationDuration
    );
  }

  /**
   * Send generic tip notification.
   */
  public sendTipNotification(
    caption: TCaption,
    sender: Optional<TNotificationIcon | XR_game_object> = null,
    delay: Optional<TDuration> = 0,
    showtime: Optional<TTimestamp> = NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION,
    senderId: Optional<TStringId> = null
  ): void {
    logger.info("Show tip notification:", caption, delay, showtime, senderId);

    // Verify whether sender can send notifications.
    // todo: Probably here check ID from sender object if it is provided?
    if (senderId !== null) {
      const simulator: Optional<XR_alife_simulator> = alife();

      if (simulator !== null) {
        const serverObject: Stalker = simulator.object(getObjectIdByStoryId(senderId)!) as Stalker;

        if (serverObject !== null) {
          // Check if sender is not wounded.
          if (serverObject.online && isHeavilyWounded(serverObject.id)) {
            return logger.info("Cannot send tip, npc is wounded");
          }

          // Check if sender is alive.
          if (!serverObject.alive()) {
            return logger.info("Cannot send tip, npc is not alive");
          }
        }
      }
    }

    const notificationTitle: TLabel = game.translate_string(captions.st_tip);
    const notificationDescription: TLabel = game.translate_string(caption);
    let notificationIcon: TTexture = textures.ui_iconsTotal_grouping;

    // If sender is game object, check sender character icon to display instead of generic one.
    if (sender !== null) {
      notificationIcon =
        type(sender) === "string" ? (sender as TNotificationIcon) : (sender as XR_game_object).character_icon();
    }

    this.onPlayPdaNotificationSound();
    this.onSendGenericNotification(
      false,
      notificationTitle,
      notificationDescription,
      notificationIcon,
      delay || 0,
      showtime || NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION,
      0
    );
  }

  /**
   * Send generic sound notification to replicate what characters say.
   */
  public sendSoundNotification(
    object: Optional<XR_game_object>,
    faction: TName,
    point: Optional<TName | TNumberId>,
    soundPath: TPath,
    soundCaption: Optional<TLabel> = null,
    delay: TDuration = 0
  ): void {
    logger.info("Send sound notification:", object?.name(), soundPath, soundCaption, faction);

    let pointName: TName = "";

    // todo: Probably name and number id problem? Not real condition?
    if (point !== null) {
      const smartDescriptor: Optional<ISmartTerrainDescriptor> =
        SimulationBoardManager.getInstance().getSmartTerrainDescriptorById(point as TNumberId);

      if (smartDescriptor !== null) {
        pointName = smartDescriptor.smartTerrain.getNameCaption();
      } else {
        pointName = game.translate_string(point as TName);
      }
    }

    let soundCaptionText: Optional<TLabel> = soundCaption;

    if (soundCaptionText === null) {
      [soundCaptionText] = string.gsub(soundPath, "(characters_voice\\human_..\\)([^\\]*)", "%2");
      [soundCaptionText] = string.gsub(soundCaptionText, "[\\]([^\\]*)", "_%1");
    }

    const notificationTextTranslated: TLabel = game.translate_string(soundCaptionText);

    // Check if it is translated, do not show if translation is missing.
    if (notificationTextTranslated === soundCaptionText) {
      return;
    }

    let textureName: TTexture = textures.ui_iconsTotal_grouping;

    if (object !== null && isStalkerClassId(object.clsid())) {
      textureName = object.character_icon();
    } else if (notificationManagerIcons[faction as TNotificationIconKey]) {
      textureName = notificationManagerIcons[faction as TNotificationIconKey];
    }

    const notificationTitle = string.format(
      "%s %s%s:",
      game.translate_string("st_tip"),
      game.translate_string(faction),
      pointName === "" ? "" : ". " + pointName
    );

    this.onSendGenericNotification(
      false,
      notificationTitle,
      notificationTextTranslated,
      textureName,
      delay + 1000,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION,
      1
    );
  }

  /**
   * Play default sound notification of PDA updates.
   */
  public onPlayPdaNotificationSound(): void {
    GlobalSoundManager.getInstance().playSound(registry.actor.id(), scriptSounds.pda_task, null, null);
  }

  /**
   * On surge skip show notification.
   */
  public onSurgeSkipped(shouldNotify: boolean): void {
    if (shouldNotify) {
      this.sendTipNotification(captions.st_surge_while_asleep, notificationManagerIcons.recent_surge);
    }
  }

  /**
   * Send flexible notification.
   * In case of generic UI just show notification element, in case of dialog show it as message in history.
   */
  public onSendGenericNotification(
    isFlexible: boolean,
    notificationTitle: TCaption,
    notificationText: TCaption,
    notificationIcon: TName,
    delay: TDuration,
    showTime: TDuration,
    type: Optional<TNumberId> = null
  ): void {
    if (isFlexible && registry.actor.is_talking()) {
      registry.actor.give_talk_message2(notificationTitle, notificationText, notificationIcon, "iconed_answer_item");
    } else {
      /**
       * Call correct method based on LUA binding signature.
       * Different methods are called based on different params count.
       */
      if (type === null) {
        registry.actor.give_game_news(notificationTitle, notificationText, notificationIcon, delay, showTime);
      } else {
        registry.actor.give_game_news(notificationTitle, notificationText, notificationIcon, delay, showTime, type);
      }
    }
  }
}
