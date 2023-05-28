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

const base: TPath = "menu\\multiplayer\\MultiplayerAwards.component";
const logger: LuaLogger = new LuaLogger($filename);
const awardsXml: CScriptXmlInit = new CScriptXmlInit();

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerProfile extends CUIWindow {
  public awards: LuaTable<number, LuaTable<string, CUIStatic>> = new LuaTable();

  public xml!: CScriptXmlInit;
  public owner!: MultiplayerMenu;

  public awardsWindow!: CUIWindow;
  public bestResultsList!: CUIWindow;
  public gsChangeNickMbCancel!: CUIMessageBoxEx;
  public gsChangeNicMb!: CUIMessageBoxEx;
  public editUniqueNick!: CUIEditBox;
  public availableButton!: CUI3tButton;
  public comboAvalUniqueNick!: CUIComboBox;
  public awardsList!: CUIScrollView;

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
    this.editUniqueNick = xml.InitEditBox("tab_profile:edit_unique_nick", this);
    this.owner.Register(this.editUniqueNick, "edit_unique_nick");
    this.owner.AddCallback("edit_unique_nick", ui_events.EDIT_TEXT_COMMIT, () => this.onEditUniqueNickChanged(), this);

    this.availableButton = xml.Init3tButton("tab_profile:button_avaliability", this);
    this.owner.Register(this.availableButton, "btn_avail");
    this.owner.AddCallback("btn_avail", ui_events.BUTTON_CLICKED, () => this.onEditUniqueNickChanged(), this);

    this.comboAvalUniqueNick = xml.InitComboBox("tab_profile:combo_aval_unique_nick", this);
    this.owner.Register(this.comboAvalUniqueNick, "combo_aval_unique_nick");
    this.owner.AddCallback("combo_aval_unique_nick", ui_events.LIST_ITEM_SELECT, () => this.onUniqueNickSelect(), this);
    this.owner.AddCallback(
      "combo_aval_unique_nick",
      ui_events.WINDOW_LBUTTON_DOWN,
      () => this.onUniqueNickSelect(),
      this
    );
    this.comboAvalUniqueNick.Show(false);

    this.awardsWindow = new CUIWindow();
    xml.InitWindow("tab_profile:awards_list", 0, this.awardsWindow);
    this.awardsWindow.SetAutoDelete(true);
    this.AttachChild(this.awardsWindow);

    xml.InitFrameLine("tab_profile:awards_list:header", this.awardsWindow);
    xml.InitFrame("tab_profile:awards_list:frame", this.awardsWindow);

    this.awardsList = xml.InitScrollView("tab_profile:awards_list:list", this.awardsWindow);

    // -- this.hint_wnd = xml.InitHint("tab_profile:hint_wnd", this)

    this.bestResultsList = new CUIWindow();
    xml.InitWindow("tab_profile:best_results_list", 0, this.bestResultsList);
    this.bestResultsList.SetAutoDelete(true);
    this.AttachChild(this.bestResultsList);

    xml.InitFrameLine("tab_profile:best_results_list:header", this.bestResultsList);
    xml.InitFrame("tab_profile:best_results_list:frame", this.bestResultsList);

    xml.InitStatic("tab_profile:best_results_list:cap_cscore_0", this.bestResultsList);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_1", this.bestResultsList);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_2", this.bestResultsList);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_3", this.bestResultsList);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_4", this.bestResultsList);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_5", this.bestResultsList);
    xml.InitStatic("tab_profile:best_results_list:cap_cscore_6", this.bestResultsList);

    this.gsChangeNickMbCancel = new CUIMessageBoxEx();
    this.owner.Register(this.gsChangeNickMbCancel, "gs_change_nick_mb_cancel");
    this.owner.AddCallback(
      "gs_change_nick_mb_cancel",
      ui_events.BUTTON_CLICKED,
      () => this.onCancelChangeUnick(),
      this
    );
    this.gsChangeNickMbCancel.InitMessageBox("message_box_gs_info");

    this.gsChangeNicMb = new CUIMessageBoxEx();
    this.owner.Register(this.gsChangeNicMb, "gs_change_nick_mb");
    this.gsChangeNicMb.InitMessageBox("message_box_ok");
  }

  public InitBestScores(): void {
    logger.info("Init best scores");

    if (this.owner.owner.xrProfileStore !== null) {
      for (const it of this.owner.owner.xrProfileStore.get_best_scores()) {
        const scoresWindow: CUITextWnd = this.xml.InitTextWnd(
          "tab_profile:best_results_list:cap_score_" + tostring(it.first),
          this.bestResultsList
        );

        this.xml.InitTextWnd("tab_profile:best_results_list:cap_cscore_" + tostring(it.first), this.bestResultsList);
        scoresWindow.SetText(tostring(it.second));
      }
    } else {
      abort("Profile not loaded!");
    }
  }

  public onEditUniqueNickChanged(): void {
    this.gsChangeNickMbCancel.SetText("ui_mp_gamespy_suggesting_unique_name");
    this.gsChangeNickMbCancel.ShowDialog(true);
    this.owner.owner.xrAccountManager.suggest_unique_nicks(
      this.editUniqueNick.GetText(),
      new suggest_nicks_cb(this, (result, description) => this.onNickSuggestionComplete(result, description))
    );
    this.comboAvalUniqueNick.Show(true);
    this.comboAvalUniqueNick.ClearList();
  }

  public onCancelChangeUnick(): void {
    this.owner.owner.xrAccountManager.stop_suggest_unique_nicks();
    this.gsChangeNickMbCancel.HideDialog();
    this.editUniqueNick.SetText(this.owner.owner.xrGameSpyProfile!.unique_nick());
  }

  public updateControls(): void {
    // Nothing.
  }

  public onUniqueNickSelect(): void {
    this.editUniqueNick.SetText(this.comboAvalUniqueNick.GetText());
  }

  public onChangeNickOperationResult(profile: Optional<profile>, description: string): void {
    this.gsChangeNicMb.HideDialog();
    this.comboAvalUniqueNick.Show(false);
    this.gsChangeNicMb.InitMessageBox("message_box_ok");

    if (profile === null) {
      this.gsChangeNicMb.SetText(description);
    } else {
      this.gsChangeNicMb.SetText(
        game.translate_string("ui_st_mp_unique_nickname_change") + " " + profile.unique_nick() + "."
      );
    }

    this.editUniqueNick.SetText(this.owner.owner.xrGameSpyProfile!.unique_nick());
    this.gsChangeNicMb.ShowDialog(true);
  }

  public onNickSuggestionComplete(result: number, desctiption: string) {
    this.gsChangeNickMbCancel.HideDialog();

    const newUniqueNick: string = this.editUniqueNick.GetText();
    let index: number = 1;

    for (const it of this.owner.owner.xrAccountManager.get_suggested_unicks()) {
      if (it === newUniqueNick) {
        this.gsChangeNicMb.InitMessageBox("message_box_gs_changing_unick");
        this.gsChangeNicMb.SetText("ui_mp_gamespy_changing_unique_nick");
        this.gsChangeNicMb.ShowDialog(true);
        this.owner.owner.xrLoginManager.set_unique_nick(
          newUniqueNick,
          new login_operation_cb(this, (profile: Optional<profile>, description: string) => {
            this.onChangeNickOperationResult(profile, description);
          })
        );

        return;
      }

      this.comboAvalUniqueNick.AddItem(it, index);
      index += 1;
    }

    this.gsChangeNicMb.InitMessageBox("message_box_ok");

    const firstName = this.comboAvalUniqueNick.GetTextOf(0);

    this.comboAvalUniqueNick.SetText(firstName);

    if (result > 0) {
      this.gsChangeNicMb.SetText("ui_mp_gamespy_verify_nickname_error1");
    } else {
      this.gsChangeNicMb.SetText(desctiption);
    }

    this.editUniqueNick.SetText(this.owner.owner.xrGameSpyProfile!.unique_nick());
    this.gsChangeNicMb.ShowDialog(true);
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

          const fieldStatic = this.xml.InitStatic("tab_profile:awards_list:field", null);

          this.awards.set(field, $fromObject<TName, CUIStatic>({ field: fieldStatic }));
          this.awardsList.AddWindow(fieldStatic, true);
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

          const rewardsCount = awardsXml.InitTextWnd(
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

        this.awards.get(field).get(awardName).SetWndPos(pos);
        index += 1;
      }
    } else {
      abort("Profile not loaded!");
    }
  }
}
