import {
  alife,
  game,
  system_ini,
  XR_alife_simulator,
  XR_CGameTask,
  XR_cse_alife_human_stalker,
  XR_game_object,
} from "xray16";

import { captions } from "@/mod/globals/captions";
import { script_sounds } from "@/mod/globals/sound/script_sounds";
import { texturesIngame } from "@/mod/globals/textures";
import { Maybe, Optional } from "@/mod/lib/types";
import { getActor } from "@/mod/scripts/core/db";
import { get_smart_terrain_name } from "@/mod/scripts/core/db/smart_names";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { get_sim_board } from "@/mod/scripts/se/SimBoard";
import { isHeavilyWounded, isStalkerClassId } from "@/mod/scripts/utils/checkers";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("NewsManager");

const tips_icons_old = {
  default: [0, 658],
  trader: [332, 893],
  dolg: [0, 658],
  freedom: [0, 658],
  ecolog: [498, 0],
  army: [332, 141],
  stalker: [0, 658],
  csky: [0, 658],
  krot: [332, 47],
  barman: [332, 235],
  wolf: [332, 940],
  o_soznanie: [498, 893],
  monolith: [0, 658],
  saharov: [332, 470],
  prizrak: [0, 658],
  killer: [0, 658],
  bandit: [0, 658],
  renegade: [0, 658],
};

const tips_icons = {
  pioneer: texturesIngame.ui_inGame2_PD_Pervootkrivatel,
  mutant_hunter: texturesIngame.ui_inGame2_PD_Ohotnik_na_mutantov,
  detective: texturesIngame.ui_inGame2_PD_Sisshik,
  one_of_the_lads: texturesIngame.ui_inGame2_PD_Svoy_paren,
  kingpin: texturesIngame.ui_inGame2_PD_Avtoritet,
  herald_of_justice: texturesIngame.ui_inGame2_PD_Gonets_pravosudiya,
  seeker: texturesIngame.ui_inGame2_PD_Iskatel,
  battle_systems_master: texturesIngame.ui_inGame2_PD_master_boevih_sistem,
  high_tech_master: texturesIngame.ui_inGame2_PD_Master_visokih_technologiy,
  skilled_stalker: texturesIngame.ui_inGame2_PD_Opitniy_stalker,
  leader: texturesIngame.ui_inGame2_PD_Lider,
  diplomat: texturesIngame.ui_inGame2_PD_Diplomat,
  research_man: texturesIngame.ui_inGame2_PD_Nauchniy_sotrudnik,
  friend_of_duty: texturesIngame.ui_inGame2_PD_Drug_Dolga,
  friend_of_freedom: texturesIngame.ui_inGame2_PD_Drug_Swobodi,
  balance_advocate: texturesIngame.ui_inGame2_PD_storonnik_ravnovesiya,
  wealthy: texturesIngame.ui_inGame2_PD_Sostoyatelniy_klient,
  keeper_of_secrets: texturesIngame.ui_inGame2_PD_Hranitel_tayn,
  marked_by_zone: texturesIngame.ui_inGame2_PD_Otmecheniy_zonoy,
  information_dealer: texturesIngame.ui_inGame2_PD_Torgovets_informatsiey,
  friend_of_stalkers: texturesIngame.ui_inGame2_PD_Drug_Stalkerov,
  got_artefact: texturesIngame.ui_inGame2_D_gonets_pravosudiya,
  got_ammo: texturesIngame.ui_inGame2_D_Ohotnik_na_mutantov,
  got_medicine: texturesIngame.ui_inGame2_D_Sisshik,
  got_duty_light_armor: texturesIngame.ui_inGame2_D_Vipolnil_2_zadaniya_dlya_Dolga,
  got_duty_heavy_armor: texturesIngame.ui_inGame2_D_Vipolnil_4_zadaniya_dlya_Dolga,
  got_freedom_light_armor: texturesIngame.ui_inGame2_D_Vipolnil_2_zadaniya_dlya_Swobodi,
  got_freedom_heavy_armor: texturesIngame.ui_inGame2_D_Vipolnil_4_zadaniya_dlya_Swobodi,
  can_resupply: texturesIngame.ui_inGame2_Pered_zadaniyami_voennih,
  recent_surge: texturesIngame.ui_inGame2_V_zone_nedavno_proshel_vibros,
};

export type TIcons = typeof tips_icons;
export type TIcon = keyof TIcons;

const actionDescriptionByTask = {
  new: "general_new_task",
  complete: "general_complete_task",
  fail: "general_fail_task",
  reversed: "general_reverse_task",
  updated: "general_update_task",
} as const;

type TActionDescriptions = typeof actionDescriptionByTask;
type TActionType = keyof TActionDescriptions;

/**
 * todo;
 */
