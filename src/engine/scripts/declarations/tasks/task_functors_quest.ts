import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { extern } from "@/engine/core/utils/binding";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { GameObject, Optional, TLabel, TSection, TStringId } from "@/engine/lib/types";
import { zatB29AfTable, zatB29InfopBringTable } from "@/engine/scripts/declarations/dialogs/dialogs_zaton";

/**
 * Get correct title for zat_b29 treasure hunters quest.
 */
extern("task_functors.zat_b29_adv_title", (): Optional<TLabel> => {
  for (const it of $range(16, 23)) {
    if (hasInfoPortion(zatB29InfopBringTable.get(it))) {
      return registry.actor.object(zatB29AfTable.get(it))
        ? "zat_b29_simple_bring_title_" + it
        : "zat_b29_simple_find_title_" + it;
    }
  }

  return null;
});

/**
 * Get correct description for zat_b29 treasure hunters quest.
 */
extern("task_functors.zat_b29_adv_descr", (): Optional<TLabel> => {
  for (const it of $range(16, 23)) {
    if (hasInfoPortion(zatB29InfopBringTable.get(it))) {
      if (registry.actor.object(zatB29AfTable.get(it))) {
        if (hasInfoPortion("zat_b29_stalker_rival_1_found_af") && hasInfoPortion("zat_b29_first_rival_taken_out")) {
          return "zat_b29_simple_bring_text_5";
        } else if (
          hasInfoPortion("zat_b29_stalker_rival_2_found_af") &&
          hasInfoPortion("zat_b29_second_rival_taken_out")
        ) {
          return "zat_b29_simple_bring_text_5";
        } else if (hasInfoPortion("zat_b29_linker_take_af_from_rival")) {
          return "zat_b29_simple_bring_text_4";
        } else if (hasInfoPortion("zat_b29_stalkers_rivals_found_af")) {
          return "zat_b29_simple_bring_text_3";
        } else if (hasInfoPortion("zat_b29_rivals_search")) {
          return hasInfoPortion("zat_b29_exclusive_conditions")
            ? "zat_b29_simple_bring_text_1"
            : "zat_b29_simple_bring_text_2";
        }

        return "zat_b29_simple_bring_text_5";
      } else {
        if (hasInfoPortion("zat_b29_linker_take_af_from_rival")) {
          return "zat_b29_simple_find_text_4";
        } else if (hasInfoPortion("zat_b29_stalkers_rivals_found_af")) {
          return "zat_b29_simple_find_text_3";
        } else if (hasInfoPortion("zat_b29_rivals_search")) {
          return hasInfoPortion("zat_b29_exclusive_conditions")
            ? "zat_b29_simple_find_text_1"
            : "zat_b29_simple_find_text_2";
        }

        return "zat_b29_simple_find_text_5";
      }
    }
  }

  return null;
});

/**
 * todo;
 */
extern("task_functors.zat_b29_adv_target", () => {
  const actor: GameObject = registry.actor;

  let targetObjectId: TStringId = "zat_a2_stalker_barmen";
  let artefact: Optional<TSection> = null;

  // Get available search artefact.
  for (const it of $range(16, 23)) {
    if (hasInfoPortion(zatB29InfopBringTable.get(it)) && actor.object(zatB29AfTable.get(it))) {
      artefact = zatB29AfTable.get(it);
      break;
    }
  }

  if (!hasInfoPortion("zat_b29_linker_take_af_from_rival") && hasInfoPortion("zat_b29_stalkers_rivals_found_af")) {
    if (hasInfoPortion("zat_b29_stalker_rival_1_found_af")) {
      if (!hasInfoPortion("zat_b29_first_rival_taken_out")) {
        targetObjectId = hasInfoPortion("zat_b29_exclusive_conditions")
          ? "zat_b29_stalker_rival_1"
          : "zat_b29_stalker_rival_default_1";
      } else if (!artefact) {
        targetObjectId = hasInfoPortion("zat_b29_exclusive_conditions")
          ? "zat_b29_stalker_rival_1"
          : "zat_b29_stalker_rival_default_1";
      }
    } else if (hasInfoPortion("zat_b29_stalker_rival_2_found_af")) {
      if (!hasInfoPortion("zat_b29_second_rival_taken_out")) {
        targetObjectId = hasInfoPortion("zat_b29_exclusive_conditions")
          ? "zat_b29_stalker_rival_2"
          : "zat_b29_stalker_rival_default_2";
      } else if (!artefact) {
        targetObjectId = hasInfoPortion("zat_b29_exclusive_conditions")
          ? "zat_b29_stalker_rival_2"
          : "zat_b29_stalker_rival_default_2";
      }
    }

    return getObjectIdByStoryId(targetObjectId);
  }

  return artefact ? getObjectIdByStoryId(targetObjectId) : null;
});
