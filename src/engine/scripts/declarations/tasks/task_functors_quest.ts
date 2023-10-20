import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { extern } from "@/engine/core/utils/binding";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { GameObject, Optional, TLabel, TRate, TStringId } from "@/engine/lib/types";
import { zatB29AfTable, zatB29InfopBringTable } from "@/engine/scripts/declarations/dialogs/dialogs_zaton";

/**
 * todo;
 */
extern("task_functors.zat_b29_adv_title", (): Optional<string> => {
  const actor: GameObject = registry.actor;
  let title: Optional<string> = null;

  for (const it of $range(16, 23)) {
    if (hasInfoPortion(zatB29InfopBringTable.get(it)) && actor.object(zatB29AfTable.get(it))) {
      title = "zat_b29_simple_bring_title_" + it;
      break;
    } else if (hasInfoPortion(zatB29InfopBringTable.get(it))) {
      title = "zat_b29_simple_find_title_" + it;
      break;
    }
  }

  return title;
});

/**
 * todo;
 */
extern("task_functors.zat_b29_adv_descr", () => {
  let descr: TLabel = "";
  let fAf: TRate = 0;
  const actor: GameObject = registry.actor;

  for (const i of $range(16, 23)) {
    if (hasInfoPortion(zatB29InfopBringTable.get(i)) && actor.object(zatB29AfTable.get(i))) {
      fAf = 1;
      descr = "zat_b29_simple_bring_text_5";
      if (
        hasInfoPortion("zat_b29_stalker_rival_1_found_af") &&
        hasInfoPortion("zat_b29_first_rival_taken_out") &&
        fAf !== 0
      ) {
        return descr;
      } else if (
        hasInfoPortion("zat_b29_stalker_rival_2_found_af") &&
        hasInfoPortion("zat_b29_second_rival_taken_out") &&
        fAf !== 0
      ) {
        return descr;
      } else if (hasInfoPortion("zat_b29_linker_take_af_from_rival")) {
        descr = "zat_b29_simple_bring_text_4";
      } else if (hasInfoPortion("zat_b29_stalkers_rivals_found_af")) {
        descr = "zat_b29_simple_bring_text_3";
      } else if (hasInfoPortion("zat_b29_rivals_search") && hasInfoPortion("zat_b29_exclusive_conditions")) {
        descr = "zat_b29_simple_bring_text_1";
      } else if (hasInfoPortion("zat_b29_rivals_search")) {
        descr = "zat_b29_simple_bring_text_2";
      }

      break;
    } else if (hasInfoPortion(zatB29InfopBringTable.get(i))) {
      descr = "zat_b29_simple_find_text_5";

      if (
        hasInfoPortion("zat_b29_stalker_rival_1_found_af") &&
        hasInfoPortion("zat_b29_first_rival_taken_out") &&
        fAf !== 0
      ) {
        return descr;
      } else if (
        hasInfoPortion("zat_b29_stalker_rival_2_found_af") &&
        hasInfoPortion("zat_b29_second_rival_taken_out") &&
        fAf !== 0
      ) {
        return descr;
      } else if (hasInfoPortion("zat_b29_linker_take_af_from_rival")) {
        descr = "zat_b29_simple_find_text_4";
      } else if (hasInfoPortion("zat_b29_stalkers_rivals_found_af")) {
        descr = "zat_b29_simple_find_text_3";
      } else if (hasInfoPortion("zat_b29_rivals_search") && hasInfoPortion("zat_b29_exclusive_conditions")) {
        descr = "zat_b29_simple_find_text_1";
      } else if (hasInfoPortion("zat_b29_rivals_search")) {
        descr = "zat_b29_simple_find_text_2";
      }

      break;
    }
  }

  return descr;
});

/**
 * todo;
 */
extern("task_functors.zat_b29_adv_target", () => {
  let targetObjectId: TStringId = "zat_a2_stalker_barmen";
  let artefact: Optional<TStringId> = null;
  const actor: GameObject = registry.actor;

  for (const i of $range(16, 23)) {
    if (hasInfoPortion(zatB29InfopBringTable.get(i)) && actor.object(zatB29AfTable.get(i))) {
      artefact = zatB29AfTable.get(i);
      break;
    }
  }

  if (!hasInfoPortion("zat_b29_linker_take_af_from_rival") && hasInfoPortion("zat_b29_stalkers_rivals_found_af")) {
    if (hasInfoPortion("zat_b29_stalker_rival_1_found_af")) {
      if (!hasInfoPortion("zat_b29_first_rival_taken_out")) {
        if (hasInfoPortion("zat_b29_exclusive_conditions")) {
          targetObjectId = "zat_b29_stalker_rival_1";
        } else {
          targetObjectId = "zat_b29_stalker_rival_default_1";
        }
      } else if (artefact === null) {
        if (hasInfoPortion("zat_b29_exclusive_conditions")) {
          targetObjectId = "zat_b29_stalker_rival_1";
        } else {
          targetObjectId = "zat_b29_stalker_rival_default_1";
        }
      }
    } else if (hasInfoPortion("zat_b29_stalker_rival_2_found_af")) {
      if (!hasInfoPortion("zat_b29_second_rival_taken_out")) {
        if (hasInfoPortion("zat_b29_exclusive_conditions")) {
          targetObjectId = "zat_b29_stalker_rival_2";
        } else {
          targetObjectId = "zat_b29_stalker_rival_default_2";
        }
      } else if (artefact === null) {
        if (hasInfoPortion("zat_b29_exclusive_conditions")) {
          targetObjectId = "zat_b29_stalker_rival_2";
        } else {
          targetObjectId = "zat_b29_stalker_rival_default_2";
        }
      }
    }

    return getObjectIdByStoryId(targetObjectId);
  }

  if (artefact !== null) {
    return getObjectIdByStoryId(targetObjectId);
  }

  return null;
});
