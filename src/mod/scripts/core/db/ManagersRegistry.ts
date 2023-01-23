import { AnyObject } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ManagersRegistry");

export const managersRegistry: LuaTable<{ new (): AnyObject }, AnyObject> = new LuaTable();

export function getManagerInstance<T extends new () => AnyObject>(it: T): InstanceType<T> {
  if (!managersRegistry.get(it)) {
    managersRegistry.set(it, new it());
  }

  return managersRegistry.get(it) as any;
}
