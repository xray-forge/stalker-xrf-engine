import { option_groups, option_groups_messages } from "@/mod/globals/option_groups";
import { IOptionsControls, OptionsControls } from "@/mod/scripts/ui/menu/options/OptionsControls";
import { IOptionsGameplay, OptionsGameplay } from "@/mod/scripts/ui/menu/options/OptionsGameplay";
import { IOptionsSound, OptionsSound } from "@/mod/scripts/ui/menu/options/OptionsSound";
import { IOptionsVideo, OptionsVideo } from "@/mod/scripts/ui/menu/options/OptionsVideo";
import { IOptionsVideoAdvanced, OptionsVideoAdvanced } from "@/mod/scripts/ui/menu/options/OptionsVideoAdvanced";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/rendering";

const base: string = "menu\\OptionsDialog.component";
const log: LuaLogger = new LuaLogger("Options");

export interface IOptionsDialog extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  m_preconditions: Record<string, (ctrl: IOptionsDialog, id: number) => void>;

  tab: XR_CUITabControl;
  dialog: XR_CUIStatic;
  message_box: XR_CUIMessageBoxEx;

  b_restart_system_shown: boolean;
  cap_download: XR_CUIStatic;
  text_download: XR_CUIStatic;
  download_progress: XR_CUIProgressBar;
  btn_cancel_download: XR_CUI3tButton;

  dlg_video: IOptionsVideo;
  dlg_video_adv: IOptionsVideoAdvanced;
  dlg_sound: IOptionsSound;
  dlg_gameplay: IOptionsGameplay;
  dlg_controls: IOptionsControls;

  // From child sections:
  combo_preset: XR_CUIComboBox;
  combo_renderer: XR_CUIComboBox;

  texture_lod_track: XR_CUITrackBar;
  ss_trb: XR_CUITrackBar;
  ss_cb: XR_CUIComboBox;

  InitControls(): void;
  SetCurrentValues(): void;
  UpdateDependControls(): void;
  InitCallBacks(): void;
  OnBtnCheckUpdates(): void;
  OnBtnKeybDefault(): void;
  OnPresetChanged(): void;
  OnPresetChanged(): void;
  OnBtnDefGraph(): void;
  OnBtnDefSound(): void;
  OnBtnAccept(): void;
  OnBtnCancel(): void;
  OnTabChange(): void;
  OnBtnAdvGraphic(): void;
  OnSimplyGraphic(): void;
  OnKeyboard(key: TXR_DIK_key, event: TXR_ui_event): boolean;
  Update(): void;
  OnBtn_CancelDownload(): void;
}

