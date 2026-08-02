/**
 * Resolve the documented module from the extern interface rather than its source file layout.
 */
export function getExternModuleName(externName: string, fallbackModuleName: string): string {
  return externName.includes(".") ? externName.split(".")[0] : fallbackModuleName;
}
