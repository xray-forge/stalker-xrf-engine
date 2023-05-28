import {
  CMainMenu,
  COptionsManager,
  CScriptXmlInit,
  CUI3tButton,
  CUIComboBox,
  CUIMessageBoxEx,
  CUIProgressBar,
  CUIScriptWnd,
  CUIStatic,
  CUITabControl,
  CUITrackBar,
  CUIWindow,
  DIK_keys,
  Frect,
  is_enough_address_space_available,
  LuabindClass,
  main_menu,
  ui_events,
} from "xray16";

import { OptionsControls } from "@/engine/core/ui/menu/options/OptionsControls";
import { OptionsGameplay } from "@/engine/core/ui/menu/options/OptionsGameplay";
import { OptionsSound } from "@/engine/core/ui/menu/options/OptionsSound";
import { OptionsVideo } from "@/engine/core/ui/menu/options/OptionsVideo";
import { OptionsVideoAdvanced } from "@/engine/core/ui/menu/options/OptionsVideoAdvanced";
import { EGameRenderer, EOptionGroup, optionGroupsMessages } from "@/engine/core/ui/menu/options/types";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { PatchDownloadProgress, TKeyCode, TName, TPath, TRate, TUIEvent } from "@/engine/lib/types";

const base: TPath = "menu\\OptionsDialog.component";
const logger: LuaLogger = new LuaLogger($filename);

@LuabindClass()
export class OptionsDialog extends CUIScriptWnd {
  public isRestartSystemShown: boolean = false;

  public owner: CUIScriptWnd;
  /**
   * Store map of settings checker to verify whether renderer is correct.
   */
  public preconditions: LuaTable<CUIWindow, (control: CUIWindow, renderer: EGameRenderer) => void> = new LuaTable();

  public tab!: CUITabControl;
  public dialog!: CUIStatic;
  public messageBox!: CUIMessageBoxEx;
  public downloadCaption!: CUIStatic;
  public downloadText!: CUIStatic;
  public downloadProgress!: CUIProgressBar;
  public downloadCancelButton!: CUI3tButton;

  public dialogVideoSettings!: OptionsVideo;
  public dialogVideoAdvancedSettings!: OptionsVideoAdvanced;
  public dialogSoundSettings!: OptionsSound;
  public dialogGameplaySettings!: OptionsGameplay;
  public dialogControlsSettings!: OptionsControls;

  // From child sections:
  public currentPresetSelect!: CUIComboBox;
  public currentRendererSelect!: CUIComboBox;
  public textureLodTrackBar!: CUITrackBar;
  public sSamplingTrackBar!: CUITrackBar;
  public sSamplingComboBox!: CUIComboBox;

  public constructor(owner: CUIScriptWnd) {
    super();

    this.owner = owner;

    this.initializeControls();
    this.initializeCallbacks();

    this.tab.SetActiveTab("video");
  }

