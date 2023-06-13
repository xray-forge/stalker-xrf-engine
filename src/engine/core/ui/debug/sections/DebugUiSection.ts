import { CScriptXmlInit, CUIComboBox, CUIEditBox, CUIStatic, LuabindClass, ui_events } from "xray16";

import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { textures } from "@/engine/lib/constants/textures";

const logger: LuaLogger = new LuaLogger($filename);
const base: string = "menu\\debug\\DebugUiSection.component";

/**
 * todo;
 */
@LuabindClass()
export class DebugUiSection extends AbstractDebugSection {
  public uiSection!: CUIStatic;
  public uiTexturesList!: CUIComboBox;
  public uiTexturesListFilter!: CUIEditBox;
  public uiTexturesListLineDisplay!: CUIStatic;
  public uiTexturesListSquareBigDisplay!: CUIStatic;
  public uiTexturesListSquareMediumDisplay!: CUIStatic;
  public uiTexturesListSquareSmallDisplay!: CUIStatic;
  public uiTexturesListSquareMiniDisplay!: CUIStatic;

  /**
   * todo: Description.
   */
  public initializeControls(): void {
    const xml: CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));

    this.uiSection = xml.InitStatic("section", this);
    this.uiTexturesList = xml.InitComboBox("section:textures_list", this);
    this.uiTexturesListFilter = xml.InitEditBox("section:textures_list_filter", this);
    this.uiTexturesListSquareBigDisplay = xml.InitStatic("section:textures_picture_square_big", this);
    this.uiTexturesListSquareMediumDisplay = xml.InitStatic("section:textures_picture_square_medium", this);
    this.uiTexturesListSquareSmallDisplay = xml.InitStatic("section:textures_picture_square_small", this);
    this.uiTexturesListSquareMiniDisplay = xml.InitStatic("section:textures_picture_square_mini", this);
    this.uiTexturesListLineDisplay = xml.InitStatic("section:textures_picture_line", this);

    this.owner.Register(this.uiTexturesList, "textures_list");
    this.owner.Register(this.uiTexturesListFilter, "textures_list_filter");
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
    const filterMask: string = this.uiTexturesListFilter.GetText();
    const hasMask: boolean = filterMask !== null && filterMask !== "";

    logger.info("Init textures list, filter:", filterMask);

    Object.values(textures).forEach((it, index) => {
      // Filter items if filter exists.
      if (hasMask && !string.find(it, filterMask, 0, true)) {
        return;
      }

      this.uiTexturesList.AddItem(it, index + 1);
    });
  }

  /**
   * todo: Description.
   */
  public updateTexturesList(): void {
    this.uiTexturesList.ClearList();
    this.initTexturesList();
  }

  /**
   * todo: Description.
   */
  public onTextureListChange(): void {
    const texture: string = this.uiTexturesList.GetText();

    logger.info("Change texture to:", texture, " # ", this.uiTexturesList.CurrentID());

    this.uiTexturesListSquareBigDisplay.InitTexture(texture);
    this.uiTexturesListSquareMediumDisplay.InitTexture(texture);
    this.uiTexturesListSquareSmallDisplay.InitTexture(texture);
    this.uiTexturesListSquareMiniDisplay.InitTexture(texture);
    this.uiTexturesListLineDisplay.InitTexture(texture);
  }
}
