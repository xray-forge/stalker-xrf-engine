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
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { Optional, PatchDownloadProgress, Profile, TKeyCode, TPath, TUIEvent } from "@/engine/lib/types";

const baseOnline: TPath = "menu\\multiplayer\\MultiplayerOnline.component";
const baseOffline: TPath = "menu\\multiplayer\\MultiplayerOffline.component";
const logger: LuaLogger = new LuaLogger($filename);

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

  public serverList!: CServerList;
  public mapList!: CUIMapList;
  public directIPButton!: CUI3tButton;
  public filters!: Record<string, CUICheckButton>;
  public spinMaxPing!: CUISpinText;
  public spinSpectator!: CUISpinNum;
  public checkDedicated!: CUICheckButton;
  public checkDemosave!: CUICheckButton;
  public checkSpectator!: CUICheckButton;
  public checkSpecFreefly!: CUICheckButton;
  public checkSpecFirsteye!: CUICheckButton;
  public checkSpecLookat!: CUICheckButton;
  public checkSpecFreelook!: CUICheckButton;
  public checkSpecTeamonly!: CUICheckButton;
  public checkAllowVoting!: CUICheckButton;
  public checkAutoTeamBalance!: CUICheckButton;
  public checkAutoTeamSwap!: CUICheckButton;
  public checkDamageBlock!: CUICheckButton;
  public checkFriendlyIndicators!: CUICheckButton;
  public checkFriendlyNames!: CUICheckButton;
  public checkNoAnmalies!: CUICheckButton;
  public checkDdaHunt!: CUICheckButton;
  public checkActivatedReturn!: CUICheckButton;
  public spinArtreturnTime!: CUISpinNum;
  public spinAnomalyTime!: CUISpinNum;
  public spinWarmUpTime!: CUISpinNum;
  public spinRateOfChange!: CUISpinFlt;
  public spinDamageBlock!: CUISpinNum;
  public spinFragLimit!: CUISpinNum;
  public spinTimeLimit!: CUISpinNum;
  public spinFriendlyFire!: CUISpinFlt;
  public spinForceRespawn!: CUISpinNum;
  public spinMaxPlayers!: CUISpinNum;
  public spinArtefactsNum!: CUISpinNum;
  public spinArtefactDelay!: CUISpinNum;
  public spinArtefactStay!: CUISpinNum;
  public spinReinforcement!: CUISpinNum;
  public spinMode!: CUISpinText;
  public spinWeather!: CUIComboBox;
  public tabRespawn!: CUITabControl;
  public editServerName!: CUIEditBoxEx;
  public editPassword!: CUIEditBox;
  public capDownload!: CUIStatic;
  public textDownload!: CUIStatic;
  public downloadProgress!: CUIProgressBar;
  public cancelDownloadButton!: CUI3tButton;
  public createButton!: CUI3tButton;
  public playDemoButton!: CUI3tButton;
  public joinButton!: CUI3tButton;

  public constructor(owner: MainMenu, isOnlineMode: boolean) {
    super();

    this.owner = owner;
    this.online = isOnlineMode;

    this.InitControls();
    this.InitCallBacks();

    this.tab.SetActiveTab("client");
  }

  public InitControls(): void {
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

    let btn = xml.Init3tButton("btn_create", workArea);

    this.Register(btn, "btn_create");
    this.createButton = btn;
    btn.Enable(false);

    btn = xml.Init3tButton("btn_play_demo", workArea);
    this.Register(btn, "btn_play_demo");
    this.playDemoButton = btn;
    btn.Enable(false);

    btn = xml.Init3tButton("btn_join", workArea);
    this.Register(btn, "btn_join");
    this.joinButton = btn;

    btn = xml.Init3tButton("btn_cancel", workArea);
    this.Register(btn, "btn_cancel");

    this.tab = xml.InitTab("tab", workArea);
    this.Register(this.tab, "tab");

    this.messageBox = new CUIMessageBoxEx();
    this.Register(this.messageBox, "msg_box");

    this.capDownload = xml.InitStatic("download_static", workArea);
    this.textDownload = xml.InitStatic("download_text", workArea);
    this.downloadProgress = xml.InitProgressBar("progress_download", workArea);
    this.cancelDownloadButton = xml.Init3tButton("btn_cancel_download", workArea);
    this.Register(this.cancelDownloadButton, "btn_cancel_download");

    const version: CUIStatic = xml.InitStatic("static_version", this);
    const mm: CMainMenu = main_menu.get_main_menu();

    version.TextControl().SetText(string.format(gameConfig.VERSION, mm.GetGSVer()));

    if (this.online) {
      this.cdkey.SetText(mm.GetCDKey());
    } else {
      this.playerNameEditBox.SetText(mm.GetPlayerName());
    }

    this.serverList.SetConnectionErrCb(
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

    this.mapList.ClearList();
    this.mapList.OnModeChange();
    this.dialogMultiplayerOptions.SetGameMode(this.mapList.GetCurGameType(), this);

    if (this.online) {
      this.dialogMultiplayerProfile.updateControls();
    }

    const mm = main_menu.get_main_menu();

    if (this.online) {
      this.cdkey.SetText(mm.GetCDKey());
    } else {
      this.playerNameEditBox.SetText(mm.GetPlayerName());
    }

    this.onGameModeChange();

    if (level.present()) {
      this.createButton.Enable(false);
      this.joinButton.Enable(false);
      this.directIPButton.Enable(false);
      this.tab.Enable(false);
      this.cdkey.Enable(false);
      // --        this.player_name.Enable    (false)
    }
  }

  public InitCallBacks(): void {
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

    this.serverList.ShowServerInfo();
  }

  public onGameModeChange(): void {
    logger.info("Game mode change");

    this.mapList.OnModeChange();
    this.dialogMultiplayerOptions.SetGameMode(this.mapList.GetCurGameType(), this);
  }

  public onFilterChange(): void {
    logger.info("Filter change");

    const sf: SServerFilters = new SServerFilters();

    sf.empty = this.filters.btn_check_empty.GetCheck();
    sf.full = this.filters.btn_check_full.GetCheck();
    sf.with_pass = this.filters.btn_check_with_pass.GetCheck();
    sf.without_pass = this.filters.btn_check_without_pass.GetCheck();
    sf.without_ff = this.filters.btn_check_without_ff.GetCheck();
    sf.listen_servers = this.filters.btn_check_listen_servers.GetCheck();

    this.serverList.SetFilters(sf);
  }

  public onDemoSaveChange(): void {
    logger.info("Demo save change");

    executeConsoleCommand(consoleCommands.cl_mpdemosave, this.checkDemosave.GetCheck() ? 1 : 0);
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

    this.joinButton.Show(false);
    this.createButton.Show(false);
    this.playDemoButton.Show(false);

    const id = this.tab.GetActiveId();

    if (id === "client") {
      this.dialogMultiplayerJoin.Show(true);
      this.joinButton.Show(true);
    } else if (id === "options") {
      this.dialogMultiplayerOptions.Show(true);
      this.createButton.Show(true);
    } else if (id === "server") {
      this.mapList.LoadMapList();
      this.mapList.OnModeChange();
      this.dialogMultiplayerServer.Show(true);
      this.createButton.Show(true);
    } else if (id === "demo") {
      this.dialogMultiplayerDemo.fillList();
      this.dialogMultiplayerDemo.Show(true);
      this.playDemoButton.Show(true);
    } else if (id === "profile") {
      this.dialogMultiplayerProfile.Show(true);
      this.dialogMultiplayerProfile.editUniqueNick.SetText(this.owner.xrGameSpyProfile!.unique_nick());
    }
  }

  public onRadioNetChanged(): void {
    logger.info("Radio net checked");

    this.serverList.NetRadioChanged(!this.online);
    this.serverList.RefreshList(!this.online);
    this.onFilterChange();
  }

  public onRefreshButtonClicked(): void {
    logger.info("Button refresh");

    this.serverList.RefreshList(!this.online);
    this.onFilterChange();
  }

  public onQuickRefreshButtonClicked(): void {
    logger.info("Button quick refresh");
    this.serverList.RefreshQuick();
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

    if (this.mapList.IsEmpty()) {
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
    this.mapList.SaveMapList();
    this.GatherServerData();
    if (this.checkDedicated.GetCheck()) {
      this.mapList.StartDedicatedServer();
    } else {
      executeConsoleCommand(consoleCommands.main_menu, "off");
      executeConsoleCommand(this.mapList.GetCommandLine(this.owner.xrGameSpyProfile!.unique_nick()));
    }
  }

  public GatherServerData(): void {
    logger.info("Gather server data");

    let cmdstr = "";
    let tmpStr: string;

    // -- server name ------------------------------------------------------------------
    tmpStr = this.editServerName.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = "/hname=" + tmpStr;
    }

    // -- password ---------------------------------------------------------------------
    tmpStr = this.editPassword.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/psw=" + tmpStr;
    }

    // -- max players ------------------------------------------------------------------
    tmpStr = this.spinMaxPlayers.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/maxplayers=" + tmpStr;
    }
    // -- public server ----------------------------------------------------------------

    if (this.online === true) {
      cmdstr = cmdstr + "/public=1";
    }

    tmpStr = this.spinMaxPing.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/maxping=" + tmpStr;
    }

    // -- spectator --------------------------------------------------------------------
    if (this.checkSpectator.GetCheck()) {
      tmpStr = this.spinSpectator.GetText();
      if (string.len(tmpStr) > 0) {
        cmdstr = cmdstr + "/spectr=" + tmpStr;
      }
    }

    // -- spectator options --
    let tmpNum = 0;

    if (this.checkSpecFreefly.GetCheck()) {
      tmpNum = tmpNum + 1;
    }

    if (this.checkSpecFirsteye.GetCheck()) {
      tmpNum = tmpNum + 2;
    }

    if (this.checkSpecLookat.GetCheck()) {
      tmpNum = tmpNum + 4;
    }

    if (this.checkSpecFreelook.GetCheck()) {
      tmpNum = tmpNum + 8;
    }

    if (this.checkSpecTeamonly.GetCheck()) {
      tmpNum = tmpNum + 16;
    }

    cmdstr = cmdstr + "/spectrmds=" + tmpNum;

    // -- allow voting ------------------------------------------------------------------
    const tmpBool: boolean = this.checkAllowVoting.GetCheck();

    if (tmpBool === true) {
      cmdstr = cmdstr + "/vote=1";
    }

    // -- damage block ------------------------------------------------------------------
    tmpStr = this.spinDamageBlock.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/dmgblock=" + tmpStr;
    }

    if (this.checkDamageBlock.GetCheck()) {
      cmdstr = cmdstr + "/dmbi=1";
    }

    // -- frag limit ---------------------------------------------------------------------
    tmpStr = this.spinFragLimit.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/fraglimit=" + tmpStr;
    }

    // -- time limit ---------------------------------------------------------------------
    tmpStr = this.spinTimeLimit.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/timelimit=" + tmpStr;
    }

    // -- friendly fire ------------------------------------------------------------------
    tmpStr = this.spinFriendlyFire.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/ffire=" + tmpStr;
    }

    // -- auto team balance --------------------------------------------------------------
    if (this.checkAutoTeamBalance.GetCheck()) {
      cmdstr = cmdstr + "/abalance=1";
    }

    // -- auto team swap --------------------------------------------------------------
    if (this.checkAutoTeamSwap.GetCheck()) {
      cmdstr = cmdstr + "/aswap=1";
    }

    // -- Force respawn --------------------------------------------------------------
    if (this.tabRespawn.GetActiveId() === "reinforcement") {
      tmpStr = this.spinForceRespawn.GetText();
      if (string.len(tmpStr) > 0) {
        cmdstr = cmdstr + "/frcrspwn=" + tmpStr;
      }
    }

    // todo: Unepxeted condition? -- ARTEFACTHUNT only ----------------------------------------------
    if ((GAME_TYPE.GAME_UNKNOWN as number) !== 0) {
      if (this.mapList.GetCurGameType() === GAME_TYPE.eGameIDArtefactHunt) {
        // -- number of artefacts ---------------------------------------------------------
        tmpStr = this.spinArtefactsNum.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/anum=" + tmpStr;
        }

        // -- aretefact delay --------------------------------------------------------------
        tmpStr = this.spinArtefactDelay.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/ardelta=" + tmpStr;
        }

        // -- artefact stay ----------------------------------------------------------------
        tmpStr = this.spinArtefactStay.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/astime=" + tmpStr;
        }

        if (this.tabRespawn.GetActiveId() === "artefactcapture") {
          // -- artefact capture selected
          cmdstr = cmdstr + "/reinf=-1";
        } else {
          tmpStr = this.spinReinforcement.GetText();
          if (string.len(tmpStr) > 0) {
            cmdstr = cmdstr + "/reinf=" + tmpStr;
          }
        }
      }

      // -- CAPTURETHEARTEFACT only ----------------------------------------------
      if (this.mapList.GetCurGameType() === GAME_TYPE.eGameIDCaptureTheArtefact) {
        // -- number of artefacts ---------------------------------------------------------
        tmpStr = this.spinArtefactsNum.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/anum=" + tmpStr;
        }

        tmpStr = this.spinReinforcement.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/reinf=" + tmpStr;
        }

        tmpStr = this.spinArtreturnTime.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/artrettime=" + tmpStr;
        }

        if (this.checkActivatedReturn.GetCheck()) {
          cmdstr = cmdstr + "/actret=1";
        }
      }
    } else if ((GAME_TYPE.GAME_UNKNOWN as number) === 0) {
      if (this.mapList.GetCurGameType() === GAME_TYPE.GAME_ARTEFACTHUNT) {
        // -- number of artefacts ---------------------------------------------------------
        tmpStr = this.spinArtefactsNum.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/anum=" + tmpStr;
        }

        // -- aretefact delay --------------------------------------------------------------
        tmpStr = this.spinArtefactDelay.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/ardelta=" + tmpStr;
        }

        // -- artefact stay ----------------------------------------------------------------
        tmpStr = this.spinArtefactStay.GetText();
        if (string.len(tmpStr) > 0) {
          cmdstr = cmdstr + "/astime=" + tmpStr;
        }

        if (this.tabRespawn.GetActiveId() === "artefactcapture") {
          // -- artefact capture selected
          cmdstr = cmdstr + "/reinf=-1";
        } else {
          tmpStr = this.spinReinforcement.GetText();
          if (string.len(tmpStr) > 0) {
            cmdstr = cmdstr + "/reinf=" + tmpStr;
          }
        }
      }
    }

    // -- friendly indicators --------------------------------------------------------------
    if (this.checkFriendlyIndicators.GetCheck()) {
      cmdstr = cmdstr + "/fi=1" + tmpStr;
    }

    // -- friendly indicators --------------------------------------------------------------
    if (this.checkFriendlyNames.GetCheck()) {
      cmdstr = cmdstr + "/fn=1" + tmpStr;
    }

    // -- anomaly time ---------------------------------------------------------------------
    if (this.checkNoAnmalies.GetCheck() === false) {
      tmpStr = this.spinAnomalyTime.GetText();
      if (string.len(tmpStr) > 0) {
        cmdstr = cmdstr + "/ans=1/anslen=" + tmpStr;
      }
    } else {
      cmdstr = cmdstr + "/ans=0";
    }

    // -- pda hunt -------------------------------------------------------------------------
    if (this.checkDdaHunt.GetCheck()) {
      cmdstr = cmdstr + "/pdahunt=1";
    }

    // -- warm up time ---------------------------------------------------------------------
    tmpStr = this.spinWarmUpTime.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/warmup=" + tmpStr;
    }

    // -- rate of weather change -----------------------------------------------------------
    tmpStr = this.spinRateOfChange.GetText();
    if (string.len(tmpStr) > 0) {
      cmdstr = cmdstr + "/etimef=" + tmpStr;
    }

    this.mapList.SetServerParams(cmdstr);
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

    this.serverList.SetPlayerName(this.owner.xrGameSpyProfile!.unique_nick()); // --this.player_name.GetText())
    this.serverList.ConnectToSelected();
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
      this.textDownload.Show(true);
      this.capDownload.Show(true);
      this.downloadProgress.Show(true);

      const _progr: number = patchDownload.GetProgress();

      this.downloadProgress.SetProgressPos(_progr);

      const str: string = string.format("%.0f%%(%s)", _progr, patchDownload.GetFlieName());

      this.textDownload.TextControl().SetText(str);
      this.cancelDownloadButton.Show(true);
    } else {
      this.textDownload.Show(false);
      this.capDownload.Show(false);
      this.downloadProgress.Show(false);
      this.cancelDownloadButton.Show(false);
    }
  }
}
