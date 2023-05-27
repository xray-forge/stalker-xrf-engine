import { game } from "xray16";

import { getPortableStoreValue, registry } from "@/engine/core/database";
import { extern } from "@/engine/core/utils/binding";
import { isBlackScreen } from "@/engine/core/utils/check/check";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
extern("xr_conditions.signal", (actor: ClientObject, npc: ClientObject, p: [string]): boolean => {
  if (p[0]) {
    const st = registry.objects.get(npc.id());
    const sigs = st[st.active_scheme!]!.signals;

    return sigs !== null && sigs.get(p[0]);
  } else {
    return false;
  }
});

/**
 * todo;
 */
extern(
  "xr_conditions.counter_greater",
  (actor: ClientObject, npc: ClientObject, p: [Optional<string>, Optional<number>]): boolean => {
    if (p[0] && p[1]) {
      return getPortableStoreValue(actor, p[0], 0) > p[1];
    } else {
      return false;
    }
  }
);

/**
 * todo;
 */
extern(
  "xr_conditions.counter_equal",
  (actor: ClientObject, npc: ClientObject, p: [Optional<string>, Optional<number>]): boolean => {
    if (p[0] && p[1]) {
      return getPortableStoreValue(actor, p[0], 0) === p[1];
    } else {
      return false;
    }
  }
);

/**
 * todo;
 */
extern("xr_conditions.has_active_tutorial", (): boolean => {
  return game.has_active_tutorial();
});

/**
 * todo;
 */
extern("xr_conditions.black_screen", (): boolean => {
  return isBlackScreen();
});
