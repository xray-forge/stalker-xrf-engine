import { CUIMessageBoxEx, CUIScriptWnd, LuabindClass, ui_events } from "xray16";

import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { createScreenRectangle } from "@/engine/core/utils/rectangle";
import { EElementType, initializeElement } from "@/engine/core/utils/ui";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { TLabel, XmlInit } from "@/engine/lib/types";

/**
 * Class describing dialog shown in the end of game.
 * Enables freeplay choice when game ends.
 */
@LuabindClass()
export class FreeplayDialog extends CUIScriptWnd {
  public readonly uiMessageBox: CUIMessageBoxEx;

  public constructor() {
    super();

    this.SetWndRect(createScreenRectangle());

    this.uiMessageBox = initializeElement(
      null as unknown as XmlInit,
      EElementType.MESSAGE_BOX_EX,
      "freeplay_mb",
      this,
      {
        [ui_events.MESSAGE_BOX_OK_CLICKED]: () => this.onOkMessageClicked(),
        [ui_events.MESSAGE_BOX_YES_CLICKED]: () => this.onYesMessageClicked(),
        [ui_events.MESSAGE_BOX_NO_CLICKED]: () => this.onNoMessageClicked(),
      }
    );
  }

  public override Show(selector: boolean | string, text?: TLabel): void {
    this.uiMessageBox.InitMessageBox(tostring(selector));
    this.uiMessageBox.SetText(text || "");
    this.uiMessageBox.ShowDialog(true);
  }

  public onYesMessageClicked(): void {
    giveInfoPortion(infoPortions.pri_a28_actor_in_zone_leave);
  }

  public onOkMessageClicked(): void {
    giveInfoPortion(infoPortions.pri_a28_actor_in_zone_stay);
  }

  public onNoMessageClicked(): void {
    giveInfoPortion(infoPortions.pri_a28_actor_in_zone_stay);
  }
}
