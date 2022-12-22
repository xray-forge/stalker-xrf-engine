export {};

declare global {
  /**
   * Class to handle UI xml parsing and applying.
   *
   * C++ class CScriptXmlInit {
   *   CScriptXmlInit ();
   *
   *   function InitSpinText(string, CUIWindow*);
   *
   *   function InitTab(string, CUIWindow*);
   *
   *   function InitStatic(string, CUIWindow*);
   *
   *   function InitSleepStatic(string, CUIWindow*);
   *
   *   function InitTextWnd(string, CUIWindow*);
   *
   *   function InitSpinFlt(string, CUIWindow*);
   *
   *   function InitProgressBar(string, CUIWindow*);
   *
   *   function InitSpinNum(string, CUIWindow*);
   *
   *   function InitMapList(string, CUIWindow*);
   *
   *   function ParseFile(string);
   *
   *   function InitCDkey(string, CUIWindow*);
   *
   *   function InitListBox(string, CUIWindow*);
   *
   *   function InitKeyBinding(string, CUIWindow*);
   *
   *   function InitMMShniaga(string, CUIWindow*);
   *
   *   function InitWindow(string, number, CUIWindow*);
   *
   *   function InitEditBox(string, CUIWindow*);
   *
   *   function InitCheck(string, CUIWindow*);
   *
   *   function InitScrollView(string, CUIWindow*);
   *
   *   function InitMPPlayerName(string, CUIWindow*);
   *
   *   function InitTrackBar(string, CUIWindow*);
   *
   *   function InitMapInfo(string, CUIWindow*);
   *
   *   function InitServerList(string, CUIWindow*);
   *
   *   function InitComboBox(string, CUIWindow*);
   *
   *   function InitFrameLine(string, CUIWindow*);
   *
   *   function Init3tButton(string, CUIWindow*);
   *
   *   function InitAnimStatic(string, CUIWindow*);
   *
   *   function InitFrame(string, CUIWindow*);
   *
   * };
   *
   * @customConstructor CScriptXmlInit
   */
  class XR_CScriptXmlInit {
    public ParseFile(path: string): void;

    public InitSpinText(selector: string, window: XR_CUIWindow): XR_CUISpinText;

    public InitTab(selector: string, window: XR_CUIWindow): XR_CUITabControl;

    public InitStatic(selector: string, window: XR_CUIWindow | null): XR_CUIStatic;

    public InitSleepStatic(selector: string, window: XR_CUIWindow): unknown;

    public InitTextWnd(selector: string, window: XR_CUIWindow): XR_CUITextWnd;

    public InitSpinFlt(selector: string, window: XR_CUIWindow): XR_CUISpinFlt;

    public InitProgressBar(selector: string, window: XR_CUIWindow): XR_CUIProgressBar;

    public InitSpinNum(selector: string, window: XR_CUIWindow): XR_CUISpinNum;

    public InitMapList(selector: string, window: XR_CUIWindow): XR_CUIMapList;

    public InitCDkey(selector: string, window: XR_CUIWindow): XR_CUIEditBox;

    public InitListBox<T extends XR_CUIListBoxItem = XR_CUIListBoxItem>(
      selector: string,
      window: XR_CUIWindow
    ): XR_CUIListBox<T>;

    public InitKeyBinding(selector: string, window: XR_CUIWindow): unknown;

    public InitMMShniaga(selector: string, window: XR_CUIWindow): XR_CUIMMShniaga;

    public InitWindow(selector: string, index: number, window: XR_CUIWindow): unknown;

    public InitEditBox(selector: string, window: XR_CUIWindow): XR_CUIEditBox;

    public InitCheck(selector: string, window: XR_CUIWindow): XR_CUICheckButton;

    public InitScrollView(selector: string, window: XR_CUIWindow): XR_CUIScrollView;

    public InitMPPlayerName(selector: string, window: XR_CUIWindow): unknown;

    public InitTrackBar(selector: string, window: XR_CUIWindow): XR_CUITrackBar;

    public InitMapInfo(selector: string, window: XR_CUIWindow): XR_CUIMapInfo;

    public InitServerList(selector: string, window: XR_CUIWindow): XR_CServerList;

    public InitComboBox(selector: string, window: XR_CUIWindow): XR_CUIComboBox;

    public InitFrameLine(selector: string, window: XR_CUIWindow): unknown;

    public Init3tButton(selector: string, window: XR_CUIWindow): XR_CUI3tButton;

    public InitAnimStatic(selector: string, window: XR_CUIWindow): unknown;

    public InitFrame(selector: string, window: XR_CUIWindow): unknown;
  }
}
