/**
 * String based name.
 */
export type TName = string;

/**
 * String based label.
 */
export type TLabel = string;

/**
 * String based path.
 */
export type TPath = string;

/**
 * Number based identifier.
 */
export type TNumberId = number;

/**
 * Number based index.
 * Expect numbers in 0...N range.
 */
export type TIndex = number;

/**
 * Number based timestamp.
 */
export type TTimestamp = number;

/**
 * String based identifier.
 */
export type TStringId = string;

/**
 * Number based probability.
 * Expect numbers in 0...100 range.
 */
export type TProbability = number;

/**
 * Number based distance.
 */
export type TDistance = number;

/**
 * Number based direction.
 */
export type TDirection = number;

/**
 * Number based duration.
 */
export type TDuration = number;

/**
 * Number based count.
 */
export type TCount = number;

/**
 * Number based rate.
 */
export type TRate = number;

/**
 * Number based size.
 */
export type TSize = number;

/**
 * Number based coordinate.
 */
export type TCoordinate = number;

/**
 * Boolean value not correctly cast from C++ number;
 */
export type TNotCastedBoolean = 0 | 1;

/**
 * Boolean value cast to string.
 */
export type TStringifiedBoolean = "true" | "false";
