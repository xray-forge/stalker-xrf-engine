import { alife, game, XR_alife_simulator, XR_CGameTask, XR_cse_alife_human_stalker, XR_game_object } from "xray16";

import { captions, TCaption } from "@/mod/globals/captions";
import { script_sounds } from "@/mod/globals/sound/script_sounds";
import { texturesIngame } from "@/mod/globals/textures";
import { Maybe, Optional, TCount, TDuration, TLabel, TName, TSection, TStringId, TTimestamp } from "@/mod/lib/types";
import { registry, SYSTEM_INI } from "@/mod/scripts/core/database";
import { get_sim_board } from "@/mod/scripts/core/database/SimBoard";
import { get_smart_terrain_name } from "@/mod/scripts/core/database/smart_names";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { AbstractCoreManager } from "@/mod/scripts/core/managers/AbstractCoreManager";
import {
  notificationManagerIcons,
  TNotificationIcon,
  TNotificationIconKey,
} from "@/mod/scripts/core/managers/notifications/NotificationManagerIcons";
import {
  notificationTaskDescription,
  TNotificationTaskDescription,
  TNotificationTaskDescriptionKey,
} from "@/mod/scripts/core/managers/notifications/NotificationTaskDescription";
import { isHeavilyWounded } from "@/mod/scripts/utils/checkers/checkers";
import { isStalkerClassId } from "@/mod/scripts/utils/checkers/is";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("NotificationManager");

/**
 * todo;
 * todo: Handle notification events from app-level events without direct imports.
 */
export class NotificationManager extends AbstractCoreManager {
  public static readonly DEFAULT_NOTIFICATION_SHOW_DURATION: TDuration = 5_000;

  /**
   * todo;
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
        actor.give_talk_message2(
          news_caption,
          news_text,
          texturesIngame.ui_inGame2_Dengi_polucheni,
          "iconed_answer_item"
        );
      } else {
        actor.give_game_news(news_caption, news_text, texturesIngame.ui_inGame2_Dengi_polucheni, 0, 3000);
      }
    } else if (type === "out") {
      const news_caption: string = game.translate_string(captions.general_out_money);
      const news_text: string = game.translate_string(tostring(amount));

      if (actor.is_talking()) {
        actor.give_talk_message2(news_caption, news_text, texturesIngame.ui_inGame2_Dengi_otdani, "iconed_answer_item");
      } else {
        actor.give_game_news(news_caption, news_text, texturesIngame.ui_inGame2_Dengi_otdani, 0, 3000);
      }
    }
  }

  /**
   * todo;
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
        texturesIngame.ui_inGame2_Polucheni_koordinaty_taynika,
        "iconed_answer_item"
      );
    } else {
      actor.give_game_news(news_caption, "", texturesIngame.ui_inGame2_Polucheni_koordinaty_taynika, 0, 3000);
    }
  }

  /**
   * todo;
   */
  public sendTaskNotification(
    actor: Optional<XR_game_object>,
    type: TNotificationTaskDescriptionKey,
    task: XR_CGameTask
  ): void {
    logger.info("Show send task:", type, task.get_id(), task.get_title());

    // todo: Move to configs.
    let durationOnScreen = 10_000;

    if (type === "updated") {
      durationOnScreen = NotificationManager.DEFAULT_NOTIFICATION_SHOW_DURATION;
    }

    GlobalSound.set_sound_play(registry.actor.id(), script_sounds.pda_task, null, null);

    const notificationTitle: TLabel = game.translate_string(notificationTaskDescription[type]);
    const notificationDescription: string = game.translate_string(task.get_title());
    let icon: TName = task.get_icon_name();

    if (icon === null) {
      icon = texturesIngame.ui_iconsTotal_storyline;
    }

    if (registry.actor.is_talking()) {
      registry.actor.give_talk_message2(notificationTitle, notificationDescription + ".", icon, "iconed_answer_item");
    } else {
      registry.actor.give_game_news(notificationTitle, notificationDescription + ".", icon, 0, durationOnScreen);
    }
  }

  /**
   * todo;
   * @param timeout - duration of notification display, in seconds.
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
      const sim: Optional<XR_alife_simulator> = alife();

      if (sim !== null) {
        const npc: XR_cse_alife_human_stalker = sim.object(getStoryObjectId(senderId)!) as XR_cse_alife_human_stalker;

        if (npc !== null) {
          if (npc.online) {
            if (isHeavilyWounded(npc.id)) {
              logger.info("Cannot send tip, npc is wounded");

              return false;
            }
          }

          if (!npc.alive()) {
            logger.info("Cannot send tip, npc is not alive");

            return false;
          }
        }
      }
    }

    GlobalSound.set_sound_play(actor.id(), script_sounds.pda_task, null, null);

    let texture: string = texturesIngame.ui_iconsTotal_grouping;

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
   * todo;
   */
  public sendSoundNotification(
    npc: Optional<XR_game_object>,
    faction: Optional<string>,
    point: Optional<string>,
    str: string,
    str2: Optional<string>,
    delay: Optional<TDuration>
  ): void {
    logger.info("Send sound:", npc?.id(), str, str2, faction);

    if (faction === null) {
      return;
    }

    let point_name = "";

    if (point !== null) {
      const smart = get_sim_board().smarts.get(point as any);

      if (smart !== null) {
        point_name = get_smart_terrain_name(smart.smrt) as string;
      } else {
        point_name = game.translate_string(point);
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

    let texture: string = texturesIngame.ui_iconsTotal_grouping;

    if (npc !== null && isStalkerClassId(npc.clsid())) {
      texture = npc.character_icon();
    } else {
      if (notificationManagerIcons[faction as TNotificationIconKey] !== null) {
        texture = notificationManagerIcons[faction as TNotificationIconKey];
      }
    }

    let news_caption = game.translate_string("st_tip") + " " + game.translate_string(faction);

    if (point_name !== "") {
      news_caption = news_caption + ". " + point_name + ":";
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
   * todo;
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
          texturesIngame.ui_inGame2_Predmet_poluchen,
          "iconed_answer_item"
        );
      } else {
        actor.give_game_news(
          notificationCaption,
          notificationText,
          texturesIngame.ui_inGame2_Predmet_poluchen,
          0,
          3000
        );
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
          texturesIngame.ui_inGame2_Predmet_otdan,
          "iconed_answer_item"
        );
      } else {
        actor.give_game_news(notificationCaption, notificationText, texturesIngame.ui_inGame2_Predmet_otdan, 0, 3000);
      }
    }
  }

  /**
   * todo;
   */
  protected getItemInventoryName(section: TSection): TName {
    return SYSTEM_INI.r_string(section, "inv_name");
  }
}
