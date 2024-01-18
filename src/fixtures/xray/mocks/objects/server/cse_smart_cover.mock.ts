import { jest } from "@jest/globals";

import { MockAlifeObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Mock generic server object handling smart covers.
 */
export class MockAlifeSmartCover extends MockAlifeObject {
  public set_available_loopholes = jest.fn();

  public set_loopholes_table_checker = jest.fn();

  public description = jest.fn(() => "default");

  public FillProps(): void {}
}
