import { CUIMessageBoxEx, CUIScriptWnd, Frect, LuabindClass, ui_events } from "xray16";

import { giveInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class FreeplayDialog extends CUIScriptWnd {
  public readonly freeplay_mb: CUIMessageBoxEx;

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
    giveInfo(infoPortions.pri_a28_actor_in_zone_leave);
  }

  public OnMsgOk(): void {
    giveInfo(infoPortions.pri_a28_actor_in_zone_stay);
  }

  public OnMsgNo(): void {
    giveInfo(infoPortions.pri_a28_actor_in_zone_stay);
  }
}

let freeplay_control: Optional<FreeplayDialog> = null;

export function showFreeplayDialog(selector: string, text: string): void {
  if (freeplay_control === null) {
    freeplay_control = new FreeplayDialog();
  }

  freeplay_control.Show(selector, text);
}
