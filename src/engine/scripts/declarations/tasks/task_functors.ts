import { game } from "xray16";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { extern } from "@/engine/core/utils/binding";
import { hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { parseConditionsList, TConditionList } from "@/engine/core/utils/parse";
import { captions } from "@/engine/lib/constants/captions/captions";
import { ClientObject, Optional, TLabel, TNumberId, TRate, TSection, TStringId } from "@/engine/lib/types";
import { zatB29AfTable, zatB29InfopBringTable } from "@/engine/scripts/declarations/dialogs/dialogs_zaton";

/**
 * todo;
 */
extern("task_functors.condlist", (id: TStringId, field: string, p: string): Optional<TSection> => {
  const conditionsList: TConditionList = parseConditionsList(p);

  return pickSectionFromCondList(registry.actor, null, conditionsList);
});

/**
 * todo;
 */
extern("task_functors.zat_b29_adv_title", (id: TStringId, field: string, p: string): Optional<string> => {
  const actor: ClientObject = registry.actor;
  let title: Optional<string> = null;

  for (const i of $range(16, 23)) {
    if (hasAlifeInfo(zatB29InfopBringTable.get(i)) && actor.object(zatB29AfTable.get(i))) {
      title = "zat_b29_simple_bring_title_" + i;
      break;
    } else if (hasAlifeInfo(zatB29InfopBringTable.get(i))) {
      title = "zat_b29_simple_find_title_" + i;
      break;
    }
  }

  return title;
});

/**
 * todo;
 */
extern("task_functors.zat_b29_adv_descr", (id: TStringId, field: string, p: string) => {
  let descr: TLabel = "";
  let fAf: TRate = 0;
  const actor: ClientObject = registry.actor;

  for (const i of $range(16, 23)) {
    if (hasAlifeInfo(zatB29InfopBringTable.get(i)) && actor.object(zatB29AfTable.get(i))) {
      fAf = 1;
      descr = "zat_b29_simple_bring_text_5";
      if (
        hasAlifeInfo("zat_b29_stalker_rival_1_found_af") &&
        hasAlifeInfo("zat_b29_first_rival_taken_out") &&
        fAf !== 0
      ) {
        return descr;
      } else if (
        hasAlifeInfo("zat_b29_stalker_rival_2_found_af") &&
        hasAlifeInfo("zat_b29_second_rival_taken_out") &&
        fAf !== 0
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
    } else if (hasAlifeInfo(zatB29InfopBringTable.get(i))) {
      descr = "zat_b29_simple_find_text_5";

      if (
        hasAlifeInfo("zat_b29_stalker_rival_1_found_af") &&
        hasAlifeInfo("zat_b29_first_rival_taken_out") &&
        fAf !== 0
      ) {
        return descr;
      } else if (
        hasAlifeInfo("zat_b29_stalker_rival_2_found_af") &&
        hasAlifeInfo("zat_b29_second_rival_taken_out") &&
        fAf !== 0
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
});

/**
 * todo;
 */
extern("task_functors.surge_task_title", (): string => {
  return SurgeManager.getInstance().isActorInCover()
    ? captions.hide_from_surge_name_2
    : captions.hide_from_surge_name_1;
});

/**
 * todo;
 */
extern("task_functors.surge_task_descr", (): Optional<string> => {
  return SurgeManager.getInstance().isActorInCover()
    ? game.translate_string(captions.hide_from_surge_descr_2_a)
    : game.translate_string(captions.hide_from_surge_descr_1_a);
});

/**
 * todo;
 */
extern("task_functors.target_condlist", (id: TStringId, field: string, conditionListString: string) => {
  const conditionsList: TConditionList = parseConditionsList(conditionListString);
  const value: Optional<TSection> = pickSectionFromCondList(registry.actor, null, conditionsList);

  if (value === null) {
    return null;
  }

  return getObjectIdByStoryId(value);
});

/**
 * todo;
 */
extern("task_functors.zat_b29_adv_target", (id: TStringId, field: string, p: string) => {
  let targetObjectId: TStringId = "zat_a2_stalker_barmen";
  let artefact: Optional<TStringId> = null;
  const actor: ClientObject = registry.actor;

  for (const i of $range(16, 23)) {
    if (hasAlifeInfo(zatB29InfopBringTable.get(i)) && actor.object(zatB29AfTable.get(i))) {
      artefact = zatB29AfTable.get(i);
      break;
    }
  }

  if (!hasAlifeInfo("zat_b29_linker_take_af_from_rival") && hasAlifeInfo("zat_b29_stalkers_rivals_found_af")) {
    if (hasAlifeInfo("zat_b29_stalker_rival_1_found_af")) {
      if (!hasAlifeInfo("zat_b29_first_rival_taken_out")) {
        if (hasAlifeInfo("zat_b29_exclusive_conditions")) {
          targetObjectId = "zat_b29_stalker_rival_1";
        } else {
          targetObjectId = "zat_b29_stalker_rival_default_1";
        }
      } else if (artefact === null) {
        if (hasAlifeInfo("zat_b29_exclusive_conditions")) {
          targetObjectId = "zat_b29_stalker_rival_1";
        } else {
          targetObjectId = "zat_b29_stalker_rival_default_1";
        }
      }
    } else if (hasAlifeInfo("zat_b29_stalker_rival_2_found_af")) {
      if (!hasAlifeInfo("zat_b29_second_rival_taken_out")) {
        if (hasAlifeInfo("zat_b29_exclusive_conditions")) {
          targetObjectId = "zat_b29_stalker_rival_2";
        } else {
          targetObjectId = "zat_b29_stalker_rival_default_2";
        }
      } else if (artefact === null) {
        if (hasAlifeInfo("zat_b29_exclusive_conditions")) {
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

/**
 * todo;
 */
extern("task_functors.surge_task_target", (id: TStringId, field: string, p: string): Optional<TNumberId> => {
  return SurgeManager.getInstance().getTargetCover()?.id() as Optional<TNumberId>;
});
