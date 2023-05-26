import { CScriptXmlInit, CUIMapInfo, CUIStatic, CUIWindow, LuabindClass } from "xray16";

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer/MultiplayerMenu";

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerServer extends CUIWindow {
  public map_pic!: CUIStatic;
  public map_info!: CUIMapInfo;

  public initialize(x: number, y: number, xml: CScriptXmlInit, owner: MultiplayerMenu): void {
    this.SetAutoDelete(true);

    xml.InitWindow("tab_server:main", 0, this);

    // -- SPIN BOXES
    owner.spin_max_players = xml.InitSpinNum("tab_server:spin_max_players", this);
    // --    handler.spin_mode = xml.InitSpinText("tab_server:spin_game_mode", this)
    owner.spin_mode = xml.InitComboBox("tab_server:spin_game_mode", this);
    owner.Register(owner.spin_mode, "spin_game_mode");

    const map_list = xml.InitMapList("tab_server:map_list", this);

    map_list.SetWeatherSelector(owner.spin_weather);
    map_list.SetModeSelector(owner.spin_mode);

    xml.InitStatic("tab_server:static_map_pic_fore", this);
    this.map_pic = xml.InitStatic("tab_server:static_map_pic", this);
    this.map_info = xml.InitMapInfo("tab_server:cap_map_info", this);

    map_list.SetMapPic(this.map_pic);
    map_list.SetMapInfo(this.map_info);

    owner.map_list = map_list;
    xml.InitFrameLine("tab_server:cap_server_settings", this);
    xml.InitStatic("tab_server:cap_server_name", this);
    xml.InitStatic("tab_server:cap_password", this);
    xml.InitStatic("tab_server:cap_game_mode", this);
    xml.InitStatic("tab_server:cap_max_players", this);

    xml.InitStatic("tab_server:btn_left_static", this);
    xml.InitStatic("tab_server:btn_right_static", this);
    xml.InitStatic("tab_server:btn_up_static", this);
    xml.InitStatic("tab_server:btn_down_static", this);

    // -- CHECK BOXES
    owner.check_dedicated = xml.InitCheck("tab_server:check_dedicated", this);
    // -- EDIT BOXES
    owner.edit_server_name = xml.InitEditBox("tab_server:edit_server_name", this);
    owner.edit_password = xml.InitEditBox("tab_server:edit_password", this);
  }
}
