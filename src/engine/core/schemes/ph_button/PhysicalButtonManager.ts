import { time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils";
import { ISchemePhysicalButtonState } from "@/engine/core/schemes/ph_button/ISchemePhysicalButtonState";
import { isActiveSection } from "@/engine/core/utils/check/is";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, Optional, TIndex, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class PhysicalButtonManager extends AbstractSchemeManager<ISchemePhysicalButtonState> {
  public last_hit_tm: Optional<number> = null;

  /**
   * todo: Description.
   */
  public override resetScheme(): void {
    this.object.play_cycle(this.state.anim, this.state.blending);

    this.last_hit_tm = time_global();
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    trySwitchToAnotherSection(this.object, this.state, registry.actor);
  }

  /**
   * todo: Description.
   */
  public try_switch(): boolean {
    if (isActiveSection(this.object, this.state.section) && this.state.on_press) {
      if (
        switchObjectSchemeToSection(
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
   * todo: Description.
   */
  public hit_callback(
    object: ClientObject,
    amount: number,
    local_direction: Vector,
    who: Optional<ClientObject>,
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
   * todo: Description.
   */
  public use_callback(object: ClientObject, who: Optional<ClientObject>): void {
    logger.info("Button used:", object.name(), who?.name());

    this.try_switch();
  }
}
