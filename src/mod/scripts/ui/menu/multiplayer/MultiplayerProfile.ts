import {
  CScriptXmlInit,
  CUIMessageBoxEx,
  CUIWindow,
  game,
  login_operation_cb,
  LuabindClass,
  suggest_nicks_cb,
  ui_events,
  vector2,
  XR_CScriptXmlInit,
  XR_CUI3tButton,
  XR_CUIComboBox,
  XR_CUIEditBox,
  XR_CUIMessageBoxEx,
  XR_CUIScrollView,
  XR_CUIStatic,
  XR_CUITextWnd,
  XR_CUIWindow,
  XR_profile,
  XR_vector2,
} from "xray16";

import { Optional } from "@/mod/lib/types";
import { MultiplayerMenu } from "@/mod/scripts/ui/menu/multiplayer/MultiplayerMenu";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { isWideScreen, resolveXmlFormPath } from "@/mod/scripts/utils/ui";

const base: string = "menu\\multiplayer\\MultiplayerAwards.component";
const logger: LuaLogger = new LuaLogger($filename);
const awards_xml: XR_CScriptXmlInit = new CScriptXmlInit();

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerProfile extends CUIWindow {
  public awards: LuaTable<number, LuaTable<string, XR_CUIStatic>> = new LuaTable();

  public xml!: XR_CScriptXmlInit;
  public owner!: MultiplayerMenu;

  public awards_window!: XR_CUIWindow;
  public best_results_list!: XR_CUIWindow;
  public gs_change_nick_mb_cancel!: XR_CUIMessageBoxEx;
  public gs_change_nick_mb!: XR_CUIMessageBoxEx;
  public edit_unique_nick!: XR_CUIEditBox;
  public btn_avail!: XR_CUI3tButton;
  public combo_aval_unique_nick!: XR_CUIComboBox;
  public awards_list!: XR_CUIScrollView;

  public constructor() {
    super();
    awards_xml.ParseFile(resolveXmlFormPath(base));
  }

  public InitControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: MultiplayerMenu): void {
    this.owner = handler;
    this.xml = xml;
    this.awards = new LuaTable();

    this.SetAutoDelete(true);
    xml.InitWindow("tab_profile:main", 0, this);

    xml.InitStatic("tab_profile:cap_unique_nick", this);
    this.edit_unique_nick = xml.InitEditBox("tab_profile:edit_unique_nick", this);
    this.owner.Register(this.edit_unique_nick, "edit_unique_nick");
    this.owner.AddCallback("edit_unique_nick", ui_events.EDIT_TEXT_COMMIT, () => this.OnEditUniqueNickChanged(), this);

    this.btn_avail = xml.Init3tButton("tab_profile:button_avaliability", this);
    this.owner.Register(this.btn_avail, "btn_avail");
    this.owner.AddCallback("btn_avail", ui_events.BUTTON_CLICKED, () => this.OnEditUniqueNickChanged(), this);

    this.combo_aval_unique_nick = xml.InitComboBox("tab_profile:combo_aval_unique_nick", this);
    this.owner.Register(this.combo_aval_unique_nick, "combo_aval_unique_nick");
    this.owner.AddCallback("combo_aval_unique_nick", ui_events.LIST_ITEM_SELECT, () => this.OnUniqueNickSelect(), this);
    this.owner.AddCallback(
      "combo_aval_unique_nick",
      ui_events.WINDOW_LBUTTON_DOWN,
      () => this.OnUniqueNickSelect(),
      this
    );
    this.combo_aval_unique_nick.Show(false);

    this.awards_window = new CUIWindow();
    xml.InitWindow("tab_profile:awards_list", 0, this.awards_window);
    this.awards_window.SetAutoDelete(true);
    this.AttachChild(this.awards_window);

    xml.InitFrameLine("tab_profile:awards_list:header", this.awards_window);
    xml.InitFrame("tab_profile:awards_list:frame", this.awards_window);

    this.awards_list = xml.InitScrollView("tab_profile:awards_list:list", this.awards_window);

    // -- this.hint_wnd = xml.InitHint("tab_profile:hint_wnd", this)

    this.best_results_list = new CUIWindow();
    xml.InitWindow("tab_profile:best_results_list", 0, this.best_results_list);
    this.best_results_list.SetAutoDelete(true);
    this.AttachChild(this.best_results_list);

    xml.InitFrameLine("tab_profile:best_results_list:header", this.best_results_list);
    xml.InitFrame("tab_profile:best_results_list:frame", this.best_results_list);

    xml.InitStatic("tab_profile:best_results_list:cap_cscore_0", this.best_results_list);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_1", this.best_results_list);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_2", this.best_results_list);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_3", this.best_results_list);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_4", this.best_results_list);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_5", this.best_results_list);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_6", this.best_results_list);

    this.gs_change_nick_mb_cancel = new CUIMessageBoxEx();
    this.owner.Register(this.gs_change_nick_mb_cancel, "gs_change_nick_mb_cancel");
    this.owner.AddCallback(
      "gs_change_nick_mb_cancel",
      ui_events.BUTTON_CLICKED,
      () => this.OnCancelChangeUnick(),
      this
    );
    this.gs_change_nick_mb_cancel.InitMessageBox("message_box_gs_info");

    this.gs_change_nick_mb = new CUIMessageBoxEx();
    this.owner.Register(this.gs_change_nick_mb, "gs_change_nick_mb");
    this.gs_change_nick_mb.InitMessageBox("message_box_ok");
  }

  public InitBestScores(): void {
    logger.info("Init best scores");

    if (this.owner.owner.xrProfileStore !== null) {
      for (const it of this.owner.owner.xrProfileStore.get_best_scores()) {
        const score_wnd: XR_CUITextWnd = this.xml.InitTextWnd(
          "tab_profile:best_results_list:cap_score_" + tostring(it.first),
          this.best_results_list
        );

        this.xml.InitTextWnd("tab_profile:best_results_list:cap_cscore_" + tostring(it.first), this.best_results_list);
        score_wnd.SetText(tostring(it.second));
      }
    } else {
      abort("Profile not loaded!");
    }
  }

  public OnEditUniqueNickChanged(): void {
    this.gs_change_nick_mb_cancel.SetText("ui_mp_gamespy_suggesting_unique_name");
    this.gs_change_nick_mb_cancel.ShowDialog(true);
    this.owner.owner.xrAccountManager.suggest_unique_nicks(
      this.edit_unique_nick.GetText(),
      new suggest_nicks_cb(this, (result, description) => this.OnNickSuggestionComplete(result, description))
    );
    this.combo_aval_unique_nick.Show(true);
    this.combo_aval_unique_nick.ClearList();
  }

  public OnCancelChangeUnick(): void {
    this.owner.owner.xrAccountManager.stop_suggest_unique_nicks();
    this.gs_change_nick_mb_cancel.HideDialog();
    this.edit_unique_nick.SetText(this.owner.owner.xrGameSpyProfile!.unique_nick());
  }

  public UpdateControls(): void {
    // Nothing.
  }

  public OnUniqueNickSelect(): void {
    this.edit_unique_nick.SetText(this.combo_aval_unique_nick.GetText());
  }

  public ChangeNickOperationResult(profile: Optional<XR_profile>, description: string): void {
    this.gs_change_nick_mb.HideDialog();
    this.combo_aval_unique_nick.Show(false);
    this.gs_change_nick_mb.InitMessageBox("message_box_ok");

    if (profile === null) {
      this.gs_change_nick_mb.SetText(description);
    } else {
      this.gs_change_nick_mb.SetText(
        game.translate_string("ui_st_mp_unique_nickname_change") + " " + profile.unique_nick() + "."
      );
    }

    this.edit_unique_nick.SetText(this.owner.owner.xrGameSpyProfile!.unique_nick());
    this.gs_change_nick_mb.ShowDialog(true);
  }

  public OnNickSuggestionComplete(result: number, desctiption: string) {
    this.gs_change_nick_mb_cancel.HideDialog();

    const new_unique_nick: string = this.edit_unique_nick.GetText();
    let index: number = 1;

    for (const it of this.owner.owner.xrAccountManager.get_suggested_unicks()) {
      if (it === new_unique_nick) {
        this.gs_change_nick_mb.InitMessageBox("message_box_gs_changing_unick");
        this.gs_change_nick_mb.SetText("ui_mp_gamespy_changing_unique_nick");
        this.gs_change_nick_mb.ShowDialog(true);
        this.owner.owner.xrLoginManager.set_unique_nick(
          new_unique_nick,
          new login_operation_cb(this, (profile: Optional<XR_profile>, description: string) => {
            this.ChangeNickOperationResult(profile, description);
          })
        );

        return;
      }

      this.combo_aval_unique_nick.AddItem(it, index);
      index += 1;
    }

    this.gs_change_nick_mb.InitMessageBox("message_box_ok");

    const first_name = this.combo_aval_unique_nick.GetTextOf(0);

    this.combo_aval_unique_nick.SetText(first_name);

    if (result > 0) {
      this.gs_change_nick_mb.SetText("ui_mp_gamespy_verify_nickname_error1");
    } else {
      this.gs_change_nick_mb.SetText(desctiption);
    }

    this.edit_unique_nick.SetText(this.owner.owner.xrGameSpyProfile!.unique_nick());
    this.gs_change_nick_mb.ShowDialog(true);
  }

  public FillRewardsTable() {
    if (this.owner.owner.xrProfileStore !== null) {
      const pos: XR_vector2 = new vector2().set(0, 0);

      let field: number = 1;
      let index: number = 1;

      for (const it of this.owner.owner.xrProfileStore.get_awards()) {
        const k: number = math.fmod(index, 3);

        if (k === 1) {
          field = field + 1;

          const fieldStatic = this.xml.InitStatic("tab_profile:awards_list:field", null);

          this.awards.set(field, { field: fieldStatic } as unknown as LuaTable<string, XR_CUIStatic>);
          this.awards_list.AddWindow(fieldStatic, true);
        }

        const award_name: string = "award_" + k;
        const reward_name: string = "reward_" + it.first;

        let award_xml_name: string = "";

        if (it.second.m_count > 0) {
          award_xml_name = "award_" + it.first + "_active";
          // --                award_xml_name        = "award_0_active"
          this.awards
            .get(field)
            .set(award_name, awards_xml.InitStatic(award_xml_name, this.awards.get(field).get("field")));

          const rewards_count = awards_xml.InitTextWnd(
            award_xml_name + ".cap_count",
            this.awards.get(field).get(award_name)
          );

          rewards_count.SetText(tostring(it.second.m_count));
        } else {
          award_xml_name = "award_" + it.first + "_inactive";
          // --                award_xml_name        = "award_0_inactive"
          this.awards
            .get(field)
            .set(award_name, awards_xml.InitStatic(award_xml_name, this.awards.get(field).get("field")));
        }

        let tmp = 0;

        if (isWideScreen()) {
          tmp = 96 + 16;
        } else {
          tmp = 121 + 21;
        }

        if (k === 0) {
          pos.x = tmp * (3 - 1);
        } else {
          pos.x = tmp * (k - 1);
        }

        this.awards.get(field).get(award_name).SetWndPos(pos);
        index += 1;
      }
    } else {
      abort("Profile not loaded!");
    }
  }
}