  public initializeControls(): void {
    this.SetWndRect(new Frect().set(0, 0, gameConfig.UI.BASE_WIDTH, gameConfig.UI.BASE_HEIGHT));
    this.Enable(true);

    const xml: CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));

    xml.InitStatic("background", this);
    this.dialog = xml.InitStatic("main_dialog:dialog", this);

    // --    xml.InitStatic                ("main_dialog:cap_options", this.dialog)

    this.dialogVideoSettings = new OptionsVideo();
    this.dialogVideoSettings.initialize(0, 0, xml, this);
    this.dialogVideoSettings.Show(false);
    this.dialog.AttachChild(this.dialogVideoSettings);
    xml.InitWindow("tab_size", 0, this.dialogVideoSettings);

    this.dialogSoundSettings = new OptionsSound();
    this.dialogSoundSettings.initialize(0, 0, xml);
    this.dialogSoundSettings.Show(false);
    this.dialog.AttachChild(this.dialogSoundSettings);
    xml.InitWindow("tab_size", 0, this.dialogSoundSettings);

    this.dialogGameplaySettings = new OptionsGameplay();
    this.dialogGameplaySettings.initialize(0, 0, xml, this);
    this.dialogGameplaySettings.Show(false);
    this.dialog.AttachChild(this.dialogGameplaySettings);
    xml.InitWindow("tab_size", 0, this.dialogGameplaySettings);

    this.dialogControlsSettings = new OptionsControls();
    this.dialogControlsSettings.initialize(0, 0, xml, this);
    this.dialogControlsSettings.Show(false);
    this.dialog.AttachChild(this.dialogControlsSettings);
    xml.InitWindow("tab_size", 0, this.dialogControlsSettings);

    this.dialogVideoAdvancedSettings = new OptionsVideoAdvanced();
    this.dialogVideoAdvancedSettings.initialize(0, 0, xml, this);
    this.dialogVideoAdvancedSettings.Show(false);
    this.dialog.AttachChild(this.dialogVideoAdvancedSettings);
    xml.InitWindow("tab_size", 0, this.dialogVideoAdvancedSettings);

    this.Register(xml.Init3tButton("main_dialog:btn_accept", this.dialog), "btn_accept");
    this.Register(xml.Init3tButton("main_dialog:btn_cancel", this.dialog), "btn_cancel");

    this.tab = xml.InitTab("main_dialog:tab", this.dialog);
    this.Register(this.tab, "tab");

    this.messageBox = new CUIMessageBoxEx();

    this.downloadCaption = xml.InitStatic("download_static", this);
    this.downloadText = xml.InitStatic("download_text", this);
    this.downloadProgress = xml.InitProgressBar("progress_download", this);
    this.downloadCancelButton = xml.Init3tButton("btn_cancel_download", this);
    this.Register(this.downloadCancelButton, "btn_cancel_download");
  }

  public initializeState(): void {
    logger.info("Set and save current values");

    const optionsManager: COptionsManager = new COptionsManager();

    optionsManager.SetCurrentValues(EOptionGroup.OPTIONS_VIDEO_PRESET);
    optionsManager.SaveBackupValues(EOptionGroup.OPTIONS_VIDEO_PRESET);

    optionsManager.SetCurrentValues(EOptionGroup.OPTIONS_VIDEO);
    optionsManager.SaveBackupValues(EOptionGroup.OPTIONS_VIDEO);

    optionsManager.SetCurrentValues(EOptionGroup.OPTIONS_VIDEO_ADVANCED);
    optionsManager.SaveBackupValues(EOptionGroup.OPTIONS_VIDEO_ADVANCED);

    optionsManager.SetCurrentValues(EOptionGroup.OPTIONS_GAMEPLAY);
    optionsManager.SaveBackupValues(EOptionGroup.OPTIONS_GAMEPLAY);

    optionsManager.SetCurrentValues(EOptionGroup.OPTIONS_SOUND);
    optionsManager.SaveBackupValues(EOptionGroup.OPTIONS_SOUND);

    optionsManager.SetCurrentValues(EOptionGroup.OPTIONS_CONTROLS);
    optionsManager.SetCurrentValues(EOptionGroup.KEY_BINDINGS);

    this.updateControls();
  }

  public initializeCallbacks(): void {
    this.AddCallback("tab", ui_events.TAB_CHANGED, () => this.onTabChanged(), this);
    this.AddCallback(
      "btn_advanced_graphic",
      ui_events.BUTTON_CLICKED,
      () => this.onShowAdvancedGraphicsClicked(),
      this
    );
    this.AddCallback("btn_accept", ui_events.BUTTON_CLICKED, () => this.onAcceptButtonClicked(), this);
    this.AddCallback("btn_cancel", ui_events.BUTTON_CLICKED, () => this.onCancelButtonClicked(), this);
    this.AddCallback(
      "btn_default_graphic",
      ui_events.BUTTON_CLICKED,
      () => this.onDefaultGraphicsButtonClicked(),
      this
    );
    this.AddCallback(
      "btn_default_sound",
      ui_events.BUTTON_CLICKED,
      () => this.onDefaultSoundSettingsButtonClicked(),
      this
    );
    this.AddCallback("combo_preset", ui_events.LIST_ITEM_SELECT, () => this.onPresetChanged(), this);
    this.AddCallback("btn_simply_graphic", ui_events.BUTTON_CLICKED, () => this.onShowSimpleGraphicsClicked(), this);
    this.AddCallback("btn_keyb_default", ui_events.BUTTON_CLICKED, () => this.onDefaultKeybindsButtonClicked(), this);
    this.AddCallback("btn_check_updates", ui_events.BUTTON_CLICKED, () => this.onCheckUpdatesButtonClicked(), this);
    this.AddCallback("combo_renderer", ui_events.LIST_ITEM_SELECT, () => this.updateControls(), this);
    this.AddCallback("btn_cancel_download", ui_events.BUTTON_CLICKED, () => this.onCancelDownloadClicked(), this);
    this.AddCallback("trb_ssample", ui_events.BUTTON_CLICKED, () => this.updateControls(), this);
    this.AddCallback("cb_ssample", ui_events.LIST_ITEM_SELECT, () => this.updateControls(), this);
  }

  public updateControls(): void {
    const currentRenderer: EGameRenderer = this.currentRendererSelect.CurrentID();

    logger.info("Updating controls:", currentRenderer);

    for (const [key, value] of this.preconditions) {
      value(key, currentRenderer);
    }

    const maxTextureLod: number = 4;
    let minTextureLod: number = 0;

    if (currentRenderer !== 0) {
      if (!is_enough_address_space_available()) {
        logger.info("Detected not enough address space, reduce lod");
        minTextureLod = 1;
      }
    }

    this.textureLodTrackBar.SetOptIBounds(minTextureLod, maxTextureLod);
  }

  public override Update(): void {
    super.Update();

    const mainMenu: CMainMenu = main_menu.get_main_menu();
    const patchDownload: PatchDownloadProgress = mainMenu.GetPatchProgress();
    const patchProgress: TRate = patchDownload.GetProgress();
    const filename: TName = patchDownload.GetFlieName();

    if (filename && patchProgress && patchProgress >= 0 && patchProgress <= 100) {
      this.downloadProgress.Show(true);
      this.downloadProgress.SetProgressPos(patchProgress);
      this.downloadCancelButton.Show(true);
      this.downloadCaption.Show(true);
      this.downloadText.Show(true);
      this.downloadText.TextControl().SetText(string.format("%.0f%%(%s)", patchProgress, patchDownload.GetFlieName()));
    } else {
      this.downloadText.Show(false);
      this.downloadCaption.Show(false);
      this.downloadProgress.Show(false);
      this.downloadCancelButton.Show(false);
    }
  }

  public onCheckUpdatesButtonClicked(): void {
    executeConsoleCommand(consoleCommands.check_for_updates, 1);
  }

  public onDefaultKeybindsButtonClicked(): void {
    executeConsoleCommand(consoleCommands.default_controls);

    const optionsManager: COptionsManager = new COptionsManager();

    optionsManager.SetCurrentValues(EOptionGroup.OPTIONS_CONTROLS);
    optionsManager.SetCurrentValues(EOptionGroup.KEY_BINDINGS);
  }

  public onPresetChanged(): void {
    const optionsManager: COptionsManager = new COptionsManager();

    optionsManager.SetCurrentValues(EOptionGroup.OPTIONS_VIDEO_ADVANCED);
  }

  public onDefaultGraphicsButtonClicked(): void {
    const optionsManager: COptionsManager = new COptionsManager();

    optionsManager.SendMessage2Group(EOptionGroup.OPTIONS_VIDEO, optionGroupsMessages.set_default_value);
  }

  public onDefaultSoundSettingsButtonClicked(): void {
    const optionsManager: COptionsManager = new COptionsManager();

    optionsManager.SendMessage2Group(EOptionGroup.OPTIONS_VIDEO, optionGroupsMessages.set_default_value);
  }

  public onAcceptButtonClicked(): void {
    const optionsManager: COptionsManager = new COptionsManager();

    optionsManager.SaveValues(EOptionGroup.OPTIONS_VIDEO_PRESET);
    optionsManager.SaveValues(EOptionGroup.KEY_BINDINGS);
    optionsManager.SaveValues(EOptionGroup.OPTIONS_VIDEO);
    optionsManager.SaveValues(EOptionGroup.OPTIONS_VIDEO_ADVANCED);
    optionsManager.SaveValues(EOptionGroup.OPTIONS_GAMEPLAY);
    optionsManager.SaveValues(EOptionGroup.OPTIONS_SOUND);
    optionsManager.SaveValues(EOptionGroup.OPTIONS_CONTROLS);

    optionsManager.OptionsPostAccept();

    this.owner.ShowDialog(true);
    this.HideDialog();
    this.owner.Show(true);

    // Check and notify about game restart if needed.
    if (!this.isRestartSystemShown) {
      const nextOptionsManager: COptionsManager = new COptionsManager();

      if (nextOptionsManager.NeedSystemRestart()) {
        this.isRestartSystemShown = true;
        this.messageBox.InitMessageBox("message_box_restart_game");
        this.messageBox.ShowDialog(true);
      }
    }

    executeConsoleCommand(consoleCommands.cfg_save);
  }

  public onCancelButtonClicked(): void {
    const optionsManager: COptionsManager = new COptionsManager();

    optionsManager.UndoGroup(EOptionGroup.OPTIONS_VIDEO_PRESET);
    optionsManager.UndoGroup(EOptionGroup.OPTIONS_VIDEO);
    optionsManager.UndoGroup(EOptionGroup.OPTIONS_VIDEO_ADVANCED);
    optionsManager.UndoGroup(EOptionGroup.OPTIONS_SOUND);
    optionsManager.OptionsPostAccept();

    this.owner.ShowDialog(true);
    this.HideDialog();
    this.owner.Show(true);
  }

  public onTabChanged(): void {
    this.dialogVideoSettings.Show(false);
    this.dialogSoundSettings.Show(false);
    this.dialogGameplaySettings.Show(false);
    this.dialogControlsSettings.Show(false);
    this.dialogVideoAdvancedSettings.Show(false);

    switch (this.tab.GetActiveId()) {
      case "video":
        return this.dialogVideoSettings.Show(true);

      case "sound":
        return this.dialogSoundSettings.Show(true);

      case "gameplay":
        return this.dialogGameplaySettings.Show(true);

      case "controls":
        return this.dialogControlsSettings.Show(true);
    }
  }

  public onCancelDownloadClicked(): void {
    logger.info("Cancel patch download");
    main_menu.get_main_menu().CancelDownload();
  }

  public onShowAdvancedGraphicsClicked(): void {
    logger.info("Show advanced graphics");
    this.dialogVideoSettings.Show(false);
    this.dialogVideoAdvancedSettings.Show(true);
  }

  public onShowSimpleGraphicsClicked(): void {
    logger.info("Show simplified graphics");
    this.dialogVideoSettings.Show(true);
    this.dialogVideoAdvancedSettings.Show(false);
  }

  /**
   * Handle keyboard clicks.
   */
  public override OnKeyboard(key: TKeyCode, event: TUIEvent): boolean {
    const result: boolean = super.OnKeyboard(key, event);

    if (event === ui_events.WINDOW_KEY_PRESSED) {
      if (key === DIK_keys.DIK_ESCAPE) {
        if (this.dialogVideoAdvancedSettings.IsShown()) {
          this.dialogVideoAdvancedSettings.Show(false);
          this.dialogVideoSettings.Show(true);
        } else {
          this.onCancelButtonClicked();
        }
      }
    }

    return result;
  }
}
