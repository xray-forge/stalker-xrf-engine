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
  suggest_nicks_cb,
  ui_events,
} from "xray16";

import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer/MultiplayerMenu";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  EElementType,
  initializeElement,
  initializeStatics,
  isWideScreen,
  resolveXmlFile,
} from "@/engine/core/utils/ui";
import { create2dVector } from "@/engine/core/utils/vector";
import { Optional, Profile, TIndex, TLabel, TName, TPath, TSize, Vector2D } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const rewardsPath: TPath = "menu\\multiplayer\\MultiplayerAwards.component";

/**
 * Tab with information about multiplayer profile.
 */
@LuabindClass()
export class MultiplayerProfile extends CUIWindow {
  public awards: LuaTable<number, LuaTable<string, CUIStatic>> = new LuaTable();

  public owner!: MultiplayerMenu;
  public xml!: CScriptXmlInit;

  public uiAwardsWindow!: CUIWindow;
  public uiBestResultsWindow!: CUIWindow;
  public uiChangeNickMessageBoxCancel!: CUIMessageBoxEx;
  public uiChangeNicMessageBox!: CUIMessageBoxEx;

  public uiUniqueNickEditBox!: CUIEditBox;
  public uiAvailableButton!: CUI3tButton;
  public uiAvailableUniqueNickComboBox!: CUIComboBox;
  public uiAwardsList!: CUIScrollView;

  public constructor(owner: MultiplayerMenu) {
    super();

    this.owner = owner;
  }

  public initControls(x: number, y: number, xml: CScriptXmlInit, owner: MultiplayerMenu): void {
    logger.info("Initialize profile component");

    this.xml = xml;
    this.awards = new LuaTable();

    this.SetAutoDelete(true);

    this.uiAwardsWindow = new CUIWindow();
    xml.InitWindow("tab_profile:awards_list", 0, this.uiAwardsWindow);
    this.uiAwardsWindow.SetAutoDelete(true);
    this.AttachChild(this.uiAwardsWindow);

    this.uiAwardsList = initializeElement(xml, "tab_profile:awards_list:list", {
      type: EElementType.SCROLL_VIEW,
      base: this.uiAwardsWindow,
    });

    this.uiBestResultsWindow = new CUIWindow();
    xml.InitWindow("tab_profile:best_results_list", 0, this.uiBestResultsWindow);
    this.uiBestResultsWindow.SetAutoDelete(true);
    this.AttachChild(this.uiBestResultsWindow);

    xml.InitWindow("tab_profile:main", 0, this);
    xml.InitFrameLine("tab_profile:awards_list:header", this.uiAwardsWindow);
    xml.InitFrame("tab_profile:awards_list:frame", this.uiAwardsWindow);
    xml.InitFrameLine("tab_profile:best_results_list:header", this.uiBestResultsWindow);
    xml.InitFrame("tab_profile:best_results_list:frame", this.uiBestResultsWindow);

    initializeStatics(
      xml,
      this.uiBestResultsWindow,
      "tab_profile:cap_unique_nick",
      "tab_profile:best_results_list:cap_cscore_0",
      "tab_profile:best_results_list:cap_cscore_1",
      "tab_profile:best_results_list:cap_cscore_2",
      "tab_profile:best_results_list:cap_cscore_3",
      "tab_profile:best_results_list:cap_cscore_4",
      "tab_profile:best_results_list:cap_cscore_5",
      "tab_profile:best_results_list:cap_cscore_6"
    );

    this.uiUniqueNickEditBox = initializeElement(xml, "tab_profile:edit_unique_nick", {
      type: EElementType.EDIT_BOX,
      base: this,
      context: owner,
      handlers: {
        [ui_events.EDIT_TEXT_COMMIT]: () => this.onEditUniqueNickChanged(),
      },
    });

    this.uiAvailableButton = initializeElement(xml, "tab_profile:button_avaliability", {
      type: EElementType.BUTTON,
      base: this,
      context: owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onEditUniqueNickChanged(),
      },
    });

    this.uiAvailableUniqueNickComboBox = initializeElement(xml, "tab_profile:combo_aval_unique_nick", {
      type: EElementType.COMBO_BOX,
      base: this,
      context: owner,
      handlers: {
        [ui_events.LIST_ITEM_SELECT]: () => this.onUniqueNickSelect(),
        [ui_events.WINDOW_LBUTTON_DOWN]: () => this.onUniqueNickSelect(),
      },
    });
    this.uiAvailableUniqueNickComboBox.Show(false);

    this.uiChangeNickMessageBoxCancel = initializeElement(xml, "gs_change_nick_mb_cancel", {
      type: EElementType.MESSAGE_BOX_EX,
      base: this,
      context: owner,
      handlers: {
        [ui_events.BUTTON_CLICKED]: () => this.onCancelChangeUniqueNick(),
      },
    });
    this.uiChangeNickMessageBoxCancel.InitMessageBox("message_box_gs_info");

