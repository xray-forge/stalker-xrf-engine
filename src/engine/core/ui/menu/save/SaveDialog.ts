import {
  CConsole,
  CGameFont,
  CScriptXmlInit,
  CUIEditBox,
  CUIListBox,
  CUIMessageBoxEx,
  CUIScriptWnd,
  CUIStatic,
  CUIWindow,
  DIK_keys,
  dik_to_bind,
  Frect,
  FS,
  FS_file_list,
  FS_file_list_ex,
  FS_item,
  get_console,
  GetFontMedium,
  getFS,
  key_bindings,
  LuabindClass,
  TXR_DIK_key,
  TXR_ui_event,
  ui_events,
  vector2,
} from "xray16";

import { SaveItem } from "@/engine/core/ui/menu/save/SaveItem";
import { deleteGameSave } from "@/engine/core/utils/game_save";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { roots } from "@/engine/lib/constants/roots";
import { Optional, TPath } from "@/engine/lib/types";

const base: TPath = "menu\\SaveDialog.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class SaveDialog extends CUIScriptWnd {
  public owner: CUIScriptWnd;

  public readonly listFileFont: CGameFont = GetFontMedium();
  public readonly listDateFont: CGameFont = GetFontMedium();

  public fileItemMainSize!: vector2;
  public fileItemFnSize!: vector2;
  public fileItemFdSize!: vector2;

  public form!: CUIStatic;
  public editBox!: CUIEditBox;
  public listBox!: CUIListBox<SaveItem>;
  public messageBox!: CUIMessageBoxEx;

  public newSave: string = "";
  public modalBoxMode: number = 0;

  public constructor(owner: CUIScriptWnd) {
    super();

    this.owner = owner;

    this.InitControls();
    this.InitCallBacks();
    this.FillList();
  }

  public InitControls(): void {
    this.SetWndRect(new Frect().set(0, 0, 1024, 768));

    const xml: CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));

    xml.InitWindow("background", 0, this);

    const ctrl: CUIWindow = new CUIWindow();

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
  }

  public InitCallBacks(): void {
    this.AddCallback("button_ok", ui_events.BUTTON_CLICKED, () => this.OnButton_ok_clicked(), this);
    this.AddCallback("button_cancel", ui_events.BUTTON_CLICKED, () => this.OnButton_cancel_clicked(), this);
    this.AddCallback("button_del", ui_events.BUTTON_CLICKED, () => this.OnButton_del_clicked(), this);

    this.AddCallback("message_box", ui_events.MESSAGE_BOX_YES_CLICKED, () => this.OnMsgYes(), this);
    this.AddCallback("list_window", ui_events.LIST_ITEM_CLICKED, () => this.OnListItemClicked(), this);
  }

  public FillList(): void {
    logger.info("Fill list");

    this.listBox.RemoveAll();

    const fileList: FS_file_list_ex = getFS().file_list_open_ex(
      roots.gameSaves,
      FS.FS_ListFiles,
      "*" + gameConfig.GAME_SAVE_EXTENSION
    );

    fileList.Sort(FS.FS_sort_by_modif_down);

    for (let it = 0; it < fileList.Size(); it += 1) {
      const file: FS_item = fileList.GetAt(it);
      const file_name: string = string.sub(
        file.NameFull(),
        0,
        string.len(file.NameFull()) - string.len(gameConfig.GAME_SAVE_EXTENSION)
      );
      const date_time: string = "[" + file.ModifDigitOnly() + "]";

      // --menu_item =  +
      this.AddItemToList(file_name, date_time);
    }
  }

  public OnListItemClicked(): void {
    logger.info("List item clicked");

    if (this.listBox.GetSize() === 0) {
      return;
    }

    const item = this.listBox.GetSelectedItem();

    if (item === null) {
      return;
    }

    const item_text: string = item.innerNameText.GetText();

    this.editBox.SetText(item_text);
  }

  public OnMsgYes(): void {
    logger.info("Message yes clicked:", this.modalBoxMode);

    if (this.modalBoxMode === 1) {
      this.SaveFile(this.newSave);

      this.owner.ShowDialog(true);
      this.HideDialog();
      this.owner.Show(true);
    } else if (this.modalBoxMode === 2) {
      this.delete_selected_file();
    }
  }

  public OnButton_del_clicked(): void {
    logger.info("Message delete clicked");

    if (this.listBox.GetSize() === 0) {
      return;
    }

    const item: Optional<SaveItem> = this.listBox.GetSelectedItem();

    if (item === null) {
      return;
    }

    this.modalBoxMode = 2;
    this.messageBox.InitMessageBox("message_box_delete_file_name");
    this.messageBox.ShowDialog(true);
  }

  public delete_selected_file(): void {
    logger.info("Deleting selected file");

    if (this.listBox.GetSize() === 0) {
      return;
    }

    const index: number = this.listBox.GetSelectedIndex();

    if (index === -1) {
      return;
    }

    const item: SaveItem = this.listBox.GetItemByIndex(index);
    const filename: string = item.innerNameText.GetText();

    deleteGameSave(filename);

    this.listBox.RemoveItem(item);
    this.OnListItemClicked();
  }

  public OnButton_ok_clicked(): void {
    logger.info("OK confirm clicked");

    this.newSave = this.editBox.GetText();

    if (string.len(this.newSave) === 0) {
      logger.info("Save name is empty");

      this.modalBoxMode = 0;
      this.messageBox.InitMessageBox("message_box_empty_file_name");
      this.messageBox.ShowDialog(true);

      return;
    }

    const fs: FS = getFS();
    const fileList: FS_file_list = fs.file_list_open(roots.gameSaves, FS.FS_ListFiles);
    const fileExists: Optional<number> = fs.exist(roots.gameSaves, this.newSave + gameConfig.GAME_SAVE_EXTENSION);

    if (fileExists !== null) {
      logger.info("File already exists");

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

    logger.info("Saved");
  }

  public OnButton_cancel_clicked(): void {
    logger.info("Cancel clicked");
    this.owner.ShowDialog(true);
    this.HideDialog();
    this.owner.Show(true);
  }

  public override OnKeyboard(key: TXR_DIK_key, event: TXR_ui_event): boolean {
    super.OnKeyboard(key, event);

    if (dik_to_bind(key) === key_bindings.kQUIT) {
      this.OnButton_cancel_clicked();
    } else if (key === DIK_keys.DIK_RETURN && event === ui_events.WINDOW_KEY_PRESSED) {
      this.OnButton_ok_clicked();
    }

    return true;
  }

  public AddItemToList(filename: string, datetime: string): void {
    const saveItem: SaveItem = new SaveItem(this.fileItemMainSize.y, this.fileItemFdSize.x, datetime);

    saveItem.SetWndSize(this.fileItemMainSize);

    saveItem.innerNameText.SetWndPos(new vector2().set(0, 0));
    saveItem.innerNameText.SetWndSize(this.fileItemFnSize);
    saveItem.innerNameText.SetText(filename);
    saveItem.innerAgeText.SetWndPos(new vector2().set(this.fileItemFnSize.x + 4, 0));

    this.listBox.AddExistingItem(saveItem);
  }

  public SaveFile(filename: string): void {
    logger.info("Save file:", filename);

    if (filename !== null) {
      const console: CConsole = get_console();

      console.execute("save " + filename);
    }
  }
}
