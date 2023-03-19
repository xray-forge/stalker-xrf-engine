import { describe, expect, it } from "@jest/globals";

import { console_commands } from "@/engine/lib/constants/console_commands";

describe("'console_commands' constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(console_commands).forEach(([key, value]) => expect(key).toBe(value));
  });
});