export function relocate_money(actor: Optional<XR_game_object>, type: "in" | "out", amount: number): void {
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
export function get_inv_name(section: string): string {
  return system_ini().r_string(section, "inv_name");
}

/**
 * todo;
 */
export function send_treasure(param: 0 | 1 | 2): void {
  logger.info("Show send treasure:", param);

  let news_caption: string = "";
  const actor: XR_game_object = getActor()!;

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
export function send_task(actor: Optional<XR_game_object>, type: TActionType, task: XR_CGameTask): void {
  logger.info("Show send task:", type, task.get_id(), task.get_title());

  // todo: Probably param check.
  if (getActor() === null || actor === null) {
    return;
  }

  // todo: Move to configs.
  let time_on_screen = 10000;

  if (type === "updated") {
    time_on_screen = 5000;
  }

  GlobalSound.set_sound_play(actor.id(), script_sounds.pda_task, null, null);

  const news_caption: string = game.translate_string(actionDescriptionByTask[type]);
  const news_text: string = game.translate_string(task.get_title());
  let icon: string = task.get_icon_name();

  if (icon === null) {
    icon = texturesIngame.ui_iconsTotal_storyline;
  }

  if (actor.is_talking()) {
    actor.give_talk_message2(news_caption, news_text + ".", icon, "iconed_answer_item");
  } else {
    actor.give_game_news(news_caption, news_text + ".", icon, 0, time_on_screen);
  }
}

/**
 * todo;
 */
export function send_tip(
  actor: XR_game_object,
  news_id_string: string,
  timeout: Maybe<number>,
  sender: Optional<TIcon | XR_game_object>,
  showtime: Maybe<number>,
  sender_id: Optional<string>
): boolean {
  logger.info("Show send tip:", news_id_string, timeout, showtime, sender_id);

  if (news_id_string === null) {
    return false;
  }

  if (sender_id !== null) {
    const sim: Optional<XR_alife_simulator> = alife();

    if (sim !== null) {
      const npc: XR_cse_alife_human_stalker = sim.object(getStoryObjectId(sender_id)!) as XR_cse_alife_human_stalker;

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
    if (type(sender) === "string") {
      if (tips_icons[sender as TIcon]) {
        texture = tips_icons[sender as TIcon];
      }
    } else if (isStalkerClassId((sender as XR_game_object).clsid())) {
      texture = (sender as XR_game_object).character_icon();
    }
  }

  const news_caption: string = game.translate_string(captions.st_tip);
  const news_text: string = game.translate_string(news_id_string);
  const showTimeout: number = !timeout ? 0 : timeout;
  const showTime: number = !showtime ? 5000 : showtime;

  actor.give_game_news(news_caption, news_text, texture, showTimeout * 1000, showTime, 0);

  return true;
}

/**
 * todo;
 */
export function send_sound(
  npc: Optional<XR_game_object>,
  faction: Optional<string>,
  point: Optional<string>,
  str: string,
  str2: Optional<string>,
  delay: Optional<number>
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
    if (tips_icons[faction as TIcon] !== null) {
      texture = tips_icons[faction as TIcon];
    }

    if (tips_icons[point as TIcon] !== null) {
      texture = tips_icons[point as TIcon];
    }
  }

  let news_caption = game.translate_string("st_tip") + " " + game.translate_string(faction);

  if (point_name !== "") {
    news_caption = news_caption + ". " + point_name + ":";
  } else {
    news_caption = news_caption + ":";
  }

  getActor()!.give_game_news(news_caption, news_text, texture, delay! + 1000, 5000, 1);
}

export function relocate_item(actor: XR_game_object, type: "in" | "out", item: string, amount: number = 1): void {
  logger.info("Show relocate item message:", type, item, amount);

  if (getActor() === null) {
    return;
  }

  let news_caption = "";
  let news_text = "";

  if (type === "in") {
    if (amount === 1) {
      news_caption = game.translate_string(captions.general_in_item);
      news_text = game.translate_string(get_inv_name(item));
    } else {
      news_caption = game.translate_string(captions.general_in_item);
      news_text = game.translate_string(get_inv_name(item)) + " x" + amount;
    }

    if (actor.is_talking()) {
      actor.give_talk_message2(
        news_caption,
        news_text,
        texturesIngame.ui_inGame2_Predmet_poluchen,
        "iconed_answer_item"
      );
    } else {
      actor.give_game_news(news_caption, news_text, texturesIngame.ui_inGame2_Predmet_poluchen, 0, 3000);
    }
  } else if (type === "out") {
    if (amount === 1) {
      news_caption = game.translate_string(captions.general_out_item);
      news_text = game.translate_string(get_inv_name(item));
    } else {
      news_caption = game.translate_string(captions.general_out_item);
      news_text = game.translate_string(get_inv_name(item)) + " x" + amount;
    }

    if (actor.is_talking()) {
      actor.give_talk_message2(news_caption, news_text, texturesIngame.ui_inGame2_Predmet_otdan, "iconed_answer_item");
    } else {
      actor.give_game_news(news_caption, news_text, texturesIngame.ui_inGame2_Predmet_otdan, 0, 3000);
    }
  }
}
