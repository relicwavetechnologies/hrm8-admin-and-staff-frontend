export interface Company {
    id: string;
    name: string;
    domain?: string;
    industry?: string;
    website?: string;
    status: string;
    sales_agent_id?: string;
    region_id?: string;
    created_at: string;
    updated_at: string;
    subscription_status?: string;
    stripe_customer_id?: string;
    attribution_locked?: boolean;
    attribution_locked_at?: string;
}
