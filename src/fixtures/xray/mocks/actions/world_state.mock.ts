import { world_property } from "xray16";

import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";

/**
 * Mock game world state.
 */
export class MockWorldState extends MockLuabindClass {
  public properties: Array<world_property> = [];

  public add_property(property: world_property): void {
    this.properties.push(property);
  }
}
