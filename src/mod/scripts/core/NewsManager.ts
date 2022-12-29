import {
  XR_CGameTask,
  XR_alife_simulator,
  XR_cse_alife_human_stalker,
  XR_game_object,
  alife,
  game,
  system_ini
} from "xray16";

import { captions } from "@/mod/globals/captions";
import { sounds } from "@/mod/globals/sounds";
import { textures } from "@/mod/globals/textures";
import { AnyCallable, Maybe, Optional } from "@/mod/lib/types";
import { isStalkerClassId } from "@/mod/scripts/core/checkers";
import { getActor } from "@/mod/scripts/core/db";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("core/NewsManager");

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
  renegade: [0, 658]
};

const tips_icons = {
  pioneer: textures.ui_inGame2_PD_Pervootkrivatel,
  mutant_hunter: textures.ui_inGame2_PD_Ohotnik_na_mutantov,
  detective: textures.ui_inGame2_PD_Sisshik,
  one_of_the_lads: textures.ui_inGame2_PD_Svoy_paren,
  kingpin: textures.ui_inGame2_PD_Avtoritet,
  herald_of_justice: textures.ui_inGame2_PD_Gonets_pravosudiya,
  seeker: textures.ui_inGame2_PD_Iskatel,
  battle_systems_master: textures.ui_inGame2_PD_master_boevih_sistem,
  high_tech_master: textures.ui_inGame2_PD_Master_visokih_technologiy,
  skilled_stalker: textures.ui_inGame2_PD_Opitniy_stalker,
  leader: textures.ui_inGame2_PD_Lider,
  diplomat: textures.ui_inGame2_PD_Diplomat,
  research_man: textures.ui_inGame2_PD_Nauchniy_sotrudnik,
  friend_of_duty: textures.ui_inGame2_PD_Drug_Dolga,
  friend_of_freedom: textures.ui_inGame2_PD_Drug_Swobodi,
  balance_advocate: textures.ui_inGame2_PD_storonnik_ravnovesiya,
  wealthy: textures.ui_inGame2_PD_Sostoyatelniy_klient,
  keeper_of_secrets: textures.ui_inGame2_PD_Hranitel_tayn,
  marked_by_zone: textures.ui_inGame2_PD_Otmecheniy_zonoy,
  information_dealer: textures.ui_inGame2_PD_Torgovets_informatsiey,
  friend_of_stalkers: textures.ui_inGame2_PD_Drug_Stalkerov,
  got_artefact: textures.ui_inGame2_D_gonets_pravosudiya,
  got_ammo: textures.ui_inGame2_D_Ohotnik_na_mutantov,
  got_medicine: textures.ui_inGame2_D_Sisshik,
  got_duty_light_armor: textures.ui_inGame2_D_Vipolnil_2_zadaniya_dlya_Dolga,
  got_duty_heavy_armor: textures.ui_inGame2_D_Vipolnil_4_zadaniya_dlya_Dolga,
  got_freedom_light_armor: textures.ui_inGame2_D_Vipolnil_2_zadaniya_dlya_Swobodi,
  got_freedom_heavy_armor: textures.ui_inGame2_D_Vipolnil_4_zadaniya_dlya_Swobodi,
  can_resupply: textures.ui_inGame2_Pered_zadaniyami_voennih,
  recent_surge: textures.ui_inGame2_V_zone_nedavno_proshel_vibros
};

type TIcons = typeof tips_icons;
type TIcon = keyof TIcons;

const actionDescriptionByTask = {
  new: "general_new_task",
  complete: "general_complete_task",
  fail: "general_fail_task",
  reversed: "general_reverse_task",
  updated: "general_update_task"
} as const;

type TActionDescriptions = typeof actionDescriptionByTask;
type TActionType = keyof TActionDescriptions;

/**
 * todo;
 */
