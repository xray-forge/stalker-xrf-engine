import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { DebugCommandsSection, IDebugCommandsSection } from "@/mod/scripts/ui/debug/DebugCommandsSection";
import { DebugGeneralSection, IDebugGeneralSection } from "@/mod/scripts/ui/debug/DebugGeneralSection";
import { DebugPlayerSection, IDebugPlayerSection } from "@/mod/scripts/ui/debug/DebugPlayerSection";
import { DevDebugItemsSection, IDevDebugItemsSection } from "@/mod/scripts/ui/debug/DevDebugItemsSection";
import { DevDebugPositionSection, IDevDebugPositionSection } from "@/mod/scripts/ui/debug/DevDebugPositionSection";
import { DevDebugSoundSection, IDevDebugSoundSection } from "@/mod/scripts/ui/debug/DevDebugSoundSection";
import { DevDebugSpawnSection, IDevDebugSpawnSection } from "@/mod/scripts/ui/debug/DevDebugSpawnSection";
import { DevDebugUiSection, IDevDebugUiSection } from "@/mod/scripts/ui/debug/DevDebugUiSection";
import { DevDebugWorldSection, IDevDebugWorldSection } from "@/mod/scripts/ui/debug/DevDebugWorldSection";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/ui";
import { EDebugSection } from "@/mod/ui/debug/sections";

const base: string = "debug\\DebugDialog.component";
const log: LuaLogger = new LuaLogger("DebugDialog");

export interface IDebugDialog extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  sectionBackground: XR_CUIStatic;
  tab: XR_CUITabControl;
  cancelButton: XR_CUI3tButton;

  sectionGeneral: IDebugGeneralSection;
  sectionCommands: IDebugCommandsSection;
  sectionPosition: IDevDebugPositionSection;
  sectionPlayer: IDebugPlayerSection;
  sectionSound: IDevDebugSoundSection;
  sectionSpawn: IDevDebugSpawnSection;
  sectionItems: IDevDebugItemsSection;
  sectionUi: IDevDebugUiSection;
  sectionWorld: IDevDebugWorldSection;

  InitControls(): void;
  InitSections(): void;
  InitCallBacks(): void;
  InitState(): void;

  onTabChange(): void;
  onCancelButtonAction(): void;
}

export const DebugDialog: IDebugDialog = declare_xr_class("DebugDialog", CUIScriptWnd, {
  __init(this: IDebugDialog): void {
    xr_class_super();

    this.InitControls();
    this.InitSections();
    this.InitCallBacks();
    this.InitState();
  },
  __finalize(): void {
    log.info("Finalize");
  },
  InitControls(): void {
    log.info("Init controls");

    this.SetWndRect(new Frect().set(0, 0, gameConfig.UI.BASE_WIDTH, gameConfig.UI.BASE_HEIGHT));

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));
    xml.InitStatic("background", this);

    this.sectionBackground = xml.InitStatic("main_dialog:section_background", this);
    this.cancelButton = xml.Init3tButton("main_dialog:btn_cancel", this);
    this.tab = xml.InitTab("main_dialog:tab", this);

    this.Register(this.cancelButton, "btn_cancel");
    this.Register(this.tab, "tab");
  },
  InitSections(): void {
    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));

    // Init general section.
    this.sectionGeneral = create_xr_class_instance(DebugGeneralSection, this);
    this.sectionGeneral.SetAutoDelete(true);
    this.sectionGeneral.Show(false);
    this.AttachChild(this.sectionGeneral);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionGeneral);

    // Init commands section.
    this.sectionCommands = create_xr_class_instance(DebugCommandsSection, this);
    this.sectionCommands.SetAutoDelete(true);
    this.sectionCommands.Show(false);
    this.AttachChild(this.sectionCommands);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionCommands);

    // Init items section.
    this.sectionItems = create_xr_class_instance(DevDebugItemsSection, this);
    this.sectionItems.SetAutoDelete(true);
    this.sectionItems.Show(false);
    this.AttachChild(this.sectionItems);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionItems);

    // Init position section.
    this.sectionPosition = create_xr_class_instance(DevDebugPositionSection, this);
    this.sectionPosition.SetAutoDelete(true);
    this.sectionPosition.Show(false);
    this.AttachChild(this.sectionPosition);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionPosition);

    // Init player section.
    this.sectionPlayer = create_xr_class_instance(DebugPlayerSection, this);
    this.sectionPlayer.SetAutoDelete(true);
    this.sectionPlayer.Show(false);
    this.AttachChild(this.sectionPlayer);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionPlayer);

    // Init sound section.
    this.sectionSound = create_xr_class_instance(DevDebugSoundSection, this);
    this.sectionSound.SetAutoDelete(true);
    this.sectionSound.Show(false);
    this.AttachChild(this.sectionSound);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionSound);

    // Init spawn section.
    this.sectionSpawn = create_xr_class_instance(DevDebugSpawnSection, this);
    this.sectionSpawn.SetAutoDelete(true);
    this.sectionSpawn.Show(false);
    this.AttachChild(this.sectionSpawn);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionSpawn);

    // Init UI section.
    this.sectionUi = create_xr_class_instance(DevDebugUiSection, this);
    this.sectionUi.SetAutoDelete(true);
    this.sectionUi.Show(false);
    this.AttachChild(this.sectionUi);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionUi);

    // Init world section.
    this.sectionWorld = create_xr_class_instance(DevDebugWorldSection, this);
    this.sectionWorld.SetAutoDelete(true);
    this.sectionWorld.Show(false);
    this.AttachChild(this.sectionWorld);
    xml.InitWindow("main_dialog:debug_section", 0, this.sectionWorld);
  },
  InitCallBacks(): void {
    log.info("Init callbacks");

    this.AddCallback("btn_cancel", ui_events.BUTTON_CLICKED, () => this.onCancelButtonAction(), this);
    this.AddCallback("tab", ui_events.TAB_CHANGED, () => this.onTabChange(), this);
  },
  InitState(): void {
    this.tab.SetActiveTab(EDebugSection.GENERAL);
  },
  onCancelButtonAction(): void {
    log.info("Cancel action");

    this.owner.ShowDialog(true);
    this.owner.Show(true);

    this.HideDialog();
  },
  onTabChange(): void {
    log.info("Tab change:", this.tab.GetActiveId());

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
      log.warn("Unknown section selected:", id);
    }
  },
  OnKeyboard(key: TXR_DIK_key, event: TXR_ui_event): boolean {
    const result: boolean = CUIScriptWnd.OnKeyboard(this, key, event);

    if (event === ui_events.WINDOW_KEY_PRESSED) {
      if (key === DIK_keys.DIK_ESCAPE) {
        this.onCancelButtonAction();
      }
    }

    return result;
  }
} as IDebugDialog);
