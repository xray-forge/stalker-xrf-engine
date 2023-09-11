import { CUIScriptWnd, CUIStatic, CUIWindow } from "xray16";

import { abort } from "@/engine/core/utils/assertion";
import { EElementType, IUiElementDescriptor } from "@/engine/core/utils/ui/forms/forms_types";
import { AnyCallable, TStringId, XmlInit } from "@/engine/lib/types";

/**
 * Register UI element and add callback handlers for it.
 * Shorter variant than original API.
 *
 * @param xml - base xml file with form
 * @param selector - string id of element in base XML for reading
 * @param descriptor - configuration of element registration (events, naming, base etc)
 */
export function registerUiElement<T extends CUIWindow>(
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

    case EElementType.COMBO_BOX:
      element = xml.InitComboBox(selector, base) as unknown as T;
      break;

    case EElementType.EDIT_BOX:
      element = xml.InitEditBox(selector, base) as unknown as T;
      break;

    case EElementType.LABEL:
      element = xml.InitLabel(selector, base) as unknown as T;
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
