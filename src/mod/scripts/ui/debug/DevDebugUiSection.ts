import { textures } from "@/mod/globals/textures";
import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";

const base: string = "debug/DevDebugUiSection.component.xml";
const log: DebugLogger = new DebugLogger("DevDebugUiSection");

export interface IDevDebugUiSection extends XR_CUIWindow {
  owner: XR_CUIScriptWnd;

  section: XR_CUIStatic;

  texturesList: XR_CUIComboBox;
  texturesListLineDisplay: XR_CUIStatic;
  texturesListSquareBigDisplay: XR_CUIStatic;
  texturesListSquareMediumDisplay: XR_CUIStatic;
  texturesListSquareSmallDisplay: XR_CUIStatic;

  __init(): void;

  InitControls(): void;
  InitCallBacks(): void;
  InitData(): void;

  onTextureListChange(): void;
  onFontListChange(): void;
}

export const DevDebugUiSection: IDevDebugUiSection = declare_xr_class("DevDebugUiSection", CUIWindow, {
  __init(this: IDevDebugUiSection, owner: XR_CUIScriptWnd): void {
    log.info("Init");

    CUIWindow.__init(this);

    this.owner = owner;

    this.InitControls();
    this.InitCallBacks();
    this.InitData();
  },
  __finalize(): void {
    log.info("Finalize");
  },
  InitControls(): void {
    log.info("Init controls");

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(base);
    xml.InitStatic("background", this);

    this.section = xml.InitStatic("section", this);
    this.texturesList = xml.InitComboBox("section:textures_list", this.section);
    this.texturesListSquareBigDisplay = xml.InitStatic("section:textures_picture_square_big", this.section);
    this.texturesListSquareMediumDisplay = xml.InitStatic("section:textures_picture_square_medium", this.section);
    this.texturesListSquareSmallDisplay = xml.InitStatic("section:textures_picture_square_small", this.section);
    this.texturesListLineDisplay = xml.InitStatic("section:textures_picture_line", this.section);

    this.owner.Register(this.texturesList, "textures_list");
  },
  InitCallBacks(): void {
    log.info("Init callbacks");

    this.owner.AddCallback("textures_list", ui_events.LIST_ITEM_SELECT, () => this.onTextureListChange(), this);
    this.owner.AddCallback("fonts_list", ui_events.LIST_ITEM_SELECT, () => this.onFontListChange(), this);
  },
  InitData(): void {
    log.info("Init data");

    Object.values(textures).forEach((it, index) => {
      this.texturesList.AddItem(it, index + 1);
    });
  },
  onTextureListChange(): void {
    const texture: string = "ui\\" + this.texturesList.GetText();

    log.info("Change texture to:", texture, " # ", this.texturesList.CurrentID());

    this.texturesListSquareBigDisplay.InitTexture(texture);
    this.texturesListSquareMediumDisplay.InitTexture(texture);
    this.texturesListSquareSmallDisplay.InitTexture(texture);
    this.texturesListLineDisplay.InitTexture(texture);
  }
} as IDevDebugUiSection);
