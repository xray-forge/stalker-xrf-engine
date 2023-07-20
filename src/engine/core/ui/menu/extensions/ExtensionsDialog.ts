import {
  CScriptXmlInit,
  CUI3tButton,
  CUIListBox,
  CUIScriptWnd,
  CUIStatic,
  CUIWindow,
  DIK_keys,
  Frect,
  LuabindClass,
  ui_events,
  vector2,
} from "xray16";

import { ExtensionItemListEntry } from "@/engine/core/ui/menu/extensions/ExtensionItemListEntry";
import { getAvailableExtensions, IExtensionsDescriptor } from "@/engine/core/utils/extensions";
import {
  loadExtensionsOrder,
  saveExtensionsOrder,
  syncExtensionsOrder,
} from "@/engine/core/utils/extensions/extensions_order";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { LuaArray, TIndex, TKeyCode, TPath, TUIEvent, Vector2D } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\ExtensionsDialog.component";

/**
 * Window to sort extensions load order and disable/enable them.
 */
@LuabindClass()
export class ExtensionsDialog extends CUIScriptWnd {
  public xml!: CScriptXmlInit;

  public readonly owner: CUIScriptWnd;

  public uiDialog!: CUIStatic;
  public uiItemsList!: CUIListBox<ExtensionItemListEntry>;
  public uiUpButton!: CUI3tButton;
  public uiDownButton!: CUI3tButton;

  public uiItemListMainSize!: Vector2D;
  public uiItemListNameSize!: Vector2D;
  public uiItemListDdSize!: Vector2D;

  public extensions: LuaArray<IExtensionsDescriptor>;

  public constructor(owner: CUIScriptWnd) {
    super();

    this.owner = owner;
    this.extensions = syncExtensionsOrder(getAvailableExtensions(), loadExtensionsOrder());

    this.SetWindowName(ExtensionsDialog.__name);

    this.initControls();
    this.initCallBacks();
    this.initState();
  }

  /**
   * Init controls for extensions management.
   */
  public initControls(): void {
    this.SetWndRect(new Frect().set(0, 0, gameConfig.UI.BASE_WIDTH, gameConfig.UI.BASE_HEIGHT));
    this.Enable(true);

    this.xml = resolveXmlFile(base);
    this.xml.InitStatic("background", this);

    this.uiDialog = this.xml.InitStatic("main_dialog:dialog", this);
    this.Register(this.xml.Init3tButton("main_dialog:btn_accept", this.uiDialog), "accept_button");
    this.Register(this.xml.Init3tButton("main_dialog:btn_cancel", this.uiDialog), "cancel_button");

    this.uiUpButton = this.xml.Init3tButton("up_button", this);
    this.uiDownButton = this.xml.Init3tButton("down_button", this);

    this.Register(this.uiUpButton, "up_button");
    this.Register(this.uiDownButton, "down_button");

    this.xml.InitFrame("items_list_frame", this);
    this.uiItemsList = this.xml.InitListBox("items_list", this);
    this.uiItemsList.ShowSelectedItem(true);
    this.Register(this.uiItemsList, "items_list");

    const window: CUIWindow = new CUIWindow();

    this.xml.InitWindow("extension_item:main", 0, window);
    this.uiItemListMainSize = new vector2().set(window.GetWidth(), window.GetHeight());
    this.xml.InitWindow("extension_item:fn", 0, window);
    this.uiItemListNameSize = new vector2().set(window.GetWidth(), window.GetHeight());
    this.xml.InitWindow("extension_item:fd", 0, window);
    this.uiItemListDdSize = new vector2().set(window.GetWidth(), window.GetHeight());
  }

  /**
   * Initialize forms callbacks.
   */
  public initCallBacks(): void {
    this.AddCallback("items_list", ui_events.LIST_ITEM_SELECT, () => this.onActiveExtensionChange(), this);
    this.AddCallback("up_button", ui_events.BUTTON_CLICKED, () => this.onUpButtonClick(), this);
    this.AddCallback("down_button", ui_events.BUTTON_CLICKED, () => this.onDownButtonClick(), this);
    this.AddCallback("accept_button", ui_events.BUTTON_CLICKED, () => this.onAcceptButtonClick(), this);
    this.AddCallback("cancel_button", ui_events.BUTTON_CLICKED, () => this.onCancelButtonClick(), this);
  }

