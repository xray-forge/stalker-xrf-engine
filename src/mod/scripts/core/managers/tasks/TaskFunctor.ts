import { game } from "xray16";

import { captions } from "@/mod/globals/captions";
import { Optional, TSection } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { SurgeManager } from "@/mod/scripts/core/managers/SurgeManager";
import { hasAlifeInfo } from "@/mod/scripts/utils/actor";
import { getStoryObject } from "@/mod/scripts/utils/alife";
import { parseCondList, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";

export function condlist(id: string, field: string, p: string): Optional<TSection> {
  const parsed_condlist = parseCondList(null, "task", "task_condlist", p);

  return pickSectionFromCondList(registry.actor, null, parsed_condlist);
}

export function zat_b29_adv_title(id: string, field: string, p: string): Optional<string> {
  const actor = registry.actor;
  let title: Optional<string> = null;

  for (const i of $range(16, 23)) {
    if (
      hasAlifeInfo(get_global("dialogs_zaton").zat_b29_infop_bring_table[i]) &&
      actor.object(get_global("dialogs_zaton").zat_b29_af_table[i])
    ) {
      title = "zat_b29_simple_bring_title_" + i;
      break;
    } else if (hasAlifeInfo(get_global("dialogs_zaton").zat_b29_infop_bring_table[i])) {
      title = "zat_b29_simple_find_title_" + i;
      break;
    }
  }

  return title;
}

export function zat_b29_adv_descr(id: string, field: string, p: string) {
  let descr = "";
  let f_af = 0;
  const actor = registry.actor;

  for (const i of $range(16, 23)) {
    if (
      hasAlifeInfo(get_global("dialogs_zaton").zat_b29_infop_bring_table[i]) &&
      actor.object(get_global("dialogs_zaton").zat_b29_af_table[i])
    ) {
      f_af = 1;
      descr = "zat_b29_simple_bring_text_5";
      if (
        hasAlifeInfo("zat_b29_stalker_rival_1_found_af") &&
        hasAlifeInfo("zat_b29_first_rival_taken_out") &&
        f_af !== 0
      ) {
        return descr;
      } else if (
        hasAlifeInfo("zat_b29_stalker_rival_2_found_af") &&
        hasAlifeInfo("zat_b29_second_rival_taken_out") &&
        f_af !== 0
      ) {
        return descr;
      } else if (hasAlifeInfo("zat_b29_linker_take_af_from_rival")) {
        descr = "zat_b29_simple_bring_text_4";
      } else if (hasAlifeInfo("zat_b29_stalkers_rivals_found_af")) {
        descr = "zat_b29_simple_bring_text_3";
      } else if (hasAlifeInfo("zat_b29_rivals_search") && hasAlifeInfo("zat_b29_exclusive_conditions")) {
        descr = "zat_b29_simple_bring_text_1";
      } else if (hasAlifeInfo("zat_b29_rivals_search")) {
        descr = "zat_b29_simple_bring_text_2";
      }

      break;
    } else if (hasAlifeInfo(get_global("dialogs_zaton").zat_b29_infop_bring_table[i])) {
      descr = "zat_b29_simple_find_text_5";

      if (
        hasAlifeInfo("zat_b29_stalker_rival_1_found_af") &&
        hasAlifeInfo("zat_b29_first_rival_taken_out") &&
        f_af !== 0
      ) {
        return descr;
      } else if (
        hasAlifeInfo("zat_b29_stalker_rival_2_found_af") &&
        hasAlifeInfo("zat_b29_second_rival_taken_out") &&
        f_af !== 0
      ) {
        return descr;
      } else if (hasAlifeInfo("zat_b29_linker_take_af_from_rival")) {
        descr = "zat_b29_simple_find_text_4";
      } else if (hasAlifeInfo("zat_b29_stalkers_rivals_found_af")) {
        descr = "zat_b29_simple_find_text_3";
      } else if (hasAlifeInfo("zat_b29_rivals_search") && hasAlifeInfo("zat_b29_exclusive_conditions")) {
        descr = "zat_b29_simple_find_text_1";
      } else if (hasAlifeInfo("zat_b29_rivals_search")) {
        descr = "zat_b29_simple_find_text_2";
      }

      break;
    }
  }

  return descr;
}

/**
 * todo;
 */
export function surge_task_title(): string {
  return SurgeManager.getInstance().isActorInCover()
    ? captions.hide_from_surge_name_2
    : captions.hide_from_surge_name_1;
}

/**
 * todo;
 */
export function surge_task_descr(): Optional<string> {
  return SurgeManager.getInstance().isActorInCover()
    ? game.translate_string(captions.hide_from_surge_descr_2_a)
    : game.translate_string(captions.hide_from_surge_descr_1_a);
}

export function target_condlist(id: string, field: string, p: string) {
  const cond_string = p;
  const parsed_condlist = parseCondList(null, "task", "task_condlist", cond_string);
  const value: Optional<TSection> = pickSectionFromCondList(registry.actor, null, parsed_condlist);

  if (value === null) {
    return null;
  }

  return getStoryObjectId(value);
}

export function zat_b29_adv_target(id: string, field: string, p: string) {
  let target_obj_id = "zat_a2_stalker_barmen";
  let af: Optional<string> = null;
  const actor = registry.actor;

  for (const i of $range(16, 23)) {
    if (
      hasAlifeInfo(get_global("dialogs_zaton").zat_b29_infop_bring_table[i]) &&
      actor.object(get_global("dialogs_zaton").zat_b29_af_table[i])
    ) {
      af = get_global("dialogs_zaton").zat_b29_af_table[i];
      break;
    }
  }

  if (!hasAlifeInfo("zat_b29_linker_take_af_from_rival") && hasAlifeInfo("zat_b29_stalkers_rivals_found_af")) {
    if (hasAlifeInfo("zat_b29_stalker_rival_1_found_af")) {
      if (!hasAlifeInfo("zat_b29_first_rival_taken_out")) {
        if (hasAlifeInfo("zat_b29_exclusive_conditions")) {
          target_obj_id = "zat_b29_stalker_rival_1";
        } else {
          target_obj_id = "zat_b29_stalker_rival_default_1";
        }
      } else if (af === null) {
        if (hasAlifeInfo("zat_b29_exclusive_conditions")) {
          target_obj_id = "zat_b29_stalker_rival_1";
        } else {
          target_obj_id = "zat_b29_stalker_rival_default_1";
        }
      }
    } else if (hasAlifeInfo("zat_b29_stalker_rival_2_found_af")) {
      if (!hasAlifeInfo("zat_b29_second_rival_taken_out")) {
        if (hasAlifeInfo("zat_b29_exclusive_conditions")) {
          target_obj_id = "zat_b29_stalker_rival_2";
        } else {
          target_obj_id = "zat_b29_stalker_rival_default_2";
        }
      } else if (af === null) {
        if (hasAlifeInfo("zat_b29_exclusive_conditions")) {
          target_obj_id = "zat_b29_stalker_rival_2";
        } else {
          target_obj_id = "zat_b29_stalker_rival_default_2";
        }
      }
    }

    return getStoryObjectId(target_obj_id);
  }

  if (af !== null) {
    return getStoryObjectId(target_obj_id);
  }

  return null;
}

export function surge_task_target(id: string, field: string, p: string): Optional<number> {
  return SurgeManager.getInstance().getTaskTarget();
}
