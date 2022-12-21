import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";
import { deleteGameSave } from "@/mod/scripts/utils/game_saves_utils";

const base: string = "menu/SaveDialog.component.xml";
const log: DebugLogger = new DebugLogger("SaveDialog");

interface ISaveItem extends XR_CUIListBoxItem {
  owner: XR_CUIScriptWnd;
  fn: XR_CUITextWnd;
  fage: XR_CUITextWnd;
}

const SaveItem = declare_xr_class("SaveItem", CUIListBoxItem, {
  __init(height: number): void {
    xr_class_super(height);

    this.SetTextColor(GetARGB(255, 170, 170, 170));
    this.fn = this.GetTextItem();
    this.fn.SetFont(GetFontLetterica18Russian());
    this.fn.SetEllipsis(true);
  },
  __finalize(): void {}
} as ISaveItem);

export interface ISaveDialog extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  list_file_font: XR_CGameFont;
  list_date_font: XR_CGameFont;

  file_item_main_sz: XR_vector2;
  file_item_fn_sz: XR_vector2;
  file_item_fd_sz: XR_vector2;

  form: XR_CUIStatic;
  editbox: XR_CUIEditBox;
  list_box: XR_CUIListBox<ISaveItem>;

  message_box: XR_CUIMessageBoxEx;

  new_save: string;
  mbox_mode: number;

  InitControls(): void;
  InitCallBacks(): void;
  FillList(): void;
  OnListItemClicked(): void;
  OnMsgYes(): void;
  OnButton_del_clicked(): void;
  delete_selected_file(): void;
  OnButton_ok_clicked(): void;
  OnButton_cancel_clicked(): void;
  AddItemToList(filename: string, datetime: string): void;
  SaveFile(filename: string): void;
}

