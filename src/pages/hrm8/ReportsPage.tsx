import { Card, CardContent } from '@/shared/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Deep dive into platform performance and regional trends</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground max-w-sm">
              We're building powerful reporting tools to help you analyze regional performance, consultant productivity, and revenue trends.
            </p>
          </CardContent>
        </Card>
      </div>
    
  );
}

