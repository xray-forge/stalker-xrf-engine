import { jest } from "@jest/globals";
import { TName } from "xray16/lib";

import { IExtensionsDescriptor } from "@/engine/core/utils/extensions";

/**
 * @param base - Optional extension configuration.
 * @returns Generic extension mock.
 */
export function mockExtension(base: Partial<IExtensionsDescriptor & { name?: TName }> = {}): IExtensionsDescriptor {
  const name: TName = base.name ?? "mock";

  return {
    availabilityReason: base.availabilityReason ?? null,
    canToggle: base.canToggle ?? true,
    entry: base.entry ?? `$game_data$\\extensions\\${name}\\main`,
    isAvailable: base.isAvailable ?? true,
    isEnabled: base.isEnabled ?? true,
    module: {
      register: jest.fn(),
      unregister: jest.fn(),
    },
    name: name,
    path: base.path ?? `$game_data$\\extensions\\${name}\\main.script`,
  };
}
