import { textures } from "@/mod/globals/textures";
import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { deleteGameSave, gatFileDataForGameSave, isGameSaveFileExist } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/rendering";

const base: string = "menu\\LoadDialog.component";
const log: LuaLogger = new LuaLogger("LoadDialog");

interface ILoadItem extends XR_CUIListBoxItem {
  innerNameText: XR_CUITextWnd;
  innerAgeText: XR_CUITextWnd;
}

const LoadItem: ILoadItem = declare_xr_class("LoadItem", CUIListBoxItem, {
  __init(height: number): void {
    xr_class_super(height);

    this.SetTextColor(GetARGB(255, 170, 170, 170));

    this.innerNameText = this.GetTextItem();
    this.innerNameText.SetFont(GetFontLetterica18Russian());
    this.innerNameText.SetEllipsis(true);
  },
  __finalize(): void {}
} as ILoadItem);

export interface ILoadDialog extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  messageBoxId: number;

  form: XR_CUIStatic;
  picture: XR_CUIStatic;

  fileItemMainSize: XR_vector2;
  fileItemInnerNameTextSize: XR_vector2;
  fileItemDdSz: XR_vector2;

  fileCaption: XR_CUITextWnd;
  fileData: XR_CUITextWnd;

  listBox: XR_CUIListBox<ILoadItem>;
  messageBox: XR_CUIMessageBoxEx;

  InitControls(): void;
  InitCallBacks(): void;

  FillList(): void;
  OnListItemClicked(): void;
  OnListItemDbClicked(): void;
  OnMsgYes(): void;
  load_game_internal(): void;
  OnButton_load_clicked(): void;
  OnButton_back_clicked(): void;
  OnButton_del_clicked(): void;
  AddItemToList(filename: string, datetime: string): void;
}

export const LoadDialog: ILoadDialog = declare_xr_class("LoadDialog", CUIScriptWnd, {
  __init(): void {
    xr_class_super();

    log.info("Init");

    this.InitControls();
    this.InitCallBacks();
  },
  __finalize(): void {},
  InitControls(): void {
    log.info("Init controls");

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
    this.fileItemDdSz = new vector2().set(window.GetWidth(), window.GetHeight());

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
  },
  InitCallBacks(): void {
    log.info("Init callbacks");

    this.AddCallback("button_load", ui_events.BUTTON_CLICKED, () => this.OnButton_load_clicked(), this);
    this.AddCallback("button_back", ui_events.BUTTON_CLICKED, () => this.OnButton_back_clicked(), this);
    this.AddCallback("button_del", ui_events.BUTTON_CLICKED, () => this.OnButton_del_clicked(), this);
    this.AddCallback("message_box", ui_events.MESSAGE_BOX_YES_CLICKED, () => this.OnMsgYes(), this);
    this.AddCallback("message_box", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.OnMsgYes(), this);

    this.AddCallback("list_window", ui_events.LIST_ITEM_CLICKED, () => this.OnListItemClicked(), this);
    this.AddCallback("list_window", ui_events.WINDOW_LBUTTON_DB_CLICK, () => this.OnListItemDbClicked(), this);
  },
  FillList(): void {
    log.info("Fill list");

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
      const filename: string = lua_string.sub(
        file.NameFull(),
        0,
        lua_string.len(file.NameFull()) - lua_string.len(gameConfig.GAME_SAVE_EXTENSION)
      );
      const datetime: string = "[" + file.ModifDigitOnly() + "]";

      this.AddItemToList(filename, datetime);
    }
  },
  OnListItemClicked(): void {
    log.info("List item selected");

    if (this.listBox.GetSize() == 0) {
      return;
    }

    const item: Optional<ILoadItem> = this.listBox.GetSelectedItem();

    if (item == null) {
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
  },
  OnListItemDbClicked(): void {
    log.info("List item double-clicked");
    this.OnButton_load_clicked();
  },
  OnMsgYes(): void {
    log.info("Message yes confirmed");

    const index: number = this.listBox.GetSelectedIndex();

    if (index === -1) {
      return;
    }

    if (this.messageBoxId === 1) {
      const item: ILoadItem = this.listBox.GetItemByIndex(index);

      const innerNameTextame: string = item.innerNameText.GetText();

      deleteGameSave(innerNameTextame);

      this.listBox.RemoveItem(item);

      this.OnListItemClicked();
    } else if (this.messageBoxId === 2) {
      this.load_game_internal();
    }

    this.messageBoxId = 0;
  },
  load_game_internal(): void {
    log.info("Load game internal");

    const console: XR_CConsole = get_console();

    if (this.listBox.GetSize() == 0) {
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
  },
  OnButton_load_clicked(): void {
    log.info("Load game clicked");

    if (this.listBox.GetSize() === 0) {
      return;
    }

    const item = this.listBox.GetSelectedItem();

    if (item === null) {
      return;
    }

    const innerNameTextame: string = item.innerNameText.GetText();

    if (!valid_saved_game(innerNameTextame)) {
      this.messageBoxId = 0;
      this.messageBox.InitMessageBox("message_box_invalid_saved_game");
      this.messageBox.ShowDialog(true);

      return;
    }

    if (alife() == null) {
      this.load_game_internal();

      return;
    }

    if (db.actor != null && db.actor.alive() == false) {
      this.load_game_internal();

      return;
    }

    this.messageBoxId = 2;
    this.messageBox.InitMessageBox("message_box_confirm_load_save");
    this.messageBox.ShowDialog(true);
  },
  OnButton_back_clicked(): void {
    log.info("Back clicked");

    this.owner.ShowDialog(true);
    this.HideDialog();
    this.owner.Show(true);
  },
  OnButton_del_clicked(): void {
    log.info("Delete clicked");

    if (this.listBox.GetSize() === 0) {
      return;
    }

    const index = this.listBox.GetSelectedIndex();

    if (index === -1) {
      return;
    }

    this.messageBoxId = 1;

    this.messageBox.InitMessageBox("message_box_delete_file_name");
    this.messageBox.ShowDialog(true);
  },
  OnKeyboard(key: TXR_DIK_key, event: TXR_ui_event): boolean {
    CUIScriptWnd.OnKeyboard(this, key, event);

    const bind: number = dik_to_bind(key);

    if (bind === key_bindings.kQUIT) {
      this.OnButton_back_clicked();
    }

    if (key === DIK_keys.DIK_RETURN && event == ui_events.WINDOW_KEY_PRESSED) {
      this.OnButton_load_clicked();
    }

    return true;
  },
  AddItemToList(filename: string, datetime: string): void {
    const it: ILoadItem = create_xr_class_instance(LoadItem, this.fileItemMainSize.y);

    it.SetWndSize(this.fileItemMainSize);

    it.innerNameText.SetWndPos(new vector2().set(0, 0));
    it.innerNameText.SetWndSize(this.fileItemInnerNameTextSize);
    it.innerNameText.SetText(filename);

    it.innerAgeText = it.AddTextField(datetime, this.fileItemDdSz.x);
    it.innerAgeText.SetFont(GetFontLetterica16Russian());
    it.innerAgeText.SetWndPos(new vector2().set(this.fileItemInnerNameTextSize.x + 4, 0));
    it.innerAgeText.SetWndSize(this.fileItemDdSz);

    this.listBox.AddExistingItem(it);
  }
} as ILoadDialog);
