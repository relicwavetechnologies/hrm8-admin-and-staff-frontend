import { UseFormReturn } from "react-hook-form";
import { JobFormData } from "@/shared/types/job";
import { Link } from "react-router-dom";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { FileText, Building2, MapPin, Briefcase as BriefcaseIcon, Plus } from "lucide-react";
import { ComboboxWithAdd } from "@/shared/components/ui/combobox-with-add";
import { formatSalaryRange } from "@/shared/lib/jobUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";
import { AddDepartmentDialog } from "@/shared/components/jobs/AddDepartmentDialog";
import { AddLocationDialog } from "@/shared/components/jobs/AddLocationDialog";
import { PositionDescriptionUpload } from "./PositionDescriptionUpload";
import { useToast } from "@/shared/hooks/use-toast";
import { ServiceTypeSelector } from "./ServiceTypeSelector";
import { Separator } from "@/shared/components/ui/separator";
import { useCompanyProfile } from "@/shared/hooks/useCompanyProfile";
import { CompanyProfileLocation } from "@/shared/types/companyProfile";

import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Info } from "lucide-react";

import { usePublicCategories } from "@/shared/hooks/useJobCategoriesTags";
interface JobWizardStep1Props {
  form: UseFormReturn<JobFormData>;
  companyAssignmentMode?: 'AUTO_RULES_ONLY' | 'MANUAL_ONLY';
  loadingCompanySettings?: boolean;
}
export function JobWizardStep1({
  form,
  companyAssignmentMode,
  loadingCompanySettings
}: JobWizardStep1Props) {
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const {
    toast
  } = useToast();
  const { user } = useAuth();
  const { data: profileData, refresh: refreshProfile } = useCompanyProfile();

  // Get company name from user
  const companyName = user?.companyName || "Your Company";

  // Use default department options
  const defaultDepartments = ["Engineering", "Product", "Design", "Marketing", "Sales", "Finance", "Operations", "HR", "Customer Success", "Legal"];
  const departmentOptions = defaultDepartments;

  // Extract and format company profile locations
  const locationOptions = useMemo(() => {
    // Helper function to format location name
    const formatLocationName = (location: CompanyProfileLocation): string => {
      const parts = [location.name];
      if (location.city) parts.push(location.city);
      if (location.country) parts.push(location.country);
      return parts.join(", ");
    };

    const locations: string[] = [];

    if (profileData?.profile?.profileData) {
      const { primaryLocation, additionalLocations = [] } = profileData.profile.profileData;

      // Add primary location if exists
      if (primaryLocation) {
        const formatted = formatLocationName(primaryLocation);
        locations.push(formatted);
      }

      // Add additional locations
      additionalLocations.forEach((loc: CompanyProfileLocation) => {
        const formatted = formatLocationName(loc);
        locations.push(formatted);
      });
    }

    // If no locations from profile, add "Remote" as default
    if (locations.length === 0) {
      locations.push("Remote");
    }

    return locations;
  }, [profileData]);
  const handleAddDepartment = (departmentData: { name: string }) => {
    const newDepartmentName = departmentData.name;
    form.setValue("department", newDepartmentName);
    toast({
      title: "Department added",
      description: `${newDepartmentName} has been added successfully.`
    });
  };

  const handleAddLocation = async (locationData: { name: string; city?: string; country?: string }) => {
    const parts = [locationData.name];
    if (locationData.city) parts.push(locationData.city);
    if (locationData.country) parts.push(locationData.country);
    const formattedLocationName = parts.join(", ");
    form.setValue("location", formattedLocationName);
    toast({
      title: "Location added",
      description: `${formattedLocationName} has been added successfully.`
    });
    // Refresh profile data to include the new location
    await refreshProfile();
  };
  return <div className="space-y-6">
    {/* Service Type Selection Section */}
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Choose Your Recruitment Service</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Select the level of support you need from HRM8
        </p>
      </div>

      <FormField
        control={form.control}
        name="serviceType"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ServiceTypeSelector
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    <Separator className="my-8" />

    {/* Basic Details Section */}
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BriefcaseIcon className="h-5 w-5" />
          Basic Details
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start by providing the essential information about this job
        </p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link to="/jobs/templates">
          <FileText className="h-4 w-4 mr-2" />
          View Templates
        </Link>
      </Button>
    </div>

    {/* Company Display - Read Only */}
    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
      <Building2 className="h-5 w-5 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-sm font-medium">Posting Job For</p>
        <p className="text-lg font-semibold">{companyName}</p>
      </div>
    </div>

    <div className="flex gap-4 items-start">
      {/* Job Title - Takes most of the space */}
      <FormField control={form.control} name="title" render={({
        field
      }) => <FormItem className="flex-1">
          <FormLabel>Job Title *</FormLabel>
          <FormControl>
            <Input placeholder="e.g. Senior Full Stack Developer" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>} />

      {/* Number of Vacancies - Compact width */}
      <FormField control={form.control} name="numberOfVacancies" render={({
        field
      }) => <FormItem className="w-28">
          <FormLabel>Vacancies *</FormLabel>
          <FormControl>
            <Input
              type="number"
              min="1"
              max="999"
              placeholder="1"
              {...field}
              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
              className="text-center"
            />
          </FormControl>
          <FormMessage />
        </FormItem>} />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField control={form.control} name="department" render={({
        field
      }) => <FormItem>
          <FormLabel>Department *</FormLabel>
          <div className="flex gap-2">
            <FormControl className="flex-1">
              <ComboboxWithAdd value={field.value} onValueChange={field.onChange} options={departmentOptions} placeholder="Select department" emptyText="No departments found." />
            </FormControl>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setDepartmentDialogOpen(true)}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <FormDescription className="text-xs">
            Select or add a department for this job
          </FormDescription>
          <FormMessage />
        </FormItem>} />

      <FormField control={form.control} name="location" render={({
        field
      }) => <FormItem>
          <FormLabel>Location *</FormLabel>
          <div className="flex gap-2">
            <FormControl className="flex-1">
              <ComboboxWithAdd value={field.value} onValueChange={field.onChange} options={locationOptions} placeholder="Select location" emptyText="No locations found." />
            </FormControl>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setLocationDialogOpen(true)}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <FormDescription className="text-xs">
            Select or add a location for this job
          </FormDescription>
          <FormMessage />
        </FormItem>} />
    </div>

    {/* Job Category */}
    <FormField
      control={form.control}
      name="category_id"
      render={({ field }) => {
        const { data: categories, isLoading } = usePublicCategories();

        return (
          <FormItem>
            <FormLabel>Job Category</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="_loading" disabled>
                    Loading categories...
                  </SelectItem>
                ) : !categories || categories.length === 0 ? (
                  <SelectItem value="_empty" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        {cat.icon && <span>{cat.icon}</span>}
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormDescription className="text-xs">
              Categorize this job to help candidates find it more easily
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />

    {/* Employment Details Row - 3 columns */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField control={form.control} name="employmentType" render={({
        field
      }) => <FormItem>
          <FormLabel>Employment Type *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>} />

      <FormField control={form.control} name="experienceLevel" render={({
        field
      }) => <FormItem>
          <FormLabel>Experience Level *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="entry">Entry Level</SelectItem>
              <SelectItem value="mid">Mid Level</SelectItem>
              <SelectItem value="senior">Senior Level</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>} />

      <FormItem>
        <FormLabel>Work Arrangement *</FormLabel>
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="workArrangement"
            render={({ field }) => {
              const isRemote = field.value === "remote";
              const isHybrid = field.value === "hybrid";

              const handleRemoteToggle = (checked: boolean) => {
                if (checked) {
                  field.onChange("remote");
                } else {
                  field.onChange("on-site");
                }
              };

              const handleHybridToggle = (checked: boolean) => {
                if (checked) {
                  field.onChange("hybrid");
                } else {
                  field.onChange("on-site");
                }
              };

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <FormLabel className="text-sm font-medium cursor-pointer" htmlFor="remote-toggle">
                          Remote
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Work from anywhere
                        </FormDescription>
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        id="remote-toggle"
                        checked={isRemote}
                        onCheckedChange={handleRemoteToggle}
                      />
                    </FormControl>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <FormLabel className="text-sm font-medium cursor-pointer" htmlFor="hybrid-toggle">
                          Hybrid
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Mix of remote and on-site
                        </FormDescription>
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        id="hybrid-toggle"
                        checked={isHybrid}
                        onCheckedChange={handleHybridToggle}
                      />
                    </FormControl>
                  </div>

                  {!isRemote && !isHybrid && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">On-site (default)</span>
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>
        <FormDescription className="text-xs">
          Select the work arrangement for this role. Both options off means on-site.
        </FormDescription>
        <FormMessage />
      </FormItem>
    </div>

    {/* Salary Information Section */}
    <div className="pt-6 border-t">
      <h3 className="text-lg font-semibold mb-4">Salary Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 items-start mb-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Salary Visibility on Job Board</h4>
          <p className="text-sm text-muted-foreground">
            Control whether salary information is displayed publicly on job boards.
            Salary range is always used for filtering and internal tracking.
          </p>
        </div>

        <FormField control={form.control} name="hideSalary" render={({
          field
        }) => <FormItem className="flex flex-col justify-end">
            <FormLabel className="mb-2">Hide on Job Post</FormLabel>
            <div className="flex items-center space-x-2">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-0 leading-none">
                <FormLabel className="text-sm font-normal">
                  {field.value ? "Hidden" : "Visible"}
                </FormLabel>
              </div>
            </div>
            <FormDescription className="text-xs">
              {field.value ? "Salary hidden from public view" : "Salary shown on job board"}
            </FormDescription>
          </FormItem>} />
      </div>

      <div className="space-y-4">
        {/* Salary Range & Currency Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField control={form.control} name="salaryCurrency" render={({
            field
          }) => <FormItem>
              <FormLabel>Currency *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="AUD">AUD (A$)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                  <SelectItem value="NZD">NZD (NZ$)</SelectItem>
                  <SelectItem value="SGD">SGD (S$)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>} />

          <FormField control={form.control} name="salaryPeriod" render={({
            field
          }) => <FormItem>
              <FormLabel>Period *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Pay frequency
              </FormDescription>
              <FormMessage />
            </FormItem>} />

          <FormField control={form.control} name="salaryMin" render={({
            field
          }) => <FormItem>
              <FormLabel>Minimum Salary *</FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g. 80,000" {...field} onChange={e => {
                  const numericValue = e.target.value.replace(/,/g, '');
                  if (numericValue === '' || /^\d+$/.test(numericValue)) {
                    field.onChange(numericValue ? Number(numericValue) : undefined);
                  }
                }} value={field.value ? field.value.toLocaleString('en-US') : ''} />
              </FormControl>
              <FormMessage />
            </FormItem>} />

          <FormField control={form.control} name="salaryMax" render={({
            field
          }) => <FormItem>
              <FormLabel>Maximum Salary *</FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g. 120,000" {...field} onChange={e => {
                  const numericValue = e.target.value.replace(/,/g, '');
                  if (numericValue === '' || /^\d+$/.test(numericValue)) {
                    field.onChange(numericValue ? Number(numericValue) : undefined);
                  }
                }} value={field.value ? field.value.toLocaleString('en-US') : ''} />
              </FormControl>
              <FormMessage />
            </FormItem>} />
        </div>

        {/* Salary Description Field */}
        <FormField control={form.control} name="salaryDescription" render={({
          field
        }) => <FormItem>
            <FormLabel>Salary Description (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Competitive package with bonuses, equity options, and benefits" maxLength={100} {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>
              Add promotional text about compensation (max 100 characters).
              This will be displayed prominently on the job posting.
              {field.value && <span className="ml-2 font-medium">
                {field.value.length}/100
              </span>}
            </FormDescription>
            <FormMessage />
          </FormItem>} />

        {/* Preview of formatted salary */}
        {(form.watch("salaryMin") || form.watch("salaryMax")) && <div className="p-4 bg-secondary/50 rounded-lg border">
          <p className="text-sm font-medium mb-1">Salary Display Preview:</p>
          <p className="text-lg font-semibold">
            {formatSalaryRange(form.watch("salaryMin"), form.watch("salaryMax"), form.watch("salaryCurrency"), form.watch("salaryPeriod"))}
          </p>
          {form.watch("salaryDescription") && <p className="text-sm text-muted-foreground mt-2 italic">
            "{form.watch("salaryDescription")}"
          </p>}
        </div>}
      </div>
    </div>

    <PositionDescriptionUpload
      form={form}
      onFileProcessed={(text) => {
        form.setValue("positionDescriptionText", text);
      }}
    />

    {/* Add Department Dialog */}
    <AddDepartmentDialog open={departmentDialogOpen} onOpenChange={setDepartmentDialogOpen} onAdd={handleAddDepartment} employerName={companyName} />

    {/* Add Location Dialog */}
    <AddLocationDialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen} onAdd={handleAddLocation} employerName={companyName} />


    {/* Job Assignment Settings */}
    {!loadingCompanySettings && companyAssignmentMode && (
      <div className="space-y-2">
        <Separator />
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="space-y-2">
              <p>
                <span className="font-medium">Company Assignment Mode:</span>{' '}
                {companyAssignmentMode === 'AUTO_RULES_ONLY'
                  ? 'Auto Assignment by Rules'
                  : 'Manual Assignment Only'}
              </p>
              <FormField
                control={form.control}
                name="assignmentMode"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value === 'AUTO'}
                          onCheckedChange={(checked) => {
                            field.onChange(checked ? 'AUTO' : 'MANUAL');
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Auto-assign consultant for this job
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          {companyAssignmentMode === 'AUTO_RULES_ONLY'
                            ? 'This job will be automatically assigned to a consultant based on region, expertise, and availability. Payment for consultant services will be included when you publish the job.'
                            : 'Note: Your company is set to manual assignment, but you can enable auto-assignment for this specific job. Payment for consultant services will be included when you publish the job.'}
                        </p>
                      </div>
                    </FormItem>
                  );
                }}
              />
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )}
  </div>;
}