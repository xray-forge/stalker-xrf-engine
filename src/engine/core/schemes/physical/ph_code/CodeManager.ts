import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemeCodeState } from "@/engine/core/schemes/physical/ph_code/ph_code_types";
import { NumPadWindow } from "@/engine/core/ui/game/NumPadWindow";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { ClientObject, TLabel } from "@/engine/lib/types";

/**
 * todo;
 */
export class CodeManager extends AbstractSchemeManager<ISchemeCodeState> {
  /**
   * todo: Description.
   */
  public override activate(): void {
    this.object.set_nonscript_usable(false);
  }

  /**
   * todo: Description.
   */
  public override onUse(object: ClientObject, who: ClientObject): void {
    const numPadWindow: NumPadWindow = new NumPadWindow(this);

    numPadWindow.ShowDialog(true);
  }

  /**
   * todo: Description.
   */
  public OnNumberReceive(text: TLabel): void {
    if (this.state.code) {
      if (tonumber(text) === this.state.code) {
        if (this.state.onCode) {
          pickSectionFromCondList(registry.actor, this.object, this.state.onCode.condlist);
        }
      }
    } else {
      const condlist = this.state.onCheckCode.get(text);

      if (condlist !== null) {
        pickSectionFromCondList(registry.actor, this.object, condlist);
      }
    }
  }

  /**
   * todo: Description.
   */
  public override deactivate(): void {
    this.object.set_tip_text("");
  }
}
