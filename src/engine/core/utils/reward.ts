import { registry, SYSTEM_INI } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import {
  ENotificationDirection,
  ENotificationType,
  IItemRelocatedNotification,
  IMoneyRelocatedNotification,
} from "@/engine/core/managers/notifications/notifications_types";
import { abort, assert, assertDefined } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { spawnItemsForObject } from "@/engine/core/utils/spawn";
import { ammo, TAmmoItem } from "@/engine/lib/constants/items/ammo";
import { GameObject, Optional, TCount, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Give provided amount of money to actor.
 *
 * @param amount - money to give to actor
 */
export function giveMoneyToActor(amount: TCount): void {
  logger.info("Award actor with money:", amount);

  registry.actor.give_money(amount);

  EventsManager.emitEvent<IMoneyRelocatedNotification>(EGameEvent.NOTIFICATION, {
    type: ENotificationType.MONEY,
    direction: ENotificationDirection.IN,
    amount,
  });
}

/**
 * Transfer provided amount of money from actor to object.
 *
 * @param to - target object to transfer money from actor
 * @param amount - money to transfer
 */
export function transferMoneyFromActor(to: GameObject, amount: TCount): void {
  assertDefined(to, "Couldn't relocate money to 'nil'.");

  registry.actor.transfer_money(amount, to);

  EventsManager.emitEvent<IMoneyRelocatedNotification>(EGameEvent.NOTIFICATION, {
    type: ENotificationType.MONEY,
    direction: ENotificationDirection.OUT,
    amount,
  });
}

/**
 * Transfer item section with desired count from actor to provided object.
 *
 * @param to - target to transfer items from actor
 * @param itemSection - section of transferred items
 * @param count - count of items to transfer
 */
export function transferItemsFromActor(to: GameObject, itemSection: TSection, count: TCount | "all" = 1): void {
  logger.info("Transfer items from actor:", to.name(), itemSection, count);

  const from: GameObject = registry.actor;
  let remaining: TCount = 0;

  // Transfer all items.
  if (count === "all") {
    count = 0;

    from.iterate_inventory((owner: GameObject, item: GameObject) => {
      if (item.section() === itemSection) {
        from.transfer_item(item, to);
        count = (count as TCount) + 1;
      }
    }, from);

    // Transfer specified items count.
  } else if (count > 0) {
    remaining = count;
    from.iterate_inventory((owner: GameObject, item: GameObject) => {
      if (item.section() === itemSection && remaining > 0) {
        from.transfer_item(item, to);
        remaining -= 1;
      }
    }, from);
  } else {
    abort("Wrong parameters in function 'transferItemsFromActor', amount is negative: '%s'.", tostring(count));
  }

  assert(
    remaining === 0,
    "Actor do not has enough '%s' items. Transferred '%s', needed '%s'.",
    tostring(itemSection),
    tostring(count - remaining),
    tostring(count)
  );

  // Calculate correct ammo count.
  if (ammo[itemSection as TAmmoItem]) {
    const boxSize: TCount = SYSTEM_INI.r_s32(itemSection, "box_size");

    count = count * boxSize;
  }

  EventsManager.emitEvent<IItemRelocatedNotification>(EGameEvent.NOTIFICATION, {
    type: ENotificationType.ITEM,
    direction: ENotificationDirection.OUT,
    itemSection,
    amount: count,
  });
}

/**
 * Transfer items by section/count from object to actor.
 * If object is missing some of them, create new ones with server object utils.
 *
 * @param from - object to transfer items from
 * @param itemSection - section of items to transfer
 * @param count - count of items to transfer
 */
export function transferItemsToActor(from: GameObject, itemSection: TSection, count: TCount = 1): void {
  const actor: GameObject = registry.actor;
  let remaining: TCount = 0;

  if (count > 1) {
    remaining = count;

    from.iterate_inventory((owner: GameObject, item: GameObject) => {
      if (item.section() === itemSection && remaining !== 0) {
        from.transfer_item(item, actor);
        remaining -= 1;
      }
    }, actor);
  } else if (from.object(itemSection) !== null) {
    from.transfer_item(from.object(itemSection) as GameObject, actor);
  } else {
    registry.simulator.create(
      itemSection,
      actor.position(),
      actor.level_vertex_id(),
      actor.game_vertex_id(),
      actor.id()
    );
  }

  if (remaining !== 0) {
    for (const it of $range(1, remaining)) {
      registry.simulator.create(
        itemSection,
        actor.position(),
        actor.level_vertex_id(),
        actor.game_vertex_id(),
        actor.id()
      );
    }
  }

  // Correct count if ammo section is provided.
  if (ammo[itemSection as TAmmoItem] !== null) {
    count = count * SYSTEM_INI.r_s32(itemSection, "box_size");
  }

  EventsManager.emitEvent<IItemRelocatedNotification>(EGameEvent.NOTIFICATION, {
    type: ENotificationType.ITEM,
    direction: ENotificationDirection.IN,
    itemSection,
    amount: count,
  });
}

/**
 * Create items by section/count for actor.
 *
 * @param itemSection - section of item to give to actor
 * @param count - count of items to give
 */
export function giveItemsToActor(itemSection: TSection, count: TCount = 1): void {
  const itemsSpawned: TCount = spawnItemsForObject(registry.actor, itemSection, count);

  EventsManager.emitEvent<IItemRelocatedNotification>(EGameEvent.NOTIFICATION, {
    type: ENotificationType.ITEM,
    direction: ENotificationDirection.IN,
    itemSection,
    amount: itemsSpawned,
  });
}

/**
 * Delete items by section for actor.
 *
 * @param itemSection - section to take from actor
 */
export function takeItemFromActor(itemSection: TSection): void {
  const inventoryItem: Optional<GameObject> = registry.actor.object(itemSection);

  assertDefined(inventoryItem, "Actor has no item '%s' to take.", itemSection);

  registry.simulator.release(registry.simulator.object(inventoryItem.id()), true);

  EventsManager.emitEvent<IItemRelocatedNotification>(EGameEvent.NOTIFICATION, {
    type: ENotificationType.ITEM,
    direction: ENotificationDirection.OUT,
    itemSection,
    amount: 1,
  });
}
