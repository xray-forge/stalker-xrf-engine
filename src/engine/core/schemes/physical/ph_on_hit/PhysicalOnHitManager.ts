import { GameObject, Vector } from "xray16/alias";
import { Nillable, TCount, TIndex } from "xray16/lib";
import { $filename } from "xray16/macros";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { registry } from "@/engine/core/database";
import { ISchemePhysicalOnHitState } from "@/engine/core/schemes/physical/ph_on_hit/ph_on_hit_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager to handle hits logic of physical game objects.
 */
export class PhysicalOnHitManager extends AbstractSchemeManager<ISchemePhysicalOnHitState> {
  public override onHit(
    object: GameObject,
    amount: TCount,
    direction: Vector,
    who: Nillable<GameObject>,
    boneIndex: TIndex
  ): void {
    logger.info("Physical object hit: '%s' '%s' '%s'", object.name(), boneIndex, amount);

    if (registry.objects.get(object.id()).activeScheme) {
      trySwitchToAnotherSection(object, this.state);
    }
  }
}
