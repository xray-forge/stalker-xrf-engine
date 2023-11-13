import { jest } from "@jest/globals";

import { AnyArgs } from "@/engine/lib/types";

/**
 * C++ properties_helper class mock.
 */
export class MockPropertiesHelper {
  public create_bool = jest.fn((...args: AnyArgs) => args);
}
