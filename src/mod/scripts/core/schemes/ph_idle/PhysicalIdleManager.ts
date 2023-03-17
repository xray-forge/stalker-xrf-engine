import { XR_game_object, XR_vector } from "xray16";

import { Optional, TCount, TIndex, TSection } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/base/trySwitchToAnotherSection";
import { ISchemePhysicalIdleState } from "@/mod/scripts/core/schemes/ph_idle/ISchemePhysicalIdleState";
import { switchToSection } from "@/mod/scripts/core/schemes/switchToSection";
import { pickSectionFromCondList } from "@/mod/scripts/utils/config";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { TConditionList } from "@/mod/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class PhysicalIdleManager extends AbstractSchemeManager<ISchemePhysicalIdleState> {
  /**
   * todo;
   */
  public override resetScheme(): void {
    this.object.set_nonscript_usable(this.state.nonscript_usable);
  }

  /**
   * todo;
   */
  public override update(): void {
    trySwitchToAnotherSection(this.object, this.state, registry.actor);
  }

  /**
   * todo;
   */
  public override deactivate(): void {
    this.object.set_tip_text("");
  }

  /**
   * todo;
   */
  public hit_callback(
    object: XR_game_object,
    amount: TCount,
    const_direction: XR_vector,
    who: Optional<XR_game_object>,
    bone_index: TIndex
  ): void {
    logger.info("Idle hit:", this.object.name());

    if (this.state.hit_on_bone.has(bone_index)) {
      const section: TSection = pickSectionFromCondList(
        registry.actor,
        this.object,
        this.state.hit_on_bone.get(bone_index).state as TConditionList
      )!;

      switchToSection(object, this.state.ini!, section);
    }
  }

  /**
   * todo;
   */
  public use_callback(): Optional<boolean> {
    logger.info("Idle use:", this.object.name());

    if (this.state.on_use) {
      if (
        switchToSection(
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
