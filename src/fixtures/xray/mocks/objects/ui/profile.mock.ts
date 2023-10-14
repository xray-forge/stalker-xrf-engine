import { jest } from "@jest/globals";

import { Profile } from "@/engine/lib/types";

export class MockProfile {
  public static mock(name: string = ""): Profile {
    return new MockProfile(name) as unknown as Profile;
  }

  public name: string;

  public constructor(name: string = "") {
    this.name = name;
  }

  public unique_nick = jest.fn(() => this.name);
}
