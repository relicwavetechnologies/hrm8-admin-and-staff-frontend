import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { X, Save } from "lucide-react";
import { FilterCriteria, createSavedFilter } from "@/shared/lib/savedFiltersService";
import { useToast } from "@/shared/hooks/use-toast";

interface AdvancedFilterBuilderProps {
  onApply: (filters: FilterCriteria) => void;
  initialFilters?: FilterCriteria;
}

export function AdvancedFilterBuilder({ onApply, initialFilters }: AdvancedFilterBuilderProps) {
  const [filters, setFilters] = useState<FilterCriteria>(initialFilters || {});
  const { toast } = useToast();

  const handleSaveFilter = () => {
    const name = prompt("Enter a name for this filter:");
    if (!name) return;

    createSavedFilter(name, filters);
    toast({
      title: "Filter saved",
      description: `"${name}" has been saved to your filters.`,
    });
  };

  const addStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: [...(prev.status || []), status],
    }));
  };

  const removeStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: (prev.status || []).filter(s => s !== status),
    }));
  };

  const addDepartmentFilter = (dept: string) => {
    setFilters(prev => ({
      ...prev,
      department: [...(prev.department || []), dept],
    }));
  };

  const removeDepartmentFilter = (dept: string) => {
    setFilters(prev => ({
      ...prev,
      department: (prev.department || []).filter(d => d !== dept),
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex flex-wrap gap-2">
            {["open", "closed", "draft", "on_hold"].map(status => (
              <Badge
                key={status}
                variant={filters.status?.includes(status) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  if (filters.status?.includes(status)) {
                    removeStatusFilter(status);
                  } else {
                    addStatusFilter(status);
                  }
                }}
              >
                {status}
              </Badge>
            ))}
          </div>
        </div>

        {/* Department Filter */}
        <div className="space-y-2">
          <Label>Department</Label>
          <div className="flex gap-2">
            <Select onValueChange={addDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Add department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.department?.map(dept => (
              <Badge key={dept} variant="secondary">
                {dept}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => removeDepartmentFilter(dept)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div className="space-y-2">
          <Label>Salary Range</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                type="number"
                placeholder="Min"
                value={filters.salaryRange?.min || ""}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  salaryRange: { ...prev.salaryRange, min: parseInt(e.target.value) || undefined }
                }))}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                value={filters.salaryRange?.max || ""}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  salaryRange: { ...prev.salaryRange, max: parseInt(e.target.value) || undefined }
                }))}
              />
            </div>
          </div>
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <Label>Experience Level</Label>
          <div className="flex flex-wrap gap-2">
            {["entry", "mid", "senior", "lead"].map(level => (
              <Badge
                key={level}
                variant={filters.experienceLevel?.includes(level) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setFilters(prev => {
                    const current = prev.experienceLevel || [];
                    return {
                      ...prev,
                      experienceLevel: current.includes(level)
                        ? current.filter(l => l !== level)
                        : [...current, level]
                    };
                  });
                }}
              >
                {level}
              </Badge>
            ))}
          </div>
        </div>

        {/* Applicant Count Range */}
        <div className="space-y-2">
          <Label>Number of Applicants</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                type="number"
                placeholder="Min applicants"
                value={filters.applicantRange?.min || ""}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  applicantRange: { ...prev.applicantRange, min: parseInt(e.target.value) || undefined }
                }))}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max applicants"
                value={filters.applicantRange?.max || ""}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  applicantRange: { ...prev.applicantRange, max: parseInt(e.target.value) || undefined }
                }))}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button onClick={() => onApply(filters)} className="flex-1">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleSaveFilter}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFilters({});
              onApply({});
            }}
          >
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
