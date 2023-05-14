import { XR_world_property, XR_world_state } from "xray16";

export class MockWorldState {
  public properties: Array<XR_world_property> = [];

  public add_property(property: XR_world_property): void {
    this.properties.push(property);
  }
}
