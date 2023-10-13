import {
  CScriptXmlInit,
  CUIListBox,
  CUIMessageBoxEx,
  CUIScriptWnd,
  CUIStatic,
  CUITextWnd,
  CUIWindow,
  DIK_keys,
  dik_to_bind,
  Frect,
  key_bindings,
  LuabindClass,
  ui_events,
  valid_saved_game,
} from "xray16";

import { registry } from "@/engine/core/database";
import { LoadItem } from "@/engine/core/ui/menu/load/LoadItem";
import {
  deleteGameSave,
  getFileDataForGameSave,
  getGameSavesList,
  isGameSaveFileExist,
  loadGameSave,
} from "@/engine/core/utils/game_save";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { create2dVector } from "@/engine/core/utils/vector";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import {
  ClientObject,
  FSItem,
  LuaArray,
  Optional,
  TIndex,
  TKeyCode,
  TLabel,
  TName,
  TPath,
  TUIEvent,
  Vector2D,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\LoadDialog.component";

/**
 * Main menu window to load game saves.
 */
@LuabindClass()
export class LoadDialog extends CUIScriptWnd {
  public owner: CUIScriptWnd;

  public fileItemMainSize!: Vector2D;
  public fileItemInnerNameTextSize!: Vector2D;
  public fileItemDdSize!: Vector2D;

  public uiForm!: CUIStatic;
  public uiPicture!: CUIStatic;
  public uiFileCaption!: CUITextWnd;
  public uiFileData!: CUITextWnd;
  public uiListBox!: CUIListBox<LoadItem>;
  public uiMessageBox!: CUIMessageBoxEx;
  public messageBoxMode: number = 0;

  public constructor(owner: CUIScriptWnd) {
    super();

    this.owner = owner;

    this.initControls();
    this.initCallbacks();
  }

  public initControls(): void {
    this.SetWndRect(new Frect().set(0, 0, 1024, 768));

    const xml: CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));
    xml.InitStatic("background", this);

    const window: CUIWindow = new CUIWindow();

    xml.InitWindow("file_item:main", 0, window);
    this.fileItemMainSize = create2dVector(window.GetWidth(), window.GetHeight());

    xml.InitWindow("file_item:fn", 0, window);
    this.fileItemInnerNameTextSize = create2dVector(window.GetWidth(), window.GetHeight());

    xml.InitWindow("file_item:fd", 0, window);
    this.fileItemDdSize = create2dVector(window.GetWidth(), window.GetHeight());

    this.uiForm = xml.InitStatic("form", this);
    xml.InitStatic("form:caption", this.uiForm);

    this.uiPicture = xml.InitStatic("form:picture", this.uiForm);

    // -- xml.InitStatic("form:file_info", this.form);

    this.uiFileCaption = xml.InitTextWnd("form:file_caption", this.uiForm);
    this.uiFileData = xml.InitTextWnd("form:file_data", this.uiForm);

    xml.InitFrame("form:list_frame", this.uiForm);

    this.uiListBox = xml.InitListBox("form:list", this.uiForm);
    this.uiListBox.ShowSelectedItem(true);

    this.Register(this.uiListBox, "list_window");
    this.Register(xml.Init3tButton("form:btn_load", this.uiForm), "button_load");
    this.Register(xml.Init3tButton("form:btn_delete", this.uiForm), "button_del");
    this.Register(xml.Init3tButton("form:btn_cancel", this.uiForm), "button_back");

    this.uiMessageBox = new CUIMessageBoxEx();
    this.Register(this.uiMessageBox, "message_box");
  }

  public initCallbacks(): void {
    this.AddCallback("button_load", ui_events.BUTTON_CLICKED, () => this.onLoadButtonClicked(), this);
    this.AddCallback("button_back", ui_events.BUTTON_CLICKED, () => this.onBackButtonClicked(), this);
    this.AddCallback("button_del", ui_events.BUTTON_CLICKED, () => this.onDeleteButtonClicked(), this);
    this.AddCallback("message_box", ui_events.MESSAGE_BOX_YES_CLICKED, () => this.onConfirmedLoadClicked(), this);
    this.AddCallback("message_box", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.onConfirmedLoadClicked(), this);

    this.AddCallback("list_window", ui_events.LIST_ITEM_CLICKED, () => this.onListItemClicked(), this);
    this.AddCallback("list_window", ui_events.WINDOW_LBUTTON_DB_CLICK, () => this.onListItemDoubleClicked(), this);
  }

  public fillList(): void {
    this.uiListBox.RemoveAll();

    const savesList: LuaArray<FSItem> = getGameSavesList();

    for (const [, file] of savesList) {
      const filename: TName = string.sub(
        file.NameFull(),
        0,
        string.len(file.NameFull()) - string.len(forgeConfig.SAVE.GAME_SAVE_EXTENSION)
      );
      const datetime: TLabel = "[" + file.ModifDigitOnly() + "]";

      this.addItemToList(filename, datetime);
    }
  }

  public onListItemClicked(): void {
    logger.info("List item selected");

    if (this.uiListBox.GetSize() === 0) {
      return;
    }

    const item: Optional<LoadItem> = this.uiListBox.GetSelectedItem();

    if (item === null) {
      this.uiFileCaption.SetText("");
      this.uiFileData.SetText("");

      const rect: Frect = this.uiPicture.GetTextureRect();

      this.uiPicture.InitTexture("ui_ui_noise");
      this.uiPicture.SetTextureRect(new Frect().set(rect.x1, rect.y1, rect.x2, rect.y2));

      return;
    }

    const itemText: TLabel = item.uiInnerNameText.GetText();

    this.uiFileCaption.SetText(itemText);
    this.uiFileCaption.SetEllipsis(true);
    this.uiFileData.SetText(getFileDataForGameSave(itemText));

    if (!isGameSaveFileExist(itemText + forgeConfig.SAVE.GAME_SAVE_EXTENSION)) {
      this.uiListBox.RemoveItem(item);

      return;
    }

    const rect: Frect = this.uiPicture.GetTextureRect();

    if (isGameSaveFileExist(itemText + ".dds")) {
      this.uiPicture.InitTexture(itemText);
    } else {
      this.uiPicture.InitTexture("ui_ui_noise");
    }

    this.uiPicture.SetTextureRect(new Frect().set(rect.x1, rect.y1, rect.x2, rect.y2));
  }

  public onListItemDoubleClicked(): void {
    logger.info("List item double-clicked");
    this.onLoadButtonClicked();
  }

  public onConfirmedLoadClicked(): void {
    logger.info("Message yes confirmed");

    const index: TIndex = this.uiListBox.GetSelectedIndex();

    if (index === -1) {
      return;
    }

    if (this.messageBoxMode === 1) {
      const item: LoadItem = this.uiListBox.GetItemByIndex(index);
      const innerNameTextame: string = item.uiInnerNameText.GetText();

      deleteGameSave(innerNameTextame);

      this.uiListBox.RemoveItem(item);

      this.onListItemClicked();
    } else if (this.messageBoxMode === 2) {
      this.loadGameInternal();
    }

    this.messageBoxMode = 0;
  }

  public loadGameInternal(): void {
    logger.info("Load game internal");

    if (this.uiListBox.GetSize() === 0) {
      return;
    }

    const index: TIndex = this.uiListBox.GetSelectedIndex();

    if (index === -1) {
      return;
    }

    const item: LoadItem = this.uiListBox.GetItemByIndex(index);
    const innerNameTextName: TName = item.uiInnerNameText.GetText();

    loadGameSave(innerNameTextName);
  }

  public onLoadButtonClicked(): void {
    logger.info("Load game clicked");

    if (this.uiListBox.GetSize() === 0) {
      return;
    }

    const item = this.uiListBox.GetSelectedItem();

    if (item === null) {
      return;
    }

    const innerNameTextName: TName = item.uiInnerNameText.GetText();

    if (!valid_saved_game(innerNameTextName)) {
      this.messageBoxMode = 0;
      this.uiMessageBox.InitMessageBox("message_box_invalid_saved_game");
      this.uiMessageBox.ShowDialog(true);

      return;
    }

    if (registry.simulator === null) {
      this.loadGameInternal();

      return;
    }

    const actor: Optional<ClientObject> = registry.actor;

    if (actor !== null && !actor.alive()) {
      this.loadGameInternal();

      return;
    }

    this.messageBoxMode = 2;
    this.uiMessageBox.InitMessageBox("message_box_confirm_load_save");
    this.uiMessageBox.ShowDialog(true);
  }

  public onBackButtonClicked(): void {
    logger.info("Back clicked");

    this.owner.ShowDialog(true);
    this.HideDialog();
    this.owner.Show(true);
  }

  /**
   * Delete game save button clicked.
   */
  public onDeleteButtonClicked(): void {
    logger.info("Delete clicked");

    if (this.uiListBox.GetSize() === 0) {
      return;
    }

    const index: TIndex = this.uiListBox.GetSelectedIndex();

    if (index === -1) {
      return;
    }

    this.messageBoxMode = 1;

    this.uiMessageBox.InitMessageBox("message_box_delete_file_name");
    this.uiMessageBox.ShowDialog(true);
  }

  /**
   * Handle keyboard button press.
   */
  public override OnKeyboard(key: TKeyCode, event: TUIEvent): boolean {
    super.OnKeyboard(key, event);

    const bind: number = dik_to_bind(key);

    if (bind === key_bindings.kQUIT) {
      this.onBackButtonClicked();
    }

    if (key === DIK_keys.DIK_RETURN && event === ui_events.WINDOW_KEY_PRESSED) {
      this.onLoadButtonClicked();
    }

    return true;
  }

  public addItemToList(filename: string, datetime: string): void {
    const loadItem: LoadItem = new LoadItem(this.fileItemMainSize.y, this.fileItemDdSize.x, datetime);

    loadItem.SetWndSize(this.fileItemMainSize);
    loadItem.uiInnerNameText.SetWndPos(create2dVector(0, 0));
    loadItem.uiInnerNameText.SetWndSize(this.fileItemInnerNameTextSize);
    loadItem.uiInnerNameText.SetText(filename);
    loadItem.uiInnerAgeText.SetWndPos(create2dVector(this.fileItemInnerNameTextSize.x + 4, 0));
    loadItem.uiInnerAgeText.SetWndSize(this.fileItemDdSize);

    this.uiListBox.AddExistingItem(loadItem);
  }
}
