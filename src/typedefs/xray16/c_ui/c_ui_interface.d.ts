declare module "xray16" {
  /**
   * C++ class CUIWindow {
   * @customConstructor CUIWindow
   */
  export class XR_CUIWindow extends XR_LuaBindBase {
    public IsShown(): boolean;
    public IsEnabled(): boolean;
    public IsAutoDelete(): boolean;

    public GetHeight(): number;
    public GetWidth(): number;
    public GetWndPos(): XR_vector2;
    public SetWndSize(vector2: unknown): unknown;

    public SetWindowName(this: XR_CUIWindow, value: string): void;
    public SetWndPos(vector2: unknown): void;
    public SetAutoDelete(value: boolean): void;
    public SetPPMode(): void;
    public SetWndRect(rect: XR_Frect): void;

    public Enable(value: boolean): unknown;
    public AttachChild(child: XR_CUIWindow): void;
    public DetachChild(child: XR_CUIWindow): void;
    public WindowName(): unknown;
    public ResetPPMode(): unknown;
    public Show(this: any, value: boolean): unknown;
  }

  /**
   * C++ class CServerList : CUIWindow {
   * @customConstructor CServerList
   */
  export class XR_CServerList extends XR_CUIWindow {
    public SetPlayerName(name: string): void;
    public SetFilters(filsters: XR_SServerFilters): void;
    public RefreshList(value: boolean): void;
    public SetSortFunc(a: string, b: boolean): void;
    public NetRadioChanged(value: boolean): unknown;
    public ShowServerInfo(): unknown;
    public RefreshQuick(): void;
    public ConnectToSelected(): unknown;
    public SetConnectionErrCb(cb: XR_connect_error_cb): void;
  }

  /**
   * C++ class CUIButton : CUIStatic {
   * @customConstructor CUIButton
   */
  export class XR_CUIButton extends XR_CUIStatic {}

  /**
   * C++ class CUI3tButton : CUIButton {
   * @customConstructor CUI3tButton
   */
  export class XR_CUI3tButton extends XR_CUIButton {}

  /**
   * C++ class CUICheckButton : CUI3tButton {
   * @customConstructor CUICheckButton
   */
  export class XR_CUICheckButton extends XR_CUI3tButton {
    public SetCheck(value: boolean): void;
    public GetCheck(): boolean;
    public SetDependControl(window: XR_CUIWindow): void;
  }

  /**
   * C++ class CUIComboBox : CUIWindow {
   * @customConstructor CUIComboBox
   */
  export class XR_CUIComboBox extends XR_CUIWindow {
    public ClearList(): void;
    public SetText(text: string): void;
    public enable_id(id: number): void;
    public AddItem(label: string, id: number): void;
    public GetText(): string;
    public SetListLength(length: number): void;
    public CurrentID(): number;
    public GetTextOf(id: number): string;
    public SetCurrentValue(): void;
    public SetVertScroll(enabled: boolean): void;
    public disable_id(id: number): void;
    public SetCurrentID(id: number): void;
  }

  /**
   * C++ class CUICustomEdit : CUIWindow {
   * @customConstructor CUICustomEdit
   */
  export class XR_CUICustomEdit extends XR_CUIWindow {
    public SetText(text: string): void;
    public SetNextFocusCapturer(edit: XR_CUICustomEdit): void;
    public GetText(): string;
    public CaptureFocus(value: boolean): void;
  }

  /**
   * C++ class CUICustomSpin : CUIWindow {
   * @customConstructor CUICustomSpin
   */
  export class XR_CUICustomSpin extends XR_CUIWindow {
    public GetText(): string;
  }

  /**
   * C++ class CUIDialogWnd : CUIWindow {
   * @customConstructor CUIDialogWnd
   */

  export class XR_CUIDialogWnd extends XR_CUIWindow {
    public HideDialog(): void;
    public ShowDialog(value: boolean): void;
    public GetHolder(): unknown;
  }

  /**
   * C++ class CUIScriptWnd : CUIDialogWnd,DLL_Pure {
   * @customConstructor CUIScriptWnd
   */

  export class XR_CUIScriptWnd extends XR_CUIDialogWnd {
    public _construct(): XR_CUIDialogWnd;
    public static OnKeyboard(this: void, base: XR_CUIWindow, key: number, message: TXR_ui_event): boolean;
    public OnKeyboard(key: TXR_DIK_key, event: TXR_ui_event): boolean;
    public static Update(this: void, base: XR_CUIWindow): boolean;
    public Update(): void;
    public AddCallback(this: XR_CUIWindow, name: string, event: number, cb: () => void, source?: XR_CUIWindow): void;
    public Dispatch(cmd: number, param: number): boolean;
    public Register(window: XR_CUIWindow, name: string): void;
    public Load(value: string): unknown;
  }

  /**
   * C++ class CUIEditBox : CUICustomEdit {
   * @customConstructor CUIEditBox
   */
  export class XR_CUIEditBox extends XR_CUICustomEdit {
    public InitTexture(textureId: string): void;
  }

  /**
   * C++ class CUIEditBoxEx : CUICustomEdit {
   * @customConstructor CUIEditBoxEx
   */
  export class XR_CUIEditBoxEx extends XR_CUICustomEdit {
    public InitTexture(textureId: string): void;
  }

  /**
   * C++ class CUIFrameLineWnd : CUIWindow {
   * @customConstructor CUIFrameLineWnd
   */
  export class XR_CUIFrameLineWnd extends XR_CUIWindow {
    public SetHeight(value: number): unknown;
    public SetColor(value: number): unknown;
    public SetWidth(value: number): unknown;
  }

  /**
   * C++ class CUIFrameWindow : CUIWindow {
   * @customConstructor CUIFrameWindow
   */
  export class XR_CUIFrameWindow extends XR_CUIWindow {
    public SetHeight(value: number): void;
    public SetColor(value: number): void;
    public SetWidth(value: number): void;
  }

  /**
   * C++ class CUILines {
   * @customConstructor CUILines
   */
  export class XR_CUILines {
    public GetText(): string;
    public SetTextST(value: string): void;
    public SetTextColor(value: number): void;
    public SetText(value: string): void;

    /**
     * Expects C pointer to the file.
     * String enums or constants will not work.
     */
    public SetFont(value: unknown): void;
    public SetElipsis(value: boolean): void;
  }

  /**
   * C++ class CUIListBox : CUIScrollView {
   * @customConstructor CUIListBox
   */
  export class XR_CUIListBox<T extends XR_CUIListBoxItem = XR_CUIListBoxItem> extends XR_CUIScrollView {
    public AddExistingItem(item: T): unknown;
    public AddTextItem(text: string): unknown;
    public RemoveItem(window: XR_CUIWindow): void;
    public GetItemByIndex(index: number): T;
    public GetSelectedIndex(): number;
    public GetSelectedItem(): T | null;
    public GetSize(): number;
    public RemoveAll(): void;
    public ShowSelectedItem(value: boolean): unknown;
    public GetItem(index: number): unknown;
  }

  /**
   * C++ class CUIListBoxItem : CUIFrameLineWnd {
   * @customConstructor CUIListBoxItem
   */
  export class XR_CUIListBoxItem extends XR_CUIFrameLineWnd {
    // public constructor(index: number);

    public AddIconField(value: number): XR_CUIStatic;
    public SetTextColor(color: number): void;
    public AddTextField(text: string, width: number): XR_CUITextWnd;
    public GetTextItem(): XR_CUITextWnd;
  }

  /**
   * C++ class CUIListBoxItemMsgChain : CUIListBoxItem {
   *  @customConstructor CUIListBoxItemMsgChain
   */
  export class XR_CUIListBoxItemMsgChain extends XR_CUIListBoxItem {}

  /**
   * C++ class CUIMMShniaga : CUIWindow {
   * @customConstructor CUIMMShniaga
   */
  export class XR_CUIMMShniaga extends XR_CUIWindow {
    public static epi_main: 0;
    public static epi_new_game: 1;
    public static epi_new_network_game: 2;

    public ShowPage(pageId: number): void;
    public SetPage(pageId: number, xml: string, selector: string): void;
    public SetVisibleMagnifier(isVisible: boolean): void;
  }

  /**
   * C++ class CUIMapInfo : CUIWindow {
   */
  export class XR_CUIMapInfo extends XR_CUIWindow {
    public InitMap(a: string, b: string): void;
    public Init(a: XR_vector2, b: XR_vector2): void;
  }

  /**
   * C++ class CUIMapList : CUIWindow {
   * @customConstructor CUIMapList
   */
  export class XR_CUIMapList extends XR_CUIWindow {
    public IsEmpty(): boolean;
    public StartDedicatedServer(): void;
    public SetModeSelector(modeSelector: XR_CUISpinText): void;
    public ClearList(): void;
    public SetMapInfo(info: unknown /* CUIMapInfo*/): void;
    public OnModeChange(): void;
    public LoadMapList(): void;
    public GetCommandLine(value: string): string;
    public GetCurGameType(): XR_GAME_TYPE[keyof XR_GAME_TYPE];
    public SaveMapList(): void;
    public SetMapPic(picture: XR_CUIStatic): void;
    public SetServerParams(params: string): void;
    public SetWeatherSelector(selector: XR_CUIComboBox): void;
  }

  /**
   * C++ class CUIMessageBox : CUIStatic {
   * @customConstructor CUIMessageBox
   */
  export class XR_CUIMessageBox extends XR_CUIStatic {
    public InitMessageBox(value: string): void;
    public SetText(value: string): string;
    public GetPassword(): string;
    public GetHost(): string;
  }

  /**
   * C++ class CUIMessageBoxEx : CUIDialogWnd {
   * @customConstructor CUIMessageBoxEx
   */
  export class XR_CUIMessageBoxEx extends XR_CUIDialogWnd {
    public InitMessageBox(value: string): void;
    public SetText(text: string): void;
    public GetPassword(): string;
    public GetHost(): string;
  }

  /**
   * C++ class CUIProgressBar : CUIWindow {
   * @customConstructor CUIProgressBar
   */
  export class XR_CUIProgressBar extends XR_CUIWindow {
    public GetRange_max(): number;
    public GetRange_min(): number;
    public SetProgressPos(value: number): void;
    public GetProgressPos(): number;
  }

  /**
   * C++ class CUIPropertiesBox : CUIFrameWindow {
   * @customConstructor CUIPropertiesBox
   */
  export class XR_CUIPropertiesBox extends XR_CUIFrameWindow {
    public AddItem(value: string): unknown;
    public AutoUpdateSize(): unknown;
    public RemoveItem(value: number): unknown;
    public RemoveAll(): void
    public Hide(): void;
  }

  /**
   * C++ class CUIScrollView : CUIWindow {
   * @customConstructor CUIScrollView
   */
  export class XR_CUIScrollView extends XR_CUIWindow {
    public SetScrollPos(position: number): unknown;
    public RemoveWindow(window: XR_CUIWindow): unknown;
    public ScrollToBegin(): unknown;
    public GetCurrentScrollPos(): unknown;
    public AddWindow(window: XR_CUIWindow, value: boolean): unknown;
    public GetMaxScrollPos(): unknown;
    public GetMinScrollPos(): unknown;
    public ScrollToEnd(): unknown;
    public Clear(): unknown;
  }

  /**
   * C++ class CUISleepStatic : CUIStatic {
   * @customConstructor CUISleepStatic
   */
  export class XR_CUISleepStatic extends XR_CUIStatic {
  }

  /**
   * C++ class CUISpinFlt : CUICustomSpin {
   * @customConstructor CUISpinFlt
   */
  export class XR_CUISpinFlt extends XR_CUICustomSpin {
  }

  /**
   * C++ class CUISpinNum : CUICustomSpin {
   */
  export class XR_CUISpinNum extends XR_CUICustomSpin {
  }

  /**
   * C++ class CUISpinText : CUICustomSpin {
   * @customConstructor CUISpinText
   */
  export class XR_CUISpinText extends XR_CUICustomSpin {}

  /**
   * C++ class CUIStatic : CUIWindow {
   * @customConstructor CUIStatic
   */
  export class XR_CUIStatic extends XR_CUIWindow {
    public TextControl(): XR_CUILines;
    public GetTextureRect(): XR_Frect;
    public SetStretchTexture(isStretched: boolean): void;
    public SetTextureRect(frect: XR_Frect): void;
    public InitTexture(value: string): void;
  }

  /**
   * C++ class CUITabButton : CUIButton {
   * @customConstructor CUITabButton
   */
  export class XR_CUITabButton extends XR_CUIButton {}

  /**
   * C++ class CUITabControl : CUIWindow {
   * @customConstructor CUITabControl
   */
  export class XR_CUITabControl extends XR_CUIWindow {
    public GetActiveId(): string;
    public SetActiveTab(id: string): string;
    public GetTabsCount(): number;
    public GetButtonById(value: string): XR_CUITabButton;
    public RemoveAll(): void;
    public AddItem(item: XR_CUITabButton): void;
    public AddItem(id: string, name: string, a: XR_vector2, b: XR_vector2): void;
  }

  /**
   * C++ class CUITextWnd : CUIWindow {
   * @customConstructor CUITextWnd
   */
  export class XR_CUITextWnd extends XR_CUIWindow {
    public GetFont(): unknown;
    public SetTextOffset(x: number, y: number): unknown;
    public SetText(text: string): unknown;
    public SetTextAlignment(align: number /* CGameFont::EAligment */): unknown;
    public SetTextComplexMode(value: boolean): unknown;
    public GetText(): string;
    public GetTextColor(): unknown;
    public SetTextColor(color: number): unknown;
    public SetFont(font: unknown /* CGameFont */): unknown;
    public SetTextST(text: string): unknown;
    public AdjustHeightToText(): unknown;
    public AdjustWidthToText(): unknown;
    public SetEllipsis(value: boolean): unknown;
    public SetVTextAlignment(alignment: unknown /* enum EVTextAlignment */): unknown;
  }

  /**
   * C++ class CUITrackBar : CUIWindow {
   * @customConstructor CUITrackBar
   */
  export class XR_CUITrackBar extends XR_CUIWindow {
    public SetCheck(value: boolean): void;
    public SetCurrentValue(): void;
    public GetCheck(): unknown;
    public GetIValue(): number;
    public GetFValue(): number;
    public SetOptIBounds(min: number, max: number): number;
    public SetOptFBounds(min: number, max: number): number;
  }
}
