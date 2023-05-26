import { XR_action_base, XR_game_object, XR_world_property } from "xray16";

import { Optional } from "@/engine/lib/types";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";

/**
 * todo;
 */
export class MockActionBase extends MockLuabindClass {
  public object: Optional<XR_game_object>;
  public name: string;

  public preconditions: Array<XR_world_property> = [];
  public effects: Array<XR_world_property> = [];

  public constructor(object: Optional<XR_game_object> = null, name: string) {
    super();

    this.object = object;
    this.name = name || this.constructor.name;
  }

  public initialize(): void {}

  public execute(): void {}

  public setup(object: XR_game_object): void {
    this.object = object;
  }

  public add_precondition(property: XR_world_property): void {
    this.preconditions.push(property);
  }

  public add_effect(property: XR_world_property): void {
    this.effects.push(property);
  }

  public getPrecondition(id: number): Optional<XR_world_property> {
    return this.preconditions.find((it) => it.condition() === id) ?? null;
  }

  public getEffect(id: number): Optional<XR_world_property> {
    return this.effects.find((it) => it.condition() === id) ?? null;
  }
}

export function mockActionBase(object: Optional<XR_game_object> = null, name: string = "generic"): XR_action_base {
  return new MockActionBase(object, name) as unknown as XR_action_base;
}
