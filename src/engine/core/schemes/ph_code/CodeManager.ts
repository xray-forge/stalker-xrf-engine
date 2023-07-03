import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemeCodeState } from "@/engine/core/schemes/ph_code/ISchemeCodeState";
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
  public override resetScheme(): void {
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
        if (this.state.on_code) {
          pickSectionFromCondList(registry.actor, this.object, this.state.on_code.condlist);
        }
      }
    } else {
      const condlist = this.state.on_check_code.get(text);

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
