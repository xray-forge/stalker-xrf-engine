import {
  CScriptXmlInit,
  CServerList,
  CUI3tButton,
  CUICheckButton,
  CUIWindow,
  LuabindClass,
  SServerFilters,
  ui_events,
} from "xray16";

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerMenu";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EElementType, initializeElement, initializeStatics } from "@/engine/core/utils/ui";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Join tab for multiplayer menu controls.
 */
@LuabindClass()
export class MultiplayerJoin extends CUIWindow {
  public owner: MultiplayerMenu;
  public xml: CScriptXmlInit;
  public isOnlineMode: boolean;

  public uiServerList!: CServerList;
  public uiJoinDirectIPButton!: CUI3tButton;
  public uiFilterEmptyCheckButton!: CUICheckButton;
  public uiFilterFullCheckButton!: CUICheckButton;
  public uiFilterWithPasswordCheckButton!: CUICheckButton;
  public uiFilterWithoutPasswordCheckButton!: CUICheckButton;
  public uiFilterFFCheckButton!: CUICheckButton;
  public uiFilterListenServersCheckButton!: CUICheckButton;

  public constructor(owner: MultiplayerMenu, xml: CScriptXmlInit, isOnlineMode: boolean) {
    super();

    this.owner = owner;
    this.xml = xml;
    this.isOnlineMode = isOnlineMode;

    this.initialize(owner, xml);
  }

  public initialize(owner: MultiplayerMenu, xml: CScriptXmlInit): void {
    this.SetAutoDelete(true);

    initializeStatics(xml, this, "tab_client:cap_server_list", "tab_client:cap_filters");

    xml.InitWindow("tab_client:main", 0, this);

    this.uiServerList = xml.InitServerList("tab_client:server_list", this);

    this.uiJoinDirectIPButton = initializeElement(xml, EElementType.BUTTON, "tab_client:btn_direct_ip", this, {
      context: owner,
      [ui_events.BUTTON_CLICKED]: () => this.onDirectIPButtonClicked(),
    });

    this.uiFilterEmptyCheckButton = initializeElement(xml, EElementType.CHECK_BUTTON, "tab_client:check_empty", this, {
      context: owner,
      [ui_events.BUTTON_CLICKED]: () => this.onFiltersChange(),
    });
    this.uiFilterEmptyCheckButton.SetCheck(true);

    this.uiFilterFullCheckButton = initializeElement(xml, EElementType.CHECK_BUTTON, "tab_client:check_full", this, {
      context: owner,
      [ui_events.BUTTON_CLICKED]: () => this.onFiltersChange(),
    });
    this.uiFilterFullCheckButton.SetCheck(true);

    this.uiFilterWithPasswordCheckButton = initializeElement(
      xml,
      EElementType.CHECK_BUTTON,
      "tab_client:check_with_pass",
      this,
      {
        context: owner,
        [ui_events.BUTTON_CLICKED]: () => this.onFiltersChange(),
      }
    );
    this.uiFilterWithPasswordCheckButton.SetCheck(true);

    this.uiFilterWithoutPasswordCheckButton = initializeElement(
      xml,
      EElementType.CHECK_BUTTON,
      "tab_client:check_without_pass",
      this,
      {
        context: owner,
        [ui_events.BUTTON_CLICKED]: () => this.onFiltersChange(),
      }
    );
    this.uiFilterWithoutPasswordCheckButton.SetCheck(true);

    this.uiFilterFFCheckButton = initializeElement(
      xml,
      EElementType.CHECK_BUTTON,
      "tab_client:check_without_ff",
      this,
      {
        context: owner,
        [ui_events.BUTTON_CLICKED]: () => this.onFiltersChange(),
      }
    );
    this.uiFilterFFCheckButton.SetCheck(true);

    this.uiFilterListenServersCheckButton = initializeElement(
      xml,
      EElementType.CHECK_BUTTON,
      "tab_client:check_listen_servers",
      this,
      {
        context: owner,
        [ui_events.BUTTON_CLICKED]: () => this.onFiltersChange(),
      }
    );
    this.uiFilterListenServersCheckButton.SetCheck(true);

    initializeElement(xml, EElementType.BUTTON, "tab_client:btn_refresh", this, {
      context: owner,
      [ui_events.BUTTON_CLICKED]: () => this.onRefreshButtonClicked(),
    });

    initializeElement(xml, EElementType.BUTTON, "tab_client:btn_quick_refresh", this, {
      context: owner,
      [ui_events.BUTTON_CLICKED]: () => this.onQuickRefreshButtonClicked(),
    });

    initializeElement(xml, EElementType.BUTTON, "tab_client:btn_server_info", this, {
      context: owner,
      [ui_events.BUTTON_CLICKED]: () => this.onServerInfoButtonClicked(),
    });
  }

  public getFilters(): SServerFilters {
    const filters: SServerFilters = new SServerFilters();

    filters.empty = this.uiFilterEmptyCheckButton.GetCheck();
    filters.full = this.uiFilterFullCheckButton.GetCheck();
    filters.with_pass = this.uiFilterWithPasswordCheckButton.GetCheck();
    filters.without_pass = this.uiFilterWithoutPasswordCheckButton.GetCheck();
    filters.without_ff = this.uiFilterFFCheckButton.GetCheck();
    filters.listen_servers = this.uiFilterListenServersCheckButton.GetCheck();

    return filters;
  }

  public onDirectIPButtonClicked(): void {
    this.owner.uiMessageBox.InitMessageBox("message_box_direct_ip");
    this.owner.uiMessageBox.ShowDialog(true);
  }

  public onFiltersChange(): void {
    logger.info("Filters change");

    this.uiServerList.SetFilters(this.getFilters());
  }

  public onRefreshButtonClicked(): void {
    this.uiServerList.RefreshList(!this.isOnlineMode);
    this.onFiltersChange();
  }

  public onQuickRefreshButtonClicked(): void {
    this.uiServerList.RefreshQuick();
  }

  public onServerInfoButtonClicked(): void {
    this.uiServerList.ShowServerInfo();
  }
}
