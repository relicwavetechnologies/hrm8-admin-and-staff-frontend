import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Briefcase, Users, Star, Check, Crown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ServiceTypeSelectorProps {
  value: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo';
  onChange: (value: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search') => void;
}

const services = [
  {
    id: 'self-managed' as const,
    name: 'Self-Managed',
    price: 'FREE',
    description: 'Post and manage yourself',
    features: [
      'Post to job board',
      'Track applications',
      'Full ATS access'
    ],
    icon: Briefcase,
    recommended: false,
  },
  {
    id: 'shortlisting' as const,
    name: 'Shortlisting',
    price: '$1,990',
    description: 'We screen candidates',
    features: [
      'Job board advertising',
      'Applicant screening',
      'Shortlist delivered'
    ],
    icon: Users,
    recommended: false,
  },
  {
    id: 'full-service' as const,
    name: 'Full Service',
    price: '$5,990',
    description: 'Complete recruitment',
    features: [
      'End-to-end support',
      'Interview coordination',
      'Offer negotiation'
    ],
    icon: Star,
    recommended: true,
  },
  {
    id: 'executive-search' as const,
    name: 'Executive Search',
    price: '$9,990+',
    description: 'Leadership roles',
    features: [
      'C-level positions',
      'Confidential search',
      'Executive assessment'
    ],
    icon: Crown,
    recommended: false,
  }
];

export function ServiceTypeSelector({ value, onChange }: ServiceTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {services.map((service) => {
        const Icon = service.icon;
        const isSelected = value === service.id;
        
        return (
          <Card
            key={service.id}
            className={cn(
              "relative cursor-pointer transition-all duration-300 p-4 hover:shadow-md hover:scale-[1.02]",
              isSelected 
                ? "border-2 border-primary bg-primary/5 shadow-md scale-[1.02]" 
                : "border hover:border-primary/50"
            )}
            onClick={() => onChange(service.id)}
          >
            {service.recommended && (
              <Badge 
                className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 animate-fade-in"
              >
                <Star className="h-2.5 w-2.5 mr-1" />
                POPULAR
              </Badge>
            )}

            <div className="space-y-3">
              {/* Icon & Selection Indicator */}
              <div className="flex items-center justify-between">
                <div className={cn(
                  "p-2 rounded-lg transition-all duration-300",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                {isSelected && (
                  <div className="bg-primary rounded-full p-1 animate-scale-in">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Name & Price */}
              <div>
                <h4 className="font-semibold text-sm mb-0.5">{service.name}</h4>
                <div className="text-lg font-bold text-primary">{service.price}</div>
                <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
              </div>

              {/* Features */}
              <div className="space-y-1">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-foreground leading-tight">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
