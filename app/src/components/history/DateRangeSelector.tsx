import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type DateRange = 'week' | 'month' | 'quarter' | 'all'

interface DateRangeSelectorProps {
  value: DateRange
  onValueChange: (value: DateRange) => void
}

const ranges: { value: DateRange; label: string }[] = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'Last 3 Months' },
  { value: 'all', label: 'All Time' },
]

export function DateRangeSelector({ value, onValueChange }: DateRangeSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        {ranges.map((range) => (
          <SelectItem key={range.value} value={range.value}>
            {range.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function getDateRangeBounds(range: DateRange): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()
  
  switch (range) {
    case 'week':
      start.setDate(end.getDate() - 7)
      break
    case 'month':
      start.setMonth(end.getMonth() - 1)
      break
    case 'quarter':
      start.setMonth(end.getMonth() - 3)
      break
    case 'all':
      start.setFullYear(2020)
      break
  }
  
  return { start, end }
}
