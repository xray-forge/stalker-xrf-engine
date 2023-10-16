import { LuaArray, TStringId } from "@/engine/lib/types";

/**
 * todo;
 */
export type TItemUpgradeBranch = 0 | 1 | 2;

/**
 * todo;
 */
export interface IUpgradeDescriptor {
  id: TStringId;
  groupId: TStringId;
}

/**
 * todo;
 */

export type TUpgradesList = LuaArray<IUpgradeDescriptor>;
