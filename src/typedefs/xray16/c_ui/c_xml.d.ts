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

    public InitSpinText(value: string, window: XR_CUIWindow): unknown;

    public InitTab(value: string, window: XR_CUIWindow): unknown;

    public InitStatic(element: string, window: XR_CUIWindow): XR_CUIStatic;

    public InitSleepStatic(value: string, window: XR_CUIWindow): unknown;

    public InitTextWnd(value: string, window: XR_CUIWindow): unknown;

    public InitSpinFlt(value: string, window: XR_CUIWindow): unknown;

    public InitProgressBar(value: string, window: XR_CUIWindow): unknown;

    public InitSpinNum(value: string, window: XR_CUIWindow): XR_CUISpinText;

    public InitMapList(value: string, window: XR_CUIWindow): unknown;

    public ParseFile(path: string): unknown;

    public InitCDkey(value: string, window: XR_CUIWindow): unknown;

    public InitListBox(value: string, window: XR_CUIWindow): XR_CUIListBox;

    public InitKeyBinding(value: string, window: XR_CUIWindow): unknown;

    public InitMMShniaga(value: string, window: XR_CUIWindow): unknown;

    public InitWindow(value: string, another: number, window: XR_CUIWindow): unknown;

    public InitEditBox(value: string, window: XR_CUIWindow): unknown;

    public InitCheck(value: string, window: XR_CUIWindow): unknown;

    public InitScrollView(value: string, window: XR_CUIWindow): unknown;

    public InitMPPlayerName(value: string, window: XR_CUIWindow): unknown;

    public InitTrackBar(value: string, window: XR_CUIWindow): unknown;

    public InitMapInfo(value: string, window: XR_CUIWindow): unknown;

    public InitServerList(value: string, window: XR_CUIWindow): unknown;

    public InitComboBox(value: string, window: XR_CUIWindow): unknown;

    public InitFrameLine(value: string, window: XR_CUIWindow): unknown;

    public Init3tButton(value: string, window: XR_CUIWindow): XR_CUI3tButton;

    public InitAnimStatic(value: string, window: XR_CUIWindow): unknown;

    public InitFrame(value: string, window: XR_CUIWindow): unknown;

  }

}
