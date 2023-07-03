import {
  CConsole,
  CMainMenu,
  connect_error_cb,
  COptionsManager,
  CScriptXmlInit,
  CServerList,
  CUI3tButton,
  CUICheckButton,
  CUIComboBox,
  CUIEditBox,
  CUIEditBoxEx,
  CUIMapList,
  CUIMessageBoxEx,
  CUIProgressBar,
  CUIScriptWnd,
  CUISpinFlt,
  CUISpinNum,
  CUISpinText,
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
  profile,
  SServerFilters,
  ui_events,
} from "xray16";

import { MainMenu } from "@/engine/core/ui/menu/MainMenu";
import { MultiplayerDemo } from "@/engine/core/ui/menu/multiplayer/MultiplayerDemo";
import { MultiplayerJoin } from "@/engine/core/ui/menu/multiplayer/MultiplayerJoin";
import { MultiplayerOptions } from "@/engine/core/ui/menu/multiplayer/MultiplayerOptions";
import { MultiplayerProfile } from "@/engine/core/ui/menu/multiplayer/MultiplayerProfile";
import { MultiplayerServer } from "@/engine/core/ui/menu/multiplayer/MultiplayerServer";
import { EOptionGroup } from "@/engine/core/ui/menu/options/types";
import { executeConsoleCommand } from "@/engine/core/utils/game/game_console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { Optional, PatchDownloadProgress, Profile, TKeyCode, TPath, TUIEvent } from "@/engine/lib/types";

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
  public dialogMultiplayerOptions!: MultiplayerOptions;
  public dialogMultiplayerServer!: MultiplayerServer;
  public dialogMultiplayerDemo!: MultiplayerDemo;
  public dialogMultiplayerProfile!: MultiplayerProfile;

  public uiServerList!: CServerList;
  public uiMapList!: CUIMapList;
  public uiDirectIPButton!: CUI3tButton;
  public uiFilters!: Record<string, CUICheckButton>;
  public uiSpinMaxPing!: CUISpinText;
  public uiSpinSpectator!: CUISpinNum;
  public uiCheckDedicated!: CUICheckButton;
  public uiCheckDemosave!: CUICheckButton;
  public uiCheckSpectator!: CUICheckButton;
  public uiCheckSpecFreefly!: CUICheckButton;
  public uiCheckSpecFirsteye!: CUICheckButton;
  public uiCheckSpecLookat!: CUICheckButton;
  public uiCheckSpecFreelook!: CUICheckButton;
  public uiCheckSpecTeamonly!: CUICheckButton;
  public uiCheckAllowVoting!: CUICheckButton;
  public uiCheckAutoTeamBalance!: CUICheckButton;
  public uiCheckAutoTeamSwap!: CUICheckButton;
  public uiCheckDamageBlock!: CUICheckButton;
  public uiCheckFriendlyIndicators!: CUICheckButton;
  public uiCheckFriendlyNames!: CUICheckButton;
  public uiCheckNoAnmalies!: CUICheckButton;
  public uiCheckDdaHunt!: CUICheckButton;
  public uiCheckActivatedReturn!: CUICheckButton;
  public uiSpinArtreturnTime!: CUISpinNum;
  public uiSpinAnomalyTime!: CUISpinNum;
  public uiSpinWarmUpTime!: CUISpinNum;
  public uiSpinRateOfChange!: CUISpinFlt;
  public uiSpinDamageBlock!: CUISpinNum;
  public uiSpinFragLimit!: CUISpinNum;
  public uiSpinTimeLimit!: CUISpinNum;
  public uiSpinFriendlyFire!: CUISpinFlt;
  public uiSpinForceRespawn!: CUISpinNum;
  public uiSpinMaxPlayers!: CUISpinNum;
  public uiSpinArtefactsNum!: CUISpinNum;
  public uiSpinArtefactDelay!: CUISpinNum;
  public uiSpinArtefactStay!: CUISpinNum;
  public uiSpinReinforcement!: CUISpinNum;
  public uiSpinMode!: CUISpinText;
  public uiSpinWeather!: CUIComboBox;
  public uiTabRespawn!: CUITabControl;
  public uiEditServerName!: CUIEditBoxEx;
  public uiEditPassword!: CUIEditBox;
  public uiCapDownload!: CUIStatic;
  public uiTextDownload!: CUIStatic;
  public uiDownloadProgress!: CUIProgressBar;
  public uiCancelDownloadButton!: CUI3tButton;
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

    const xml: CScriptXmlInit = new CScriptXmlInit();

    if (this.online) {
      xml.ParseFile(resolveXmlFormPath(baseOnline));
    } else {
      xml.ParseFile(resolveXmlFormPath(baseOffline));
    }

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
    this.dialogMultiplayerJoin.InitControls(0, 0, xml, this);
    workArea.AttachChild(this.dialogMultiplayerJoin);

    this.dialogMultiplayerOptions = new MultiplayerOptions(this.online);
    this.dialogMultiplayerOptions.InitControls(0, 0, xml, this);
    this.dialogMultiplayerOptions.Show(false);
    workArea.AttachChild(this.dialogMultiplayerOptions);

    this.dialogMultiplayerServer = new MultiplayerServer();
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

    this.uiCapDownload = xml.InitStatic("download_static", workArea);
    this.uiTextDownload = xml.InitStatic("download_text", workArea);
    this.uiDownloadProgress = xml.InitProgressBar("progress_download", workArea);
    this.uiCancelDownloadButton = xml.Init3tButton("btn_cancel_download", workArea);
    this.Register(this.uiCancelDownloadButton, "btn_cancel_download");

    const version: CUIStatic = xml.InitStatic("static_version", this);
    const mm: CMainMenu = main_menu.get_main_menu();

    version.TextControl().SetText(string.format(gameConfig.VERSION, mm.GetGSVer()));

    if (this.online) {
      this.cdkey.SetText(mm.GetCDKey());
    } else {
      this.playerNameEditBox.SetText(mm.GetPlayerName());
    }

    this.uiServerList.SetConnectionErrCb(
      new connect_error_cb(this, (code, description) => this.OnConnectError(code, description))
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

    this.uiMapList.ClearList();
    this.uiMapList.OnModeChange();
    this.dialogMultiplayerOptions.SetGameMode(this.uiMapList.GetCurGameType(), this);

    if (this.online) {
      this.dialogMultiplayerProfile.updateControls();
    }

    const mm: CMainMenu = main_menu.get_main_menu();

    if (this.online) {
      this.cdkey.SetText(mm.GetCDKey());
    } else {
      this.playerNameEditBox.SetText(mm.GetPlayerName());
    }

    this.onGameModeChange();

    if (level.present()) {
      this.uiCreateButton.Enable(false);
      this.uiJoinButton.Enable(false);
      this.uiDirectIPButton.Enable(false);
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

    this.AddCallback("btn_direct_ip", ui_events.BUTTON_CLICKED, () => this.onDirrectIPButtonClicked(), this);

    // -- ui_mm_mp_options
    this.AddCallback("spin_game_mode", ui_events.LIST_ITEM_SELECT, () => this.onGameModeChange(), this);

    this.AddCallback("tab", ui_events.TAB_CHANGED, () => this.onTabChange(), this);
    // -- ui_mm_mp_join
    this.AddCallback("btn_refresh", ui_events.BUTTON_CLICKED, () => this.onRefreshButtonClicked(), this);
    this.AddCallback("btn_quick_refresh", ui_events.BUTTON_CLICKED, () => this.onQuickRefreshButtonClicked(), this);
    this.AddCallback("btn_server_info", ui_events.BUTTON_CLICKED, () => this.onServerInfoButtonClicked(), this);

    // -- msg_box
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_YES_CLICKED, () => this.onDirectIPConfirmationClicked(), this);

    this.AddCallback("edit_cd_key", ui_events.EDIT_TEXT_COMMIT, () => this.onCDKeyChanged(), this);
    this.AddCallback("edit_player_name", ui_events.EDIT_TEXT_COMMIT, () => this.onPlayerNameChanged(), this);

    this.AddCallback("btn_cancel_download", ui_events.BUTTON_CLICKED, () => this.onDownloadCancelButtonClicked(), this);
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

  public onDirrectIPButtonClicked(): void {
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

  public onGameModeChange(): void {
    logger.info("Game mode change");

    this.uiMapList.OnModeChange();
    this.dialogMultiplayerOptions.SetGameMode(this.uiMapList.GetCurGameType(), this);
  }

  public onFilterChange(): void {
    logger.info("Filter change");

    const sf: SServerFilters = new SServerFilters();

    sf.empty = this.uiFilters.btn_check_empty.GetCheck();
    sf.full = this.uiFilters.btn_check_full.GetCheck();
    sf.with_pass = this.uiFilters.btn_check_with_pass.GetCheck();
    sf.without_pass = this.uiFilters.btn_check_without_pass.GetCheck();
    sf.without_ff = this.uiFilters.btn_check_without_ff.GetCheck();
    sf.listen_servers = this.uiFilters.btn_check_listen_servers.GetCheck();

    this.uiServerList.SetFilters(sf);
  }

  public onDemoSaveChange(): void {
    logger.info("Demo save change");

    executeConsoleCommand(consoleCommands.cl_mpdemosave, this.uiCheckDemosave.GetCheck() ? 1 : 0);
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
      this.uiMapList.LoadMapList();
      this.uiMapList.OnModeChange();
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

    if (this.uiMapList.IsEmpty()) {
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
    this.uiMapList.SaveMapList();
    this.gatherServerData();
    if (this.uiCheckDedicated.GetCheck()) {
      this.uiMapList.StartDedicatedServer();
    } else {
      executeConsoleCommand(consoleCommands.main_menu, "off");
      executeConsoleCommand(this.uiMapList.GetCommandLine(this.owner.xrGameSpyProfile!.unique_nick()));
    }
  }

  public gatherServerData(): void {
    logger.info("Gather server data");

    let cmdstr = "";
    let tmpStr: string;

    // -- server name ------------------------------------------------------------------
    tmpStr = this.uiEditServerName.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = "/hname=" + tmpStr;
    }

    // -- password ---------------------------------------------------------------------
    tmpStr = this.uiEditPassword.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/psw=" + tmpStr;
    }

    // -- max players ------------------------------------------------------------------
    tmpStr = this.uiSpinMaxPlayers.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/maxplayers=" + tmpStr;
    }
    // -- public server ----------------------------------------------------------------

    if (this.online === true) {
      cmdstr = cmdstr + "/public=1";
    }

    tmpStr = this.uiSpinMaxPing.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/maxping=" + tmpStr;
    }

    // -- spectator --------------------------------------------------------------------
    if (this.uiCheckSpectator.GetCheck()) {
      tmpStr = this.uiSpinSpectator.GetText();
      if (string.len(tmpStr) > 0) {
        cmdstr = cmdstr + "/spectr=" + tmpStr;
      }
    }

    // -- spectator options --
    let tmpNum: number = 0;

    if (this.uiCheckSpecFreefly.GetCheck()) {
      tmpNum = tmpNum + 1;
    }

    if (this.uiCheckSpecFirsteye.GetCheck()) {
      tmpNum = tmpNum + 2;
    }

    if (this.uiCheckSpecLookat.GetCheck()) {
      tmpNum = tmpNum + 4;
    }

    if (this.uiCheckSpecFreelook.GetCheck()) {
      tmpNum = tmpNum + 8;
    }

    if (this.uiCheckSpecTeamonly.GetCheck()) {
      tmpNum = tmpNum + 16;
    }

    cmdstr = cmdstr + "/spectrmds=" + tmpNum;

    // -- allow voting ------------------------------------------------------------------
    const tmpBool: boolean = this.uiCheckAllowVoting.GetCheck();

    if (tmpBool === true) {
      cmdstr = cmdstr + "/vote=1";
    }

    // -- damage block ------------------------------------------------------------------
    tmpStr = this.uiSpinDamageBlock.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/dmgblock=" + tmpStr;
    }

    if (this.uiCheckDamageBlock.GetCheck()) {
      cmdstr = cmdstr + "/dmbi=1";
    }

    // -- frag limit ---------------------------------------------------------------------
    tmpStr = this.uiSpinFragLimit.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/fraglimit=" + tmpStr;
    }

    // -- time limit ---------------------------------------------------------------------
    tmpStr = this.uiSpinTimeLimit.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/timelimit=" + tmpStr;
    }

    // -- friendly fire ------------------------------------------------------------------
    tmpStr = this.uiSpinFriendlyFire.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/ffire=" + tmpStr;
    }

    // -- auto team balance --------------------------------------------------------------
    if (this.uiCheckAutoTeamBalance.GetCheck()) {
      cmdstr = cmdstr + "/abalance=1";
    }

    // -- auto team swap --------------------------------------------------------------
    if (this.uiCheckAutoTeamSwap.GetCheck()) {
      cmdstr = cmdstr + "/aswap=1";
    }

    // -- Force respawn --------------------------------------------------------------
    if (this.uiTabRespawn.GetActiveId() === "reinforcement") {
      tmpStr = this.uiSpinForceRespawn.GetText();
      if (string.len(tmpStr) > 0) {
        cmdstr = cmdstr + "/frcrspwn=" + tmpStr;
      }
    }

    // todo: Unepxeted condition? -- ARTEFACTHUNT only ----------------------------------------------
    if ((GAME_TYPE.GAME_UNKNOWN as number) !== 0) {
      if (this.uiMapList.GetCurGameType() === GAME_TYPE.eGameIDArtefactHunt) {
        // -- number of artefacts ---------------------------------------------------------
        tmpStr = this.uiSpinArtefactsNum.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/anum=" + tmpStr;
        }

        // -- aretefact delay --------------------------------------------------------------
        tmpStr = this.uiSpinArtefactDelay.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/ardelta=" + tmpStr;
        }

        // -- artefact stay ----------------------------------------------------------------
        tmpStr = this.uiSpinArtefactStay.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/astime=" + tmpStr;
        }

        if (this.uiTabRespawn.GetActiveId() === "artefactcapture") {
          // -- artefact capture selected
          cmdstr = cmdstr + "/reinf=-1";
        } else {
          tmpStr = this.uiSpinReinforcement.GetText();
          if (string.len(tmpStr) > 0) {
            cmdstr = cmdstr + "/reinf=" + tmpStr;
          }
        }
      }

      // -- CAPTURETHEARTEFACT only ----------------------------------------------
      if (this.uiMapList.GetCurGameType() === GAME_TYPE.eGameIDCaptureTheArtefact) {
        // -- number of artefacts ---------------------------------------------------------
        tmpStr = this.uiSpinArtefactsNum.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/anum=" + tmpStr;
        }

        tmpStr = this.uiSpinReinforcement.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/reinf=" + tmpStr;
        }

        tmpStr = this.uiSpinArtreturnTime.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/artrettime=" + tmpStr;
        }

        if (this.uiCheckActivatedReturn.GetCheck()) {
          cmdstr = cmdstr + "/actret=1";
        }
      }
    } else if ((GAME_TYPE.GAME_UNKNOWN as number) === 0) {
      if (this.uiMapList.GetCurGameType() === GAME_TYPE.GAME_ARTEFACTHUNT) {
        // -- number of artefacts ---------------------------------------------------------
        tmpStr = this.uiSpinArtefactsNum.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/anum=" + tmpStr;
        }

        // -- aretefact delay --------------------------------------------------------------
        tmpStr = this.uiSpinArtefactDelay.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/ardelta=" + tmpStr;
        }

        // -- artefact stay ----------------------------------------------------------------
        tmpStr = this.uiSpinArtefactStay.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/astime=" + tmpStr;
        }

        if (this.uiTabRespawn.GetActiveId() === "artefactcapture") {
          // -- artefact capture selected
          cmdstr = cmdstr + "/reinf=-1";
        } else {
          tmpStr = this.uiSpinReinforcement.GetText();
          if (string.len(tmpStr) > 0) {
            cmdstr = cmdstr + "/reinf=" + tmpStr;
          }
        }
      }
    }

    // -- friendly indicators --------------------------------------------------------------
    if (this.uiCheckFriendlyIndicators.GetCheck()) {
      cmdstr = cmdstr + "/fi=1" + tmpStr;
    }

    // -- friendly indicators --------------------------------------------------------------
    if (this.uiCheckFriendlyNames.GetCheck()) {
      cmdstr = cmdstr + "/fn=1" + tmpStr;
    }

    // -- anomaly time ---------------------------------------------------------------------
    if (this.uiCheckNoAnmalies.GetCheck() === false) {
      tmpStr = this.uiSpinAnomalyTime.GetText();
      if (string.len(tmpStr) > 0) {
        cmdstr = cmdstr + "/ans=1/anslen=" + tmpStr;
      }
    } else {
      cmdstr = cmdstr + "/ans=0";
    }

    // -- pda hunt -------------------------------------------------------------------------
    if (this.uiCheckDdaHunt.GetCheck()) {
      cmdstr = cmdstr + "/pdahunt=1";
    }

    // -- warm up time ---------------------------------------------------------------------
    tmpStr = this.uiSpinWarmUpTime.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/warmup=" + tmpStr;
    }

    // -- rate of weather change -----------------------------------------------------------
    tmpStr = this.uiSpinRateOfChange.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/etimef=" + tmpStr;
    }

    this.uiMapList.SetServerParams(cmdstr);
  }

  public GoToProfileTab(): void {
    logger.info("Go to profile tab");
    this.tab.SetActiveTab("profile");
  }

  public OnConnectError(code: number, description: string): void {
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

  public onDownloadCancelButtonClicked(): void {
    logger.info("Cancel download");

    main_menu.get_main_menu().CancelDownload();
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

  public override Update(): void {
    super.Update();

    const patchDownload: PatchDownloadProgress = main_menu.get_main_menu().GetPatchProgress();

    if (patchDownload.GetInProgress()) {
      this.uiTextDownload.Show(true);
      this.uiCapDownload.Show(true);
      this.uiDownloadProgress.Show(true);

      const _progr: number = patchDownload.GetProgress();

      this.uiDownloadProgress.SetProgressPos(_progr);

      const str: string = string.format("%.0f%%(%s)", _progr, patchDownload.GetFlieName());

      this.uiTextDownload.TextControl().SetText(str);
      this.uiCancelDownloadButton.Show(true);
    } else {
      this.uiTextDownload.Show(false);
      this.uiCapDownload.Show(false);
      this.uiDownloadProgress.Show(false);
      this.uiCancelDownloadButton.Show(false);
    }
  }
}
