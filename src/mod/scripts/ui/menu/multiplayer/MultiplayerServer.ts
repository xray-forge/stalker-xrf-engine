import { IMultiplayerMenu } from "@/mod/scripts/ui/menu/MultiplayerMenu";

export interface IMultiplayerServer extends XR_CUIWindow {
  map_pic: XR_CUIStatic;
  map_info: XR_CUIMapInfo;

  InitControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: IMultiplayerMenu): void;
}

export const MultiplayerServer: IMultiplayerServer = declare_xr_class("MultiplayerServer", CUIWindow, {
  __init(): void {
    xr_class_super();
  },
  __finalize(): void {},
  InitControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: IMultiplayerMenu): void {
    this.SetAutoDelete(true);

    xml.InitWindow("tab_server:main", 0, this);

    // -- SPIN BOXES
    handler.spin_max_players = xml.InitSpinNum("tab_server:spin_max_players", this);
    // --    handler.spin_mode = xml.InitSpinText("tab_server:spin_game_mode", this)
    handler.spin_mode = xml.InitComboBox("tab_server:spin_game_mode", this);
    handler.Register(handler.spin_mode, "spin_game_mode");

    const map_list = xml.InitMapList("tab_server:map_list", this);

    map_list.SetWeatherSelector(handler.spin_weather);
    map_list.SetModeSelector(handler.spin_mode);

    xml.InitStatic("tab_server:static_map_pic_fore", this);
    this.map_pic = xml.InitStatic("tab_server:static_map_pic", this);
    this.map_info = xml.InitMapInfo("tab_server:cap_map_info", this);

    map_list.SetMapPic(this.map_pic);
    map_list.SetMapInfo(this.map_info);

    handler.map_list = map_list;
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
    handler.check_dedicated = xml.InitCheck("tab_server:check_dedicated", this);
    // -- EDIT BOXES
    handler.edit_server_name = xml.InitEditBox("tab_server:edit_server_name", this);
    handler.edit_password = xml.InitEditBox("tab_server:edit_password", this);
  }
} as IMultiplayerServer);