    this.uiChangeNicMessageBox = initializeElement(xml, "gs_change_nick_mb", {
      type: EElementType.MESSAGE_BOX_EX,
      base: this,
    });
    this.uiChangeNicMessageBox.InitMessageBox("message_box_ok");
  }

  /**
   * Initialize list with the best stats like count of kills by damage/type of kill etc.
   */
  public initializeBestScores(): void {
    logger.info("Initialize best scores statistics");

    if (!this.owner.owner.xrProfileStore) {
      abort("Profile not loaded, cannot initialize scores.");
    }

    for (const bestScore of this.owner.owner.xrProfileStore.get_best_scores()) {
      const scoresWindow: CUITextWnd = this.xml.InitTextWnd(
        "tab_profile:best_results_list:cap_score_" + tostring(bestScore.first),
        this.uiBestResultsWindow
      );

      scoresWindow.SetText(tostring(bestScore.second));
    }
  }

  public initializeRewardsTable(): void {
    if (!this.owner.owner.xrProfileStore) {
      abort("Profile not loaded in multiplayer menu.");
    }

    const xml: CScriptXmlInit = resolveXmlFile(rewardsPath);
    const position: Vector2D = create2dVector(0, 0);

    let field: TIndex = 1;
    let index: TIndex = 1;

    for (const it of this.owner.owner.xrProfileStore.get_awards()) {
      const column: TIndex = math.fmod(index, 3);

      if (column === 1) {
        field += 1;

        const fieldStatic: CUIStatic = this.xml.InitStatic("tab_profile:awards_list:field", null);

        this.awards.set(field, $fromObject<TName, CUIStatic>({ field: fieldStatic }));
        this.uiAwardsList.AddWindow(fieldStatic, true);
      }

      const awardName: string = "award_" + column;
      const rewardName: string = "reward_" + it.first;

      let awardXmlName: string = "";

      if (it.second.m_count > 0) {
        awardXmlName = "award_" + it.first + "_active";
        this.awards.get(field).set(awardName, xml.InitStatic(awardXmlName, this.awards.get(field).get("field")));

        const rewardsCount: CUITextWnd = xml.InitTextWnd(
          awardXmlName + ".cap_count",
          this.awards.get(field).get(awardName)
        );

        rewardsCount.SetText(tostring(it.second.m_count));
      } else {
        awardXmlName = "award_" + it.first + "_inactive";
        this.awards.get(field).set(awardName, xml.InitStatic(awardXmlName, this.awards.get(field).get("field")));
      }

      const tmp: TSize = isWideScreen() ? 96 + 16 : 121 + 21;

      position.x = column === 0 ? tmp * (3 - 1) : tmp * (column - 1);

      this.awards.get(field).get(awardName).SetWndPos(position);
      index += 1;
    }
  }

  public onEditUniqueNickChanged(): void {
    this.uiChangeNickMessageBoxCancel.SetText("ui_mp_gamespy_suggesting_unique_name");
    this.uiChangeNickMessageBoxCancel.ShowDialog(true);
    this.owner.owner.xrAccountManager.suggest_unique_nicks(
      this.uiUniqueNickEditBox.GetText(),
      new suggest_nicks_cb(this, (result, description) => this.onNickSuggestionComplete(result, description))
    );
    this.uiAvailableUniqueNickComboBox.Show(true);
    this.uiAvailableUniqueNickComboBox.ClearList();
  }

  public onCancelChangeUniqueNick(): void {
    this.owner.owner.xrAccountManager.stop_suggest_unique_nicks();
    this.uiChangeNickMessageBoxCancel.HideDialog();
    this.uiUniqueNickEditBox.SetText(this.owner.owner.xrGameSpyProfile!.unique_nick());
  }

  public onUniqueNickSelect(): void {
    this.uiUniqueNickEditBox.SetText(this.uiAvailableUniqueNickComboBox.GetText());
  }

  public onChangeNickOperationResult(profile: Optional<Profile>, description: TLabel): void {
    this.uiChangeNicMessageBox.HideDialog();
    this.uiAvailableUniqueNickComboBox.Show(false);
    this.uiChangeNicMessageBox.InitMessageBox("message_box_ok");

    this.uiChangeNicMessageBox.SetText(
      profile
        ? game.translate_string("ui_st_mp_unique_nickname_change") + " " + profile.unique_nick() + "."
        : description
    );

    this.uiUniqueNickEditBox.SetText(this.owner.owner.xrGameSpyProfile!.unique_nick());
    this.uiChangeNicMessageBox.ShowDialog(true);
  }

  public onNickSuggestionComplete(result: number, description: TLabel): void {
    this.uiChangeNickMessageBoxCancel.HideDialog();

    const newUniqueNick: TName = this.uiUniqueNickEditBox.GetText();

    let index: TIndex = 1;

    for (const it of this.owner.owner.xrAccountManager.get_suggested_unicks()) {
      if (it === newUniqueNick) {
        this.uiChangeNicMessageBox.InitMessageBox("message_box_gs_changing_unick");
        this.uiChangeNicMessageBox.SetText("ui_mp_gamespy_changing_unique_nick");
        this.uiChangeNicMessageBox.ShowDialog(true);
        this.owner.owner.xrLoginManager.set_unique_nick(
          newUniqueNick,
          new login_operation_cb(this, (profile: Optional<Profile>, description: TLabel) => {
            this.onChangeNickOperationResult(profile, description);
          })
        );

        return;
      }

      this.uiAvailableUniqueNickComboBox.AddItem(it, index);
      index += 1;
    }

    this.uiChangeNicMessageBox.InitMessageBox("message_box_ok");

    const firstName: TName = this.uiAvailableUniqueNickComboBox.GetTextOf(0);

    this.uiAvailableUniqueNickComboBox.SetText(firstName);
    this.uiChangeNicMessageBox.SetText(result > 0 ? "ui_mp_gamespy_verify_nickname_error1" : description);
    this.uiUniqueNickEditBox.SetText(this.owner.owner.xrGameSpyProfile!.unique_nick());
    this.uiChangeNicMessageBox.ShowDialog(true);
  }
}