export const OptionsDialog: IOptionsDialog = declare_xr_class("OptionsDialog", CUIScriptWnd, {
  __init(): void {
    xr_class_super();
    log.info("Init");

    this.m_preconditions = {};
    this.InitControls();
    this.InitCallBacks();
    this.tab?.SetActiveTab("video");
  },
  __finalize(): void {
    log.info("Finalize");
  },
  InitControls(): void {
    log.info("Init controls");

    this.SetWndRect(new Frect().set(0, 0, 1024, 768));
    this.Enable(true);

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));

    xml.InitStatic("background", this);
    this.dialog = xml.InitStatic("main_dialog:dialog", this);

    // --    xml.InitStatic                ("main_dialog:cap_options", this.dialog)

    this.dlg_video = create_xr_class_instance(OptionsVideo);
    this.dlg_video.InitControls(0, 0, xml, this);
    this.dlg_video.Show(false);
    this.dialog.AttachChild(this.dlg_video);
    xml.InitWindow("tab_size", 0, this.dlg_video);

    this.dlg_sound = create_xr_class_instance(OptionsSound);
    this.dlg_sound.InitControls(0, 0, xml, this);
    this.dlg_sound.Show(false);
    this.dialog.AttachChild(this.dlg_sound);
    xml.InitWindow("tab_size", 0, this.dlg_sound);

    this.dlg_gameplay = create_xr_class_instance(OptionsGameplay);
    this.dlg_gameplay.InitControls(0, 0, xml, this);
    this.dlg_gameplay.Show(false);
    this.dialog.AttachChild(this.dlg_gameplay);
    xml.InitWindow("tab_size", 0, this.dlg_gameplay);

    this.dlg_controls = create_xr_class_instance(OptionsControls);
    this.dlg_controls.InitControls(0, 0, xml, this);
    this.dlg_controls.Show(false);
    this.dialog.AttachChild(this.dlg_controls);
    xml.InitWindow("tab_size", 0, this.dlg_controls);

    /*
      this.dlg_con_cmd            = ui_mm_opt_con_cmd.opt_con_cmd()
      this.dlg_con_cmd.InitControls(0,0, xml, this)
      this.dlg_con_cmd.Show        (false)
      this.dialog.AttachChild        (this.dlg_con_cmd)
      xml.InitWindow                ("tab_size", 0, this.dlg_con_cmd)
    */

    this.dlg_video_adv = create_xr_class_instance(OptionsVideoAdvanced);
    this.dlg_video_adv.InitControls(0, 0, xml, this);
    this.dlg_video_adv.Show(false);
    this.dialog.AttachChild(this.dlg_video_adv);
    xml.InitWindow("tab_size", 0, this.dlg_video_adv);

    this.Register(xml.Init3tButton("main_dialog:btn_accept", this.dialog), "btn_accept");
    this.Register(xml.Init3tButton("main_dialog:btn_cancel", this.dialog), "btn_cancel");

    this.tab = xml.InitTab("main_dialog:tab", this.dialog);
    this.Register(this.tab, "tab");

    this.message_box = new CUIMessageBoxEx();
    this.b_restart_system_shown = false;

    this.cap_download = xml.InitStatic("download_static", this);
    this.text_download = xml.InitStatic("download_text", this);
    this.download_progress = xml.InitProgressBar("progress_download", this);
    this.btn_cancel_download = xml.Init3tButton("btn_cancel_download", this);
    this.Register(this.btn_cancel_download, "btn_cancel_download");
  },
  SetCurrentValues(): void {
    log.info("Set current values");

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
  },
  UpdateDependControls(): void {
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
  },
  InitCallBacks(): void {
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
  },
  OnBtnCheckUpdates(): void {
    const console: XR_CConsole = get_console();

    console.execute("check_for_updates 1");
  },
  OnBtnKeybDefault(): void {
    const console: XR_CConsole = get_console();

    console.execute("default_controls");

    const opt: XR_COptionsManager = new COptionsManager();

    opt.SetCurrentValues(option_groups.mm_opt_controls);
    opt.SetCurrentValues(option_groups.key_binding);
  },
  OnPresetChanged(): void {
    const opt: XR_COptionsManager = new COptionsManager();

    opt.SetCurrentValues(option_groups.mm_opt_video_adv);
  },
  OnBtnDefGraph(): void {
    const opt: XR_COptionsManager = new COptionsManager();

    opt.SendMessage2Group(option_groups.mm_opt_video, option_groups_messages.set_default_value);
  },
  OnBtnDefSound(): void {
    const opt: XR_COptionsManager = new COptionsManager();

    opt.SendMessage2Group(option_groups.mm_opt_video, option_groups_messages.set_default_value);
  },
  OnBtnAccept(): void {
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
  },
  OnBtnCancel(): void {
    const opt: XR_COptionsManager = new COptionsManager();

    opt.UndoGroup(option_groups.mm_opt_video_preset);
    opt.UndoGroup(option_groups.mm_opt_video);
    opt.UndoGroup(option_groups.mm_opt_video_adv);
    opt.UndoGroup(option_groups.mm_opt_sound);
    opt.OptionsPostAccept();

    this.owner.ShowDialog(true);
    this.HideDialog();
    this.owner.Show(true);
  },
  OnTabChange(): void {
    this.dlg_video.Show(false);
    this.dlg_sound.Show(false);
    this.dlg_gameplay.Show(false);
    this.dlg_controls.Show(false);
    this.dlg_video_adv.Show(false);

    // todo: Use constants for JSX and checks.
    const id: string = this.tab.GetActiveId();

    if (id === "video") {
      this.dlg_video.Show(true);
    } else if (id === "sound") {
      this.dlg_sound.Show(true);
    } else if (id === "gameplay") {
      this.dlg_gameplay.Show(true);
    } else if (id === "controls") {
      this.dlg_controls.Show(true);
    }
  },
  OnBtnAdvGraphic(): void {
    log.info("Show advanced graphics");
    this.dlg_video.Show(false);
    this.dlg_video_adv.Show(true);
  },
  OnSimplyGraphic(): void {
    log.info("Show simplified graphics");
    this.dlg_video.Show(true);
    this.dlg_video_adv.Show(false);
  },
  OnKeyboard(key: TXR_DIK_key, event: TXR_ui_event): boolean {
    const res: boolean = CUIScriptWnd.OnKeyboard(this, key, event);

    if (!res) {
      if (event === ui_events.WINDOW_KEY_PRESSED) {
        if (key === DIK_keys.DIK_ESCAPE) {
          if (this.dlg_video_adv.IsShown()) {
            this.dlg_video_adv.Show(false);
            this.dlg_video.Show(true);
          } else {
            this.owner.ShowDialog(true);
            this.HideDialog();
            this.owner.Show(true);
          }
        }
      }
    }

    return res;
  },
  Update(): void {
    CUIScriptWnd.Update(this);

    const mainMenu: XR_CMainMenu = main_menu.get_main_menu();
    const patchDownload: XR_Patch_Dawnload_Progress = mainMenu.GetPatchProgress();
    const patchProgress: number = patchDownload.GetProgress();
    const filename: string = patchDownload.GetFlieName();

    if (filename && patchProgress && patchProgress >= 0 && patchProgress <= 100) {
      this.text_download.Show(true);
      this.cap_download.Show(true);
      this.download_progress.Show(true);

      this.download_progress.SetProgressPos(patchProgress);

      const str: string = lua_string.format("%.0f%%(%s)", patchProgress, patchDownload.GetFlieName());

      this.text_download.TextControl().SetText(str);
      this.btn_cancel_download.Show(true);
    } else {
      this.text_download.Show(false);
      this.cap_download.Show(false);
      this.download_progress.Show(false);
      this.btn_cancel_download.Show(false);
    }
  },
  OnBtn_CancelDownload(): void {
    log.info("Cancel patch download");

    const mainMenu: XR_CMainMenu = main_menu.get_main_menu();

    mainMenu.CancelDownload();
  }
} as IOptionsDialog);
