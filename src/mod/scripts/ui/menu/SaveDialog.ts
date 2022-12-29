import {
  CScriptXmlInit,
  CUIListBoxItem,
  CUIMessageBoxEx,
  CUIScriptWnd,
  CUIWindow,
  DIK_keys,
  Frect,
  FS,
  dik_to_bind,
  get_console,
  GetARGB,
  GetFontLetterica16Russian,
  GetFontLetterica18Russian,
  GetFontMedium,
  getFS,
  XR_CConsole,
  key_bindings,
  TXR_DIK_key,
  TXR_ui_event,
  ui_events,
  vector2,
  XR_CGameFont,
  XR_CScriptXmlInit,
  XR_CUIEditBox,
  XR_CUIListBox,
  XR_CUIMessageBoxEx,
  XR_CUIScriptWnd,
  XR_CUIStatic,
  XR_CUITextWnd,
  XR_CUIWindow,
  XR_FS,
  XR_FS_file_list,
  XR_FS_file_list_ex,
  XR_FS_item,
  XR_CUIListBoxItem,
  XR_vector2
} from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { deleteGameSave } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/ui";

const base: string = "menu\\SaveDialog.component";
const log: LuaLogger = new LuaLogger("SaveDialog");

interface ISaveItem extends XR_CUIListBoxItem {
  owner: XR_CUIScriptWnd;

  innerNameText: XR_CUITextWnd;
  innerAgeText: XR_CUITextWnd;
}

const SaveItem = declare_xr_class("SaveItem", CUIListBoxItem, {
  __init(height: number): void {
    xr_class_super(height);

    this.SetTextColor(GetARGB(255, 170, 170, 170));
    this.innerNameText = this.GetTextItem();
    this.innerNameText.SetFont(GetFontLetterica18Russian());
    this.innerNameText.SetEllipsis(true);
  },
  __finalize(): void {}
} as ISaveItem);

