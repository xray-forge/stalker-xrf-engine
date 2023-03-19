import {
  CScriptXmlInit,
  CUIWindow,
  LuabindClass,
  ui_events,
  XR_CScriptXmlInit,
  XR_CUIComboBox,
  XR_CUIEditBox,
  XR_CUIScriptWnd,
  XR_CUIStatic,
} from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { textures } from "@/engine/lib/constants/textures";

const base: string = "menu\\debug\\DevDebugUiSection.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class DevDebugUiSection extends CUIWindow {
  public owner: XR_CUIScriptWnd;

  public section!: XR_CUIStatic;
  public texturesList!: XR_CUIComboBox;
  public texturesListFilter!: XR_CUIEditBox;
  public texturesListLineDisplay!: XR_CUIStatic;
  public texturesListSquareBigDisplay!: XR_CUIStatic;
  public texturesListSquareMediumDisplay!: XR_CUIStatic;
  public texturesListSquareSmallDisplay!: XR_CUIStatic;
  public texturesListSquareMiniDisplay!: XR_CUIStatic;

  /**
   * todo;
   */
  public constructor(owner: XR_CUIScriptWnd) {
    super();

    this.owner = owner;

    this.initControls();
    this.initCallBacks();
    this.InitData();
  }

  /**
   * todo;
   */
  public initControls(): void {
    logger.info("Init controls");

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
  }

  /**
   * todo;
   */
  public initCallBacks(): void {
    logger.info("Init callbacks");

    this.owner.AddCallback("textures_list", ui_events.LIST_ITEM_SELECT, () => this.onTextureListChange(), this);
    this.owner.AddCallback("textures_list_filter", ui_events.EDIT_TEXT_COMMIT, () => this.updateTexturesList(), this);
  }

  /**
   * todo;
   */
  public InitData(): void {
    logger.info("Init data");
    this.initTexturesList();
  }

  /**
   * todo;
   */
  public initTexturesList(): void {
    const filterMask: string = this.texturesListFilter.GetText();
    const hasMask: boolean = filterMask !== null && filterMask !== "";

    logger.info("Init textures list, filter:", filterMask);

    Object.values(textures).forEach((it, index) => {
      // Filter items if filter exists.
      if (hasMask && !string.find(it, filterMask, 0, true)) {
        return;
      }

      this.texturesList.AddItem(it, index + 1);
    });
  }

  /**
   * todo;
   */
  public updateTexturesList(): void {
    this.texturesList.ClearList();
    this.initTexturesList();
  }

  /**
   * todo;
   */
  public onTextureListChange(): void {
    const texture: string = this.texturesList.GetText();

    logger.info("Change texture to:", texture, " # ", this.texturesList.CurrentID());

    this.texturesListSquareBigDisplay.InitTexture(texture);
    this.texturesListSquareMediumDisplay.InitTexture(texture);
    this.texturesListSquareSmallDisplay.InitTexture(texture);
    this.texturesListSquareMiniDisplay.InitTexture(texture);
    this.texturesListLineDisplay.InitTexture(texture);
  }
}
