import {
  CScriptXmlInit,
  CUICheckButton,
  CUIComboBox,
  CUIEditBox,
  CUIMapList,
  CUISpinNum,
  CUIWindow,
  LuabindClass,
  ui_events,
} from "xray16";

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerMenu";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EElementType, initializeElement, initializeStatics } from "@/engine/core/utils/ui";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Server settings tab in multiplayer UI.
 */
@LuabindClass()
export class MultiplayerServer extends CUIWindow {
  public owner: MultiplayerMenu;
  public xml: CScriptXmlInit;

  public uiServerNameEdit!: CUIEditBox;
  public uiPasswordEdit!: CUIEditBox;
  public uiModeComboBox!: CUIComboBox;
  public uiMaxPlayersSpin!: CUISpinNum;
  public uiMapList!: CUIMapList;
  public uiDedicatedCheck!: CUICheckButton;

  public constructor(owner: MultiplayerMenu, xml: CScriptXmlInit) {
    super();

    this.owner = owner;
    this.xml = xml;

    this.initialize(owner, xml);
  }

  public initialize(owner: MultiplayerMenu, xml: CScriptXmlInit): void {
    this.SetAutoDelete(true);

    xml.InitWindow("tab_server:main", 0, this);

    initializeStatics(
      xml,
      this,
      "tab_server:cap_server_name",
      "tab_server:cap_password",
      "tab_server:cap_game_mode",
      "tab_server:cap_max_players",
      "tab_server:btn_left_static",
      "tab_server:btn_right_static",
      "tab_server:btn_up_static",
      "tab_server:btn_down_static",
      "tab_server:static_map_pic_fore"
    );

    initializeElement(xml, EElementType.FRAME_LINE, "tab_server:cap_server_settings", this);

    this.uiMaxPlayersSpin = initializeElement(xml, EElementType.SPIN_NUM, "tab_server:spin_max_players", this);

    this.uiModeComboBox = initializeElement(xml, EElementType.COMBO_BOX, "tab_server:spin_game_mode", this, {
      context: owner,
      [ui_events.LIST_ITEM_SELECT]: () => this.onGameModeChange(),
    });

    this.uiDedicatedCheck = initializeElement(xml, EElementType.CHECK_BUTTON, "tab_server:check_dedicated", this);

    this.uiServerNameEdit = initializeElement(xml, EElementType.EDIT_BOX, "tab_server:edit_server_name", this);

    this.uiPasswordEdit = initializeElement(xml, EElementType.EDIT_BOX, "tab_server:edit_password", this);

    this.uiMapList = initializeElement(xml, EElementType.MAP_LIST, "tab_server:map_list", this);

    this.uiMapList.SetWeatherSelector(owner.dialogMultiplayerOptions.uiWeatherComboBox);
    this.uiMapList.SetModeSelector(this.uiModeComboBox);
    this.uiMapList.SetMapPic(initializeElement(xml, EElementType.STATIC, "tab_server:static_map_pic", this));
    this.uiMapList.SetMapInfo(initializeElement(xml, EElementType.MAP_INFO, "tab_server:cap_map_info", this));
  }

  public onGameModeChange(): void {
    logger.info("Game mode change");

    this.uiMapList.OnModeChange();
    this.owner.dialogMultiplayerOptions.setGameMode(this.uiMapList.GetCurGameType());
  }
}
