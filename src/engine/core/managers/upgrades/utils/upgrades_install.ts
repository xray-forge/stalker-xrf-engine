import { ClientObject, LuaArray, TSection } from "@/engine/lib/types";

/**
 * todo;
 */
export function installRandomUpgrade(object: ClientObject, group: LuaArray<TSection>): boolean {
  const newUpgrade: TSection = group.length() > 1 ? table.random(group) : group.get(1);

  return object.install_upgrade(newUpgrade);
}
