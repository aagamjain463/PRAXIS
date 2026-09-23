export const entitlements = {
  free: { aiQuestionsPerMonth: 30, semanticSearch: false, advancedAnalytics: false },
  pro: { aiQuestionsPerMonth: 1000, semanticSearch: true, advancedAnalytics: true }
} as const;

export function entitlementFor(plan: string | null | undefined) {
  return plan === "pro" ? entitlements.pro : entitlements.free;
}
