import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function StaffSettlementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Settlements</h1>
        <p className="text-muted-foreground">Payout and settlement data scoped to staff operations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Module Segregation Complete</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This workspace is now separated under Staff. Next step is wiring staff-only settlement data and actions into this section.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
