import { CUIWindow } from "xray16";

import { EGameRenderer } from "@/engine/core/ui/menu/options/types";

/**
 * todo;
 */
export function only1mode(control: CUIWindow, id: EGameRenderer): void {
  control.Enable(id === EGameRenderer.R1);
}

// -- >=R2a
/**
 * todo;
 */
export function only2aAndMoreMode(control: CUIWindow, id: EGameRenderer): void {
  control.Enable(id >= EGameRenderer.R2A);
}

// -- >=R2
/**
 * todo;
 */
export function only2andMoreMode(control: CUIWindow, id: EGameRenderer): void {
  control.Enable(id >= EGameRenderer.R2);
}

// -- >=R2.5
/**
 * todo;
 */
export function only25andMoreMode(control: CUIWindow, id: EGameRenderer): void {
  control.Enable(id >= EGameRenderer.R25);
}

// -- >=R3
/**
 * todo;
 */
export function only3andMoreMode(control: CUIWindow, id: EGameRenderer): void {
  control.Enable(id >= EGameRenderer.R3);
}

/**
 * todo;
 */
export function only3andMoreModeVisible(control: CUIWindow, id: EGameRenderer): void {
  const isEnabled: boolean = id >= EGameRenderer.R3;

  control.Enable(isEnabled);
  control.Show(isEnabled);
}

/**
 * todo;
 */
export function only3andMoreModeInvisible(control: CUIWindow, id: EGameRenderer): void {
  const isEnabled: boolean = id < EGameRenderer.R3;

  control.Enable(isEnabled);
  control.Show(isEnabled);
}

/**
 * todo;
 */
export function only4(control: CUIWindow, id: EGameRenderer) {
  return id === EGameRenderer.R4;
}

/**
 * todo;
 */
export function only4andMore(control: CUIWindow, id: EGameRenderer) {
  return id >= EGameRenderer.R4;
}
