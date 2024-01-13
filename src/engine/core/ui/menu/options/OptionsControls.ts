import { CScriptXmlInit, CUIWindow, LuabindClass } from "xray16";

import { Options } from "@/engine/core/ui/menu/options/Options";
import { LuaLogger } from "@/engine/core/utils/logging";
import { create2dVector } from "@/engine/core/utils/vector";

/**
 * Controls section from option menu.
 */
@LuabindClass()
export class OptionsControls extends CUIWindow {
  public constructor() {
    super();
    this.SetWindowName(this.__name);
  }

  public initialize(x: number, y: number, xml: CScriptXmlInit, owner: Options): void {
    this.SetWndPos(create2dVector(x, y));
    this.SetWndSize(create2dVector(738, 416));
    this.SetAutoDelete(true);

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
