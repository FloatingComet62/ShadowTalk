export function assert(
  condition: boolean,
  message: string
): asserts condition {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}