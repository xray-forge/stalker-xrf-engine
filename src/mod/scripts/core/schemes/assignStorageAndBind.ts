import { XR_game_object, XR_ini_file } from "xray16";

import { AnyObject, Optional } from "@/mod/lib/types";
import { EScheme, TSection } from "@/mod/lib/types/scheme";
import { IStoredObject, registry } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("assignStorageAndBind");

/**
 * todo
 * todo
 * todo
 * todo
 */
export function assignStorageAndBind(
  object: XR_game_object,
  ini: XR_ini_file,
  scheme: EScheme,
  section: Optional<TSection>
): AnyObject {
  logger.info("Assign storage and bind:", object.name(), "->", scheme, "->", section);

  const objectState: IStoredObject = registry.objects.get(object.id());
  let schemeState: AnyObject = objectState[scheme];

  if (!schemeState) {
    schemeState = {};
    schemeState.npc = object;

    objectState[scheme] = schemeState;

    registry.schemes.get(scheme).add_to_binder(object, ini, scheme, section as TSection, schemeState);
  }

  schemeState.scheme = scheme;
  schemeState.section = section;
  schemeState.ini = ini;

  return schemeState;
}
