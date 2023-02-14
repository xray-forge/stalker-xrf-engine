import { XR_game_object, XR_ini_file } from "xray16";

import { AnyObject, Optional } from "@/mod/lib/types";
import { EScheme, TSection } from "@/mod/lib/types/configuration";
import { schemes, storage } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("assignStorageAndBind");

/**
 * todo
 * todo
 * todo
 * todo
 */
export function assignStorageAndBind(
  npc: XR_game_object,
  ini: XR_ini_file,
  scheme: EScheme,
  section: Optional<TSection>
): AnyObject {
  logger.info("Assign storage and bind:", npc.name(), "->", scheme, "->", section);

  const npc_id = npc.id();
  let state: AnyObject;

  if (!storage.get(npc_id)[scheme]) {
    storage.get(npc_id)[scheme] = {};
    state = storage.get(npc_id)[scheme];
    state["npc"] = npc;

    schemes.get(scheme).add_to_binder(npc, ini, scheme, section as TSection, state);
  } else {
    state = storage.get(npc_id)[scheme];
  }

  state["scheme"] = scheme;
  state["section"] = section;
  state["ini"] = ini;

  return state;
}
