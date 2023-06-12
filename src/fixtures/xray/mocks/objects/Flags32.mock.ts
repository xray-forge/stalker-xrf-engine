import { Flags32 } from "@/engine/lib/types";

/**
 * Mock flags object.
 */
export class MockFlags32 {
  public static mock(): Flags32 {
    return new MockFlags32() as unknown as Flags32;
  }
}
