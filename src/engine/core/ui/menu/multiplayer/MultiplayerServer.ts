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

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer/MultiplayerMenu";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EElementType, initializeElement, initializeStatics } from "@/engine/core/utils/ui";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Server settings tab in multiplayer UI.
 */
@LuabindClass()
export class MultiplayerServer extends CUIWindow {
  public owner: MultiplayerMenu;

  public uiServerNameEdit!: CUIEditBox;
  public uiPasswordEdit!: CUIEditBox;
  public uiModeComboBox!: CUIComboBox;
  public uiMaxPlayersSpin!: CUISpinNum;
  public uiMapList!: CUIMapList;
  public uiDedicatedCheck!: CUICheckButton;

  public constructor(owner: MultiplayerMenu) {
    super();

    this.owner = owner;
  }

  public initialize(x: number, y: number, xml: CScriptXmlInit, owner: MultiplayerMenu): void {
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

    initializeElement(xml, "tab_server:cap_server_settings", { type: EElementType.FRAME_LINE, base: this });

    this.uiMaxPlayersSpin = initializeElement(xml, "tab_server:spin_max_players", {
      type: EElementType.SPIN_NUM,
      base: this,
    });

    this.uiModeComboBox = initializeElement(xml, "tab_server:spin_game_mode", {
      type: EElementType.COMBO_BOX,
      base: this,
      context: owner,
      handlers: {
        [ui_events.LIST_ITEM_SELECT]: () => this.onGameModeChange(),
      },
    });

    this.uiDedicatedCheck = initializeElement(xml, "tab_server:check_dedicated", {
      type: EElementType.CHECK_BUTTON,
      base: this,
    });

    this.uiServerNameEdit = initializeElement(xml, "tab_server:edit_server_name", {
      type: EElementType.EDIT_BOX,
      base: this,
    });

    this.uiPasswordEdit = initializeElement(xml, "tab_server:edit_password", {
      type: EElementType.EDIT_BOX,
      base: this,
    });

    this.uiMapList = initializeElement(xml, "tab_server:map_list", {
      type: EElementType.MAP_LIST,
      base: this,
    });

    this.uiMapList.SetWeatherSelector(owner.dialogMultiplayerOptions.uiWeatherComboBox);
    this.uiMapList.SetModeSelector(this.uiModeComboBox);
    this.uiMapList.SetMapPic(
      initializeElement(xml, "tab_server:static_map_pic", { type: EElementType.STATIC, base: this })
    );
    this.uiMapList.SetMapInfo(
      initializeElement(xml, "tab_server:cap_map_info", { type: EElementType.MAP_INFO, base: this })
    );
  }

  public onGameModeChange(): void {
    logger.info("Game mode change");

    this.uiMapList.OnModeChange();
    this.owner.dialogMultiplayerOptions.setGameMode(this.uiMapList.GetCurGameType());
  }
}
