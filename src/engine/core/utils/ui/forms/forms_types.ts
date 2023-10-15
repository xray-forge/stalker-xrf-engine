import { CUIWindow } from "xray16";

import { AnyCallable, PartialRecord, TUIEvent } from "@/engine/lib/types";

/**
 * Type of UI element to handle with utility helpers.
 */
export enum EElementType {
  BUTTON,
  CHECK_BUTTON,
  FRAME,
  FRAME_LINE,
  COMBO_BOX,
  LIST_BOX,
  EDIT_BOX,
  LABEL,
  TEXT_WINDOW,
  STATIC,
  SPIN_NUM,
  MAP_LIST,
  MAP_INFO,
  SCROLL_VIEW,
  TAB,
  CD_KEY,
  MESSAGE_BOX,
  MESSAGE_BOX_EX,
}

/**
 * Descriptor of UI element for initialization with factory.
 */
export interface IUiElementDescriptor {
  context?: CUIWindow;
  handlers?: PartialRecord<TUIEvent, AnyCallable>;
}
