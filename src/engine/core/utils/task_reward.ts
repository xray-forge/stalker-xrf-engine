import { alife, XR_game_object } from "xray16";

import { registry, SYSTEM_INI } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import {
  ENotificationDirection,
  ENotificationType,
  IItemRelocatedNotification,
  IMoneyRelocatedNotification,
} from "@/engine/core/managers/notifications/types";
import { abort, assert, assertDefined } from "@/engine/core/utils/assertion";
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
 * Transfer item section with desired count from actor to provided object.
 */
export function transferItemsFromActor(to: XR_game_object, itemSection: TSection, amount: TCount | "all" = 1): void {
  logger.info("Transfer items from actor:", to.name(), itemSection, amount);

  const from: XR_game_object = registry.actor;
  let remaining: TCount = 0;

  // Transfer all items.
  if (amount === "all") {
    amount = 0;

    from.iterate_inventory((owner: XR_game_object, item: XR_game_object) => {
      if (item.section() === itemSection) {
        from.transfer_item(item, to);
        amount = (amount as TCount) + 1;
      }
    }, from);

    // Transfer specified items count.
  } else if (amount > 0) {
    remaining = amount;
    from.iterate_inventory((owner: XR_game_object, item: XR_game_object) => {
      if (item.section() === itemSection && remaining > 0) {
        from.transfer_item(item, to);
        remaining -= 1;
      }
    }, from);
  } else {
    abort("Wrong parameters in function 'transferItemsFromActor', amount is negative: '%s'.", tostring(amount));
  }

  assert(
    remaining === 0,
    "Actor do not has enough items. Transferred [%s], needed [%s].",
    tostring(amount - remaining),
    tostring(amount)
  );

  // Calculate correct ammo count.
  if (ammo[itemSection as TAmmoItem]) {
    const boxSize: TCount = SYSTEM_INI.r_s32(itemSection, "box_size");

    amount = amount * boxSize;
  }

  EventsManager.getInstance().emitEvent<IItemRelocatedNotification>(EGameEvent.NOTIFICATION, {
    type: ENotificationType.ITEM,
    direction: ENotificationDirection.OUT,
    itemSection,
    amount: amount,
  });
}

/**
 * Transfer items by section/count from object to actor.
 * If object is missing some of them, create new ones with server object utils.
 */
export function transferItemsToActor(from: XR_game_object, itemSection: TSection, amount: TCount = 1): void {
  const actor: XR_game_object = registry.actor;
  let remaining: TCount = 0;

  if (amount > 1) {
    remaining = amount;

    from.iterate_inventory((owner: XR_game_object, item: XR_game_object) => {
      if (item.section() === itemSection && remaining !== 0) {
        from.transfer_item(item, actor);
        remaining -= 1;
      }
    }, actor);
  } else if (from.object(itemSection) !== null) {
    from.transfer_item(from.object(itemSection) as XR_game_object, actor);
  } else {
    alife().create(itemSection, actor.position(), actor.level_vertex_id(), actor.game_vertex_id(), actor.id());
  }

  if (remaining !== 0) {
    for (const it of $range(1, remaining)) {
      alife().create(itemSection, actor.position(), actor.level_vertex_id(), actor.game_vertex_id(), actor.id());
    }
  }

  // Correct count if ammo section is provided.
  if (ammo[itemSection as TAmmoItem] !== null) {
    amount = amount * SYSTEM_INI.r_s32(itemSection, "box_size");
  }

  EventsManager.getInstance().emitEvent<IItemRelocatedNotification>(EGameEvent.NOTIFICATION, {
    type: ENotificationType.ITEM,
    direction: ENotificationDirection.IN,
    itemSection,
    amount,
  });
}

/**
 * todo: probably use transfer utils and deprecate this one.
 */
export function relocateQuestItemsBySection(
  object: XR_game_object,
  itemSection: TSection,
  direction: ENotificationDirection,
  amount: TCount = 1
): void {
  const actor: XR_game_object = registry.actor;

  for (const it of $range(1, amount)) {
    if (direction === ENotificationDirection.IN) {
      alife().create(itemSection, actor.position(), actor.level_vertex_id(), actor.game_vertex_id(), actor.id());
    } else if (direction === ENotificationDirection.OUT) {
      assertDefined(object, "Couldn't relocate item to NULL.");

      actor.transfer_item(actor.object(itemSection) as XR_game_object, object);
    } else {
      abort("Unexpected direction received for relocation of quest items: '%s'.", direction);
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
