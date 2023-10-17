import { time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemePhysicalButtonState } from "@/engine/core/schemes/physical/ph_button/ph_button_types";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isActiveSection } from "@/engine/core/utils/scheme";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { GameObject, Optional, TIndex, TRate, TTimestamp, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class PhysicalButtonManager extends AbstractSchemeManager<ISchemePhysicalButtonState> {
  public lastHitAt: Optional<TTimestamp> = null;

  public override activate(): void {
    this.object.play_cycle(this.state.anim, this.state.blending);

    this.lastHitAt = time_global();
  }

  public update(): void {
    trySwitchToAnotherSection(this.object, this.state);
  }

  public override onHit(
    object: GameObject,
    amount: TRate,
    direction: Vector,
    who: Optional<GameObject>,
    boneIndex: TIndex
  ): void {
    /* --[[    const who_name
      if who then
        who_name = who:name()
      else
        who_name = "nil"
      end

      printf("_bp: ph_button:onHit: obj='%s', amount=%d, who='%s'", obj:name(), amount, who_name)

      if time_global() - this.last_hit_tm > 500 then
        this.last_hit_tm = time_global()
        if this:try_switch() then
          return
        end
      end
    ]]
    */
  }

  public override onUse(object: GameObject, who: Optional<GameObject>): void {
    logger.info("Button used:", object.name(), type(who));

    if (isActiveSection(this.object, this.state.section) && this.state.onPress) {
      switchObjectSchemeToSection(
        this.object,
        this.state.ini,
        pickSectionFromCondList(registry.actor, this.object, this.state.onPress.condlist)
      );
    }
  }
}
