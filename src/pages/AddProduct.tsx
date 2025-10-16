import { useState, useRef } from "react";
import { Package, Barcode, Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    barcode: "",
    name: "",
    category: "",
    purchasePrice: "",
    sellingPrice: "",
    quantity: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && 
          file.type !== "application/vnd.ms-excel") {
        toast({
          title: "Invalid File Type",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/products/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Upload Successful! 🎉",
          description: result.message || `${result.count} products uploaded successfully`,
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-primary font-['Playfair_Display'] mb-2">
          Add Products to Inventory
        </h1>
        <p className="text-muted-foreground">
          Scan barcode or enter product details manually, or bulk upload via Excel
        </p>
      </div>

      {/* Bulk Upload Section */}
      <Card className="shadow-card border-2 border-primary/20 overflow-hidden">
        <CardHeader className="bg-gradient-festive text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Upload Products
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/30 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 hover:border-primary/50 transition-colors">
              <FileSpreadsheet className="h-12 w-12 text-primary mb-3 animate-sparkle" />
              <p className="text-sm font-medium text-foreground mb-2">
                Upload Excel file with product details
              </p>
              <p className="text-xs text-muted-foreground mb-4 text-center max-w-md">
                Supported format: .xlsx, .xls - Include columns: Barcode, Name, Category, Purchase Price, Selling Price, Quantity
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="bulk-upload-input"
              />
              
              <label 
                htmlFor="bulk-upload-input"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 cursor-pointer border border-primary/50 bg-background hover:bg-primary/10 hover:text-accent-foreground"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Choose Excel File
              </label>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-secondary/30 animate-slide-up">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleBulkUpload}
                  disabled={isUploading}
                  className="bg-gradient-festive hover:opacity-90 text-primary-foreground shadow-glow"
                >
                  {isUploading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Now
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
