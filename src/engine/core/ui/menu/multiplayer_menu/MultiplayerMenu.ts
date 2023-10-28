import {
  CMainMenu,
  connect_error_cb,
  COptionsManager,
  CScriptXmlInit,
  CUI3tButton,
  CUIEditBox,
  CUIMessageBoxEx,
  CUIScriptWnd,
  CUIStatic,
  CUITabControl,
  CUIWindow,
  DIK_keys,
  game,
  GAME_TYPE,
  level,
  login_operation_cb,
  LuabindClass,
  main_menu,
  ui_events,
} from "xray16";

import { MainMenu } from "@/engine/core/ui/menu/MainMenu";
import { EMultiplayerMenuTab } from "@/engine/core/ui/menu/multiplayer_menu/multiplayer_menu_types";
import { MultiplayerDemo } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerDemo";
import { MultiplayerJoin } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerJoin";
import { MultiplayerOptions } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerOptions";
import { MultiplayerProfile } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerProfile";
import { MultiplayerServer } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerServer";
import { EOptionGroup } from "@/engine/core/ui/menu/options/options_types";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { createScreenRectangle } from "@/engine/core/utils/rectangle";
import { EElementType, initializeElement, initializeStatics, resolveXmlFile } from "@/engine/core/utils/ui";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { Optional, Profile, TKeyCode, TLabel, TPath, TUIEvent } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const baseOnline: TPath = "menu\\multiplayer\\MultiplayerOnline.component";
const baseOffline: TPath = "menu\\multiplayer\\MultiplayerOffline.component";

/**
 * Multiplayer menu after login.
 * Search of servers / configuration of custom server / profile and demo playback.
 */
@LuabindClass()
export class MultiplayerMenu extends CUIScriptWnd {
  public owner: MainMenu;
  public xml: CScriptXmlInit;
  public isOnlineMode: boolean;

  public uiTab!: CUITabControl;

  public uiDialogMultiplayerJoin!: MultiplayerJoin;
  public uiDialogMultiplayerServer!: MultiplayerServer;
  public uiDialogMultiplayerDemo!: MultiplayerDemo;
  public uiDialogMultiplayerProfile!: MultiplayerProfile;
  public uiDialogMultiplayerOptions!: MultiplayerOptions;

  public uiMessageBox!: CUIMessageBoxEx;
  public uiCdkey!: CUIEditBox;
  public uiPlayerNameEditBox!: CUIEditBox;
  public uiCreateButton!: CUI3tButton;
  public uiPlayDemoButton!: CUI3tButton;
  public uiJoinButton!: CUI3tButton;

  public constructor(owner: MainMenu, isOnlineMode: boolean) {
    super();

    this.owner = owner;
    this.xml = resolveXmlFile(isOnlineMode ? baseOnline : baseOffline);
    this.isOnlineMode = isOnlineMode;

    this.initialize(owner, this.xml);
  }

