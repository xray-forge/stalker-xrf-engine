/**
 * @param bytes - Count of bytes.
 * @param precision - Precision to use when transforming.
 * @returns Megabytes value.
 */
export function transformBytesToMegabytes(bytes: number, precision: number = 3): number {
  return Number.parseFloat((bytes / 1024 / 1024).toFixed(precision));
}