export interface ISaveDialog extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  listFileFont: XR_CGameFont;
  listDateFont: XR_CGameFont;

  fileItemMainSize: XR_vector2;
  fileItemFnSize: XR_vector2;
  fileItemFdSize: XR_vector2;

  form: XR_CUIStatic;
  editBox: XR_CUIEditBox;
  listBox: XR_CUIListBox<ISaveItem>;

  messageBox: XR_CUIMessageBoxEx;

  newSave: string;
  modalBoxMode: number;

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

    this.listFileFont = GetFontMedium();
    this.listDateFont = GetFontMedium();

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));

    xml.InitWindow("background", 0, this);

    const ctrl: XR_CUIWindow = new CUIWindow();

    xml.InitWindow("file_item:main", 0, ctrl);

    this.fileItemMainSize = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    xml.InitWindow("file_item:fn", 0, ctrl);
    this.fileItemFnSize = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    xml.InitWindow("file_item:fd", 0, ctrl);
    this.fileItemFdSize = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    this.form = xml.InitStatic("form", this);

    xml.InitTextWnd("form:caption", this.form);

    this.editBox = xml.InitEditBox("form:edit", this.form);
    this.Register(this.editBox, "edit_filename");

    xml.InitFrame("form:list_frame", this.form);

    this.listBox = xml.InitListBox("form:list", this.form);
    this.listBox.ShowSelectedItem(true);
    this.Register(this.listBox, "list_window");

    this.Register(xml.Init3tButton("form:btn_save", this.form), "button_ok");

    this.Register(xml.Init3tButton("form:btn_delete", this.form), "button_del");

    this.Register(xml.Init3tButton("form:btn_cancel", this.form), "button_cancel");

    this.messageBox = new CUIMessageBoxEx();
    this.Register(this.messageBox, "message_box");

    this.modalBoxMode = 0;
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

    this.listBox.RemoveAll();

    const flist: XR_FS_file_list_ex = getFS().file_list_open_ex(
      "$game_saves$",
      FS.FS_ListFiles,
      "*" + gameConfig.GAME_SAVE_EXTENSION
    );

    flist.Sort(FS.FS_sort_by_modif_down);

    for (let it = 0; it < flist.Size(); it += 1) {
      const file: XR_FS_item = flist.GetAt(it);
      const file_name: string = string.sub(
        file.NameFull(),
        0,
        string.len(file.NameFull()) - string.len(gameConfig.GAME_SAVE_EXTENSION)
      );
      const date_time: string = "[" + file.ModifDigitOnly() + "]";

      // --menu_item =  +
      this.AddItemToList(file_name, date_time);
    }
  },
  OnListItemClicked(): void {
    log.info("List item clicked");

    if (this.listBox.GetSize() === 0) {
      return;
    }

    const item = this.listBox.GetSelectedItem();

    if (item === null) {
      return;
    }

    const item_text: string = item.innerNameText.GetText();

    this.editBox.SetText(item_text);
  },
  OnMsgYes(): void {
    log.info("Message yes clicked:", this.modalBoxMode);

    if (this.modalBoxMode === 1) {
      this.SaveFile(this.newSave);

      this.owner.ShowDialog(true);
      this.HideDialog();
      this.owner.Show(true);
    } else if (this.modalBoxMode == 2) {
      this.delete_selected_file();
    }
  },
  OnButton_del_clicked(): void {
    log.info("Message delete clicked");

    if (this.listBox.GetSize() === 0) {
      return;
    }

    const item: Optional<ISaveItem> = this.listBox.GetSelectedItem();

    if (item == null) {
      return;
    }

    this.modalBoxMode = 2;
    this.messageBox.InitMessageBox("message_box_delete_file_name");
    this.messageBox.ShowDialog(true);
  },
  delete_selected_file(): void {
    log.info("Deleting selected file");

    if (this.listBox.GetSize() === 0) {
      return;
    }

    const index: number = this.listBox.GetSelectedIndex();

    if (index == -1) {
      return;
    }

    const item: ISaveItem = this.listBox.GetItemByIndex(index);
    const filename: string = item.innerNameText.GetText();

    deleteGameSave(filename);

    this.listBox.RemoveItem(item);
    this.OnListItemClicked();
  },
  OnButton_ok_clicked(): void {
    log.info("OK confirm clicked");

    this.newSave = this.editBox.GetText();

    if (string.len(this.newSave) == 0) {
      log.info("Save name is empty");

      this.modalBoxMode = 0;
      this.messageBox.InitMessageBox("message_box_empty_file_name");
      this.messageBox.ShowDialog(true);

      return;
    }

    const fs: XR_FS = getFS();
    const fileList: XR_FS_file_list = fs.file_list_open("$game_saves$", FS.FS_ListFiles);
    const file_struct: unknown = fs.exist("$game_saves$", this.newSave + gameConfig.GAME_SAVE_EXTENSION);

    if (file_struct !== null) {
      log.info("File already exists");

      this.modalBoxMode = 1;
      this.messageBox.InitMessageBox("message_box_file_already_exist");
      this.messageBox.ShowDialog(true);

      fileList.Free();

      return;
    }

    fileList.Free();
    this.SaveFile(this.newSave);

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
    const it: ISaveItem = create_xr_class_instance(SaveItem, this.fileItemMainSize.y);

    it.SetWndSize(this.fileItemMainSize);

    it.innerNameText.SetWndPos(new vector2().set(0, 0));
    it.innerNameText.SetWndSize(this.fileItemFnSize);
    it.innerNameText.SetText(filename);

    it.innerAgeText = it.AddTextField(datetime, this.fileItemFdSize.x);
    it.innerAgeText.SetFont(GetFontLetterica16Russian());
    it.innerAgeText.SetWndPos(new vector2().set(this.fileItemFnSize.x + 4, 0));

    this.listBox.AddExistingItem(it);
  },
  SaveFile(filename: string): void {
    log.info("Save file:", filename);

    if (filename !== null) {
      const console: XR_CConsole = get_console();

      console.execute("save " + filename);
    }
  }
} as ISaveDialog);
