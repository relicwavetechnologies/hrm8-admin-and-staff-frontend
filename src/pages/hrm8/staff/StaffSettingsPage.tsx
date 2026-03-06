import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function StaffSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Settings</h1>
        <p className="text-muted-foreground">Configure staff-level defaults, permissions, and workflow behavior.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The dedicated Staff settings surface is now in place. We can incrementally move relevant toggles/configs into this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
