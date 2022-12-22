import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";
import { IMultiplayerMenu } from "@/mod/scripts/ui/menu/MultiplayerMenu";

const log: DebugLogger = new DebugLogger("MultiplayerJoin");

export interface IMultiplayerJoin extends XR_CUIWindow {
  online: boolean;

  __init(online_mode: boolean): void;
  InitControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: IMultiplayerMenu): void;
}

export const MultiplayerJoin: IMultiplayerJoin = declare_xr_class("MultiplayerJoin", CUIWindow, {
  __init(online_mode: boolean): void {
    xr_class_super();
    this.online = online_mode;
  },
  __finalize(): void {},
  InitControls(x, y, xml, handler): void {
    log.info("Init controls");

    this.SetAutoDelete(true);

    xml.InitWindow("tab_client:main", 0, this);
    // --    this.bk = xml.InitFrame    ("frame", this)
    // --    xml.InitFrameLine        ("tab_client:vert_separator",this)

    handler.server_list = xml.InitServerList("tab_client:server_list", this);

    // --    xml.InitStatic("tab_client:cap_network_connection", this)
    xml.InitStatic("tab_client:cap_server_list", this);
    xml.InitStatic("tab_client:cap_filters", this);

    // --    xml.InitStatic("tab_client:rust_00",this)
    // --    xml.InitStatic("tab_client:rust_01",this)

    const btn = xml.Init3tButton("tab_client:btn_direct_ip", this);

    handler.Register(btn, "btn_direct_ip");
    handler.btn_direct_ip = btn;
    handler.filters = {};

    const checkEmpty = xml.InitCheck("tab_client:check_empty", this);

    handler.Register(checkEmpty, "check_empty");
    handler.filters.btn_check_empty = checkEmpty;
    checkEmpty.SetCheck(true);

    const checkFull = xml.InitCheck("tab_client:check_full", this);

    handler.Register(checkFull, "check_full");
    handler.filters.btn_check_full = checkFull;
    checkFull.SetCheck(true);

    const checkWithPass = xml.InitCheck("tab_client:check_with_pass", this);

    handler.Register(checkWithPass, "check_with_pass");
    handler.filters.btn_check_with_pass = checkWithPass;
    checkWithPass.SetCheck(true);

    const checkWithoutPass = xml.InitCheck("tab_client:check_without_pass", this);

    handler.Register(checkWithoutPass, "check_without_pass");
    handler.filters.btn_check_without_pass = checkWithoutPass;
    checkWithoutPass.SetCheck(true);

    const checkWithoutFf = xml.InitCheck("tab_client:check_without_ff", this);

    handler.Register(checkWithoutFf, "check_without_ff");
    handler.filters.btn_check_without_ff = checkWithoutFf;
    checkWithoutFf.SetCheck(true);

    const checkListenServers = xml.InitCheck("tab_client:check_listen_servers", this);

    handler.Register(checkListenServers, "check_listen_servers");
    handler.filters.btn_check_listen_servers = checkListenServers;
    checkListenServers.SetCheck(true);

    handler.Register(xml.Init3tButton("tab_client:btn_refresh", this), "btn_refresh");
    handler.Register(xml.Init3tButton("tab_client:btn_quick_refresh", this), "btn_quick_refresh");
    handler.Register(xml.Init3tButton("tab_client:btn_server_info", this), "btn_server_info");
  }
} as IMultiplayerJoin);
