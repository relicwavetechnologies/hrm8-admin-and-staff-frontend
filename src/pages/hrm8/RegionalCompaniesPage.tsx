import { useState, useEffect } from "react";
import { DashboardStatCard } from '@/shared/components/dashboard/DashboardStatCard';
import { DataTable, Column } from '@/shared/components/tables/DataTable';
import { Building2, CheckCircle2, DollarSign } from "lucide-react";
import { companyAdminService, type CompanyListItem } from '@/shared/services/hrm8/companyAdminService';
import { useHrm8Auth } from "@/contexts/Hrm8AuthContext";
import { useRegionStore } from "@/shared/stores/useRegionStore";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { useSearchParams, useNavigate } from "react-router-dom";

type Company = CompanyListItem;

export default function RegionalCompaniesPage() {
    const { hrm8User } = useHrm8Auth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [allCompanies, setAllCompanies] = useState<Company[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);

    const { selectedRegionId } = useRegionStore();
    const regionId = selectedRegionId || (hrm8User as any)?.assignedRegionIds?.[0];

    useEffect(() => {
        fetchCompanies();
    }, [regionId]);

    useEffect(() => {
        filterCompanies();
    }, [allCompanies, searchParams]);

    const fetchCompanies = async () => {
        try {
            setIsLoading(true);
            const response = await companyAdminService.getCompanies({ regionId });
            if (response.success && response.data?.companies) {
                setAllCompanies(response.data.companies);
            }
        } catch (error) {
            toast.error("Failed to load companies");
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
            result = result.filter(c => {
                const d = c.created_at ? new Date(c.created_at) : null;
                return d && !isNaN(d.getTime()) && d >= startOfMonth;
            });
        }

        if (sortParam === 'newest') {
            result.sort((a, b) => {
                const da = a.created_at ? new Date(a.created_at).getTime() : 0;
                const db = b.created_at ? new Date(b.created_at).getTime() : 0;
                return db - da;
            });
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
            render: (company) => (
                <button
                    className="font-medium text-primary hover:underline text-left"
                    onClick={() => navigate(`/hrm8/companies/${company.id}`)}
                >
                    {company.name}
                </button>
            ),
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
            render: (company) => {
                const d = company.created_at ? new Date(company.created_at) : null;
                return d && !isNaN(d.getTime()) ? d.toLocaleDateString() : '—';
            },
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

                {false ? (
                    <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200">
                        No region assigned to this user.
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <DashboardStatCard
                                title="Total Companies"
                                value={totalCompanies.toString()}
                                description={`${lockedAttributions} locked`}
                                trend="up"
                                icon={<Building2 className="h-5 w-5" />}
                                variant="neutral"
                            />

                            <DashboardStatCard
                                title="Active Subscriptions"
                                value={activeSubscriptions.toString()}
                                description={`${totalCompanies - activeSubscriptions} inactive`}
                                trend={activeSubscriptions > 0 ? "up" : undefined}
                                icon={<CheckCircle2 className="h-5 w-5" />}
                                variant="success"
                            />

                            <DashboardStatCard
                                title="Attributed"
                                value={lockedAttributions.toString()}
                                description="Locked attributions"
                                trend="up"
                                icon={<DollarSign className="h-5 w-5" />}
                                variant="primary"
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
