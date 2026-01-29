import { useState, useEffect } from "react";
import { AtsPageHeader } from '@/shared/components/layouts/AtsPageHeader';
import { EnhancedStatCard } from '@/shared/components/dashboard/EnhancedStatCard';
import { DataTable, Column } from '@/shared/components/tables/DataTable';
import { Building2, CheckCircle2, DollarSign } from "lucide-react";
import { RegionalAnalyticsService } from '@/shared/lib/hrm8/regionalAnalyticsService';
import { useAuth } from "@/shared/contexts/AuthContext";
import { useToast } from "@/shared/hooks/use-toast";
import { Badge } from "@/shared/components/ui/badge";
import { useSearchParams } from "react-router-dom";

interface Company {
    id: string;
    name: string;
    domain: string;
    createdAt: string;
    attributionStatus: 'OPEN' | 'LOCKED' | 'EXPIRED';
    openJobsCount: number;
    subscription: {
        plan: string;
        startDate: string;
        renewalDate: string;
    } | null;
}

export default function RegionalCompaniesPage() {
    const { toast } = useToast();
    const { user } = useAuth(); // or useHrm8Auth if distinct contexts
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [allCompanies, setAllCompanies] = useState<Company[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);

    // Assuming the user context has the licensee's assigned region(s). 
    // For simplicity, we'll pick the first region or use a context selector if available.
    // In a real multi-region setup, this page would likely need a region selector or be under a /region/:id route.
    // However, based on the URL structure `/hrm8/companies`, it implies a "current context".
    // Let's assume we can get the region from the user's assigned regions.
    // We'll try to get it from query param or user.assignedRegionIds[0]

    // actually, standard HRM8 Admin usually has user.assignedRegionIds
    const regionId = (user as any)?.assignedRegionIds?.[0]; // Default to first region for now

    useEffect(() => {
        if (regionId) {
            fetchCompanies();
        }
    }, [regionId]);

    useEffect(() => {
        filterCompanies();
    }, [allCompanies, searchParams]);

    const fetchCompanies = async () => {
        if (!regionId) return;
        try {
            setIsLoading(true);
            const response = await RegionalAnalyticsService.getRegionalCompanies(regionId);
            if (response && response.companies) {
                setAllCompanies(response.companies);
            } else {
                // Handle empty or error
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load regional companies",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filterCompanies = () => {
        let result = [...allCompanies];
        const statusParam = searchParams.get('status');
        const sortParam = searchParams.get('sort');

        // Filter
        if (statusParam === 'active') {
            result = result.filter(c => c.openJobsCount > 0);
        } else if (statusParam === 'inactive') {
            result = result.filter(c => c.openJobsCount === 0);
        } else if (statusParam === 'new') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            result = result.filter(c => new Date(c.createdAt) >= startOfMonth);
        }

        // Sort
        if (sortParam === 'newest') {
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        setFilteredCompanies(result);
    };

    // Calculate stats from companies data
    const totalCompanies = allCompanies.length;
    const activeSubscriptions = allCompanies.filter(c => c.subscription !== null).length;
    const lockedAttributions = allCompanies.filter(c => c.attributionStatus === 'LOCKED').length;

    // Company Columns
    const companyColumns: Column<Company>[] = [
        {
            key: "name",
            label: "Company Name",
            sortable: true,
            render: (company) => <span className="font-medium">{company.name}</span>,
        },
        {
            key: "domain",
            label: "Domain",
            sortable: true,
            render: (company) => (
                <a
                    href={`https://${company.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                >
                    {company.domain}
                </a>
            ),
        },
        {
            key: "attributionStatus",
            label: "Attribution",
            sortable: true,
            render: (company) => {
                const status = company.attributionStatus;
                const variantMap = {
                    OPEN: 'neutral',
                    LOCKED: 'success',
                    EXPIRED: 'destructive'
                };
                return (
                    <Badge variant={variantMap[status] as any}>
                        {status}
                    </Badge>
                );
            },
        },
        {
            key: "subscription",
            label: "Subscription",
            render: (company) => {
                const sub = company.subscription;
                if (!sub) {
                    return <Badge variant="outline">No Subscription</Badge>;
                }
                return <Badge variant="success">{sub.plan}</Badge>;
            },
        },
        {
            key: "createdAt",
            label: "Created Date",
            sortable: true,
            render: (company) => new Date(company.createdAt).toLocaleDateString(),
        },
        {
            key: "openJobsCount",
            label: "Open Jobs",
            sortable: true,
            render: (company) => (
                <Badge variant={company.openJobsCount > 0 ? "secondary" : "outline"}>
                    {company.openJobsCount} Jobs
                </Badge>
            ),
        },
    ];

    if (!regionId) {
        return <div className="p-6">No region assigned to this user.</div>;
    }

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <AtsPageHeader title="Region Companies" subtitle="Companies in your region" />
                <div className="text-center py-8">Loading companies...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <AtsPageHeader
                title="Region Companies"
                subtitle="Manage and track companies in your region"
            />

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <EnhancedStatCard
                    title="Total Companies"
                    value={totalCompanies.toString()}
                    change={`${lockedAttributions} locked`}
                    trend="up"
                    icon={<Building2 className="h-5 w-5" />}
                    variant="neutral"
                    showMenu={false}
                />

                <EnhancedStatCard
                    title="Active Subscriptions"
                    value={activeSubscriptions.toString()}
                    change={`${totalCompanies - activeSubscriptions} inactive`}
                    trend={activeSubscriptions > 0 ? "up" : undefined}
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    variant="success"
                    showMenu={false}
                />

                <EnhancedStatCard
                    title="Attributed"
                    value={lockedAttributions.toString()}
                    change="Locked attributions"
                    trend="up"
                    icon={<DollarSign className="h-5 w-5" />}
                    variant="primary"
                    showMenu={false}
                />
            </div>

            {/* Companies Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Companies List</h3>
                    <DataTable
                        columns={companyColumns}
                        data={filteredCompanies}
                        searchable={true}
                        searchKeys={['name', 'domain']}
                        emptyMessage="No companies found"
                    />
                </div>
            </div>
        </div>
    );
}
