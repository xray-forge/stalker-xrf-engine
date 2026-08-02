import { GameObject } from "xray16/alias";
import { ACTOR_ID, extern, MAX_ALIFE_ID, Nillable, TCount, TNumberId } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { getObjectByStoryId, getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database";

import { materialsTable } from "./shared";

/**
 * Count the Jupiter b200 tech materials carried by the actor and store the found counter value.
 */
extern("xr_effects.jup_b200_count_found", (): void => {
  let count: TCount = 0;

  for (const [, materialId] of materialsTable) {
    const materialObject: Nillable<GameObject> = getObjectByStoryId(materialId);

    if (materialObject) {
      const parent: Nillable<GameObject> = materialObject.parent();

      if ($isNotNil(parent)) {
        const parentId: TNumberId = parent.id();

        if (parentId !== MAX_ALIFE_ID && parentId === ACTOR_ID) {
          count += 1;
        }
      }
    }
  }

  count += getPortableStoreValue(ACTOR_ID, "jup_b200_tech_materials_brought_counter", 0);
  setPortableStoreValue(ACTOR_ID, "jup_b200_tech_materials_found_counter", count);
});
