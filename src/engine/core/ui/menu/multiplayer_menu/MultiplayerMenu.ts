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
import { EMultiplayerMenuTab } from "@/engine/core/ui/menu/multiplayer_menu/multiplayer_types";
import { MultiplayerDemo } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerDemo";
import { MultiplayerJoin } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerJoin";
import { MultiplayerOptions } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerOptions";
import { MultiplayerProfile } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerProfile";
import { MultiplayerServer } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerServer";
import { EOptionGroup } from "@/engine/core/ui/menu/options/options_types";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { createRectangle } from "@/engine/core/utils/rectangle";
import { EElementType, initializeElement, initializeStatics, resolveXmlFile } from "@/engine/core/utils/ui";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { screenConfig } from "@/engine/lib/configs/ScreenConfig";
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

  public tab!: CUITabControl;
  public messageBox!: CUIMessageBoxEx;
  public cdkey!: CUIEditBox;
  public playerNameEditBox!: CUIEditBox;

  public dialogMultiplayerJoin!: MultiplayerJoin;
  public dialogMultiplayerServer!: MultiplayerServer;
  public dialogMultiplayerDemo!: MultiplayerDemo;
  public dialogMultiplayerProfile!: MultiplayerProfile;
  public dialogMultiplayerOptions!: MultiplayerOptions;

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
    this.SetWndRect(createRectangle(0, 0, screenConfig.BASE_WIDTH, screenConfig.BASE_HEIGHT));
    this.Enable(true);

    xml.InitStatic("background", this);

    const workArea: CUIWindow = new CUIWindow();

    xml.InitWindow("wrk_area", 0, workArea);
    workArea.SetAutoDelete(true);
    this.AttachChild(workArea);

    if (this.isOnlineMode) {
      xml.InitMPPlayerName("edit_player_name", workArea);
      initializeStatics(xml, workArea, "cap_cd_key");

      this.cdkey = initializeElement(xml, "edit_cd_key", EElementType.CD_KEY, workArea, {
        context: this,
        [ui_events.EDIT_TEXT_COMMIT]: () => this.onCDKeyChanged(),
      });
    } else {
      initializeStatics(xml, workArea, "cap_unique_nick");

      this.playerNameEditBox = initializeElement(xml, "edit_player_name", EElementType.EDIT_BOX, workArea, {
        context: this,
        [ui_events.EDIT_TEXT_COMMIT]: () => this.onPlayerNameChanged(),
      });
    }

    xml.InitStatic("cap_mode", workArea);

    this.dialogMultiplayerJoin = new MultiplayerJoin(this, xml, this.isOnlineMode);
    workArea.AttachChild(this.dialogMultiplayerJoin);

    this.dialogMultiplayerOptions = new MultiplayerOptions(this, xml, this.isOnlineMode);
    this.dialogMultiplayerOptions.Show(false);
    workArea.AttachChild(this.dialogMultiplayerOptions);

    this.dialogMultiplayerServer = new MultiplayerServer(this, xml);
    this.dialogMultiplayerServer.Show(false);
    workArea.AttachChild(this.dialogMultiplayerServer);

    this.dialogMultiplayerDemo = new MultiplayerDemo(this, xml);
    this.dialogMultiplayerDemo.Show(false);
    workArea.AttachChild(this.dialogMultiplayerDemo);

    if (this.isOnlineMode) {
      this.dialogMultiplayerProfile = new MultiplayerProfile(this, xml);
      this.dialogMultiplayerProfile.Show(false);
      workArea.AttachChild(this.dialogMultiplayerProfile);
    }

    this.uiCreateButton = initializeElement(xml, "btn_create", EElementType.BUTTON, workArea, {
      context: this,
      [ui_events.BUTTON_CLICKED]: () => this.onCreateButtonClicked(),
    });
    this.uiCreateButton.Enable(false);

    this.uiPlayDemoButton = initializeElement(xml, "btn_play_demo", EElementType.BUTTON, workArea, {
      context: this,
      [ui_events.BUTTON_CLICKED]: () => this.dialogMultiplayerDemo.playSelectedDemo(),
    });
    this.uiPlayDemoButton.Enable(false);

    this.uiJoinButton = initializeElement(xml, "btn_join", EElementType.BUTTON, workArea, {
      context: this,
      [ui_events.BUTTON_CLICKED]: () => this.onJoinButtonClicked(),
    });

    initializeElement(xml, "btn_cancel", EElementType.BUTTON, workArea, {
      context: this,
      [ui_events.BUTTON_CLICKED]: () => this.onCancelButtonClicked(),
    });

    this.tab = initializeElement(xml, "tab", EElementType.TAB, workArea, {
      context: this,
      [ui_events.TAB_CHANGED]: () => this.onTabChange(),
    });
    this.tab.SetActiveTab(EMultiplayerMenuTab.CLIENT);

    this.messageBox = initializeElement(xml, "msg_box", EElementType.MESSAGE_BOX_EX, this, {
      [ui_events.MESSAGE_BOX_YES_CLICKED]: () => this.onDirectIPConfirmationClicked(),
    });

    const version: CUIStatic = xml.InitStatic("static_version", this);
    const mainMenu: CMainMenu = main_menu.get_main_menu();

    version.TextControl().SetText(string.format(forgeConfig.VERSION, mainMenu.GetGSVer()));

    if (this.isOnlineMode) {
      this.cdkey.SetText(mainMenu.GetCDKey());
    } else {
      this.playerNameEditBox.SetText(mainMenu.GetPlayerName());
    }

    this.dialogMultiplayerJoin.uiServerList.SetConnectionErrCb(
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

    const mainMenu: CMainMenu = main_menu.get_main_menu();

    if (this.isOnlineMode) {
      this.cdkey.SetText(mainMenu.GetCDKey());
    } else {
      this.playerNameEditBox.SetText(mainMenu.GetPlayerName());
    }

    this.dialogMultiplayerServer.onGameModeChange();

    if (level.present()) {
      this.uiCreateButton.Enable(false);
      this.uiJoinButton.Enable(false);
      this.dialogMultiplayerJoin.uiJoinDirectIPButton.Enable(false);
      this.tab.Enable(false);
      this.cdkey.Enable(false);
    }
  }

  public onDirectIPConfirmationClicked(): void {
    logger.info("On direct API confirmed");

    if (string.len(this.messageBox.GetHost()) !== 0) {
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
    const cdKey: string = this.cdkey.GetText();

    executeConsoleCommand(consoleCommands.cdkey, cdKey === "" ? "clear" : cdKey);
  }

  public onPlayerNameChanged(): void {
    logger.info("Player name changed");

    let tempPlayerName: TLabel = this.playerNameEditBox.GetText();

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
    // Nothing.
  }

  public onFilterChange(): void {
    logger.info("Filters change");

    this.dialogMultiplayerJoin.uiServerList.SetFilters(this.dialogMultiplayerJoin.getFilters());
  }

  public onRadioNetChanged(): void {
    this.dialogMultiplayerJoin.uiServerList.NetRadioChanged(!this.isOnlineMode);
    this.dialogMultiplayerJoin.uiServerList.RefreshList(!this.isOnlineMode);
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

    this.dialogMultiplayerJoin.uiServerList.SetPlayerName(this.owner.xrGameSpyProfile!.unique_nick());
    this.dialogMultiplayerJoin.uiServerList.ConnectToSelected();
  }

  public onCreateButtonClicked(): void {
    logger.info("Create custom server");

    if (this.dialogMultiplayerServer.uiMapList.IsEmpty()) {
      this.messageBox.InitMessageBox("select_map");
      this.messageBox.ShowDialog(true);

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

    this.dialogMultiplayerServer.uiMapList.SaveMapList();
    this.gatherServerData();

    if (this.dialogMultiplayerServer.uiDedicatedCheck.GetCheck()) {
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

    let commandString: TLabel = "";
    let tmpStr: string;

    // -- server name ------------------------------------------------------------------
    tmpStr = this.dialogMultiplayerServer.uiServerNameEdit.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = "/hname=" + tmpStr;
    }

    // -- password ---------------------------------------------------------------------
    tmpStr = this.dialogMultiplayerServer.uiPasswordEdit.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/psw=" + tmpStr;
    }

    // -- max players ------------------------------------------------------------------
    tmpStr = this.dialogMultiplayerServer.uiMaxPlayersSpin.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/maxplayers=" + tmpStr;
    }

    // -- public server ----------------------------------------------------------------
    if (this.isOnlineMode === true) {
      commandString = commandString + "/public=1";
    }

    tmpStr = this.dialogMultiplayerOptions.uiSpinMaxPing.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/maxping=" + tmpStr;
    }

    // -- spectator --------------------------------------------------------------------
    if (this.dialogMultiplayerOptions.uiCheckSpectator.GetCheck()) {
      tmpStr = this.dialogMultiplayerOptions.uiSpinSpectator.GetText();
      if (string.len(tmpStr) > 0) {
        commandString = commandString + "/spectr=" + tmpStr;
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

    commandString = commandString + "/spectrmds=" + tmpNum;

    // -- allow voting ------------------------------------------------------------------
    const tmpBool: boolean = this.dialogMultiplayerOptions.uiCheckAllowVoting.GetCheck();

    if (tmpBool === true) {
      commandString = commandString + "/vote=1";
    }

    // -- damage block ------------------------------------------------------------------
    tmpStr = this.dialogMultiplayerOptions.uiSpinDamageBlock.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/dmgblock=" + tmpStr;
    }

    if (this.dialogMultiplayerOptions.uiCheckDamageBlock.GetCheck()) {
      commandString = commandString + "/dmbi=1";
    }

    // -- frag limit ---------------------------------------------------------------------
    tmpStr = this.dialogMultiplayerOptions.uiSpinFragLimit.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/fraglimit=" + tmpStr;
    }

    // -- time limit ---------------------------------------------------------------------
    tmpStr = this.dialogMultiplayerOptions.uiSpinTimeLimit.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/timelimit=" + tmpStr;
    }

    // -- friendly fire ------------------------------------------------------------------
    tmpStr = this.dialogMultiplayerOptions.uiSpinFriendlyFire.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/ffire=" + tmpStr;
    }

    // -- auto team balance --------------------------------------------------------------
    if (this.dialogMultiplayerOptions.uiCheckAutoTeamBalance.GetCheck()) {
      commandString = commandString + "/abalance=1";
    }

    // -- auto team swap --------------------------------------------------------------
    if (this.dialogMultiplayerOptions.uiCheckAutoTeamSwap.GetCheck()) {
      commandString = commandString + "/aswap=1";
    }

    // -- Force respawn --------------------------------------------------------------
    if (this.dialogMultiplayerOptions.uiTabRespawn.GetActiveId() === "reinforcement") {
      tmpStr = this.dialogMultiplayerOptions.uiSpinForceRespawn.GetText();
      if (string.len(tmpStr) > 0) {
        commandString = commandString + "/frcrspwn=" + tmpStr;
      }
    }

    // todo: Unepxeted condition? -- ARTEFACTHUNT only ----------------------------------------------
    if ((GAME_TYPE.GAME_UNKNOWN as number) !== 0) {
      if (this.dialogMultiplayerServer.uiMapList.GetCurGameType() === GAME_TYPE.eGameIDArtefactHunt) {
        // -- number of artefacts ---------------------------------------------------------
        tmpStr = this.dialogMultiplayerOptions.uiSpinArtefactsNum.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/anum=" + tmpStr;
        }

        // -- aretefact delay --------------------------------------------------------------
        tmpStr = this.dialogMultiplayerOptions.uiSpinArtefactDelay.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/ardelta=" + tmpStr;
        }

        // -- artefact stay ----------------------------------------------------------------
        tmpStr = this.dialogMultiplayerOptions.uiSpinArtefactStay.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/astime=" + tmpStr;
        }

        if (this.dialogMultiplayerOptions.uiTabRespawn.GetActiveId() === "artefactcapture") {
          // -- artefact capture selected
          commandString = commandString + "/reinf=-1";
        } else {
          tmpStr = this.dialogMultiplayerOptions.uiSpinReinforcement.GetText();
          if (string.len(tmpStr) > 0) {
            commandString = commandString + "/reinf=" + tmpStr;
          }
        }
      }

      // -- CAPTURETHEARTEFACT only ----------------------------------------------
      if (this.dialogMultiplayerServer.uiMapList.GetCurGameType() === GAME_TYPE.eGameIDCaptureTheArtefact) {
        // -- number of artefacts ---------------------------------------------------------
        tmpStr = this.dialogMultiplayerOptions.uiSpinArtefactsNum.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/anum=" + tmpStr;
        }

        tmpStr = this.dialogMultiplayerOptions.uiSpinReinforcement.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/reinf=" + tmpStr;
        }

        tmpStr = this.dialogMultiplayerOptions.uiSpinArtreturnTime.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/artrettime=" + tmpStr;
        }

        if (this.dialogMultiplayerOptions.uiCheckActivatedReturn.GetCheck()) {
          commandString = commandString + "/actret=1";
        }
      }
    } else if ((GAME_TYPE.GAME_UNKNOWN as number) === 0) {
      if (this.dialogMultiplayerServer.uiMapList.GetCurGameType() === GAME_TYPE.GAME_ARTEFACTHUNT) {
        // -- number of artefacts ---------------------------------------------------------
        tmpStr = this.dialogMultiplayerOptions.uiSpinArtefactsNum.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/anum=" + tmpStr;
        }

        // -- aretefact delay --------------------------------------------------------------
        tmpStr = this.dialogMultiplayerOptions.uiSpinArtefactDelay.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/ardelta=" + tmpStr;
        }

        // -- artefact stay ----------------------------------------------------------------
        tmpStr = this.dialogMultiplayerOptions.uiSpinArtefactStay.GetText();
        if (string.len(tmpStr) > 0) {
          commandString = commandString + "/astime=" + tmpStr;
        }

        if (this.dialogMultiplayerOptions.uiTabRespawn.GetActiveId() === "artefactcapture") {
          // -- artefact capture selected
          commandString = commandString + "/reinf=-1";
        } else {
          tmpStr = this.dialogMultiplayerOptions.uiSpinReinforcement.GetText();
          if (string.len(tmpStr) > 0) {
            commandString = commandString + "/reinf=" + tmpStr;
          }
        }
      }
    }

    // -- friendly indicators --------------------------------------------------------------
    if (this.dialogMultiplayerOptions.uiCheckFriendlyIndicators.GetCheck()) {
      commandString = commandString + "/fi=1" + tmpStr;
    }

    // -- friendly indicators --------------------------------------------------------------
    if (this.dialogMultiplayerOptions.uiCheckFriendlyNames.GetCheck()) {
      commandString = commandString + "/fn=1" + tmpStr;
    }

    // -- anomaly time ---------------------------------------------------------------------
    if (this.dialogMultiplayerOptions.uiCheckNoAnmalies.GetCheck() === false) {
      tmpStr = this.dialogMultiplayerOptions.uiSpinAnomalyTime.GetText();
      if (string.len(tmpStr) > 0) {
        commandString = commandString + "/ans=1/anslen=" + tmpStr;
      }
    } else {
      commandString = commandString + "/ans=0";
    }

    // -- pda hunt -------------------------------------------------------------------------
    if (this.dialogMultiplayerOptions.uiCheckDdaHunt.GetCheck()) {
      commandString = commandString + "/pdahunt=1";
    }

    // -- warm up time ---------------------------------------------------------------------
    tmpStr = this.dialogMultiplayerOptions.uiSpinWarmUpTime.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/warmup=" + tmpStr;
    }

    // -- rate of weather change -----------------------------------------------------------
    tmpStr = this.dialogMultiplayerOptions.uiSpinRateOfChange.GetText();
    if (string.len(tmpStr) > 0) {
      commandString = commandString + "/etimef=" + tmpStr;
    }

    this.dialogMultiplayerServer.uiMapList.SetServerParams(commandString);
  }

  public onConnectError(code: number, description: TLabel): void {
    logger.info("Connection error:", code, description);

    this.messageBox.InitMessageBox("message_box_error");

    if (description === "") {
      description = "mp_gp_connect_error";
    }

    this.tab.SetActiveTab(EMultiplayerMenuTab.PROFILE);
    this.messageBox.SetText(game.translate_string(description));
    this.messageBox.ShowDialog(true);
  }

  public onTabChange(): void {
    const id: EMultiplayerMenuTab = this.tab.GetActiveId() as EMultiplayerMenuTab;

    logger.info("Active multiplayer tab changed:", id);

    this.dialogMultiplayerJoin.Show(false);
    this.dialogMultiplayerOptions.Show(false);
    this.dialogMultiplayerServer.Show(false);
    this.dialogMultiplayerDemo.Show(false);

    if (this.isOnlineMode) {
      this.dialogMultiplayerProfile.Show(false);
    }

    this.uiJoinButton.Show(false);
    this.uiCreateButton.Show(false);
    this.uiPlayDemoButton.Show(false);

    switch (id) {
      case EMultiplayerMenuTab.CLIENT: {
        this.dialogMultiplayerJoin.Show(true);
        this.uiJoinButton.Show(true);
        break;
      }

      case EMultiplayerMenuTab.OPTIONS: {
        this.dialogMultiplayerOptions.Show(true);
        this.uiCreateButton.Show(true);
        break;
      }

      case EMultiplayerMenuTab.SERVER: {
        this.dialogMultiplayerServer.uiMapList.LoadMapList();
        this.dialogMultiplayerServer.uiMapList.OnModeChange();
        this.dialogMultiplayerServer.Show(true);
        this.uiCreateButton.Show(true);
        break;
      }

      case EMultiplayerMenuTab.DEMO: {
        this.dialogMultiplayerDemo.fillList();
        this.dialogMultiplayerDemo.Show(true);
        this.uiPlayDemoButton.Show(true);
        break;
      }

      case EMultiplayerMenuTab.PROFILE: {
        this.dialogMultiplayerProfile.Show(true);
        this.dialogMultiplayerProfile.uiUniqueNickEditBox.SetText(this.owner.xrGameSpyProfile!.unique_nick());
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
