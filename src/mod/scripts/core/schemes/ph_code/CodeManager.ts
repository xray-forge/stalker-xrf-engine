import { XR_game_object } from "xray16";

import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { ISchemeCodeState } from "@/mod/scripts/core/schemes/ph_code/ISchemeCodeState";
import { pickSectionFromCondList } from "@/mod/scripts/utils/configs";

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
    const numpad = get_global("ui_numpad").numpad(this);

    numpad.ShowDialog(true);
  }

  /**
   * todo;
   */
  public OnNumberReceive(text: string): void {
    if (this.state.code) {
      if (tonumber(text) === this.state.code) {
        if (this.state.on_code) {
          pickSectionFromCondList(registry.actor, this.object, this.state.on_code.condlist);
        }
      }
    } else {
      const condlist = this.state.on_check_code.get(text);

      if (condlist) {
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
