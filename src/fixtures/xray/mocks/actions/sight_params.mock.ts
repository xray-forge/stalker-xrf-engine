import { ClientObject, TSightType, Vector } from "@/engine/lib/types";

export class MockSightParameters {
  public static readonly eSightTypeDummy: -1;
  public static readonly eSightTypeCurrentDirection: 0;
  public static readonly eSightTypePathDirection: 1;
  public static readonly eSightTypeDirection: 2;
  public static readonly eSightTypePosition: 3;
  public static readonly eSightTypeObject: 4;
  public static readonly eSightTypeCover: 5;
  public static readonly eSightTypeSearch: 6;
  public static readonly eSightTypeLookOver: 7;
  public static readonly eSightTypeCoverLookOver: 8;
  public static readonly eSightTypeFireObject: 9;
  public static readonly eSightTypeFirePosition: 10;
  public static readonly eSightTypeAnimationDirection: 11;

  public m_object!: ClientObject;
  public m_sight_type!: TSightType;
  public m_vector!: Vector;

  public constructor() {}
}
