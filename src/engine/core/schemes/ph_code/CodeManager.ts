import { XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes/base/AbstractSchemeManager";
import { ISchemeCodeState } from "@/engine/core/schemes/ph_code/ISchemeCodeState";
import { NumPadWindow } from "@/engine/core/ui/game/NumPadWindow";
import { pickSectionFromCondList } from "@/engine/core/utils/ini_config/config";
import { TLabel } from "@/engine/lib/types";

/**
 * todo;
 */
export class CodeManager extends AbstractSchemeManager<ISchemeCodeState> {
  /**
   * todo;
   */
  public override resetScheme(): void {
    this.object.set_nonscript_usable(false);
  }

  /**
   * todo;
   */
  public use_callback(object: XR_game_object, who: XR_game_object): void {
    const numPadWindow: NumPadWindow = new NumPadWindow(this);

    numPadWindow.ShowDialog(true);
  }

  /**
   * todo;
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
   * todo;
   */
  public override deactivate(): void {
    this.object.set_tip_text("");
  }
}
