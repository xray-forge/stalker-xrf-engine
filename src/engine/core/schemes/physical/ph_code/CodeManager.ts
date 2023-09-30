import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemeCodeState } from "@/engine/core/schemes/physical/ph_code/ph_code_types";
import { NumPadWindow } from "@/engine/core/ui/game/NumPadWindow";
import { TConditionList } from "@/engine/core/utils/ini";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { ClientObject, Optional, TLabel } from "@/engine/lib/types";

/**
 * todo;
 */
export class CodeManager extends AbstractSchemeManager<ISchemeCodeState> {
  public override activate(): void {
    this.object.set_nonscript_usable(false);
  }

  public override deactivate(): void {
    this.object.set_tip_text("");
  }

  public override onUse(object: ClientObject, who: ClientObject): void {
    const numPadWindow: NumPadWindow = new NumPadWindow(this);

    numPadWindow.ShowDialog(true);
  }

  /**
   * todo: Description.
   */
  public onNumberReceive(text: TLabel): void {
    if (this.state.code) {
      if (tonumber(text) === this.state.code) {
        if (this.state.onCode) {
          pickSectionFromCondList(registry.actor, this.object, this.state.onCode.condlist);
        }
      }
    } else {
      const condlist: Optional<TConditionList> = this.state.onCheckCode.get(text) as Optional<TConditionList>;

      if (condlist) {
        pickSectionFromCondList(registry.actor, this.object, condlist);
      }
    }
  }
}
