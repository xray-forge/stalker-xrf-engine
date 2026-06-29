import { IExtensionsDescriptor } from "@/engine/core/utils/extensions";
import { TName } from "@/engine/lib/types";

/**
 * @param base - Optional extension configuration.
 * @returns Generic extension mock.
 */
export function mockExtension(base: Partial<IExtensionsDescriptor & { name?: TName }> = {}): IExtensionsDescriptor {
  const name: TName = base.name ?? "mock";

  return {
    isEnabled: base.isEnabled ?? true,
    canToggle: base.canToggle ?? true,
    path: base.path ?? `$game_data$\\extensions\\${name}\\main.script`,
    entry: base.entry ?? `$game_data$\\extensions\\${name}\\main`,
    name: name,
    module: {},
  };
}
