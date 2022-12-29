declare module "xray16" {
  /**
   * C++ class CDialogHolder {
   */
  export interface IXR_CDialogHolder {
    RemoveDialogToRender(window: XR_CUIWindow): void;
    AddDialogToRender(window: XR_CUIWindow): void;
  }

  /**
   * C++ class CGameTask {
   * @customConstructor CGameTask
   */
  export class XR_CGameTask {
    public get_id(): number;
    public set_priority(value: number): unknown;
    public set_title(value: string): unknown;
    public set_map_hint(value: string): unknown;
    public get_title(): string;
    public get_icon_name(): string;
    public add_on_fail_info(value: string): unknown;
    public add_complete_func(value: string): unknown;
    public add_fail_func(value: string): unknown;
    public remove_map_locations(value: boolean): unknown;
    public add_fail_info(value: string): unknown;
    public add_complete_info(value: string): unknown;
    public set_type(value: number): unknown;
    public set_map_object_id(value: number): unknown;
    public set_description(value: string): unknown;
    public set_id(value: string): unknown;
    public add_on_fail_func(value: string): unknown;
    public add_on_complete_func(value: string): unknown;
    public set_icon_name(value: string): unknown;
    public set_map_location(value: string): unknown;
    public change_map_location(value1: string, value2: number): unknown;
    public add_on_complete_info(value: string): unknown;
    public get_priority(): number;
  }

  /**
   C++ class CPhraseScript {
    function SetScriptText(string);
    function AddHasInfo(string);
    function AddGiveInfo(string);
    function AddDisableInfo(string);
    function AddDontHasInfo(string);
    function AddAction(string);
    function AddPrecondition(string);
  };
   */
  // todo;

  /**
   C++ class CPhrase {
    function GetPhraseScript();
  };
   */
  // todo;

  /**
   C++ class CPhraseDialog {
    function AddPhrase(string, string, string, number);
  };
   */
  // todo;
}
