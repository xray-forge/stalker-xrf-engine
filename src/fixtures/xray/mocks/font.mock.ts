/**
 * Mock generic game font.
 */
export class MockCGameFont {
  public static readonly alCenter: number = 2;
  public static readonly alLeft: number = 0;
  public static readonly alRight: number = 1;
}

export function mockGetFontLetterica16Russian(): MockCGameFont {
  return new MockCGameFont();
}
