import { CScriptXmlInit, CUIScrollView, CUIStatic, CUIWindow, LuabindClass, vector2 } from "xray16";

import { OptionsDialog } from "@/engine/core/ui/menu/options/OptionsDialog";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Gameplay section from option menu.
 */
@LuabindClass()
export class OptionsGameplay extends CUIWindow {
  public uiScrollView!: CUIScrollView;

  public constructor() {
    super();
    this.SetWindowName(this.__name);
  }

  public initialize(x: number, y: number, xml: CScriptXmlInit, owner: OptionsDialog): void {
    this.SetWndPos(new vector2().set(x, y));
    this.SetWndSize(new vector2().set(738, 416));
    this.SetAutoDelete(true);

    this.uiScrollView = xml.InitScrollView("tab_gameplay:scroll_v", this);

    this.createSelectItem(xml, "tab_gameplay:cap_difficulty", "tab_gameplay:list_difficulty");
    this.createSelectItem(xml, "tab_gameplay:cap_localization", "tab_gameplay:list_localization");
    this.createCheckItem(xml, "tab_gameplay:cap_check_tips", "tab_gameplay:check_tips");
    this.createCheckItem(xml, "tab_gameplay:cap_check_crosshair", "tab_gameplay:check_crosshair");
    this.createCheckItem(xml, "tab_gameplay:cap_check_dyn_crosshair", "tab_gameplay:check_dyn_crosshair");
    this.createCheckItem(xml, "tab_gameplay:cap_check_show_weapon", "tab_gameplay:check_show_weapon");
    this.createCheckItem(xml, "tab_gameplay:cap_check_dist", "tab_gameplay:check_dist");
    this.createCheckItem(xml, "tab_gameplay:cap_check_important_save", "tab_gameplay:check_important_save");
    this.createCheckItem(xml, "tab_gameplay:cap_check_crouch_toggle", "tab_gameplay:check_crouch_toggle");
    this.createCheckItem(xml, "tab_gameplay:cap_check_hud_draw", "tab_gameplay:check_hud_draw");
    this.createCheckItem(
      xml,
      "tab_gameplay:cap_check_simplified_item_pickup",
      "tab_gameplay:check_simplified_item_pickup"
    );
    this.createCheckItem(xml, "tab_gameplay:cap_check_multi_item_pickup", "tab_gameplay:check_multi_item_pickup");
    this.createCheckItem(xml, "tab_gameplay:cap_unload_after_pickup", "tab_gameplay:unload_after_pickup");

    owner.Register(xml.Init3tButton("tab_gameplay:btn_check_updates", this), "btn_check_updates");
  }

  private createSelectItem(xml: CScriptXmlInit, caption: string, control: string): void {
    const item: CUIStatic = xml.InitStatic("tab_gameplay:templ_item", null);

    xml.InitStatic(caption, item);
    xml.InitComboBox(control, item);
    this.uiScrollView.AddWindow(item, true);
  }

  private createCheckItem(xml: CScriptXmlInit, caption: string, control: string): void {
    const item: CUIStatic = xml.InitStatic("tab_gameplay:templ_item", null);

    xml.InitStatic(caption, item);
    xml.InitCheck(control, item);
    this.uiScrollView.AddWindow(item, true);
  }
}
