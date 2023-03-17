import {
  alife,
  bit_or,
  CScriptXmlInit,
  CUIMessageBoxEx,
  CUIScriptWnd,
  CUIWindow,
  DIK_keys,
  dik_to_bind,
  Frect,
  FS,
  get_console,
  getFS,
  key_bindings,
  LuabindClass,
  TXR_DIK_key,
  TXR_ui_event,
  ui_events,
  valid_saved_game,
  vector2,
  XR_CConsole,
  XR_CScriptXmlInit,
  XR_CUIListBox,
  XR_CUIMessageBoxEx,
  XR_CUIScriptWnd,
  XR_CUIStatic,
  XR_CUITextWnd,
  XR_CUIWindow,
  XR_FS,
  XR_FS_file_list_ex,
  XR_FS_item,
  XR_game_object,
  XR_vector2,
} from "xray16";

import { textures } from "@/engine/globals/textures";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { Optional } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";
import { LoadItem } from "@/engine/scripts/core/ui/menu/load/LoadItem";
import { deleteGameSave, gatFileDataForGameSave, isGameSaveFileExist } from "@/engine/scripts/utils/game_save";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { resolveXmlFormPath } from "@/engine/scripts/utils/ui";

const base: string = "menu\\LoadDialog.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class LoadDialog extends CUIScriptWnd {
  public owner: XR_CUIScriptWnd;

  public fileItemMainSize!: XR_vector2;
  public fileItemInnerNameTextSize!: XR_vector2;
  public fileItemDdSize!: XR_vector2;

  public form!: XR_CUIStatic;
  public picture!: XR_CUIStatic;
  public fileCaption!: XR_CUITextWnd;
  public fileData!: XR_CUITextWnd;
  public listBox!: XR_CUIListBox<LoadItem>;
  public messageBox!: XR_CUIMessageBoxEx;
  public messageBoxMode: number = 0;

  public constructor(owner: XR_CUIScriptWnd) {
    super();

    this.owner = owner;

    this.InitControls();
    this.InitCallBacks();
  }

  public InitControls(): void {
    this.SetWndRect(new Frect().set(0, 0, 1024, 768));

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));
    xml.InitStatic("background", this);

    const window: XR_CUIWindow = new CUIWindow();

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

  public InitCallBacks(): void {
    this.AddCallback("button_load", ui_events.BUTTON_CLICKED, () => this.OnButton_load_clicked(), this);
    this.AddCallback("button_back", ui_events.BUTTON_CLICKED, () => this.OnButton_back_clicked(), this);
    this.AddCallback("button_del", ui_events.BUTTON_CLICKED, () => this.OnButton_del_clicked(), this);
    this.AddCallback("message_box", ui_events.MESSAGE_BOX_YES_CLICKED, () => this.OnMsgYes(), this);
    this.AddCallback("message_box", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.OnMsgYes(), this);

    this.AddCallback("list_window", ui_events.LIST_ITEM_CLICKED, () => this.OnListItemClicked(), this);
    this.AddCallback("list_window", ui_events.WINDOW_LBUTTON_DB_CLICK, () => this.OnListItemDbClicked(), this);
  }

  public FillList(): void {
    this.listBox.RemoveAll();

    const fs: XR_FS = getFS();
    const flist: XR_FS_file_list_ex = fs.file_list_open_ex(
      "$game_saves$",
      bit_or(FS.FS_ListFiles, FS.FS_RootOnly),
      "*" + gameConfig.GAME_SAVE_EXTENSION
    );

    flist.Sort(FS.FS_sort_by_modif_down);

    for (let it = 0; it < flist.Size(); it += 1) {
      const file: XR_FS_item = flist.GetAt(it);
      const filename: string = string.sub(
        file.NameFull(),
        0,
        string.len(file.NameFull()) - string.len(gameConfig.GAME_SAVE_EXTENSION)
      );
      const datetime: string = "[" + file.ModifDigitOnly() + "]";

      this.AddItemToList(filename, datetime);
    }
  }

  public OnListItemClicked(): void {
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

    const r = this.picture.GetTextureRect();

    if (isGameSaveFileExist(itemText + ".dds")) {
      this.picture.InitTexture(itemText);
    } else {
      this.picture.InitTexture(textures.ui_ui_noise);
    }

    this.picture.SetTextureRect(new Frect().set(r.x1, r.y1, r.x2, r.y2));
  }

  public OnListItemDbClicked(): void {
    logger.info("List item double-clicked");
    this.OnButton_load_clicked();
  }

  public OnMsgYes(): void {
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

      this.OnListItemClicked();
    } else if (this.messageBoxMode === 2) {
      this.load_game_internal();
    }

    this.messageBoxMode = 0;
  }

  public load_game_internal(): void {
    logger.info("Load game internal");

    const console: XR_CConsole = get_console();

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

  public OnButton_load_clicked(): void {
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
      this.load_game_internal();

      return;
    }

    const actor: Optional<XR_game_object> = registry.actor;

    if (actor !== null && !actor.alive()) {
      this.load_game_internal();

      return;
    }

    this.messageBoxMode = 2;
    this.messageBox.InitMessageBox("message_box_confirm_load_save");
    this.messageBox.ShowDialog(true);
  }

  public OnButton_back_clicked(): void {
    logger.info("Back clicked");

    this.owner.ShowDialog(true);
    this.HideDialog();
    this.owner.Show(true);
  }

  public OnButton_del_clicked(): void {
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

  public override OnKeyboard(key: TXR_DIK_key, event: TXR_ui_event): boolean {
    super.OnKeyboard(key, event);

    const bind: number = dik_to_bind(key);

    if (bind === key_bindings.kQUIT) {
      this.OnButton_back_clicked();
    }

    if (key === DIK_keys.DIK_RETURN && event === ui_events.WINDOW_KEY_PRESSED) {
      this.OnButton_load_clicked();
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
