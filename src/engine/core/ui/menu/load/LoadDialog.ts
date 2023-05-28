import {
  alife,
  bit_or,
  CConsole,
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
  FS,
  FS_item,
  get_console,
  getFS,
  key_bindings,
  LuabindClass,
  TXR_DIK_key,
  TXR_ui_event,
  ui_events,
  valid_saved_game,
  vector2,
} from "xray16";

import { registry } from "@/engine/core/database";
import { LoadItem } from "@/engine/core/ui/menu/load/LoadItem";
import { deleteGameSave, gatFileDataForGameSave, isGameSaveFileExist } from "@/engine/core/utils/game_save";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { roots } from "@/engine/lib/constants/roots";
import { textures } from "@/engine/lib/constants/textures";
import {
  ClientObject,
  FSFileListEX,
  FSItem,
  Optional,
  TKeyCode,
  TLabel,
  TName,
  TUIEvent,
  Vector2D,
} from "@/engine/lib/types";

const base: string = "menu\\LoadDialog.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class LoadDialog extends CUIScriptWnd {
  public owner: CUIScriptWnd;

  public fileItemMainSize!: Vector2D;
  public fileItemInnerNameTextSize!: Vector2D;
  public fileItemDdSize!: Vector2D;

  public form!: CUIStatic;
  public picture!: CUIStatic;
  public fileCaption!: CUITextWnd;
  public fileData!: CUITextWnd;
  public listBox!: CUIListBox<LoadItem>;
  public messageBox!: CUIMessageBoxEx;
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
    this.fileItemMainSize = new vector2().set(window.GetWidth(), window.GetHeight());

    xml.InitWindow("file_item:fn", 0, window);
    this.fileItemInnerNameTextSize = new vector2().set(window.GetWidth(), window.GetHeight());

    xml.InitWindow("file_item:fd", 0, window);
    this.fileItemDdSize = new vector2().set(window.GetWidth(), window.GetHeight());

    this.form = xml.InitStatic("form", this);
    xml.InitStatic("form:caption", this.form);

    this.picture = xml.InitStatic("form:picture", this.form);

    // -- xml.InitStatic("form:file_info", this.form);

    this.fileCaption = xml.InitTextWnd("form:file_caption", this.form);
    this.fileData = xml.InitTextWnd("form:file_data", this.form);

    xml.InitFrame("form:list_frame", this.form);

    this.listBox = xml.InitListBox("form:list", this.form);
    this.listBox.ShowSelectedItem(true);

    this.Register(this.listBox, "list_window");
    this.Register(xml.Init3tButton("form:btn_load", this.form), "button_load");
    this.Register(xml.Init3tButton("form:btn_delete", this.form), "button_del");
    this.Register(xml.Init3tButton("form:btn_cancel", this.form), "button_back");

    this.messageBox = new CUIMessageBoxEx();
    this.Register(this.messageBox, "message_box");
  }

  public initCallbacks(): void {
    this.AddCallback("button_load", ui_events.BUTTON_CLICKED, () => this.onLoadButtonClicked(), this);
    this.AddCallback("button_back", ui_events.BUTTON_CLICKED, () => this.onBackButtonClicked(), this);
    this.AddCallback("button_del", ui_events.BUTTON_CLICKED, () => this.onDeleteButtonClicked(), this);
    this.AddCallback("message_box", ui_events.MESSAGE_BOX_YES_CLICKED, () => this.onConfirmedLoad(), this);
    this.AddCallback("message_box", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.onConfirmedLoad(), this);

    this.AddCallback("list_window", ui_events.LIST_ITEM_CLICKED, () => this.onListItemClicked(), this);
    this.AddCallback("list_window", ui_events.WINDOW_LBUTTON_DB_CLICK, () => this.onListItemDoubleClicked(), this);
  }

  public fillList(): void {
    this.listBox.RemoveAll();

    const fs: FS = getFS();
    const fileList: FSFileListEX = fs.file_list_open_ex(
      roots.gameSaves,
      bit_or(FS.FS_ListFiles, FS.FS_RootOnly),
      "*" + gameConfig.GAME_SAVE_EXTENSION
    );

    fileList.Sort(FS.FS_sort_by_modif_down);

    for (let it = 0; it < fileList.Size(); it += 1) {
      const file: FSItem = fileList.GetAt(it);
      const filename: TName = string.sub(
        file.NameFull(),
        0,
        string.len(file.NameFull()) - string.len(gameConfig.GAME_SAVE_EXTENSION)
      );
      const datetime: TLabel = "[" + file.ModifDigitOnly() + "]";

      this.AddItemToList(filename, datetime);
    }
  }

  public onListItemClicked(): void {
    logger.info("List item selected");

    if (this.listBox.GetSize() === 0) {
      return;
    }

    const item: Optional<LoadItem> = this.listBox.GetSelectedItem();

    if (item === null) {
      this.fileCaption.SetText("");
      this.fileData.SetText("");

      const r = this.picture.GetTextureRect();

      this.picture.InitTexture(textures.ui_ui_noise);
      this.picture.SetTextureRect(new Frect().set(r.x1, r.y1, r.x2, r.y2));

      return;
    }

    const itemText: string = item.innerNameText.GetText();

    this.fileCaption.SetText(itemText);
    this.fileCaption.SetEllipsis(true);
    this.fileData.SetText(gatFileDataForGameSave(itemText));

    if (!isGameSaveFileExist(itemText + gameConfig.GAME_SAVE_EXTENSION)) {
      this.listBox.RemoveItem(item);

      return;
    }

    const r: Frect = this.picture.GetTextureRect();

    if (isGameSaveFileExist(itemText + ".dds")) {
      this.picture.InitTexture(itemText);
    } else {
      this.picture.InitTexture(textures.ui_ui_noise);
    }

    this.picture.SetTextureRect(new Frect().set(r.x1, r.y1, r.x2, r.y2));
  }

  public onListItemDoubleClicked(): void {
    logger.info("List item double-clicked");
    this.onLoadButtonClicked();
  }

  public onConfirmedLoad(): void {
    logger.info("Message yes confirmed");

    const index: number = this.listBox.GetSelectedIndex();

    if (index === -1) {
      return;
    }

    if (this.messageBoxMode === 1) {
      const item: LoadItem = this.listBox.GetItemByIndex(index);
      const innerNameTextame: string = item.innerNameText.GetText();

      deleteGameSave(innerNameTextame);

      this.listBox.RemoveItem(item);

      this.onListItemClicked();
    } else if (this.messageBoxMode === 2) {
      this.loadGameInternal();
    }

    this.messageBoxMode = 0;
  }

  public loadGameInternal(): void {
    logger.info("Load game internal");

    const console: CConsole = get_console();

    if (this.listBox.GetSize() === 0) {
      return;
    }

    const index = this.listBox.GetSelectedIndex();

    if (index === -1) {
      return;
    }

    const item = this.listBox.GetItemByIndex(index);

    const innerNameTextame = item.innerNameText.GetText();

    if (alife() === null) {
      console.execute("disconnect");
      console.execute("start server(" + innerNameTextame + "/single/alife/load) client(consthost)");
    } else {
      console.execute("load " + innerNameTextame);
    }
  }

  public onLoadButtonClicked(): void {
    logger.info("Load game clicked");

    if (this.listBox.GetSize() === 0) {
      return;
    }

    const item = this.listBox.GetSelectedItem();

    if (item === null) {
      return;
    }

    const innerNameTextame: string = item.innerNameText.GetText();

    if (!valid_saved_game(innerNameTextame)) {
      this.messageBoxMode = 0;
      this.messageBox.InitMessageBox("message_box_invalid_saved_game");
      this.messageBox.ShowDialog(true);

      return;
    }

    if (alife() === null) {
      this.loadGameInternal();

      return;
    }

    const actor: Optional<ClientObject> = registry.actor;

    if (actor !== null && !actor.alive()) {
      this.loadGameInternal();

      return;
    }

    this.messageBoxMode = 2;
    this.messageBox.InitMessageBox("message_box_confirm_load_save");
    this.messageBox.ShowDialog(true);
  }

  public onBackButtonClicked(): void {
    logger.info("Back clicked");

    this.owner.ShowDialog(true);
    this.HideDialog();
    this.owner.Show(true);
  }

  public onDeleteButtonClicked(): void {
    logger.info("Delete clicked");

    if (this.listBox.GetSize() === 0) {
      return;
    }

    const index = this.listBox.GetSelectedIndex();

    if (index === -1) {
      return;
    }

    this.messageBoxMode = 1;

    this.messageBox.InitMessageBox("message_box_delete_file_name");
    this.messageBox.ShowDialog(true);
  }

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

  public AddItemToList(filename: string, datetime: string): void {
    const loadItem: LoadItem = new LoadItem(this.fileItemMainSize.y, this.fileItemDdSize.x, datetime);

    loadItem.SetWndSize(this.fileItemMainSize);
    loadItem.innerNameText.SetWndPos(new vector2().set(0, 0));
    loadItem.innerNameText.SetWndSize(this.fileItemInnerNameTextSize);
    loadItem.innerNameText.SetText(filename);
    loadItem.innerAgeText.SetWndPos(new vector2().set(this.fileItemInnerNameTextSize.x + 4, 0));
    loadItem.innerAgeText.SetWndSize(this.fileItemDdSize);

    this.listBox.AddExistingItem(loadItem);
  }
}
