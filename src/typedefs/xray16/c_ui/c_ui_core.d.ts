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
   * C++ class profile {
   */
  export class XR_profile {
    public unique_nick(): string;
    public online(): boolean;
  }
}
