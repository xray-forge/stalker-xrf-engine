import { WorldProperty } from "@/engine/lib/types";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";

/**
 * Mock game world state.
 */
export class MockWorldState extends MockLuabindClass {
  public properties: Array<WorldProperty> = [];

  public add_property(property: WorldProperty): void {
    this.properties.push(property);
  }
}
