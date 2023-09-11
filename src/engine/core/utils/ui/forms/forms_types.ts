import { CUIWindow } from "xray16";

import { AnyCallable, PartialRecord, TUIEvent } from "@/engine/lib/types";

/**
 * Type of UI element to handle with utility helpers.
 */
export enum EElementType {
  BUTTON,
  FRAME,
  COMBO_BOX,
  LIST_BOX,
  EDIT_BOX,
  LABEL,
  STATIC,
}

/**
 * Descriptor of UI element for initialization with factory.
 */
export interface IUiElementDescriptor {
  type: EElementType;
  base: CUIWindow;
  context?: CUIWindow;
  handlers?: PartialRecord<TUIEvent, AnyCallable>;
}
