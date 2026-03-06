import { Card } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  MessageSquare,
  Flag,
  Target
} from "lucide-react";

interface SectionNavigationProps {
  onNavigate: (sectionId: string) => void;
}

const sections = [
  { id: 'executive-summary', label: 'Executive Summary', icon: FileText },
  { id: 'key-findings', label: 'Key Findings', icon: TrendingUp },
  { id: 'category-analysis', label: 'Category Analysis', icon: Target },
  { id: 'conversation-highlights', label: 'Conversation Highlights', icon: MessageSquare },
  { id: 'red-flags', label: 'Red Flags & Concerns', icon: AlertTriangle },
  { id: 'verification', label: 'Verification Items', icon: CheckCircle2 },
  { id: 'recommendation', label: 'Recommendation', icon: Flag },
];

export function SectionNavigation({ onNavigate }: SectionNavigationProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onNavigate(sectionId);
  };

  return (
    <Card className="h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Quick Navigation</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Jump to sections
        </p>
      </div>
      
      <ScrollArea className="h-[calc(100%-80px)]">
        <div className="p-2 space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => scrollToSection(section.id)}
              >
                <Icon className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">{section.label}</span>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
