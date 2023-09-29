import { CScriptXmlInit, CUIWindow, LuabindClass, vector2 } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class OptionsSound extends CUIWindow {
  public constructor() {
    super();
    this.SetWindowName(this.__name);
  }

  public initialize(x: number, y: number, xml: CScriptXmlInit): void {
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
}
