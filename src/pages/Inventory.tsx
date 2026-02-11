import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, AlertTriangle, Package, Filter, 
  MoreHorizontal, ArrowUpDown, Box, ShoppingCart, Truck, History
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from "@/components/ui/progress";
import { InventoryFormDialog } from '@/components/inventory/InventoryFormDialog';
import { InventoryDetailsDialog } from '@/components/inventory/InventoryDetailsDialog';
import { inventoryService, type InventoryItem } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

type InventoryStatus = 'disponible' | 'bajo_stock' | 'agotado';
type InventoryItemDisplay = InventoryItem & { status?: InventoryStatus; supplier: string };

// Configuración de traducción de categorías de inventario
const categoryLabels: Record<string, string> = {
  MEDICATION: 'Medicamento',
  SUPPLY: 'Insumo',
  EQUIPMENT: 'Equipo',
  FOOD: 'Alimento',
  OTHER: 'Otro',
  // También soportar las versiones en español por si acaso
  medicamento: 'Medicamento',
  material: 'Insumo',
  alimento: 'Alimento',
  equipo: 'Equipo',
  otro: 'Otro',
};

const getCategoryLabel = (category: string | undefined): string => {
  if (!category) return 'Sin categoría';
  return categoryLabels[category] || category;
};

export default function Inventory() {
  const [items, setItems] = useState<InventoryItemDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItemDisplay | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadItems();
  }, []);

  // Recargar cuando cambie el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadItems();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const page = await inventoryService.getAll(0, 100, searchTerm);
      const itemsWithStatus = page.content.map(item => ({
        ...item,
        status: (item.quantity === 0 ? 'agotado' : item.quantity <= item.minQuantity ? 'bajo_stock' : 'disponible') as InventoryStatus,
        supplier: item.supplier || 'Proveedor General',
      }));
      setItems(itemsWithStatus);
    } catch (error) {
      toast({ title: 'Error de sincronización', description: 'No se pudo actualizar el inventario.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Mapeo de valores del filtro a valores reales de categorías
  const categoryFilterMap: Record<string, string[]> = {
    'all': [],
    'medicamento': ['MEDICATION', 'medicamento'],
    'material': ['SUPPLY', 'material'],
    'alimento': ['FOOD', 'alimento'],
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || 
                            categoryFilterMap[categoryFilter]?.includes(item.category) ||
                            item.category === categoryFilter;
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, searchTerm, categoryFilter, statusFilter]);

  // --- ACTIONS ---
  const handleAddItem = async (data: any) => {
      try {
          // Validar campos requeridos
          if (!data.name || !data.category || !data.supplier) {
              toast({ 
                  title: 'Error de validación', 
                  description: 'Por favor completa todos los campos obligatorios',
                  variant: 'destructive' 
              });
              return;
          }

          const quantity = Number(data.quantity) || 0;
          const minStockLevel = Number(data.minStock || data.minQuantity || 0);
          const unitPrice = Number(data.unitPrice || data.price || 0);

          // Validar que el precio sea mayor a 0
          if (unitPrice <= 0) {
              toast({ 
                  title: 'Error de validación', 
                  description: 'El precio unitario debe ser mayor a 0',
                  variant: 'destructive' 
              });
              return;
          }

          // Transformar los datos del formulario al formato que espera el backend
          const payload: any = {
              name: data.name.trim(),
              category: data.category,
              quantity: quantity,
              minStockLevel: minStockLevel,
              unitPrice: unitPrice,
              supplier: data.supplier.trim(),
          };

          // Campos opcionales
          if (data.description && data.description.trim()) {
              payload.description = data.description.trim();
          }
          if (data.sku && data.sku.trim()) {
              payload.sku = data.sku.trim();
          }
          if (data.expirationDate) {
              payload.expirationDate = data.expirationDate;
          }
          if (data.location && data.location.trim()) {
              payload.location = data.location.trim();
          }

          console.log('Enviando payload:', payload);
          await inventoryService.create(payload); 
          toast({ title: 'Producto registrado', className: 'bg-emerald-50 border-emerald-200' });
          setIsFormOpen(false); 
          loadItems();
      } catch (error: any) { 
          console.error('Error al crear producto:', error);
          const errorMessage = error?.response?.data?.message || 
                              error?.response?.data?.error || 
                              error?.message || 
                              'Error desconocido al crear el producto';
          toast({ 
              title: 'Error al crear producto', 
              description: errorMessage,
              variant: 'destructive' 
          }); 
      }
  };

  const handleEditItem = async (data: any) => {
      if (!selectedItem) return;
      try {
          // Transformar los datos del formulario al formato que espera el backend
          const payload = {
              name: data.name,
              category: data.category,
              description: data.description || undefined,
              sku: data.sku || undefined,
              quantity: Number(data.quantity) || 0,
              minStockLevel: Number(data.minStock || data.minQuantity || 0),
              maxStockLevel: undefined, // Opcional
              unitPrice: Number(data.unitPrice || data.price || 0),
              supplier: data.supplier || undefined,
              expirationDate: data.expirationDate || undefined,
              location: data.location || undefined,
          };
          await inventoryService.update(selectedItem.id, payload); 
          toast({ title: 'Inventario actualizado' });
          setIsFormOpen(false); setSelectedItem(null); loadItems();
      } catch (error: any) { 
          console.error('Error al actualizar producto:', error);
          toast({ 
              title: 'Error al actualizar producto', 
              description: error?.response?.data?.message || error?.message || 'Error desconocido',
              variant: 'destructive' 
          }); 
      }
  };

  const handleDeleteItem = async (id: string) => {
      try {
          await inventoryService.delete(id); 
          toast({ title: 'Producto eliminado' });
          setIsDetailsOpen(false); setSelectedItem(null); loadItems();
      } catch (error) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  // --- UI HELPERS ---
  const lowStockCount = items.filter(i => i.status === 'bajo_stock' || i.status === 'agotado').length;

  const getStockLevelColor = (quantity: number, min: number) => {
      if (quantity === 0) return 'bg-rose-500';
      if (quantity <= min) return 'bg-orange-500';
      return 'bg-emerald-500';
  };

  const getStockPercentage = (quantity: number, min: number) => {
      const max = min * 3; // Asumimos que el "lleno" es 3 veces el mínimo para la visualización
      return Math.min(100, (quantity / max) * 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Inventario Central <Box className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Control de stock, proveedores y reabastecimiento.
          </p>
        </div>
        <Button onClick={() => { setSelectedItem(null); setIsFormOpen(true); }} className="shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
          <Plus className="mr-2 h-4 w-4" /> Registrar Producto
        </Button>
      </div>

      {/* --- ALERTS BANNER --- */}
      <AnimatePresence>
        {lowStockCount > 0 && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
            >
                <Card className="border-l-4 border-l-orange-500 bg-orange-50/50 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-full">
                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-orange-900">Atención Requerida</h3>
                                <p className="text-sm text-orange-800">
                                    Tienes <strong>{lowStockCount} productos</strong> con niveles críticos de inventario.
                                </p>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-white border-orange-200 text-orange-700 hover:bg-orange-100"
                            onClick={() => setStatusFilter('bajo_stock')}
                        >
                            Ver Productos
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- TOOLBAR --- */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-muted/40 p-2 rounded-xl border sticky top-4 z-20 backdrop-blur-md">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Buscar por nombre, SKU o proveedor..." 
                className="pl-10 bg-background border-none shadow-sm h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[160px] h-10 bg-background border-none shadow-sm">
                    <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="medicamento">Medicamentos</SelectItem>
                    <SelectItem value="material">Insumos</SelectItem>
                    <SelectItem value="alimento">Alimentos</SelectItem>
                </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[160px] h-10 bg-background border-none shadow-sm">
                    <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="disponible">🟢 Disponible</SelectItem>
                    <SelectItem value="bajo_stock">🟡 Bajo Stock</SelectItem>
                    <SelectItem value="agotado">🔴 Agotado</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
            <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px]">Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="w-[200px]">Nivel de Stock</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    // Skeleton Rows
                    [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><div className="h-10 w-32 bg-muted/50 rounded animate-pulse" /></TableCell>
                            <TableCell><div className="h-4 w-24 bg-muted/50 rounded animate-pulse" /></TableCell>
                            <TableCell><div className="h-4 w-32 bg-muted/50 rounded animate-pulse" /></TableCell>
                            <TableCell><div className="h-4 w-20 bg-muted/50 rounded animate-pulse" /></TableCell>
                            <TableCell><div className="h-4 w-16 bg-muted/50 rounded animate-pulse ml-auto" /></TableCell>
                            <TableCell />
                        </TableRow>
                    ))
                ) : filteredItems.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-64 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                <Package className="h-12 w-12 mb-3" />
                                <p>No se encontraron productos.</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    <AnimatePresence>
                        {filteredItems.map((item) => (
                            <motion.tr
                                key={item.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="group hover:bg-muted/40 transition-colors border-b last:border-0 cursor-pointer"
                                onClick={() => { setSelectedItem(item); setIsDetailsOpen(true); }}
                            >
                                {/* Col: Producto */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                                            {item.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-muted-foreground font-mono">SKU: {item.sku || 'N/A'}</p>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Col: Categoría */}
                                <TableCell>
                                    <Badge variant="secondary" className="capitalize font-normal text-muted-foreground bg-muted/50">
                                        {getCategoryLabel(item.category)}
                                    </Badge>
                                </TableCell>

                                {/* Col: Stock Visual */}
                                <TableCell>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-semibold">{item.quantity} {item.unit}</span>
                                            <span className="text-muted-foreground">Min: {item.minQuantity}</span>
                                        </div>
                                        <Progress 
                                            value={getStockPercentage(item.quantity, item.minQuantity)} 
                                            className="h-2" 
                                            indicatorColor={getStockLevelColor(item.quantity, item.minQuantity)} 
                                        />
                                    </div>
                                </TableCell>

                                {/* Col: Proveedor */}
                                <TableCell>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Truck className="w-3.5 h-3.5" />
                                        <span className="truncate max-w-[120px]" title={item.supplier}>{item.supplier}</span>
                                    </div>
                                </TableCell>

                                {/* Col: Precio */}
                                <TableCell className="text-right">
                                    <span className="font-mono font-medium">
                                        ${Number(item.unitPrice).toLocaleString()}
                                    </span>
                                </TableCell>

                                {/* Col: Menu */}
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => { setSelectedItem(item); setIsDetailsOpen(true); }}>
                                                Ver Detalles
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedItem(item); 
                                                setIsFormOpen(true);
                                            }}>
                                                Editar Stock
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                )}
            </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
        <p>{filteredItems.length} productos listados</p>
        <p>Valores actualizados en tiempo real</p>
      </div>

      {/* DIALOGS */}
      <InventoryFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={selectedItem ? handleEditItem : handleAddItem}
        initialData={selectedItem || undefined}
      />

      <InventoryDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        item={selectedItem}
        onEdit={(item) => { setSelectedItem(item); setIsFormOpen(true); setIsDetailsOpen(false); }}
        onDelete={handleDeleteItem}
      />
    </div>
  );
}