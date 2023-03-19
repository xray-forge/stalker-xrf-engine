import {
  COptionsManager,
  CScriptXmlInit,
  CUIMessageBoxEx,
  CUIScriptWnd,
  DIK_keys,
  Frect,
  get_console,
  is_enough_address_space_available,
  LuabindClass,
  main_menu,
  TXR_DIK_key,
  TXR_ui_event,
  ui_events,
  XR_CConsole,
  XR_CMainMenu,
  XR_COptionsManager,
  XR_CScriptXmlInit,
  XR_CUI3tButton,
  XR_CUIComboBox,
  XR_CUIMessageBoxEx,
  XR_CUIProgressBar,
  XR_CUIScriptWnd,
  XR_CUIStatic,
  XR_CUITabControl,
  XR_CUITrackBar,
  XR_Patch_Dawnload_Progress,
} from "xray16";

import { OptionsControls } from "@/engine/core/ui/menu/options/OptionsControls";
import { OptionsGameplay } from "@/engine/core/ui/menu/options/OptionsGameplay";
import { OptionsSound } from "@/engine/core/ui/menu/options/OptionsSound";
import { OptionsVideo } from "@/engine/core/ui/menu/options/OptionsVideo";
import { OptionsVideoAdvanced } from "@/engine/core/ui/menu/options/OptionsVideoAdvanced";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { option_groups, option_groups_messages } from "@/engine/lib/constants/option_groups";

const base: string = "menu\\OptionsDialog.component";
const logger: LuaLogger = new LuaLogger($filename);

@LuabindClass()
export class OptionsDialog extends CUIScriptWnd {
  public owner: XR_CUIScriptWnd;

  public m_preconditions: Record<string, (ctrl: OptionsDialog, id: number) => void>;
  public b_restart_system_shown: boolean = false;

  public tab!: XR_CUITabControl;
  public dialog!: XR_CUIStatic;
  public message_box!: XR_CUIMessageBoxEx;
  public cap_download!: XR_CUIStatic;
  public text_download!: XR_CUIStatic;
  public download_progress!: XR_CUIProgressBar;
  public btn_cancel_download!: XR_CUI3tButton;

  public dialogVideoSettings!: OptionsVideo;
  public dialogVideoAdvancedSettings!: OptionsVideoAdvanced;
  public dialogSoundSettings!: OptionsSound;
  public dialogGameplaySettings!: OptionsGameplay;
  public dialogContolsSettings!: OptionsControls;

  // From child sections:
  public combo_preset!: XR_CUIComboBox;
  public combo_renderer!: XR_CUIComboBox;
  public texture_lod_track!: XR_CUITrackBar;
  public ss_trb!: XR_CUITrackBar;
  public ss_cb!: XR_CUIComboBox;

  public constructor(owner: XR_CUIScriptWnd) {
    super();

    this.owner = owner;
    this.m_preconditions = {};
    this.InitControls();
    this.InitCallBacks();
    this.tab.SetActiveTab("video");
  }

  public InitControls(): void {
    logger.info("Init controls");

    this.SetWndRect(new Frect().set(0, 0, 1024, 768));
    this.Enable(true);

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

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

    this.dialogContolsSettings = new OptionsControls();
    this.dialogContolsSettings.initialize(0, 0, xml, this);
    this.dialogContolsSettings.Show(false);
    this.dialog.AttachChild(this.dialogContolsSettings);
    xml.InitWindow("tab_size", 0, this.dialogContolsSettings);

    this.dialogVideoAdvancedSettings = new OptionsVideoAdvanced();
    this.dialogVideoAdvancedSettings.initialize(0, 0, xml, this);
    this.dialogVideoAdvancedSettings.Show(false);
    this.dialog.AttachChild(this.dialogVideoAdvancedSettings);
    xml.InitWindow("tab_size", 0, this.dialogVideoAdvancedSettings);

    this.Register(xml.Init3tButton("main_dialog:btn_accept", this.dialog), "btn_accept");
    this.Register(xml.Init3tButton("main_dialog:btn_cancel", this.dialog), "btn_cancel");

    this.tab = xml.InitTab("main_dialog:tab", this.dialog);
    this.Register(this.tab, "tab");

    this.message_box = new CUIMessageBoxEx();

    this.cap_download = xml.InitStatic("download_static", this);
    this.text_download = xml.InitStatic("download_text", this);
    this.download_progress = xml.InitProgressBar("progress_download", this);
    this.btn_cancel_download = xml.Init3tButton("btn_cancel_download", this);
    this.Register(this.btn_cancel_download, "btn_cancel_download");
  }