export const SaveDialog: ISaveDialog = declare_xr_class("SaveDialog", CUIScriptWnd, {
  __init(): void {
    xr_class_super();

    log.info("Init");

    this.InitControls();
    this.InitCallBacks();
    this.FillList();
  },
  __finalize(): void {},
  InitControls(): void {
    log.info("Init controls");

    this.SetWndRect(new Frect().set(0, 0, 1024, 768));

    this.list_file_font = GetFontMedium();
    this.list_date_font = GetFontMedium();

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(base);

    xml.InitWindow("background", 0, this);

    const ctrl: XR_CUIWindow = new CUIWindow();

    xml.InitWindow("file_item:main", 0, ctrl);

    this.file_item_main_sz = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    xml.InitWindow("file_item:fn", 0, ctrl);
    this.file_item_fn_sz = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    xml.InitWindow("file_item:fd", 0, ctrl);
    this.file_item_fd_sz = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    this.form = xml.InitStatic("form", this);

    xml.InitTextWnd("form:caption", this.form);

    this.editbox = xml.InitEditBox("form:edit", this.form);
    this.Register(this.editbox, "edit_filename");

    xml.InitFrame("form:list_frame", this.form);

    this.list_box = xml.InitListBox("form:list", this.form);
    this.list_box.ShowSelectedItem(true);
    this.Register(this.list_box, "list_window");

    this.Register(xml.Init3tButton("form:btn_save", this.form), "button_ok");

    this.Register(xml.Init3tButton("form:btn_delete", this.form), "button_del");

    this.Register(xml.Init3tButton("form:btn_cancel", this.form), "button_cancel");

    this.message_box = new CUIMessageBoxEx();
    this.Register(this.message_box, "message_box");

    this.mbox_mode = 0;
  },
  InitCallBacks(): void {
    log.info("Init callbacks");

    this.AddCallback("button_ok", ui_events.BUTTON_CLICKED, () => this.OnButton_ok_clicked(), this);
    this.AddCallback("button_cancel", ui_events.BUTTON_CLICKED, () => this.OnButton_cancel_clicked(), this);
    this.AddCallback("button_del", ui_events.BUTTON_CLICKED, () => this.OnButton_del_clicked(), this);

    this.AddCallback("message_box", ui_events.MESSAGE_BOX_YES_CLICKED, () => this.OnMsgYes(), this);
    this.AddCallback("list_window", ui_events.LIST_ITEM_CLICKED, () => this.OnListItemClicked(), this);
  },
  FillList(): void {
    log.info("Fill list");

    this.list_box.RemoveAll();

    const flist: XR_FS_file_list_ex = getFS().file_list_open_ex(
      "$game_saves$",
      FS.FS_ListFiles,
      "*" + gameConfig.GAME_SAVE_EXTENSION
    );

    flist.Sort(FS.FS_sort_by_modif_down);

    for (let it = 0; it < flist.Size(); it += 1) {
      const file: XR_FS_item = flist.GetAt(it);
      const file_name: string = lua_string.sub(
        file.NameFull(),
        0,
        lua_string.len(file.NameFull()) - lua_string.len(gameConfig.GAME_SAVE_EXTENSION)
      );
      const date_time: string = "[" + file.ModifDigitOnly() + "]";

      // --menu_item =  +
      this.AddItemToList(file_name, date_time);
    }
  },
  OnListItemClicked(): void {
    log.info("List item clicked");

    if (this.list_box.GetSize() === 0) {
      return;
    }

    const item = this.list_box.GetSelectedItem();

    if (item === null) {
      return;
    }

    const item_text: string = item.fn.GetText();

    this.editbox.SetText(item_text);
  },
  OnMsgYes(): void {
    log.info("Message yes clicked:", this.mbox_mode);

    if (this.mbox_mode === 1) {
      this.SaveFile(this.new_save);

      this.owner.ShowDialog(true);
      this.HideDialog();
      this.owner.Show(true);
    } else if (this.mbox_mode == 2) {
      this.delete_selected_file();
    }
  },
  OnButton_del_clicked(): void {
    log.info("Message delete clicked");

    if (this.list_box.GetSize() === 0) {
      return;
    }

    const item: Optional<ISaveItem> = this.list_box.GetSelectedItem();

    if (item == null) {
      return;
    }

    this.mbox_mode = 2;
    this.message_box.InitMessageBox("message_box_delete_file_name");
    this.message_box.ShowDialog(true);
  },
  delete_selected_file(): void {
    log.info("Deleting selected file");

    if (this.list_box.GetSize() === 0) {
      return;
    }

    const index: number = this.list_box.GetSelectedIndex();

    if (index == -1) {
      return;
    }

    const item: ISaveItem = this.list_box.GetItemByIndex(index);
    const filename: string = item.fn.GetText();

    deleteGameSave(filename);

    this.list_box.RemoveItem(item);
    this.OnListItemClicked();
  },
  OnButton_ok_clicked(): void {
    log.info("OK confirm clicked");

    this.new_save = this.editbox.GetText();

    if (lua_string.len(this.new_save) == 0) {
      log.info("Save name is empty");

      this.mbox_mode = 0;
      this.message_box.InitMessageBox("message_box_empty_file_name");
      this.message_box.ShowDialog(true);

      return;
    }

    const fs: XR_FS = getFS();
    const fileList: XR_FS_file_list = fs.file_list_open("$game_saves$", FS.FS_ListFiles);
    const file_struct: unknown = fs.exist("$game_saves$", this.new_save + gameConfig.GAME_SAVE_EXTENSION);

    if (file_struct !== null) {
      log.info("File already exists");

      this.mbox_mode = 1;
      this.message_box.InitMessageBox("message_box_file_already_exist");
      this.message_box.ShowDialog(true);

      fileList.Free();

      return;
    }

    fileList.Free();
    this.SaveFile(this.new_save);

    this.owner.ShowDialog(true);
    this.HideDialog();
    this.owner.Show(true);

    log.info("Saved");
  },
  OnButton_cancel_clicked(): void {
    log.info("Cancel clicked");
    this.owner.ShowDialog(true);
    this.HideDialog();
    this.owner.Show(true);
  },
  OnKeyboard(key: TXR_DIK_key, event: TXR_ui_event): boolean {
    CUIScriptWnd.OnKeyboard(this, key, event);

    const bind: number = dik_to_bind(key);

    if (bind === key_bindings.kQUIT) {
      this.OnButton_cancel_clicked();
    } else {
      if (key == DIK_keys.DIK_RETURN && event == ui_events.WINDOW_KEY_PRESSED) {
        this.OnButton_ok_clicked();
      }
    }

    return true;
  },
  AddItemToList(filename: string, datetime: string): void {
    const it: ISaveItem = create_xr_class_instance(SaveItem, this.file_item_main_sz.y);

    it.SetWndSize(this.file_item_main_sz);

    it.fn.SetWndPos(new vector2().set(0, 0));
    it.fn.SetWndSize(this.file_item_fn_sz);
    it.fn.SetText(filename);

    it.fage = it.AddTextField(datetime, this.file_item_fd_sz.x);
    it.fage.SetFont(GetFontLetterica16Russian());
    it.fage.SetWndPos(new vector2().set(this.file_item_fn_sz.x + 4, 0));

    this.list_box.AddExistingItem(it);
  },
  SaveFile(filename: string): void {
    log.info("Save file:", filename);

    if (filename !== null) {
      const console: XR_CConsole = get_console();

      console.execute("save " + filename);
    }
  }
} as ISaveDialog);