  public initialize(owner: MainMenu, xml: CScriptXmlInit): void {
    this.SetWndRect(createScreenRectangle());
    this.Enable(true);

    initializeStatics(xml, this, "background");

    const workArea: CUIWindow = initializeElement(xml, EElementType.WINDOW, "wrk_area", this);

    workArea.SetAutoDelete(true);

    this.AttachChild(workArea);

    if (this.isOnlineMode) {
      initializeElement(xml, EElementType.MP_PLAYER_NAME, "edit_player_name", workArea);
      initializeStatics(xml, workArea, "cap_cd_key");

      this.uiCdkey = initializeElement(xml, EElementType.CD_KEY, "edit_cd_key", workArea, {
        context: this,
        [ui_events.EDIT_TEXT_COMMIT]: () => this.onCDKeyChanged(),
      });
    } else {
      initializeStatics(xml, workArea, "cap_unique_nick");

      this.uiPlayerNameEditBox = initializeElement(xml, EElementType.EDIT_BOX, "edit_player_name", workArea, {
        context: this,
        [ui_events.EDIT_TEXT_COMMIT]: () => this.onPlayerNameChanged(),
      });
    }

    xml.InitStatic("cap_mode", workArea);

    this.uiDialogMultiplayerJoin = new MultiplayerJoin(this, xml, this.isOnlineMode);
    workArea.AttachChild(this.uiDialogMultiplayerJoin);

    this.uiDialogMultiplayerOptions = new MultiplayerOptions(this, xml, this.isOnlineMode);
    this.uiDialogMultiplayerOptions.Show(false);
    workArea.AttachChild(this.uiDialogMultiplayerOptions);

    this.uiDialogMultiplayerServer = new MultiplayerServer(this, xml);
    this.uiDialogMultiplayerServer.Show(false);
    workArea.AttachChild(this.uiDialogMultiplayerServer);

    this.uiDialogMultiplayerDemo = new MultiplayerDemo(this, xml);
    this.uiDialogMultiplayerDemo.Show(false);
    workArea.AttachChild(this.uiDialogMultiplayerDemo);

    if (this.isOnlineMode) {
      this.uiDialogMultiplayerProfile = new MultiplayerProfile(this, xml);
      this.uiDialogMultiplayerProfile.Show(false);
      workArea.AttachChild(this.uiDialogMultiplayerProfile);
    }

    this.uiCreateButton = initializeElement(xml, EElementType.BUTTON, "btn_create", workArea, {
      context: this,
      [ui_events.BUTTON_CLICKED]: () => this.onCreateButtonClicked(),
    });
    this.uiCreateButton.Enable(false);

    this.uiPlayDemoButton = initializeElement(xml, EElementType.BUTTON, "btn_play_demo", workArea, {
      context: this,
      [ui_events.BUTTON_CLICKED]: () => this.uiDialogMultiplayerDemo.playSelectedDemo(),
    });
    this.uiPlayDemoButton.Enable(false);

    this.uiJoinButton = initializeElement(xml, EElementType.BUTTON, "btn_join", workArea, {
      context: this,
      [ui_events.BUTTON_CLICKED]: () => this.onJoinButtonClicked(),
    });

    initializeElement(xml, EElementType.BUTTON, "btn_cancel", workArea, {
      context: this,
      [ui_events.BUTTON_CLICKED]: () => this.onCancelButtonClicked(),
    });

    this.uiTab = initializeElement(xml, EElementType.TAB, "tab", workArea, {
      context: this,
      [ui_events.TAB_CHANGED]: () => this.onTabChange(),
    });
    this.uiTab.SetActiveTab(EMultiplayerMenuTab.CLIENT);

    this.uiMessageBox = initializeElement(xml, EElementType.MESSAGE_BOX_EX, "msg_box", this, {
      [ui_events.MESSAGE_BOX_YES_CLICKED]: () => this.onDirectIPConfirmationClicked(),
    });

    const version: CUIStatic = xml.InitStatic("static_version", this);
    const mainMenu: CMainMenu = main_menu.get_main_menu();

    version.TextControl().SetText(string.format(forgeConfig.VERSION, mainMenu.GetGSVer()));

    if (this.isOnlineMode) {
      this.uiCdkey.SetText(mainMenu.GetCDKey());
    } else {
      this.uiPlayerNameEditBox.SetText(mainMenu.GetPlayerName());
    }

    this.uiDialogMultiplayerJoin.uiServerList.SetConnectionErrCb(
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

    this.uiDialogMultiplayerServer.uiMapList.ClearList();
    this.uiDialogMultiplayerServer.uiMapList.OnModeChange();
    this.uiDialogMultiplayerOptions.setGameMode(this.uiDialogMultiplayerServer.uiMapList.GetCurGameType());

    const mainMenu: CMainMenu = main_menu.get_main_menu();

    if (this.isOnlineMode) {
      this.uiCdkey.SetText(mainMenu.GetCDKey());
    } else {
      this.uiPlayerNameEditBox.SetText(mainMenu.GetPlayerName());
    }

    this.uiDialogMultiplayerServer.onGameModeChange();

    if (level.present()) {
      this.uiCreateButton.Enable(false);
      this.uiJoinButton.Enable(false);
      this.uiDialogMultiplayerJoin.uiJoinDirectIPButton.Enable(false);
      this.uiTab.Enable(false);
      this.uiCdkey.Enable(false);
    }
  }

  public onDirectIPConfirmationClicked(): void {
    logger.info("On direct API confirmed");

    if (string.len(this.uiMessageBox.GetHost()) !== 0) {
      executeConsoleCommand(
        consoleCommands.start,
        "client(" +
          this.uiMessageBox.GetHost() +
          "/name=" +
          this.owner.xrGameSpyProfile!.unique_nick() +
          "/psw=" +
          this.uiMessageBox.GetPassword() +
          ")"
      );
    }
  }

  public onCDKeyChanged(): void {
    const cdKey: string = this.uiCdkey.GetText();

    executeConsoleCommand(consoleCommands.cdkey, cdKey === "" ? "clear" : cdKey);
  }

  public onPlayerNameChanged(): void {
    logger.info("Player name changed");

    let tempPlayerName: TLabel = this.uiPlayerNameEditBox.GetText();

    if (tempPlayerName === "") {
      tempPlayerName = "noname";
      this.uiMessageBox.InitMessageBox("message_box_error");
      this.uiMessageBox.SetText("mp_nick_name_not_valid");
      this.uiMessageBox.ShowDialog(true);
    }

    this.owner.xrLoginManager.set_unique_nick(
      tempPlayerName,
      new login_operation_cb(this, (code, description) => this.onChangeNickOperationResult(code, description))
    );
  }

  public onChangeNickOperationResult(error: unknown, description: string): void {
    // Nothing.
  }

  public onFilterChange(): void {
    logger.info("Filters change");

    this.uiDialogMultiplayerJoin.uiServerList.SetFilters(this.uiDialogMultiplayerJoin.getFilters());
  }

  public onRadioNetChanged(): void {
    this.uiDialogMultiplayerJoin.uiServerList.NetRadioChanged(!this.isOnlineMode);
    this.uiDialogMultiplayerJoin.uiServerList.RefreshList(!this.isOnlineMode);
    this.onFilterChange();
  }

  public onCancelButtonClicked(): void {
    const optionsManager: COptionsManager = new COptionsManager();

    optionsManager.UndoGroup("mm_mp_client");
    optionsManager.UndoGroup("mm_mp_server");
    optionsManager.UndoGroup("mm_mp_srv_filter");

    this.HideDialog();
    this.owner.ShowDialog(true);
    this.owner.Show(true);
  }

  public onJoinButtonClicked(): void {
    logger.info("Join server from list");

    const optionsManager: COptionsManager = new COptionsManager();

    optionsManager.SaveValues(EOptionGroup.MULTIPLAYER_CLIENT);
    optionsManager.SaveValues(EOptionGroup.MULTIPLAYER_SERVER);
    optionsManager.SaveValues(EOptionGroup.MULTIPLAYER_SERVER_FILTER);

    this.uiDialogMultiplayerJoin.uiServerList.SetPlayerName(this.owner.xrGameSpyProfile!.unique_nick());
    this.uiDialogMultiplayerJoin.uiServerList.ConnectToSelected();
  }

  public onCreateButtonClicked(): void {
    logger.info("Create custom server");

    if (this.uiDialogMultiplayerServer.uiMapList.IsEmpty()) {
      this.uiMessageBox.InitMessageBox("select_map");
      this.uiMessageBox.ShowDialog(true);

      return;
    }

    const mainMenu: CMainMenu = main_menu.get_main_menu();
    const gsProfile: Optional<Profile> = this.owner.xrLoginManager.get_current_profile();

    if (gsProfile && gsProfile.online() && !mainMenu.ValidateCDKey()) {
      return;
    }

    const optionsManager: COptionsManager = new COptionsManager();

    optionsManager.SaveValues("mm_mp_server");
    optionsManager.SaveValues("mm_mp_client");
    optionsManager.SaveValues("mm_mp_srv_filter");

    this.uiDialogMultiplayerServer.uiMapList.SaveMapList();
    this.gatherServerData();

    if (this.uiDialogMultiplayerServer.uiDedicatedCheck.GetCheck()) {
      this.uiDialogMultiplayerServer.uiMapList.StartDedicatedServer();
    } else {
      executeConsoleCommand(consoleCommands.main_menu, "off");
      executeConsoleCommand(
        this.uiDialogMultiplayerServer.uiMapList.GetCommandLine(this.owner.xrGameSpyProfile!.unique_nick())
      );
    }
  }

  public getServerCreationParameters(): string {
    let commandString: TLabel = "";
    let tmpStr: string;

    // -- server name ------------------------------------------------------------------
    tmpStr = this.uiDialogMultiplayerServer.uiServerNameEdit.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = "/hname=" + tmpStr;
    }

    // -- password ---------------------------------------------------------------------
    tmpStr = this.uiDialogMultiplayerServer.uiPasswordEdit.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/psw=" + tmpStr;
    }

