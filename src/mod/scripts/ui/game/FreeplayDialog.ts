import { CUIMessageBoxEx, CUIScriptWnd, Frect, ui_events, XR_CUIMessageBoxEx, XR_CUIScriptWnd } from "xray16";

import { Optional } from "@/mod/lib/types";
import { giveInfo } from "@/mod/scripts/utils/actor";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("FreeplayDialog");

export interface IFreeplayDialog extends XR_CUIScriptWnd {
  freeplay_mb: XR_CUIMessageBoxEx;

  Show(mb_type: boolean): void;
  Show(mb_type: string, text: string): void;

  OnMsgOk(): void;
  OnMsgYes(): void;
  OnMsgNo(): void;
}

export const FreeplayDialog: IFreeplayDialog = declare_xr_class("FreeplayDialog", CUIScriptWnd, {
  __init(): void {
    xr_class_super();

    this.SetWndRect(new Frect().set(0, 0, 1024, 768));
    this.freeplay_mb = new CUIMessageBoxEx();
    this.Register(this.freeplay_mb, "freeplay_mb");

    this.AddCallback("freeplay_mb", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.OnMsgOk(), this);
    this.AddCallback("freeplay_mb", ui_events.MESSAGE_BOX_YES_CLICKED, () => this.OnMsgYes(), this);
    this.AddCallback("freeplay_mb", ui_events.MESSAGE_BOX_NO_CLICKED, () => this.OnMsgNo(), this);
  },
  Show(selector, text): void {
    this.freeplay_mb.InitMessageBox(tostring(selector));
    this.freeplay_mb.SetText(text);
    this.freeplay_mb.ShowDialog(true);
  },
  OnMsgYes(): void {
    giveInfo("pri_a28_actor_in_zone_leave");
  },
  OnMsgOk(): void {
    giveInfo("pri_a28_actor_in_zone_stay");
  },
  OnMsgNo(): void {
    giveInfo("pri_a28_actor_in_zone_stay");
  }
} as IFreeplayDialog);

let freeplay_control: Optional<IFreeplayDialog> = null;

export function showFreeplayDialog(selector: string, text: string): void {
  if (freeplay_control === null) {
    freeplay_control = create_xr_class_instance(FreeplayDialog);
  }

  freeplay_control.Show(selector, text);
}
