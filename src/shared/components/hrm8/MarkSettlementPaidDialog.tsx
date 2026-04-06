import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import {
  settlementService,
  Settlement,
  type SettlementPayoutSetup,
  type AirwallexBeneficiaryField,
} from "@/shared/services/hrm8/settlementService";
import { useCurrencyFormat } from "@/contexts/CurrencyFormatContext";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";

interface MarkSettlementPaidDialogProps {
  settlement: Settlement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const toRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
};

const getDisplayValue = (paymentDetails: Record<string, unknown>, path: string) => {
  const providerFields = toRecord(paymentDetails.providerFields);

  const aliases: Record<string, string[]> = {
    "beneficiary.company_name": ["companyName", "accountName"],
    "beneficiary.bank_details.account_name": ["accountName"],
    "beneficiary.bank_details.bank_name": ["bankName"],
    "beneficiary.bank_details.account_number": ["accountNumber"],
    "beneficiary.bank_details.account_routing_value1": ["routingNumber", "ifscCode"],
    "beneficiary.bank_details.account_currency": ["currency", "accountCurrency"],
    "beneficiary.bank_details.bank_country_code": ["bankCountryCode", "countryCode"],
    "beneficiary.bank_details.local_clearing_system": ["localClearingSystem"],
    transfer_method: ["transferMethod"],
    "beneficiary.entity_type": ["entityType"],
  };

  for (const alias of aliases[path] || []) {
    const raw = paymentDetails[alias];
    if (typeof raw === "string" && raw.trim().length > 0) return raw;
  }

  const providerRaw = providerFields[path];
  return typeof providerRaw === "string" ? providerRaw : "";
};

const applyFieldValue = (paymentDetails: Record<string, unknown>, path: string, value: string) => {
  const next = {
    ...paymentDetails,
    providerFields: {
      ...toRecord(paymentDetails.providerFields),
      [path]: value,
    },
  } as Record<string, unknown>;

  if (path === "beneficiary.company_name") next.companyName = value;
  if (path === "beneficiary.bank_details.account_name") next.accountName = value;
  if (path === "beneficiary.bank_details.bank_name") next.bankName = value;
  if (path === "beneficiary.bank_details.account_number") next.accountNumber = value;
  if (path === "beneficiary.bank_details.account_routing_value1") {
    next.routingNumber = value;
    next.ifscCode = value;
  }
  if (path === "beneficiary.bank_details.account_currency") {
    next.currency = value;
    next.accountCurrency = value;
  }
  if (path === "beneficiary.bank_details.bank_country_code") {
    next.bankCountryCode = value;
    next.countryCode = value;
  }
  if (path === "beneficiary.bank_details.local_clearing_system") next.localClearingSystem = value;
  if (path === "beneficiary.entity_type") next.entityType = value;
  if (path === "transfer_method") next.transferMethod = value;

  return next;
};

