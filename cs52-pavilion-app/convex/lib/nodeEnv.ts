/**
 * Read environment variables in Convex actions / Node context.
 * Uses `globalThis.process` so `tsc -p convex` does not depend on `@types/node` resolution.
 */
export function nodeEnv(name: string): string | undefined {
  const proc = (globalThis as Record<string, unknown>).process as
    | { env?: Record<string, string | undefined> }
    | undefined;
  return proc?.env?.[name];
}
