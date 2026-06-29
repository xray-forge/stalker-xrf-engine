import { LuaArray, TStringId } from "@/engine/lib/types";

/**
 * Item upgrade branch index identifying which of the upgrade branches an upgrade belongs to.
 */
export type TItemUpgradeBranch = 0 | 1 | 2;

/**
 * Descriptor of possible item upgrade.
 * Contains self ID and group ID.
 */
export interface IUpgradeDescriptor {
  id: TStringId;
  groupId: TStringId;
}

/**
 * Alias type of upgrade descriptors list.
 */

export type TUpgradesList = LuaArray<IUpgradeDescriptor>;
