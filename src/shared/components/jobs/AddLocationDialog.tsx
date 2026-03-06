import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Location } from "@/shared/types/entities";
import { getCountryPhoneCode } from "@/shared/lib/countryPhoneCodes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const locationSchema = z.object({
  name: z.string().min(2, "Location name must be at least 2 characters").max(100),
  addressLine1: z.string().min(5, "Address is required").max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2, "City is required").max(100),
  postalCode: z.string().min(1, "Post code/zip code is required").max(20),
  state: z.string().max(100).optional(),
  country: z.string().min(2, "Country is required").max(100),
  phone: z.string().min(1, "Phone number is required").regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format").max(30),
  isPrimary: z.boolean().default(false),
  capacity: z.number().min(0).optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface AddLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (location: LocationFormData) => void;
  employerName?: string;
  editMode?: boolean;
  initialData?: Location;
}

export function AddLocationDialog({
  open,
  onOpenChange,
  onAdd,
  employerName,
  editMode = false,
  initialData,
}: AddLocationDialogProps) {
  const [countryCode, setCountryCode] = useState<string>('+1');
  
  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      addressLine1: initialData.addressLine1,
      addressLine2: initialData.addressLine2 || "",
      city: initialData.city,
      postalCode: initialData.postalCode || "",
      state: initialData.state || "",
      country: initialData.country,
      phone: initialData.phone || "",
      isPrimary: initialData.isPrimary || false,
    } : {
      name: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      state: "",
      country: "United States",
      phone: "",
      isPrimary: false,
      capacity: undefined,
    },
  });

  useEffect(() => {
    if (editMode && initialData) {
      form.reset({
        name: initialData.name,
        addressLine1: initialData.addressLine1,
        addressLine2: initialData.addressLine2 || "",
        city: initialData.city,
        postalCode: initialData.postalCode || "",
        state: initialData.state || "",
        country: initialData.country,
        phone: initialData.phone || "",
        isPrimary: initialData.isPrimary || false,
      });
    }
  }, [editMode, initialData, form]);

  // Watch for country changes and update country code
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'country' && value.country) {
        const code = getCountryPhoneCode(value.country);
        setCountryCode(code);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Initialize country code on mount or when initial data changes
  useEffect(() => {
    const currentCountry = form.getValues('country');
    if (currentCountry) {
      setCountryCode(getCountryPhoneCode(currentCountry));
    }
  }, [form, initialData]);

  const onSubmit = (data: LocationFormData) => {
    onAdd(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {editMode ? "Edit Location" : "Add New Location"}
          </DialogTitle>
          <DialogDescription>
            {editMode 
              ? `Update the location details for ${employerName || "this employer"}.`
              : employerName 
                ? `Add a new office location to ${employerName}'s profile.`
                : "Add a new office location. This will be available for future jobs."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. San Francisco HQ, New York Office" {...field} />
                  </FormControl>
                  <FormDescription>
                    A friendly name for this location
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPrimary"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Primary Location</FormLabel>
                      <FormDescription className="text-xs">
                        Mark as main headquarters
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1 *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 123 Main Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressLine2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Suite 200, Floor 5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. San Francisco" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Code/Zip Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 94103" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. California" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {/* Americas */}
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Mexico">Mexico</SelectItem>
                      <SelectItem value="Brazil">Brazil</SelectItem>
                      <SelectItem value="Argentina">Argentina</SelectItem>
                      <SelectItem value="Chile">Chile</SelectItem>
                      <SelectItem value="Colombia">Colombia</SelectItem>
                      
                      {/* Europe */}
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Spain">Spain</SelectItem>
                      <SelectItem value="Italy">Italy</SelectItem>
                      <SelectItem value="Netherlands">Netherlands</SelectItem>
                      <SelectItem value="Switzerland">Switzerland</SelectItem>
                      <SelectItem value="Ireland">Ireland</SelectItem>
                      <SelectItem value="Poland">Poland</SelectItem>
                      <SelectItem value="Belgium">Belgium</SelectItem>
                      <SelectItem value="Sweden">Sweden</SelectItem>
                      <SelectItem value="Norway">Norway</SelectItem>
                      <SelectItem value="Denmark">Denmark</SelectItem>
                      <SelectItem value="Austria">Austria</SelectItem>
                      <SelectItem value="Portugal">Portugal</SelectItem>
                      
                      {/* APAC */}
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="New Zealand">New Zealand</SelectItem>
                      <SelectItem value="Japan">Japan</SelectItem>
                      <SelectItem value="Singapore">Singapore</SelectItem>
                      <SelectItem value="China">China</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="Hong Kong">Hong Kong</SelectItem>
                      <SelectItem value="South Korea">South Korea</SelectItem>
                      <SelectItem value="Thailand">Thailand</SelectItem>
                      <SelectItem value="Malaysia">Malaysia</SelectItem>
                      <SelectItem value="Indonesia">Indonesia</SelectItem>
                      <SelectItem value="Philippines">Philippines</SelectItem>
                      <SelectItem value="Vietnam">Vietnam</SelectItem>
                      
                      {/* Middle East & Africa */}
                      <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                      <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                      <SelectItem value="South Africa">South Africa</SelectItem>
                      <SelectItem value="Israel">Israel</SelectItem>
                      <SelectItem value="Egypt">Egypt</SelectItem>
                      <SelectItem value="Turkey">Turkey</SelectItem>
                      <SelectItem value="Qatar">Qatar</SelectItem>
                      <SelectItem value="Kuwait">Kuwait</SelectItem>
                      
                      {/* Other */}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country Code & Phone Number - Side by Side */}
            <div className="grid grid-cols-[100px_1fr] gap-3">
              {/* Country Code - Narrow Column */}
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input 
                    value={countryCode} 
                    readOnly 
                    disabled
                    className="bg-muted text-muted-foreground font-mono text-base cursor-not-allowed text-center"
                  />
                </FormControl>
              </FormItem>

              {/* Phone Number - Flexible Column */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., (415) 555-0123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Helper text below both fields */}
            <p className="text-xs text-muted-foreground -mt-2">
              Country code auto-populated based on selected country. Enter local number.
            </p>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{editMode ? "Update Location" : "Add Location"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
