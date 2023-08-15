import {
  CScriptXmlInit,
  CUI3tButton,
  CUIScriptWnd,
  CUIScrollView,
  CUIWindow,
  DIK_keys,
  Frect,
  LuabindClass,
  ui_events,
} from "xray16";

import { EDebugSection, sectionsMap } from "@/engine/core/ui/debug/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { TKeyCode, TPath, TUIEvent } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\debug\\DebugDialog.component";

/**
 * todo;
 */
@LuabindClass()
export class DebugDialog extends CUIScriptWnd {
  public xml!: CScriptXmlInit;
  public sectionsList: LuaTable<EDebugSection, CUIWindow> = new LuaTable();

  public owner: CUIScriptWnd;
  public uiScrollList!: CUIScrollView;
  public uiCancelButton!: CUI3tButton;

  public constructor(owner: CUIScriptWnd) {
    super();

    this.owner = owner;

    this.SetWindowName(DebugDialog.__name);

    this.initControls();
    this.initCallBacks();
    this.initState();
  }

  /**
   * todo: Description.
   */
  public initControls(): void {
    this.SetWndRect(new Frect().set(0, 0, gameConfig.UI.BASE_WIDTH, gameConfig.UI.BASE_HEIGHT));
    this.Enable(true);

    this.xml = resolveXmlFile(base);

    this.xml.InitStatic("background", this);
    this.xml.InitStatic("section_background", this);
    this.xml.InitStatic("frame_menu_background", this);

    this.uiScrollList = this.xml.InitScrollView("frame_menu_scroll", this);
    this.uiCancelButton = this.xml.Init3tButton("cancel_button", this);

    // Add section switchers.
    Object.entries(EDebugSection)
      .sort(([a], [b]) => ((a as unknown as number) > (b as unknown as number) ? 1 : -1))
      .forEach(([, it]) => {
        const element: CUI3tButton = this.xml.Init3tButton("frame_menu_item", null);

        element.SetText(it);
        element.SetAutoDelete(true);

        this.uiScrollList.AddWindow(element, true);
        this.Register(element, "section_" + it);
      });

    this.Register(this.uiCancelButton, "cancel_button");
  }

  /**
   * todo: Description.
   */
  public initCallBacks(): void {
    this.AddCallback("cancel_button", ui_events.BUTTON_CLICKED, () => this.onCancelButtonAction(), this);

    for (const [k, it] of pairs(EDebugSection)) {
      this.AddCallback("section_" + it, ui_events.BUTTON_CLICKED, () => this.onSectionSwitchClicked(it), this);
    }
  }

  /**
   * todo: Description.
   */
  public initState(): void {
    Object.entries(sectionsMap).forEach(([section, factory]) => {
      logger.info("Construct new section component:", section);

      const sectionComponent: CUIWindow = factory(this);

      sectionComponent.SetAutoDelete(true);
      sectionComponent.Show(false);

      this.AttachChild(sectionComponent);

      this.xml.InitWindow("section", 0, sectionComponent);
      this.sectionsList.set(section as EDebugSection, sectionComponent);
    });

    this.onSectionSwitchClicked(EDebugSection.GENERAL);
  }

  /**
   * todo: Description.
   */
  public onCancelButtonAction(): void {
    this.owner.ShowDialog(true);
    this.owner.Show(true);

    this.HideDialog();
  }

  /**
   * todo: Description.
   */
  public onSectionSwitchClicked(section: EDebugSection): void {
    for (const [it, component] of this.sectionsList) {
      if (it === section) {
        component.Show(true);
      } else {
        component.Show(false);
      }
    }
  }

  /**
   * todo: Description.
   */
  public override OnKeyboard(key: TKeyCode, event: TUIEvent): boolean {
    const result: boolean = super.OnKeyboard(key, event);

    if (event === ui_events.WINDOW_KEY_PRESSED) {
      if (key === DIK_keys.DIK_ESCAPE) {
        this.onCancelButtonAction();
      }
    }

    return result;
  }
}
