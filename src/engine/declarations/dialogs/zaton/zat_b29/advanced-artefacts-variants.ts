import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { registry } from "@/engine/core/database";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { zatB29AfTable, zatB29InfopTable } from "@/engine/scripts/quests/zaton/zat_b29/advanced_artefacts_data";

/**
 * Check whether the first advanced artefact is requested but missing from the actor.
 */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_1",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(16)) && !registry.actor.object(zatB29AfTable.get(16));
  }
);

/** Check whether the second advanced artefact is requested but missing from the actor. */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_2",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(17)) && !registry.actor.object(zatB29AfTable.get(17));
  }
);

/** Check whether the third advanced artefact is requested but missing from the actor. */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_3",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(18)) && !registry.actor.object(zatB29AfTable.get(18));
  }
);

/** Check whether the fourth advanced artefact is requested but missing from the actor. */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_4",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(19)) && !registry.actor.object(zatB29AfTable.get(19));
  }
);

/** Check whether the fifth advanced artefact is requested but missing from the actor. */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_5",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(20)) && !registry.actor.object(zatB29AfTable.get(20));
  }
);

/** Check whether the sixth advanced artefact is requested but missing from the actor. */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_6",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(21)) && !registry.actor.object(zatB29AfTable.get(21));
  }
);

/** Check whether the seventh advanced artefact is requested but missing from the actor. */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_7",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(22)) && !registry.actor.object(zatB29AfTable.get(22));
  }
);

/** Check whether the eighth advanced artefact is requested but missing from the actor. */
extern(
  "dialogs_zaton.zat_b29_actor_do_not_has_adv_task_af_8",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(23)) && !registry.actor.object(zatB29AfTable.get(23));
  }
);

/** Check whether the first advanced artefact is requested and carried by the actor. */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_1",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(16)) && $isNotNil(registry.actor.object(zatB29AfTable.get(16)));
  }
);

/** Check whether the second advanced artefact is requested and carried by the actor. */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_2",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(17)) && $isNotNil(registry.actor.object(zatB29AfTable.get(17)));
  }
);

/** Check whether the third advanced artefact is requested and carried by the actor. */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_3",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(18)) && $isNotNil(registry.actor.object(zatB29AfTable.get(18)));
  }
);

/** Check whether the fourth advanced artefact is requested and carried by the actor. */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_4",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(19)) && $isNotNil(registry.actor.object(zatB29AfTable.get(19)));
  }
);

/** Check whether the fifth advanced artefact is requested and carried by the actor. */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_5",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(20)) && $isNotNil(registry.actor.object(zatB29AfTable.get(20)));
  }
);

/** Check whether the sixth advanced artefact is requested and carried by the actor. */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_6",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(21)) && $isNotNil(registry.actor.object(zatB29AfTable.get(21)));
  }
);

/** Check whether the seventh advanced artefact is requested and carried by the actor. */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_7",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(22)) && $isNotNil(registry.actor.object(zatB29AfTable.get(22)));
  }
);

/** Check whether the eighth advanced artefact is requested and carried by the actor. */
extern(
  "dialogs_zaton.zat_b29_actor_has_adv_task_af_8",
  (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
    return hasInfoPortion(zatB29InfopTable.get(23)) && $isNotNil(registry.actor.object(zatB29AfTable.get(23)));
  }
);
