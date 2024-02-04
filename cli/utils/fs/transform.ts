/**
 * @param bytes - count of bytes
 * @param precision - precision to use when transforming
 * @returns megabytes value
 */
export function transformBytesToMegabytes(bytes: number, precision: number = 3): number {
  return Number.parseFloat((bytes / 1024 / 1024).toFixed(precision));
}
