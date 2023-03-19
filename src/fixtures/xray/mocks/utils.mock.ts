import { jest } from "@jest/globals";

import { AnyArgs } from "@/engine/lib/types";

export function resetMethodMock(mock: (...args: AnyArgs) => any): void {
  (mock as jest.Mock).mockReset();
}
