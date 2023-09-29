import { CScriptXmlInit, CUIWindow, LuabindClass, vector2 } from "xray16";

import { OptionsDialog } from "@/engine/core/ui/menu/options/OptionsDialog";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Controls section from option menu.
 */
@LuabindClass()
export class OptionsControls extends CUIWindow {
  public constructor() {
    super();
    this.SetWindowName(this.__name);
  }

  public initialize(x: number, y: number, xml: CScriptXmlInit, owner: OptionsDialog): void {
    this.SetWndPos(new vector2().set(x, y));
    this.SetWndSize(new vector2().set(738, 416));
    this.SetAutoDelete(true);

    // -- this.bk = xml.InitFrame("frame", this)

    xml.InitStatic("tab_controls:cap_mousesens", this);
    xml.InitFrameLine("tab_controls:cap_keyboardsetup", this);
    xml.InitFrameLine("tab_controls:cap_keyboardsetup", this);
    xml.InitTrackBar("tab_controls:track_mousesens", this);
    xml.InitStatic("tab_controls:cap_check_mouseinvert", this);
    xml.InitCheck("tab_controls:check_mouseinvert", this);
    xml.InitKeyBinding("tab_controls:key_binding", this);

    owner.Register(xml.Init3tButton("tab_controls:btn_default", this), "btn_keyb_default");
  }
}
