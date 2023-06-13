import { CScriptXmlInit, CUIMapInfo, CUIMapList, CUIStatic, CUIWindow, LuabindClass } from "xray16";

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer/MultiplayerMenu";

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerServer extends CUIWindow {
  public mapPic!: CUIStatic;
  public mapInfo!: CUIMapInfo;

  public initialize(x: number, y: number, xml: CScriptXmlInit, owner: MultiplayerMenu): void {
    this.SetAutoDelete(true);

    xml.InitWindow("tab_server:main", 0, this);

    // -- SPIN BOXES
    owner.uiSpinMaxPlayers = xml.InitSpinNum("tab_server:spin_max_players", this);
    // --    handler.spin_mode = xml.InitSpinText("tab_server:spin_game_mode", this)
    owner.uiSpinMode = xml.InitComboBox("tab_server:spin_game_mode", this);
    owner.Register(owner.uiSpinMode, "spin_game_mode");

    const mapList: CUIMapList = xml.InitMapList("tab_server:map_list", this);

    mapList.SetWeatherSelector(owner.uiSpinWeather);
    mapList.SetModeSelector(owner.uiSpinMode);

    xml.InitStatic("tab_server:static_map_pic_fore", this);
    this.mapPic = xml.InitStatic("tab_server:static_map_pic", this);
    this.mapInfo = xml.InitMapInfo("tab_server:cap_map_info", this);

    mapList.SetMapPic(this.mapPic);
    mapList.SetMapInfo(this.mapInfo);

    owner.uiMapList = mapList;
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
    owner.uiCheckDedicated = xml.InitCheck("tab_server:check_dedicated", this);
    // -- EDIT BOXES
    owner.uiEditServerName = xml.InitEditBox("tab_server:edit_server_name", this);
    owner.uiEditPassword = xml.InitEditBox("tab_server:edit_password", this);
  }
}
