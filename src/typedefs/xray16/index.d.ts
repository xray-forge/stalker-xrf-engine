declare module "xray16" {
  export const CScriptXmlInit: typeof XR_CScriptXmlInit;
  export const CUIWindow: typeof XR_CUIWindow;
  export const CUIDialogWnd: typeof XR_CUIDialogWnd;
  export const CUIScriptWnd: typeof XR_CUIScriptWnd;
  export const CUIFrameLineWnd: typeof XR_CUIFrameLineWnd;
  export const CUIListBox: typeof XR_CUIListBox;
  export const CUIListBoxItem: typeof XR_CUIListBoxItem;
  export const CUIScrollView: typeof XR_CUIScrollView;
  export const CUIMessageBoxEx: typeof XR_CUIMessageBoxEx;
  export const CUIStatic: typeof XR_CUIStatic;
  export const CUICustomSpin: typeof XR_CUICustomSpin;
  export const CUISpinText: typeof XR_CUISpinText;
  export const CUISpinNum: typeof XR_CUISpinNum;
  export const CUISpinFlt: typeof XR_CUISpinFlt;
  export const CUILines: typeof XR_CUILines;
  export const CUIButton: typeof XR_CUIButton;
  export const CUI3tButton: typeof XR_CUI3tButton;
  export const CUICheckButton: typeof XR_CUICheckButton;
  export const CUITabButton: typeof XR_CUITabButton;
  export const CUITabControl: typeof XR_CUITabControl;
  export const CUICustomEdit: typeof XR_CUICustomEdit;
  export const CUIEditBox: typeof XR_CUIEditBox;
  export const CUIEditBoxEx: typeof XR_CUIEditBoxEx;
  export const CUITrackBar: typeof XR_CUITrackBar;
  export const CUIListBoxItemMsgChain: typeof XR_CUIListBoxItemMsgChain;
  export const CUIMMShniaga: typeof XR_CUIMMShniaga;
  export const CUIMapList: typeof XR_CUIMapList;
  export const CUIMapInfo: typeof XR_CUIMapInfo;

  export const CServerList: typeof XR_CServerList;
  export const COptionsManager: typeof XR_COptionsManager;
  export const CMainMenu: typeof XR_CMainMenu;
  export const CSavedGameWrapper: typeof XR_CSavedGameWrapper;
  export const SServerFilters: typeof XR_SServerFilters;
  export const CTime: typeof XR_CTime;
  export const CGameFont: typeof XR_CGameFont;

  export const connect_error_cb: typeof XR_connect_error_cb;
  export const login_operation_cb: typeof XR_login_operation_cb;
  export const account_operation_cb: typeof XR_account_operation_cb;
  export const account_profiles_cb: typeof XR_account_profiles_cb;
  export const found_email_cb: typeof XR_found_email_cb;
  export const store_operation_cb: typeof XR_store_operation_cb;
  export const suggest_nicks_cb: typeof XR_suggest_nicks_cb;

  export const demo_info: typeof XR_demo_info;
  export const demo_player_info: typeof XR_demo_player_info;

  export const object: typeof XR_object;
  export const anim: typeof XR_anim;
  export const move: typeof XR_move;
  export const patrol: typeof XR_patrol;
  export const look: typeof XR_look;

  export const game_object: typeof XR_game_object;
  export const object_binder: typeof XR_object_binder;
  export const entity_action: typeof XR_entity_action;

  export const FactionState: typeof XR_FactionState;
  export const world_state: typeof XR_world_state;
  export const property_storage: typeof XR_property_storage;
  export const property_evaluator: typeof XR_property_evaluator;
  export const property_evaluator_const: typeof XR_property_evaluator_const;
  export const world_property: typeof XR_world_property;
  export const action_base: typeof XR_action_base;
  export const action_planner: typeof XR_action_planner;
  export const planner_action: typeof XR_planner_action;

  export const cse_alife_item: typeof XR_cse_alife_item;
  export const cse_alife_creature_actor: typeof XR_cse_alife_creature_actor;
  export const cse_alife_monster_base: typeof XR_cse_alife_monster_base;
  export const cse_alife_item_artefact: typeof XR_cse_alife_item_artefact;
  export const cse_alife_inventory_box: typeof XR_cse_alife_inventory_box;
  export const cse_alife_item_explosive: typeof XR_cse_alife_item_explosive;
  export const cse_alife_item_ammo: typeof XR_cse_alife_item_ammo;
  export const cse_alife_item_pda: typeof XR_cse_alife_item_pda;
  export const cse_alife_item_detector: typeof XR_cse_alife_item_detector;
  export const cse_alife_item_torch: typeof XR_cse_alife_item_torch;
  export const cse_alife_item_grenade: typeof XR_cse_alife_item_grenade;
  export const cse_alife_creature_abstract: typeof XR_cse_alife_creature_abstract;
  export const cse_alife_item_custom_outfit: typeof XR_cse_alife_item_custom_outfit;
  export const cse_alife_item_helmet: typeof XR_cse_alife_item_helmet;
  export const cse_alife_item_weapon: typeof XR_cse_alife_item_weapon;
  export const cse_alife_item_weapon_magazined: typeof XR_cse_alife_item_weapon_magazined;
  export const cse_alife_item_weapon_magazined_w_gl: typeof XR_cse_alife_item_weapon_magazined_w_gl;
  export const cse_alife_item_weapon_auto_shotgun: typeof XR_cse_alife_item_weapon_auto_shotgun;
  export const cse_alife_item_weapon_shotgun: typeof XR_cse_alife_item_weapon_shotgun;
  export const cse_alife_object_physic: typeof XR_cse_alife_object_physic;
  export const cse_alife_object_hanging_lamp: typeof XR_cse_alife_object_hanging_lamp;
  export const cse_alife_level_changer: typeof XR_cse_alife_level_changer;
  export const cse_alife_human_stalker: typeof XR_cse_alife_human_stalker;

  export const ini_file: typeof XR_ini_file;
  export const clsid: typeof XR_clsid;
  export const vector2: typeof XR_vector2;
  export const vector: typeof XR_vector;

  export const fcolor: typeof XR_fcolor;
  export const stalker_ids: typeof XR_stalker_ids;
  export const award_pair_t: typeof XR_award_pair_t;
  export const game_difficulty: typeof XR_game_difficulty;
  export const ui_events: typeof XR_ui_events;
  export const callback: typeof XR_callback;

  export const key_bindings: typeof XR_key_bindings;
  export const DIK_keys: typeof XR_DIK_keys;
  export const GAME_TYPE: typeof XR_GAME_TYPE;

  export const FS: typeof XR_FS;
  export const CGameGraph: typeof XR_CGameGraph;
  export const CALifeSmartTerrainTask: typeof XR_CALifeSmartTerrainTask;
  export const CSightParams: typeof XR_CSightParams;
  export const Frect: typeof XR_Frect;

  // Namespaces section:

  export const level: IXR_level;
  export const main_menu: IXR_main_menu;
  export const game: IXR_game;
  export const actor_stats: IXR_actor_stats;
  export const relation_registry: IXR_relation_registry;
}
