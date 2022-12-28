declare module "xray16" {
  /**
   * C++ class CDialogHolder {
   */
  export interface IXR_CDialogHolder {
    RemoveDialogToRender(window: XR_CUIWindow): void;
    AddDialogToRender(window: XR_CUIWindow): void;
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
   C++ class CGameTask {
    CGameTask ();

    function get_id();

    function set_priority(number);

    function set_title(string);

    function set_map_hint(string);

    function get_title();

    function add_on_fail_info(string);

    function add_complete_func(string);

    function add_fail_func(string);

    function remove_map_locations(boolean);

    function add_fail_info(string);

    function add_complete_info(string);

    function set_type(number);

    function set_map_object_id(number);

    function set_description(string);

    function set_id(string);

    function add_on_fail_func(string);

    function add_on_complete_func(string);

    function set_icon_name(string);

    function set_map_location(string);

    function change_map_location(string, number);

    function add_on_complete_info(string);

    function get_priority();

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
