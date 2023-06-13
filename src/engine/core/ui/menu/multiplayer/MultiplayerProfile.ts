import {
  CScriptXmlInit,
  CUI3tButton,
  CUIComboBox,
  CUIEditBox,
  CUIMessageBoxEx,
  CUIScrollView,
  CUIStatic,
  CUITextWnd,
  CUIWindow,
  game,
  login_operation_cb,
  LuabindClass,
  profile,
  suggest_nicks_cb,
  ui_events,
  vector2,
} from "xray16";

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer/MultiplayerMenu";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isWideScreen, resolveXmlFormPath } from "@/engine/core/utils/ui";
import { Optional, TName, TPath, Vector2D } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const base: TPath = "menu\\multiplayer\\MultiplayerAwards.component";
const awardsXml: CScriptXmlInit = new CScriptXmlInit();

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerProfile extends CUIWindow {
  public awards: LuaTable<number, LuaTable<string, CUIStatic>> = new LuaTable();

  public xml!: CScriptXmlInit;
  public owner!: MultiplayerMenu;

  public uiAwardsWindow!: CUIWindow;
  public uiBestResultsList!: CUIWindow;
  public uiGsChangeNickMbCancel!: CUIMessageBoxEx;
  public uiGsChangeNicMb!: CUIMessageBoxEx;
  public uiEditUniqueNick!: CUIEditBox;
  public uiAvailableButton!: CUI3tButton;
  public uiComboAvalUniqueNick!: CUIComboBox;
  public uiAwardsList!: CUIScrollView;

  public constructor() {
    super();
    awardsXml.ParseFile(resolveXmlFormPath(base));
  }

  public initControls(x: number, y: number, xml: CScriptXmlInit, handler: MultiplayerMenu): void {
    this.owner = handler;
    this.xml = xml;
    this.awards = new LuaTable();

    this.SetAutoDelete(true);
    xml.InitWindow("tab_profile:main", 0, this);

    xml.InitStatic("tab_profile:cap_unique_nick", this);
    this.uiEditUniqueNick = xml.InitEditBox("tab_profile:edit_unique_nick", this);
    this.owner.Register(this.uiEditUniqueNick, "edit_unique_nick");
    this.owner.AddCallback("edit_unique_nick", ui_events.EDIT_TEXT_COMMIT, () => this.onEditUniqueNickChanged(), this);

    this.uiAvailableButton = xml.Init3tButton("tab_profile:button_avaliability", this);
    this.owner.Register(this.uiAvailableButton, "btn_avail");
    this.owner.AddCallback("btn_avail", ui_events.BUTTON_CLICKED, () => this.onEditUniqueNickChanged(), this);

    this.uiComboAvalUniqueNick = xml.InitComboBox("tab_profile:combo_aval_unique_nick", this);
    this.owner.Register(this.uiComboAvalUniqueNick, "combo_aval_unique_nick");
    this.owner.AddCallback("combo_aval_unique_nick", ui_events.LIST_ITEM_SELECT, () => this.onUniqueNickSelect(), this);
    this.owner.AddCallback(
      "combo_aval_unique_nick",
      ui_events.WINDOW_LBUTTON_DOWN,
      () => this.onUniqueNickSelect(),
      this
    );
    this.uiComboAvalUniqueNick.Show(false);

    this.uiAwardsWindow = new CUIWindow();
    xml.InitWindow("tab_profile:awards_list", 0, this.uiAwardsWindow);
    this.uiAwardsWindow.SetAutoDelete(true);
    this.AttachChild(this.uiAwardsWindow);

    xml.InitFrameLine("tab_profile:awards_list:header", this.uiAwardsWindow);
    xml.InitFrame("tab_profile:awards_list:frame", this.uiAwardsWindow);

    this.uiAwardsList = xml.InitScrollView("tab_profile:awards_list:list", this.uiAwardsWindow);

    // -- this.hint_wnd = xml.InitHint("tab_profile:hint_wnd", this)

    this.uiBestResultsList = new CUIWindow();
    xml.InitWindow("tab_profile:best_results_list", 0, this.uiBestResultsList);
    this.uiBestResultsList.SetAutoDelete(true);
    this.AttachChild(this.uiBestResultsList);

    xml.InitFrameLine("tab_profile:best_results_list:header", this.uiBestResultsList);
    xml.InitFrame("tab_profile:best_results_list:frame", this.uiBestResultsList);

    xml.InitStatic("tab_profile:best_results_list:cap_cscore_0", this.uiBestResultsList);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_1", this.uiBestResultsList);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_2", this.uiBestResultsList);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_3", this.uiBestResultsList);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_4", this.uiBestResultsList);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_5", this.uiBestResultsList);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_6", this.uiBestResultsList);

    this.uiGsChangeNickMbCancel = new CUIMessageBoxEx();
    this.owner.Register(this.uiGsChangeNickMbCancel, "gs_change_nick_mb_cancel");
    this.owner.AddCallback(
      "gs_change_nick_mb_cancel",
      ui_events.BUTTON_CLICKED,
      () => this.onCancelChangeUnick(),
      this
    );
    this.uiGsChangeNickMbCancel.InitMessageBox("message_box_gs_info");

    this.uiGsChangeNicMb = new CUIMessageBoxEx();
    this.owner.Register(this.uiGsChangeNicMb, "gs_change_nick_mb");
    this.uiGsChangeNicMb.InitMessageBox("message_box_ok");
  }

  public InitBestScores(): void {
    logger.info("Init best scores");

    if (this.owner.owner.xrProfileStore !== null) {
      for (const it of this.owner.owner.xrProfileStore.get_best_scores()) {
        const scoresWindow: CUITextWnd = this.xml.InitTextWnd(
          "tab_profile:best_results_list:cap_score_" + tostring(it.first),
          this.uiBestResultsList
        );

        this.xml.InitTextWnd("tab_profile:best_results_list:cap_cscore_" + tostring(it.first), this.uiBestResultsList);
        scoresWindow.SetText(tostring(it.second));
      }
    } else {
      abort("Profile not loaded!");
    }
  }

  public onEditUniqueNickChanged(): void {
    this.uiGsChangeNickMbCancel.SetText("ui_mp_gamespy_suggesting_unique_name");
    this.uiGsChangeNickMbCancel.ShowDialog(true);
    this.owner.owner.xrAccountManager.suggest_unique_nicks(
      this.uiEditUniqueNick.GetText(),
      new suggest_nicks_cb(this, (result, description) => this.onNickSuggestionComplete(result, description))
    );
    this.uiComboAvalUniqueNick.Show(true);
    this.uiComboAvalUniqueNick.ClearList();
  }

  public onCancelChangeUnick(): void {
    this.owner.owner.xrAccountManager.stop_suggest_unique_nicks();
    this.uiGsChangeNickMbCancel.HideDialog();
    this.uiEditUniqueNick.SetText(this.owner.owner.xrGameSpyProfile!.unique_nick());
  }

  public updateControls(): void {
    // Nothing.
  }

  public onUniqueNickSelect(): void {
    this.uiEditUniqueNick.SetText(this.uiComboAvalUniqueNick.GetText());
  }

  public onChangeNickOperationResult(profile: Optional<profile>, description: string): void {
    this.uiGsChangeNicMb.HideDialog();
    this.uiComboAvalUniqueNick.Show(false);
    this.uiGsChangeNicMb.InitMessageBox("message_box_ok");

    if (profile === null) {
      this.uiGsChangeNicMb.SetText(description);
    } else {
      this.uiGsChangeNicMb.SetText(
        game.translate_string("ui_st_mp_unique_nickname_change") + " " + profile.unique_nick() + "."
      );
    }

    this.uiEditUniqueNick.SetText(this.owner.owner.xrGameSpyProfile!.unique_nick());
    this.uiGsChangeNicMb.ShowDialog(true);
  }

  public onNickSuggestionComplete(result: number, desctiption: string) {
    this.uiGsChangeNickMbCancel.HideDialog();

    const newUniqueNick: string = this.uiEditUniqueNick.GetText();
    let index: number = 1;

    for (const it of this.owner.owner.xrAccountManager.get_suggested_unicks()) {
      if (it === newUniqueNick) {
        this.uiGsChangeNicMb.InitMessageBox("message_box_gs_changing_unick");
        this.uiGsChangeNicMb.SetText("ui_mp_gamespy_changing_unique_nick");
        this.uiGsChangeNicMb.ShowDialog(true);
        this.owner.owner.xrLoginManager.set_unique_nick(
          newUniqueNick,
          new login_operation_cb(this, (profile: Optional<profile>, description: string) => {
            this.onChangeNickOperationResult(profile, description);
          })
        );

        return;
      }

      this.uiComboAvalUniqueNick.AddItem(it, index);
      index += 1;
    }

    this.uiGsChangeNicMb.InitMessageBox("message_box_ok");

    const firstName: TName = this.uiComboAvalUniqueNick.GetTextOf(0);

    this.uiComboAvalUniqueNick.SetText(firstName);

    if (result > 0) {
      this.uiGsChangeNicMb.SetText("ui_mp_gamespy_verify_nickname_error1");
    } else {
      this.uiGsChangeNicMb.SetText(desctiption);
    }

    this.uiEditUniqueNick.SetText(this.owner.owner.xrGameSpyProfile!.unique_nick());
    this.uiGsChangeNicMb.ShowDialog(true);
  }

  public fillRewardsTable() {
    if (this.owner.owner.xrProfileStore !== null) {
      const pos: Vector2D = new vector2().set(0, 0);

      let field: number = 1;
      let index: number = 1;

      for (const it of this.owner.owner.xrProfileStore.get_awards()) {
        const k: number = math.fmod(index, 3);

        if (k === 1) {
          field = field + 1;

          const fieldStatic: CUIStatic = this.xml.InitStatic("tab_profile:awards_list:field", null);

          this.awards.set(field, $fromObject<TName, CUIStatic>({ field: fieldStatic }));
          this.uiAwardsList.AddWindow(fieldStatic, true);
        }

        const awardName: string = "award_" + k;
        const rewardName: string = "reward_" + it.first;

        let awardXmlName: string = "";

        if (it.second.m_count > 0) {
          awardXmlName = "award_" + it.first + "_active";
          // --                award_xml_name        = "award_0_active"
          this.awards
            .get(field)
            .set(awardName, awardsXml.InitStatic(awardXmlName, this.awards.get(field).get("field")));

          const rewardsCount: CUITextWnd = awardsXml.InitTextWnd(
            awardXmlName + ".cap_count",
            this.awards.get(field).get(awardName)
          );

          rewardsCount.SetText(tostring(it.second.m_count));
        } else {
          awardXmlName = "award_" + it.first + "_inactive";
          // --                award_xml_name        = "award_0_inactive"
          this.awards
            .get(field)
            .set(awardName, awardsXml.InitStatic(awardXmlName, this.awards.get(field).get("field")));
        }

        let tmp: number = 0;

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

        this.awards.get(field).get(awardName).SetWndPos(pos);
        index += 1;
      }
    } else {
      abort("Profile not loaded!");
    }
  }
}
