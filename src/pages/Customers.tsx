import { useState, useEffect } from "react";
import { Users, Search, Printer, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllBills, Bill } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Customers() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    setBills(getAllBills().reverse()); // Show latest first
  }, []);

  const filteredBills = bills.filter(
    (bill) =>
      bill.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerMobile?.includes(searchTerm) ||
      bill.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReprintBill = (bill: Bill) => {
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
          ${bill.customerName ? `<div>Customer: ${bill.customerName}</div>` : ''}
          ${bill.customerMobile ? `<div>Mobile: ${bill.customerMobile}</div>` : ''}
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
              ${bill.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td class="right">${item.quantity}</td>
                  <td class="right">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="line"></div>
          <div class="right">Subtotal: ₹${bill.subtotal.toFixed(2)}</div>
          ${bill.tax > 0 ? `<div class="right">Tax: ₹${bill.tax.toFixed(2)}</div>` : ''}
          <div class="right bold">Total: ₹${bill.total.toFixed(2)}</div>
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
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary font-['Playfair_Display'] mb-2">
          Customer Purchases 👥
        </h1>
        <p className="text-muted-foreground">View all bills and customer purchase history</p>
      </div>

      <Card>
        <CardHeader className="bg-gradient-festive text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Bills ({bills.length} total)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, mobile, or bill ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Bills List */}
          {filteredBills.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>No bills found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBills.map((bill) => (
                <Card key={bill.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <div className="font-semibold text-lg">{bill.id}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(bill.date).toLocaleString()}
                        </div>
                        {bill.customerName && (
                          <div className="text-sm mt-1">
                            <span className="text-muted-foreground">Customer:</span>{" "}
                            <span className="font-medium">{bill.customerName}</span>
                          </div>
                        )}
                        {bill.customerMobile && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Mobile:</span>{" "}
                            <span className="font-medium">{bill.customerMobile}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Items: {bill.items.length}</div>
                        <div className="text-2xl font-bold text-primary mt-1">
                          ₹{bill.total.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedBill(bill)}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-festive hover:opacity-90 text-primary-foreground"
                          onClick={() => handleReprintBill(bill)}
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Reprint
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bill Details Dialog */}
      <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Bill ID</div>
                  <div className="font-semibold">{selectedBill.id}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="font-semibold">
                    {new Date(selectedBill.date).toLocaleString()}
                  </div>
                </div>
                {selectedBill.customerName && (
                  <div>
                    <div className="text-sm text-muted-foreground">Customer Name</div>
                    <div className="font-semibold">{selectedBill.customerName}</div>
                  </div>
                )}
                {selectedBill.customerMobile && (
                  <div>
                    <div className="text-sm text-muted-foreground">Mobile</div>
                    <div className="font-semibold">{selectedBill.customerMobile}</div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3">Items Purchased</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-4 py-2 text-right">Quantity</th>
                        <th className="px-4 py-2 text-right">Price</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedBill.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2 text-right">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">₹{item.price.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right font-semibold">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{selectedBill.subtotal.toFixed(2)}</span>
                </div>
                {selectedBill.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-semibold">₹{selectedBill.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-primary pt-2 border-t">
                  <span>Total:</span>
                  <span>₹{selectedBill.total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={() => handleReprintBill(selectedBill)}
                className="w-full bg-gradient-festive hover:opacity-90 text-primary-foreground"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Bill
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
