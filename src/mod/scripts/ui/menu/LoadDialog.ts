import { textures } from "@/mod/globals/textures";
import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";
import { deleteGameSave, gatFileDataForGameSave, isGameSaveFileExist } from "@/mod/scripts/utils/game_saves_utils";

const base: string = "menu/LoadDialog.component.xml";
const log: DebugLogger = new DebugLogger("LoadDialog");

interface ILoadItem extends XR_CUIListBoxItem {
  file_name: string;
  fn: XR_CUITextWnd;
  fage: XR_CUITextWnd;
}

const LoadItem: ILoadItem = declare_xr_class("LoadItem", CUIListBoxItem, {
  __init(height: number): void {
    xr_class_super(height);

    this.file_name = "filename";

    this.SetTextColor(GetARGB(255, 170, 170, 170));

    this.fn = this.GetTextItem();
    this.fn.SetFont(GetFontLetterica18Russian());
    this.fn.SetEllipsis(true);
  },
  __finalize(): void {}
} as ILoadItem);

export interface ILoadDialog extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  msgbox_id: number;

  form: XR_CUIStatic;
  picture: XR_CUIStatic;

  file_item_main_sz: XR_vector2;
  file_item_fn_sz: XR_vector2;
  file_item_fd_sz: XR_vector2;

  file_caption: XR_CUITextWnd;
  file_data: XR_CUITextWnd;

  list_box: XR_CUIListBox<ILoadItem>;
  message_box: XR_CUIMessageBoxEx;

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
  AddItemToList(filename: string, date_time: unknown): void;
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

    xml.ParseFile(base);
    xml.InitStatic("background", this);

    const window: XR_CUIWindow = new CUIWindow();

    xml.InitWindow("file_item:main", 0, window);

    this.file_item_main_sz = new vector2().set(window.GetWidth(), window.GetHeight());

    xml.InitWindow("file_item:fn", 0, window);
    this.file_item_fn_sz = new vector2().set(window.GetWidth(), window.GetHeight());

    xml.InitWindow("file_item:fd", 0, window);
    this.file_item_fd_sz = new vector2().set(window.GetWidth(), window.GetHeight());

    this.form = xml.InitStatic("form", this);

    xml.InitStatic("form:caption", this.form);

    this.picture = xml.InitStatic("form:picture", this.form);

    // -- xml.InitStatic("form:file_info", this.form);

    this.file_caption = xml.InitTextWnd("form:file_caption", this.form);
    this.file_data = xml.InitTextWnd("form:file_data", this.form);

    xml.InitFrame("form:list_frame", this.form);

    this.list_box = xml.InitListBox("form:list", this.form);

    this.list_box.ShowSelectedItem(true);
    this.Register(this.list_box, "list_window");

    let ctrl;

    ctrl = xml.Init3tButton("form:btn_load", this.form);
    this.Register(ctrl, "button_load");

    ctrl = xml.Init3tButton("form:btn_delete", this.form);
    this.Register(ctrl, "button_del");

    ctrl = xml.Init3tButton("form:btn_cancel", this.form);
    this.Register(ctrl, "button_back");

    this.message_box = new CUIMessageBoxEx();
    this.Register(this.message_box, "message_box");
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

    this.list_box.RemoveAll();

    const f: XR_FS = getFS();
    const flist: XR_FS_file_list_ex = f.file_list_open_ex(
      "$game_saves$",
      bit_or(FS.FS_ListFiles, FS.FS_RootOnly),
      "*" + gameConfig.GAME_SAVE_EXTENSION
    );
    const filesCount = flist.Size();

    flist.Sort(FS.FS_sort_by_modif_down);

    for (let it = 0; it < filesCount; it += 1) {
      const file: XR_FS_item = flist.GetAt(it);
      const file_name = lua_string.sub(
        file.NameFull(),
        0,
        lua_string.len(file.NameFull()) - lua_string.len(gameConfig.GAME_SAVE_EXTENSION)
      );
      const date_time = "[" + file.ModifDigitOnly() + "]";

      this.AddItemToList(file_name, date_time);
    }
  },
  OnListItemClicked(): void {
    log.info("List item selected");

    if (this.list_box.GetSize() == 0) {
      return;
    }

    const item = this.list_box.GetSelectedItem();

    if (item == null) {
      this.file_caption.SetText("");
      this.file_data.SetText("");

      const r = this.picture.GetTextureRect();

      this.picture.InitTexture(textures.ui_ui_noise);
      this.picture.SetTextureRect(new Frect().set(r.x1, r.y1, r.x2, r.y2));

      return;
    }

    const item_text = item.fn.GetText();

    this.file_caption.SetText(item_text);
    this.file_caption.SetEllipsis(true);
    this.file_data.SetText(gatFileDataForGameSave(item_text));

    if (!isGameSaveFileExist(item_text + gameConfig.GAME_SAVE_EXTENSION)) {
      this.list_box.RemoveItem(item);

      return;
    }

    const r = this.picture.GetTextureRect();

    if (isGameSaveFileExist(item_text + ".dds")) {
      this.picture.InitTexture(item_text);
    } else {
      this.picture.InitTexture("ui\\ui_noise");
    }

    this.picture.SetTextureRect(new Frect().set(r.x1, r.y1, r.x2, r.y2));
  },
  OnListItemDbClicked(): void {
    log.info("List item double-clicked");
    this.OnButton_load_clicked();
  },
  OnMsgYes(): void {
    log.info("Message yes confirmed");

    const index: number = this.list_box.GetSelectedIndex();

    if (index === -1) {
      return;
    }

    if (this.msgbox_id === 1) {
      const item: ILoadItem = this.list_box.GetItemByIndex(index);

      const fname: string = item.fn.GetText();

      deleteGameSave(fname);

      this.list_box.RemoveItem(item);

      this.OnListItemClicked();
    } else if (this.msgbox_id === 2) {
      this.load_game_internal();
    }

    this.msgbox_id = 0;
  },
  load_game_internal(): void {
    log.info("Load game internal");

    const console: XR_CConsole = get_console();

    if (this.list_box.GetSize() == 0) {
      return;
    }

    const index = this.list_box.GetSelectedIndex();

    if (index === -1) {
      return;
    }

    const item = this.list_box.GetItemByIndex(index);

    const fname = item.fn.GetText();

    if (alife() === null) {
      console.execute("disconnect");
      console.execute("start server(" + fname + "/single/alife/load) client(consthost)");
    } else {
      console.execute("load " + fname);
    }
  },
  OnButton_load_clicked(): void {
    log.info("Load game clicked");

    if (this.list_box.GetSize() === 0) {
      return;
    }

    const item = this.list_box.GetSelectedItem();

    if (item === null) {
      return;
    }

    const fname: string = item.fn.GetText();

    if (!valid_saved_game(fname)) {
      this.msgbox_id = 0;
      this.message_box.InitMessageBox("message_box_invalid_saved_game");
      this.message_box.ShowDialog(true);

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

    this.msgbox_id = 2;
    this.message_box.InitMessageBox("message_box_confirm_load_save");
    this.message_box.ShowDialog(true);
  },
  OnButton_back_clicked(): void {
    log.info("Back clicked");

    this.owner.ShowDialog(true);
    this.HideDialog();
    this.owner.Show(true);
  },
  OnButton_del_clicked(): void {
    log.info("Delete clicked");

    if (this.list_box.GetSize() === 0) {
      return;
    }

    const index = this.list_box.GetSelectedIndex();

    if (index === -1) {
      return;
    }

    this.msgbox_id = 1;

    this.message_box.InitMessageBox("message_box_delete_file_name");
    this.message_box.ShowDialog(true);
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
    const _itm = create_xr_class_instance(LoadItem, this.file_item_main_sz.y);

    _itm.SetWndSize(this.file_item_main_sz);

    _itm.fn.SetWndPos(new vector2().set(0, 0));
    _itm.fn.SetWndSize(this.file_item_fn_sz);
    _itm.fn.SetText(filename);

    _itm.fage = _itm.AddTextField(datetime, this.file_item_fd_sz.x);
    _itm.fage.SetFont(GetFontLetterica16Russian());
    _itm.fage.SetWndPos(new vector2().set(this.file_item_fn_sz.x + 4, 0));
    _itm.fage.SetWndSize(this.file_item_fd_sz);

    this.list_box.AddExistingItem(_itm);
  }
} as ILoadDialog);