export function MarkSettlementPaidDialog({
  settlement,
  open,
  onOpenChange,
  onSuccess,
}: MarkSettlementPaidDialogProps) {
  const { toast } = useToast();
  const { formatCurrency } = useCurrencyFormat();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setup, setSetup] = useState<SettlementPayoutSetup | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<Record<string, unknown>>({});

  const setupParams = useMemo(() => {
    const record = toRecord(paymentDetails);
    return {
      bankCountryCode:
        typeof record.bankCountryCode === "string" && record.bankCountryCode.length > 0
          ? record.bankCountryCode
          : undefined,
      transferMethod:
        String(record.transferMethod || "").toUpperCase() === "SWIFT" ? "SWIFT" : undefined,
      localClearingSystem:
        typeof record.localClearingSystem === "string" && record.localClearingSystem.length > 0
          ? record.localClearingSystem
          : undefined,
    } as const;
  }, [paymentDetails]);

  useEffect(() => {
    if (!open || !settlement) {
      setSetup(null);
      setPaymentDetails({});
      setError(null);
      return;
    }

    let cancelled = false;
    const loadSetup = async () => {
      setSetupLoading(true);
      setError(null);
      try {
        const response = await settlementService.getPayoutSetup(settlement.id, setupParams);
        if (!response.success || !response.data?.setup) {
          throw new Error(response.error || "Failed to load settlement payout setup.");
        }

        if (cancelled) return;
        const nextSetup = response.data.setup;
        setSetup(nextSetup);
        setPaymentDetails((current) => ({
          ...nextSetup.paymentDetails,
          ...current,
          providerFields: {
            ...toRecord(nextSetup.paymentDetails.providerFields),
            ...toRecord(current.providerFields),
          },
        }));
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load settlement payout setup.");
        }
      } finally {
        if (!cancelled) setSetupLoading(false);
      }
    };

    loadSetup();
    return () => {
      cancelled = true;
    };
  }, [open, settlement?.id, setupParams.bankCountryCode, setupParams.transferMethod, setupParams.localClearingSystem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlement) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await settlementService.executePayout(settlement.id, { paymentDetails });
      if (!response.success || !response.data?.payout) {
        throw new Error(response.error || "Failed to execute settlement payout.");
      }

      const payout = response.data.payout;
      toast({
        title: payout.status === "PAID" ? "USD payout completed" : "USD payout started",
        description:
          payout.status === "PAID"
            ? "The settlement was paid in USD through the payout rail."
            : payout.status === "PROCESSING"
              ? "The settlement payout is processing with Airwallex."
              : "Settlement payout status refreshed.",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      const message = err?.message || "Unexpected error during payout execution.";
      setError(message);
      toast({
        title: "Payout error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!settlement) return null;

  const reportingCurrency = settlement.reporting_currency || "USD";
  const beneficiaryStatus = setup?.beneficiaryStatus || settlement.beneficiary_status || null;
  const visibleFields =
    setup?.requirements.fields.filter((field) => field.enabled && field.inputType !== "HIDDEN") || [];
  const actionLabel =
    settlement.status === "PROCESSING" ? "Refresh Payout Status" : "Execute USD Payout";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{actionLabel}</DialogTitle>
            <DialogDescription>
              Settlement payouts execute in USD only. Source-currency revenue stays visible on the settlement row, but the actual payout rail uses USD.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Payout error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {settlement.status === "FAILED" && settlement.transfer_failed_reason ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Previous payout failed</AlertTitle>
                <AlertDescription>{settlement.transfer_failed_reason}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-3 rounded-lg bg-muted/30 p-4">
              <h4 className="font-semibold">Settlement Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Licensee</span>
                  <span className="font-medium">{settlement.licensee?.name || settlement.licensee_id}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-medium">{formatCurrency(settlement.total_revenue, reportingCurrency)}</span>
                </div>
                <div className="flex justify-between gap-4 border-t pt-2">
                  <span className="text-muted-foreground font-semibold">USD Payout Amount</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(settlement.licensee_share, reportingCurrency)}
                  </span>
                </div>
                {settlement.provider_transfer_id ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Provider Transfer</span>
                    <span className="font-medium">{settlement.provider_transfer_id}</span>
                  </div>
                ) : null}
                {settlement.transfer_initiated_at ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Transfer Started</span>
                    <span className="font-medium">{new Date(settlement.transfer_initiated_at).toLocaleString()}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold">Beneficiary Setup</h4>
                  <p className="text-sm text-muted-foreground">
                    The payout beneficiary is stored on the licensee profile and reused on later settlements.
                  </p>
                </div>
                {beneficiaryStatus ? <Badge variant="outline">{beneficiaryStatus.label}</Badge> : null}
              </div>

              {beneficiaryStatus ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    {beneficiaryStatus.description}
                    {beneficiaryStatus.missingFields.length > 0
                      ? ` Missing: ${beneficiaryStatus.missingFields.join(", ")}`
                      : ""}
                  </AlertDescription>
                </Alert>
              ) : null}

              {setupLoading ? (
                <div className="flex items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading Airwallex beneficiary requirements…
                </div>
              ) : null}

              {!setupLoading && visibleFields.length > 0 ? (
                <div className="space-y-4">
                  {visibleFields.map((field: AirwallexBeneficiaryField) => {
                    const value = getDisplayValue(paymentDetails, field.path) || field.defaultValue || "";
                    const fieldKey = `${field.key}:${field.path}`;

                    if (field.inputType === "SELECT" || field.inputType === "RADIO" || field.inputType === "TRANSFER_METHOD") {
                      return (
                        <div key={fieldKey} className="space-y-2">
                          <Label>{field.label}{field.required ? " *" : ""}</Label>
                          <Select
                            value={String(value)}
                            onValueChange={(nextValue) =>
                              setPaymentDetails((current) => applyFieldValue(current, field.path, nextValue))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {(field.options || []).map((option) => (
                                <SelectItem key={`${fieldKey}:${option.value}`} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {field.description ? (
                            <p className="text-xs text-muted-foreground">{field.description}</p>
                          ) : null}
                        </div>
                      );
                    }

                    return (
                      <div key={fieldKey} className="space-y-2">
                        <Label>{field.label}{field.required ? " *" : ""}</Label>
                        <Input
                          value={String(value)}
                          placeholder={field.placeholder || field.label}
                          onChange={(e) =>
                            setPaymentDetails((current) => applyFieldValue(current, field.path, e.target.value))
                          }
                        />
                        {field.description ? (
                          <p className="text-xs text-muted-foreground">{field.description}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || setupLoading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : settlement.status === "PROCESSING" ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </>
              ) : (
                actionLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
