export function groupDigits(digits: string, groupSize: number): string {
  if (!Number.isInteger(groupSize) || groupSize < 2) {
    throw new RangeError(
      `groupDigits: groupSize must be an integer >= 2 (got ${String(groupSize)}).`,
    );
  }
  if (digits.length <= groupSize) return digits;

  const len = digits.length;
  const remainder = len % groupSize;
  const firstSize = remainder === 0 ? groupSize : remainder;

  const parts: string[] = [digits.slice(0, firstSize)];
  for (let i = firstSize; i < len; i += groupSize) {
    parts.push(digits.slice(i, i + groupSize));
  }
  return parts.join("_");
}
