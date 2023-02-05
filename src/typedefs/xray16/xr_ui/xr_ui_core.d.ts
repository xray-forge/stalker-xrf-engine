declare module "xray16" {
  /**
   * C++ class COptionsManager {
   * @customConstructor COptionsManager
   */
  export class XR_COptionsManager {
    public constructor();

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
    public AddCustomStatic(id: string, b: boolean): XR_StaticDrawableWrapper;
    public AddCustomStatic(id: string, b: boolean, n: f32): XR_StaticDrawableWrapper;
    public AddDialogToRender(window: XR_CUIWindow): void;
    public CurrentItemAtCell(): XR_game_object;
    public GetCustomStatic(value: string): XR_StaticDrawableWrapper | null;
    public HideActorMenu(): void;
    public HidePdaMenu(): void;
    public RemoveCustomStatic(id: string): void;
    public RemoveDialogToRender(window: XR_CUIWindow): void;
    public UpdateActorMenu(): void;
    public enable_fake_indicators(enabled: boolean): void;
    public hide_messages(): void;
    public show_messages(): void;
    public update_fake_indicators(u8: number, enabled: boolean): void;
    public update_fake_indicators(u8: number, value: f32): void;
  }

  /**
   * C++ class CScriptXmlInit {
   * @customConstructor CScriptXmlInit
   */
  export class XR_CScriptXmlInit {
    public constructor();

    public ParseFile(path: string): void;
    public ParseShTexInfo(path: string): void;

    public Init3tButton(selector: string, window: XR_CUIWindow | null): XR_CUI3tButton;
    public InitAnimStatic(selector: string, window: XR_CUIWindow | null): XR_CUIStatic;
    public InitCDkey(selector: string, window: XR_CUIWindow | null): XR_CUIEditBox;
    public InitCheck(selector: string, window: XR_CUIWindow | null): XR_CUICheckButton;
    public InitComboBox(selector: string, window: XR_CUIWindow | null): XR_CUIComboBox;
    public InitEditBox(selector: string, window: XR_CUIWindow | null): XR_CUIEditBox;
    public InitFrame(selector: string, window: XR_CUIWindow | null): XR_CUIFrameWindow;
    public InitFrameLine(selector: string, window: XR_CUIWindow | null): XR_CUIFrameLineWnd;
    public InitKeyBinding(selector: string, window: XR_CUIWindow | null): XR_CUIWindow;
    public InitLabel(selector: string, window: XR_CUIWindow | null): XR_CUIStatic;
    public InitList(selector: string, window: XR_CUIWindow | null): XR_CUIListWnd;
    public InitListBox<T extends XR_CUIListBoxItem = XR_CUIListBoxItem>(
      selector: string,
      window: XR_CUIWindow | null
    ): XR_CUIListBox<T>;
    public InitMMShniaga(selector: string, window: XR_CUIWindow | null): XR_CUIMMShniaga;
    public InitMPPlayerName(selector: string, window: XR_CUIWindow | null): XR_CUIEditBox;
    public InitMapInfo(selector: string, window: XR_CUIWindow | null): XR_CUIMapInfo;
    public InitMapList(selector: string, window: XR_CUIWindow | null): XR_CUIMapList;
    public InitProgressBar(selector: string, window: XR_CUIWindow | null): XR_CUIProgressBar;
    public InitScrollView(selector: string, window: XR_CUIWindow | null): XR_CUIScrollView;
    public InitServerList(selector: string, window: XR_CUIWindow | null): XR_CServerList;
    public InitSleepStatic(selector: string, window: XR_CUIWindow | null): XR_CUISleepStatic;
    public InitSpinFlt(selector: string, window: XR_CUIWindow | null): XR_CUISpinFlt;
    public InitSpinNum(selector: string, window: XR_CUIWindow | null): XR_CUISpinNum;
    public InitSpinText(selector: string, window: XR_CUIWindow | null): XR_CUISpinText;
    public InitStatic(selector: string, window: XR_CUIWindow | null): XR_CUIStatic;
    public InitTab(selector: string, window: XR_CUIWindow | null): XR_CUITabControl;
    public InitTextWnd(selector: string, window: XR_CUIWindow | null): XR_CUITextWnd;
    public InitTrackBar(selector: string, window: XR_CUIWindow | null): XR_CUITrackBar;
    public InitVerList(selector: string, window: XR_CUIWindow | null): XR_CUIVersionList;
    public InitWindow(selector: string, index: i32, window: XR_CUIWindow | null): void;
  }

  /**
   * C++ class CGameFont {
   */
  export class XR_CGameFont {
    public static readonly alCenter: 2;
    public static readonly alLeft: 0;
    public static readonly alRight: 1;
  }

  /**
   * EVTextAlignment.
   */
  export type TXR_CGameFont_alignment = EnumerateStaticsValues<typeof XR_CGameFont>;
}
