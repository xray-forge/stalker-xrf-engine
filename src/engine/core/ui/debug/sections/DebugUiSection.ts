import { CScriptXmlInit, CUIComboBox, CUIEditBox, CUIStatic, LuabindClass, ui_events } from "xray16";

import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { textures } from "@/engine/lib/constants/textures";

const base: string = "menu\\debug\\DebugUiSection.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class DebugUiSection extends AbstractDebugSection {
  public section!: CUIStatic;
  public texturesList!: CUIComboBox;
  public texturesListFilter!: CUIEditBox;
  public texturesListLineDisplay!: CUIStatic;
  public texturesListSquareBigDisplay!: CUIStatic;
  public texturesListSquareMediumDisplay!: CUIStatic;
  public texturesListSquareSmallDisplay!: CUIStatic;
  public texturesListSquareMiniDisplay!: CUIStatic;

  /**
   * todo: Description.
   */
  public initializeControls(): void {
    const xml: CScriptXmlInit = new CScriptXmlInit();

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
   * todo: Description.
   */
  public initializeCallBacks(): void {
    this.owner.AddCallback("textures_list", ui_events.LIST_ITEM_SELECT, () => this.onTextureListChange(), this);
    this.owner.AddCallback("textures_list_filter", ui_events.EDIT_TEXT_COMMIT, () => this.updateTexturesList(), this);
  }

  /**
   * todo: Description.
   */
  public initializeState(): void {
    this.initTexturesList();
  }

  /**
   * todo: Description.
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
   * todo: Description.
   */
  public updateTexturesList(): void {
    this.texturesList.ClearList();
    this.initTexturesList();
  }

  /**
   * todo: Description.
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
