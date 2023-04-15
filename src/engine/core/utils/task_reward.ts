import { alife, XR_game_object } from "xray16";

import { registry, SYSTEM_INI } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import {
  ENotificationDirection,
  ENotificationType,
  IItemRelocatedNotification,
  IMoneyRelocatedNotification,
} from "@/engine/core/managers/notifications/types";
import { abort, assertDefined } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ammo, TAmmoItem } from "@/engine/lib/constants/items/ammo";
import { medkits, TMedkit } from "@/engine/lib/constants/items/drugs";
import { LuaArray, Optional, TCount, TName, TNumberId, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Give provided amount of money to actor.
 */
export function giveMoneyToActor(amount: TCount): void {
  logger.info("Award actor with money:", amount);

  registry.actor.give_money(amount);

  EventsManager.getInstance().emitEvent<IMoneyRelocatedNotification>(EGameEvent.NOTIFICATION, {
    type: ENotificationType.MONEY,
    direction: ENotificationDirection.IN,
    amount,
  });
}

/**
 * Transfer provided amount of money from actor to object.
 */
export function transferMoneyFromActor(to: XR_game_object, amount: TCount): void {
  assertDefined(to, "Couldn't relocate money to 'nil'.");

  registry.actor.transfer_money(amount, to);

  EventsManager.getInstance().emitEvent<IMoneyRelocatedNotification>(EGameEvent.NOTIFICATION, {
    type: ENotificationType.MONEY,
    direction: ENotificationDirection.OUT,
    amount,
  });
}

/**
 * From two possible speakers pick NPC one, omit actor.
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
  itemSection: TSection,
  amount: TCount | "all" = 1
): void {
  logger.info("Take items from actor:", itemSection, amount);

  const npc = getNpcSpeaker(first, second);
  const actor: XR_game_object = registry.actor;
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

  EventsManager.getInstance().emitEvent<IItemRelocatedNotification>(EGameEvent.NOTIFICATION, {
    type: ENotificationType.ITEM,
    direction: ENotificationDirection.OUT,
    itemSection,
    amount: amount - i,
  });
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

  EventsManager.getInstance().emitEvent<IItemRelocatedNotification>(EGameEvent.NOTIFICATION, {
    type: ENotificationType.ITEM,
    direction: ENotificationDirection.IN,
    itemSection,
    amount,
  });
}

/**
 * todo;
 */
export function relocateQuestItemSection(
  victim: XR_game_object,
  itemSection: string,
  direction: ENotificationDirection,
  amount: number = 1
): void {
  const actor: XR_game_object = registry.actor;

  for (const it of $range(1, amount)) {
    if (direction === ENotificationDirection.IN) {
      alife().create(itemSection, actor.position(), actor.level_vertex_id(), actor.game_vertex_id(), actor.id());
    } else if (direction === ENotificationDirection.OUT) {
      if (victim === null) {
        abort("Couldn't relocate item to NULL");
      }

      actor.transfer_item(actor.object(itemSection)!, victim);
    }
  }

  if (ammo[itemSection as TAmmoItem] !== null) {
    amount = amount * SYSTEM_INI.r_s32(itemSection, "box_size");
  }

  EventsManager.getInstance().emitEvent<IItemRelocatedNotification>(EGameEvent.NOTIFICATION, {
    type: ENotificationType.ITEM,
    direction,
    itemSection,
    amount,
  });
}

/**
 * Get available medkit or null.
 *
 * @param list - list of medkits to check in inventory
 * @param actor - target object to get medkit, gets actor from registry by default
 * @returns get medkit or null
 */
export function getActorAvailableMedKit(
  list: LuaArray<TSection | TNumberId> = medkits as unknown as LuaArray<TSection | TNumberId>,
  actor: XR_game_object = registry.actor
): Optional<TMedkit> {
  for (const [key, medkit] of list) {
    if (actor.object(medkit) !== null) {
      return medkit as TMedkit;
    }
  }

  return null;
}

/**
 * Check whether actor has at least one med kit.
 *
 * @param list - list of medkits to check in inventory
 * @param actor - target object to check, gets actor from registry by default
 * @returns whether actor has at least one med kit
 */
export function actorHasMedKit(
  list: LuaArray<TSection | TNumberId> = medkits as unknown as LuaArray<TSection | TNumberId>,
  actor: XR_game_object = registry.actor
): boolean {
  return actorHasAtLeastOneItem(list, actor);
}

/**
 * Check whether actor has item in inventory.
 *
 * @param itemSection - list of item sections to check in the inventory
 * @param actor - target object to check, gets actor from registry by default
 * @returns whether actor has all of provided items
 */
export function actorHasItem(itemSection: TSection | TNumberId, actor: XR_game_object = registry.actor): boolean {
  return actor.object(itemSection) !== null;
}

/**
 * Check whether actor has all items from provided list.
 *
 * @param itemSections - list of item sections to check in the inventory
 * @param actor - target object to check, gets actor from registry by default
 * @returns whether actor has all of provided items
 */
export function actorHasItems(
  itemSections: LuaArray<TSection | TNumberId> | Array<TSection | TNumberId>,
  actor: XR_game_object = registry.actor
): boolean {
  for (const [, section] of itemSections as LuaArray<TSection | TNumberId>) {
    if (actor.object(section) === null) {
      return false;
    }
  }

  return true;
}

/**
 * Check whether actor has at least one item from the list.
 *
 * @param itemSections - list of item sections to check in the inventory
 * @param actor - target object to check, gets actor from registry by default
 * @returns whether actor has at least one of provided items
 */
export function actorHasAtLeastOneItem(
  itemSections: LuaArray<TSection | TNumberId> | Array<TSection | TNumberId>,
  actor: XR_game_object = registry.actor
): boolean {
  for (const [index, section] of itemSections as LuaArray<TSection | TNumberId>) {
    if (actor.object(section) !== null) {
      return true;
    }
  }

  return false;
}

/**
 * Check whether npc has item in inventory.
 *
 * @param object - target object to check inventory
 * @param itemSectionOrId - item section or ID to check in inventory
 * @returns whether npc has item in inventory
 */
export function npcHasItem(object: XR_game_object, itemSectionOrId: TSection | TNumberId): boolean {
  return object.object(itemSectionOrId) !== null;
}

/**
 * Check whether NPC name matches provided parameter.
 *
 * @param object - target object to check name
 * @param name - target name to check
 * @returns whether object name is matching provided string
 */
export function isObjectName(object: XR_game_object, name: TName): boolean {
  const objectName: Optional<string> = object.name();

  return objectName !== null && string.find(objectName, name)[0] !== null;
}
