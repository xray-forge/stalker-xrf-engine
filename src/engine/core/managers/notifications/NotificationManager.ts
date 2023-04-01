import { alife, game, XR_alife_simulator, XR_CGameTask, XR_game_object } from "xray16";

import { getObjectIdByStoryId, registry, SYSTEM_INI } from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers/AbstractCoreManager";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import {
  notificationManagerIcons,
  TNotificationIcon,
  TNotificationIconKey,
} from "@/engine/core/managers/notifications/NotificationManagerIcons";
import {
  notificationTaskDescription,
  TNotificationTaskDescriptionKey,
} from "@/engine/core/managers/notifications/NotificationTaskDescription";
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { Stalker } from "@/engine/core/objects";
import { isHeavilyWounded } from "@/engine/core/utils/check/check";
import { isStalkerClassId } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";
import { captions, TCaption } from "@/engine/lib/constants/captions/captions";
import { scriptSounds } from "@/engine/lib/constants/sound/script_sounds";
import { textures } from "@/engine/lib/constants/textures";
import { Maybe, Optional, TCount, TDuration, TLabel, TName, TSection, TStringId, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * todo: Handle notification events from app-level events without direct imports.
 */
export class NotificationManager extends AbstractCoreManager {
  public static readonly DEFAULT_NOTIFICATION_SHOW_DURATION: TDuration = 5_000;

  /**
   * todo: Description.
   */
  public sendMoneyRelocatedNotification(actor: Optional<XR_game_object>, type: "in" | "out", amount: TCount): void {
    logger.info("Show relocate money message:", type, amount, amount);

    if (actor === null) {
      return;
    }

    if (type === "in") {
      const news_caption: string = game.translate_string(captions.general_in_money);
      const news_text: string = game.translate_string(tostring(amount));

      if (actor.is_talking()) {
        actor.give_talk_message2(news_caption, news_text, textures.ui_inGame2_Dengi_polucheni, "iconed_answer_item");
      } else {
        actor.give_game_news(news_caption, news_text, textures.ui_inGame2_Dengi_polucheni, 0, 3000);
      }
    } else if (type === "out") {
      const news_caption: string = game.translate_string(captions.general_out_money);
      const news_text: string = game.translate_string(tostring(amount));

      if (actor.is_talking()) {
        actor.give_talk_message2(news_caption, news_text, textures.ui_inGame2_Dengi_otdani, "iconed_answer_item");
      } else {
        actor.give_game_news(news_caption, news_text, textures.ui_inGame2_Dengi_otdani, 0, 3000);
      }
    }
  }

  /**
   * todo: Description.
   */
  public sendTreasureNotification(param: 0 | 1 | 2): void {
    logger.info("Show send treasure:", param);

    let news_caption: TLabel = "";
    const actor: XR_game_object = registry.actor;

    if (param === 0) {
      news_caption = game.translate_string(captions.st_found_new_treasure);
    } else if (param === 1) {
      news_caption = game.translate_string(captions.st_got_treasure);
    } else if (param === 2) {
      news_caption = game.translate_string(captions.st_found_old_treasure);
    }

    if (actor.is_talking()) {
      actor.give_talk_message2(
        news_caption,
        "",
        textures.ui_inGame2_Polucheni_koordinaty_taynika,
        "iconed_answer_item"
      );
    } else {
      actor.give_game_news(news_caption, "", textures.ui_inGame2_Polucheni_koordinaty_taynika, 0, 3000);
    }
  }

  /**
   * todo: Description.
   */
  public sendTaskNotification(
    actor: Optional<XR_game_object>,
    type: TNotificationTaskDescriptionKey,
    task: XR_CGameTask
  ): void {
    logger.info("Show task notification:", type, task.get_id(), task.get_title());

    // todo: Move to configs.
    let durationOnScreen = 10_000;

    if (type === "updated") {
      durationOnScreen = NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION;
    }

    this.playPdaNotificationSound();

    const notificationTitle: TLabel = game.translate_string(notificationTaskDescription[type]);
    const notificationDescription: string = game.translate_string(task.get_title());
    let icon: TName = task.get_icon_name();

    if (icon === null) {
      icon = textures.ui_iconsTotal_storyline;
    }

    if (registry.actor.is_talking()) {
      registry.actor.give_talk_message2(notificationTitle, notificationDescription + ".", icon, "iconed_answer_item");
    } else {
      registry.actor.give_game_news(notificationTitle, notificationDescription + ".", icon, 0, durationOnScreen);
    }
  }

  /**
   * todo;
   *
   * @param actor
   * @param caption
   * @param timeout - duration of notification display, in seconds.
   * @param sender
   * @param showtime
   * @param senderId
   * @returns -
   */
  public sendTipNotification(
    actor: XR_game_object,
    caption: TCaption,
    timeout: Maybe<TDuration>,
    sender: Optional<TNotificationIcon | XR_game_object>,
    showtime: Maybe<TTimestamp>,
    senderId: Optional<TStringId>
  ): boolean {
    logger.info("Show send tip:", caption, timeout, showtime, senderId);

    if (caption === null) {
      return false;
    }

    if (senderId !== null) {
      const simulator: Optional<XR_alife_simulator> = alife();

      if (simulator !== null) {
        const serverObject: Stalker = simulator.object(getObjectIdByStoryId(senderId)!) as Stalker;

        if (serverObject !== null) {
          if (serverObject.online) {
            if (isHeavilyWounded(serverObject.id)) {
              logger.info("Cannot send tip, npc is wounded");

              return false;
            }
          }

          if (!serverObject.alive()) {
            logger.info("Cannot send tip, npc is not alive");

            return false;
          }
        }
      }
    }

    this.playPdaNotificationSound();

    let texture: TName = textures.ui_iconsTotal_grouping;

    if (sender !== null) {
      texture = type(sender) === "string" ? (sender as TNotificationIcon) : (sender as XR_game_object).character_icon();
    }

    const notificationTitle: TLabel = game.translate_string(captions.st_tip);
    const notificationDescription: TLabel = game.translate_string(caption);
    const showTimeout: TDuration = !timeout ? 0 : timeout;
    const showTime: TDuration = !showtime ? NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION : showtime;

    actor.give_game_news(notificationTitle, notificationDescription, texture, showTimeout * 1000, showTime, 0);

    return true;
  }

  /**
   * todo: Description.
   * todo: Probably should be part of sound manager.
   */
  public sendSoundNotification(
    object: Optional<XR_game_object>,
    faction: Optional<string>,
    point: Optional<string>,
    str: string,
    str2: Optional<string>,
    delay: Optional<TDuration>
  ): void {
    logger.info("Send sound:", object?.name(), str, str2, faction);

    if (faction === null) {
      return;
    }

    let pointName: TName = "";

    if (point !== null) {
      // todo: Probably name and number id problem?
      const smart = SimulationBoardManager.getInstance().getSmartTerrainDescriptorById(point as any);

      if (smart !== null) {
        pointName = smart.smartTerrain.getNameCaption();
      } else {
        pointName = game.translate_string(point);
      }
    }

    let txt = "";

    if (str2 === null) {
      [txt] = string.gsub(str, "(characters_voice\\human_..\\)([^\\]*)", "%2");
      [txt] = string.gsub(txt, "[\\]([^\\]*)", "_%1");
    } else {
      txt = str2;
    }

    const news_text = game.translate_string(txt);

    if (news_text === txt) {
      return;
    }

    let texture: string = textures.ui_iconsTotal_grouping;

    if (object !== null && isStalkerClassId(object.clsid())) {
      texture = object.character_icon();
    } else {
      if (notificationManagerIcons[faction as TNotificationIconKey] !== null) {
        texture = notificationManagerIcons[faction as TNotificationIconKey];
      }
    }

    let news_caption = game.translate_string("st_tip") + " " + game.translate_string(faction);

    if (pointName !== "") {
      news_caption = news_caption + ". " + pointName + ":";
    } else {
      news_caption = news_caption + ":";
    }

    registry.actor.give_game_news(
      news_caption,
      news_text,
      texture,
      delay! + 1000,
      NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION,
      1
    );
  }

  /**
   * todo: Description.
   */
  public sendItemRelocatedNotification(
    actor: XR_game_object,
    type: "in" | "out",
    item: string,
    amount: TCount = 1
  ): void {
    logger.info("Show relocate item message:", type, item, amount);

    let notificationCaption: TLabel = "";
    let notificationText: TLabel = "";

    if (type === "in") {
      if (amount === 1) {
        notificationCaption = game.translate_string(captions.general_in_item);
        notificationText = game.translate_string(this.getItemInventoryName(item));
      } else {
        notificationCaption = game.translate_string(captions.general_in_item);
        notificationText = game.translate_string(this.getItemInventoryName(item)) + " x" + amount;
      }

      if (actor.is_talking()) {
        actor.give_talk_message2(
          notificationCaption,
          notificationText,
          textures.ui_inGame2_Predmet_poluchen,
          "iconed_answer_item"
        );
      } else {
        actor.give_game_news(notificationCaption, notificationText, textures.ui_inGame2_Predmet_poluchen, 0, 3000);
      }
    } else if (type === "out") {
      if (amount === 1) {
        notificationCaption = game.translate_string(captions.general_out_item);
        notificationText = game.translate_string(this.getItemInventoryName(item));
      } else {
        notificationCaption = game.translate_string(captions.general_out_item);
        notificationText = game.translate_string(this.getItemInventoryName(item)) + " x" + amount;
      }

      if (actor.is_talking()) {
        actor.give_talk_message2(
          notificationCaption,
          notificationText,
          textures.ui_inGame2_Predmet_otdan,
          "iconed_answer_item"
        );
      } else {
        actor.give_game_news(notificationCaption, notificationText, textures.ui_inGame2_Predmet_otdan, 0, 3000);
      }
    }
  }

  /**
   * todo: Description.
   */
  protected getItemInventoryName(section: TSection): TName {
    return SYSTEM_INI.r_string(section, "inv_name");
  }

  /**
   * todo: Description.
   */
  protected playPdaNotificationSound(): void {
    GlobalSoundManager.getInstance().playSound(registry.actor.id(), scriptSounds.pda_task, null, null);
  }
}
