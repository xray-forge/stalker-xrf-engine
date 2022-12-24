export {};

declare global {
  /**
   *    C++ class COptionsManager {
   *     COptionsManager ();
   *
   *     function SendMessage2Group(string, string);
   *
   *     function UndoGroup(string);
   *
   *     function SaveBackupValues(string);
   *
   *     function IsGroupChanged(string);
   *
   *     function SaveValues(string);
   *
   *     function SetCurrentValues(string);
   *
   *     function NeedSystemRestart();
   *
   *     function NeedVidRestart();
   *
   *     function OptionsPostAccept();
   *
   *   };
   *
   *  @customConstructor COptionsManager
   */
  class XR_COptionsManager {
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
   *   C++ class CMainMenu {
   *     function GetCDKey();
   *
   *     function GetAccountMngr();
   *
   *     function GetDemoInfo(string);
   *
   *     function GetPatchProgress();
   *
   *     function GetProfileStore();
   *
   *     function GetGSVer();
   *
   *     function CancelDownload();
   *
   *     function GetLoginMngr();
   *
   *     function ValidateCDKey();
   *
   *     function GetPlayerName();
   *
   *   };
   *
   *   @customConstructor CMainMenu
   */

  class XR_CMainMenu {
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
   *     function HidePdaMenu();
   *
   *     function HideActorMenu();
   *
   *     function AddDialogToRender(CUIWindow*);
   *
   *     function RemoveDialogToRender(CUIWindow*);
   *
   *     function show_messages();
   *
   *     function GetCustomStatic(string);
   *
   *     function AddCustomStatic(string, boolean);
   *
   *     function hide_messages();
   *
   *     function RemoveCustomStatic(string);
   *
   *   };
   *
   *  @customConstructor CUIGameCustom
   */
  class XR_CUIGameCustom {
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
   *    C++ class profile {
   *     function unique_nick() const;
   *
   *     function online() const;
   *
   *   };
   */
  class XR_profile {
    public unique_nick(): string;
    public online(): boolean;
  }
}
