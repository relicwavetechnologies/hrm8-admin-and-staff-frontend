/**
 * Pricing Management Page
 * HRM8 Global Admin pricing products and price books
 */

import { useEffect, useState } from 'react';
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import { hrm8PricingService, Product, PriceBook } from '@/shared/services/hrm8/pricingService';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { toast } from 'sonner';
import { Package, BookOpen, Globe, MapPin } from 'lucide-react';
import { TableSkeleton } from '@/shared/components/tables/TableSkeleton';

const productColumns = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  {
    key: 'isActive',
    label: 'Status',
    render: (p: Product) => (
      <Badge variant={p.isActive ? 'default' : 'secondary'}>
        {p.isActive ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    key: 'tiers',
    label: 'Tiers',
    render: (p: Product) => (
      <span className="text-sm text-muted-foreground">
        {p.tiers?.length ? `${p.tiers.length} tier(s)` : '—'}
      </span>
    ),
  },
];

const priceBookColumns = [
  { key: 'name', label: 'Name', sortable: true },
  {
    key: 'isGlobal',
    label: 'Scope',
    render: (b: PriceBook) => (
      <div className="flex items-center gap-1.5 text-sm">
        {b.isGlobal ? <Globe className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
        <span>{b.isGlobal ? 'Global' : b.region?.name || 'Regional'}</span>
      </div>
    ),
  },
  { key: 'currency', label: 'Currency', sortable: true },
  {
    key: 'tiers',
    label: 'Tiers',
    render: (b: PriceBook) => (
      <span className="text-sm text-muted-foreground">
        {b.tiers?.length ? `${b.tiers.length} tier(s)` : '—'}
      </span>
    ),
  },
];

export default function PricingPage() {
  const { hrm8User } = useHrm8Auth();
  const [products, setProducts] = useState<Product[]>([]);
  const [priceBooks, setPriceBooks] = useState<PriceBook[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [regionFilter, setRegionFilter] = useState<string>('all');

  const isGlobalAdmin = hrm8User?.role === 'GLOBAL_ADMIN';

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadPriceBooks();
  }, [regionFilter]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await hrm8PricingService.getProducts();
      if (res.success && res.data?.products) {
        setProducts(res.data.products);
      }
    } catch {
      toast.error('Failed to load pricing products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadPriceBooks = async () => {
    try {
      setLoadingBooks(true);
      const params = regionFilter !== 'all' ? { regionId: regionFilter } : undefined;
      const res = await hrm8PricingService.getPriceBooks(params);
      if (res.success && res.data?.priceBooks) {
        setPriceBooks(res.data.priceBooks);
      }
    } catch {
      toast.error('Failed to load price books');
    } finally {
      setLoadingBooks(false);
    }
  };

  return (
    <Hrm8PageLayout
      title="Pricing Management"
      subtitle="View products and price books"
      actions={
        <div className="flex items-center gap-2">
          <Label>Filter Price Books:</Label>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All (Global + Regional)</SelectItem>
              {/* Region-specific filter: if user is regional licensee, show only their regions */}
              {/* For now, keep simple; advanced filter can be added later */}
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                Price Books
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{priceBooks.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="books">Price Books</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Products</CardTitle>
              </CardHeader>
              <CardContent>
            {loadingProducts ? (
              <TableSkeleton columns={5} />
            ) : (
              <DataTable
                data={products}
                columns={productColumns}
                searchable
                searchKeys={['name', 'code', 'category']}
                emptyMessage="No products found"
              />
            )}
          </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="books">
            <Card>
              <CardHeader>
                <CardTitle>Price Books</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBooks ? (
                  <TableSkeleton columns={4} />
                ) : (
                  <DataTable
                    data={priceBooks}
                    columns={priceBookColumns}
                    searchable
                    searchKeys={['name', 'currency']}
                    emptyMessage="No price books found"
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

