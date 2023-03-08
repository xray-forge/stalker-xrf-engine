import { time_global, XR_game_object, XR_object, XR_vector } from "xray16";

import { Optional, TIndex } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/base/trySwitchToAnotherSection";
import { ISchemePhysicalButtonState } from "@/mod/scripts/core/schemes/ph_button/ISchemePhysicalButtonState";
import { switchToSection } from "@/mod/scripts/core/schemes/switchToSection";
import { isActiveSection } from "@/mod/scripts/utils/checkers/is";
import { pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("PhysicalButtonManager");

/**
 * todo;
 */
export class PhysicalButtonManager extends AbstractSchemeManager<ISchemePhysicalButtonState> {
  public last_hit_tm: Optional<number> = null;

  /**
   * todo;
   */
  public override resetScheme(): void {
    this.object.play_cycle(this.state.anim, this.state.blending);

    this.last_hit_tm = time_global();
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
  public try_switch(): boolean {
    if (isActiveSection(this.object, this.state.section) && this.state.on_press) {
      if (
        switchToSection(
          this.object,
          this.state.ini!,
          pickSectionFromCondList(registry.actor, this.object, this.state.on_press.condlist)!
        )
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * todo;
   */
  public hit_callback(
    object: XR_object,
    amount: number,
    local_direction: XR_vector,
    who: Optional<XR_game_object>,
    bone_index: TIndex
  ): void {
    return;
    /* --[[    const who_name
      if who then
        who_name = who:name()
      else
        who_name = "nil"
      end

      printf("_bp: ph_button:hit_callback: obj='%s', amount=%d, who='%s'", obj:name(), amount, who_name)

      if time_global() - this.last_hit_tm > 500 then
        this.last_hit_tm = time_global()
        if this:try_switch() then
          return
        end
      end
    ]]
    */
  }

  /**
   * todo;
   */
  public use_callback(object: XR_game_object, who: Optional<XR_game_object>): void {
    logger.info("Button used:", object.name(), who?.name());

    this.try_switch();
  }
}
