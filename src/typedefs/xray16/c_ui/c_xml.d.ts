declare module "xray16" {
  /**
   * C++ class CScriptXmlInit {
   * @customConstructor CScriptXmlInit
   */
  export class XR_CScriptXmlInit {
    public ParseFile(path: string): void;
    public InitSpinText(selector: string, window: XR_CUIWindow): XR_CUISpinText;
    public InitTab(selector: string, window: XR_CUIWindow): XR_CUITabControl;
    public InitStatic(selector: string, window: XR_CUIWindow | null): XR_CUIStatic;
    // todo: Check if implemented. Was planned for original game but never used.
    public InitSleepStatic(selector: string, window: XR_CUIWindow): XR_CUISleepStatic;
    public InitTextWnd(selector: string, window: XR_CUIWindow): XR_CUITextWnd;
    public InitSpinFlt(selector: string, window: XR_CUIWindow): XR_CUISpinFlt;
    public InitProgressBar(selector: string, window: XR_CUIWindow): XR_CUIProgressBar;
    public InitSpinNum(selector: string, window: XR_CUIWindow): XR_CUISpinNum;
    public InitMapList(selector: string, window: XR_CUIWindow): XR_CUIMapList;
    public InitCDkey(selector: string, window: XR_CUIWindow): XR_CUIEditBox;
    public InitKeyBinding(selector: string, window: XR_CUIWindow): unknown;
    public InitMMShniaga(selector: string, window: XR_CUIWindow): XR_CUIMMShniaga;
    public InitWindow(selector: string, index: number, window: XR_CUIWindow): XR_CUIWindow;
    public InitEditBox(selector: string, window: XR_CUIWindow): XR_CUIEditBox;
    public InitCheck(selector: string, window: XR_CUIWindow): XR_CUICheckButton;
    public InitScrollView(selector: string, window: XR_CUIWindow): XR_CUIScrollView;
    public InitMPPlayerName(selector: string, window: XR_CUIWindow): unknown;
    public InitTrackBar(selector: string, window: XR_CUIWindow): XR_CUITrackBar;
    public InitMapInfo(selector: string, window: XR_CUIWindow): XR_CUIMapInfo;
    public InitServerList(selector: string, window: XR_CUIWindow): XR_CServerList;
    public InitComboBox(selector: string, window: XR_CUIWindow): XR_CUIComboBox;
    public InitFrameLine(selector: string, window: XR_CUIWindow): XR_CUIFrameLineWnd;
    public Init3tButton(selector: string, window: XR_CUIWindow): XR_CUI3tButton;
    public InitAnimStatic(selector: string, window: XR_CUIWindow): XR_CUIStatic;
    public InitFrame(selector: string, window: XR_CUIWindow): XR_CUIFrameWindow;
    public InitListBox<T extends XR_CUIListBoxItem = XR_CUIListBoxItem>(
      selector: string,
      window: XR_CUIWindow
    ): XR_CUIListBox<T>;
  }
}
