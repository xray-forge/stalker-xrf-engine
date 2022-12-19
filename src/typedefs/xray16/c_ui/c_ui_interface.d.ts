export {};

declare global {
  /**
   * C++ class CUIWindow {
   *   CUIWindow ();
   *
   *   function SetWindowName(string);
   *   function Enable(boolean);
   *   function SetAutoDelete(boolean);
   *   function AttachChild(CUIWindow*);
   *   function SetWndPos(vector2);
   *   function DetachChild(CUIWindow*);
   *   function SetPPMode();
   *   function WindowName();
   *   function IsShown();
   *   function ResetPPMode();
   *   function SetWndRect(Frect);
   *   function GetHeight() const;
   *   function Show(boolean);
   *   function GetWndPos(CUIWindow*);
   *   function IsEnabled();
   *   function SetWndSize(vector2);
   *   function GetWidth() const;
   *   function IsAutoDelete();
   * };
   *
   * @customConstructor CUIWindow
   */
  class XR_CUIWindow extends XR_LuaBindBase {
    public IsShown(): boolean;
    public IsEnabled(): boolean;
    public IsAutoDelete(): boolean;

    public GetHeight(): number;
    public GetWidth(): number;
    public GetWndPos(wnd: XR_CUIWindow): unknown;
    public SetWndSize(vector2: unknown): unknown;

    public SetWindowName(this: XR_CUIWindow, value: string): unknown;
    public SetWndPos(vector2: unknown): unknown;
    public SetAutoDelete(value: boolean): void;
    public SetPPMode(): unknown;
    public SetWndRect(rect: XR_FRect): unknown;

    public Enable(value: boolean): unknown;
    public AttachChild(child: XR_CUIWindow): unknown;
    public DetachChild(child: XR_CUIWindow): unknown;
    public WindowName(): unknown;
    public ResetPPMode(): unknown;
    public Show(this: any, value: boolean): unknown;
  }

  /**
   C++ class CServerList : CUIWindow {
    CServerList ();

    function SetPlayerName(string);

    function SetWindowName(string);

    function GetWndPos(CUIWindow*);

    function SetFilters(SServerFilters&);

    function RefreshList(boolean);

    function SetAutoDelete(boolean);

    function SetSortFunc(string, boolean);

    function NetRadioChanged(boolean);

    function AttachChild(CUIWindow*);

    function ShowServerInfo();

    function SetWndPos(vector2);

    function RefreshQuick();

    function ConnectToSelected();

    function DetachChild(CUIWindow*);

    function SetPPMode();

    function WindowName();

    function IsShown();

    function SetWndRect(Frect);

    function Show(boolean);

    function GetHeight() const;

    function GetWidth() const;

    function SetWndSize(vector2);

    function IsEnabled();

    function ResetPPMode();

    function Enable(boolean);

    function IsAutoDelete();

  };
   */

  /**
   *  C++ class CUIButton : CUIStatic {
   *   CUIButton ();
   *
   *   public SetWindowName(string);
   *
   *   public GetWndPos(CUIWindow*);
   *
   *   public TextControl();
   *
   *   public SetAutoDelete(boolean);
   *
   *   public SetStretchTexture(boolean);
   *
   *   public AttachChild(CUIWindow*);
   *
   *   public Enable(boolean);
   *
   *   public SetTextureRect(Frect*);
   *
   *   public ResetPPMode();
   *
   *   public Show(boolean);
   *
   *   public DetachChild(CUIWindow*);
   *
   *   public SetPPMode();
   *
   *   public WindowName();
   *
   *   public IsShown();
   *
   *   public SetWndPos(vector2);
   *
   *   public SetWndRect(Frect);
   *
   *   public GetHeight() const;
   *
   *   public GetWidth() const;
   *
   *   public InitTexture(string);
   *
   *   public IsEnabled();
   *
   *   public SetWndSize(vector2);
   *
   *   public GetTextureRect();
   *
   *   public IsAutoDelete();
   *
   * };
   *
   * @customConstructor CUIButton
   */
  class XR_CUIButton extends XR_CUIStatic {}

  /**
   * C++ class CUI3tButton : CUIButton {
   *   CUI3tButton ();
   *
   *   public SetWindowName(string);
   *
   *   public GetWndPos(CUIWindow*);
   *
   *   public TextControl();
   *
   *   public SetAutoDelete(boolean);
   *
   *   public Enable(boolean);
   *
   *   public AttachChild(CUIWindow*);
   *
   *   public GetTextureRect();
   *
   *   public SetWndPos(vector2);
   *
   *   public SetWndSize(vector2);
   *
   *   public SetWndRect(Frect);
   *
   *   public DetachChild(CUIWindow*);
   *
   *   public SetPPMode();
   *
   *   public WindowName();
   *
   *   public IsShown();
   *
   *   public SetTextureRect(Frect*);
   *
   *   public Show(boolean);
   *
   *   public GetHeight() const;
   *
   *   public GetWidth() const;
   *
   *   public InitTexture(string);
   *
   *   public IsEnabled();
   *
   *   public ResetPPMode();
   *
   *   public SetStretchTexture(boolean);
   *
   *   public IsAutoDelete();
   *
   * };
   *
   * @customConstructor CUI3tButton
   */
  class XR_CUI3tButton extends XR_CUIButton {}

  /**
   *  C++ class CUICheckButton : CUI3tButton {
   *   CUICheckButton ();
   *
   *   public SetWindowName(string);
   *
   *   public GetWndPos(CUIWindow*);
   *
   *   public TextControl();
   *
   *   public Enable(boolean);
   *
   *   public SetAutoDelete(boolean);
   *
   *   public GetTextureRect();
   *
   *   public ResetPPMode();
   *
   *   public SetCheck(boolean);
   *
   *   public AttachChild(CUIWindow*);
   *
   *   public SetStretchTexture(boolean);
   *
   *   public SetTextureRect(Frect*);
   *
   *   public GetCheck();
   *
   *   public Show(boolean);
   *
   *   public DetachChild(CUIWindow*);
   *
   *   public SetPPMode();
   *
   *   public WindowName();
   *
   *   public IsShown();
   *
   *   public SetWndPos(vector2);
   *
   *   public SetWndRect(Frect);
   *
   *   public GetHeight() const;
   *
   *   public GetWidth() const;
   *
   *   public InitTexture(string);
   *
   *   public IsEnabled();
   *
   *   public SetWndSize(vector2);
   *
   *   public SetDependControl(CUIWindow*);
   *
   *   public IsAutoDelete();
   *
   * };
   *
   * @customConstructor CUICheckButton
   */
  class XR_CUICheckButton extends XR_CUI3tButton {
    public SetCheck(value: boolean): void;

    public GetCheck(): boolean;

    public SetDependControl(window: XR_CUIWindow): void;
  }

  /**
   * C++ class CUIComboBox : CUIWindow {
   *     CUIComboBox ();
   *
   *     function ClearList();
   *
   *     function SetWindowName(string);
   *
   *     function GetWndPos(CUIWindow*);
   *
   *     function SetText(string);
   *
   *     function enable_id(number);
   *
   *     function SetWndSize(vector2);
   *
   *     function AddItem(string, number);
   *
   *     function GetText();
   *
   *     function SetAutoDelete(boolean);
   *
   *     function SetListLength(number);
   *
   *     function CurrentID();
   *
   *     function GetTextOf(number);
   *
   *     function AttachChild(CUIWindow*);
   *
   *     function Enable(boolean);
   *
   *     function SetWndPos(vector2);
   *
   *     function SetCurrentValue();
   *
   *     function SetVertScroll(boolean);
   *
   *     function DetachChild(CUIWindow*);
   *
   *     function SetPPMode();
   *
   *     function WindowName();
   *
   *     function IsShown();
   *
   *     function SetWndRect(Frect);
   *
   *     function Show(boolean);
   *
   *     function GetHeight() const;
   *
   *     function GetWidth() const;
   *
   *     function disable_id(number);
   *
   *     function IsEnabled();
   *
   *     function ResetPPMode();
   *
   *     function SetCurrentID(number);
   *
   *     function IsAutoDelete();
   *
   *   };
   *
   *   @customConstructor CUIComboBox
   */

  class XR_CUIComboBox extends XR_CUIWindow {
    public ClearList(): void;

    public SetText(text: string): void;

    public enable_id(id: number): void;

    public AddItem(label: string, id: number): void;

    public GetText(): string;

    public SetListLength(length: number): void;

    public CurrentID(): string;

    public GetTextOf(id: number): string;

    public SetCurrentValue(): void;

    public SetVertScroll(enabled: boolean): void;

    public disable_id(id: number): void;

    public SetCurrentID(id: number): void;
  }

  /**
   * C++ class CUICustomEdit : CUIWindow {
   *     function SetWindowName(string);
   *
   *     function GetWndPos(CUIWindow*);
   *
   *     function SetText(string);
   *
   *     function SetNextFocusCapturer(CUICustomEdit*);
   *
   *     function GetText();
   *
   *     function SetAutoDelete(boolean);
   *
   *     function AttachChild(CUIWindow*);
   *
   *     function SetWndPos(vector2);
   *
   *     function CaptureFocus(boolean);
   *
   *     function DetachChild(CUIWindow*);
   *
   *     function SetPPMode();
   *
   *     function WindowName();
   *
   *     function IsShown();
   *
   *     function SetWndRect(Frect);
   *
   *     function Show(boolean);
   *
   *     function GetHeight() const;
   *
   *     function GetWidth() const;
   *
   *     function SetWndSize(vector2);
   *
   *     function IsEnabled();
   *
   *     function ResetPPMode();
   *
   *     function Enable(boolean);
   *
   *     function IsAutoDelete();
   *
   *   };
   *
   *  @customConstructor CUICustomEdit
   */
  class XR_CUICustomEdit extends XR_CUIWindow {
    public SetText(text: string): void;

    public SetNextFocusCapturer(edit: XR_CUICustomEdit): void;

    public GetText(): string;

    public CaptureFocus(value: boolean): void;
  }

  /**
   * C++ class CUICustomSpin : CUIWindow {
   *   function SetWindowName(string);
   *
   *   function GetWndPos(CUIWindow*);
   *
   *   function GetText();
   *
   *   function SetAutoDelete(boolean);
   *
   *   function AttachChild(CUIWindow*);
   *
   *   function SetWndPos(vector2);
   *
   *   function DetachChild(CUIWindow*);
   *
   *   function SetPPMode();
   *
   *   function WindowName();
   *
   *   function IsShown();
   *
   *   function SetWndRect(Frect);
   *
   *   function Show(boolean);
   *
   *   function GetHeight() const;
   *
   *   function GetWidth() const;
   *
   *   function SetWndSize(vector2);
   *
   *   function IsEnabled();
   *
   *   function ResetPPMode();
   *
   *   function Enable(boolean);
   *
   *   function IsAutoDelete();
   *
   * };
   *
   * @customConstructor CUICustomSpin
   */
  class XR_CUICustomSpin extends XR_CUIWindow {
    public GetText(): unknown;
  }

  /**
   * C++ class CUIDialogWnd : CUIWindow {
   *   function HideDialog();
   *
   *   function SetWindowName(string);
   *
   *   function GetWndPos(CUIWindow*);
   *
   *   function SetAutoDelete(boolean);
   *
   *   function AttachChild(CUIWindow*);
   *
   *   function SetWndPos(vector2);
   *
   *   function SetWndRect(Frect);
   *
   *   function ShowDialog(boolean);
   *
   *   function DetachChild(CUIWindow*);
   *
   *   function SetPPMode();
   *
   *   function WindowName();
   *
   *   function IsShown();
   *
   *   function GetHolder();
   *
   *   function Show(boolean);
   *
   *   function GetHeight() const;
   *
   *   function GetWidth() const;
   *
   *   function SetWndSize(vector2);
   *
   *   function IsEnabled();
   *
   *   function ResetPPMode();
   *
   *   function Enable(boolean);
   *
   *   function IsAutoDelete();
   *
   * };
   *
   * @customConstructor CUIDialogWnd
   */

  class XR_CUIDialogWnd extends XR_CUIWindow {
    public HideDialog(): void;

    public ShowDialog(value: boolean): void;

    public GetHolder(): unknown;
  }

  /**
   * C++ class CUIScriptWnd : CUIDialogWnd,DLL_Pure {
   *   CUIScriptWnd ();
   *
   *   function HideDialog();
   *
   *   function _construct();
   *
   *   function SetWindowName(string);
   *
   *   function GetWndPos(CUIWindow*);
   *
   *   function OnKeyboard(number, enum EUIMessages);
   *
   *   function Update();
   *
   *   function AddCallback(string, number, const function<void>&, object);
   *
   *   function SetAutoDelete(boolean);
   *
   *   function Dispatch(number, number);
   *
   *   function Show(boolean);
   *
   *   function AttachChild(CUIWindow*);
   *
   *   function Register(CUIWindow*, string);
   *
   *   function SetWndPos(vector2);
   *
   *   function ShowDialog(boolean);
   *
   *   function Enable(boolean);
   *
   *   function DetachChild(CUIWindow*);
   *
   *   function SetPPMode();
   *
   *   function WindowName();
   *
   *   function IsShown();
   *
   *   function GetHolder();
   *
   *   function SetWndRect(Frect);
   *
   *   function GetHeight() const;
   *
   *   function ResetPPMode();
   *
   *   function GetWidth() const;
   *
   *   function IsEnabled();
   *
   *   function SetWndSize(vector2);
   *
   *   function Load(string);
   *
   *   function IsAutoDelete();
   *
   * };
   *
   * @customConstructor CUIScriptWnd
   */

  class XR_CUIScriptWnd extends XR_CUIDialogWnd {
    public _construct(): XR_CUIDialogWnd;

    public static OnKeyboard(
      this: void,
      base: XR_CUIWindow,
      key: number,
      message: IXR_ui_events[keyof IXR_ui_events]
    ): boolean;

    public OnKeyboard(key: number, message: IXR_ui_events[keyof IXR_ui_events]): boolean;

    public Update(): void;

    public AddCallback(this: XR_CUIWindow, name: string, event: number, cb: () => void, source?: XR_CUIWindow): void;

    public Dispatch(value1: number, value2: number): void;

    public Register(window: XR_CUIWindow, name: string): void;

    public Load(value: string): unknown;
  }

  /**
   * C++ class CUIEditBox : CUICustomEdit {
   *     CUIEditBox ();
   *
   *     function SetWindowName(string);
   *
   *     function GetWndPos(CUIWindow*);
   *
   *     function SetText(string);
   *
   *     function SetNextFocusCapturer(CUICustomEdit*);
   *
   *     function GetText();
   *
   *     function SetAutoDelete(boolean);
   *
   *     function AttachChild(CUIWindow*);
   *
   *     function SetWndPos(vector2);
   *
   *     function GetWidth() const;
   *
   *     function SetPPMode();
   *
   *     function DetachChild(CUIWindow*);
   *
   *     function CaptureFocus(boolean);
   *
   *     function WindowName();
   *
   *     function IsShown();
   *
   *     function Enable(boolean);
   *
   *     function SetWndRect(Frect);
   *
   *     function GetHeight() const;
   *
   *     function ResetPPMode();
   *
   *     function InitTexture(string);
   *
   *     function IsEnabled();
   *
   *     function SetWndSize(vector2);
   *
   *     function Show(boolean);
   *
   *     function IsAutoDelete();
   *
   *   };
   *
   *  @customConstructor CUIEditBox
   */
  class XR_CUIEditBox extends XR_CUICustomEdit {
    public InitTexture(textureId: string): void;
  }

  /**
   * C++ class CUIEditBoxEx : CUICustomEdit {
   *     CUIEditBoxEx ();
   *
   *     function SetWindowName(string);
   *
   *     function GetWndPos(CUIWindow*);
   *
   *     function SetText(string);
   *
   *     function SetNextFocusCapturer(CUICustomEdit*);
   *
   *     function GetText();
   *
   *     function SetAutoDelete(boolean);
   *
   *     function AttachChild(CUIWindow*);
   *
   *     function SetWndPos(vector2);
   *
   *     function GetWidth() const;
   *
   *     function SetPPMode();
   *
   *     function DetachChild(CUIWindow*);
   *
   *     function CaptureFocus(boolean);
   *
   *     function WindowName();
   *
   *     function IsShown();
   *
   *     function Enable(boolean);
   *
   *     function SetWndRect(Frect);
   *
   *     function GetHeight() const;
   *
   *     function ResetPPMode();
   *
   *     function InitTexture(string);
   *
   *     function IsEnabled();
   *
   *     function SetWndSize(vector2);
   *
   *     function Show(boolean);
   *
   *     function IsAutoDelete();
   *
   *   };
   *
   *  @customConstructor CUIEditBoxEx
   */
  class XR_CUIEditBoxEx extends XR_CUICustomEdit {
    public InitTexture(textureId: string): void;
  }

  /**
   * C++ class CUIFrameLineWnd : CUIWindow {
   *   CUIFrameLineWnd ();
   *
   *   function SetWindowName(string);
   *
   *   function GetWndPos(CUIWindow*);
   *
   *   function SetHeight(number);
   *
   *   function SetAutoDelete(boolean);
   *
   *   function AttachChild(CUIWindow*);
   *
   *   function SetWndPos(vector2);
   *
   *   function SetColor(number);
   *
   *   function GetWidth() const;
   *
   *   function DetachChild(CUIWindow*);
   *
   *   function SetPPMode();
   *
   *   function WindowName();
   *
   *   function IsShown();
   *
   *   function SetWndRect(Frect);
   *
   *   function Show(boolean);
   *
   *   function GetHeight() const;
   *
   *   function SetWidth(number);
   *
   *   function SetWndSize(vector2);
   *
   *   function IsEnabled();
   *
   *   function ResetPPMode();
   *
   *   function Enable(boolean);
   *
   *   function IsAutoDelete();
   *
   * };
   *
   * @customConstructor CUIFrameLineWnd
   */
  class XR_CUIFrameLineWnd extends XR_CUIWindow {
    public SetHeight(value: number): unknown;

    public SetColor(value: number): unknown;

    public SetWidth(value: number): unknown;
  }

  /**
   C++ class CUIFrameWindow : CUIWindow {
    CUIFrameWindow ();

    function SetWindowName(string);

    function GetWndPos(CUIWindow*);

    function SetHeight(number);

    function SetAutoDelete(boolean);

    function AttachChild(CUIWindow*);

    function SetWndPos(vector2);

    function SetColor(number);

    function GetWidth() const;

    function DetachChild(CUIWindow*);

    function SetPPMode();

    function WindowName();

    function IsShown();

    function SetWndRect(Frect);

    function Show(boolean);

    function GetHeight() const;

    function SetWidth(number);

    function SetWndSize(vector2);

    function IsEnabled();

    function ResetPPMode();

    function Enable(boolean);

    function IsAutoDelete();

  };
   */

  // todo;

  /**
   * C++ class CUILines {
   *   function GetText();
   *
   *   function SetTextST(string);
   *
   *   function SetTextColor(number);
   *
   *   function SetText(string);
   *
   *   function SetFont(CGameFont*);
   *
   *   function SetElipsis(boolean);
   *
   * };
   *
   * @customConstructor CUILines
   */

  class XR_CUILines {
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
   *   CUIListBox ();
   *
   *   function SetWindowName(string);
   *
   *   function Enable(boolean);
   *
   *   function RemoveWindow(CUIWindow*);
   *
   *   function ScrollToBegin();
   *
   *   function GetMinScrollPos();
   *
   *   function AddExistingItem(CUIListBoxItem*);
   *
   *   function AddWindow(CUIWindow*, boolean);
   *
   *   function GetWidth() const;
   *
   *   function Clear();
   *
   *   function DetachChild(CUIWindow*);
   *
   *   function SetPPMode();
   *
   *   function IsShown();
   *
   *   function Show(boolean);
   *
   *   function GetHeight() const;
   *
   *   function IsEnabled();
   *
   *   function ResetPPMode();
   *
   *   function GetWndPos(CUIWindow*);
   *
   *   function GetCurrentScrollPos();
   *
   *   function SetAutoDelete(boolean);
   *
   *   function AttachChild(CUIWindow*);
   *
   *   function AddTextItem(string);
   *
   *   function SetWndPos(vector2);
   *
   *   function ScrollToEnd();
   *
   *   function RemoveItem(CUIWindow*);
   *
   *   function GetMaxScrollPos();
   *
   *   function GetItemByIndex(number);
   *
   *   function WindowName();
   *
   *   function GetSelectedIndex();
   *
   *   function GetSelectedItem();
   *
   *   function SetWndRect(Frect);
   *
   *   function SetScrollPos(number);
   *
   *   function GetSize();
   *
   *   function RemoveAll();
   *
   *   function ShowSelectedItem(boolean);
   *
   *   function SetWndSize(vector2);
   *
   *   function GetItem(number);
   *
   *   function IsAutoDelete();
   *
   * };
   *
   * @customConstructor CUIListBox
   */
  class XR_CUIListBox extends XR_CUIScrollView {
    public AddExistingItem(item: XR_CUIListBoxItem): unknown;

    public AddTextItem(text: string): unknown;

    public RemoveItem(window: XR_CUIWindow): unknown;

    public GetItemByIndex(index: number): unknown;

    public GetSelectedIndex(): unknown;

    public GetSelectedItem(): unknown;

    public GetSize(): unknown;

    public RemoveAll(): unknown;

    public ShowSelectedItem(value: boolean): unknown;

    public GetItem(index: number): unknown;
  }

  /**
   * C++ class CUIListBoxItem : CUIFrameLineWnd {
   *   CUIListBoxItem (number);
   *
   *   function SetWindowName(string);
   *
   *   function GetWndPos(CUIWindow*);
   *
   *   function SetHeight(number);
   *
   *   function AddIconField(number);
   *
   *   function SetAutoDelete(boolean);
   *
   *   function SetTextColor(number);
   *
   *   function AddTextField(string, number);
   *
   *   function AttachChild(CUIWindow*);
   *
   *   function GetTextItem();
   *
   *   function SetWndPos(vector2);
   *
   *   function IsAutoDelete();
   *
   *   function Enable(boolean);
   *
   *   function DetachChild(CUIWindow*);
   *
   *   function SetPPMode();
   *
   *   function WindowName();
   *
   *   function IsShown();
   *
   *   function ResetPPMode();
   *
   *   function SetWndRect(Frect);
   *
   *   function GetHeight() const;
   *
   *   function SetWidth(number);
   *
   *   function Show(boolean);
   *
   *   function IsEnabled();
   *
   *   function SetWndSize(vector2);
   *
   *   function GetWidth() const;
   *
   *   function SetColor(number);
   *
   * };
   *
   * @customConstructor CUIListBoxItem
   */
  class XR_CUIListBoxItem extends XR_CUIFrameLineWnd {
    public constructor(index: number);

    public AddIconField(value: number): unknown;

    public SetTextColor(value: number): unknown;

    public AddTextField(value1: string, value2: number): unknown;

    public GetTextItem(): unknown;
  }

  /**
   * C++ class CUIListBoxItemMsgChain : CUIListBoxItem {
   *     CUIListBoxItemMsgChain (number);
   *
   *     function SetWindowName(string);
   *
   *     function Enable(boolean);
   *
   *     function SetHeight(number);
   *
   *     function AddIconField(number);
   *
   *     function SetAutoDelete(boolean);
   *
   *     function SetTextColor(number);
   *
   *     function SetColor(number);
   *
   *     function AttachChild(CUIWindow*);
   *
   *     function GetWidth() const;
   *
   *     function SetWndPos(vector2);
   *
   *     function SetWndSize(vector2);
   *
   *     function IsShown();
   *
   *     function DetachChild(CUIWindow*);
   *
   *     function SetPPMode();
   *
   *     function WindowName();
   *
   *     function AddTextField(string, number);
   *
   *     function Show(boolean);
   *
   *     function SetWndRect(Frect);
   *
   *     function GetTextItem();
   *
   *     function SetWidth(number);
   *
   *     function GetHeight() const;
   *
   *     function IsEnabled();
   *
   *     function ResetPPMode();
   *
   *     function GetWndPos(CUIWindow*);
   *
   *     function IsAutoDelete();
   *
   *   };
   *
   *  @customConstructor CUIListBoxItemMsgChain
   */
  class XR_CUIListBoxItemMsgChain extends XR_CUIListBoxItem {}

  /**
   * C++ class CUIMMShniaga : CUIWindow {
   *     const epi_main = 0;
   *     const epi_new_game = 1;
   *     const epi_new_network_game = 2;
   *
   *     function SetWindowName(string);
   *
   *     function GetWndPos(CUIWindow*);
   *
   *     function SetAutoDelete(boolean);
   *
   *     function AttachChild(CUIWindow*);
   *
   *     function ShowPage(enum CUIMMShniaga::enum_page_id);
   *
   *     function SetWndPos(vector2);
   *
   *     function SetPage(enum CUIMMShniaga::enum_page_id, string, string);
   *
   *     function SetVisibleMagnifier(boolean);
   *
   *     function DetachChild(CUIWindow*);
   *
   *     function SetPPMode();
   *
   *     function WindowName();
   *
   *     function IsShown();
   *
   *     function SetWndRect(Frect);
   *
   *     function Show(boolean);
   *
   *     function GetHeight() const;
   *
   *     function GetWidth() const;
   *
   *     function SetWndSize(vector2);
   *
   *     function IsEnabled();
   *
   *     function ResetPPMode();
   *
   *     function Enable(boolean);
   *
   *     function IsAutoDelete();
   *
   *   };
   *
   *  @customConstructor CUIMMShniaga
   */
  class XR_CUIMMShniaga extends XR_CUIWindow {
    public static epi_main: 0;
    public static epi_new_game: 1;
    public static epi_new_network_game: 2;

    public ShowPage(pageId: number): void;

    public SetPage(pageId: number, a: string, b: string): void;

    public SetVisibleMagnifier(isVisible: boolean): void;
  }

  /**
   C++ class CUIMapInfo : CUIWindow {
    CUIMapInfo ();

    function SetWindowName(string);

    function GetWndPos(CUIWindow*);

    function InitMap(string, string);

    function SetAutoDelete(boolean);

    function AttachChild(CUIWindow*);

    function SetWndPos(vector2);

    function Init(vector2, vector2);

    function DetachChild(CUIWindow*);

    function SetPPMode();

    function WindowName();

    function IsShown();

    function SetWndRect(Frect);

    function Show(boolean);

    function GetHeight() const;

    function GetWidth() const;

    function SetWndSize(vector2);

    function IsEnabled();

    function ResetPPMode();

    function Enable(boolean);

    function IsAutoDelete();

  };
   */

  // todo;

  /**
   * C++ class CUIMapList : CUIWindow {
   *     CUIMapList ();
   *
   *     function IsEmpty();
   *
   *     function StartDedicatedServer();
   *
   *     function SetWindowName(string);
   *
   *     function GetWndPos(CUIWindow*);
   *
   *     function SetModeSelector(CUISpinText*);
   *
   *     function ClearList();
   *
   *     function SetMapInfo(CUIMapInfo*);
   *
   *     function OnModeChange();
   *
   *     function LoadMapList();
   *
   *     function SetAutoDelete(boolean);
   *
   *     function GetCommandLine(string);
   *
   *     function GetCurGameType();
   *
   *     function SetWndRect(Frect);
   *
   *     function AttachChild(CUIWindow*);
   *
   *     function SaveMapList();
   *
   *     function SetWndPos(vector2);
   *
   *     function SetMapPic(CUIStatic*);
   *
   *     function SetServerParams(string);
   *
   *     function DetachChild(CUIWindow*);
   *
   *     function SetPPMode();
   *
   *     function WindowName();
   *
   *     function IsShown();
   *
   *     function SetWeatherSelector(CUIComboBox*);
   *
   *     function Show(boolean);
   *
   *     function GetHeight() const;
   *
   *     function GetWidth() const;
   *
   *     function SetWndSize(vector2);
   *
   *     function IsEnabled();
   *
   *     function ResetPPMode();
   *
   *     function Enable(boolean);
   *
   *     function IsAutoDelete();
   *
   *   };
   *
   *  @customConstructor CUIMapList
   */
  class XR_CUIMapList extends XR_CUIWindow {
    public IsEmpty(): boolean;

    public StartDedicatedServer(): void;

    public SetModeSelector(modeSelector: XR_CUISpinText): void;

    public ClearList(): void;

    public SetMapInfo(info: unknown /* CUIMapInfo*/): void;

    public OnModeChange(): void;

    public LoadMapList(): void;

    public GetCommandLine(value: string): unknown;

    public GetCurGameType(): unknown;

    public SaveMapList(): void;

    public SetMapPic(picture: XR_CUIStatic): void;

    public SetServerParams(params: string): void;

    public SetWeatherSelector(selector: XR_CUIComboBox): void;
  }

  /**
   C++ class CUIMessageBox : CUIStatic {
    CUIMessageBox ();

    function InitMessageBox(string);

    function SetWindowName(string);

    function GetWndPos(CUIWindow*);

    function SetText(string);

    function TextControl();

    function SetAutoDelete(boolean);

    function GetPassword();

    function GetHost();

    function SetStretchTexture(boolean);

    function AttachChild(CUIWindow*);

    function Enable(boolean);

    function SetTextureRect(Frect*);

    function ResetPPMode();

    function Show(boolean);

    function DetachChild(CUIWindow*);

    function SetPPMode();

    function WindowName();

    function IsShown();

    function SetWndPos(vector2);

    function SetWndRect(Frect);

    function GetHeight() const;

    function GetWidth() const;

    function InitTexture(string);

    function IsEnabled();

    function SetWndSize(vector2);

    function GetTextureRect();

    function IsAutoDelete();

  };
   */

  // todo;

  /**
   * C++ class CUIMessageBoxEx : CUIDialogWnd {
   *   CUIMessageBoxEx ();
   *
   *   function HideDialog();
   *
   *   function InitMessageBox(string);
   *
   *   function SetWindowName(string);
   *
   *   function GetWndPos(CUIWindow*);
   *
   *   function SetText(string);
   *
   *   function SetAutoDelete(boolean);
   *
   *   function GetPassword();
   *
   *   function AttachChild(CUIWindow*);
   *
   *   function GetHost();
   *
   *   function SetWndPos(vector2);
   *
   *   function ShowDialog(boolean);
   *
   *   function Enable(boolean);
   *
   *   function DetachChild(CUIWindow*);
   *
   *   function SetPPMode();
   *
   *   function WindowName();
   *
   *   function IsShown();
   *
   *   function GetHolder();
   *
   *   function SetWndRect(Frect);
   *
   *   function GetHeight() const;
   *
   *   function ResetPPMode();
   *
   *   function GetWidth() const;
   *
   *   function IsEnabled();
   *
   *   function SetWndSize(vector2);
   *
   *   function Show(boolean);
   *
   *   function IsAutoDelete();
   *
   * };
   *
   * @customConstructor CUIMessageBoxEx
   */
  class XR_CUIMessageBoxEx extends XR_CUIDialogWnd {
    public InitMessageBox(value: string): void;

    public SetText(text: string): void;

    public GetPassword(): string;

    public GetHost(): unknown;
  }

  /**
   C++ class CUIProgressBar : CUIWindow {
    CUIProgressBar ();

    function SetWindowName(string);

    function GetWndPos(CUIWindow*);

    function GetRange_max();

    function SetAutoDelete(boolean);

    function GetRange_min();

    function SetProgressPos(number);

    function AttachChild(CUIWindow*);

    function SetWndPos(vector2);

    function GetProgressPos();

    function DetachChild(CUIWindow*);

    function SetPPMode();

    function WindowName();

    function IsShown();

    function SetWndRect(Frect);

    function Show(boolean);

    function GetHeight() const;

    function GetWidth() const;

    function SetWndSize(vector2);

    function IsEnabled();

    function ResetPPMode();

    function Enable(boolean);

    function IsAutoDelete();

  };
   */

  // todo;

  /**
   C++ class CUIPropertiesBox : CUIFrameWindow {
    CUIPropertiesBox ();

    function SetWindowName(string);

    function GetWndPos(CUIWindow*);

    function SetHeight(number);

    function AddItem(string);

    function SetAutoDelete(boolean);

    function AutoUpdateSize();

    function RemoveItem(number);

    function RemoveAll();

    function AttachChild(CUIWindow*);

    function Hide();

    function SetWndPos(vector2);

    function IsAutoDelete();

    function Enable(boolean);

    function DetachChild(CUIWindow*);

    function SetPPMode();

    function WindowName();

    function IsShown();

    function ResetPPMode();

    function SetWndRect(Frect);

    function GetHeight() const;

    function SetWidth(number);

    function Show(boolean);
    function Show(number, number);

    function IsEnabled();

    function SetWndSize(vector2);

    function GetWidth() const;

    function SetColor(number);

  };
   */

  // todo;

  /**
   * C++ class CUIScrollView : CUIWindow {
   *   CUIScrollView ();
   *
   *   function SetWindowName(string);
   *
   *   function GetWndPos(CUIWindow*);
   *
   *   function SetScrollPos(number);
   *
   *   function RemoveWindow(CUIWindow*);
   *
   *   function ScrollToBegin();
   *
   *   function SetAutoDelete(boolean);
   *
   *   function GetCurrentScrollPos();
   *
   *   function AddWindow(CUIWindow*, boolean);
   *
   *   function GetMaxScrollPos();
   *
   *   function AttachChild(CUIWindow*);
   *
   *   function GetMinScrollPos();
   *
   *   function SetWndPos(vector2);
   *
   *   function ScrollToEnd();
   *
   *   function Clear();
   *
   *   function DetachChild(CUIWindow*);
   *
   *   function SetPPMode();
   *
   *   function WindowName();
   *
   *   function IsShown();
   *
   *   function SetWndRect(Frect);
   *
   *   function Show(boolean);
   *
   *   function GetHeight() const;
   *
   *   function GetWidth() const;
   *
   *   function SetWndSize(vector2);
   *
   *   function IsEnabled();
   *
   *   function ResetPPMode();
   *
   *   function Enable(boolean);
   *
   *   function IsAutoDelete();
   *
   * };
   *
   * @customConstructor CUIScrollView
   */
  class XR_CUIScrollView extends XR_CUIWindow {
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
   C++ class CUISleepStatic : CUIStatic {
    CUISleepStatic ();

    function SetWindowName(string);

    function GetWndPos(CUIWindow*);

    function TextControl();

    function SetAutoDelete(boolean);

    function SetStretchTexture(boolean);

    function AttachChild(CUIWindow*);

    function Enable(boolean);

    function SetTextureRect(Frect*);

    function ResetPPMode();

    function Show(boolean);

    function DetachChild(CUIWindow*);

    function SetPPMode();

    function WindowName();

    function IsShown();

    function SetWndPos(vector2);

    function SetWndRect(Frect);

    function GetHeight() const;

    function GetWidth() const;

    function InitTexture(string);

    function IsEnabled();

    function SetWndSize(vector2);

    function GetTextureRect();

    function IsAutoDelete();

  };
   */

  // todo;

  /**
   C++ class CUISpinFlt : CUICustomSpin {
    CUISpinFlt ();

    function SetWindowName(string);

    function GetWndPos(CUIWindow*);

    function GetText();

    function SetAutoDelete(boolean);

    function AttachChild(CUIWindow*);

    function SetWndPos(vector2);

    function DetachChild(CUIWindow*);

    function SetPPMode();

    function WindowName();

    function IsShown();

    function GetWidth() const;

    function SetWndRect(Frect);

    function GetHeight() const;

    function Enable(boolean);

    function ResetPPMode();

    function IsEnabled();

    function SetWndSize(vector2);

    function Show(boolean);

    function IsAutoDelete();

  };
   */

  // todo;

  /**
   C++ class CUISpinNum : CUICustomSpin {
    CUISpinNum ();

    function SetWindowName(string);

    function GetWndPos(CUIWindow*);

    function GetText();

    function SetAutoDelete(boolean);

    function AttachChild(CUIWindow*);

    function SetWndPos(vector2);

    function DetachChild(CUIWindow*);

    function SetPPMode();

    function WindowName();

    function IsShown();

    function GetWidth() const;

    function SetWndRect(Frect);

    function GetHeight() const;

    function Enable(boolean);

    function ResetPPMode();

    function IsEnabled();

    function SetWndSize(vector2);

    function Show(boolean);

    function IsAutoDelete();

  };
   */

  // todo;

  /**
   * C++ class CUISpinText : CUICustomSpin {
   *   CUISpinText ();
   *
   *   function SetWindowName(string);
   *
   *   function GetWndPos(CUIWindow*);
   *
   *   function GetText();
   *
   *   function SetAutoDelete(boolean);
   *
   *   function AttachChild(CUIWindow*);
   *
   *   function SetWndPos(vector2);
   *
   *   function DetachChild(CUIWindow*);
   *
   *   function SetPPMode();
   *
   *   function WindowName();
   *
   *   function IsShown();
   *
   *   function GetWidth() const;
   *
   *   function SetWndRect(Frect);
   *
   *   function GetHeight() const;
   *
   *   function Enable(boolean);
   *
   *   function ResetPPMode();
   *
   *   function IsEnabled();
   *
   *   function SetWndSize(vector2);
   *
   *   function Show(boolean);
   *
   *   function IsAutoDelete();
   *
   * };
   *
   * @customConstructor CUISpinText
   */
  class XR_CUISpinText extends XR_CUICustomSpin {}

  /**
   * C++ class CUIStatic : CUIWindow {
   *   CUIStatic ();
   *
   *   function SetWindowName(string);
   *
   *   function GetWndPos(CUIWindow*);
   *
   *   function TextControl();
   *
   *   function SetAutoDelete(boolean);
   *
   *   function GetTextureRect();
   *
   *   function AttachChild(CUIWindow*);
   *
   *   function SetStretchTexture(boolean);
   *
   *   function SetWndPos(vector2);
   *
   *   function SetTextureRect(Frect*);
   *
   *   function SetWndSize(vector2);
   *
   *   function DetachChild(CUIWindow*);
   *
   *   function SetPPMode();
   *
   *   function WindowName();
   *
   *   function IsShown();
   *
   *   function SetWndRect(Frect);
   *
   *   function Show(boolean);
   *
   *   function GetHeight() const;
   *
   *   function GetWidth() const;
   *
   *   function InitTexture(string);
   *
   *   function IsEnabled();
   *
   *   function ResetPPMode();
   *
   *   function Enable(boolean);
   *
   *   function IsAutoDelete();
   *
   * };
   *
   * @customConstructor CUIStatic
   */
  class XR_CUIStatic extends XR_CUIWindow {
    public TextControl(): XR_CUILines;

    public GetTextureRect(): unknown;

    public SetStretchTexture(value: boolean): unknown;

    public SetTextureRect(frect: XR_FRect): unknown;

    public InitTexture(value: string): unknown;
  }

  /**
   *  C++ class CUITabButton : CUIButton {
   *     CUITabButton ();
   *
   *     function SetWindowName(string);
   *
   *     function GetWndPos(CUIWindow*);
   *
   *     function TextControl();
   *
   *     function SetAutoDelete(boolean);
   *
   *     function Enable(boolean);
   *
   *     function AttachChild(CUIWindow*);
   *
   *     function GetTextureRect();
   *
   *     function SetWndPos(vector2);
   *
   *     function SetWndSize(vector2);
   *
   *     function SetWndRect(Frect);
   *
   *     function DetachChild(CUIWindow*);
   *
   *     function SetPPMode();
   *
   *     function WindowName();
   *
   *     function IsShown();
   *
   *     function SetTextureRect(Frect*);
   *
   *     function Show(boolean);
   *
   *     function GetHeight() const;
   *
   *     function GetWidth() const;
   *
   *     function InitTexture(string);
   *
   *     function IsEnabled();
   *
   *     function ResetPPMode();
   *
   *     function SetStretchTexture(boolean);
   *
   *     function IsAutoDelete();
   *
   *   };
   *
   * @customConstructor CUITabButton
   */

  class XR_CUITabButton extends XR_CUIButton {}

  /**
   *  C++ class CUITabControl : CUIWindow {
   *     CUITabControl ();
   *
   *     function SetWindowName(string);
   *
   *     function GetWndPos(CUIWindow*);
   *
   *     function SetAutoDelete(boolean);
   *
   *     function GetActiveId();
   *
   *     function SetActiveTab(string);
   *
   *     function GetTabsCount() const;
   *
   *     function AttachChild(CUIWindow*);
   *
   *     function GetButtonById(string);
   *
   *     function SetWndPos(vector2);
   *
   *     function RemoveAll();
   *
   *     function AddItem(CUITabButton*);
   *     function AddItem(string, string, vector2, vector2);
   *
   *     function DetachChild(CUIWindow*);
   *
   *     function SetPPMode();
   *
   *     function WindowName();
   *
   *     function IsShown();
   *
   *     function SetWndRect(Frect);
   *
   *     function Show(boolean);
   *
   *     function GetHeight() const;
   *
   *     function GetWidth() const;
   *
   *     function SetWndSize(vector2);
   *
   *     function IsEnabled();
   *
   *     function ResetPPMode();
   *
   *     function Enable(boolean);
   *
   *     function IsAutoDelete();
   *
   *   };
   *
   *   @customConstructor CUITabControl
   */
  class XR_CUITabControl extends XR_CUIWindow {
    public GetActiveId(): string;

    public SetActiveTab(id: string): string;

    public GetTabsCount(): number;

    public GetButtonById(value: string): XR_CUITabButton;

    public RemoveAll(): void;

    public AddItem(item: XR_CUITabButton): void;

    public AddItem(id: string, name: string, a: XR_vector2, b: XR_vector2): void;
  }

  /**
   C++ class CUITextWnd : CUIWindow {
    CUITextWnd ();

    function SetWndRect(Frect);

    function GetFont();

    function SetTextOffset(number, number);

    function SetWindowName(string);

    function GetWndPos(CUIWindow*);

    function SetText(string);

    function SetWndSize(vector2);

    function SetTextAlignment(enum CGameFont::EAligment);

    function SetTextComplexMode(boolean);

    function GetText();

    function SetAutoDelete(boolean);

    function GetTextColor();

    function SetTextColor(number);

    function SetFont(CGameFont*);

    function AttachChild(CUIWindow*);

    function SetTextST(string);

    function SetWndPos(vector2);

    function AdjustHeightToText();

    function AdjustWidthToText();

    function DetachChild(CUIWindow*);

    function SetPPMode();

    function WindowName();

    function IsShown();

    function SetEllipsis(boolean);

    function Show(boolean);

    function GetHeight() const;

    function GetWidth() const;

    function SetVTextAlignment(enum EVTextAlignment);

    function IsEnabled();

    function ResetPPMode();

    function Enable(boolean);

    function IsAutoDelete();

  };
   */

  // todo;

  /**
   C++ class CUITrackBar : CUIWindow {
    CUITrackBar ();

    function GetFValue();

    function SetWindowName(string);

    function GetWndPos(CUIWindow*);

    function SetAutoDelete(boolean);

    function SetCheck(boolean);

    function AttachChild(CUIWindow*);

    function SetCurrentValue();

    function SetWndPos(vector2);

    function GetCheck();

    function GetIValue();

    function DetachChild(CUIWindow*);

    function SetPPMode();

    function WindowName();

    function IsShown();

    function SetWndRect(Frect);

    function Show(boolean);

    function GetHeight() const;

    function GetWidth() const;

    function SetWndSize(vector2);

    function IsEnabled();

    function ResetPPMode();

    function Enable(boolean);

    function IsAutoDelete();

  };
   */
}
