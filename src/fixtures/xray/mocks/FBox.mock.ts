import { Fbox } from "xray16";

import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

export class MockFbox {
  public static mock(): Fbox {
    return new MockFbox() as unknown as Fbox;
  }

  public max: MockVector = MockVector.create(2000, 2000, 2000);
  public min: MockVector = MockVector.create(-2000, -2000, -2000);
}
