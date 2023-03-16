import { CUIMessageBoxEx, CUIScriptWnd, Frect, LuabindClass, ui_events, XR_CUIMessageBoxEx } from "xray16";

import { info_portions } from "@/mod/globals/info_portions";
import { Optional } from "@/mod/lib/types";
import { giveInfo } from "@/mod/scripts/utils/info_portion";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class FreeplayDialog extends CUIScriptWnd {
  public readonly freeplay_mb: XR_CUIMessageBoxEx;

  public constructor() {
    super();

    this.SetWndRect(new Frect().set(0, 0, 1024, 768));
    this.freeplay_mb = new CUIMessageBoxEx();
    this.Register(this.freeplay_mb, "freeplay_mb");

    this.AddCallback("freeplay_mb", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.OnMsgOk(), this);
    this.AddCallback("freeplay_mb", ui_events.MESSAGE_BOX_YES_CLICKED, () => this.OnMsgYes(), this);
    this.AddCallback("freeplay_mb", ui_events.MESSAGE_BOX_NO_CLICKED, () => this.OnMsgNo(), this);
  }

  public override Show(selector: boolean | string, text?: string): void {
    this.freeplay_mb.InitMessageBox(tostring(selector));
    this.freeplay_mb.SetText(text || "");
    this.freeplay_mb.ShowDialog(true);
  }

  public OnMsgYes(): void {
    giveInfo(info_portions.pri_a28_actor_in_zone_leave);
  }

  public OnMsgOk(): void {
    giveInfo(info_portions.pri_a28_actor_in_zone_stay);
  }

  public OnMsgNo(): void {
    giveInfo(info_portions.pri_a28_actor_in_zone_stay);
  }
}

let freeplay_control: Optional<FreeplayDialog> = null;

export function showFreeplayDialog(selector: string, text: string): void {
  if (freeplay_control === null) {
    freeplay_control = new FreeplayDialog();
  }

  freeplay_control.Show(selector, text);
}
