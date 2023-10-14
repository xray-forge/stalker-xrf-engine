import { CUIMessageBox, CUIMessageBoxEx, CUIScriptWnd, CUIWindow } from "xray16";

import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EElementType, IUiElementDescriptor } from "@/engine/core/utils/ui/forms/forms_types";
import { AnyCallable, TStringId, XmlInit } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Initialize UI element and add callback handlers for it.
 * Shorter variant than original API.
 *
 * @param xml - base xml file with form
 * @param selector - string id of element in base XML for reading
 * @param descriptor - configuration of element registration (events, naming, base etc)
 * @returns initilized UI element instance
 */
export function initializeElement<T extends CUIWindow>(
  xml: XmlInit,
  selector: TStringId,
  descriptor: IUiElementDescriptor
): T {
  const { context, type, handlers, base } = descriptor;
  let element: T;

  // Handle UI registration and binding.
  switch (type) {
    case EElementType.BUTTON:
      element = xml.Init3tButton(selector, base) as unknown as T;
      break;

    case EElementType.STATIC:
      element = xml.InitStatic(selector, base) as unknown as T;
      break;

    case EElementType.CHECK_BUTTON:
      element = xml.InitCheck(selector, base) as unknown as T;
      break;

    case EElementType.COMBO_BOX:
      element = xml.InitComboBox(selector, base) as unknown as T;
      break;

    case EElementType.FRAME:
      element = xml.InitFrame(selector, base) as unknown as T;
      break;

    case EElementType.FRAME_LINE:
      element = xml.InitFrameLine(selector, base) as unknown as T;
      break;

    case EElementType.LIST_BOX:
      element = xml.InitListBox(selector, base) as unknown as T;
      break;

    case EElementType.EDIT_BOX:
      element = xml.InitEditBox(selector, base) as unknown as T;
      break;

    case EElementType.SCROLL_VIEW:
      element = xml.InitScrollView(selector, base) as unknown as T;
      break;

    case EElementType.LABEL:
      element = xml.InitLabel(selector, base) as unknown as T;
      break;

    case EElementType.SPIN_NUM:
      element = xml.InitSpinNum(selector, base) as unknown as T;
      break;

    case EElementType.MAP_LIST:
      element = xml.InitMapList(selector, base) as unknown as T;
      break;

    case EElementType.MAP_INFO:
      element = xml.InitMapInfo(selector, base) as unknown as T;
      break;

    case EElementType.TEXT_WINDOW:
      element = xml.InitTextWnd(selector, base) as unknown as T;
      break;

    case EElementType.MESSAGE_BOX:
      element = new CUIMessageBox() as unknown as T;
      break;

    case EElementType.MESSAGE_BOX_EX:
      element = new CUIMessageBoxEx() as unknown as T;
      break;

    default:
      abort("Could not register UI element for type: '%s'.", type);
  }

  // Handle event emit context and registration.
  if (handlers) {
    const eventBase: CUIScriptWnd = (context || base) as CUIScriptWnd;

    eventBase.Register(element as CUIWindow, selector);

    for (const [event, callback] of $fromObject(handlers)) {
      eventBase.AddCallback(selector, event, callback as AnyCallable, eventBase || base);
    }
  }

  return element;
}

/**
 * Register statics from XML file.
 * Shortcut to init many elements in a single call.
 *
 * @param xml - file with forms
 * @param base - base element to init new statics relatively from
 * @param selectors - variadic selectors list to initialize
 */
export function initializeStatics(xml: XmlInit, base: CUIWindow, ...selectors: Array<TStringId>): void {
  for (const selector of selectors) {
    initializeElement(xml, selector, { base, type: EElementType.STATIC });
  }
}
