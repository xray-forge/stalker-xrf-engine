import { CUIWindow } from "xray16";

import { EGameRenderer } from "@/engine/core/ui/menu/options/options_types";

/**
 * Checks if renderer is in `1` mode and sets control enabled state accordingly.
 *
 * @param control - element to change enabled state based on renderer
 * @param id - identifier of currently active renderer
 */
export function preconditionOnly1mode(control: CUIWindow, id: EGameRenderer): void {
  control.Enable(id === EGameRenderer.R1);
}

/**
 * Checks if renderer is in `2a` mode and sets control enabled state accordingly.
 *
 * @param control - element to change enabled state based on renderer
 * @param id - identifier of currently active renderer
 */
export function preconditionOnly2aAndMoreMode(control: CUIWindow, id: EGameRenderer): void {
  control.Enable(id >= EGameRenderer.R2A);
}

/**
 * Checks if renderer is in `2` mode or higher and sets control enabled state accordingly.
 *
 * @param control - element to change enabled state based on renderer
 * @param id - identifier of currently active renderer
 */
export function preconditionOnly2andMoreMode(control: CUIWindow, id: EGameRenderer): void {
  control.Enable(id >= EGameRenderer.R2);
}

/**
 * Checks if renderer is in `2.5` mode or higher and sets control enabled state accordingly.
 *
 * @param control - element to change enabled state based on renderer
 * @param id - identifier of currently active renderer
 */
export function preconditionOnly25andMoreMode(control: CUIWindow, id: EGameRenderer): void {
  control.Enable(id >= EGameRenderer.R25);
}

/**
 * Checks if renderer is in `3` mode or higher and sets control enabled state accordingly.
 *
 * @param control - element to change enabled state based on renderer
 * @param id - identifier of currently active renderer
 */
export function preconditionOnly3andMoreMode(control: CUIWindow, id: EGameRenderer): void {
  control.Enable(id >= EGameRenderer.R3);
}

/**
 * Checks if renderer is in `3` mode or higher and sets control enabled state accordingly.
 * Additionally, controls visibility and hides element if renderer is not matching.
 *
 * @param control - element to change enabled state based on renderer
 * @param id - identifier of currently active renderer
 */
export function preconditionOnly3andMoreModeVisible(control: CUIWindow, id: EGameRenderer): void {
  const isEnabled: boolean = id >= EGameRenderer.R3;

  control.Enable(isEnabled);
  control.Show(isEnabled);
}

/**
 * Checks if renderer is in `25` mode or lower and sets control enabled state accordingly.
 * Additionally, controls visibility and hides element if renderer is not matching.
 *
 * @param control - element to change enabled state based on renderer
 * @param id - identifier of currently active renderer
 */
export function preconditionOnly25andLessModeVisible(control: CUIWindow, id: EGameRenderer): void {
  const isEnabled: boolean = id <= EGameRenderer.R25;

  control.Enable(isEnabled);
  control.Show(isEnabled);
}
