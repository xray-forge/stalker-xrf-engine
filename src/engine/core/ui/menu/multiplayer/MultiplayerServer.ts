import {
  CScriptXmlInit,
  CUICheckButton,
  CUIEditBox,
  CUIEditBoxEx,
  CUIMapList,
  CUISpinNum,
  CUISpinText,
  CUIWindow,
  LuabindClass,
  ui_events,
} from "xray16";

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer/MultiplayerMenu";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EElementType, registerUiElement } from "@/engine/core/utils/ui";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Server settings tab in multiplayer UI.
 */
@LuabindClass()
export class MultiplayerServer extends CUIWindow {
  public owner: MultiplayerMenu;

  public uiEditServerName!: CUIEditBoxEx;
  public uiEditPassword!: CUIEditBox;
  public uiSpinMode!: CUISpinText;
  public uiSpinMaxPlayers!: CUISpinNum;
  public uiMapList!: CUIMapList;
  public uiCheckDedicated!: CUICheckButton;

  public constructor(owner: MultiplayerMenu) {
    super();

    this.owner = owner;
  }

  public initialize(x: number, y: number, xml: CScriptXmlInit, owner: MultiplayerMenu): void {
    this.SetAutoDelete(true);

    xml.InitWindow("tab_server:main", 0, this);

    this.uiSpinMaxPlayers = registerUiElement(xml, "tab_server:spin_max_players", {
      type: EElementType.SPIN_NUM,
      base: this,
    });

    this.uiSpinMode = registerUiElement(xml, "tab_server:spin_game_mode", {
      type: EElementType.COMBO_BOX,
      base: this,
      context: owner,
      handlers: {
        [ui_events.LIST_ITEM_SELECT]: () => this.onGameModeChange(),
      },
    });

    registerUiElement(xml, "tab_server:cap_server_settings", { type: EElementType.FRAME_LINE, base: this });
    registerUiElement(xml, "tab_server:cap_server_name", { type: EElementType.STATIC, base: this });
    registerUiElement(xml, "tab_server:cap_password", { type: EElementType.STATIC, base: this });
    registerUiElement(xml, "tab_server:cap_game_mode", { type: EElementType.STATIC, base: this });
    registerUiElement(xml, "tab_server:cap_max_players", { type: EElementType.STATIC, base: this });

    registerUiElement(xml, "tab_server:btn_left_static", { type: EElementType.STATIC, base: this });
    registerUiElement(xml, "tab_server:btn_right_static", { type: EElementType.STATIC, base: this });
    registerUiElement(xml, "tab_server:btn_up_static", { type: EElementType.STATIC, base: this });
    registerUiElement(xml, "tab_server:btn_down_static", { type: EElementType.STATIC, base: this });
    registerUiElement(xml, "tab_server:static_map_pic_fore", { type: EElementType.STATIC, base: this });

    this.uiCheckDedicated = registerUiElement(xml, "tab_server:check_dedicated", {
      type: EElementType.CHECK_BOX,
      base: this,
    });
    this.uiEditServerName = registerUiElement(xml, "tab_server:edit_server_name", {
      type: EElementType.EDIT_BOX,
      base: this,
    });
    this.uiEditPassword = registerUiElement(xml, "tab_server:edit_password", {
      type: EElementType.EDIT_BOX,
      base: this,
    });

    const mapList: CUIMapList = registerUiElement(xml, "tab_server:map_list", {
      type: EElementType.MAP_LIST,
      base: this,
    });

    mapList.SetWeatherSelector(owner.dialogMultiplayerOptions.uiSpinWeather);
    mapList.SetModeSelector(this.uiSpinMode);
    mapList.SetMapPic(registerUiElement(xml, "tab_server:static_map_pic", { type: EElementType.STATIC, base: this }));
    mapList.SetMapInfo(registerUiElement(xml, "tab_server:cap_map_info", { type: EElementType.MAP_INFO, base: this }));

    this.uiMapList = mapList;
  }

  public onGameModeChange(): void {
    logger.info("Game mode change");

    this.uiMapList.OnModeChange();
    this.owner.dialogMultiplayerOptions.setGameMode(this.uiMapList.GetCurGameType());
  }
}
