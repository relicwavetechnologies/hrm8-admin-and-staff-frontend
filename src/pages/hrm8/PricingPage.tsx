/**
 * Pricing Management Page
 * HRM8 Global Admin pricing products and price books
 */

import { useEffect, useState } from 'react';
import { hrm8PricingService, Product, PriceBook, PromoCode } from '@/shared/services/hrm8/pricingService';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { toast } from 'sonner';
import { Package, BookOpen, Globe, MapPin, Plus } from 'lucide-react';
import { TableSkeleton } from '@/shared/components/tables/TableSkeleton';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';

export default function PricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [priceBooks, setPriceBooks] = useState<PriceBook[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [regionFilter, setRegionFilter] = useState<string>('all');

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    code: '',
    category: '',
    description: '',
    is_active: true,
  });

  const [priceBookDialogOpen, setPriceBookDialogOpen] = useState(false);
  const [editingPriceBook, setEditingPriceBook] = useState<PriceBook | null>(null);
  const [priceBookForm, setPriceBookForm] = useState({
    name: '',
    description: '',
    is_global: true,
    region_id: '',
    currency: 'USD',
    is_active: true,
  });

  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [tierForm, setTierForm] = useState({
    price_book_id: '',
    product_id: '',
    name: '',
    min_quantity: 1,
    max_quantity: '',
    unit_price: 0,
    period: 'MONTHLY',
  });

  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [promoForm, setPromoForm] = useState({
    code: '',
    description: '',
    discount_type: 'PERCENT' as 'PERCENT' | 'FIXED',
    discount_value: 0,
    start_date: '',
    end_date: '',
    max_uses: '',
    is_active: true,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadPriceBooks();
  }, [regionFilter]);

  useEffect(() => {
    loadPromoCodes();
  }, []);

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

  const loadPromoCodes = async () => {
    try {
      setLoadingPromos(true);
      const res = await hrm8PricingService.getPromoCodes();
      if (res.success && res.data?.promoCodes) {
        setPromoCodes(res.data.promoCodes);
      }
    } catch {
      toast.error('Failed to load promo codes');
    } finally {
      setLoadingPromos(false);
    }
  };

  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        code: product.code,
        category: product.category,
        description: product.description || '',
        is_active: product.is_active,
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', code: '', category: '', description: '', is_active: true });
    }
    setProductDialogOpen(true);
  };

  const saveProduct = async () => {
    try {
      const payload = {
        ...productForm,
        id: editingProduct?.id,
        code: productForm.code.trim(),
      };
      await hrm8PricingService.upsertProduct(payload);
      toast.success('Product saved');
      setProductDialogOpen(false);
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const openPriceBookDialog = (priceBook?: PriceBook) => {
    if (priceBook) {
      setEditingPriceBook(priceBook);
      setPriceBookForm({
        name: priceBook.name,
        description: priceBook.description || '',
        is_global: priceBook.is_global,
        region_id: priceBook.region_id || '',
        currency: priceBook.currency,
        is_active: priceBook.is_active,
      });
    } else {
      setEditingPriceBook(null);
      setPriceBookForm({
        name: '',
        description: '',
        is_global: true,
        region_id: '',
        currency: 'USD',
        is_active: true,
      });
    }
    setPriceBookDialogOpen(true);
  };

  const savePriceBook = async () => {
    try {
      const payload = {
        ...priceBookForm,
        id: editingPriceBook?.id,
        region_id: priceBookForm.is_global ? null : priceBookForm.region_id || null,
      };
      await hrm8PricingService.upsertPriceBook(payload);
      toast.success('Price book saved');
      setPriceBookDialogOpen(false);
      loadPriceBooks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save price book');
    }
  };

  const openTierDialog = (priceBook: PriceBook, tierId?: string) => {
    setEditingTierId(tierId || null);
    setTierForm({
      price_book_id: priceBook.id,
      product_id: '',
      name: '',
      min_quantity: 1,
      max_quantity: '',
      unit_price: 0,
      period: 'MONTHLY',
    });
    setTierDialogOpen(true);
  };

  const saveTier = async () => {
    try {
      const payload = {
        id: editingTierId || undefined,
        price_book_id: tierForm.price_book_id,
        product_id: tierForm.product_id,
        name: tierForm.name,
        min_quantity: tierForm.min_quantity,
        max_quantity: tierForm.max_quantity ? Number(tierForm.max_quantity) : null,
        unit_price: Number(tierForm.unit_price),
        period: tierForm.period,
      };
      await hrm8PricingService.upsertPriceTier(payload);
      toast.success('Tier saved');
      setTierDialogOpen(false);
      loadPriceBooks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save tier');
    }
  };

  const openPromoDialog = (promo?: PromoCode) => {
    if (promo) {
      setEditingPromo(promo);
      setPromoForm({
        code: promo.code,
        description: promo.description || '',
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        start_date: promo.start_date?.slice(0, 10) || '',
        end_date: promo.end_date ? promo.end_date.slice(0, 10) : '',
        max_uses: promo.max_uses ? String(promo.max_uses) : '',
        is_active: promo.is_active,
      });
    } else {
      setEditingPromo(null);
      setPromoForm({
        code: '',
        description: '',
        discount_type: 'PERCENT',
        discount_value: 0,
        start_date: '',
        end_date: '',
        max_uses: '',
        is_active: true,
      });
    }
    setPromoDialogOpen(true);
  };

  const savePromo = async () => {
    try {
      const payload = {
        ...promoForm,
        code: promoForm.code.trim().toUpperCase(),
        discount_value: Number(promoForm.discount_value),
        start_date: promoForm.start_date,
        end_date: promoForm.end_date || null,
        max_uses: promoForm.max_uses ? Number(promoForm.max_uses) : null,
      };
      if (editingPromo) {
        await hrm8PricingService.updatePromoCode(editingPromo.id, payload);
      } else {
        await hrm8PricingService.createPromoCode(payload as any);
      }
      toast.success('Promo code saved');
      setPromoDialogOpen(false);
      loadPromoCodes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save promo code');
    }
  };

  const productColumns = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'is_active',
      label: 'Status',
      render: (p: Product) => (
        <Badge variant={p.is_active ? 'default' : 'secondary'}>
          {p.is_active ? 'Active' : 'Inactive'}
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
    {
      key: 'actions',
      label: 'Actions',
      render: (p: Product) => (
        <Button size="sm" variant="outline" onClick={() => openProductDialog(p)}>
          Edit
        </Button>
      ),
    },
  ];

  const priceBookColumns = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'is_global',
      label: 'Scope',
      render: (b: PriceBook) => (
        <div className="flex items-center gap-1.5 text-sm">
          {b.is_global ? <Globe className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
          <span>{b.is_global ? 'Global' : b.region?.name || 'Regional'}</span>
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
    {
      key: 'actions',
      label: 'Actions',
      render: (b: PriceBook) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openPriceBookDialog(b)}>
            Edit
          </Button>
          <Button size="sm" onClick={() => openTierDialog(b)}>
            Add Tier
          </Button>
        </div>
      ),
    },
  ];

  const promoColumns = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'discount_type', label: 'Type', sortable: true },
    { key: 'discount_value', label: 'Value', sortable: true },
    {
      key: 'is_active',
      label: 'Status',
      render: (p: PromoCode) => (
        <Badge variant={p.is_active ? 'default' : 'secondary'}>
          {p.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (p: PromoCode) => (
        <Button size="sm" variant="outline" onClick={() => openPromoDialog(p)}>
          Edit
        </Button>
      ),
    },
  ];
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
            <TabsTrigger value="promos">Promo Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pricing Products
                  <Button size="sm" onClick={() => openProductDialog()}>
                    <Plus className="h-4 w-4 mr-1" />
                    New Product
                  </Button>
                </CardTitle>
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
                <CardTitle className="flex items-center justify-between">
                  Price Books
                  <Button size="sm" onClick={() => openPriceBookDialog()}>
                    <Plus className="h-4 w-4 mr-1" />
                    New Price Book
                  </Button>
                </CardTitle>
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

          <TabsContent value="promos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Promo Codes
                  <Button size="sm" onClick={() => openPromoDialog()}>
                    <Plus className="h-4 w-4 mr-1" />
                    New Promo
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPromos ? (
                  <TableSkeleton columns={5} />
                ) : (
                  <DataTable
                    data={promoCodes}
                    columns={promoColumns}
                    searchable
                    searchKeys={['code', 'discount_type']}
                    emptyMessage="No promo codes found"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'New Product'}</DialogTitle>
            <DialogDescription>Define global product entries used in price books.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Code</Label>
              <Input value={productForm.code} onChange={(e) => setProductForm({ ...productForm, code: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Input value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={productForm.is_active ? 'active' : 'inactive'} onValueChange={(v) => setProductForm({ ...productForm, is_active: v === 'active' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveProduct}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Price Book Dialog */}
      <Dialog open={priceBookDialogOpen} onOpenChange={setPriceBookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPriceBook ? 'Edit Price Book' : 'New Price Book'}</DialogTitle>
            <DialogDescription>Manage global or regional price books.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={priceBookForm.name} onChange={(e) => setPriceBookForm({ ...priceBookForm, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={priceBookForm.description} onChange={(e) => setPriceBookForm({ ...priceBookForm, description: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Scope</Label>
              <Select value={priceBookForm.is_global ? 'global' : 'regional'} onValueChange={(v) => setPriceBookForm({ ...priceBookForm, is_global: v === 'global' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!priceBookForm.is_global && (
              <div className="space-y-1">
                <Label>Region ID</Label>
                <Input value={priceBookForm.region_id} onChange={(e) => setPriceBookForm({ ...priceBookForm, region_id: e.target.value })} />
              </div>
            )}
            <div className="space-y-1">
              <Label>Currency</Label>
              <Input value={priceBookForm.currency} onChange={(e) => setPriceBookForm({ ...priceBookForm, currency: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={priceBookForm.is_active ? 'active' : 'inactive'} onValueChange={(v) => setPriceBookForm({ ...priceBookForm, is_active: v === 'active' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriceBookDialogOpen(false)}>Cancel</Button>
            <Button onClick={savePriceBook}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tier Dialog */}
      <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Price Tier</DialogTitle>
            <DialogDescription>Attach a tier to the selected price book.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Product</Label>
              <Select value={tierForm.product_id} onValueChange={(v) => setTierForm({ ...tierForm, product_id: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Tier Name</Label>
              <Input value={tierForm.name} onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Min Quantity</Label>
                <Input type="number" value={tierForm.min_quantity} onChange={(e) => setTierForm({ ...tierForm, min_quantity: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label>Max Quantity</Label>
                <Input type="number" value={tierForm.max_quantity} onChange={(e) => setTierForm({ ...tierForm, max_quantity: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Unit Price</Label>
                <Input type="number" value={tierForm.unit_price} onChange={(e) => setTierForm({ ...tierForm, unit_price: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label>Period</Label>
                <Select value={tierForm.period} onValueChange={(v) => setTierForm({ ...tierForm, period: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">MONTHLY</SelectItem>
                    <SelectItem value="ANNUAL">ANNUAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTierDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveTier}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promo Dialog */}
      <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPromo ? 'Edit Promo Code' : 'New Promo Code'}</DialogTitle>
            <DialogDescription>Manage discount codes for subscription pricing.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Code</Label>
              <Input value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={promoForm.description} onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Discount Type</Label>
                <Select value={promoForm.discount_type} onValueChange={(v) => setPromoForm({ ...promoForm, discount_type: v as 'PERCENT' | 'FIXED' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">Percent</SelectItem>
                    <SelectItem value="FIXED">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Discount Value</Label>
                <Input type="number" value={promoForm.discount_value} onChange={(e) => setPromoForm({ ...promoForm, discount_value: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Start Date</Label>
                <Input type="date" value={promoForm.start_date} onChange={(e) => setPromoForm({ ...promoForm, start_date: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>End Date</Label>
                <Input type="date" value={promoForm.end_date} onChange={(e) => setPromoForm({ ...promoForm, end_date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Max Uses</Label>
                <Input type="number" value={promoForm.max_uses} onChange={(e) => setPromoForm({ ...promoForm, max_uses: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={promoForm.is_active ? 'active' : 'inactive'} onValueChange={(v) => setPromoForm({ ...promoForm, is_active: v === 'active' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoDialogOpen(false)}>Cancel</Button>
            <Button onClick={savePromo}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Hrm8PageLayout>
  );
}
