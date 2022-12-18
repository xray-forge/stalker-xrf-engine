import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";

export interface IUiDevDebugDialog extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  dialog: XR_CUIStatic;
  tab: XR_CUITabButton;

  __init(): void;

  InitControls(): void;
  InitCallBacks(): void;

  onCancelButtonAction(): void;
}

const log: DebugLogger = new DebugLogger("UiDevDebugDialog");
const base: string = "debug_tools/UiDevDebugDialog.component.xml";

export const UiDevDebugDialog: IUiDevDebugDialog = declare_xr_class(
  "UiDevDebugDialog",
  CUIScriptWnd,
  {
    __init(this: IUiDevDebugDialog): void {
      CUIScriptWnd.__init(this);
      this.InitControls();
      this.InitCallBacks();
    },
    __finalize(): void {
    },
    InitCallBacks(): void {
      log.info("Init callbacks");
      this.AddCallback("btn_cancel", ui_events.BUTTON_CLICKED, () => this.onCancelButtonAction(), this);
    },
    InitControls(): void {
      log.info("Init controls");

      this.SetWndRect(Frect().set(0, 0, 1024, 768));

      const xml: XR_CScriptXmlInit = new CScriptXmlInit();

      xml.ParseFile(base);
      xml.InitStatic("background", this);

      this.dialog = xml.InitStatic("main_dialog:dialog", this);

      this.Register(xml.Init3tButton("main_dialog:btn_cancel", this.dialog), "btn_cancel");
      this.Register(xml.InitTab("main_dialog:tab", this.dialog), "tab");

      /*
      this.form = xml.InitStatic("form", this);

      // xml.InitStatic            ("form:file_info", this.form)
      this.file_caption = xml.InitTextWnd("form:file_caption", this.form);
      this.file_data = xml.InitTextWnd("form:file_data", this.form);

      xml.InitFrame("form:list_frame", this.form);

      this.list_box = xml.InitListBox("form:list", this.form);

      this.list_box.ShowSelectedItem(true);
      this.Register(this.list_box, "list_window");

      const cancelButton = xml.Init3tButton("form:btn_cancel", this.form);

      this.Register(cancelButton, "button_back");

      /*
      this.message_box = new XR_CUIMessageBoxEx();
      this.Register(this.message_box,"message_box");

      this.cap_rubel = xml.InitStatic("form:cap_rubel", this.form);
      this.cap_spawn = xml.InitStatic("form:cap_spawn", this.form);
      this.cap_loc = xml.InitStatic("form:cap_loc", this.form);

      this.spin_rubel = xml.InitSpinNum("form:spin_rubel", this.form);
      this.spin_rubel.Show(true);

      this.cap_rubel_coeff = xml.InitStatic("form:cap_rubel_coeff", this.form);
      this.cap_rubel_coeff.TextControl().SetText(" " + tostring(1000) + " RU");

      this.cap_rubel_currently = xml.InitStatic("form:cap_rubel_currently", this.form);

      // if db.actor ~= nil then actor_money = db.actor:money() else actor_money = 0 end
      // this.RefreshMoneyDisplay()

      const moneyPlusButton = xml.Init3tButton("form:btn_moneyplus", this.form);
      const moneyMinusButton = xml.Init3tButton("form:btn_moneyminus", this.form);

      this.Register(moneyPlusButton, "button_moneyplus");
      this.Register(moneyMinusButton, "button_moneyminus");

      this.cap_timefactor        = xml.InitStatic("form:cap_timefactor",        this.form)

      this.cap_timefactor_currently    = xml.InitStatic("form:cap_timefactor_currently", this.form)
      if level.present() then time_factor = level.get_time_factor() else time_factor = 10 end

      this.cap_timefactor_desc    = xml.InitStatic("form:cap_timefactor_desc",    this.form)
      this.RefreshTimeFactorDisplay()

      btn                = xml.Init3tButton("form:btn_timeplus",        this.form)
      this.Register            (btn, "button_timeplus")
      btn                = xml.Init3tButton("form:btn_timeminus",    this.form)
      this.Register            (btn, "button_timeminus")

      this.spin_spawn            = xml.InitSpinNum("form:spin_spawn",        this.form)
      this.spin_spawn:Show        (true)

      btn                = xml.Init3tButton("form:btn_surge",        this.form)
      this.Register            (btn, "button_surge")

      btn                      = xml.InitCheck("form:check_wt",        self)
      this.Register        (btn, "check_wt")
      this.chek_weather = btn

      if db.actor then
      this.chek_weather:SetCheck(god.load_var("weather_state",false))
      end

      this.combo_renderer            = xml.InitComboBox("form:list_renderer",        self)
      this.Register                (this.combo_renderer, "combo_renderer")
      this.combo_renderer:AddItem         ("1. Weather",         1)
      this.combo_renderer:AddItem         ("2. Fast Travel Dialogs",        2)
      this.combo_renderer:AddItem         ("3. Stalkers",      3)
      this.combo_renderer:AddItem         ("4. Mutants",        4)
      this.combo_renderer:AddItem         ("5. Ammunition",      5)
      this.combo_renderer:AddItem         ("6. Weapons",         6)
      this.combo_renderer:AddItem         ("7. Med/Devices/Food",           7)
      this.combo_renderer:AddItem         ("8. Artifacts",      8)
      this.combo_renderer:AddItem         ("9. Outfits/Armour",          9)
      this.combo_renderer:AddItem         ("10. Quest Items",    10)
      this.combo_renderer:AddItem         ("11. Anomolys",    11)
      this.combo_renderer:AddItem         ("12. WorldI tems",       12)
      this.combo_renderer:AddItem         ("13. Community",  13)
      this.combo_renderer:AddItem         ("14. Videos",  14)
      this.combo_renderer:AddItem         ("15. Music",       15)
      this.combo_renderer:AddItem         ("16. Squads",       16)
      this.combo_renderer:AddItem         ("17. Teleportation", 17)

      -- ���� ������������ --
        this.dialog            = xml.InitStatic("dialog",            self)
      xml.InitStatic                ("dialog:capt", this.dialog)
      xml.InitStatic                ("dialog:msg2", this.dialog)
      xml.InitStatic                ("dialog:msg3", this.dialog)
      this.dialog:Show(false)

      -- ������
  this.Register(xml.Init3tButton("dialog:btn_1", this.dialog),"btn_1")
      this.Register(xml.Init3tButton("dialog:btn_2", this.dialog),"btn_2")
      this.Register(xml.Init3tButton("dialog:btn_3", this.dialog),"btn_3")
      this.Register(xml.Init3tButton("dialog:btn_4", this.dialog),"btn_4")
      this.Register(xml.Init3tButton("dialog:btn_5", this.dialog),"btn_5")

      btn = xml.InitEditBox("dialog:edit_box",    this.dialog)
      this.edit_box = btn
      this.Register(btn, "edit_box")

      btn = xml.InitEditBox("dialog:edit_box2",    this.dialog)
      this.edit_box2 = btn
      this.Register(btn, "edit_box2")

      btn = xml.InitEditBox("dialog:edit_box3",    this.dialog)
      this.edit_box3 = btn
      this.Register(btn, "edit_box3")

      btn = xml.InitEditBox("dialog:edit_box4",    this.dialog)
      this.edit_box4 = btn
      this.Register(btn, "edit_box4")

       */
    },
    onCancelButtonAction(): void {
      log.info("Cancel button activated");

      this.owner.ShowDialog(true);
      this.owner.Show(true);

      this.HideDialog();
    }
  } as IUiDevDebugDialog
);
