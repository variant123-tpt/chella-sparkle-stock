import { useState, useRef } from "react";
import { ShoppingCart, Barcode, Trash2, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getProductByBarcode, generateBill, BillItem } from "@/lib/storage";

export default function Billing() {
  const { toast } = useToast();
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cart, setCart] = useState<BillItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barcodeInput.trim()) return;

    const product = getProductByBarcode(barcodeInput);
    
    if (!product) {
      toast({
        title: "Product Not Found",
        description: "No product with this barcode exists",
        variant: "destructive",
      });
      setBarcodeInput("");
      return;
    }

    if (product.quantity <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock`,
        variant: "destructive",
      });
      setBarcodeInput("");
      return;
    }

    // Check if product already in cart
    const existingIndex = cart.findIndex(item => item.barcode === barcodeInput);
    
    if (existingIndex >= 0) {
      const newCart = [...cart];
      if (newCart[existingIndex].quantity < product.quantity) {
        newCart[existingIndex].quantity += 1;
        setCart(newCart);
      } else {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.quantity} units available`,
          variant: "destructive",
        });
      }
    } else {
      setCart([...cart, {
        barcode: product.barcode,
        name: product.name,
        price: product.sellingPrice,
        quantity: 1,
      }]);
    }

    setBarcodeInput("");
    barcodeInputRef.current?.focus();
  };

  const updateQuantity = (barcode: string, quantity: number) => {
    const product = getProductByBarcode(barcode);
    if (product && quantity > product.quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.quantity} units available`,
        variant: "destructive",
      });
      return;
    }

    if (quantity <= 0) {
      setCart(cart.filter(item => item.barcode !== barcode));
    } else {
      setCart(cart.map(item => 
        item.barcode === barcode ? { ...item, quantity } : item
      ));
    }
  };

  const removeItem = (barcode: string) => {
    setCart(cart.filter(item => item.barcode !== barcode));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = 0; // Can be configured
  const total = subtotal + tax;

  const handleGenerateBill = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to the cart",
        variant: "destructive",
      });
      return;
    }

    const bill = generateBill({
      customerName: customerName || undefined,
      customerMobile: customerMobile || undefined,
      items: cart,
      subtotal,
      tax,
      total,
    });

    toast({
      title: "Bill Generated! 🎉",
      description: `Bill ID: ${bill.id}`,
    });

    // Clear cart and customer details
    setCart([]);
    setCustomerName("");
    setCustomerMobile("");
  };

  const handlePrintBill = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to the cart",
        variant: "destructive",
      });
      return;
    }

    // Generate bill first
    const bill = generateBill({
      customerName: customerName || undefined,
      customerMobile: customerMobile || undefined,
      items: cart,
      subtotal,
      tax,
      total,
    });

    // Create print content
    const printContent = `
      <html>
        <head>
          <title>Chella Crackers - Bill</title>
          <style>
            @media print {
              @page { 
                size: 80mm auto; 
                margin: 5mm;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              width: 80mm;
              margin: 0;
              padding: 10px;
              font-size: 12px;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 3px; text-align: left; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="center bold">
            <div style="font-size: 16px;">Chella Crackers</div>
            <div>Happy Diwali 🎆</div>
          </div>
          <div class="line"></div>
          <div>Bill ID: ${bill.id}</div>
          <div>Date: ${new Date(bill.date).toLocaleString()}</div>
          ${customerName ? `<div>Customer: ${customerName}</div>` : ''}
          ${customerMobile ? `<div>Mobile: ${customerMobile}</div>` : ''}
          <div class="line"></div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="right">Qty</th>
                <th class="right">Price</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td class="right">${item.quantity}</td>
                  <td class="right">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="line"></div>
          <div class="right">Subtotal: ₹${subtotal.toFixed(2)}</div>
          ${tax > 0 ? `<div class="right">Tax: ₹${tax.toFixed(2)}</div>` : ''}
          <div class="right bold">Total: ₹${total.toFixed(2)}</div>
          <div class="line"></div>
          <div class="center">
            <div>Thank you for shopping!</div>
            <div>Visit again! 🎇</div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }

    // Clear cart
    setCart([]);
    setCustomerName("");
    setCustomerMobile("");

    toast({
      title: "Bill Printed! 🎉",
      description: `Bill ID: ${bill.id}`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary font-['Playfair_Display'] mb-2">
          Billing - Chella Crackers 🎆
        </h1>
        <p className="text-muted-foreground">Scan products and generate bills</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Section - Barcode & Customer */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="bg-gradient-festive text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <Barcode className="h-5 w-5" />
                Scan Product
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleBarcodeSubmit}>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  ref={barcodeInputRef}
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan or enter barcode"
                  autoFocus
                  className="mt-2"
                />
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="customerName">Name (Optional)</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="customerMobile">Mobile (Optional)</Label>
                <Input
                  id="customerMobile"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  placeholder="Mobile number"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section - Cart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="bg-gradient-celebration text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Cart ({cart.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>Cart is empty. Scan products to add items.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.barcode} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.barcode, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.barcode, parseInt(e.target.value) || 0)}
                            className="w-16 text-center"
                            min="1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.barcode, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <div className="font-semibold w-24 text-right">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem(item.barcode)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-2 border-t pt-4">
                    <div className="flex justify-between text-lg">
                      <span>Subtotal:</span>
                      <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                    </div>
                    {tax > 0 && (
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>₹{tax.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-2xl font-bold text-primary">
                      <span>Total:</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleGenerateBill}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Generate Bill
                    </Button>
                    <Button
                      onClick={handlePrintBill}
                      className="bg-gradient-festive hover:opacity-90 text-primary-foreground shadow-glow"
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print Bill
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
