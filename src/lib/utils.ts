/**
 * Shared Utility Functions
 * ========================
 * Put small, reusable helpers here. Keep this file lean —
 * if a utility grows complex, give it its own file in src/lib/.
 */

/**
 * Concatenates class names, filtering out falsy values.
 * A tiny alternative to `clsx` or `classnames` — no dependency needed.
 *
 * Usage:
 *   <div className={cn("px-4", isActive && "bg-blue-500", className)} />
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Pauses execution for the given number of milliseconds.
 * Useful for testing loading states and debugging timing issues.
 *
 * Usage:
 *   await sleep(1000); // wait 1 second
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
