import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemePhysicalIdleState } from "@/engine/core/schemes/ph_idle/ISchemePhysicalIdleState";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { TConditionList } from "@/engine/core/utils/ini/ini_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { ClientObject, Optional, TCount, TIndex, TSection, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager to handle idle state of physical objects.
 */
export class PhysicalIdleManager extends AbstractSchemeManager<ISchemePhysicalIdleState> {
  public override resetScheme(): void {
    this.object.set_nonscript_usable(this.state.isNonscriptUsable);
  }

  public update(): void {
    trySwitchToAnotherSection(this.object, this.state);
  }

  public override deactivate(): void {
    this.object.set_tip_text("");
  }

  public override onHit(
    object: ClientObject,
    amount: TCount,
    direction: Vector,
    who: Optional<ClientObject>,
    boneIndex: TIndex
  ): void {
    logger.info("Idle physical object hit:", this.object.name());

    if (this.state.bonesHitCondlists.has(boneIndex)) {
      const section: TSection = pickSectionFromCondList(
        registry.actor,
        this.object,
        this.state.bonesHitCondlists.get(boneIndex).state as TConditionList
      )!;

      switchObjectSchemeToSection(object, this.state.ini, section);
    }
  }

  public override onUse(): void {
    logger.info("Idle physical object  use:", this.object.name());

    if (this.state.onUse) {
      switchObjectSchemeToSection(
        this.object,
        this.state.ini,
        pickSectionFromCondList(registry.actor, this.object, this.state.onUse.condlist)
      );
    }
  }
}
