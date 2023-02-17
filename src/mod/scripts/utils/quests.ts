import { alife, XR_game_object } from "xray16";

import { ammo, TAmmoItem } from "@/mod/globals/items/ammo";
import { Optional, TSection } from "@/mod/lib/types";
import { getActor } from "@/mod/scripts/core/db";
import { SYSTEM_INI } from "@/mod/scripts/core/db/IniFiles";
import { relocate_item, relocate_money } from "@/mod/scripts/core/NewsManager";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("quests");

/**
 * todo;
 */
export function giveMoneyToActor(amount: number): void {
  logger.info("Award actor with money:", amount);

  const actor: XR_game_object = getActor() as XR_game_object;

  actor.give_money(amount);
  relocate_money(actor, "in", amount);
}

/**
 * todo;
 */
export function takeMoneyFromActor(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object,
  amount: number
): void {
  const victim = getNpcSpeaker(first_speaker, second_speaker);
  const actor: XR_game_object = getActor() as XR_game_object;

  if (victim === null) {
    abort("Couldn't relocate money to NULL.");
  }

  actor.transfer_money(amount, victim);
  relocate_money(actor, "out", amount);
}

/**
 * todo;
 */
export function getActorSpeaker(first: XR_game_object, second: XR_game_object): XR_game_object {
  return getActor()!.id() !== second.id() ? first : second;
}

/**
 * todo;
 */
export function getNpcSpeaker(first: XR_game_object, second: XR_game_object): XR_game_object {
  return getActor()!.id() === second.id() ? first : second;
}

/**
 * todo;
 */
export function takeItemsFromActor(
  first: XR_game_object,
  second: XR_game_object,
  section: string,
  amount: number | "all" = 1
): void {
  logger.info("Take items from actor:", section, amount);

  const npc = getNpcSpeaker(first, second);
  const actor: XR_game_object = getActorSpeaker(first, second);
  let i = 0;

  const transfer_object_item = (owner: XR_game_object, item: XR_game_object) => {
    if (item.section() === section && i !== 0) {
      actor.transfer_item(item, npc);
      i = i - 1;
    }
  };

  if (amount === "all") {
    i = -1;
    actor.iterate_inventory(transfer_object_item, actor);
    amount = (i + 1) * -1;
    i = 0;
  } else if (amount > 1) {
    i = amount;
    actor.iterate_inventory(transfer_object_item, actor);
  } else if (amount < 1) {
    abort("Wrong parameters in function 'relocate_item_section_from_actor'!");
  } else {
    actor.transfer_item(actor.object(section)!, npc);
  }

  if (i !== 0) {
    assert("Actor do not has enough items! Transferred [%s], needed [%s]", tostring(amount - i), tostring(amount));
  }

  // Get ammo with box sizes, not one by one.
  if (ammo[section as TAmmoItem] !== null) {
    const box_size = SYSTEM_INI.r_s32(section, "box_size");

    amount = amount * box_size;
  }

  relocate_item(actor, "out", section, amount - i);
}

/**
 * todo;
 */
export function giveItemsToActor(
  first_speaker: XR_game_object,
  second_speaker: XR_game_object,
  section: string,
  amount: number = 1
): void {
  const npc = getNpcSpeaker(first_speaker, second_speaker);
  const actor: XR_game_object = getActor() as XR_game_object;
  let v = 0;

  if (!amount) {
    amount = 1;
  }

  const transfer_object_item = (owner: XR_game_object, item: XR_game_object) => {
    if (item.section() === section && v !== 0) {
      npc.transfer_item(item, actor);
      v = v - 1;
    }
  };

  if (amount > 1) {
    v = amount;
    npc.iterate_inventory(transfer_object_item, actor);
  } else {
    if (npc.object(section) !== null) {
      npc.transfer_item(npc.object(section)!, actor);
    } else {
      alife().create(section, actor.position(), actor.level_vertex_id(), actor.game_vertex_id(), actor.id());
    }
  }

  if (v !== 0) {
    for (const i of $range(1, v)) {
      alife().create(section, actor.position(), actor.level_vertex_id(), actor.game_vertex_id(), actor.id());
    }
  }

  if (ammo[section as TAmmoItem] !== null) {
    const box_size = SYSTEM_INI.r_s32(section, "box_size");

    amount = amount * box_size;
  }

  relocate_item(actor, "in", section, amount);
}

/**
 * todo;
 */
export function relocateQuestItemSection(
  victim: XR_game_object,
  section: string,
  type: "in" | "out",
  amount: number = 1
): void {
  const actor: Optional<XR_game_object> = getActor();

  if (actor === null) {
    return;
  }

  for (const i of $range(1, amount)) {
    if (type === "in") {
      alife().create(section, actor.position(), actor.level_vertex_id(), actor.game_vertex_id(), actor.id());
    } else if (type === "out") {
      if (victim === null) {
        abort("Couldn't relocate item to NULL");
      }

      actor.transfer_item(actor.object(section)!, victim);
    }
  }

  if (ammo[section as TAmmoItem] !== null) {
    amount = amount * SYSTEM_INI.r_s32(section, "box_size");
  }

  relocate_item(actor, type, section, amount);
}
