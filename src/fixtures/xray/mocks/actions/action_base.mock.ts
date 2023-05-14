import { XR_action_base, XR_game_object, XR_world_property } from "xray16";

/**
 * todo;
 */
export class MockActionBase {
  public object!: XR_game_object;
  public preconditions: Array<XR_world_property> = [];
  public effects: Array<XR_world_property> = [];

  public initialize(): void {}

  public setup(object: XR_game_object): void {
    this.object = object;
  }

  public add_precondition(property: XR_world_property): void {
    this.preconditions.push(property);
  }

  public add_effect(property: XR_world_property): void {
    this.effects.push(property);
  }

  public execute(): void {}
}

export function mockActionBase(): XR_action_base {
  return new MockActionBase() as unknown as XR_action_base;
}
