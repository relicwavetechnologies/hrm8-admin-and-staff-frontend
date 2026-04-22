/**
 * Pricing Management Page
 * HRM8 Global Admin pricing products and price books
 */

import { useEffect, useState } from 'react';
import { hrm8PricingService, Product, PriceBook, PromoCode, ProductCategory, type CountryPricingMap, type CreditPackage } from '@/shared/services/hrm8/pricingService';
import { useRegionStore } from '@/shared/stores/useRegionStore';
import { isFeatureEnabled } from '@/shared/lib/featureFlags';
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { toast } from 'sonner';
import { Package, BookOpen, Globe, MapPin, Plus, Trash2, AlertTriangle, Map, ToggleLeft, ToggleRight, Coins } from 'lucide-react';
import { TableSkeleton } from '@/shared/components/tables/TableSkeleton';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';

/** Controlled ISO 4217 codes for price books and country maps (avoids free-text typos). */
const ISO_4217_BILLING_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'AUD', 'INR',
] as const;

export default function PricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [priceBooks, setPriceBooks] = useState<PriceBook[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const { selectedRegionId } = useRegionStore();
  const effectiveRegionFilter = selectedRegionId === 'all' || !selectedRegionId ? 'all' : selectedRegionId;

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<{
    name: string;
    code: string;
    category: ProductCategory;
    description: string;
    is_active: boolean;
  }>({
    name: '',
    code: '',
    category: 'SUBSCRIPTION',
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
  const [selectedPriceBook, setSelectedPriceBook] = useState<PriceBook | null>(null);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [tierForm, setTierForm] = useState({
    price_book_id: '',
    product_id: '',
    name: '',
    min_quantity: 1,
    max_quantity: '' as string | undefined,
    unit_price: 0,
    period: 'MONTHLY',
    billing_basis: 'PER_UNIT' as 'PER_UNIT' | 'PEPM_BLOCK',
    block_size: '' as string | undefined,
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

  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { hrm8User } = useHrm8Auth();
  const isGlobalAdmin = (hrm8User as any)?.role === 'GLOBAL_ADMIN';
  const showCountryMap = isFeatureEnabled('FF_COUNTRY_MAP_UI');

  const [countryMapEntries, setCountryMapEntries] = useState<CountryPricingMap[]>([]);
  const [loadingCountryMap, setLoadingCountryMap] = useState(true);
  const [countryMapDialogOpen, setCountryMapDialogOpen] = useState(false);
  const [editingMapEntry, setEditingMapEntry] = useState<CountryPricingMap | null>(null);
  const [countryMapForm, setCountryMapForm] = useState({
    countryCode: '',
    countryName: '',
    pricingPeg: 'USD',
    billingCurrency: 'USD',
  });
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [loadingCreditPackages, setLoadingCreditPackages] = useState(true);
  const [creditCostMap, setCreditCostMap] = useState<Record<string, number>>({});
  const [savingCreditCostMap, setSavingCreditCostMap] = useState(false);
  const [creditPackageForm, setCreditPackageForm] = useState({
    code: '',
    name: '',
    description: '',
    creditsIncluded: 100,
    basePrice: 0,
    currency: 'USD',
  });

  useEffect(() => {
    loadProducts();
    if (showCountryMap) loadCountryMap();
    loadCreditPackages();
    loadCreditCostMap();
  }, []);

  useEffect(() => {
    loadPriceBooks();
    loadPromoCodes();
  }, [effectiveRegionFilter]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await hrm8PricingService.getProducts();
      if (!data.success && data.error) {
        toast.error(data.error || 'Failed to load products');
        return;
      }
      setProducts(data.data?.products ?? []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadPriceBooks = async () => {
    try {
      setLoadingBooks(true);
      const data = await hrm8PricingService.getPriceBooks(effectiveRegionFilter !== 'all' ? { regionId: effectiveRegionFilter } : undefined);
      if (!data.success && data.error) {
        toast.error(data.error || 'Failed to load price books');
        return;
      }
      setPriceBooks(data.data?.priceBooks ?? []);
    } catch (error) {
      toast.error('Failed to load price books');
    } finally {
      setLoadingBooks(false);
    }
  };

  const loadPromoCodes = async () => {
    try {
      setLoadingPromos(true);
      const data = await hrm8PricingService.getPromoCodes();
      if (!data.success && data.error) {
        toast.error(data.error || 'Failed to load promo codes');
        return;
      }
      setPromoCodes(data.data?.promoCodes ?? []);
    } catch (error) {
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
      setProductForm({ name: '', code: '', category: 'SUBSCRIPTION', description: '', is_active: true });
    }
    setProductDialogOpen(true);
  };

  const confirmDeleteProduct = (id: string) => {
    setDeleteProductId(id);
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;

    setIsDeleting(true);
    try {
      await hrm8PricingService.deleteProduct(deleteProductId);
      toast.success('Product deleted successfully');
      setDeleteProductId(null);
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
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
      const payload: any = {
        name: priceBookForm.name,
        description: priceBookForm.description,
        isGlobal: priceBookForm.is_global,
        regionId: priceBookForm.is_global ? null : priceBookForm.region_id || null,
        currency: priceBookForm.currency,
        isActive: priceBookForm.is_active,
      };

      if (editingPriceBook) {
        await hrm8PricingService.updatePriceBook(editingPriceBook.id, payload);
      } else {
        await hrm8PricingService.createPriceBook(payload);
      }

      toast.success('Price book saved');
      setPriceBookDialogOpen(false);
      loadPriceBooks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save price book');
    }
  };

  const openTierDialog = (priceBook: PriceBook, tierId?: string) => {
    setSelectedPriceBook(priceBook);
    if (tierId) {
      const tier = priceBook.tiers.find((t) => t.id === tierId);
      if (tier) {
        setEditingTierId(tierId);
        setTierForm({
          price_book_id: priceBook.id,
          product_id: tier.product?.id || '',
          name: tier.name,
          min_quantity: tier.min_quantity,
          max_quantity: tier.max_quantity ? String(tier.max_quantity) : undefined,
          unit_price: tier.unit_price,
          period: tier.period,
          billing_basis: ((tier as any).billing_basis || 'PER_UNIT') as 'PER_UNIT' | 'PEPM_BLOCK',
          block_size: (tier as any).block_size != null ? String((tier as any).block_size) : undefined,
        });
      }
    } else {
      setEditingTierId(null);
      setTierForm({
        price_book_id: priceBook.id,
        product_id: '',
        name: '',
        min_quantity: 1,
        max_quantity: undefined,
        unit_price: 0,
        period: 'MONTHLY',
        billing_basis: 'PER_UNIT',
        block_size: undefined,
      });
    }
    setTierDialogOpen(true);
  };

  const saveTier = async () => {
    try {
      if (!selectedPriceBook) return;

      const payload: any = {
        name: tierForm.name,
        minQuantity: tierForm.min_quantity,
        maxQuantity: tierForm.max_quantity ? Number(tierForm.max_quantity) : null,
        unitPrice: Number(tierForm.unit_price),
        period: tierForm.period,
        billingBasis: tierForm.billing_basis,
        blockSize: tierForm.block_size ? Number(tierForm.block_size) : null,
      };

      if (editingTierId) {
        await hrm8PricingService.updatePriceTier(editingTierId, payload);
      } else {
        payload.productId = tierForm.product_id;
        await hrm8PricingService.createPriceTier(selectedPriceBook.id, payload);
      }

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

  const loadCountryMap = async () => {
    try {
      setLoadingCountryMap(true);
      const data = await hrm8PricingService.getCountryPricingMap();
      if (data.success && data.data?.countryPricingMap) {
        setCountryMapEntries(data.data.countryPricingMap);
      }
    } catch {
      toast.error('Failed to load country pricing map');
    } finally {
      setLoadingCountryMap(false);
    }
  };

  const openCountryMapDialog = (entry?: CountryPricingMap) => {
    if (entry) {
      setEditingMapEntry(entry);
      setCountryMapForm({
        countryCode: entry.country_code,
        countryName: entry.country_name || '',
        pricingPeg: entry.pricing_peg,
        billingCurrency: entry.billing_currency,
      });
    } else {
      setEditingMapEntry(null);
      setCountryMapForm({ countryCode: '', countryName: '', pricingPeg: 'USD', billingCurrency: 'USD' });
    }
    setCountryMapDialogOpen(true);
  };

  const saveCountryMapEntry = async () => {
    try {
      if (editingMapEntry) {
        await hrm8PricingService.updateCountryPricingMap(editingMapEntry.id, countryMapForm);
      } else {
        await hrm8PricingService.createCountryPricingMap(countryMapForm);
      }
      toast.success('Country map entry saved');
      setCountryMapDialogOpen(false);
      loadCountryMap();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save entry');
    }
  };

  const toggleCountryMapEntry = async (id: string, currentlyActive: boolean) => {
    try {
      await hrm8PricingService.toggleCountryPricingMap(id, !currentlyActive);
      toast.success('Entry toggled');
      loadCountryMap();
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle entry');
    }
  };

  const loadCreditPackages = async () => {
    try {
      setLoadingCreditPackages(true);
      const data = await hrm8PricingService.getCreditPackages(true);
      if (!data.success && data.error) {
        toast.error(data.error || 'Failed to load credit packages');
        return;
      }
      setCreditPackages(data.data?.packages ?? []);
    } catch {
      toast.error('Failed to load credit packages');
    } finally {
      setLoadingCreditPackages(false);
    }
  };

  const loadCreditCostMap = async () => {
    try {
      const data = await hrm8PricingService.getCreditCostMap();
      if (!data.success && data.error) {
        toast.error(data.error || 'Failed to load credit cost map');
        return;
      }
      setCreditCostMap(data.data?.costMap || {});
    } catch {
      toast.error('Failed to load credit cost map');
    }
  };

  const saveCreditPackage = async () => {
    try {
      await hrm8PricingService.createCreditPackage(creditPackageForm);
      toast.success('Credit package created');
      setCreditPackageForm({
        code: '',
        name: '',
        description: '',
        creditsIncluded: 100,
        basePrice: 0,
        currency: 'USD',
      });
      await loadCreditPackages();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create credit package');
    }
  };

  const saveCreditCostMap = async () => {
    try {
      setSavingCreditCostMap(true);
      await hrm8PricingService.updateCreditCostMap(creditCostMap);
      toast.success('Credit cost map saved');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save credit cost map');
    } finally {
      setSavingCreditCostMap(false);
    }
  };

  const countryMapColumns = [
    { key: 'country_code', label: 'Code', sortable: true },
    { key: 'country_name', label: 'Country', sortable: true },
    { key: 'pricing_peg', label: 'Pricing Peg', sortable: true },
    { key: 'billing_currency', label: 'Billing Currency', sortable: true },
    {
      key: 'is_active',
      label: 'Status',
      render: (e: CountryPricingMap) => (
        <Badge variant={e.is_active ? 'default' : 'secondary'}>
          {e.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (e: CountryPricingMap) => (
        <div className="flex gap-2">
          {isGlobalAdmin && (
            <>
              <Button size="sm" variant="outline" onClick={() => openCountryMapDialog(e)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant={e.is_active ? 'secondary' : 'default'}
                onClick={() => toggleCountryMapEntry(e.id, e.is_active)}
              >
                {e.is_active ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
                {e.is_active ? 'Disable' : 'Enable'}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

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
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openProductDialog(p)}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => confirmDeleteProduct(p.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
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

  const creditPackageColumns = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'credits_included', label: 'Credits', sortable: true },
    { key: 'base_price', label: 'Price', sortable: true },
    { key: 'currency', label: 'Currency', sortable: true },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (p: CreditPackage) => (
        <Badge variant={p.is_active ? 'default' : 'outline'}>
          {p.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (p: CreditPackage) => (
        <Button size="sm" variant="outline" onClick={() => hrm8PricingService.deleteCreditPackage(p.id).then(() => {
          toast.success('Credit package deactivated');
          loadCreditPackages();
        }).catch((error: any) => toast.error(error?.message || 'Failed to deactivate package'))}>
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Deactivate
        </Button>
      ),
    },
  ];
  return (
    <Hrm8PageLayout
      title="Pricing Management"
      subtitle="View products and price books"
      actions={null}
    >
      <div className="p-6 space-y-6">
        <Card className="border-amber-200 bg-amber-50/70">
          <CardContent className="pt-6 text-sm text-slate-700">
            ATS subscriptions and fixed USD add-ons are sourced from the Appendix A USD prices and converted live into the company billing currency at runtime.
            Recruitment services remain manually seeded only for the currencies explicitly defined in the pricing model: USD, AUD, GBP, EUR, and INR.
          </CardContent>
        </Card>

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
            {showCountryMap && <TabsTrigger value="countryMap">Country Map</TabsTrigger>}
            <TabsTrigger value="creditPacks">Credit Packs</TabsTrigger>
            <TabsTrigger value="creditCostMap">Credit Cost Map</TabsTrigger>
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

          {showCountryMap && (
            <TabsContent value="countryMap">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Map className="h-5 w-5" />
                      Country Pricing Map
                    </span>
                    {isGlobalAdmin && (
                      <Button size="sm" onClick={() => openCountryMapDialog()}>
                        <Plus className="h-4 w-4 mr-1" />
                        New Entry
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isGlobalAdmin && (
                    <div className="mb-4 p-3 bg-muted rounded-md text-sm text-muted-foreground">
                      You have read-only access. Only global administrators can edit the country pricing map.
                    </div>
                  )}
                  {loadingCountryMap ? (
                    <TableSkeleton columns={6} />
                  ) : (
                    <DataTable
                      data={countryMapEntries}
                      columns={countryMapColumns}
                      searchable
                      searchKeys={['country_code', 'country_name', 'pricing_peg', 'billing_currency']}
                      emptyMessage="No country map entries found"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="creditPacks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Credit Packs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <Label>Code</Label>
                    <Input value={creditPackageForm.code} onChange={(e) => setCreditPackageForm({ ...creditPackageForm, code: e.target.value })} />
                  </div>
                  <div>
                    <Label>Name</Label>
                    <Input value={creditPackageForm.name} onChange={(e) => setCreditPackageForm({ ...creditPackageForm, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Input value={creditPackageForm.currency} onChange={(e) => setCreditPackageForm({ ...creditPackageForm, currency: e.target.value.toUpperCase() })} />
                  </div>
                  <div>
                    <Label>Credits Included</Label>
                    <Input type="number" value={creditPackageForm.creditsIncluded} onChange={(e) => setCreditPackageForm({ ...creditPackageForm, creditsIncluded: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Base Price</Label>
                    <Input type="number" value={creditPackageForm.basePrice} onChange={(e) => setCreditPackageForm({ ...creditPackageForm, basePrice: Number(e.target.value) })} />
                  </div>
                  <div className="md:col-span-3">
                    <Label>Description</Label>
                    <Textarea value={creditPackageForm.description} onChange={(e) => setCreditPackageForm({ ...creditPackageForm, description: e.target.value })} />
                  </div>
                </div>
                <Button onClick={saveCreditPackage}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Credit Package
                </Button>
                {loadingCreditPackages ? (
                  <TableSkeleton columns={6} />
                ) : (
                  <DataTable
                    data={creditPackages}
                    columns={creditPackageColumns as any}
                    searchable
                    searchKeys={['code', 'name', 'currency']}
                    emptyMessage="No credit packages found"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="creditCostMap">
            <Card>
              <CardHeader>
                <CardTitle>Credit Cost Map</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(creditCostMap).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <Label>{key}</Label>
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) =>
                          setCreditCostMap((prev) => ({ ...prev, [key]: Number(e.target.value) || 0 }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <Button onClick={saveCreditCostMap} disabled={savingCreditCostMap}>
                  {savingCreditCostMap ? 'Saving...' : 'Save Cost Map'}
                </Button>
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
              <Select value={productForm.category} onValueChange={(v) => setProductForm({ ...productForm, category: v as ProductCategory })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                  <SelectItem value="JOB_POSTING">Job Posting</SelectItem>
                  <SelectItem value="ASSESSMENT">Assessment</SelectItem>
                  <SelectItem value="ADDON_SERVICE">Add-on Service</SelectItem>
                  <SelectItem value="FEATURE_UNLOCK">Feature Unlock</SelectItem>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
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
              <Label>Currency (ISO 4217)</Label>
              <Select
                value={priceBookForm.currency}
                onValueChange={(v) => setPriceBookForm({ ...priceBookForm, currency: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {ISO_4217_BILLING_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Billing Basis</Label>
                <Select
                  value={tierForm.billing_basis}
                  onValueChange={(v) => setTierForm({ ...tierForm, billing_basis: v as 'PER_UNIT' | 'PEPM_BLOCK' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PER_UNIT">PER_UNIT</SelectItem>
                    <SelectItem value="PEPM_BLOCK">PEPM_BLOCK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Block Size (for PEPM_BLOCK)</Label>
                <Input
                  type="number"
                  value={tierForm.block_size}
                  onChange={(e) => setTierForm({ ...tierForm, block_size: e.target.value })}
                  disabled={tierForm.billing_basis !== 'PEPM_BLOCK'}
                />
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

      {/* Country Map Dialog */}
      <Dialog open={countryMapDialogOpen} onOpenChange={setCountryMapDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMapEntry ? 'Edit Country Map Entry' : 'New Country Map Entry'}</DialogTitle>
            <DialogDescription>Map a country to its pricing peg and billing currency.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Country Code (ISO 3166-1 alpha-2)</Label>
              <Input
                value={countryMapForm.countryCode}
                onChange={(e) => setCountryMapForm({ ...countryMapForm, countryCode: e.target.value.toUpperCase() })}
                maxLength={2}
                placeholder="AU"
                disabled={!!editingMapEntry}
              />
            </div>
            <div className="space-y-1">
              <Label>Country Name</Label>
              <Input
                value={countryMapForm.countryName}
                onChange={(e) => setCountryMapForm({ ...countryMapForm, countryName: e.target.value })}
                placeholder="Australia"
              />
            </div>
            <div className="space-y-1">
              <Label>Pricing Peg (currency)</Label>
              <Select
                value={countryMapForm.pricingPeg}
                onValueChange={(v) => setCountryMapForm({ ...countryMapForm, pricingPeg: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {ISO_4217_BILLING_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Billing Currency</Label>
              <Select
                value={countryMapForm.billingCurrency}
                onValueChange={(v) => setCountryMapForm({ ...countryMapForm, billingCurrency: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {ISO_4217_BILLING_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCountryMapDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveCountryMapEntry}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProductId} onOpenChange={(open) => !open && setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This action cannot be undone. This will permanently delete this product and remove it from:</p>
              <ul className="list-disc pl-5 text-sm">
                <li>All Price Books and Tiers</li>
                <li>All Active User Subscriptions/Accounts</li>
                <li>Future billing cycles</li>
              </ul>
              <p className="font-medium text-destructive">If any user has purchased this product, it will be removed from their account.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteProduct();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete Product'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Hrm8PageLayout>
  );
}
