import { CUIWindow, vector2, XR_CScriptXmlInit, XR_CUIWindow } from "xray16";

import { IOptionsDialog } from "@/mod/scripts/ui/menu/OptionsDialog";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("OptionsSound");

export interface IOptionsSound extends XR_CUIWindow {
  InitControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: IOptionsDialog): void;
}

export const OptionsSound: IOptionsSound = declare_xr_class("OptionsSound", CUIWindow, {
  __init(): void {
    CUIWindow.__init(this);
  },
  InitControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: IOptionsDialog): void {
    this.SetWndPos(new vector2().set(x, y));
    this.SetWndSize(new vector2().set(738, 416));
    this.SetAutoDelete(true);

    // -- this.bk = xml.InitFrame("frame", this)

    xml.InitStatic("tab_sound:cap_mastervolume", this);
    xml.InitStatic("tab_sound:cap_musicvolume", this);

    xml.InitStatic("tab_sound:cap_check_eax", this);
    xml.InitStatic("tab_sound:cap_check_dynamic_music", this);

    xml.InitCheck("tab_sound:check_eax", this);
    xml.InitCheck("tab_sound:check_dynamic_music", this);

    xml.InitTrackBar("tab_sound:track_musicvolume", this);
    xml.InitTrackBar("tab_sound:track_mastervolume", this);

    xml.InitStatic("tab_sound:cap_snd_device", this);
    xml.InitComboBox("tab_sound:list_snd_device", this);
  }
} as IOptionsSound);
