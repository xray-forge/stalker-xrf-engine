import {
  CScriptXmlInit,
  CUIScriptWnd,
  DIK_keys,
  Frect,
  LuabindClass,
  TXR_DIK_key,
  TXR_ui_event,
  ui_events,
  XR_CScriptXmlInit,
  XR_CUI3tButton,
  XR_CUIScriptWnd,
  XR_CUIStatic,
  XR_CUITabControl,
} from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { DebugCommandsSection } from "@/mod/scripts/ui/debug/DebugCommandsSection";
import { DebugGeneralSection } from "@/mod/scripts/ui/debug/DebugGeneralSection";
import { DebugPlayerSection } from "@/mod/scripts/ui/debug/DebugPlayerSection";
import { DevDebugItemsSection } from "@/mod/scripts/ui/debug/DevDebugItemsSection";
import { DevDebugPositionSection } from "@/mod/scripts/ui/debug/DevDebugPositionSection";
import { DevDebugSoundSection } from "@/mod/scripts/ui/debug/DevDebugSoundSection";
import { DevDebugSpawnSection } from "@/mod/scripts/ui/debug/DevDebugSpawnSection";
import { DevDebugUiSection } from "@/mod/scripts/ui/debug/DevDebugUiSection";
import { DevDebugWorldSection } from "@/mod/scripts/ui/debug/DevDebugWorldSection";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/ui";
import { EDebugSection } from "@/mod/ui/menu/debug/sections";

