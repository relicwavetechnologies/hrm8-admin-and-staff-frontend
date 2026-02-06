import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Switch } from "@/shared/components/ui/switch";
import { toast } from "sonner";
import { hrm8ProfileService, type Hrm8Profile, type RegionalLicenseeProfile } from "@/shared/services/hrm8/profileService";
import { hrm8AuthService } from "@/shared/lib/hrm8AuthService";

type UserFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo: string;
};

type LicenseeFormState = {
  name: string;
  legalEntityName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  taxId: string;
  agreementStartDate: string;
  agreementEndDate: string;
  revenueSharePercent: string;
  exclusivity: boolean;
  contractFileUrl: string;
  managerContact: string;
  financeContact: string;
  complianceContact: string;
};

const emptyUserForm: UserFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  photo: "",
};

const emptyLicenseeForm: LicenseeFormState = {
  name: "",
  legalEntityName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  taxId: "",
  agreementStartDate: "",
  agreementEndDate: "",
  revenueSharePercent: "",
  exclusivity: false,
  contractFileUrl: "",
  managerContact: "",
  financeContact: "",
  complianceContact: "",
};

function toDateInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function Hrm8ProfilePage() {
  const [profile, setProfile] = useState<Hrm8Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userForm, setUserForm] = useState<UserFormState>(emptyUserForm);
  const [licenseeForm, setLicenseeForm] = useState<LicenseeFormState>(emptyLicenseeForm);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const isRegionalLicensee = profile?.user.role === "REGIONAL_LICENSEE";

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await hrm8ProfileService.getProfile();
      if (!response.success || !response.data?.profile) {
        throw new Error(response.error || "Failed to load profile");
      }
      const data = response.data.profile;
      setProfile(data);
      setUserForm({
        firstName: data.user.firstName || "",
        lastName: data.user.lastName || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        photo: data.user.photo || "",
      });

      if (data.licensee) {
        const licensee = data.licensee;
        setLicenseeForm({
          name: licensee.name || "",
          legalEntityName: licensee.legalEntityName || "",
          email: licensee.email || "",
          phone: licensee.phone || "",
          address: licensee.address || "",
          city: licensee.city || "",
          state: licensee.state || "",
          country: licensee.country || "",
          taxId: licensee.taxId || "",
          agreementStartDate: toDateInput(licensee.agreementStartDate),
          agreementEndDate: toDateInput(licensee.agreementEndDate),
          revenueSharePercent: Number.isFinite(licensee.revenueSharePercent)
            ? String(licensee.revenueSharePercent)
            : "",
          exclusivity: !!licensee.exclusivity,
          contractFileUrl: licensee.contractFileUrl || "",
          managerContact: licensee.managerContact || "",
          financeContact: licensee.financeContact || "",
          complianceContact: licensee.complianceContact || "",
        });
      } else {
        setLicenseeForm(emptyLicenseeForm);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const payload = {
        user: {
          firstName: userForm.firstName.trim(),
          lastName: userForm.lastName.trim(),
          email: userForm.email.trim(),
          phone: userForm.phone.trim() || null,
          photo: userForm.photo.trim() || null,
        },
        licensee: isRegionalLicensee
          ? {
              name: licenseeForm.name.trim(),
              legalEntityName: licenseeForm.legalEntityName.trim(),
              email: licenseeForm.email.trim(),
              phone: licenseeForm.phone.trim() || null,
              address: licenseeForm.address.trim() || null,
              city: licenseeForm.city.trim() || null,
              state: licenseeForm.state.trim() || null,
              country: licenseeForm.country.trim() || null,
              taxId: licenseeForm.taxId.trim() || null,
              agreementStartDate: licenseeForm.agreementStartDate || null,
              agreementEndDate: licenseeForm.agreementEndDate || null,
              revenueSharePercent: licenseeForm.revenueSharePercent
                ? Number(licenseeForm.revenueSharePercent)
                : undefined,
              exclusivity: licenseeForm.exclusivity,
              contractFileUrl: licenseeForm.contractFileUrl.trim() || null,
              managerContact: licenseeForm.managerContact.trim(),
              financeContact: licenseeForm.financeContact.trim() || null,
              complianceContact: licenseeForm.complianceContact.trim() || null,
            }
          : undefined,
      };

      const response = await hrm8ProfileService.updateProfile(payload);
      if (!response.success || !response.data?.profile) {
        throw new Error(response.error || "Failed to update profile");
      }
      setProfile(response.data.profile);
      toast.success("Profile updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Enter current and new password");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setPasswordSaving(true);
      const response = await hrm8AuthService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to change password");
      }
      toast.success("Password updated");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const accountMeta = useMemo(() => {
    if (!profile) return [];
    return [
      { label: "Role", value: profile.user.role },
      { label: "Status", value: profile.user.status },
      {
        label: "Last Login",
        value: profile.user.lastLoginAt
          ? new Date(profile.user.lastLoginAt).toLocaleString()
          : "Not available",
      },
      {
        label: "Created",
        value: profile.user.createdAt ? new Date(profile.user.createdAt).toLocaleDateString() : "N/A",
      },
    ];
  }, [profile]);

  const licenseeRegions = (profile?.licensee?.regions || []) as RegionalLicenseeProfile["regions"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            {isRegionalLicensee
              ? "Manage your licensee profile, commission rates, and account details"
              : "Manage your administrator profile and security settings"}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-48" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[...Array(4)].map((__, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Basic profile details and contact info</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      value={userForm.firstName}
                      onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      value={userForm.lastName}
                      onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Profile photo URL</Label>
                  <Input
                    id="photo"
                    value={userForm.photo}
                    onChange={(e) => setUserForm({ ...userForm, photo: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {accountMeta.map((item) => (
                    <div key={item.label} className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{item.label}:</span> {item.value}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
                <Button onClick={handlePasswordChange} disabled={passwordSaving}>
                  {passwordSaving ? "Updating..." : "Change Password"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {isRegionalLicensee && profile?.licensee && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Licensee Company</CardTitle>
                  <CardDescription>Company details and commission rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="licenseeName">Business name</Label>
                      <Input
                        id="licenseeName"
                        value={licenseeForm.name}
                        onChange={(e) => setLicenseeForm({ ...licenseeForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="legalEntityName">Legal entity</Label>
                      <Input
                        id="legalEntityName"
                        value={licenseeForm.legalEntityName}
                        onChange={(e) => setLicenseeForm({ ...licenseeForm, legalEntityName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseeEmail">Business email</Label>
                      <Input
                        id="licenseeEmail"
                        type="email"
                        value={licenseeForm.email}
                        onChange={(e) => setLicenseeForm({ ...licenseeForm, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseePhone">Business phone</Label>
                      <Input
                        id="licenseePhone"
                        value={licenseeForm.phone}
                        onChange={(e) => setLicenseeForm({ ...licenseeForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID</Label>
                      <Input
                        id="taxId"
                        value={licenseeForm.taxId}
                        onChange={(e) => setLicenseeForm({ ...licenseeForm, taxId: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="revenueShare">Revenue share (%)</Label>
                      <Input
                        id="revenueShare"
                        type="number"
                        step="0.01"
                        value={licenseeForm.revenueSharePercent}
                        onChange={(e) =>
                          setLicenseeForm({ ...licenseeForm, revenueSharePercent: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="agreementStart">Agreement start</Label>
                      <Input
                        id="agreementStart"
                        type="date"
                        value={licenseeForm.agreementStartDate}
                        onChange={(e) =>
                          setLicenseeForm({ ...licenseeForm, agreementStartDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agreementEnd">Agreement end</Label>
                      <Input
                        id="agreementEnd"
                        type="date"
                        value={licenseeForm.agreementEndDate}
                        onChange={(e) =>
                          setLicenseeForm({ ...licenseeForm, agreementEndDate: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">Exclusive territory</p>
                      <p className="text-xs text-muted-foreground">Marks exclusive rights for this region</p>
                    </div>
                    <Switch
                      checked={licenseeForm.exclusivity}
                      onCheckedChange={(checked) =>
                        setLicenseeForm({ ...licenseeForm, exclusivity: checked })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractFileUrl">Contract file URL</Label>
                    <Input
                      id="contractFileUrl"
                      value={licenseeForm.contractFileUrl}
                      onChange={(e) =>
                        setLicenseeForm({ ...licenseeForm, contractFileUrl: e.target.value })
                      }
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <Badge variant="outline">{profile.licensee?.status}</Badge>
                    <Badge variant="secondary">{profile.user.role.replace(/_/g, " ")}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contacts & Address</CardTitle>
                  <CardDescription>Key contacts and operating address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="managerContact">Manager contact</Label>
                      <Input
                        id="managerContact"
                        value={licenseeForm.managerContact}
                        onChange={(e) =>
                          setLicenseeForm({ ...licenseeForm, managerContact: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="financeContact">Finance contact</Label>
                      <Input
                        id="financeContact"
                        value={licenseeForm.financeContact}
                        onChange={(e) =>
                          setLicenseeForm({ ...licenseeForm, financeContact: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="complianceContact">Compliance contact</Label>
                      <Input
                        id="complianceContact"
                        value={licenseeForm.complianceContact}
                        onChange={(e) =>
                          setLicenseeForm({ ...licenseeForm, complianceContact: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={licenseeForm.address}
                        onChange={(e) => setLicenseeForm({ ...licenseeForm, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={licenseeForm.city}
                        onChange={(e) => setLicenseeForm({ ...licenseeForm, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={licenseeForm.state}
                        onChange={(e) => setLicenseeForm({ ...licenseeForm, state: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={licenseeForm.country}
                        onChange={(e) => setLicenseeForm({ ...licenseeForm, country: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {isRegionalLicensee && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Regions</CardTitle>
                <CardDescription>Regions linked to this licensee account</CardDescription>
              </CardHeader>
              <CardContent>
                {licenseeRegions && licenseeRegions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {licenseeRegions.map((region) => (
                      <Badge key={region.id} variant="outline">
                        {region.name} ({region.code})
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No regions assigned yet.</p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
