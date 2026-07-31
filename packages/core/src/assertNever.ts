/**
 * Exhaustiveness helper for discriminated unions (AI_GUIDE §5.3).
 *
 * Call it in the `default` branch of a `switch` over a union's discriminant:
 * the compiler errors if a case is left unhandled, and it throws at runtime
 * if an unexpected value slips through.
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}
