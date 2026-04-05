import { useClerk, useUser } from '@clerk/clerk-react'
import { useEffect, useMemo, useState } from 'react'
import { useAppAuth } from '@/lib/auth'
import { getAppBillingFeatureSlugs, getAppBillingPlanSlugs, hasBillingAccess } from '@/lib/auth/billing'

const devAuthEnabled = import.meta.env.VITE_DEV_AUTH === 'true'

type BillingAccessSource = 'dev_auth' | 'billing_subscription' | 'session_claims' | 'none'

export interface ResolvedBillingAccess {
  isLoaded: boolean
  hasAccess: boolean
  source: BillingAccessSource
  subscriptionPlanSlugs: string[]
  subscriptionFeatureSlugs: string[]
}

const DEV_BILLING_ACCESS: ResolvedBillingAccess = {
  isLoaded: true,
  hasAccess: true,
  source: 'dev_auth',
  subscriptionPlanSlugs: [],
  subscriptionFeatureSlugs: [],
}

interface SubscriptionEntitlementResult {
  hasAccess: boolean
  planSlugs: string[]
  featureSlugs: string[]
}

interface SubscriptionFetchState {
  userId: string
  entitlement: SubscriptionEntitlementResult | null
}

interface BillingFeatureLike {
  slug: string
}

interface BillingPlanLike {
  slug: string
  isDefault: boolean
  forPayerType: string
  features: BillingFeatureLike[]
}

interface BillingSubscriptionItemLike {
  status: string
  plan: BillingPlanLike
}

interface BillingSubscriptionLike {
  subscriptionItems: BillingSubscriptionItemLike[]
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^user:/, '')
    .replace(/^org:/, '')
    .replace(/^u:/, '')
    .replace(/^o:/, '')
    .replace(/-/g, '_')
}

function getSubscriptionEntitlement(
  subscription: BillingSubscriptionLike,
  allowedPlanSlugs: readonly string[],
  allowedFeatureSlugs: readonly string[]
): SubscriptionEntitlementResult {
  const activeStatuses = new Set(['active', 'past_due', 'upcoming'])
  const activeUserItems = subscription.subscriptionItems.filter(
    (item) => activeStatuses.has(item.status) && item.plan.forPayerType === 'user'
  )

  const planSlugs = activeUserItems.map((item) => item.plan.slug)
  const featureSlugs = activeUserItems.flatMap((item) => item.plan.features.map((feature) => feature.slug))
  const normalizedAllowedPlans = new Set(allowedPlanSlugs.map((slug) => normalizeSlug(slug)))
  const normalizedAllowedFeatures = new Set(allowedFeatureSlugs.map((slug) => normalizeSlug(slug)))

  const hasMatchingPlanSlug = planSlugs.some((slug) => normalizedAllowedPlans.has(normalizeSlug(slug)))
  const hasMatchingFeatureSlug = featureSlugs.some((slug) => normalizedAllowedFeatures.has(normalizeSlug(slug)))
  const hasAnyNonDefaultUserPlan = activeUserItems.some((item) => !item.plan.isDefault)

  return {
    hasAccess: hasAnyNonDefaultUserPlan || hasMatchingPlanSlug || hasMatchingFeatureSlug,
    planSlugs,
    featureSlugs,
  }
}

/**
 * Clerk-backed billing access hook. Only safe to call when ClerkProvider is
 * mounted (i.e. NOT in dev-auth mode). The public `useResolvedBillingAccess`
 * below gates on the module-level `devAuthEnabled` constant so that this
 * function is never reached without a provider.
 */
function useClerkBillingAccess(): ResolvedBillingAccess {
  const { user, isLoaded: isUserLoaded } = useUser()
  const clerk = useClerk()
  const { isLoaded, isSignedIn, hasPlan, hasFeature } = useAppAuth()

  const billingPlanSlugs = useMemo(() => getAppBillingPlanSlugs(), [])
  const billingFeatureSlugs = useMemo(() => getAppBillingFeatureSlugs(), [])
  const sessionHasAccess = useMemo(
    () =>
      hasBillingAccess({
        hasPlan,
        hasFeature,
        planSlugs: billingPlanSlugs,
        featureSlugs: billingFeatureSlugs,
      }),
    [hasPlan, hasFeature, billingPlanSlugs, billingFeatureSlugs]
  )

  const [subscriptionFetchState, setSubscriptionFetchState] = useState<SubscriptionFetchState | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!isLoaded || !isUserLoaded || !isSignedIn || !user?.id || !clerk.billing?.getSubscription) {
      return
    }

    void (async () => {
      try {
        const subscription = await clerk.billing.getSubscription({})
        if (cancelled) return

        setSubscriptionFetchState({
          userId: user.id,
          entitlement: getSubscriptionEntitlement(
            subscription,
            billingPlanSlugs,
            billingFeatureSlugs
          ),
        })
      } catch (error) {
        if (cancelled) return
        console.error('[BillingAccess] Failed to load Clerk billing subscription', error)
        setSubscriptionFetchState({ userId: user.id, entitlement: null })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    isLoaded,
    isSignedIn,
    isUserLoaded,
    user?.id,
    clerk,
    billingPlanSlugs,
    billingFeatureSlugs,
  ])

  return useMemo((): ResolvedBillingAccess => {
    if (!isLoaded || !isUserLoaded) {
      return {
        isLoaded: false,
        hasAccess: false,
        source: 'none',
        subscriptionPlanSlugs: [],
        subscriptionFeatureSlugs: [],
      }
    }

    if (!isSignedIn || !user?.id) {
      return {
        isLoaded: true,
        hasAccess: false,
        source: 'none',
        subscriptionPlanSlugs: [],
        subscriptionFeatureSlugs: [],
      }
    }

    if (!clerk.billing?.getSubscription) {
      return {
        isLoaded: true,
        hasAccess: sessionHasAccess,
        source: sessionHasAccess ? 'session_claims' : 'none',
        subscriptionPlanSlugs: [],
        subscriptionFeatureSlugs: [],
      }
    }

    if (!subscriptionFetchState || subscriptionFetchState.userId !== user.id) {
      return {
        isLoaded: false,
        hasAccess: false,
        source: 'none',
        subscriptionPlanSlugs: [],
        subscriptionFeatureSlugs: [],
      }
    }

    const entitlement = subscriptionFetchState.entitlement
    if (entitlement) {
      const hasAccess = entitlement.hasAccess || sessionHasAccess
      return {
        isLoaded: true,
        hasAccess,
        source: entitlement.hasAccess ? 'billing_subscription' : (sessionHasAccess ? 'session_claims' : 'none'),
        subscriptionPlanSlugs: entitlement.planSlugs,
        subscriptionFeatureSlugs: entitlement.featureSlugs,
      }
    }

    return {
      isLoaded: true,
      hasAccess: sessionHasAccess,
      source: sessionHasAccess ? 'session_claims' : 'none',
      subscriptionPlanSlugs: [],
      subscriptionFeatureSlugs: [],
    }
  }, [
    isLoaded,
    isUserLoaded,
    isSignedIn,
    user?.id,
    clerk.billing,
    sessionHasAccess,
    subscriptionFetchState,
  ])
}

// eslint-disable-next-line react-hooks/rules-of-hooks -- `devAuthEnabled` is a build-time constant; the branch taken is always the same across renders.
export function useResolvedBillingAccess(): ResolvedBillingAccess {
  if (devAuthEnabled) {
    return DEV_BILLING_ACCESS
  }
  return useClerkBillingAccess()
}
