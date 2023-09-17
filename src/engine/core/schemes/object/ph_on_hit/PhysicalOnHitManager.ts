import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemePhysicalOnHitState } from "@/engine/core/schemes/object/ph_on_hit/ISchemePhysicalOnHitState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { NIL } from "@/engine/lib/constants/words";
import { ClientObject, Optional, TCount, TIndex, TName, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager to handle hits logic of physical game objects.
 */
export class PhysicalOnHitManager extends AbstractSchemeManager<ISchemePhysicalOnHitState> {
  public override onHit(
    object: ClientObject,
    amount: TCount,
    direction: Vector,
    who: Optional<ClientObject>,
    boneIndex: TIndex
  ): void {
    const whoName: TName = who ? who.name() : NIL;

    logger.info("Physical object hit:", object.name(), "<-", whoName, amount);

    if (registry.objects.get(this.object.id()).activeScheme) {
      trySwitchToAnotherSection(object, this.state);
    }
  }
}
