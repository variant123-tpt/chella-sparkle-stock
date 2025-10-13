import { useState } from "react";
import { Package, Barcode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addProduct } from "@/lib/storage";

const categories = [
  "Ground Crackers",
  "Sparklers",
  "Rockets",
  "Fancy Crackers",
  "Flower Pots",
  "Chakkar",
  "Bombs",
  "Gift Boxes",
];

export default function AddProduct() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    barcode: "",
    name: "",
    category: "",
    purchasePrice: "",
    sellingPrice: "",
    quantity: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.barcode || !formData.name || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    addProduct({
      barcode: formData.barcode,
      name: formData.name,
      category: formData.category,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      quantity: parseInt(formData.quantity) || 0,
    });

    toast({
      title: "Product Added! 🎉",
      description: `${formData.name} has been added to inventory`,
    });

    // Reset form
    setFormData({
      barcode: "",
      name: "",
      category: "",
      purchasePrice: "",
      sellingPrice: "",
      quantity: "",
    });
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-primary font-['Playfair_Display'] mb-2">
          Add Products to Inventory
        </h1>
        <p className="text-muted-foreground">
          Scan barcode or enter product details manually
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader className="bg-gradient-festive text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barcode" className="flex items-center gap-2">
                <Barcode className="h-4 w-4" />
                Barcode *
              </Label>
              <Input
                id="barcode"
                placeholder="Scan or enter barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                autoFocus
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="e.g., 100 Wala Garland"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price (₹)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity in Stock *</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-festive hover:opacity-90 text-primary-foreground shadow-glow">
              <Package className="mr-2 h-4 w-4" />
              Add to Stock
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
