import { Badge, Card, CardContent } from '@pkg/ui'

type IHealthResponse = {
  status: string
  api: string
  db: string
  timestamp: string
}

const getHealth = async (): Promise<IHealthResponse | null> => {
  try {
    const res = await fetch('http://localhost:3002/api/health', {
      cache: 'no-store',
    })
    return res.json() as Promise<IHealthResponse>
  } catch {
    return null
  }
}

const StatusBadge = ({ value }: { value: string | undefined }) => {
  const isOk = value === 'healthy' || value === 'ok'
  return (
    <Badge variant={isOk ? 'secondary' : 'destructive'}>
      {isOk ? 'Operational' : 'Degraded'}
    </Badge>
  )
}

const StatusPage = async () => {
  const health = await getHealth()

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-heading-2xl text-foreground mb-2">System Status</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        {health
          ? `Last checked: ${new Date(health.timestamp).toLocaleString()}`
          : 'Could not reach backend'}
      </p>

      <Card>
        <CardContent className="divide-border divide-y p-0">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-foreground text-sm font-medium">API</span>
            <StatusBadge value={health?.api} />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-foreground text-sm font-medium">
              Database
            </span>
            <StatusBadge value={health?.db} />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-foreground text-sm font-medium">
              Overall status
            </span>
            <StatusBadge value={health?.status === 'ok' ? 'ok' : undefined} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StatusPage
