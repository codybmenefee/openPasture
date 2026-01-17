import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendIndicator } from '@/components/paddock/TrendIndicator'
import { Link } from '@tanstack/react-router'
import type { PaddockPerformance } from '@/lib/types'

interface PerformanceTableProps {
  data: PaddockPerformance[]
  title?: string
}

export function PerformanceTable({ 
  data,
  title = 'Paddock Performance'
}: PerformanceTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paddock</TableHead>
              <TableHead className="text-right">Uses</TableHead>
              <TableHead className="text-right">Avg Rest</TableHead>
              <TableHead className="text-right">Avg NDVI</TableHead>
              <TableHead className="text-right">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.paddockId}>
                <TableCell>
                  <Link 
                    to="/paddocks/$id" 
                    params={{ id: row.paddockId }}
                    className="font-medium hover:underline"
                  >
                    {row.paddockName}
                  </Link>
                </TableCell>
                <TableCell className="text-right">{row.totalUses}</TableCell>
                <TableCell className="text-right">{row.avgRestDays} days</TableCell>
                <TableCell className="text-right font-mono">{row.avgNdvi.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <TrendIndicator trend={row.trend} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
