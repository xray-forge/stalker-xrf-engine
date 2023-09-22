import { describe, expect, it } from "@jest/globals";

import { consoleCommands } from "@/engine/lib/constants/console_commands";

describe("console_commands constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(consoleCommands).forEach(([key, value]) => expect(key).toBe(value));
  });
});