export function relocate_money(actor: Optional<XR_game_object>, type: "in" | "out", amount: number): void {
  log.info("Show relocate money message:", type, amount, amount);

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
 * todo;
 */
export function get_inv_name(section: string): string {
  return system_ini().r_string(section, "inv_name");
}

/**
 * todo;
 */
export function send_treasure(param: 0 | 1 | 2): void {
  log.info("Show send treasure:", param);

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
    actor.give_talk_message2(news_caption, "", textures.ui_inGame2_Polucheni_koordinaty_taynika, "iconed_answer_item");
  } else {
    actor.give_game_news(news_caption, "", textures.ui_inGame2_Polucheni_koordinaty_taynika, 0, 3000);
  }
}

/**
 * todo;
 */
export function send_task(actor: Optional<XR_game_object>, type: TActionType, task: XR_CGameTask): void {
  log.info("Show send task:", type, task.get_id(), task.get_title());

  // todo: Probably param check.
  if (getActor() === null || actor === null) {
    return;
  }

  // todo: Move to configs.
  let time_on_screen = 10000;

  if (type == "updated") {
    time_on_screen = 5000;
  }

  (get_global("xr_sound").set_sound_play as AnyCallable)(actor.id(), sounds.pda_task);

  const news_caption: string = game.translate_string(actionDescriptionByTask[type]);
  const news_text: string = game.translate_string(task.get_title());
  let icon: string = task.get_icon_name();

  if (icon === null) {
    icon = textures.ui_iconsTotal_storyline;
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
  news_id: string,
  timeout: Maybe<number>,
  sender: Optional<TIcon | XR_game_object>,
  showtime: Maybe<number>,
  sender_id: string
): boolean {
  log.info("Show send tip:", news_id, timeout, showtime, sender_id);

  if (news_id === null) {
    return false;
  }

  if (sender_id !== null) {
    const sim: Optional<XR_alife_simulator> = alife();

    if (sim !== null) {
      const npc: XR_cse_alife_human_stalker = sim.object(getStoryObjectId(sender_id)!) as XR_cse_alife_human_stalker;

      if (npc !== null) {
        if (npc.online) {
          if ((get_global("xr_wounded").is_heavy_wounded_by_id as AnyCallable)(npc.id)) {
            log.info("Cannot send tip, npc is wounded");

            return false;
          }
        }

        if (!npc.alive()) {
          log.info("Cannot send tip, npc is not alive");

          return false;
        }
      }
    }
  }

  (get_global("xr_sound").set_sound_play as AnyCallable)(actor.id(), sounds.pda_task);

  let texture: string = textures.ui_iconsTotal_grouping;

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
  const news_text: string = game.translate_string(news_id);
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
  faction: Optional<TIcon>,
  point: string,
  str: string,
  str2: string,
  delay: number
): void {
  log.info("Send sound:", npc?.id(), str, str2, faction);

  if (faction === null) {
    return;
  }

  let point_name = "";

  if (point !== null) {
    const smart = get_global("sim_board").get_sim_board().smarts[point];

    if (smart) {
      point_name = (get_global("sim_board").get_smart_terrain_name as AnyCallable)(smart.smrt);
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

  let texture: string = textures.ui_iconsTotal_grouping;

  if (npc !== null && isStalkerClassId(npc.clsid())) {
    texture = npc.character_icon();
  } else {
    if (tips_icons[faction] !== null) {
      texture = tips_icons[faction];
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

  getActor()!.give_game_news(news_caption, news_text, texture, delay + 1000, 5000, 1);
}

export function relocate_item(actor: XR_game_object, type: "in" | "out", item: string, amount: number = 1): void {
  log.info("Show relocate item message:", type, item, amount);

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
      actor.give_talk_message2(news_caption, news_text, textures.ui_inGame2_Predmet_poluchen, "iconed_answer_item");
    } else {
      actor.give_game_news(news_caption, news_text, textures.ui_inGame2_Predmet_poluchen, 0, 3000);
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
      actor.give_talk_message2(news_caption, news_text, textures.ui_inGame2_Predmet_otdan, "iconed_answer_item");
    } else {
      actor.give_game_news(news_caption, news_text, textures.ui_inGame2_Predmet_otdan, 0, 3000);
    }
  }
}
