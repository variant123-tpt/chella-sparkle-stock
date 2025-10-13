import { useState, useEffect } from "react";
import { Archive, Search, AlertTriangle, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllProducts, updateStock, deleteProduct, Product } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function StockView() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newQuantity, setNewQuantity] = useState("");

  const loadProducts = () => {
    setProducts(getAllProducts());
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStock = () => {
    if (editingProduct && newQuantity) {
      updateStock(editingProduct.barcode, parseInt(newQuantity));
      toast({
        title: "Stock Updated",
        description: `${editingProduct.name} quantity updated to ${newQuantity}`,
      });
      setEditingProduct(null);
      setNewQuantity("");
      loadProducts();
    }
  };

  const handleDeleteProduct = (barcode: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteProduct(barcode);
      toast({
        title: "Product Deleted",
        description: `${name} has been removed from inventory`,
      });
      loadProducts();
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary font-['Playfair_Display'] mb-2">
          Stock View 📦
        </h1>
        <p className="text-muted-foreground">View and manage your inventory</p>
      </div>

      <Card>
        <CardHeader className="bg-gradient-festive text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Current Inventory ({products.length} products)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, barcode, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Products Table */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Archive className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Product Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                    <th className="px-4 py-3 text-left font-semibold">Barcode</th>
                    <th className="px-4 py-3 text-right font-semibold">Stock</th>
                    <th className="px-4 py-3 text-right font-semibold">Price</th>
                    <th className="px-4 py-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.barcode}
                      className={product.quantity < 5 ? "bg-destructive/10" : ""}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {product.quantity < 5 && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{product.category}</td>
                      <td className="px-4 py-3 font-mono text-sm">{product.barcode}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-semibold ${
                            product.quantity < 5 ? "text-destructive" : "text-foreground"
                          }`}
                        >
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        ₹{product.sellingPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingProduct(product);
                              setNewQuantity(product.quantity.toString());
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProduct(product.barcode, product.name)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Stock Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock Quantity</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label>Product</Label>
                <div className="mt-2 font-semibold">{editingProduct.name}</div>
              </div>
              <div>
                <Label>Current Quantity</Label>
                <div className="mt-2 text-muted-foreground">{editingProduct.quantity}</div>
              </div>
              <div>
                <Label htmlFor="newQuantity">New Quantity</Label>
                <Input
                  id="newQuantity"
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  className="mt-2"
                  autoFocus
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStock}>Update Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
