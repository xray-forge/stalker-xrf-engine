import { CServerList } from "xray16";

import { MockCUIWindow } from "@/fixtures/xray/mocks/objects/ui/CUIWindow.mock";

/**
 * Mock server list UI component.
 */
export class MockCServerList extends MockCUIWindow {
  public static override mock(): CServerList {
    return new MockCServerList() as unknown as CServerList;
  }
}
