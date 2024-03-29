import {
  CScriptXmlInit,
  CUI3tButton,
  CUIListBox,
  CUIScriptWnd,
  CUIWindow,
  DIK_keys,
  LuabindClass,
  ui_events,
} from "xray16";

import { ExtensionItemListEntry } from "@/engine/core/ui/menu/extensions/ExtensionItemListEntry";
import { getAvailableExtensions, IExtensionsDescriptor } from "@/engine/core/utils/extensions";
import {
  loadExtensionsState,
  saveExtensionsState,
  syncExtensionsState,
} from "@/engine/core/utils/extensions/extensions_state";
import { LuaLogger } from "@/engine/core/utils/logging";
import { createScreenRectangle } from "@/engine/core/utils/rectangle";
import { EElementType, initializeElement, resolveXmlFile } from "@/engine/core/utils/ui";
import { create2dVector, createEmpty2dVector } from "@/engine/core/utils/vector";
import { LuaArray, Optional, TIndex, TKeyCode, TPath, TUIEvent, Vector2D } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\ExtensionsDialog.component";

/**
 * Window to sort extensions load order and disable/enable them.
 */
@LuabindClass()
export class ExtensionsDialog extends CUIScriptWnd {
  public xml: CScriptXmlInit = resolveXmlFile(base);

  public readonly owner: CUIScriptWnd;

  public uiItemsList!: CUIListBox<ExtensionItemListEntry>;
  public uiToggleButton!: CUI3tButton;
  public uiUpButton!: CUI3tButton;
  public uiDownButton!: CUI3tButton;

  public uiItemListMainSize!: Vector2D;
  public uiItemListNameSize!: Vector2D;
  public uiItemListDdSize!: Vector2D;

  public extensions: LuaArray<IExtensionsDescriptor>;

  public constructor(owner: CUIScriptWnd) {
    super();

    this.owner = owner;
    this.extensions = syncExtensionsState(getAvailableExtensions(), loadExtensionsState());

    this.SetWindowName(ExtensionsDialog.__name);

    this.initControls();
    this.initState();
  }

  /**
   * Init controls for extensions management.
   */
  public initControls(): void {
    this.SetWndRect(createScreenRectangle());
    this.Enable(true);

    initializeElement(this.xml, EElementType.STATIC, "background", this);
    initializeElement(this.xml, EElementType.STATIC, "frame", this);
    initializeElement(this.xml, EElementType.FRAME, "items_list_frame", this);

    initializeElement(this.xml, EElementType.BUTTON, "accept_button", this, {
      [ui_events.BUTTON_CLICKED]: () => this.onAcceptButtonClick(),
    });
    initializeElement(this.xml, EElementType.BUTTON, "cancel_button", this, {
      [ui_events.BUTTON_CLICKED]: () => this.onCancelButtonClick(),
    });

    this.uiToggleButton = initializeElement(this.xml, EElementType.BUTTON, "toggle_button", this, {
      [ui_events.BUTTON_CLICKED]: () => this.onToggleButtonClick(),
    });
    this.uiUpButton = initializeElement(this.xml, EElementType.BUTTON, "up_button", this, {
      [ui_events.BUTTON_CLICKED]: () => this.onUpButtonClick(),
    });
    this.uiDownButton = initializeElement(this.xml, EElementType.BUTTON, "down_button", this, {
      [ui_events.BUTTON_CLICKED]: () => this.onDownButtonClick(),
    });

    this.uiItemsList = initializeElement(this.xml, EElementType.LIST_BOX, "items_list", this, {
      [ui_events.LIST_ITEM_SELECT]: () => this.onActiveExtensionChange(),
      [ui_events.WINDOW_LBUTTON_DB_CLICK]: () => {
        this.onActiveExtensionChange();
        this.onToggleButtonClick();
      },
    });
    this.uiItemsList.ShowSelectedItem(true);

    const window: CUIWindow = new CUIWindow();

    this.xml.InitWindow("extension_item:main", 0, window);
    this.uiItemListMainSize = create2dVector(window.GetWidth(), window.GetHeight());
    this.xml.InitWindow("extension_item:fn", 0, window);
    this.uiItemListNameSize = create2dVector(window.GetWidth(), window.GetHeight());
    this.xml.InitWindow("extension_item:fd", 0, window);
    this.uiItemListDdSize = create2dVector(window.GetWidth(), window.GetHeight());
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
        extension
      );

      extensionItem.SetWndSize(this.uiItemListMainSize);
      extensionItem.uiInnerNameText.SetWndPos(createEmpty2dVector());
      extensionItem.uiInnerNameText.SetWndSize(this.uiItemListNameSize);
      extensionItem.uiInnerSectionText.SetWndPos(create2dVector(this.uiItemListNameSize.x + 4, 0));
      extensionItem.uiInnerSectionText.SetWndSize(this.uiItemListDdSize);

      this.uiItemsList.AddExistingItem(extensionItem);
    }
  }

  /**
   * When select different extension in menu
   */
  public onActiveExtensionChange(): void {
    const activeIndex: TIndex = this.uiItemsList.GetSelectedIndex();
    const extension: Optional<IExtensionsDescriptor> = this.extensions.get(activeIndex + 1);

    this.uiToggleButton.Enable(extension?.canToggle === true);

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
   * Toggle extension enabled state.
   */
  public onToggleButtonClick(): void {
    const activeIndex: TIndex = this.uiItemsList.GetSelectedIndex() + 1;
    const extension: Optional<IExtensionsDescriptor> = this.extensions.get(
      activeIndex
    ) as Optional<IExtensionsDescriptor>;

    if (extension && extension.canToggle) {
      extension.isEnabled = !extension.isEnabled;

      this.fillItemsList();
      this.uiItemsList.SetSelectedIndex(activeIndex - 1);
    }
  }
  /**
   * Handle accept and go back to main menu.
   */
  public onAcceptButtonClick(): void {
    logger.info("Saving extensions order preferences");

    saveExtensionsState(this.extensions);

    this.owner.ShowDialog(true);
    this.owner.Show(true);

    this.HideDialog();
  }

  /**
   * Handle cancel and go back to main menu.
   */
  public onCancelButtonClick(): void {
    logger.info("Discard extensions order changes");

    this.extensions = syncExtensionsState(getAvailableExtensions(), loadExtensionsState());
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
