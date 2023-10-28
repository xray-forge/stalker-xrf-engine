import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { registry } from "@/engine/core/database";
import { ISchemeCodeState } from "@/engine/core/schemes/physical/ph_code/ph_code_types";
import { NumPadWindow } from "@/engine/core/ui/game/NumPadWindow";
import { TConditionList } from "@/engine/core/utils/ini";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { Optional, TLabel } from "@/engine/lib/types";

/**
 * Manager of prompting and checking logics.
 */
export class CodeManager extends AbstractSchemeManager<ISchemeCodeState> {
  public override activate(): void {
    this.object.set_nonscript_usable(false);
  }

  public override deactivate(): void {
    this.object.set_tip_text("");
  }

  public override onUse(): void {
    const window: NumPadWindow = new NumPadWindow(this);

    window.ShowDialog(true);
  }

  /**
   * Handle received number from modal input.
   *
   * @param text - input text from the modal sent by player
   */
  public onNumberReceive(text: TLabel): void {
    if (this.state.code) {
      if (tonumber(text) === this.state.code && this.state.onCode) {
        pickSectionFromCondList(registry.actor, this.object, this.state.onCode.condlist);
      }
    } else {
      const condlist: Optional<TConditionList> = this.state.onCheckCode.get(text) as Optional<TConditionList>;

      if (condlist) {
        pickSectionFromCondList(registry.actor, this.object, condlist);
      }
    }
  }
}