    // -- max players ------------------------------------------------------------------
    tmpStr = this.uiDialogMultiplayerServer.uiMaxPlayersSpin.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/maxplayers=" + tmpStr;
    }

    // -- public server ----------------------------------------------------------------
    if (this.isOnlineMode === true) {
      commandString = commandString + "/public=1";
    }

    tmpStr = this.uiDialogMultiplayerOptions.uiSpinMaxPing.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/maxping=" + tmpStr;
    }

    // -- spectator --------------------------------------------------------------------
    if (this.uiDialogMultiplayerOptions.uiCheckSpectator.GetCheck()) {
      tmpStr = this.uiDialogMultiplayerOptions.uiSpinSpectator.GetText();
      if (string.len(tmpStr) > 0) {
        commandString = commandString + "/spectr=" + tmpStr;
      }
    }

    // -- spectator options --
    let tmpNum: number = 0;

    if (this.uiDialogMultiplayerOptions.uiCheckSpecFreefly.GetCheck()) {
      tmpNum = tmpNum + 1;
    }

    if (this.uiDialogMultiplayerOptions.uiCheckSpecFirsteye.GetCheck()) {
      tmpNum = tmpNum + 2;
    }

    if (this.uiDialogMultiplayerOptions.uiCheckSpecLookat.GetCheck()) {
      tmpNum = tmpNum + 4;
    }

    if (this.uiDialogMultiplayerOptions.uiCheckSpecFreelook.GetCheck()) {
      tmpNum = tmpNum + 8;
    }

    if (this.uiDialogMultiplayerOptions.uiCheckSpecTeamonly.GetCheck()) {
      tmpNum = tmpNum + 16;
    }

    commandString = commandString + "/spectrmds=" + tmpNum;

    // -- allow voting ------------------------------------------------------------------
    const tmpBool: boolean = this.uiDialogMultiplayerOptions.uiCheckAllowVoting.GetCheck();

    if (tmpBool === true) {
      commandString = commandString + "/vote=1";
    }

    // -- damage block ------------------------------------------------------------------
    tmpStr = this.uiDialogMultiplayerOptions.uiSpinDamageBlock.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/dmgblock=" + tmpStr;
    }

    if (this.uiDialogMultiplayerOptions.uiCheckDamageBlock.GetCheck()) {
      commandString = commandString + "/dmbi=1";
    }

    // -- frag limit ---------------------------------------------------------------------
    tmpStr = this.uiDialogMultiplayerOptions.uiSpinFragLimit.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/fraglimit=" + tmpStr;
    }

    // -- time limit ---------------------------------------------------------------------
    tmpStr = this.uiDialogMultiplayerOptions.uiSpinTimeLimit.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/timelimit=" + tmpStr;
    }

    // -- friendly fire ------------------------------------------------------------------
    tmpStr = this.uiDialogMultiplayerOptions.uiSpinFriendlyFire.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/ffire=" + tmpStr;
    }

    // -- auto team balance --------------------------------------------------------------
    if (this.uiDialogMultiplayerOptions.uiCheckAutoTeamBalance.GetCheck()) {
      commandString = commandString + "/abalance=1";
    }

    // -- auto team swap --------------------------------------------------------------
    if (this.uiDialogMultiplayerOptions.uiCheckAutoTeamSwap.GetCheck()) {
      commandString = commandString + "/aswap=1";
    }

    // -- Force respawn --------------------------------------------------------------
    if (this.uiDialogMultiplayerOptions.uiTabRespawn.GetActiveId() === "reinforcement") {
      tmpStr = this.uiDialogMultiplayerOptions.uiSpinForceRespawn.GetText();
      if (string.len(tmpStr) > 0) {
        commandString = commandString + "/frcrspwn=" + tmpStr;
      }
    }

    // todo: Unepxeted condition? -- ARTEFACTHUNT only ----------------------------------------------
    if ((GAME_TYPE.GAME_UNKNOWN as number) !== 0) {
      if (this.uiDialogMultiplayerServer.uiMapList.GetCurGameType() === GAME_TYPE.eGameIDArtefactHunt) {
        // -- number of artefacts ---------------------------------------------------------
        tmpStr = this.uiDialogMultiplayerOptions.uiSpinArtefactsNum.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/anum=" + tmpStr;
        }

        // -- aretefact delay --------------------------------------------------------------
        tmpStr = this.uiDialogMultiplayerOptions.uiSpinArtefactDelay.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/ardelta=" + tmpStr;
        }

        // -- artefact stay ----------------------------------------------------------------
        tmpStr = this.uiDialogMultiplayerOptions.uiSpinArtefactStay.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/astime=" + tmpStr;
        }

        if (this.uiDialogMultiplayerOptions.uiTabRespawn.GetActiveId() === "artefactcapture") {
          // -- artefact capture selected
          commandString = commandString + "/reinf=-1";
        } else {
          tmpStr = this.uiDialogMultiplayerOptions.uiSpinReinforcement.GetText();
          if (string.len(tmpStr) > 0) {
            commandString = commandString + "/reinf=" + tmpStr;
          }
        }
      }

      // -- CAPTURETHEARTEFACT only ----------------------------------------------
      if (this.uiDialogMultiplayerServer.uiMapList.GetCurGameType() === GAME_TYPE.eGameIDCaptureTheArtefact) {
        // -- number of artefacts ---------------------------------------------------------
        tmpStr = this.uiDialogMultiplayerOptions.uiSpinArtefactsNum.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/anum=" + tmpStr;
        }

        tmpStr = this.uiDialogMultiplayerOptions.uiSpinReinforcement.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/reinf=" + tmpStr;
        }

        tmpStr = this.uiDialogMultiplayerOptions.uiSpinArtreturnTime.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/artrettime=" + tmpStr;
        }

        if (this.uiDialogMultiplayerOptions.uiCheckActivatedReturn.GetCheck()) {
          commandString = commandString + "/actret=1";
        }
      }
    } else if ((GAME_TYPE.GAME_UNKNOWN as number) === 0) {
      if (this.uiDialogMultiplayerServer.uiMapList.GetCurGameType() === GAME_TYPE.GAME_ARTEFACTHUNT) {
        // -- number of artefacts ---------------------------------------------------------
        tmpStr = this.uiDialogMultiplayerOptions.uiSpinArtefactsNum.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/anum=" + tmpStr;
        }

        // -- aretefact delay --------------------------------------------------------------
        tmpStr = this.uiDialogMultiplayerOptions.uiSpinArtefactDelay.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/ardelta=" + tmpStr;
        }

        // -- artefact stay ----------------------------------------------------------------
        tmpStr = this.uiDialogMultiplayerOptions.uiSpinArtefactStay.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/astime=" + tmpStr;
        }

        if (this.uiDialogMultiplayerOptions.uiTabRespawn.GetActiveId() === "artefactcapture") {
          // -- artefact capture selected
          commandString = commandString + "/reinf=-1";
        } else {
          tmpStr = this.uiDialogMultiplayerOptions.uiSpinReinforcement.GetText();
          if (string.len(tmpStr) > 0) {
            commandString = commandString + "/reinf=" + tmpStr;
          }
        }
      }
    }

    // -- friendly indicators --------------------------------------------------------------
    if (this.uiDialogMultiplayerOptions.uiCheckFriendlyIndicators.GetCheck()) {
      commandString = commandString + "/fi=1" + tmpStr;
    }

    // -- friendly indicators --------------------------------------------------------------
    if (this.uiDialogMultiplayerOptions.uiCheckFriendlyNames.GetCheck()) {
      commandString = commandString + "/fn=1" + tmpStr;
    }

    // -- anomaly time ---------------------------------------------------------------------
    if (this.uiDialogMultiplayerOptions.uiCheckNoAnmalies.GetCheck() === false) {
      tmpStr = this.uiDialogMultiplayerOptions.uiSpinAnomalyTime.GetText();
      if (string.len(tmpStr) > 0) {
        commandString = commandString + "/ans=1/anslen=" + tmpStr;
      }
    } else {
      commandString = commandString + "/ans=0";
    }

    // -- pda hunt -------------------------------------------------------------------------
    if (this.uiDialogMultiplayerOptions.uiCheckDdaHunt.GetCheck()) {
      commandString = commandString + "/pdahunt=1";
    }

    // -- warm up time ---------------------------------------------------------------------
    tmpStr = this.uiDialogMultiplayerOptions.uiSpinWarmUpTime.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/warmup=" + tmpStr;
    }

    // -- rate of weather change -----------------------------------------------------------
    tmpStr = this.uiDialogMultiplayerOptions.uiSpinRateOfChange.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/etimef=" + tmpStr;
    }

    return commandString;
  }

  public gatherServerData(): void {
    this.uiDialogMultiplayerServer.uiMapList.SetServerParams(this.getServerCreationParameters());
  }

  public onConnectError(code: number, description: TLabel): void {
    logger.info("Connection error:", code, description);

    this.uiMessageBox.InitMessageBox("message_box_error");

    if (description === "") {
      description = "mp_gp_connect_error";
    }

    this.uiTab.SetActiveTab(EMultiplayerMenuTab.PROFILE);
    this.uiMessageBox.SetText(game.translate_string(description));
    this.uiMessageBox.ShowDialog(true);
  }

  public onTabChange(): void {
    const id: EMultiplayerMenuTab = this.uiTab.GetActiveId() as EMultiplayerMenuTab;

    logger.info("Active multiplayer tab changed:", id);

    this.uiDialogMultiplayerJoin.Show(false);
    this.uiDialogMultiplayerOptions.Show(false);
    this.uiDialogMultiplayerServer.Show(false);
    this.uiDialogMultiplayerDemo.Show(false);

    if (this.isOnlineMode) {
      this.uiDialogMultiplayerProfile.Show(false);
    }

    this.uiJoinButton.Show(false);
    this.uiCreateButton.Show(false);
    this.uiPlayDemoButton.Show(false);

    switch (id) {
      case EMultiplayerMenuTab.CLIENT: {
        this.uiDialogMultiplayerJoin.Show(true);
        this.uiJoinButton.Show(true);
        break;
      }

      case EMultiplayerMenuTab.OPTIONS: {
        this.uiDialogMultiplayerOptions.Show(true);
        this.uiCreateButton.Show(true);
        break;
      }

      case EMultiplayerMenuTab.SERVER: {
        this.uiDialogMultiplayerServer.uiMapList.LoadMapList();
        this.uiDialogMultiplayerServer.uiMapList.OnModeChange();
        this.uiDialogMultiplayerServer.Show(true);
        this.uiCreateButton.Show(true);
        break;
      }

      case EMultiplayerMenuTab.DEMO: {
        this.uiDialogMultiplayerDemo.fillList();
        this.uiDialogMultiplayerDemo.Show(true);
        this.uiPlayDemoButton.Show(true);
        break;
      }

      case EMultiplayerMenuTab.PROFILE: {
        this.uiDialogMultiplayerProfile.Show(true);
        this.uiDialogMultiplayerProfile.uiUniqueNickEditBox.SetText(this.owner.xrGameSpyProfile!.unique_nick());
        break;
      }
    }
  }

  public override OnKeyboard(key: TKeyCode, action: TUIEvent): boolean {
    super.OnKeyboard(key, action);

    if (action === ui_events.WINDOW_KEY_PRESSED) {
      switch (key) {
        case DIK_keys.DIK_ESCAPE: {
          this.owner.ShowDialog(true);
          this.HideDialog();
          this.owner.Show(true);

          break;
        }
      }
    }

    return true;
  }
}
