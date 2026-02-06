import { useEffect, useMemo, useState } from "react";
import { Hrm8PageLayout } from "@/shared/components/layouts/Hrm8PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { DataTable } from "@/shared/components/tables/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { downloadInvoice, getDunningCandidates, getInvoices, Invoice, DunningCandidate } from "@/shared/services/hrm8/financeService";

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dunning, setDunning] = useState<DunningCandidate[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [loadingDunning, setLoadingDunning] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  useEffect(() => {
    loadDunning();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const filters = statusFilter === "all" ? {} : { status: statusFilter };
      const data = await getInvoices(filters);
      setInvoices(data);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoadingInvoices(false);
    }
  };

  const loadDunning = async () => {
    try {
      setLoadingDunning(true);
      const data = await getDunningCandidates();
      setDunning(data);
    } catch {
      toast.error("Failed to load dunning candidates");
    } finally {
      setLoadingDunning(false);
    }
  };

  const handleDownload = async (invoiceId: string, billNumber?: string) => {
    try {
      const blob = await downloadInvoice(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${billNumber || invoiceId}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error?.message || "Failed to download invoice");
    }
  };

  const invoiceColumns = useMemo(
    () => [
      { key: "bill_number", label: "Invoice #", sortable: true },
      {
        key: "company",
        label: "Company",
        render: (item: Invoice) => <span className="font-medium">{item.company?.name || "—"}</span>,
      },
      {
        key: "amount",
        label: "Total",
        render: (item: Invoice) => (
          <span className="font-semibold">
            {item.currency} {item.total_amount.toLocaleString()}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (item: Invoice) => (
          <Badge variant={item.status === "PAID" ? "default" : "secondary"}>{item.status}</Badge>
        ),
      },
      {
        key: "due_date",
        label: "Due",
        render: (item: Invoice) => new Date(item.due_date).toLocaleDateString(),
      },
      {
        key: "actions",
        label: "Actions",
        render: (item: Invoice) => (
          <Button size="sm" variant="outline" onClick={() => handleDownload(item.id, item.bill_number)}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        ),
      },
    ],
    []
  );

  const dunningBuckets = useMemo(() => {
    const now = new Date().getTime();
    const buckets = {
      dueSoon: 0,
      overdue1to7: 0,
      overdue8to30: 0,
      overdue31plus: 0,
    };
    dunning.forEach((c) => {
      const due = new Date(c.due_date).getTime();
      const diffDays = Math.floor((now - due) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) buckets.dueSoon += 1;
      else if (diffDays <= 7) buckets.overdue1to7 += 1;
      else if (diffDays <= 30) buckets.overdue8to30 += 1;
      else buckets.overdue31plus += 1;
    });
    return buckets;
  }, [dunning]);

  const dunningColumns = useMemo(
    () => [
      {
        key: "company",
        label: "Company",
        render: (item: DunningCandidate) => <span className="font-medium">{item.company?.name || "—"}</span>,
      },
      {
        key: "amount",
        label: "Amount",
        render: (item: DunningCandidate) => <span>{item.amount.toLocaleString()}</span>,
      },
      {
        key: "due_date",
        label: "Due Date",
        render: (item: DunningCandidate) => new Date(item.due_date).toLocaleDateString(),
      },
      {
        key: "status",
        label: "Status",
        render: (item: DunningCandidate) => (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {item.status}
          </Badge>
        ),
      },
      {
        key: "alerts",
        label: "Alert",
        render: () => (
          <div className="flex items-center gap-1 text-yellow-700">
            <AlertTriangle className="h-4 w-4" />
            Overdue
          </div>
        ),
      },
    ],
    []
  );

  return (
    <Hrm8PageLayout
      title="Billing & Invoices"
      subtitle="Monitor invoices, dunning, and collections"
      actions={
        <div className="flex items-center gap-2">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="dunning">Dunning Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingInvoices ? (
                  <div className="text-center py-8">Loading invoices...</div>
                ) : (
                  <DataTable
                    data={invoices as any}
                    columns={invoiceColumns as any}
                    searchable
                    searchKeys={["bill_number", "status"]}
                    emptyMessage="No invoices found"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dunning">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Due Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dunningBuckets.dueSoon}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Overdue 1–7</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dunningBuckets.overdue1to7}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Overdue 8–30</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dunningBuckets.overdue8to30}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Overdue 31+</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dunningBuckets.overdue31plus}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Overdue Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingDunning ? (
                  <div className="text-center py-8">Loading dunning candidates...</div>
                ) : (
                  <DataTable
                    data={dunning as any}
                    columns={dunningColumns as any}
                    searchable
                    searchKeys={["status"]}
                    emptyMessage="No dunning candidates"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Hrm8PageLayout>
  );
}