const base: string = "menu\\debug\\DebugDialog.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class DebugDialog extends CUIScriptWnd {
  public owner: XR_CUIScriptWnd;

  public sectionBackground!: XR_CUIStatic;
  public tab!: XR_CUITabControl;
  public cancelButton!: XR_CUI3tButton;

  public sectionGeneral!: DebugGeneralSection;
  public sectionCommands!: DebugCommandsSection;
  public sectionPosition!: DevDebugPositionSection;
  public sectionPlayer!: DebugPlayerSection;
  public sectionSound!: DevDebugSoundSection;
  public sectionSpawn!: DevDebugSpawnSection;
  public sectionItems!: DevDebugItemsSection;
  public sectionUi!: DevDebugUiSection;
  public sectionWorld!: DevDebugWorldSection;

  public constructor(owner: XR_CUIScriptWnd) {
    super();

    this.owner = owner;

    this.initControls();
    this.initSections();
    this.initCallBacks();
    this.initState();
  }

  /**
   * todo;
   */
  public initControls(): void {
    this.SetWndRect(new Frect().set(0, 0, gameConfig.UI.BASE_WIDTH, gameConfig.UI.BASE_HEIGHT));

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));
    xml.InitStatic("background", this);

    this.sectionBackground = xml.InitStatic("main_dialog:section_background", this);
    this.cancelButton = xml.Init3tButton("main_dialog:btn_cancel", this);
    this.tab = xml.InitTab("main_dialog:tab", this);

    this.Register(this.cancelButton, "btn_cancel");
    this.Register(this.tab, "tab");
  }

  /**
   * todo;
   */
  public initSections(): void {
    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));

    // Init general section.
    this.sectionGeneral = new DebugGeneralSection(this);
    this.sectionGeneral.SetAutoDelete(true);
    this.sectionGeneral.Show(false);
    this.AttachChild(this.sectionGeneral);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionGeneral);

    // Init commands section.
    this.sectionCommands = new DebugCommandsSection(this);
    this.sectionCommands.SetAutoDelete(true);
    this.sectionCommands.Show(false);
    this.AttachChild(this.sectionCommands);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionCommands);

    // Init items section.
    this.sectionItems = new DevDebugItemsSection(this);
    this.sectionItems.SetAutoDelete(true);
    this.sectionItems.Show(false);
    this.AttachChild(this.sectionItems);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionItems);

    // Init position section.
    this.sectionPosition = new DevDebugPositionSection(this);
    this.sectionPosition.SetAutoDelete(true);
    this.sectionPosition.Show(false);
    this.AttachChild(this.sectionPosition);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionPosition);

    // Init player section.
    this.sectionPlayer = new DebugPlayerSection(this);
    this.sectionPlayer.SetAutoDelete(true);
    this.sectionPlayer.Show(false);
    this.AttachChild(this.sectionPlayer);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionPlayer);

    // Init sound section.
    this.sectionSound = new DevDebugSoundSection(this);
    this.sectionSound.SetAutoDelete(true);
    this.sectionSound.Show(false);
    this.AttachChild(this.sectionSound);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionSound);

    // Init spawn section.
    this.sectionSpawn = new DevDebugSpawnSection(this);
    this.sectionSpawn.SetAutoDelete(true);
    this.sectionSpawn.Show(false);
    this.AttachChild(this.sectionSpawn);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionSpawn);

    // Init UI section.
    this.sectionUi = new DevDebugUiSection(this);
    this.sectionUi.SetAutoDelete(true);
    this.sectionUi.Show(false);
    this.AttachChild(this.sectionUi);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionUi);

    // Init world section.
    this.sectionWorld = new DevDebugWorldSection(this);
    this.sectionWorld.SetAutoDelete(true);
    this.sectionWorld.Show(false);
    this.AttachChild(this.sectionWorld);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionWorld);
  }

  /**
   * todo;
   */
  public initCallBacks(): void {
    this.AddCallback("btn_cancel", ui_events.BUTTON_CLICKED, () => this.onCancelButtonAction(), this);
    this.AddCallback("tab", ui_events.TAB_CHANGED, () => this.onTabChange(), this);
  }

  /**
   * todo;
   */
  public initState(): void {
    this.tab.SetActiveTab(EDebugSection.GENERAL);
  }

  /**
   * todo;
   */
  public onCancelButtonAction(): void {
    logger.info("Cancel action");

    this.owner.ShowDialog(true);
    this.owner.Show(true);

    this.HideDialog();
  }

  /**
   * todo;
   */
  public onTabChange(): void {
    logger.info("Tab change:", this.tab.GetActiveId());

    const id: string = this.tab.GetActiveId();

    this.sectionGeneral.Show(false);
    this.sectionCommands.Show(false);
    this.sectionCommands.Show(false);
    this.sectionItems.Show(false);
    this.sectionPosition.Show(false);
    this.sectionPlayer.Show(false);
    this.sectionSound.Show(false);
    this.sectionSpawn.Show(false);
    this.sectionUi.Show(false);
    this.sectionWorld.Show(false);

    if (id === EDebugSection.GENERAL) {
      this.sectionGeneral.Show(true);
    } else if (id === EDebugSection.COMMANDS) {
      this.sectionCommands.Show(true);
    } else if (id === EDebugSection.ITEMS) {
      this.sectionItems.Show(true);
    } else if (id === EDebugSection.POSITION) {
      this.sectionPosition.Show(true);
    } else if (id === EDebugSection.PLAYER) {
      this.sectionPlayer.Show(true);
    } else if (id === EDebugSection.SOUND) {
      this.sectionSound.Show(true);
    } else if (id === EDebugSection.SPAWN) {
      this.sectionSpawn.Show(true);
    } else if (id === EDebugSection.UI) {
      this.sectionUi.Show(true);
    } else if (id === EDebugSection.WORLD) {
      this.sectionWorld.Show(true);
    } else {
      logger.warn("Unknown section selected:", id);
    }
  }

  /**
   * todo;
   */
  public override OnKeyboard(key: TXR_DIK_key, event: TXR_ui_event): boolean {
    const result: boolean = super.OnKeyboard(key, event);

    if (event === ui_events.WINDOW_KEY_PRESSED) {
      if (key === DIK_keys.DIK_ESCAPE) {
        this.onCancelButtonAction();
      }
    }

    return result;
  }
}
