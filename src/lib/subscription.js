/**
 * Helper to compute restaurant subscription details, days left, and grace-period deletion countdown.
 *
 * @param {Object} restaurant - The restaurant object (from mongoose doc or lean JSON)
 * @returns {Object} Subscription details
 */
export function getSubscriptionInfo(restaurant) {
  if (!restaurant) {
    return {
      plan: "trial",
      planName: "Free Trial",
      status: "trial",
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      daysLeft: 3,
      isExpired: false,
      deletionDaysLeft: 7,
      isOrderingAllowed: true,
      gracePeriodDays: 7,
      remainingPercent: 100,
    };
  }

  const sub = restaurant.subscription;
  const now = new Date();

  // If no explicit subscription dates, default to 3-day trial from restaurant creation date
  const createdAt = restaurant.createdAt ? new Date(restaurant.createdAt) : now;
  const defaultTrialEndDate = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);

  const plan = sub?.plan || "trial";
  const startDate = sub?.startDate ? new Date(sub.startDate) : createdAt;
  const gracePeriodDays = typeof sub?.gracePeriodDays === "number" ? sub.gracePeriodDays : 7;

  // Free trial runs for exactly 3 days from creation/start date
  let endDate;
  if (plan === "trial") {
    endDate = sub?.endDate ? new Date(sub.endDate) : new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  } else {
    endDate = sub?.endDate ? new Date(sub.endDate) : defaultTrialEndDate;
  }

  const msRemaining = endDate.getTime() - now.getTime();
  const isExpired = msRemaining <= 0;
  const daysLeft = isExpired ? 0 : Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  let deletionDaysLeft = 0;
  if (isExpired) {
    const daysSinceExpiry = Math.floor(Math.abs(msRemaining) / (1000 * 60 * 60 * 24));
    deletionDaysLeft = Math.max(0, gracePeriodDays - daysSinceExpiry);
  }

  const rawStatus = sub?.status || (isExpired ? (deletionDaysLeft > 0 ? "expired" : "suspended") : "trial");
  const computedStatus = isExpired ? (deletionDaysLeft > 0 ? "expired" : "suspended") : rawStatus;

  // Ordering is allowed only if restaurant is not inactive/suspended AND subscription is not expired
  const isOrderingAllowed = !isExpired && restaurant.status !== "inactive" && restaurant.status !== "suspended";

  const totalDurationMs = endDate.getTime() - startDate.getTime();
  const remainingPercent =
    isExpired
      ? 0
      : totalDurationMs > 0
      ? Math.min(100, Math.max(5, Math.round((msRemaining / totalDurationMs) * 100)))
      : 100;

  return {
    plan,
    planName: getPlanName(plan),
    status: computedStatus,
    startDate,
    endDate,
    daysLeft,
    isExpired,
    deletionDaysLeft,
    isOrderingAllowed,
    gracePeriodDays,
    remainingPercent,
  };
}

export function getPlanName(plan) {
  if (!plan) return "Subscription";
  const p = String(plan).toLowerCase();
  if (p === "trial") return "Free Trial";
  if (p === "plan_yearly" || p === "yearly" || p === "1-year") return "Annual Plan";
  if (p === "plan_quarterly" || p === "quarterly" || p === "3-month") return "Quarterly Plan";
  if (p === "plan_monthly" || p === "monthly" || p === "1-month") return "Monthly Plan";
  if (p === "starter") return "Starter Plan";
  if (p === "pro") return "Pro Plan";
  if (p === "enterprise") return "Enterprise Plan";
  return (
    p
      .replace(/^(plan_)/i, "")
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) + " Plan"
  );
}
