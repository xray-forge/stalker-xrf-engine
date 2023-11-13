import { TSightType } from "@/engine/lib/types";

/**
 * Mock sight parameters enumeration class.
 */
export class MockCSightParams {
  public static readonly eSightTypeDummy: TSightType = -1;
  public static readonly eSightTypeCurrentDirection: TSightType = 0;
  public static readonly eSightTypePathDirection: TSightType = 1;
  public static readonly eSightTypeDirection: TSightType = 2;
  public static readonly eSightTypePosition: TSightType = 3;
  public static readonly eSightTypeObject: TSightType = 4;
  public static readonly eSightTypeCover: TSightType = 5;
  public static readonly eSightTypeSearch: TSightType = 6;
  public static readonly eSightTypeLookOver: TSightType = 7;
  public static readonly eSightTypeCoverLookOver: TSightType = 8;
  public static readonly eSightTypeFireObject: TSightType = 9;
  public static readonly eSightTypeFirePosition: TSightType = 10;
  public static readonly eSightTypeAnimationDirection: TSightType = 11;
}
