import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { registry } from "@/engine/core/database";
import { ISchemePhysicalIdleState } from "@/engine/core/schemes/physical/ph_idle/ph_idle_types";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { TConditionList } from "@/engine/core/utils/ini/ini_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { GameObject, Optional, TCount, TIndex, Vector } from "@/engine/lib/types";

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
    who: Optional<GameObject>,
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
