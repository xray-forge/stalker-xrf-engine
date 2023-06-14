import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes/base";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils";
import { ISchemePhysicalIdleState } from "@/engine/core/schemes/ph_idle/ISchemePhysicalIdleState";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { TConditionList } from "@/engine/core/utils/ini/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, Optional, TCount, TIndex, TSection, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class PhysicalIdleManager extends AbstractSchemeManager<ISchemePhysicalIdleState> {
  public override resetScheme(): void {
    this.object.set_nonscript_usable(this.state.nonscript_usable);
  }

  public override update(): void {
    trySwitchToAnotherSection(this.object, this.state, registry.actor);
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
    logger.info("Idle hit:", this.object.name());

    if (this.state.hit_on_bone.has(boneIndex)) {
      const section: TSection = pickSectionFromCondList(
        registry.actor,
        this.object,
        this.state.hit_on_bone.get(boneIndex).state as TConditionList
      )!;

      switchObjectSchemeToSection(object, this.state.ini!, section);
    }
  }

  public override onUse(): Optional<boolean> {
    logger.info("Idle use:", this.object.name());

    if (this.state.on_use) {
      if (
        switchObjectSchemeToSection(
          this.object,
          this.state.ini!,
          pickSectionFromCondList(registry.actor, this.object, this.state.on_use.condlist)!
        )
      ) {
        return true;
      }
    }

    return null;
  }
}
