import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { salesService } from '@/shared/services/salesService';
import { useToast } from '@/shared/hooks/use-toast';

export default function SalesOpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [opportunity, setOpportunity] = useState<any>(null);

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Note: We might need to implement a dedicated getOpportunity endpoint in salesService
        // For now, we'll try to fetch all and find it, or use existing getOpportunity if available.
        // If getting all is inefficient, we should add a specific endpoint.
        const response = await salesService.getOpportunities(); 
        if (response.success && response.data?.opportunities) {
            const found = response.data.opportunities.find((o: any) => o.id === id);
            if (found) {
                setOpportunity(found);
            } else {
                toast({ title: "Not Found", description: "Opportunity not found", variant: "destructive" });
            }
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load opportunity", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold">Opportunity not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{opportunity.name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Stage</span>
              <p className="text-lg capitalize">{opportunity.stage}</p>
            </div>
            <div>
                <span className="text-sm font-medium text-muted-foreground">Amount</span>
                <p className="text-lg">${opportunity.estimatedValue?.toLocaleString() || '0'}</p>
            </div>
            <div>
                <span className="text-sm font-medium text-muted-foreground">Probability</span>
                <p className="text-lg">{opportunity.probability}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
