import { textures } from "@/mod/globals/textures";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/ui";

const base: string = "debug\\DevDebugUiSection.component";
const log: LuaLogger = new LuaLogger("DevDebugUiSection");

export interface IDevDebugUiSection extends XR_CUIWindow {
  owner: XR_CUIScriptWnd;

  section: XR_CUIStatic;

  texturesList: XR_CUIComboBox;
  texturesListFilter: XR_CUIEditBox;
  texturesListLineDisplay: XR_CUIStatic;
  texturesListSquareBigDisplay: XR_CUIStatic;
  texturesListSquareMediumDisplay: XR_CUIStatic;
  texturesListSquareSmallDisplay: XR_CUIStatic;
  texturesListSquareMiniDisplay: XR_CUIStatic;

  InitControls(): void;
  InitCallBacks(): void;
  InitData(): void;
  InitTexturesList(): void;
  UpdateTexturesList(): void;

  onTextureListChange(): void;
  onFontListChange(): void;
}

export const DevDebugUiSection: IDevDebugUiSection = declare_xr_class("DevDebugUiSection", CUIWindow, {
  __init(this: IDevDebugUiSection, owner: XR_CUIScriptWnd): void {
    xr_class_super();

    log.info("Init");

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

    xml.ParseFile(resolveXmlFormPath(base));

    this.section = xml.InitStatic("section", this);
    this.texturesList = xml.InitComboBox("section:textures_list", this);
    this.texturesListFilter = xml.InitEditBox("section:textures_list_filter", this);
    this.texturesListSquareBigDisplay = xml.InitStatic("section:textures_picture_square_big", this);
    this.texturesListSquareMediumDisplay = xml.InitStatic("section:textures_picture_square_medium", this);
    this.texturesListSquareSmallDisplay = xml.InitStatic("section:textures_picture_square_small", this);
    this.texturesListSquareMiniDisplay = xml.InitStatic("section:textures_picture_square_mini", this);
    this.texturesListLineDisplay = xml.InitStatic("section:textures_picture_line", this);

    this.owner.Register(this.texturesList, "textures_list");
    this.owner.Register(this.texturesListFilter, "textures_list_filter");
  },
  InitCallBacks(): void {
    log.info("Init callbacks");

    this.owner.AddCallback("textures_list", ui_events.LIST_ITEM_SELECT, () => this.onTextureListChange(), this);
    this.owner.AddCallback("textures_list_filter", ui_events.EDIT_TEXT_COMMIT, () => this.UpdateTexturesList(), this);
  },
  InitData(): void {
    log.info("Init data");
    this.InitTexturesList();
  },
  InitTexturesList(): void {
    const filterMask: string = this.texturesListFilter.GetText();
    const hasMask: boolean = filterMask !== null && filterMask !== "";

    log.info("Init textures list, filter:", filterMask);

    Object.values(textures).forEach((it, index) => {
      // Filter items if filter exists.
      if (hasMask && !string.find(it, filterMask, 0, true)) {
        return;
      }

      this.texturesList.AddItem(it, index + 1);
    });
  },
  UpdateTexturesList(): void {
    this.texturesList.ClearList();
    this.InitTexturesList();
  },
  onTextureListChange(): void {
    const texture: string = this.texturesList.GetText();

    log.info("Change texture to:", texture, " # ", this.texturesList.CurrentID());

    this.texturesListSquareBigDisplay.InitTexture(texture);
    this.texturesListSquareMediumDisplay.InitTexture(texture);
    this.texturesListSquareSmallDisplay.InitTexture(texture);
    this.texturesListSquareMiniDisplay.InitTexture(texture);
    this.texturesListLineDisplay.InitTexture(texture);
  }
} as IDevDebugUiSection);
