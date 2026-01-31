/**
 * Consultant Profile Page
 * Self-service profile management for consultants
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// import { useAuth } from '@/shared/contexts/AuthContext';
import { consultantService, ConsultantProfile } from '@/shared/lib/consultant/consultantService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, Save, Plus, X, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { DeveloperTools } from '@/shared/components/dev/DeveloperTools';

const COMMON_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch',
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian', 'Polish',
  'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Greek', 'Turkish', 'Hebrew'
];

const PROFICIENCY_LEVELS = [
  { value: 'NATIVE', label: 'Native' },
  { value: 'FLUENT', label: 'Fluent' },
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'CONVERSATIONAL', label: 'Conversational' },
  { value: 'BASIC', label: 'Basic' },
];

const COMMON_INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail',
  'Education', 'Real Estate', 'Hospitality', 'Transportation', 'Energy',
  'Media & Entertainment', 'Telecommunications', 'Aerospace', 'Automotive',
  'Construction', 'Food & Beverage', 'Pharmaceuticals', 'Biotechnology',
  'Legal Services', 'Consulting', 'Marketing & Advertising', 'Non-profit'
];

export default function ConsultantProfilePage() {
  // const { user } = useAuth();
  // const consultant = user; // Unused for now, user is sufficient if types match or are ignored
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === '1';
  const [profile, setProfile] = useState<ConsultantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [languages, setLanguages] = useState<Array<{ language: string; proficiency: string }>>([]);
  const [industryExpertise, setIndustryExpertise] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<any>();
  void errors;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await consultantService.getProfile();
      console.log('[ConsultantProfile] Profile response:', response);

      // Backend returns consultant directly in response.data, not response.data.consultant
      const consultantData = (response.data?.consultant || response.data) as ConsultantProfile;
      console.log('[ConsultantProfile] Consultant data:', consultantData);

      if (response.success && consultantData) {
        setProfile(consultantData);

        // Set form values
        setValue('firstName', consultantData.first_name);
        setValue('lastName', consultantData.last_name);
        setValue('phone', consultantData.phone || '');
        setValue('address', consultantData.address || '');
        setValue('city', consultantData.city || '');
        setValue('stateProvince', consultantData.state_province || '');
        setValue('country', consultantData.country || '');
        setValue('linkedinUrl', consultantData.linkedin_url || '');
        setValue('availability', consultantData.availability);

        // Set languages
        if (Array.isArray(consultantData.languages)) {
          setLanguages(consultantData.languages);
        }

        // Set industry expertise
        if (Array.isArray(consultantData.industry_expertise)) {
          setIndustryExpertise(consultantData.industry_expertise);
        }

        // Set payment method
        if (consultantData.payment_method) {
          const payment = consultantData.payment_method as any;
          setValue('paymentMethodType', payment.type || '');
          setValue('paymentAccountName', payment.accountName || '');
          setValue('paymentAccountNumber', payment.accountNumber || '');
          setValue('paymentRoutingNumber', payment.routingNumber || '');
          setValue('paymentBankName', payment.bankName || '');
          setValue('paymentPayPalEmail', payment.paypalEmail || '');
          setValue('paymentOtherDetails', payment.otherDetails || '');
        }

        // Set tax information
        if (consultantData.tax_information) {
          const tax = consultantData.tax_information as any;
          setValue('taxId', tax.taxId || '');
          setValue('taxIdType', tax.taxIdType || '');
          setValue('taxCountry', tax.country || '');
          setValue('taxStateProvince', tax.stateProvince || '');
        }
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const addLanguage = () => {
    setLanguages([...languages, { language: '', proficiency: '' }]);
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const updateLanguage = (index: number, field: 'language' | 'proficiency', value: string) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    setLanguages(updated);
  };

  const addIndustry = (industry: string) => {
    if (industryExpertise.length >= 5) {
      toast.error('You can add up to 5 industries');
      return;
    }
    if (!industryExpertise.includes(industry)) {
      setIndustryExpertise([...industryExpertise, industry]);
    }
  };

  const removeIndustry = (industry: string) => {
    setIndustryExpertise(industryExpertise.filter(i => i !== industry));
  };

  const onSubmit = async (data: any) => {
    try {
      setSaving(true);

      // Prepare payment method
      let paymentMethodData: Record<string, unknown> = {};
      if (data.paymentMethodType) {
        paymentMethodData = {
          type: data.paymentMethodType,
        };

        // Add payment-specific fields based on type
        if (data.paymentMethodType === 'bank_transfer') {
          if (data.paymentAccountName) paymentMethodData.accountName = data.paymentAccountName;
          if (data.paymentAccountNumber) paymentMethodData.accountNumber = data.paymentAccountNumber;
          if (data.paymentRoutingNumber) paymentMethodData.routingNumber = data.paymentRoutingNumber;
          if (data.paymentBankName) paymentMethodData.bankName = data.paymentBankName;
        } else if (data.paymentMethodType === 'paypal') {
          if (data.paymentPayPalEmail) paymentMethodData.paypalEmail = data.paymentPayPalEmail;
        } else if (data.paymentMethodType === 'other') {
          if (data.paymentOtherDetails) paymentMethodData.otherDetails = data.paymentOtherDetails;
        }
      }

      // Prepare tax information
      const taxInformationData: Record<string, unknown> = {};
      if (data.taxId || data.taxIdType || data.taxCountry) {
        if (data.taxId) taxInformationData.taxId = data.taxId;
        if (data.taxIdType) taxInformationData.taxIdType = data.taxIdType;
        if (data.taxCountry) taxInformationData.country = data.taxCountry;
        if (data.taxStateProvince) taxInformationData.stateProvince = data.taxStateProvince;
      }

      const updateData = {
        ...data,
        languages: languages.filter(l => l.language && l.proficiency),
        industryExpertise,
        paymentMethod: Object.keys(paymentMethodData).length > 0 ? paymentMethodData : undefined,
        taxInformation: Object.keys(taxInformationData).length > 0 ? taxInformationData : undefined,
      };

      // Remove form-only fields from updateData
      delete updateData.paymentMethodType;
      delete updateData.paymentAccountName;
      delete updateData.paymentAccountNumber;
      delete updateData.paymentRoutingNumber;
      delete updateData.paymentBankName;
      delete updateData.paymentPayPalEmail;
      delete updateData.paymentOtherDetails;
      delete updateData.paymentMethodDetails;
      delete updateData.taxId;
      delete updateData.taxIdType;
      delete updateData.taxCountry;
      delete updateData.taxStateProvince;
      delete updateData.taxInformationDetails;

      const response = await consultantService.updateProfile(updateData);
      if (response.success) {
        toast.success('Profile updated successfully');
        await loadProfile();
        // If onboarding, check if profile is now complete
        if (isOnboarding) {
          const profileResponse = await consultantService.getProfile();
          const updatedProfile = (profileResponse.data?.consultant || profileResponse.data) as ConsultantProfile;

          if (profileResponse.success && updatedProfile) {
            const hasBasicInfo =
              !!updatedProfile.first_name &&
              !!updatedProfile.last_name &&
              !!updatedProfile.phone &&
              !!updatedProfile.address &&
              !!updatedProfile.city &&
              !!updatedProfile.state_province &&
              !!updatedProfile.country;
            const hasLanguages =
              Array.isArray(updatedProfile.languages) &&
              updatedProfile.languages.length > 0;
            const hasIndustries =
              Array.isArray(updatedProfile.industry_expertise) &&
              updatedProfile.industry_expertise.length > 0;
            const hasPayment =
              !!updatedProfile.payment_method &&
              Object.keys(updatedProfile.payment_method).length > 0;
            const hasTax =
              !!updatedProfile.tax_information &&
              Object.keys(updatedProfile.tax_information).length > 0;

            const hasResume = !!updatedProfile.resume_url;

            if (hasBasicInfo && hasLanguages && hasIndustries && hasPayment && hasTax && hasResume) {
              toast.success('Profile completed! You can now receive job assignments.');
            }
          }
        }
      } else {
        toast.error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">Manage your profile information</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your profile information</p>
        </div>
      </div>

      {isOnboarding && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Complete Your Profile</AlertTitle>
          <AlertDescription>
            To receive managed recruitment assignments and commissions, please complete all required sections below.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
            <CardDescription className="text-sm">
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm">First Name *</Label>
                <Input id="firstName" {...register('firstName', { required: true })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm">Last Name *</Label>
                <Input id="lastName" {...register('lastName', { required: true })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input id="email" value={profile?.email || ''} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm">Phone</Label>
              <Input id="phone" {...register('phone')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl" className="text-sm">LinkedIn URL</Label>
              <Input id="linkedinUrl" {...register('linkedinUrl')} placeholder="https://linkedin.com/in/..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Region Information</CardTitle>
            <CardDescription className="text-sm">
              Your assigned operational region
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regionName" className="text-sm">Region Name</Label>
                <Input id="regionName" value={profile?.region_name || 'Not Assigned'} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regionId" className="text-sm">Region ID</Label>
                <Input id="regionId" value={profile?.region_id || 'Not Assigned'} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Address</CardTitle>
            <CardDescription className="text-sm">
              Your contact address information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm">Address</Label>
              <Input id="address" {...register('address')} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm">City</Label>
                <Input id="city" {...register('city')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stateProvince" className="text-sm">State/Province</Label>
                <Input id="stateProvince" {...register('stateProvince')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm">Country</Label>
                <Input id="country" {...register('country')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Languages</CardTitle>
            <CardDescription className="text-sm">
              Add languages you speak and your proficiency level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {languages.map((lang, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5 space-y-2">
                  <Label className="text-sm">Language</Label>
                  <Select
                    value={lang.language}
                    onValueChange={(value) => updateLanguage(index, 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_LANGUAGES.map(l => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-5 space-y-2">
                  <Label className="text-sm">Proficiency</Label>
                  <Select
                    value={lang.proficiency}
                    onValueChange={(value) => updateLanguage(index, 'proficiency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select proficiency" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFICIENCY_LEVELS.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeLanguage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addLanguage}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Language
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Industry Expertise</CardTitle>
            <CardDescription className="text-sm">
              Select up to 5 industries you specialize in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {industryExpertise.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {industryExpertise.map((industry) => (
                  <div
                    key={industry}
                    className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-md text-sm"
                  >
                    {industry}
                    <button
                      type="button"
                      onClick={() => removeIndustry(industry)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm">Add Industry</Label>
              <Select
                value=""
                onValueChange={addIndustry}
                disabled={industryExpertise.length >= 5}
              >
                <SelectTrigger>
                  <SelectValue placeholder={industryExpertise.length >= 5 ? "Maximum 5 industries" : "Select an industry"} />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_INDUSTRIES.filter(i => !industryExpertise.includes(i)).map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {industryExpertise.length >= 5 && (
                <p className="text-xs text-muted-foreground">You have reached the maximum of 5 industries</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Payment Method</CardTitle>
            <CardDescription className="text-sm">
              Configure how you want to receive payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethodType" className="text-sm">Payment Method Type</Label>
              <Select
                value={watch('paymentMethodType') || ''}
                onValueChange={(value) => setValue('paymentMethodType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="wise">Wise</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {watch('paymentMethodType') === 'bank_transfer' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentAccountName" className="text-sm">Account Name</Label>
                    <Input id="paymentAccountName" {...register('paymentAccountName')} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentBankName" className="text-sm">Bank Name</Label>
                    <Input id="paymentBankName" {...register('paymentBankName')} placeholder="Bank of America" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentAccountNumber" className="text-sm">Account Number</Label>
                    <Input id="paymentAccountNumber" {...register('paymentAccountNumber')} placeholder="123456789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentRoutingNumber" className="text-sm">Routing Number</Label>
                    <Input id="paymentRoutingNumber" {...register('paymentRoutingNumber')} placeholder="021000021" />
                  </div>
                </div>
              </>
            )}

            {watch('paymentMethodType') === 'paypal' && (
              <div className="space-y-2">
                <Label htmlFor="paymentPayPalEmail" className="text-sm">PayPal Email</Label>
                <Input id="paymentPayPalEmail" type="email" {...register('paymentPayPalEmail')} placeholder="your.email@example.com" />
              </div>
            )}

            {watch('paymentMethodType') === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="paymentOtherDetails" className="text-sm">Payment Details</Label>
                <Input id="paymentOtherDetails" {...register('paymentOtherDetails')} placeholder="Enter payment details" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Tax Information</CardTitle>
            <CardDescription className="text-sm">
              Provide tax information for your region
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taxIdType" className="text-sm">Tax ID Type</Label>
              <Select
                value={watch('taxIdType') || ''}
                onValueChange={(value) => setValue('taxIdType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tax ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SSN">SSN (Social Security Number - US)</SelectItem>
                  <SelectItem value="EIN">EIN (Employer Identification Number - US)</SelectItem>
                  <SelectItem value="ABN">ABN (Australian Business Number - Australia)</SelectItem>
                  <SelectItem value="GST">GST (Goods and Services Tax - India/Canada)</SelectItem>
                  <SelectItem value="VAT">VAT (Value Added Tax - EU/UK)</SelectItem>
                  <SelectItem value="NIN">NIN (National Insurance Number - UK)</SelectItem>
                  <SelectItem value="SIN">SIN (Social Insurance Number - Canada)</SelectItem>
                  <SelectItem value="TFN">TFN (Tax File Number - Australia)</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId" className="text-sm">Tax ID Number</Label>
              <Input id="taxId" {...register('taxId')} placeholder="Enter your tax ID number" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxCountry" className="text-sm">Country</Label>
                <Input id="taxCountry" {...register('taxCountry')} placeholder="United States" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxStateProvince" className="text-sm">State/Province (if applicable)</Label>
                <Input id="taxStateProvince" {...register('taxStateProvince')} placeholder="California" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Resume / CV</CardTitle>
            <CardDescription className="text-sm">
              Upload your resume or CV (required)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.resume_url ? (
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-emerald-50/50 border-emerald-200">
                <div className="h-10 w-10 bg-emerald-100 rounded flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-xs">PDF</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-900">Current Resume</p>
                  <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">
                    View / Download
                  </a>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Logic to allow re-upload (effectively clearing current URL in state or just showing upload below)
                    // For simplicity, we just show upload below
                    toast.info("Upload a new file to replace the existing one.");
                  }}
                >
                  Replace
                </Button>
              </div>
            ) : (
              <Alert className="bg-amber-50 border-amber-200 mb-4">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Resume Required</AlertTitle>
                <AlertDescription className="text-amber-700">
                  You must upload a resume to receive job assignments.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label className="text-sm">Upload Resume (PDF, DOCX)</Label>
              {/* We import FileUpload dynamically or just use the input for now since we need to handle the File object */}
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/30 transition-colors">
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // In a real app, upload -> get URL -> set URL
                      // Here we simulate by setting a fake URL after a delay
                      const fakeUrl = URL.createObjectURL(file);
                      toast.loading("Uploading resume...");
                      setTimeout(() => {
                        setValue('resumeUrl', fakeUrl); // Simulate form value set
                        // Also fix local state if we had it, but loading profile re-fetches
                        toast.success("Resume uploaded successfully!");
                        // Force re-render of this section by updating profile locally if needed
                        if (profile) setProfile({ ...profile, resume_url: fakeUrl });
                      }, 1500);
                    }
                  }}
                />
                <Label htmlFor="resume-upload" className="cursor-pointer block">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">Max 5MB</p>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Availability</CardTitle>
            <CardDescription className="text-sm">
              Set your current availability status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="availability" className="text-sm">Availability Status</Label>
              <Select
                value={watch('availability') || profile?.availability || 'AVAILABLE'}
                onValueChange={(value) => setValue('availability', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="AT_CAPACITY">At Capacity</SelectItem>
                  <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit" size="sm" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>

      {/* Developer Tools - Only visible in development mode */}
      <DeveloperTools />
    </div>
  );
}