  /**
   * Initialize state of extensions dialog.
   */
  public initState(): void {
    this.fillItemsList();

    if (this.extensions.length() > 0) {
      this.uiItemsList.SetSelectedIndex(0);
      this.onActiveExtensionChange();
    } else {
      this.uiUpButton.Enable(false);
      this.uiDownButton.Enable(false);
    }
  }

  /**
   * Fill extensions list with up-to-date extensions.
   */
  public fillItemsList(): void {
    this.uiItemsList.RemoveAll();

    for (const [index, extension] of this.extensions) {
      const extensionItem: ExtensionItemListEntry = new ExtensionItemListEntry(
        this.uiItemListMainSize.y,
        this.uiItemListDdSize.x,
        index,
        extension.name
      );

      extensionItem.SetWndSize(this.uiItemListMainSize);
      extensionItem.uiInnerNameText.SetWndPos(new vector2().set(0, 0));
      extensionItem.uiInnerNameText.SetWndSize(this.uiItemListNameSize);
      extensionItem.uiInnerSectionText.SetWndPos(new vector2().set(this.uiItemListNameSize.x + 4, 0));
      extensionItem.uiInnerSectionText.SetWndSize(this.uiItemListDdSize);

      this.uiItemsList.AddExistingItem(extensionItem);
    }
  }

  /**
   * When select different extension in menu
   */
  public onActiveExtensionChange(): void {
    const activeIndex: TIndex = this.uiItemsList.GetSelectedIndex();

    if (activeIndex === 0) {
      this.uiUpButton.Enable(false);
      this.uiDownButton.Enable(true);
    } else if (activeIndex === this.extensions.length() - 1) {
      this.uiUpButton.Enable(true);
      this.uiDownButton.Enable(false);
    } else {
      this.uiUpButton.Enable(true);
      this.uiDownButton.Enable(true);
    }
  }

  /**
   * Move up in priority.
   */
  public onUpButtonClick(): void {
    const activeIndex: TIndex = this.uiItemsList.GetSelectedIndex() + 1;
    const nextIndex: TIndex = activeIndex - 1;

    if (nextIndex < 1 || nextIndex > this.extensions.length()) {
      return;
    }

    const first: IExtensionsDescriptor = this.extensions.get(activeIndex);
    const second: IExtensionsDescriptor = this.extensions.get(nextIndex);

    this.extensions.set(activeIndex, second);
    this.extensions.set(nextIndex, first);

    this.fillItemsList();
    this.uiItemsList.SetSelectedIndex(this.uiItemsList.GetSelectedIndex() + 1);
    this.onActiveExtensionChange();
  }

  /**
   * Move down in priority.
   */
  public onDownButtonClick(): void {
    const activeIndex: TIndex = this.uiItemsList.GetSelectedIndex() + 1;
    const nextIndex: TIndex = activeIndex + 1;

    if (nextIndex < 1 || nextIndex > this.extensions.length()) {
      return;
    }

    const first: IExtensionsDescriptor = this.extensions.get(activeIndex);
    const second: IExtensionsDescriptor = this.extensions.get(nextIndex);

    this.extensions.set(activeIndex, second);
    this.extensions.set(nextIndex, first);

    this.fillItemsList();
    this.uiItemsList.SetSelectedIndex(this.uiItemsList.GetSelectedIndex() + 2);
    this.onActiveExtensionChange();
  }

  /**
   * Handle accept and go back to main menu.
   */
  public onAcceptButtonClick(): void {
    logger.info("Saving extensions order preferences");

    saveExtensionsOrder(this.extensions);

    this.owner.ShowDialog(true);
    this.owner.Show(true);

    this.HideDialog();
  }

  /**
   * Handle cancel and go back to main menu.
   */
  public onCancelButtonClick(): void {
    logger.info("Discard extensions order changes");

    this.extensions = syncExtensionsOrder(getAvailableExtensions(), loadExtensionsOrder());
    this.fillItemsList();

    this.owner.ShowDialog(true);
    this.owner.Show(true);

    this.HideDialog();
  }

  /**
   * On key press when extensions menu is active.
   */
  public override OnKeyboard(key: TKeyCode, event: TUIEvent): boolean {
    const result: boolean = super.OnKeyboard(key, event);

    if (event === ui_events.WINDOW_KEY_PRESSED) {
      if (key === DIK_keys.DIK_ESCAPE) {
        this.onCancelButtonClick();
      }
    }

    return result;
  }
}
