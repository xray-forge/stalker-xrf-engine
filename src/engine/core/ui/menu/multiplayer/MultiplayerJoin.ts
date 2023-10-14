import { CScriptXmlInit, CUI3tButton, CUICheckButton, CUIWindow, LuabindClass } from "xray16";

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer/MultiplayerMenu";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerJoin extends CUIWindow {
  public isOnlineMode: boolean;
  public uiFilters!: Record<string, CUICheckButton>;
  public uiDirectIPButton!: CUI3tButton;

  public constructor(isOnlineMode: boolean) {
    super();
    this.isOnlineMode = isOnlineMode;
  }

  public initialize(x: number, y: number, xml: CScriptXmlInit, owner: MultiplayerMenu): void {
    this.SetAutoDelete(true);

    xml.InitWindow("tab_client:main", 0, this);
    // --    this.bk = xml.InitFrame    ("frame", this)
    // --    xml.InitFrameLine        ("tab_client:vert_separator",this)

    owner.uiServerList = xml.InitServerList("tab_client:server_list", this);

    // --    xml.InitStatic("tab_client:cap_network_connection", this)
    xml.InitStatic("tab_client:cap_server_list", this);
    xml.InitStatic("tab_client:cap_filters", this);

    // --    xml.InitStatic("tab_client:rust_00",this)
    // --    xml.InitStatic("tab_client:rust_01",this)

    const btn = xml.Init3tButton("tab_client:btn_direct_ip", this);

    owner.Register(btn, "btn_direct_ip");
    this.uiDirectIPButton = btn;
    this.uiFilters = {};

    const checkEmpty = xml.InitCheck("tab_client:check_empty", this);

    owner.Register(checkEmpty, "check_empty");
    this.uiFilters.btn_check_empty = checkEmpty;
    checkEmpty.SetCheck(true);

    const checkFull = xml.InitCheck("tab_client:check_full", this);

    owner.Register(checkFull, "check_full");
    this.uiFilters.btn_check_full = checkFull;
    checkFull.SetCheck(true);

    const checkWithPass = xml.InitCheck("tab_client:check_with_pass", this);

    owner.Register(checkWithPass, "check_with_pass");
    this.uiFilters.btn_check_with_pass = checkWithPass;
    checkWithPass.SetCheck(true);

    const checkWithoutPass = xml.InitCheck("tab_client:check_without_pass", this);

    owner.Register(checkWithoutPass, "check_without_pass");
    this.uiFilters.btn_check_without_pass = checkWithoutPass;
    checkWithoutPass.SetCheck(true);

    const checkWithoutFf = xml.InitCheck("tab_client:check_without_ff", this);

    owner.Register(checkWithoutFf, "check_without_ff");
    this.uiFilters.btn_check_without_ff = checkWithoutFf;
    checkWithoutFf.SetCheck(true);

    const checkListenServers = xml.InitCheck("tab_client:check_listen_servers", this);

    owner.Register(checkListenServers, "check_listen_servers");
    this.uiFilters.btn_check_listen_servers = checkListenServers;
    checkListenServers.SetCheck(true);

    owner.Register(xml.Init3tButton("tab_client:btn_refresh", this), "btn_refresh");
    owner.Register(xml.Init3tButton("tab_client:btn_quick_refresh", this), "btn_quick_refresh");
    owner.Register(xml.Init3tButton("tab_client:btn_server_info", this), "btn_server_info");
  }
}
