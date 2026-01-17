import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HistoryEventCard } from './HistoryEventCard'
import { HistoryFeedbackModal } from './HistoryFeedbackModal'
import type { HistoryEntry } from '@/lib/types'

interface HistoryTimelineProps {
  entries: HistoryEntry[]
  title?: string
}

export function HistoryTimeline({ entries, title = 'Timeline' }: HistoryTimelineProps) {
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleEntryClick = (entry: HistoryEntry) => {
    setSelectedEntry(entry)
    setModalOpen(true)
  }

  const handleFeedbackSubmit = (
    entryId: string, 
    feedback: { rating: 'positive' | 'negative' | null; category: string | null; comment: string }
  ) => {
    // For demo purposes, log the feedback
    // In production, this would send to the backend
    console.log('Feedback submitted for entry:', entryId, feedback)
    
    // Could also update local state to show feedback was submitted
    // For now, just close the modal (handled by the modal component)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No history entries for the selected period
            </p>
          ) : (
            <div className="space-y-0">
              {entries.map((entry, index) => (
                <HistoryEventCard 
                  key={entry.id} 
                  entry={entry}
                  isLast={index === entries.length - 1}
                  onClick={handleEntryClick}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <HistoryFeedbackModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        entry={selectedEntry}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  )
}
