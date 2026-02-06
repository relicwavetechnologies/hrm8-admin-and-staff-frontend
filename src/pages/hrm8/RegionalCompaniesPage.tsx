import { useState, useEffect } from "react";
import { EnhancedStatCard } from '@/shared/components/dashboard/EnhancedStatCard';
import { DataTable, Column } from '@/shared/components/tables/DataTable';
import { Building2, CheckCircle2, DollarSign } from "lucide-react";
import { RegionalAnalyticsService } from '@/shared/lib/hrm8/regionalAnalyticsService';
import { useHrm8Auth } from "@/contexts/Hrm8AuthContext";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { useSearchParams } from "react-router-dom";

interface Company {
    id: string;
    name: string;
    domain: string;
    created_at: string;
    attribution_status: 'OPEN' | 'LOCKED' | 'EXPIRED';
    open_jobs_count: number;
    subscription: {
        plan: string;
        start_date: string;
        renewal_date: string;
    } | null;
}

export default function RegionalCompaniesPage() {
    const { hrm8User } = useHrm8Auth();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [allCompanies, setAllCompanies] = useState<Company[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);

    const regionId = (hrm8User as any)?.assignedRegionIds?.[0];

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
            }
        } catch (error) {
            toast.error("Failed to load regional companies");
        } finally {
            setIsLoading(false);
        }
    };

    const filterCompanies = () => {
        let result = [...allCompanies];
        const statusParam = searchParams.get('status');
        const sortParam = searchParams.get('sort');

        if (statusParam === 'active') {
            result = result.filter(c => c.open_jobs_count > 0);
        } else if (statusParam === 'inactive') {
            result = result.filter(c => c.open_jobs_count === 0);
        } else if (statusParam === 'new') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            result = result.filter(c => new Date(c.created_at) >= startOfMonth);
        }

        if (sortParam === 'newest') {
            result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        setFilteredCompanies(result);
    };

    const totalCompanies = allCompanies.length;
    const activeSubscriptions = allCompanies.filter(c => c.subscription !== null).length;
    const lockedAttributions = allCompanies.filter(c => c.attribution_status === 'LOCKED').length;

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
            key: "attribution_status",
            label: "Attribution",
            sortable: true,
            render: (company) => {
                const status = company.attribution_status;
                const variantMap = {
                    OPEN: 'secondary',
                    LOCKED: 'success',
                    EXPIRED: 'destructive'
                };
                return (
                    // @ts-ignore
                    <Badge variant={variantMap[status]}>
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
                // @ts-ignore
                return <Badge variant="success">{sub.plan}</Badge>;
            },
        },
        {
            key: "created_at",
            label: "Created Date",
            sortable: true,
            render: (company) => new Date(company.created_at).toLocaleDateString(),
        },
        {
            key: "open_jobs_count",
            label: "Open Jobs",
            sortable: true,
            render: (company) => (
                <Badge variant={company.open_jobs_count > 0 ? "secondary" : "outline"}>
                    {company.open_jobs_count} Jobs
                </Badge>
            ),
        },
    ];

    return (
        
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Region Companies</h1>
                    <p className="text-muted-foreground">Manage and track companies in your region</p>
                </div>

                {!regionId && !isLoading ? (
                    <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200">
                        No region assigned to this user.
                    </div>
                ) : (
                    <>
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

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Companies List</h3>
                                {isLoading ? (
                                    <div className="text-center py-8">Loading companies...</div>
                                ) : (
                                    <DataTable
                                        columns={companyColumns}
                                        data={filteredCompanies}
                                        searchable={true}
                                        searchKeys={['name', 'domain']}
                                        emptyMessage="No companies found"
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        
    );
}
