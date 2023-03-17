import { alife, XR_game_object } from "xray16";

import { ammo, TAmmoItem } from "@/engine/lib/constants/items/ammo";
import { medkits, TMedkit } from "@/engine/lib/constants/items/drugs";
import { LuaArray, Optional } from "@/engine/lib/types";
import { registry, SYSTEM_INI } from "@/engine/scripts/core/database";
import { NotificationManager } from "@/engine/scripts/core/managers/notifications/NotificationManager";
import { abort } from "@/engine/scripts/utils/debug";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function giveMoneyToActor(amount: number): void {
  logger.info("Award actor with money:", amount);

  const actor: XR_game_object = registry.actor;

  actor.give_money(amount);
  NotificationManager.getInstance().sendMoneyRelocatedNotification(actor, "in", amount);
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
  const actor: XR_game_object = registry.actor;

  if (victim === null) {
    abort("Couldn't relocate money to NULL.");
  }

  actor.transfer_money(amount, victim);
  NotificationManager.getInstance().sendMoneyRelocatedNotification(actor, "out", amount);
}

/**
 * todo;
 */
export function getActorSpeaker(first: XR_game_object, second: XR_game_object): XR_game_object {
  return registry.actor.id() !== second.id() ? first : second;
}

/**
 * todo;
 */
export function getNpcSpeaker(first: XR_game_object, second: XR_game_object): XR_game_object {
  return registry.actor.id() === second.id() ? first : second;
}

/**
 * todo;
 */
