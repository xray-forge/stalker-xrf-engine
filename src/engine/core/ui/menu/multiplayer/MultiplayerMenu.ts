import {
  CMainMenu,
  connect_error_cb,
  COptionsManager,
  CScriptXmlInit,
  CServerList,
  CUI3tButton,
  CUIEditBox,
  CUIMessageBoxEx,
  CUIScriptWnd,
  CUIStatic,
  CUITabControl,
  CUIWindow,
  DIK_keys,
  Frect,
  game,
  GAME_TYPE,
  level,
  login_operation_cb,
  LuabindClass,
  main_menu,
  SServerFilters,
  ui_events,
} from "xray16";

import { MainMenu } from "@/engine/core/ui/menu/MainMenu";
import { MultiplayerDemo } from "@/engine/core/ui/menu/multiplayer/MultiplayerDemo";
import { MultiplayerJoin } from "@/engine/core/ui/menu/multiplayer/MultiplayerJoin";
import { MultiplayerOptions } from "@/engine/core/ui/menu/multiplayer/MultiplayerOptions";
import { MultiplayerProfile } from "@/engine/core/ui/menu/multiplayer/MultiplayerProfile";
import { MultiplayerServer } from "@/engine/core/ui/menu/multiplayer/MultiplayerServer";
import { EOptionGroup } from "@/engine/core/ui/menu/options/options_types";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { Optional, Profile, TKeyCode, TPath, TUIEvent } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const baseOnline: TPath = "menu\\multiplayer\\MultiplayerOnline.component";
const baseOffline: TPath = "menu\\multiplayer\\MultiplayerOffline.component";

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerMenu extends CUIScriptWnd {
  public owner: MainMenu;
  public online: boolean;

  public tab!: CUITabControl;
  public messageBox!: CUIMessageBoxEx;
  public cdkey!: CUIEditBox;
  public playerNameEditBox!: CUIEditBox;

  public dialogMultiplayerJoin!: MultiplayerJoin;
  public dialogMultiplayerServer!: MultiplayerServer;
  public dialogMultiplayerDemo!: MultiplayerDemo;
  public dialogMultiplayerProfile!: MultiplayerProfile;
  public dialogMultiplayerOptions!: MultiplayerOptions;

  public uiServerList!: CServerList;
  public uiCreateButton!: CUI3tButton;
  public uiPlayDemoButton!: CUI3tButton;
  public uiJoinButton!: CUI3tButton;

  public constructor(owner: MainMenu, isOnlineMode: boolean) {
    super();

    this.owner = owner;
    this.online = isOnlineMode;

    this.initControls();
    this.initCallBacks();

    this.tab.SetActiveTab("client");
  }

  public initControls(): void {
    this.SetWndRect(new Frect().set(0, 0, 1024, 768));

    const xml: CScriptXmlInit = resolveXmlFile(this.online ? baseOnline : baseOffline);

    xml.InitStatic("background", this);

    this.Enable(true);

    const workArea: CUIWindow = new CUIWindow();

    xml.InitWindow("wrk_area", 0, workArea);
    workArea.SetAutoDelete(true);
    this.AttachChild(workArea);

    if (this.online) {
      xml.InitMPPlayerName("edit_player_name", workArea);
      xml.InitStatic("cap_cd_key", workArea);
      this.cdkey = xml.InitCDkey("edit_cd_key", workArea);
      this.Register(this.cdkey, "edit_cd_key");
    } else {
      xml.InitStatic("cap_unique_nick", workArea);
      this.playerNameEditBox = xml.InitEditBox("edit_player_name", workArea);
      this.Register(this.playerNameEditBox, "edit_player_name");
    }

    xml.InitStatic("cap_mode", workArea);

    this.dialogMultiplayerJoin = new MultiplayerJoin(this.online);
    this.dialogMultiplayerJoin.initialize(0, 0, xml, this);
    workArea.AttachChild(this.dialogMultiplayerJoin);

    this.dialogMultiplayerOptions = new MultiplayerOptions(this.online);
    this.dialogMultiplayerOptions.InitControls(0, 0, xml, this);
    this.dialogMultiplayerOptions.Show(false);
    workArea.AttachChild(this.dialogMultiplayerOptions);

    this.dialogMultiplayerServer = new MultiplayerServer(this);
    this.dialogMultiplayerServer.initialize(0, 0, xml, this);
    this.dialogMultiplayerServer.Show(false);
    workArea.AttachChild(this.dialogMultiplayerServer);

    this.dialogMultiplayerDemo = new MultiplayerDemo();
    this.dialogMultiplayerDemo.initControls(0, 0, xml, this);
    this.dialogMultiplayerDemo.Show(false);
    workArea.AttachChild(this.dialogMultiplayerDemo);

    if (this.online) {
      this.dialogMultiplayerProfile = new MultiplayerProfile();
      this.dialogMultiplayerProfile.initControls(0, 0, xml, this);
      this.dialogMultiplayerProfile.Show(false);
      workArea.AttachChild(this.dialogMultiplayerProfile);
    }

    let button: CUI3tButton = xml.Init3tButton("btn_create", workArea);

    this.Register(button, "btn_create");
    this.uiCreateButton = button;
    button.Enable(false);

    button = xml.Init3tButton("btn_play_demo", workArea);
    this.Register(button, "btn_play_demo");
    this.uiPlayDemoButton = button;
    button.Enable(false);

    button = xml.Init3tButton("btn_join", workArea);
    this.Register(button, "btn_join");
    this.uiJoinButton = button;

    button = xml.Init3tButton("btn_cancel", workArea);
    this.Register(button, "btn_cancel");

    this.tab = xml.InitTab("tab", workArea);
    this.Register(this.tab, "tab");

    this.messageBox = new CUIMessageBoxEx();
    this.Register(this.messageBox, "msg_box");

    const version: CUIStatic = xml.InitStatic("static_version", this);
    const mm: CMainMenu = main_menu.get_main_menu();

    version.TextControl().SetText(string.format(forgeConfig.VERSION, mm.GetGSVer()));

    if (this.online) {
      this.cdkey.SetText(mm.GetCDKey());
    } else {
      this.playerNameEditBox.SetText(mm.GetPlayerName());
    }

    this.uiServerList.SetConnectionErrCb(
      new connect_error_cb(this, (code, description) => this.onConnectError(code, description))
    );
  }

  public updateControls(): void {
    const optionsManager: COptionsManager = new COptionsManager();

    optionsManager.SetCurrentValues(EOptionGroup.MULTIPLAYER_CLIENT);
    optionsManager.SetCurrentValues(EOptionGroup.MULTIPLAYER_SERVER);
    optionsManager.SetCurrentValues(EOptionGroup.MULTIPLAYER_SERVER_FILTER);

    optionsManager.SaveBackupValues(EOptionGroup.MULTIPLAYER_CLIENT);
    optionsManager.SaveBackupValues(EOptionGroup.MULTIPLAYER_SERVER);
    optionsManager.SaveBackupValues(EOptionGroup.MULTIPLAYER_SERVER_FILTER);

    this.dialogMultiplayerServer.uiMapList.ClearList();
    this.dialogMultiplayerServer.uiMapList.OnModeChange();
    this.dialogMultiplayerOptions.setGameMode(this.dialogMultiplayerServer.uiMapList.GetCurGameType());

    if (this.online) {
      this.dialogMultiplayerProfile.updateControls();
    }

    const mainMenu: CMainMenu = main_menu.get_main_menu();

    if (this.online) {
      this.cdkey.SetText(mainMenu.GetCDKey());
    } else {
      this.playerNameEditBox.SetText(mainMenu.GetPlayerName());
    }

    this.dialogMultiplayerServer.onGameModeChange();

    if (level.present()) {
      this.uiCreateButton.Enable(false);
      this.uiJoinButton.Enable(false);
      this.dialogMultiplayerJoin.uiDirectIPButton.Enable(false);
      this.tab.Enable(false);
      this.cdkey.Enable(false);
      // --        this.player_name.Enable    (false)
    }
  }

  public initCallBacks(): void {
    this.AddCallback("btn_cancel", ui_events.BUTTON_CLICKED, () => this.onCancelButtonClicked(), this);
    this.AddCallback("btn_create", ui_events.BUTTON_CLICKED, () => this.onCreateButtonClicked(), this);
    this.AddCallback("btn_join", ui_events.BUTTON_CLICKED, () => this.onJoinButtonClicked(), this);

    this.AddCallback("check_empty", ui_events.BUTTON_CLICKED, () => this.onFilterChange(), this);
    this.AddCallback("check_full", ui_events.BUTTON_CLICKED, () => this.onFilterChange(), this);
    this.AddCallback("check_with_pass", ui_events.BUTTON_CLICKED, () => this.onFilterChange(), this);
    this.AddCallback("check_without_pass", ui_events.BUTTON_CLICKED, () => this.onFilterChange(), this);
    this.AddCallback("check_without_ff", ui_events.BUTTON_CLICKED, () => this.onFilterChange(), this);
    this.AddCallback("check_listen_servers", ui_events.BUTTON_CLICKED, () => this.onFilterChange(), this);

    this.AddCallback("btn_direct_ip", ui_events.BUTTON_CLICKED, () => this.onDirectIPButtonClicked(), this);

    this.AddCallback("tab", ui_events.TAB_CHANGED, () => this.onTabChange(), this);
    // -- ui_mm_mp_join
    this.AddCallback("btn_refresh", ui_events.BUTTON_CLICKED, () => this.onRefreshButtonClicked(), this);
    this.AddCallback("btn_quick_refresh", ui_events.BUTTON_CLICKED, () => this.onQuickRefreshButtonClicked(), this);
    this.AddCallback("btn_server_info", ui_events.BUTTON_CLICKED, () => this.onServerInfoButtonClicked(), this);

    // -- msg_box
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_YES_CLICKED, () => this.onDirectIPConfirmationClicked(), this);

    this.AddCallback("edit_cd_key", ui_events.EDIT_TEXT_COMMIT, () => this.onCDKeyChanged(), this);
    this.AddCallback("edit_player_name", ui_events.EDIT_TEXT_COMMIT, () => this.onPlayerNameChanged(), this);

    // -- demo playing

    this.AddCallback(
      "demo_list_window",
      ui_events.LIST_ITEM_CLICKED,
      () => this.dialogMultiplayerDemo.selectDemoFile(),
      this.dialogMultiplayerDemo
    );
    this.AddCallback(
      "demo_list_window",
      ui_events.WINDOW_LBUTTON_DB_CLICK,
      () => this.dialogMultiplayerDemo.playSelectedDemo(),
      this.dialogMultiplayerDemo
    );

    this.AddCallback(
      "btn_play_demo",
      ui_events.BUTTON_CLICKED,
      () => this.dialogMultiplayerDemo.playSelectedDemo(),
      this.dialogMultiplayerDemo
    );
    this.AddCallback(
      "demo_file_name",
      ui_events.EDIT_TEXT_COMMIT,
      () => this.dialogMultiplayerDemo.onRenameDemo(),
      this.dialogMultiplayerDemo
    );
    this.AddCallback(
      "demo_message_box",
      ui_events.MESSAGE_BOX_YES_CLICKED,
      () => this.dialogMultiplayerDemo.onMsgBoxYes(),
      this.dialogMultiplayerDemo
    );
    this.AddCallback(
      "demo_message_box",
      ui_events.MESSAGE_BOX_OK_CLICKED,
      () => this.dialogMultiplayerDemo.onMsgBoxYes(),
      this.dialogMultiplayerDemo
    );

    this.AddCallback("check_demosave", ui_events.BUTTON_CLICKED, () => this.onDemoSaveChange(), this);
  }

  public onDirectIPButtonClicked(): void {
    logger.info("Button direct IP");

    this.messageBox.InitMessageBox("message_box_direct_ip");
    this.messageBox.ShowDialog(true);
  }

  public onDirectIPConfirmationClicked(): void {
    logger.info("On direct API confirm");

    if (string.len(this.messageBox.GetHost()) !== 0) {
      // -- const cmd = "start client(" + this.message_box.GetHost() + "/name=" + this.player_name.GetText()
      // + "/psw=" + this.message_box.GetPassword() + ")"
      executeConsoleCommand(
        consoleCommands.start,
        "client(" +
          this.messageBox.GetHost() +
          "/name=" +
          this.owner.xrGameSpyProfile!.unique_nick() +
          "/psw=" +
          this.messageBox.GetPassword() +
          ")"
      );
    }
  }

  public onCDKeyChanged(): void {
    logger.info("CD key changed");

    const cdKey: string = this.cdkey.GetText();

    executeConsoleCommand(consoleCommands.cdkey, cdKey === "" ? "clear" : cdKey);
  }

  public onPlayerNameChanged(): void {
    logger.info("Player name changed");

    let tempPlayerName = this.playerNameEditBox.GetText();

    if (tempPlayerName === "") {
      tempPlayerName = "noname";
      this.messageBox.InitMessageBox("message_box_error");
      this.messageBox.SetText("mp_nick_name_not_valid");
      this.messageBox.ShowDialog(true);
    }

    this.owner.xrLoginManager.set_unique_nick(
      tempPlayerName,
      new login_operation_cb(this, (code, description) => this.onChangeNickOperationResult(code, description))
    );
  }

  public onChangeNickOperationResult(error: unknown, description: string): void {
    // -- assert(profile)
  }

  public onServerInfoButtonClicked(): void {
    logger.info("Server info");

    this.uiServerList.ShowServerInfo();
  }

  public onFilterChange(): void {
    logger.info("Filter change");

    const filters: SServerFilters = new SServerFilters();

    filters.empty = this.dialogMultiplayerJoin.uiFilters.btn_check_empty.GetCheck();
    filters.full = this.dialogMultiplayerJoin.uiFilters.btn_check_full.GetCheck();
    filters.with_pass = this.dialogMultiplayerJoin.uiFilters.btn_check_with_pass.GetCheck();
    filters.without_pass = this.dialogMultiplayerJoin.uiFilters.btn_check_without_pass.GetCheck();
    filters.without_ff = this.dialogMultiplayerJoin.uiFilters.btn_check_without_ff.GetCheck();
    filters.listen_servers = this.dialogMultiplayerJoin.uiFilters.btn_check_listen_servers.GetCheck();

    this.uiServerList.SetFilters(filters);
  }

  public onDemoSaveChange(): void {
    logger.info("Demo save change");

    executeConsoleCommand(
      consoleCommands.cl_mpdemosave,
      this.dialogMultiplayerOptions.uiCheckDemosave.GetCheck() ? 1 : 0
    );
  }

  public onTabChange(): void {
    logger.info("Tab changed");

    this.dialogMultiplayerJoin.Show(false);
    this.dialogMultiplayerOptions.Show(false);
    this.dialogMultiplayerServer.Show(false);
    this.dialogMultiplayerDemo.Show(false);

    if (this.online) {
      this.dialogMultiplayerProfile.Show(false);
    }

    this.uiJoinButton.Show(false);
    this.uiCreateButton.Show(false);
    this.uiPlayDemoButton.Show(false);

    const id = this.tab.GetActiveId();

    if (id === "client") {
      this.dialogMultiplayerJoin.Show(true);
      this.uiJoinButton.Show(true);
    } else if (id === "options") {
      this.dialogMultiplayerOptions.Show(true);
      this.uiCreateButton.Show(true);
    } else if (id === "server") {
      this.dialogMultiplayerServer.uiMapList.LoadMapList();
      this.dialogMultiplayerServer.uiMapList.OnModeChange();
      this.dialogMultiplayerServer.Show(true);
      this.uiCreateButton.Show(true);
    } else if (id === "demo") {
      this.dialogMultiplayerDemo.fillList();
      this.dialogMultiplayerDemo.Show(true);
      this.uiPlayDemoButton.Show(true);
    } else if (id === "profile") {
      this.dialogMultiplayerProfile.Show(true);
      this.dialogMultiplayerProfile.uiEditUniqueNick.SetText(this.owner.xrGameSpyProfile!.unique_nick());
    }
  }

  public onRadioNetChanged(): void {
    logger.info("Radio net checked");

    this.uiServerList.NetRadioChanged(!this.online);
    this.uiServerList.RefreshList(!this.online);
    this.onFilterChange();
  }

  public onRefreshButtonClicked(): void {
    logger.info("Button refresh");

    this.uiServerList.RefreshList(!this.online);
    this.onFilterChange();
  }

  public onQuickRefreshButtonClicked(): void {
    logger.info("Button quick refresh");
    this.uiServerList.RefreshQuick();
  }

  public onCancelButtonClicked(): void {
    logger.info("Button cancel");

    const opt: COptionsManager = new COptionsManager();

    opt.UndoGroup("mm_mp_client");
    opt.UndoGroup("mm_mp_server");
    opt.UndoGroup("mm_mp_srv_filter");

    this.owner.ShowDialog(true);
    this.HideDialog();
    this.owner.Show(true);
  }

  public onCreateButtonClicked(): void {
    logger.info("Button create");

    if (this.dialogMultiplayerServer.uiMapList.IsEmpty()) {
      this.messageBox.InitMessageBox("select_map");
      this.messageBox.ShowDialog(true);

      return;
    }

    const mm: CMainMenu = main_menu.get_main_menu();
    const gsProfile: Optional<Profile> = this.owner.xrLoginManager.get_current_profile();

    if (gsProfile && gsProfile.online() && mm.ValidateCDKey() === false) {
      return;
    }

    const opt: COptionsManager = new COptionsManager();

    opt.SaveValues("mm_mp_server");
    opt.SaveValues("mm_mp_client");
    opt.SaveValues("mm_mp_srv_filter");
    this.dialogMultiplayerServer.uiMapList.SaveMapList();
    this.gatherServerData();
    if (this.dialogMultiplayerServer.uiCheckDedicated.GetCheck()) {
      this.dialogMultiplayerServer.uiMapList.StartDedicatedServer();
    } else {
      executeConsoleCommand(consoleCommands.main_menu, "off");
      executeConsoleCommand(
        this.dialogMultiplayerServer.uiMapList.GetCommandLine(this.owner.xrGameSpyProfile!.unique_nick())
      );
    }
  }

  public gatherServerData(): void {
    logger.info("Gather server data");

    let cmdstr = "";
    let tmpStr: string;

    // -- server name ------------------------------------------------------------------
    tmpStr = this.dialogMultiplayerServer.uiEditServerName.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = "/hname=" + tmpStr;
    }

    // -- password ---------------------------------------------------------------------
    tmpStr = this.dialogMultiplayerServer.uiEditPassword.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/psw=" + tmpStr;
    }

    // -- max players ------------------------------------------------------------------
    tmpStr = this.dialogMultiplayerServer.uiSpinMaxPlayers.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/maxplayers=" + tmpStr;
    }
    // -- public server ----------------------------------------------------------------

    if (this.online === true) {
      cmdstr = cmdstr + "/public=1";
    }

    tmpStr = this.dialogMultiplayerOptions.uiSpinMaxPing.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/maxping=" + tmpStr;
    }

    // -- spectator --------------------------------------------------------------------
    if (this.dialogMultiplayerOptions.uiCheckSpectator.GetCheck()) {
      tmpStr = this.dialogMultiplayerOptions.uiSpinSpectator.GetText();
      if (string.len(tmpStr) > 0) {
        cmdstr = cmdstr + "/spectr=" + tmpStr;
      }
    }

    // -- spectator options --
    let tmpNum: number = 0;

    if (this.dialogMultiplayerOptions.uiCheckSpecFreefly.GetCheck()) {
      tmpNum = tmpNum + 1;
    }

    if (this.dialogMultiplayerOptions.uiCheckSpecFirsteye.GetCheck()) {
      tmpNum = tmpNum + 2;
    }

    if (this.dialogMultiplayerOptions.uiCheckSpecLookat.GetCheck()) {
      tmpNum = tmpNum + 4;
    }

    if (this.dialogMultiplayerOptions.uiCheckSpecFreelook.GetCheck()) {
      tmpNum = tmpNum + 8;
    }

    if (this.dialogMultiplayerOptions.uiCheckSpecTeamonly.GetCheck()) {
      tmpNum = tmpNum + 16;
    }

    cmdstr = cmdstr + "/spectrmds=" + tmpNum;

    // -- allow voting ------------------------------------------------------------------
    const tmpBool: boolean = this.dialogMultiplayerOptions.uiCheckAllowVoting.GetCheck();

    if (tmpBool === true) {
      cmdstr = cmdstr + "/vote=1";
    }

    // -- damage block ------------------------------------------------------------------
    tmpStr = this.dialogMultiplayerOptions.uiSpinDamageBlock.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/dmgblock=" + tmpStr;
    }

    if (this.dialogMultiplayerOptions.uiCheckDamageBlock.GetCheck()) {
      cmdstr = cmdstr + "/dmbi=1";
    }

    // -- frag limit ---------------------------------------------------------------------
    tmpStr = this.dialogMultiplayerOptions.uiSpinFragLimit.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/fraglimit=" + tmpStr;
    }

    // -- time limit ---------------------------------------------------------------------
    tmpStr = this.dialogMultiplayerOptions.uiSpinTimeLimit.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/timelimit=" + tmpStr;
    }

    // -- friendly fire ------------------------------------------------------------------
    tmpStr = this.dialogMultiplayerOptions.uiSpinFriendlyFire.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/ffire=" + tmpStr;
    }

    // -- auto team balance --------------------------------------------------------------
    if (this.dialogMultiplayerOptions.uiCheckAutoTeamBalance.GetCheck()) {
      cmdstr = cmdstr + "/abalance=1";
    }

    // -- auto team swap --------------------------------------------------------------
    if (this.dialogMultiplayerOptions.uiCheckAutoTeamSwap.GetCheck()) {
      cmdstr = cmdstr + "/aswap=1";
    }

    // -- Force respawn --------------------------------------------------------------
    if (this.dialogMultiplayerOptions.uiTabRespawn.GetActiveId() === "reinforcement") {
      tmpStr = this.dialogMultiplayerOptions.uiSpinForceRespawn.GetText();
      if (string.len(tmpStr) > 0) {
        cmdstr = cmdstr + "/frcrspwn=" + tmpStr;
      }
    }

    // todo: Unepxeted condition? -- ARTEFACTHUNT only ----------------------------------------------
    if ((GAME_TYPE.GAME_UNKNOWN as number) !== 0) {
      if (this.dialogMultiplayerServer.uiMapList.GetCurGameType() === GAME_TYPE.eGameIDArtefactHunt) {
        // -- number of artefacts ---------------------------------------------------------
        tmpStr = this.dialogMultiplayerOptions.uiSpinArtefactsNum.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/anum=" + tmpStr;
        }

        // -- aretefact delay --------------------------------------------------------------
        tmpStr = this.dialogMultiplayerOptions.uiSpinArtefactDelay.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/ardelta=" + tmpStr;
        }

        // -- artefact stay ----------------------------------------------------------------
        tmpStr = this.dialogMultiplayerOptions.uiSpinArtefactStay.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/astime=" + tmpStr;
        }

        if (this.dialogMultiplayerOptions.uiTabRespawn.GetActiveId() === "artefactcapture") {
          // -- artefact capture selected
          cmdstr = cmdstr + "/reinf=-1";
        } else {
          tmpStr = this.dialogMultiplayerOptions.uiSpinReinforcement.GetText();
          if (string.len(tmpStr) > 0) {
            cmdstr = cmdstr + "/reinf=" + tmpStr;
          }
        }
      }

      // -- CAPTURETHEARTEFACT only ----------------------------------------------
      if (this.dialogMultiplayerServer.uiMapList.GetCurGameType() === GAME_TYPE.eGameIDCaptureTheArtefact) {
        // -- number of artefacts ---------------------------------------------------------
        tmpStr = this.dialogMultiplayerOptions.uiSpinArtefactsNum.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/anum=" + tmpStr;
        }

        tmpStr = this.dialogMultiplayerOptions.uiSpinReinforcement.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/reinf=" + tmpStr;
        }

        tmpStr = this.dialogMultiplayerOptions.uiSpinArtreturnTime.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/artrettime=" + tmpStr;
        }

        if (this.dialogMultiplayerOptions.uiCheckActivatedReturn.GetCheck()) {
          cmdstr = cmdstr + "/actret=1";
        }
      }
    } else if ((GAME_TYPE.GAME_UNKNOWN as number) === 0) {
      if (this.dialogMultiplayerServer.uiMapList.GetCurGameType() === GAME_TYPE.GAME_ARTEFACTHUNT) {
        // -- number of artefacts ---------------------------------------------------------
        tmpStr = this.dialogMultiplayerOptions.uiSpinArtefactsNum.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/anum=" + tmpStr;
        }

        // -- aretefact delay --------------------------------------------------------------
        tmpStr = this.dialogMultiplayerOptions.uiSpinArtefactDelay.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/ardelta=" + tmpStr;
        }

        // -- artefact stay ----------------------------------------------------------------
        tmpStr = this.dialogMultiplayerOptions.uiSpinArtefactStay.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/astime=" + tmpStr;
        }

        if (this.dialogMultiplayerOptions.uiTabRespawn.GetActiveId() === "artefactcapture") {
          // -- artefact capture selected
          cmdstr = cmdstr + "/reinf=-1";
        } else {
          tmpStr = this.dialogMultiplayerOptions.uiSpinReinforcement.GetText();
          if (string.len(tmpStr) > 0) {
            cmdstr = cmdstr + "/reinf=" + tmpStr;
          }
        }
      }
    }

    // -- friendly indicators --------------------------------------------------------------
    if (this.dialogMultiplayerOptions.uiCheckFriendlyIndicators.GetCheck()) {
      cmdstr = cmdstr + "/fi=1" + tmpStr;
    }

    // -- friendly indicators --------------------------------------------------------------
    if (this.dialogMultiplayerOptions.uiCheckFriendlyNames.GetCheck()) {
      cmdstr = cmdstr + "/fn=1" + tmpStr;
    }

    // -- anomaly time ---------------------------------------------------------------------
    if (this.dialogMultiplayerOptions.uiCheckNoAnmalies.GetCheck() === false) {
      tmpStr = this.dialogMultiplayerOptions.uiSpinAnomalyTime.GetText();
      if (string.len(tmpStr) > 0) {
        cmdstr = cmdstr + "/ans=1/anslen=" + tmpStr;
      }
    } else {
      cmdstr = cmdstr + "/ans=0";
    }

    // -- pda hunt -------------------------------------------------------------------------
    if (this.dialogMultiplayerOptions.uiCheckDdaHunt.GetCheck()) {
      cmdstr = cmdstr + "/pdahunt=1";
    }

    // -- warm up time ---------------------------------------------------------------------
    tmpStr = this.dialogMultiplayerOptions.uiSpinWarmUpTime.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/warmup=" + tmpStr;
    }

    // -- rate of weather change -----------------------------------------------------------
    tmpStr = this.dialogMultiplayerOptions.uiSpinRateOfChange.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/etimef=" + tmpStr;
    }

    this.dialogMultiplayerServer.uiMapList.SetServerParams(cmdstr);
  }

  public GoToProfileTab(): void {
    logger.info("Go to profile tab");
    this.tab.SetActiveTab("profile");
  }

  public onConnectError(code: number, description: string): void {
    logger.info("Connection error:", code, description);

    this.messageBox.InitMessageBox("message_box_error");

    if (description === "") {
      description = "mp_gp_connect_error";
    }

    this.messageBox.SetText(game.translate_string(description));

    // --if    ((err_code === CServerList.ece_unique_nick_not_registred) or
    // --    (err_code === CServerList.ece_unique_nick_expired)) {
    this.GoToProfileTab();
    this.messageBox.ShowDialog(true);
  }

  public onJoinButtonClicked(): void {
    logger.info("Join clicked");

    const optionsManager: COptionsManager = new COptionsManager();

    optionsManager.SaveValues(EOptionGroup.MULTIPLAYER_CLIENT);
    optionsManager.SaveValues(EOptionGroup.MULTIPLAYER_SERVER);
    optionsManager.SaveValues(EOptionGroup.MULTIPLAYER_SERVER_FILTER);

    this.uiServerList.SetPlayerName(this.owner.xrGameSpyProfile!.unique_nick()); // --this.player_name.GetText())
    this.uiServerList.ConnectToSelected();
  }

  public override OnKeyboard(key: TKeyCode, action: TUIEvent): boolean {
    super.OnKeyboard(key, action);

    if (action === ui_events.WINDOW_KEY_PRESSED) {
      if (key === DIK_keys.DIK_ESCAPE) {
        this.owner.ShowDialog(true); // --new(show main window)
        this.HideDialog();
        this.owner.Show(true);
      }
    }

    return true;
  }
}
