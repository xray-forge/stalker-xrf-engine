import { jest } from "@jest/globals";
import { AnyArgs } from "xray16/lib";

/**
 * C++ properties_helper class mock.
 */
export class MockPropertiesHelper {
  public create_bool = jest.fn((...args: AnyArgs) => args);
}
