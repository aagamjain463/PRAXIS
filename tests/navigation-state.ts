// Mutable pathname backing the `next/navigation` mock used in tests.
// Test files set `navigationMockState.pathname` before rendering components
// that read the current route via `usePathname()`.
export const navigationMockState = {
  pathname: "/",
};
