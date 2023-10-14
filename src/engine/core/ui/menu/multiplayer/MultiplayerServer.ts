import {
  CScriptXmlInit,
  CUICheckButton,
  CUIEditBox,
  CUIEditBoxEx,
  CUIMapInfo,
  CUIMapList,
  CUISpinNum,
  CUISpinText,
  CUIStatic,
  CUIWindow,
  LuabindClass,
} from "xray16";

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer/MultiplayerMenu";

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerServer extends CUIWindow {
  public uiCheckDedicated!: CUICheckButton;
  public uiEditServerName!: CUIEditBoxEx;
  public uiEditPassword!: CUIEditBox;
  public uiSpinMode!: CUISpinText;
  public uiSpinMaxPlayers!: CUISpinNum;
  public uiMapList!: CUIMapList;

  public initialize(x: number, y: number, xml: CScriptXmlInit, owner: MultiplayerMenu): void {
    this.SetAutoDelete(true);

    xml.InitWindow("tab_server:main", 0, this);

    this.uiSpinMaxPlayers = xml.InitSpinNum("tab_server:spin_max_players", this);
    this.uiSpinMode = xml.InitComboBox("tab_server:spin_game_mode", this);
    owner.Register(this.uiSpinMode, "spin_game_mode");

    const mapList: CUIMapList = xml.InitMapList("tab_server:map_list", this);

    mapList.SetWeatherSelector(owner.dialogMultiplayerOptions.uiSpinWeather);
    mapList.SetModeSelector(this.uiSpinMode);

    xml.InitStatic("tab_server:static_map_pic_fore", this);

    const mapPic: CUIStatic = xml.InitStatic("tab_server:static_map_pic", this);
    const mapInfo: CUIMapInfo = xml.InitMapInfo("tab_server:cap_map_info", this);

    mapList.SetMapPic(mapPic);
    mapList.SetMapInfo(mapInfo);

    this.uiMapList = mapList;

    xml.InitFrameLine("tab_server:cap_server_settings", this);
    xml.InitStatic("tab_server:cap_server_name", this);
    xml.InitStatic("tab_server:cap_password", this);
    xml.InitStatic("tab_server:cap_game_mode", this);
    xml.InitStatic("tab_server:cap_max_players", this);

    xml.InitStatic("tab_server:btn_left_static", this);
    xml.InitStatic("tab_server:btn_right_static", this);
    xml.InitStatic("tab_server:btn_up_static", this);
    xml.InitStatic("tab_server:btn_down_static", this);

    this.uiCheckDedicated = xml.InitCheck("tab_server:check_dedicated", this);
    this.uiEditServerName = xml.InitEditBox("tab_server:edit_server_name", this);
    this.uiEditPassword = xml.InitEditBox("tab_server:edit_password", this);
  }
}
