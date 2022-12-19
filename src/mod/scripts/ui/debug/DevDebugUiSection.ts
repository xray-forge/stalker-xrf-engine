import { fonts } from "@/mod/globals/fonts";
import { textures } from "@/mod/globals/textures";
import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";

const base: string = "debug/DevDebugUiSection.component.xml";
const log: DebugLogger = new DebugLogger("DevDebugUiSection");

export interface IDevDebugUiSection extends XR_CUIWindow {
  owner: XR_CUIScriptWnd;

  section: XR_CUIStatic;
  fontsList: XR_CUIComboBox;
  texturesList: XR_CUIComboBox;
  texturesListDisplay: XR_CUIStatic;

  __init(): void;

  InitControls(): void;
  InitCallBacks(): void;
  InitData(): void;

  onTextureListChange(): void;
  onFontListChange(): void;
}

export const DevDebugUiSection: IDevDebugUiSection = declare_xr_class(
  "DevDebugUiSection",
  CUIWindow,
  {
    __init(this: IDevDebugUiSection): void {
      log.info("Init");

      CUIWindow.__init(this);

      this.InitControls();
      this.InitCallBacks();
      this.InitData();
    },
    __finalize(): void {
      log.info("Finalize");
    },
    InitControls(): void {
      log.info("Init controls");
      /*

      const xml: XR_CScriptXmlInit = new CScriptXmlInit();

      xml.ParseFile(base);
      xml.InitStatic("background", this);

      this.section = xml.InitStatic("section", this);
      this.texturesList	= xml.InitComboBox("section:textures_list", this.section);
      // this.texturesListDisplay = xml.InitStatic("section:textures_picture", this.section);
      this.fontsList = xml.InitComboBox("section:fonts_list", this.section);

      this.Register(this.texturesList, "textures_list");
      this.Register(this.texturesList, "fonts_list");
       */
    },
    InitCallBacks(): void {
      log.info("Init callbacks");

      /*

      this.AddCallback("textures_list", ui_events.LIST_ITEM_SELECT, () => this.onTextureListChange(), this);
      this.AddCallback("fonts_list", ui_events.LIST_ITEM_SELECT, () => this.onFontListChange(), this);
       */
    },
    InitData(): void {
      /*
      log.info("Init data");

      return;
      Object.values(textures).forEach((it, index) => {
        this.texturesList.AddItem(it, index + 1);
      });

      Object.values(fonts).forEach((it, index) => {
        this.fontsList.AddItem(it, index + 1);
      });
       */
    },
    onFontListChange(): void {
      const font: string = this.fontsList.GetText();
    },
    onTextureListChange(): void {
      const texture: string = this.texturesList.GetText();

      // this.texturesListDisplay.InitTexture(texture);
    }
  } as IDevDebugUiSection
);
