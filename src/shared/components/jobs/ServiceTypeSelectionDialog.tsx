import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Briefcase, Users, Star, Check, ArrowRight, Crown, Lock, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { canOffloadToConsultants, getPackageDisplayName, getPackageTier } from "@/shared/lib/packageUtils";
import { PackageUpgradeDialog } from "../subscription/PackageUpgradeDialog";

interface ServiceTypeSelectionDialogProps {
  open: boolean;
  companyId?: string;
  onServiceTypeSelect: (serviceType: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search') => void;
  onCancel?: () => void;
}

const services = [
  {
    id: 'self-managed' as const,
    name: 'Self-Managed',
    price: 'FREE',
    priceSubtext: 'No additional cost',
    description: 'Post and manage the job yourself',
    features: [
      'Post to HRM8 job board',
      'Full ATS & candidate tracking',
      'Application management',
      'Interview scheduling'
    ],
    icon: Briefcase,
    recommended: false,
    accent: 'slate'
  },
  {
    id: 'shortlisting' as const,
    name: 'Shortlisting Service',
    price: '$1,990',
    priceSubtext: 'Per hire',
    description: 'We find and screen the best candidates for you',
    features: [
      'Job posting configuration',
      'Job board advertising plan',
      'Applicant screening and evaluation',
      'Prequalified shortlist delivered'
    ],
    icon: Users,
    recommended: false,
    accent: 'blue'
  },
  {
    id: 'full-service' as const,
    name: 'Full Service',
    price: '$5,990',
    priceSubtext: 'Per hire',
    description: 'Complete recruitment from start to finish',
    features: [
      'End-to-end recruitment support',
      'Candidate shortlisting',
      'Interview & assessment coordination',
      'Offer negotiation support'
    ],
    icon: Star,
    recommended: true,
    accent: 'primary'
  },
  {
    id: 'executive-search' as const,
    name: 'Executive Search',
    price: '$9,990 | $14,990',
    priceSubtext: '≤$100k | >$100k salary',
    description: 'Specialized search for leadership roles',
    features: [
      'Senior & C-level positions',
      'Confidential search process',
      'Market mapping & analysis',
      'Executive assessment',
      'Onboarding support'
    ],
    icon: Crown,
    recommended: false,
    accent: 'gold'
  }
];

export function ServiceTypeSelectionDialog({ open, companyId, onServiceTypeSelect, onCancel }: ServiceTypeSelectionDialogProps) {
  const [selectedService, setSelectedService] = useState<'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | null>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  // Check if company can offload to consultants
  const canOffload = useMemo(() => {
    if (!companyId) return false;
    return canOffloadToConsultants(companyId);
  }, [companyId]);

  const packageTier = useMemo(() => {
    if (!companyId) return null;
    return getPackageTier(companyId);
  }, [companyId]);

  // Filter services based on package
  const availableServices = useMemo(() => {
    if (canOffload) {
      // Paid packages can see all services
      return services;
    }
    // Free packages can only use self-managed
    return services.filter(s => s.id === 'self-managed');
  }, [canOffload]);

  const handleContinue = () => {
    if (selectedService) {
      onServiceTypeSelect(selectedService);
    }
  };

  const selectedServiceDetails = availableServices.find(s => s.id === selectedService);

  return (
    <Dialog open={open} onOpenChange={() => { }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="text-center space-y-3 pb-4">
          <DialogTitle className="text-3xl font-bold">Choose Your Recruitment Approach</DialogTitle>
          <DialogDescription className="text-base">
            Your job posting cost has been confirmed. Now decide if you'd like HRM8's recruitment team to assist (optional add-on services)
          </DialogDescription>
        </DialogHeader>

        {!canOffload && companyId && (
          <Alert className="bg-muted/60 border-muted">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">Consultant services are not available for your current package ({getPackageDisplayName(packageTier || 'ats-lite')}).</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upgrade to a paid subscription to access consultant recruitment services.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setUpgradeDialogOpen(true)}
                  size="sm"
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade Package
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3 py-4">
          {availableServices.map((service) => {
            const Icon = service.icon;
            const isSelected = selectedService === service.id;

            return (
              <Card
                key={service.id}
                className={cn(
                  "relative cursor-pointer transition-all duration-200",
                  "border-l-4 px-6 py-5 hover:bg-muted/30 hover:scale-[1.01]",
                  isSelected
                    ? "border-l-primary bg-primary/5 shadow-md"
                    : "border-l-transparent hover:border-l-primary/50"
                )}
                onClick={() => setSelectedService(service.id)}
              >
                {/* Recommended Badge */}
                {service.recommended && (
                  <Badge
                    className="absolute -top-2 right-3 z-10 bg-primary text-primary-foreground"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    MOST POPULAR
                  </Badge>
                )}

                {/* Main Content - Horizontal Layout */}
                <div className="flex flex-col lg:flex-row items-start gap-6">

                  {/* Left: Icon + Name + Description */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={cn(
                      "p-3 rounded-lg flex-shrink-0",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold whitespace-nowrap">{service.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Center: Price */}
                  <div className="text-center lg:min-w-[280px] flex-shrink-0">
                    {service.id === 'executive-search' ? (
                      <div className="flex items-start justify-center gap-6">
                        {/* Left tier */}
                        <div className="flex flex-col items-center">
                          <div className="text-3xl font-bold text-primary">
                            $9,990
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            ≤$100k salary
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="text-2xl font-light text-muted-foreground self-center">
                          |
                        </div>

                        {/* Right tier */}
                        <div className="flex flex-col items-center">
                          <div className="text-3xl font-bold text-primary">
                            $14,990
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {'>'}$100k salary
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-primary">
                          {service.price}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {service.priceSubtext}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right: Features */}
                  <div className="flex-1 lg:max-w-[280px] w-full lg:pl-4">
                    <div className="grid grid-cols-1 gap-1.5">
                      {service.features.slice(0, 4).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-foreground leading-tight">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="flex justify-center gap-3 pt-6 border-t">
          <Button
            onClick={onCancel}
            variant="outline"
            size="lg"
            className="min-w-[150px] text-base h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedService}
            size="lg"
            className="min-w-[320px] text-base h-12"
          >
            {selectedService
              ? `Continue with ${selectedServiceDetails?.name}`
              : 'Select a Service to Continue'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </DialogContent>

      {companyId && (
        <PackageUpgradeDialog
          open={upgradeDialogOpen}
          onOpenChange={setUpgradeDialogOpen}
          companyId={companyId}
          onUpgradeSuccess={() => {
            // Reload the page or refresh company data to reflect the upgrade
            window.location.reload();
          }}
        />
      )}
    </Dialog>
  );
}
