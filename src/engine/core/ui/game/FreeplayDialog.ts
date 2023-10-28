import { CUIMessageBoxEx, CUIScriptWnd, LuabindClass, ui_events } from "xray16";

import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { createScreenRectangle } from "@/engine/core/utils/rectangle";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Class describing dialog shown in the end of game.
 * Enables freeplay choice when game ends.
 */
@LuabindClass()
export class FreeplayDialog extends CUIScriptWnd {
  public readonly uiFreeplayMb: CUIMessageBoxEx;

  public constructor() {
    super();

    this.SetWndRect(createScreenRectangle());
    this.uiFreeplayMb = new CUIMessageBoxEx();
    this.Register(this.uiFreeplayMb, "freeplay_mb");

    this.AddCallback("freeplay_mb", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.OnMsgOk(), this);
    this.AddCallback("freeplay_mb", ui_events.MESSAGE_BOX_YES_CLICKED, () => this.OnMsgYes(), this);
    this.AddCallback("freeplay_mb", ui_events.MESSAGE_BOX_NO_CLICKED, () => this.OnMsgNo(), this);
  }

  public override Show(selector: boolean | string, text?: string): void {
    this.uiFreeplayMb.InitMessageBox(tostring(selector));
    this.uiFreeplayMb.SetText(text || "");
    this.uiFreeplayMb.ShowDialog(true);
  }

  public OnMsgYes(): void {
    giveInfoPortion(infoPortions.pri_a28_actor_in_zone_leave);
  }

  public OnMsgOk(): void {
    giveInfoPortion(infoPortions.pri_a28_actor_in_zone_stay);
  }

  public OnMsgNo(): void {
    giveInfoPortion(infoPortions.pri_a28_actor_in_zone_stay);
  }
}

let freeplayControl: Optional<FreeplayDialog> = null;

/**
 * todo;
 */
export function showFreeplayDialog(selector: string, text: string): void {
  if (freeplayControl === null) {
    freeplayControl = new FreeplayDialog();
  }

  freeplayControl.Show(selector, text);
}