  public SetCurrentValues(): void {
    logger.info("Set current values");

    const opt = new COptionsManager();

    opt.SetCurrentValues(option_groups.mm_opt_video_preset);
    opt.SaveBackupValues(option_groups.mm_opt_video_preset);

    opt.SetCurrentValues(option_groups.mm_opt_video);
    opt.SaveBackupValues(option_groups.mm_opt_video);

    opt.SetCurrentValues(option_groups.mm_opt_video_adv);
    opt.SaveBackupValues(option_groups.mm_opt_video_adv);

    opt.SetCurrentValues(option_groups.mm_opt_gameplay);
    opt.SaveBackupValues(option_groups.mm_opt_gameplay);

    opt.SetCurrentValues(option_groups.mm_opt_sound);
    opt.SaveBackupValues(option_groups.mm_opt_sound);

    opt.SetCurrentValues(option_groups.mm_opt_controls);

    opt.SetCurrentValues(option_groups.key_binding);

    this.UpdateDependControls();
  }

  public UpdateDependControls(): void {
    const current_id: number = this.combo_renderer.CurrentID();

    Object.entries(this.m_preconditions).forEach(([key, value]) => {
      value(key as any, current_id);
    });

    const max_texture_lod: number = 4;
    let min_texture_lod: number = 0;

    if (current_id !== 0) {
      if (!is_enough_address_space_available()) {
        min_texture_lod = 1;
      }
    }

    this.texture_lod_track.SetOptIBounds(min_texture_lod, max_texture_lod);
  }

  public InitCallBacks(): void {
    this.AddCallback("tab", ui_events.TAB_CHANGED, () => this.OnTabChange(), this);
    this.AddCallback("btn_advanced_graphic", ui_events.BUTTON_CLICKED, () => this.OnBtnAdvGraphic(), this);
    this.AddCallback("btn_accept", ui_events.BUTTON_CLICKED, () => this.OnBtnAccept(), this);
    this.AddCallback("btn_cancel", ui_events.BUTTON_CLICKED, () => this.OnBtnCancel(), this);
    this.AddCallback("btn_default_graphic", ui_events.BUTTON_CLICKED, () => this.OnBtnDefGraph(), this);
    this.AddCallback("btn_default_sound", ui_events.BUTTON_CLICKED, () => this.OnBtnDefSound(), this);
    this.AddCallback("combo_preset", ui_events.LIST_ITEM_SELECT, () => this.OnPresetChanged(), this);
    this.AddCallback("btn_simply_graphic", ui_events.BUTTON_CLICKED, () => this.OnSimplyGraphic(), this);
    this.AddCallback("btn_keyb_default", ui_events.BUTTON_CLICKED, () => this.OnBtnKeybDefault(), this);
    this.AddCallback("btn_check_updates", ui_events.BUTTON_CLICKED, () => this.OnBtnCheckUpdates(), this);
    this.AddCallback("combo_renderer", ui_events.LIST_ITEM_SELECT, () => this.UpdateDependControls(), this);
    this.AddCallback("btn_cancel_download", ui_events.BUTTON_CLICKED, () => this.OnBtn_CancelDownload(), this);
    this.AddCallback("trb_ssample", ui_events.BUTTON_CLICKED, () => this.UpdateDependControls(), this);
    this.AddCallback("cb_ssample", ui_events.LIST_ITEM_SELECT, () => this.UpdateDependControls(), this);
  }

  public OnBtnCheckUpdates(): void {
    const console: XR_CConsole = get_console();

    console.execute("check_for_updates 1");
  }

  public OnBtnKeybDefault(): void {
    const console: XR_CConsole = get_console();

    console.execute("default_controls");

    const opt: XR_COptionsManager = new COptionsManager();

    opt.SetCurrentValues(option_groups.mm_opt_controls);
    opt.SetCurrentValues(option_groups.key_binding);
  }

  public OnPresetChanged(): void {
    const opt: XR_COptionsManager = new COptionsManager();

    opt.SetCurrentValues(option_groups.mm_opt_video_adv);
  }

  public OnBtnDefGraph(): void {
    const opt: XR_COptionsManager = new COptionsManager();

    opt.SendMessage2Group(option_groups.mm_opt_video, option_groups_messages.set_default_value);
  }