export function takeItemsFromActor(
  first: XR_game_object,
  second: XR_game_object,
  itemSection: string,
  amount: number | "all" = 1
): void {
  logger.info("Take items from actor:", itemSection, amount);

  const npc = getNpcSpeaker(first, second);
  const actor: XR_game_object = getActorSpeaker(first, second);
  let i = 0;

  const transfer_object_item = (owner: XR_game_object, item: XR_game_object) => {
    if (item.section() === itemSection && i !== 0) {
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
    abort("Wrong parameters in function 'takeItemsFromActor'!");
  } else {
    actor.transfer_item(actor.object(itemSection)!, npc);
  }

  if (i !== 0) {
    assert("Actor do not has enough items! Transferred [%s], needed [%s]", tostring(amount - i), tostring(amount));
  }

  // Get ammo with box sizes, not one by one.
  if (ammo[itemSection as TAmmoItem] !== null) {
    const box_size = SYSTEM_INI.r_s32(itemSection, "box_size");

    amount = amount * box_size;
  }

  NotificationManager.getInstance().sendItemRelocatedNotification(actor, "out", itemSection, amount - i);
}

/**
 * todo;
 */
export function giveItemsToActor(
  first: XR_game_object,
  second: XR_game_object,
  itemSection: string,
  amount: number = 1
): void {
  const npc: XR_game_object = getNpcSpeaker(first, second);
  const actor: XR_game_object = registry.actor;
  let v = 0;

  if (!amount) {
    amount = 1;
  }

  const transfer_object_item = (owner: XR_game_object, item: XR_game_object) => {
    if (item.section() === itemSection && v !== 0) {
      npc.transfer_item(item, actor);
      v = v - 1;
    }
  };

  if (amount > 1) {
    v = amount;
    npc.iterate_inventory(transfer_object_item, actor);
  } else {
    if (npc.object(itemSection) !== null) {
      npc.transfer_item(npc.object(itemSection)!, actor);
    } else {
      alife().create(itemSection, actor.position(), actor.level_vertex_id(), actor.game_vertex_id(), actor.id());
    }
  }

  if (v !== 0) {
    for (const i of $range(1, v)) {
      alife().create(itemSection, actor.position(), actor.level_vertex_id(), actor.game_vertex_id(), actor.id());
    }
  }

  if (ammo[itemSection as TAmmoItem] !== null) {
    const box_size = SYSTEM_INI.r_s32(itemSection, "box_size");

    amount = amount * box_size;
  }

  NotificationManager.getInstance().sendItemRelocatedNotification(actor, "in", itemSection, amount);
}

/**
 * todo;
 */
export function relocateQuestItemSection(
  victim: XR_game_object,
  itemSection: string,
  type: "in" | "out",
  amount: number = 1
): void {
  const actor: XR_game_object = registry.actor;

  for (const it of $range(1, amount)) {
    if (type === "in") {
      alife().create(itemSection, actor.position(), actor.level_vertex_id(), actor.game_vertex_id(), actor.id());
    } else if (type === "out") {
      if (victim === null) {
        abort("Couldn't relocate item to NULL");
      }

      actor.transfer_item(actor.object(itemSection)!, victim);
    }
  }

  if (ammo[itemSection as TAmmoItem] !== null) {
    amount = amount * SYSTEM_INI.r_s32(itemSection, "box_size");
  }

  NotificationManager.getInstance().sendItemRelocatedNotification(actor, type, itemSection, amount);
}

/**
 * Get available medkit or null.
 * @param actor - target object to get medkit, gets actor from registry by default.
 * @returns get medkit or null.
 */
export function getActorAvailableMedKit(actor: XR_game_object = registry.actor): Optional<TMedkit> {
  for (const [key, medkit] of medkits as unknown as LuaTable<TMedkit, TMedkit>) {
    if (actor.object(medkit) !== null) {
      return medkit;
    }
  }

  return null;
}

/**
 * Check whether actor has at least one med kit.
 * @param actor - target object to check, gets actor from registry by default.
 * @returns whether actor has at least one med kit.
 */
export function actorHasMedKit(actor: XR_game_object = registry.actor): boolean {
  for (const [key, medkit] of medkits as unknown as LuaTable<TMedkit, TMedkit>) {
    if (actor.object(medkit) !== null) {
      return true;
    }
  }

  return false;
}

/**
 * Check whether actor has item in inventory.
 * @param itemSection - list of item sections to check in the inventory.
 * @param actor - target object to check, gets actor from registry by default.
 * @returns whether actor has all of provided items.
 */
export function actorHasItem(itemSection: string, actor: XR_game_object = registry.actor): boolean {
  return actor.object(itemSection) !== null;
}

/**
 * Check whether actor has all items from provided list.
 * @param itemSections - list of item sections to check in the inventory.
 * @param actor - target object to check, gets actor from registry by default.
 * @returns whether actor has all of provided items.
 */
export function actorHasItems(itemSections: Array<string>, actor: XR_game_object = registry.actor): boolean {
  for (const [index, section] of itemSections as unknown as LuaArray<string>) {
    if (actor.object(section) === null) {
      return false;
    }
  }

  return true;
}

/**
 * Check whether actor has at least one item from the list.
 * @param itemSections - list of item sections to check in the inventory.
 * @param actor - target object to check, gets actor from registry by default.
 * @returns whether actor has at least one of provided items.
 */
export function actorHasAtLeastOneItem(itemSections: Array<string>, actor: XR_game_object = registry.actor): boolean {
  for (const [index, section] of itemSections as unknown as LuaArray<string>) {
    if (actor.object(section) !== null) {
      return true;
    }
  }

  return false;
}

/**
 * Check whether npc has item in inventory.
 * @param npc - target object to check inventory.
 * @param itemSection - list of item sections to check in the inventory.
 * @returns whether npc has item in inventory.
 */
export function npcHasItem(npc: XR_game_object, itemSection: string): boolean {
  return npc.object(itemSection) !== null;
}

/**
 * Check whether NPC name matches provided parameter.
 * @param object - target object to check name.
 * @param name - target name to check.
 * @returns whether object name is matching provided string.
 */
export function isNpcName(object: XR_game_object, name: string): boolean {
  const npcName: Optional<string> = object.name();

  return npcName !== null && string.find(npcName, name)[0] !== null;
}
