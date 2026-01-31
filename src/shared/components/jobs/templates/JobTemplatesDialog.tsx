import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { FileText, Star, Search, TrendingUp } from "lucide-react";
import { 
  getJobTemplates, 
  getMostUsedTemplates, 
  incrementTemplateUsage,
  templateCategories,
  JobTemplate 
} from "@/shared/lib/jobTemplateService";

interface JobTemplatesDialogProps {
  onSelectTemplate: (template: JobTemplate) => void;
}

export function JobTemplatesDialog({ onSelectTemplate }: JobTemplatesDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const allTemplates = getJobTemplates();
  const popularTemplates = getMostUsedTemplates();

  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: JobTemplate) => {
    incrementTemplateUsage(template.id);
    onSelectTemplate(template);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Use Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Job Templates</DialogTitle>
          <DialogDescription>
            Choose from existing templates to quickly create a new job posting
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="popular">
                <TrendingUp className="h-3 w-3 mr-1" />
                Popular
              </TabsTrigger>
              {templateCategories.slice(0, 5).map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-4">
              <TemplateList 
                templates={filteredTemplates} 
                onSelect={handleSelectTemplate}
              />
            </TabsContent>

            <TabsContent value="popular" className="space-y-3 mt-4">
              <TemplateList 
                templates={popularTemplates} 
                onSelect={handleSelectTemplate}
              />
            </TabsContent>

            {templateCategories.map(category => (
              <TabsContent key={category} value={category} className="space-y-3 mt-4">
                <TemplateList 
                  templates={filteredTemplates.filter(t => t.category === category)} 
                  onSelect={handleSelectTemplate}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TemplateList({ 
  templates, 
  onSelect 
}: { 
  templates: JobTemplate[]; 
  onSelect: (template: JobTemplate) => void;
}) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No templates found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {templates.map(template => (
        <div
          key={template.id}
          className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
          onClick={() => onSelect(template)}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold">{template.name}</h4>
            {template.usageCount > 20 && (
              <Badge variant="orange" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Popular
              </Badge>
            )}
          </div>
          {template.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {template.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{template.category}</Badge>
            <span className="text-xs text-muted-foreground">
              Used {template.usageCount} times
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
