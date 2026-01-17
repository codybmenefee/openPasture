import { useState, useEffect } from 'react'
import { BriefCard } from './BriefCard'
import { AlternativeCard } from './AlternativeCard'
import { FarmOverview } from './FarmOverview'
import { DataStatusCard } from './DataStatusCard'
import { ApprovedState } from './ApprovedState'
import { FeedbackModal } from './FeedbackModal'
import { BriefSkeleton } from '@/components/ui/loading'
import { LowConfidenceWarning } from '@/components/ui/error'
import { todaysPlan, getFormattedDate } from '@/data/mock/plan'
import { getPaddockById } from '@/data/mock/paddocks'
import type { PlanStatus } from '@/lib/types'

// Simulated loading state for demo
const SIMULATE_LOADING = true
const LOADING_DURATION = 1500

// Low confidence threshold for showing warning
const LOW_CONFIDENCE_THRESHOLD = 70

export function MorningBrief() {
  const [isLoading, setIsLoading] = useState(SIMULATE_LOADING)
  const [planStatus, setPlanStatus] = useState<PlanStatus>(todaysPlan.status)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [approvedAt, setApprovedAt] = useState<string | null>(null)
  const [showLowConfidenceWarning, setShowLowConfidenceWarning] = useState(false)

  const recommendedPaddock = getPaddockById(todaysPlan.recommendedPaddockId)

  // Simulate loading on mount
  useEffect(() => {
    if (SIMULATE_LOADING) {
      const timer = setTimeout(() => {
        setIsLoading(false)
        // Show low confidence warning if applicable
        if (todaysPlan.confidence < LOW_CONFIDENCE_THRESHOLD) {
          setShowLowConfidenceWarning(true)
        }
      }, LOADING_DURATION)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleApprove = () => {
    setPlanStatus('approved')
    setApprovedAt(new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }))
  }

  const handleModify = () => {
    setFeedbackOpen(true)
  }

  const handleFeedbackSubmit = (_alternativePaddockId: string) => {
    setPlanStatus('modified')
    setFeedbackOpen(false)
    setApprovedAt(new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }))
  }

  const handleProceedWithLowConfidence = () => {
    setShowLowConfidenceWarning(false)
  }

  // Show loading skeleton
  if (isLoading) {
    return <BriefSkeleton />
  }

  // Show approved state
  if (planStatus === 'approved' || planStatus === 'modified') {
    return (
      <ApprovedState 
        paddock={recommendedPaddock!}
        currentPaddockId={todaysPlan.currentPaddockId}
        approvedAt={approvedAt!}
        confidence={todaysPlan.confidence}
        wasModified={planStatus === 'modified'}
        section={todaysPlan.recommendedSection}
        daysInCurrentPaddock={todaysPlan.daysInCurrentPaddock}
        totalDaysPlanned={todaysPlan.totalDaysPlanned}
        isPaddockTransition={todaysPlan.isPaddockTransition}
        previousSections={todaysPlan.previousSections}
      />
    )
  }

  return (
    <div className="p-4 xl:p-6 2xl:p-8">
      {/* Header */}
      <div className="mb-4 xl:mb-6">
        <h1 className="text-lg xl:text-xl font-semibold">Morning Brief</h1>
        <p className="text-xs xl:text-sm text-muted-foreground">{getFormattedDate()}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:gap-6 lg:grid-cols-3">
        {/* Main content - 2 columns */}
        <div className="lg:col-span-2 space-y-4 xl:space-y-6">
          {/* Low confidence warning */}
          {showLowConfidenceWarning && (
            <LowConfidenceWarning
              cloudCover={65}
              cloudCoverThreshold={50}
              lastClearImage="5 days ago"
              confidence={todaysPlan.confidence}
              onProceed={handleProceedWithLowConfidence}
              onWait={() => setShowLowConfidenceWarning(false)}
            />
          )}

          {/* Narrative */}
          <div className="rounded-md border border-border bg-card p-3 xl:p-4">
            <p className="text-sm xl:text-base leading-relaxed">
              {todaysPlan.briefNarrative}
            </p>
          </div>

          {/* Recommendation */}
          {recommendedPaddock && (
            <BriefCard
              currentPaddockId={todaysPlan.currentPaddockId}
              paddock={recommendedPaddock}
              confidence={todaysPlan.confidence}
              reasoning={todaysPlan.reasoning}
              onApprove={handleApprove}
              onModify={handleModify}
              section={todaysPlan.recommendedSection}
              daysInCurrentPaddock={todaysPlan.daysInCurrentPaddock}
              totalDaysPlanned={todaysPlan.totalDaysPlanned}
              isPaddockTransition={todaysPlan.isPaddockTransition}
              previousSections={todaysPlan.previousSections}
              sectionAlternatives={todaysPlan.sectionAlternatives}
            />
          )}

          {/* Paddock Alternatives - only shown for paddock transitions */}
          {todaysPlan.isPaddockTransition && todaysPlan.paddockAlternatives.length > 0 && (
            <div>
              <h2 className="mb-2 xl:mb-3 text-xs xl:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Alternative Paddocks
              </h2>
              <div className="grid grid-cols-1 gap-2 xl:gap-3 sm:grid-cols-3">
                {todaysPlan.paddockAlternatives.map((alt) => {
                  const paddock = getPaddockById(alt.paddockId)
                  if (!paddock) return null
                  return (
                    <AlternativeCard
                      key={alt.paddockId}
                      paddock={paddock}
                      confidence={alt.confidence}
                      currentPaddockId={todaysPlan.currentPaddockId}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-4 xl:space-y-6">
          <FarmOverview />
          <DataStatusCard />
        </div>
      </div>

      <FeedbackModal
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        alternatives={todaysPlan.paddockAlternatives}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  )
}
