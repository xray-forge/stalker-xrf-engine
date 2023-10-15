import {
  CScriptXmlInit,
  CUI3tButton,
  CUIListBox,
  CUIScriptWnd,
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
  loadExtensionsState,
  saveExtensionsState,
  syncExtensionsState,
} from "@/engine/core/utils/extensions/extensions_state";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EElementType, initializeElement, resolveXmlFile } from "@/engine/core/utils/ui";
import { create2dVector } from "@/engine/core/utils/vector";
import { screenConfig } from "@/engine/lib/configs/ScreenConfig";
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
    this.SetWndRect(new Frect().set(0, 0, screenConfig.BASE_WIDTH, screenConfig.BASE_HEIGHT));
    this.Enable(true);

    initializeElement(this.xml, "background", EElementType.STATIC, this);
    initializeElement(this.xml, "frame", EElementType.STATIC, this);
    initializeElement(this.xml, "items_list_frame", EElementType.FRAME, this);

    initializeElement(this.xml, "accept_button", EElementType.BUTTON, this, {
      [ui_events.BUTTON_CLICKED]: () => this.onAcceptButtonClick(),
    });
    initializeElement(this.xml, "cancel_button", EElementType.BUTTON, this, {
      [ui_events.BUTTON_CLICKED]: () => this.onCancelButtonClick(),
    });

    this.uiUpButton = initializeElement(this.xml, "toggle_button", EElementType.BUTTON, this, {
      [ui_events.BUTTON_CLICKED]: () => this.onToggleButtonClick(),
    });
    this.uiUpButton = initializeElement(this.xml, "up_button", EElementType.BUTTON, this, {
      [ui_events.BUTTON_CLICKED]: () => this.onUpButtonClick(),
    });
    this.uiDownButton = initializeElement(this.xml, "down_button", EElementType.BUTTON, this, {
      [ui_events.BUTTON_CLICKED]: () => this.onDownButtonClick(),
    });

    this.uiItemsList = initializeElement(this.xml, "items_list", EElementType.LIST_BOX, this, {
      [ui_events.LIST_ITEM_SELECT]: () => this.onActiveExtensionChange(),
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
   * Toggle extension enabled state.
   */
  public onToggleButtonClick(): void {
    const activeIndex: TIndex = this.uiItemsList.GetSelectedIndex() + 1;
    const extension: Optional<IExtensionsDescriptor> = this.extensions.get(
      activeIndex
    ) as Optional<IExtensionsDescriptor>;

    if (extension) {
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
