import { CUIWindow } from "xray16";

import { AnyCallable, PartialRecord, TUIEvent } from "@/engine/lib/types";

/**
 * todo;
 */
export enum EElementType {
  BUTTON,
  COMBO_BOX,
  EDIT_BOX,
  LABEL,
  STATIC,
}

/**
 * todo;
 */
export interface IUiElementDescriptor {
  type: EElementType;
  base: CUIWindow;
  context?: CUIWindow;
  handlers?: PartialRecord<TUIEvent, AnyCallable>;
}
