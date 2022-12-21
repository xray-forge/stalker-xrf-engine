export {};

declare global {
  const CUIWindow: typeof XR_CUIWindow;

  const CUIDialogWnd: typeof XR_CUIDialogWnd;

  const CUIScriptWnd: typeof XR_CUIScriptWnd;

  const CScriptXmlInit: typeof XR_CScriptXmlInit;

  const CUIFrameLineWnd: typeof XR_CUIFrameLineWnd;

  const CUIListBox: typeof XR_CUIListBox;

  const CUIListBoxItem: typeof XR_CUIListBoxItem;

  const CUIScrollView: typeof XR_CUIScrollView;

  const CUIMessageBoxEx: typeof XR_CUIMessageBoxEx;

  const CUIStatic: typeof XR_CUIStatic;

  const CUICustomSpin: typeof XR_CUICustomSpin;

  const CUISpinText: typeof XR_CUISpinText;

  const CUILines: typeof XR_CUILines;

  const CUIButton: typeof XR_CUIButton;

  const CUI3tButton: typeof XR_CUI3tButton;

  const CUICheckButton: typeof XR_CUICheckButton;

  const CUITabButton: typeof XR_CUITabButton;

  const CUITabControl: typeof XR_CUITabControl;

  const CUICustomEdit: typeof XR_CUICustomEdit;

  const CUIEditBox: typeof XR_CUIEditBox;

  const CUIEditBoxEx: typeof XR_CUIEditBoxEx;

  const CUITrackBar: typeof XR_CUITrackBar;

  const CUIListBoxItemMsgChain: typeof XR_CUIListBoxItemMsgChain;

  const CUIMMShniaga: typeof XR_CUIMMShniaga;

  const CUIMapList: typeof XR_CUIMapList;

  const CMainMenu: typeof XR_CMainMenu;

  const COptionsManager: typeof XR_COptionsManager;

  const CSavedGameWrapper: typeof XR_CSavedGameWrapper;

  const CTime: typeof XR_CTime;

  const FS: typeof XR_FS;

  const vector2: typeof XR_vector2;

  const Frect: typeof XR_FRect;

  const memory_object: () => XR_MemoryObject;

  const object_factory: () => XR_object_factory;

  const fcolor: () => XR_FColor;

  const stalker_ids: IXR_stalker_ids;

  const level: IXR_level;

  const main_menu: IXR_main_menu;

  const GAME_TYPE: XR_GAME_TYPE;

  const game_difficulty: XR_game_difficulty;

  const ui_events: IXR_ui_events;

  const key_bindings: XR_key_bindings;

  const DIK_keys: IXR_DIK_keys;
}
