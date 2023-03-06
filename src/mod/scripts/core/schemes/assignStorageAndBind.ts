import { XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { EScheme, TSection } from "@/mod/lib/types/scheme";
import { IRegistryObjectState, registry } from "@/mod/scripts/core/database";
import { IBaseSchemeState } from "@/mod/scripts/core/schemes/base/IBaseSchemeState";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("assignStorageAndBind");

/**
 * todo
 * todo
 * todo
 * todo
 */
export function assignStorageAndBind<T extends IBaseSchemeState>(
  object: XR_game_object,
  ini: XR_ini_file,
  scheme: EScheme,
  section: Optional<TSection>
): T {
  logger.info("Assign storage and bind:", object.name(), "->", scheme, "->", section);

  const objectState: IRegistryObjectState = registry.objects.get(object.id());
  let schemeState: Optional<T> = objectState[scheme] as Optional<T>;

  if (schemeState === null) {
    schemeState = {
      npc: object,
    } as T;

    objectState[scheme] = schemeState;

    registry.schemes.get(scheme).addToBinder(object, ini, scheme, section as TSection, schemeState);
  }

  schemeState.scheme = scheme;
  schemeState.section = section;
  schemeState.ini = ini;

  return schemeState;
}
