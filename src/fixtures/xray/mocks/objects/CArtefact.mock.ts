import { jest } from "@jest/globals";
import { CArtefact } from "xray16";

/**
 * Mock wrapper around game artefact object.
 */
export class MockCArtefact {
  public static mock(): CArtefact {
    return new MockCArtefact() as unknown as CArtefact;
  }

  public FollowByPath = jest.fn();
  public GetAfRank = jest.fn(() => 1);
  public SwitchVisibility = jest.fn();
}
