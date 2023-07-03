import {
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
  GetFontMedium,
  getFS,
  key_bindings,
  LuabindClass,
  ui_events,
  vector2,
} from "xray16";

import { SaveItem } from "@/engine/core/ui/menu/save/SaveItem";
import { executeConsoleCommand } from "@/engine/core/utils/game/game_console";
import { deleteGameSave } from "@/engine/core/utils/game/game_save";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { roots } from "@/engine/lib/constants/roots";
import {
  FSFileList,
  FSFileListEX,
  FSItem,
  Optional,
  TKeyCode,
  TName,
  TPath,
  TUIEvent,
  Vector2D,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\SaveDialog.component";

/**
 * todo;
 */
@LuabindClass()
export class SaveDialog extends CUIScriptWnd {
  public owner: CUIScriptWnd;

  public readonly listFileFont: CGameFont = GetFontMedium();
  public readonly listDateFont: CGameFont = GetFontMedium();

  public fileItemMainSize!: Vector2D;
  public fileItemFnSize!: Vector2D;
  public fileItemFdSize!: Vector2D;

  public uiForm!: CUIStatic;
  public uiEditBox!: CUIEditBox;
  public uiListBox!: CUIListBox<SaveItem>;
  public uiMessageBox!: CUIMessageBoxEx;

  public newSave: string = "";
  public modalBoxMode: number = 0;

  public constructor(owner: CUIScriptWnd) {
    super();

    this.owner = owner;

    this.initControls();
    this.initCallBacks();
    this.fillList();
  }

  public initControls(): void {
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

    this.uiForm = xml.InitStatic("form", this);
    xml.InitTextWnd("form:caption", this.uiForm);

    this.uiEditBox = xml.InitEditBox("form:edit", this.uiForm);
    this.Register(this.uiEditBox, "edit_filename");

    xml.InitFrame("form:list_frame", this.uiForm);
    this.uiListBox = xml.InitListBox("form:list", this.uiForm);
    this.uiListBox.ShowSelectedItem(true);
    this.Register(this.uiListBox, "list_window");

    this.Register(xml.Init3tButton("form:btn_save", this.uiForm), "button_ok");
    this.Register(xml.Init3tButton("form:btn_delete", this.uiForm), "button_del");
    this.Register(xml.Init3tButton("form:btn_cancel", this.uiForm), "button_cancel");

    this.uiMessageBox = new CUIMessageBoxEx();
    this.Register(this.uiMessageBox, "message_box");
  }

  public initCallBacks(): void {
    this.AddCallback("button_ok", ui_events.BUTTON_CLICKED, () => this.onOkButtonClicked(), this);
    this.AddCallback("button_cancel", ui_events.BUTTON_CLICKED, () => this.onCancelButtonClicked(), this);
    this.AddCallback("button_del", ui_events.BUTTON_CLICKED, () => this.onDeleteButtonClicked(), this);

    this.AddCallback("message_box", ui_events.MESSAGE_BOX_YES_CLICKED, () => this.onMessageYesClicked(), this);
    this.AddCallback("list_window", ui_events.LIST_ITEM_CLICKED, () => this.onListItemClicked(), this);
  }

  public fillList(): void {
    logger.info("Fill list");

    this.uiListBox.RemoveAll();

    const fileList: FSFileListEX = getFS().file_list_open_ex(
      roots.gameSaves,
      FS.FS_ListFiles,
      "*" + gameConfig.GAME_SAVE_EXTENSION
    );

    fileList.Sort(FS.FS_sort_by_modif_down);

    for (let it = 0; it < fileList.Size(); it += 1) {
      const file: FSItem = fileList.GetAt(it);
      const fileName: TName = string.sub(
        file.NameFull(),
        0,
        string.len(file.NameFull()) - string.len(gameConfig.GAME_SAVE_EXTENSION)
      );
      const dateTime: string = "[" + file.ModifDigitOnly() + "]";

      // --menu_item =  +
      this.addItemToList(fileName, dateTime);
    }
  }

  public onListItemClicked(): void {
    logger.info("List item clicked");

    if (this.uiListBox.GetSize() === 0) {
      return;
    }

    const item = this.uiListBox.GetSelectedItem();

    if (item === null) {
      return;
    }

    const itemText: string = item.uiInnerNameText.GetText();

    this.uiEditBox.SetText(itemText);
  }

  public onMessageYesClicked(): void {
    logger.info("Message yes clicked:", this.modalBoxMode);

    if (this.modalBoxMode === 1) {
      this.saveFile(this.newSave);

      this.owner.ShowDialog(true);
      this.HideDialog();
      this.owner.Show(true);
    } else if (this.modalBoxMode === 2) {
      this.onDeleteSelectedFile();
    }
  }

  public onDeleteButtonClicked(): void {
    logger.info("Message delete clicked");

    if (this.uiListBox.GetSize() === 0) {
      return;
    }

    const item: Optional<SaveItem> = this.uiListBox.GetSelectedItem();

    if (item === null) {
      return;
    }

    this.modalBoxMode = 2;
    this.uiMessageBox.InitMessageBox("message_box_delete_file_name");
    this.uiMessageBox.ShowDialog(true);
  }

  public onDeleteSelectedFile(): void {
    logger.info("Deleting selected file");

    if (this.uiListBox.GetSize() === 0) {
      return;
    }

    const index: number = this.uiListBox.GetSelectedIndex();

    if (index === -1) {
      return;
    }

    const item: SaveItem = this.uiListBox.GetItemByIndex(index);
    const filename: string = item.uiInnerNameText.GetText();

    deleteGameSave(filename);

    this.uiListBox.RemoveItem(item);
    this.onListItemClicked();
  }

  public onOkButtonClicked(): void {
    logger.info("OK confirm clicked");

    this.newSave = this.uiEditBox.GetText();

    if (string.len(this.newSave) === 0) {
      logger.info("Save name is empty");

      this.modalBoxMode = 0;
      this.uiMessageBox.InitMessageBox("message_box_empty_file_name");
      this.uiMessageBox.ShowDialog(true);

      return;
    }

    const fs: FS = getFS();
    const fileList: FSFileList = fs.file_list_open(roots.gameSaves, FS.FS_ListFiles);
    const fileExists: Optional<number> = fs.exist(roots.gameSaves, this.newSave + gameConfig.GAME_SAVE_EXTENSION);

    if (fileExists !== null) {
      logger.info("File already exists");

      this.modalBoxMode = 1;
      this.uiMessageBox.InitMessageBox("message_box_file_already_exist");
      this.uiMessageBox.ShowDialog(true);

      fileList.Free();

      return;
    }

    fileList.Free();
    this.saveFile(this.newSave);

    this.owner.ShowDialog(true);
    this.HideDialog();
    this.owner.Show(true);

    logger.info("Saved");
  }

  public onCancelButtonClicked(): void {
    logger.info("Cancel clicked");
    this.owner.ShowDialog(true);
    this.HideDialog();
    this.owner.Show(true);
  }

  public override OnKeyboard(key: TKeyCode, event: TUIEvent): boolean {
    super.OnKeyboard(key, event);

    if (dik_to_bind(key) === key_bindings.kQUIT) {
      this.onCancelButtonClicked();
    } else if (key === DIK_keys.DIK_RETURN && event === ui_events.WINDOW_KEY_PRESSED) {
      this.onOkButtonClicked();
    }

    return true;
  }

  public addItemToList(filename: string, datetime: string): void {
    const saveItem: SaveItem = new SaveItem(this.fileItemMainSize.y, this.fileItemFdSize.x, datetime);

    saveItem.SetWndSize(this.fileItemMainSize);

    saveItem.uiInnerNameText.SetWndPos(new vector2().set(0, 0));
    saveItem.uiInnerNameText.SetWndSize(this.fileItemFnSize);
    saveItem.uiInnerNameText.SetText(filename);
    saveItem.uiInnerAgeText.SetWndPos(new vector2().set(this.fileItemFnSize.x + 4, 0));

    this.uiListBox.AddExistingItem(saveItem);
  }

  public saveFile(filename: string): void {
    logger.info("Save file:", filename);

    if (filename !== null) {
      executeConsoleCommand(consoleCommands.save, filename);
    }
  }
}
