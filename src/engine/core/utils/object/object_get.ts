import { LuaLogger } from "@/engine/core/utils/logging";
import { AnyGameObject, GameObject, ServerObject, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * @param object - object to get ID from
 * @returns ID of the object
 */
export function getObjectId(object: AnyGameObject): TNumberId {
  return type(object.id) === "number" ? (object as ServerObject).id : (object as GameObject).id();
}
