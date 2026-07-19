import { GameObject, Vector } from "xray16/alias";
import { Nillable, TCount, TIndex } from "xray16/lib";
import { $filename } from "xray16/macros";

import { registry } from "@/engine/core/database";
import { pickSectionFromCondList, TConditionList } from "@/engine/core/ini";
import { AbstractSchemeManager } from "@/engine/core/schemes/base";
import { ISchemePhysicalIdleState } from "@/engine/core/schemes/physical/ph_idle/ph_idle_types";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/schemes/runtime/scheme_switch";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager to handle idle state of physical objects.
 */
export class PhysicalIdleManager extends AbstractSchemeManager<ISchemePhysicalIdleState> {
  public override activate(): void {
    this.object.set_nonscript_usable(this.state.isNonscriptUsable);
  }

  public override deactivate(): void {
    this.object.set_tip_text("");
  }

  public update(): void {
    trySwitchToAnotherSection(this.object, this.state);
  }

  public override onHit(
    object: GameObject,
    amount: TCount,
    direction: Vector,
    who: Nillable<GameObject>,
    boneIndex: TIndex
  ): void {
    logger.info("Idle physical object hit: %s", this.object.name());

    if (this.state.bonesHitCondlists.has(boneIndex)) {
      switchObjectSchemeToSection(
        object,
        this.state.ini,
        pickSectionFromCondList(
          registry.actor,
          this.object,
          this.state.bonesHitCondlists.get(boneIndex).state as TConditionList
        )
      );
    }
  }

  public override onUse(): void {
    logger.info("Idle physical object use: %s", this.object.name());

    if (this.state.onUse) {
      switchObjectSchemeToSection(
        this.object,
        this.state.ini,
        pickSectionFromCondList(registry.actor, this.object, this.state.onUse.condlist)
      );
    }
  }
}