  public OnBtnDefSound(): void {
    const opt: XR_COptionsManager = new COptionsManager();

    opt.SendMessage2Group(option_groups.mm_opt_video, option_groups_messages.set_default_value);
  }

  public OnBtnAccept(): void {
    const opt: XR_COptionsManager = new COptionsManager();
    const console: XR_CConsole = get_console();

    opt.SaveValues("mm_opt_video_preset");
    opt.SaveValues("key_binding");
    opt.SaveValues("mm_opt_video");
    opt.SaveValues("mm_opt_video_adv");
    opt.SaveValues("mm_opt_gameplay");
    opt.SaveValues("mm_opt_sound");
    opt.SaveValues("mm_opt_controls");

    opt.OptionsPostAccept();

    this.owner.ShowDialog(true);
    this.HideDialog();
    this.owner.Show(true);

    if (!this.b_restart_system_shown) {
      const opt: XR_COptionsManager = new COptionsManager();

      if (opt.NeedSystemRestart()) {
        this.b_restart_system_shown = true;
        this.message_box.InitMessageBox("message_box_restart_game");
        this.message_box.ShowDialog(true);
      }
    }

    console.execute("cfg_save");
  }

  public OnBtnCancel(): void {
    const opt: XR_COptionsManager = new COptionsManager();

    opt.UndoGroup(option_groups.mm_opt_video_preset);
    opt.UndoGroup(option_groups.mm_opt_video);
    opt.UndoGroup(option_groups.mm_opt_video_adv);
    opt.UndoGroup(option_groups.mm_opt_sound);
    opt.OptionsPostAccept();

    this.owner.ShowDialog(true);
    this.HideDialog();
    this.owner.Show(true);
  }

  public OnTabChange(): void {
    this.dialogVideoSettings.Show(false);
    this.dialogSoundSettings.Show(false);
    this.dialogGameplaySettings.Show(false);
    this.dialogContolsSettings.Show(false);
    this.dialogVideoAdvancedSettings.Show(false);

    // todo: Use constants for JSX and checks.
    const id: string = this.tab.GetActiveId();

    if (id === "video") {
      this.dialogVideoSettings.Show(true);
    } else if (id === "sound") {
      this.dialogSoundSettings.Show(true);
    } else if (id === "gameplay") {
      this.dialogGameplaySettings.Show(true);
    } else if (id === "controls") {
      this.dialogContolsSettings.Show(true);
    }
  }

  public OnBtnAdvGraphic(): void {
    logger.info("Show advanced graphics");
    this.dialogVideoSettings.Show(false);
    this.dialogVideoAdvancedSettings.Show(true);
  }

  public OnSimplyGraphic(): void {
    logger.info("Show simplified graphics");
    this.dialogVideoSettings.Show(true);
    this.dialogVideoAdvancedSettings.Show(false);
  }

  public override OnKeyboard(key: TXR_DIK_key, event: TXR_ui_event): boolean {
    const res: boolean = super.OnKeyboard(key, event);

    if (!res) {
      if (event === ui_events.WINDOW_KEY_PRESSED) {
        if (key === DIK_keys.DIK_ESCAPE) {
          if (this.dialogVideoAdvancedSettings.IsShown()) {
            this.dialogVideoAdvancedSettings.Show(false);
            this.dialogVideoSettings.Show(true);
          } else {
            this.owner.ShowDialog(true);
            this.HideDialog();
            this.owner.Show(true);
          }
        }
      }
    }

    return res;
  }

  public override Update(): void {
    super.Update();

    const mainMenu: XR_CMainMenu = main_menu.get_main_menu();
    const patchDownload: XR_Patch_Dawnload_Progress = mainMenu.GetPatchProgress();
    const patchProgress: number = patchDownload.GetProgress();
    const filename: string = patchDownload.GetFlieName();

    if (filename && patchProgress && patchProgress >= 0 && patchProgress <= 100) {
      this.text_download.Show(true);
      this.cap_download.Show(true);
      this.download_progress.Show(true);

      this.download_progress.SetProgressPos(patchProgress);

      const str: string = string.format("%.0f%%(%s)", patchProgress, patchDownload.GetFlieName());

      this.text_download.TextControl().SetText(str);
      this.btn_cancel_download.Show(true);
    } else {
      this.text_download.Show(false);
      this.cap_download.Show(false);
      this.download_progress.Show(false);
      this.btn_cancel_download.Show(false);
    }
  }

  public OnBtn_CancelDownload(): void {
    logger.info("Cancel patch download");
    main_menu.get_main_menu().CancelDownload();
  }
}
