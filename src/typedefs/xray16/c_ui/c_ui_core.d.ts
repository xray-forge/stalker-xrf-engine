declare module "xray16" {
  /**
   * C++ class COptionsManager {
   * @customConstructor COptionsManager
   */
  export class XR_COptionsManager {
    public SendMessage2Group(group: string, message: string): void;
    public UndoGroup(group: string): void;
    public SaveBackupValues(group: string): void;
    public IsGroupChanged(group: string): boolean;
    public SaveValues(group: string): void;
    public SetCurrentValues(group: string): void;
    public NeedSystemRestart(): boolean;
    public NeedVidRestart(): boolean;
    public OptionsPostAccept(): void;
  }

  /**
   * C++ class CMainMenu {
   * @customConstructor CMainMenu
   */
  export class XR_CMainMenu {
    public GetCDKey(): string;
    public GetAccountMngr(): XR_account_manager;
    public GetDemoInfo(fileName: string): XR_demo_info | null;
    public GetPatchProgress(): XR_Patch_Dawnload_Progress;
    public GetProfileStore(): XR_profile_store;
    public GetGSVer(): string;
    public GetLoginMngr(): XR_login_manager;
    public GetPlayerName(): string;
    public CancelDownload(): void;
    public ValidateCDKey(): boolean;
  }

  /**
   * C++ class CUIGameCustom {
   * @customConstructor CUIGameCustom
   */
  export class XR_CUIGameCustom {
    public HidePdaMenu(): unknown;
    public HideActorMenu(): unknown;
    public AddDialogToRender(window: XR_CUIWindow): unknown;
    public RemoveDialogToRender(window: XR_CUIWindow): unknown;
    public show_messages(): unknown;
    public GetCustomStatic(value: string): unknown;
    public AddCustomStatic(a: string, b:boolean): unknown;
    public hide_messages(): unknown;
    public RemoveCustomStatic(value:string): unknown;
  }

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

  /**
   * C++ class CGameFont {
   */
  export class XR_CGameFont {
    public static alCenter: 2;
    public static alLeft: 0;
    public static alRight: 1;
  }
}
