import { WorldProperty } from "xray16/alias";
import { MockLuabindClass } from "xray16/mocks";

/**
 * Mock game world state.
 */
export class MockWorldState extends MockLuabindClass {
  public properties: Array<WorldProperty> = [];

  public add_property(property: WorldProperty): void {
    this.properties.push(property);
  }
}
