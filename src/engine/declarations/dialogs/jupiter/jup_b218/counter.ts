import { GameObject } from "xray16/alias";
import { ACTOR_ID, extern } from "xray16/lib";

import { getPortableStoreValue } from "@/engine/core/database/portable_store";

/**
 * Check whether the b218 squad members count is not equal to three.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the squad count is not three.
 */
extern("dialogs_jupiter.jup_b218_counter_not_3", (_: GameObject, __: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "jup_b218_squad_members_count", 0 as number) !== 3;
});

/**
 * Check whether the b218 squad members count equals three.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the squad count is three.
 */
extern("dialogs_jupiter.jup_b218_counter_equal_3", (_: GameObject, __: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "jup_b218_squad_members_count", 0 as number) === 3;
});

/**
 * Check whether the b218 squad members count is not zero.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the squad count is not zero.
 */
extern("dialogs_jupiter.jup_b218_counter_not_0", (_: GameObject, __: GameObject): boolean => {
  return getPortableStoreValue(ACTOR_ID, "jup_b218_squad_members_count", 0 as number) !== 0;
});
