import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { registry } from "@/engine/core/database";
import { ISchemePhysicalButtonState } from "@/engine/core/schemes/physical/ph_button/ph_button_types";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isActiveSection, switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/utils/scheme";
import { GameObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager handling physical button usage scheme.
 */
export class PhysicalButtonManager extends AbstractSchemeManager<ISchemePhysicalButtonState> {
  public override activate(): void {
    this.object.play_cycle(this.state.anim, this.state.blending);
  }

  public update(): void {
    trySwitchToAnotherSection(this.object, this.state);
  }

  public override onUse(object: GameObject): void {
    logger.info("Button used: %s %s", object.name());

    if (this.state.onPress && isActiveSection(this.object, this.state.section)) {
      switchObjectSchemeToSection(
        this.object,
        this.state.ini,
        pickSectionFromCondList(registry.actor, this.object, this.state.onPress.condlist)
      );
    }
  }
}
