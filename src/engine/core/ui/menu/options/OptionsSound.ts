import { CScriptXmlInit, CUIWindow, LuabindClass } from "xray16";

import { create2dVector } from "@/engine/core/utils/vector";

/**
 * Sound section from option menu.
 */
@LuabindClass()
export class OptionsSound extends CUIWindow {
  public constructor() {
    super();
    this.SetWindowName(this.__name);
  }

  public initialize(x: number, y: number, xml: CScriptXmlInit): void {
    this.SetWndPos(create2dVector(x, y));
    this.SetWndSize(create2dVector(738, 416));
    this.SetAutoDelete(true);

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
}
